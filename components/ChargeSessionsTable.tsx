interface ChargeSession {
  id: string;
  startedAt: string | Date;
  endedAt: string | Date | null;
  startBattery: number | null;
  endBattery: number | null;
  energyAdded: number | null;
}

interface Props {
  sessions: ChargeSession[];
}

export function ChargeSessionsTable({ sessions }: Props) {
  if (!sessions.length) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-500 text-sm">
        No charge sessions yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Started</th>
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Ended</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">Start %</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">End %</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">Added</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="py-3 px-2 text-gray-300">
                {new Date(s.startedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-3 px-2 text-gray-300">
                {s.endedAt
                  ? new Date(s.endedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : <span className="text-green-400">In progress</span>}
              </td>
              <td className="py-3 px-2 text-right text-gray-300">
                {s.startBattery !== null ? `${Math.round(s.startBattery)}%` : "—"}
              </td>
              <td className="py-3 px-2 text-right text-gray-300">
                {s.endBattery !== null ? `${Math.round(s.endBattery)}%` : "—"}
              </td>
              <td className="py-3 px-2 text-right text-gray-300">
                {s.energyAdded !== null ? `${s.energyAdded} kWh` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
