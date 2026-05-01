import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exchangeCodeForTokens, getVehicleIds, getVehicleInfo } from "@/services/smartcar";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  const storedState = req.cookies.get("smartcar_state")?.value;
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/connect?error=invalid_state", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const vehicleIds = await getVehicleIds(tokens.access_token);

    for (const smartcarId of vehicleIds) {
      const info = await getVehicleInfo(tokens.access_token, smartcarId);

      const vehicle = await prisma.vehicle.upsert({
        where: { smartcarId },
        update: { make: info.make, model: info.model, year: info.year },
        create: {
          userId: session.id,
          smartcarId,
          make: info.make,
          model: info.model,
          year: info.year,
        },
      });

      await prisma.vehicleConnection.upsert({
        where: { vehicleId: vehicle.id },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expires_at,
          scope: "read_battery read_charge read_odometer read_vehicle_info",
        },
        create: {
          vehicleId: vehicle.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expires_at,
          scope: "read_battery read_charge read_odometer read_vehicle_info",
        },
      });
    }

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.delete("smartcar_state");
    return response;
  } catch (err) {
    console.error("Smartcar callback error:", err);
    return NextResponse.redirect(new URL("/connect?error=callback_failed", req.url));
  }
}
