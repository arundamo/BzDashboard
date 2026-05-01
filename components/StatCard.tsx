interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "purple";
  loading?: boolean;
}

const colorMap = {
  blue: "border-blue-500/30 bg-blue-500/5",
  green: "border-green-500/30 bg-green-500/5",
  yellow: "border-yellow-500/30 bg-yellow-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
};

export function StatCard({
  title,
  value,
  unit,
  icon,
  color = "blue",
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-24 bg-gray-800 rounded mb-4" />
        <div className="h-8 w-32 bg-gray-800 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-900 border ${colorMap[color]} rounded-2xl p-6 transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-400">{title}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
