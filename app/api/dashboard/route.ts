import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");

  let vehicle;
  if (vehicleId) {
    vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: session.id },
    });
  } else {
    vehicle = await prisma.vehicle.findFirst({
      where: { userId: session.id },
    });
  }

  if (!vehicle) {
    return NextResponse.json({ error: "No vehicle found" }, { status: 404 });
  }

  const data = await getDashboardData(vehicle.id);

  return NextResponse.json({
    vehicle: {
      id: vehicle.id,
      smartcarId: vehicle.smartcarId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
    },
    ...data,
  });
}
