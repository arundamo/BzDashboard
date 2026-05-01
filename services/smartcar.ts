/**
 * Smartcar API service layer.
 * All token handling is done server-side only.
 */

import {
  SmartcarTokenResponse,
  SmartcarVehicleInfo,
  SmartcarBatteryLevel,
  SmartcarChargeStatus,
  SmartcarOdometer,
} from "@/types";

const SMARTCAR_API_URL = "https://api.smartcar.com/v2.0";
const SMARTCAR_AUTH_URL = "https://connect.smartcar.com/oauth/authorize";
const SMARTCAR_TOKEN_URL = "https://auth.smartcar.com/oauth/token";

function getClientCredentials() {
  const clientId = process.env.SMARTCAR_CLIENT_ID;
  const clientSecret = process.env.SMARTCAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Smartcar credentials are not configured");
  }
  return { clientId, clientSecret };
}

export function buildAuthorizationUrl(state: string): string {
  const { clientId } = getClientCredentials();
  const redirectUri = process.env.SMARTCAR_REDIRECT_URI ?? "";
  const scope = [
    "required:read_battery",
    "required:read_charge",
    "required:read_odometer",
    "required:read_vehicle_info",
    "required:read_location",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    mode: "simulated", // Use simulated mode for development
  });

  return `${SMARTCAR_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<SmartcarTokenResponse> {
  const { clientId, clientSecret } = getClientCredentials();
  const redirectUri = process.env.SMARTCAR_REDIRECT_URI ?? "";

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SMARTCAR_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<SmartcarTokenResponse> {
  const { clientId, clientSecret } = getClientCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SMARTCAR_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: new Date(Date.now() + data.expires_in * 1000),
  };
}

async function makeApiRequest<T>(
  accessToken: string,
  path: string
): Promise<T> {
  const response = await fetch(`${SMARTCAR_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Smartcar API error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
}

export async function getVehicleIds(accessToken: string): Promise<string[]> {
  const data = await makeApiRequest<{ vehicles: string[] }>(
    accessToken,
    "/vehicles"
  );
  return data.vehicles;
}

export async function getVehicleInfo(
  accessToken: string,
  vehicleId: string
): Promise<SmartcarVehicleInfo> {
  return makeApiRequest<SmartcarVehicleInfo>(
    accessToken,
    `/vehicles/${vehicleId}`
  );
}

export async function getBatteryLevel(
  accessToken: string,
  vehicleId: string
): Promise<SmartcarBatteryLevel> {
  const data = await makeApiRequest<{
    percentRemaining: number;
    range: number;
  }>(accessToken, `/vehicles/${vehicleId}/battery`);
  return {
    percentRemaining: data.percentRemaining,
    range: data.range,
  };
}

export async function getChargeStatus(
  accessToken: string,
  vehicleId: string
): Promise<SmartcarChargeStatus> {
  const data = await makeApiRequest<{
    isPluggedIn: boolean;
    state: string;
  }>(accessToken, `/vehicles/${vehicleId}/charge`);
  return {
    isPluggedIn: data.isPluggedIn,
    state: data.state,
  };
}

export async function getOdometer(
  accessToken: string,
  vehicleId: string
): Promise<SmartcarOdometer> {
  const data = await makeApiRequest<{ distance: number }>(
    accessToken,
    `/vehicles/${vehicleId}/odometer`
  );
  return { distance: data.distance };
}
