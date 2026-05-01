"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  vehicleId: string;
}

export function DisconnectButton({ vehicleId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect this vehicle?")) return;
    setLoading(true);
    try {
      await fetch(`/api/vehicles/${vehicleId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? "Disconnecting..." : "Disconnect"}
    </button>
  );
}
