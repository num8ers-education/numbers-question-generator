import { BookOpen, FileQuestion, Clock, Users } from 'lucide-react';

const StatCard = ({ 
  icon, 
  label, 
  value, 
  change,
  changeType
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}) => {
  const getChangeColor = () => {
    if (!changeType) return 'text-gray-500';
    return {
      increase: 'text-green-600',
      decrease: 'text-red-600',
      neutral: 'text-gray-500'
    }[changeType];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-xs ${getChangeColor()}`}>
              {change}
            </p>
          )}
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

// src/components/dashboard/RecentActivity.tsx
const activities = [
  { 
    id: '1', 
    action: 'Generated 45 questions', 
    curriculum: 'AP Calculus AB', 
    user: 'John Smith', 
    time: '2 hours ago' 
  },
  { 
    id: '2', 
    action: 'Added new curriculum', 
    curriculum: 'IB Computer Science HL', 
    user: 'Emma Johnson', 
    time: '5 hours ago' 
  },
  { 
    id: '3', 
    action: 'Updated question bank', 
    curriculum: 'A-Level Physics', 
    user: 'Michael Brown', 
    time: '1 day ago' 
  },
  { 
    id: '4', 
    action: 'Generated 32 questions', 
    curriculum: 'AP Biology', 
    user: 'Sarah Davis', 
    time: '1 day ago' 
  }
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-lg">Recent Activity</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.curriculum}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{activity.user}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;