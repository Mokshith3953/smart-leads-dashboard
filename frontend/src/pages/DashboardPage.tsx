import { Link } from 'react-router-dom';
import { useLeadStats } from '../hooks/useLeads';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading } = useLeadStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 capitalize">
            {user?.role} dashboard
          </p>
        </div>
        <Link to="/leads">
          <Button>View All Leads</Button>
        </Link>
      </div>

      {user?.role === 'admin' ? (
        loading ? (
          <PageLoader />
        ) : stats ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Leads</p>
                <p className="mt-1 text-4xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">By Status</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="New" value={stats.byStatus['New'] ?? 0} color="text-blue-600 dark:text-blue-400" />
                <StatCard label="Contacted" value={stats.byStatus['Contacted'] ?? 0} color="text-yellow-600 dark:text-yellow-400" />
                <StatCard label="Qualified" value={stats.byStatus['Qualified'] ?? 0} color="text-green-600 dark:text-green-400" />
                <StatCard label="Lost" value={stats.byStatus['Lost'] ?? 0} color="text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">By Source</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label="Website" value={stats.bySource['Website'] ?? 0} color="text-purple-600 dark:text-purple-400" />
                <StatCard label="Instagram" value={stats.bySource['Instagram'] ?? 0} color="text-pink-600 dark:text-pink-400" />
                <StatCard label="Referral" value={stats.bySource['Referral'] ?? 0} color="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        ) : null
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Your Leads</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create, update, and track leads from your dashboard.</p>
          <Link to="/leads" className="mt-4 inline-block">
            <Button>Go to Leads</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
