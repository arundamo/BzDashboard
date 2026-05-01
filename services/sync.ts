/**
 * Sync service: fetches latest vehicle data from Smartcar and stores a snapshot.
 * Can be called from API routes or a cron job.
 */

import { prisma } from "@/lib/prisma";
import {
  getBatteryLevel,
  getChargeStatus,
  getOdometer,
  refreshAccessToken,
} from "./smartcar";

export async function syncVehicle(vehicleId: string): Promise<void> {
  const connection = await prisma.vehicleConnection.findUnique({
    where: { vehicleId },
  });

  if (!connection) {
    throw new Error(`No connection found for vehicle ${vehicleId}`);
  }

  let { accessToken, refreshToken, expiresAt } = connection;

  // Refresh token if expired (with 60s buffer)
  if (new Date(expiresAt) < new Date(Date.now() + 60_000)) {
    const newTokens = await refreshAccessToken(refreshToken);
    await prisma.vehicleConnection.update({
      where: { vehicleId },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresAt: newTokens.expires_at,
      },
    });
    accessToken = newTokens.access_token;
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error(`Vehicle ${vehicleId} not found`);

  const smartcarId = vehicle.smartcarId;

  // Fetch data in parallel
  const [battery, charge, odometer] = await Promise.allSettled([
    getBatteryLevel(accessToken, smartcarId),
    getChargeStatus(accessToken, smartcarId),
    getOdometer(accessToken, smartcarId),
  ]);

  const batteryData = battery.status === "fulfilled" ? battery.value : null;
  const chargeData = charge.status === "fulfilled" ? charge.value : null;
  const odometerData = odometer.status === "fulfilled" ? odometer.value : null;

  const lastSnapshot = await prisma.vehicleSnapshot.findFirst({
    where: { vehicleId },
    orderBy: { capturedAt: "desc" },
  });

  // Store snapshot
  await prisma.vehicleSnapshot.create({
    data: {
      vehicleId,
      batteryLevel: batteryData
        ? batteryData.percentRemaining * 100
        : null,
      batteryRange: batteryData?.range ?? null,
      chargingStatus: chargeData?.state ?? null,
      isCharging: chargeData?.isPluggedIn ?? false,
      odometer: odometerData?.distance ?? null,
    },
  });

  // Track charge session
  if (chargeData?.isPluggedIn) {
    const openSession = await prisma.chargeSession.findFirst({
      where: { vehicleId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });

    if (!openSession) {
      await prisma.chargeSession.create({
        data: {
          vehicleId,
          startedAt: new Date(),
          startBattery: batteryData ? batteryData.percentRemaining * 100 : null,
        },
      });
    }
  } else {
    // Close any open charge session
    const openSession = await prisma.chargeSession.findFirst({
      where: { vehicleId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });

    if (openSession) {
      await prisma.chargeSession.update({
        where: { id: openSession.id },
        data: {
          endedAt: new Date(),
          endBattery: batteryData ? batteryData.percentRemaining * 100 : null,
        },
      });
    }
  }

  // Update daily trip summary if odometer changed
  if (odometerData && lastSnapshot?.odometer) {
    const distance = odometerData.distance - lastSnapshot.odometer;
    if (distance > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyTripSummary.upsert({
        where: { vehicleId_date: { vehicleId, date: today } },
        update: { distanceDriven: { increment: distance } },
        create: { vehicleId, date: today, distanceDriven: distance },
      });
    }
  }
}

export async function syncAllVehicles(): Promise<void> {
  const connections = await prisma.vehicleConnection.findMany({
    select: { vehicleId: true },
  });

  await Promise.allSettled(
    connections.map((c) => syncVehicle(c.vehicleId))
  );
}
