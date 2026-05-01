import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildAuthorizationUrl } from "@/services/smartcar";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = randomBytes(16).toString("hex");
  const url = buildAuthorizationUrl(state);

  // Store state in a short-lived cookie to verify in callback
  const response = NextResponse.redirect(url);
  response.cookies.set("smartcar_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
