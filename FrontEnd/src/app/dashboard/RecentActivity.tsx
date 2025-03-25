// src/app/dashboard/RecentActivity.tsx
'use client';

interface ActivityItem {
  id: string;
  action: string;
  curriculum: string;
  user: string;
  time: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  // If no activities, show empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-lg">Recent Activity</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>No recent activity to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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