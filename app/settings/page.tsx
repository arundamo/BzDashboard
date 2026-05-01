import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DisconnectButton } from "@/components/DisconnectButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.id },
    include: { connection: { select: { updatedAt: true } } },
  });

  return (
    <>
      <Navbar userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <span className="text-gray-300">Email:</span> {session.email}
              </p>
              {session.name && (
                <p>
                  <span className="text-gray-300">Name:</span> {session.name}
                </p>
              )}
            </div>
          </div>

          {/* Connected Vehicles */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Connected Vehicles
            </h2>

            {vehicles.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">No vehicles connected.</p>
                <a
                  href="/api/smartcar/connect"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Connect Vehicle
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {v.year} {v.make} {v.model}
                      </p>
                      {v.connection && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last synced:{" "}
                          {new Date(v.connection.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <DisconnectButton vehicleId={v.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
