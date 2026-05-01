import { prisma } from "./prisma";

export async function getBatteryHistory(vehicleId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.vehicleSnapshot.findMany({
    where: { vehicleId, capturedAt: { gte: since } },
    select: { capturedAt: true, batteryLevel: true },
    orderBy: { capturedAt: "asc" },
  });
}

export async function getDailyDistance(vehicleId: string, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.dailyTripSummary.findMany({
    where: { vehicleId, date: { gte: since } },
    select: { date: true, distanceDriven: true },
    orderBy: { date: "asc" },
  });
}

export async function getRecentChargeSessions(
  vehicleId: string,
  limit = 10
) {
  return prisma.chargeSession.findMany({
    where: { vehicleId },
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

export async function getLatestSnapshot(vehicleId: string) {
  return prisma.vehicleSnapshot.findFirst({
    where: { vehicleId },
    orderBy: { capturedAt: "desc" },
  });
}

export async function getDashboardData(vehicleId: string) {
  const [latestSnapshot, batteryHistory, dailyDistance, recentChargeSessions] =
    await Promise.all([
      getLatestSnapshot(vehicleId),
      getBatteryHistory(vehicleId),
      getDailyDistance(vehicleId),
      getRecentChargeSessions(vehicleId),
    ]);

  return { latestSnapshot, batteryHistory, dailyDistance, recentChargeSessions };
}
