import { BookOpen, FileQuestion, Clock, Users } from "lucide-react";

const StatCard = ({
  icon,
  label,
  value,
  change,
  changeType,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
}) => {
  const getChangeColor = () => {
    if (!changeType) return "text-gray-500";
    return {
      increase: "text-green-600",
      decrease: "text-red-600",
      neutral: "text-gray-500",
    }[changeType];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && <p className={`text-xs ${getChangeColor()}`}>{change}</p>}
        </div>
      </div>
    </div>
  );
};

const DashboardStatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={<BookOpen size={24} />}
        label="Total Curricula"
        value="24"
        change="+3 since last month"
        changeType="increase"
      />
      <StatCard
        icon={<FileQuestion size={24} />}
        label="Total Questions"
        value="4,856"
        change="+457 since last month"
        changeType="increase"
      />
      <StatCard
        icon={<Clock size={24} />}
        label="Avg. Generation Time"
        value="1.8s"
        change="-0.3s since last month"
        changeType="increase"
      />
      <StatCard
        icon={<Users size={24} />}
        label="Active Users"
        value="187"
        change="+24 since last month"
        changeType="increase"
      />
    </div>
  );
};

export default DashboardStatsCards;
