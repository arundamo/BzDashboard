import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncVehicle } from "@/services/sync";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const vehicleId = body.vehicleId as string | undefined;

    if (vehicleId) {
      // Verify ownership
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId: session.id },
      });
      if (!vehicle) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
      }
      await syncVehicle(vehicleId);
    } else {
      // Sync all vehicles for this user
      const vehicles = await prisma.vehicle.findMany({
        where: { userId: session.id },
        select: { id: true },
      });
      await Promise.allSettled(vehicles.map((v) => syncVehicle(v.id)));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// Cron-ready: can be called by an external cron with a secret header
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { syncAllVehicles } = await import("@/services/sync");
    await syncAllVehicles();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
