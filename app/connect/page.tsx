import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const params = await searchParams;
  const error = params.error;

  return (
    <>
      <Navbar userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect Your Vehicle</h1>
          <p className="text-gray-400 mb-8">
            Link your Toyota bZ through Smartcar to start monitoring battery,
            charging, and driving data.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-400 text-sm">
              Connection failed: {decodeURIComponent(error)}. Please try again.
            </div>
          )}

          <a
            href="/api/smartcar/connect"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Connect via Smartcar
          </a>

          <p className="mt-6 text-xs text-gray-500">
            Your vehicle data is stored securely and never shared.
          </p>
        </div>
      </main>
    </>
  );
}
