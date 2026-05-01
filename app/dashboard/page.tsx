import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/analytics";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { BatteryHistoryChart } from "@/components/BatteryHistoryChart";
import { DailyDistanceChart } from "@/components/DailyDistanceChart";
import { ChargeSessionsTable } from "@/components/ChargeSessionsTable";
import { SyncButton } from "@/components/SyncButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const vehicle = await prisma.vehicle.findFirst({
    where: { userId: session.id },
  });

  if (!vehicle) {
    return (
      <>
        <Navbar userName={session.name} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-white mb-2">No vehicle connected</h2>
            <p className="text-gray-400 mb-6">
              Connect your Toyota bZ through Smartcar to start monitoring.
            </p>
            <a
              href="/api/smartcar/connect"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              Connect Vehicle
            </a>
          </div>
        </main>
      </>
    );
  }

  const { latestSnapshot, batteryHistory, dailyDistance, recentChargeSessions } =
    await getDashboardData(vehicle.id);

  const batteryPct = latestSnapshot?.batteryLevel
    ? Math.round(latestSnapshot.batteryLevel)
    : null;
  const range = latestSnapshot?.batteryRange
    ? Math.round(latestSnapshot.batteryRange)
    : null;
  const odometer = latestSnapshot?.odometer
    ? Math.round(latestSnapshot.odometer)
    : null;

  return (
    <>
      <Navbar userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            {latestSnapshot && (
              <p className="text-sm text-gray-400 mt-1">
                Last updated:{" "}
                {new Date(latestSnapshot.capturedAt).toLocaleString()}
              </p>
            )}
          </div>
          <SyncButton vehicleId={vehicle.id} />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Battery Level"
            value={batteryPct !== null ? batteryPct : "—"}
            unit={batteryPct !== null ? "%" : undefined}
            icon="🔋"
            color="blue"
          />
          <StatCard
            title="Charging"
            value={
              latestSnapshot?.isCharging
                ? latestSnapshot.chargingStatus ?? "Charging"
                : "Not charging"
            }
            icon="⚡"
            color={latestSnapshot?.isCharging ? "green" : "yellow"}
          />
          <StatCard
            title="Range"
            value={range !== null ? range : "—"}
            unit={range !== null ? "km" : undefined}
            icon="🗺️"
            color="purple"
          />
          <StatCard
            title="Odometer"
            value={odometer !== null ? odometer.toLocaleString() : "—"}
            unit={odometer !== null ? "km" : undefined}
            icon="📍"
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Battery History (7 days)
            </h3>
            <BatteryHistoryChart data={batteryHistory} />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Daily Distance (14 days)
            </h3>
            <DailyDistanceChart data={dailyDistance} />
          </div>
        </div>

        {/* Charge Sessions Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            Recent Charge Sessions
          </h3>
          <ChargeSessionsTable sessions={recentChargeSessions} />
        </div>
      </main>
    </>
  );
}
