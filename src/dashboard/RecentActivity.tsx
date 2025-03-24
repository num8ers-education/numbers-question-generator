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