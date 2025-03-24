import DashboardStatsCards from './DashboardStatsCards';
import RecentActivity from './RecentActivity';
import CurriculaGrid from '@/curricula/CurriculaGrid';

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your question generator dashboard</p>
      </div>
      
      <DashboardStatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Popular Curricula</h2>
              <a href="/curricula" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
           
              <CurriculaGrid />
  
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}