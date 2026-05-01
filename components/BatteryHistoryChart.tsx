"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  capturedAt: string | Date;
  batteryLevel: number | null;
}

interface Props {
  data: DataPoint[];
}

export function BatteryHistoryChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No battery history data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    time: new Date(d.capturedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    battery: d.batteryLevel !== null ? Math.round(d.batteryLevel) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#e5e7eb",
          }}
          formatter={(value: number) => [`${value}%`, "Battery"]}
        />
        <Line
          type="monotone"
          dataKey="battery"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
