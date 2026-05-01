import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vehicleId } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: session.id },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  await prisma.vehicle.delete({ where: { id: vehicleId } });

  return NextResponse.json({ ok: true });
}
