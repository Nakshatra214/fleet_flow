import { useEffect, useState } from 'react';
import { Route, CheckCircle, Clock, TrendingUp, Shield, Truck, Bell } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
    plugins: { legend: { display: false } },
    scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#f1f5f9' } },
    },
    maintainAspectRatio: false,
};

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow`}>
                <Icon size={22} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                <p className="text-gray-800 text-2xl font-bold">{value}</p>
                {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function DriverDashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        api.get('/analytics/driver-stats').then(r => setStats(r.data)).catch(() => { });
        api.get('/notifications').then(r => setNotifications(r.data.slice(0, 5))).catch(() => { });
    }, []);

    const weeklyLabels = stats?.weeklyTrips?.map(d => d.date) || [];
    const tripData = {
        labels: weeklyLabels,
        datasets: [{ label: 'Trips', data: stats?.weeklyTrips?.map(d => d.trips) || [], backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 }],
    };
    const earningsData = {
        labels: weeklyLabels,
        datasets: [{
            label: 'Earnings (₹)', data: stats?.weeklyTrips?.map(d => d.earnings) || [],
            borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',
            tension: 0.4, fill: true, pointBackgroundColor: '#22c55e', pointRadius: 3,
        }],
    };

    const statusColor = stats?.driver?.status === 'On Duty' ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-100 border-gray-200';

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name} 👋</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {stats?.driver?.status || 'Off Duty'}
                </div>
            </div>

            {/* Active trip banner */}
            {stats?.activeTrip && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Truck size={20} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-indigo-600 font-semibold text-sm">🚛 Active Trip</p>
                        <p className="text-gray-700 text-sm">
                            {stats.activeTrip.origin} → {stats.activeTrip.destination} ·{' '}
                            <span className="text-gray-400">{stats.activeTrip.vehicleId?.name}</span>
                        </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-600 font-semibold uppercase tracking-wider border border-indigo-200">
                        {stats.activeTrip.status}
                    </span>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard icon={Route} label="Total Rides" value={stats?.trips?.total ?? '—'} sub="All time" color="bg-indigo-500" />
                <StatCard icon={CheckCircle} label="Completed" value={stats?.trips?.completed ?? '—'} sub="Finished trips" color="bg-green-500" />
                <StatCard icon={Clock} label="Active Now" value={stats?.trips?.active ?? '—'} sub="In progress" color="bg-blue-500" />
                <StatCard icon={TrendingUp} label="My Earnings" value={`₹${(stats?.totalEarnings ?? 0).toLocaleString()}`} sub="From completed trips" color="bg-emerald-500" />
            </div>

            {/* Performance row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.driver?.tripCompletionRate ?? 0}%</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${stats?.driver?.tripCompletionRate ?? 0}%` }} />
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Shield size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Safety Score</p>
                        <p className={`text-3xl font-bold ${(stats?.driver?.safetyScore ?? 0) >= 80 ? 'text-green-500' : 'text-amber-500'}`}>
                            {stats?.driver?.safetyScore ?? '—'}
                        </p>
                        <p className="text-gray-400 text-xs">Out of 100</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-4">Trips — Last 7 Days</p>
                    <div className="h-44">
                        <Bar data={tripData} options={chartOpts} />
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-1">Earnings — Last 7 Days</p>
                    <p className="text-green-500 font-bold text-xl mb-3">₹{(stats?.totalEarnings ?? 0).toLocaleString()}</p>
                    <div className="h-36">
                        <Line data={earningsData} options={chartOpts} />
                    </div>
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <Bell size={15} className="text-indigo-500" />
                    <h3 className="text-gray-700 font-semibold text-sm">Recent Notifications</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {notifications.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-8">No notifications yet</p>
                    )}
                    {notifications.map(n => (
                        <div key={n._id} className={`px-5 py-3.5 flex items-start gap-3 ${!n.read ? 'bg-indigo-50/50' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                            <div className="min-w-0">
                                <p className="text-gray-800 text-sm font-medium">{n.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                                <p className="text-gray-300 text-xs mt-1">{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
