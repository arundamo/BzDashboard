export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
}

export interface VehicleInfo {
  id: string;
  smartcarId: string;
  make: string;
  model: string;
  year: number;
}

export interface VehicleSnapshot {
  batteryLevel: number | null;
  batteryRange: number | null;
  chargingStatus: string | null;
  isCharging: boolean;
  odometer: number | null;
  capturedAt: Date;
}

export interface SmartcarTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
}

export interface SmartcarVehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
}

export interface SmartcarBatteryLevel {
  percentRemaining: number;
  range: number;
}

export interface SmartcarChargeStatus {
  isPluggedIn: boolean;
  state: string;
}

export interface SmartcarOdometer {
  distance: number;
}

export interface DashboardData {
  vehicle: VehicleInfo;
  latestSnapshot: VehicleSnapshot | null;
  batteryHistory: Array<{ capturedAt: Date; batteryLevel: number | null }>;
  dailyDistance: Array<{ date: Date; distanceDriven: number }>;
  recentChargeSessions: Array<{
    id: string;
    startedAt: Date;
    endedAt: Date | null;
    startBattery: number | null;
    endBattery: number | null;
    energyAdded: number | null;
  }>;
}
