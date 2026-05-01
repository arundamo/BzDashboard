import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSession } from "@/types";

function getJwtSecret(): Uint8Array {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("APP_SECRET environment variable is required in production");
    }
    return new TextEncoder().encode("fallback-dev-secret-change-in-production");
  }
  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = "bz_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export async function createSession(user: UserSession): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getJwtSecret());
  return token;
}

export async function verifySession(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
  };
}
