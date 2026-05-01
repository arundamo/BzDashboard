"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  vehicleId: string;
}

export function SyncButton({ vehicleId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
    >
      <span className={loading ? "animate-spin" : ""}>🔄</span>
      {loading ? "Syncing..." : "Sync Now"}
    </button>
  );
}
