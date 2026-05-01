"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  userName?: string | null;
}

export function Navbar({ userName }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/auth/signin");
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-white font-bold text-lg">
              🔋 Toyota bZ
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Settings
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-gray-400 text-sm hidden sm:block">
                {userName}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
