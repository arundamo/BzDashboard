"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string | Date;
  distanceDriven: number;
}

interface Props {
  data: DataPoint[];
}

export function DailyDistanceChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No trip data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    distance: Math.round(d.distanceDriven * 10) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(v) => `${v} km`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#e5e7eb",
          }}
          formatter={(value: number) => [`${value} km`, "Distance"]}
        />
        <Bar dataKey="distance" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
