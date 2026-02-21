import { useEffect, useState } from 'react';
import { Route, CheckCircle, Clock, XCircle, TrendingUp, Shield, Truck, Bell } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
    plugins: { legend: { display: false } },
    scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#334155' } },
    },
    maintainAspectRatio: false,
};

function StatCard({ icon: Icon, label, value, sub, iconClass, valueClass = 'text-white' }) {
    return (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${iconClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-slate-400 text-xs mb-0.5">{label}</p>
                <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
                {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
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
        datasets: [{
            label: 'Trips', data: stats?.weeklyTrips?.map(d => d.trips) || [],
            backgroundColor: 'rgba(99,102,241,0.6)', borderRadius: 6,
        }],
    };
    const earningsData = {
        labels: weeklyLabels,
        datasets: [{
            label: 'Earnings (₹)', data: stats?.weeklyTrips?.map(d => d.earnings) || [],
            borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',
            tension: 0.4, fill: true, pointBackgroundColor: '#22c55e', pointRadius: 3,
        }],
    };

    const statusColor = stats?.driver?.status === 'On Duty' ? 'text-green-400 bg-green-400/10' : 'text-slate-400 bg-slate-800';

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Welcome back, {user?.name} 👋</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-current text-sm font-semibold ${statusColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {stats?.driver?.status || 'Off Duty'}
                </div>
            </div>

            {/* Active trip banner */}
            {stats?.activeTrip && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Truck size={20} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-indigo-300 font-semibold text-sm">🚛 Active Trip</p>
                        <p className="text-white text-sm">
                            {stats.activeTrip.origin} → {stats.activeTrip.destination} ·{' '}
                            <span className="text-slate-400">{stats.activeTrip.vehicleId?.name}</span>
                        </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold uppercase tracking-wider border border-indigo-500/30">
                        {stats.activeTrip.status}
                    </span>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard
                    icon={Route} label="Total Rides" value={stats?.trips?.total ?? '—'}
                    sub="All time" iconClass="bg-indigo-600"
                />
                <StatCard
                    icon={CheckCircle} label="Completed" value={stats?.trips?.completed ?? '—'}
                    sub="Finished trips" iconClass="bg-green-600"
                />
                <StatCard
                    icon={Clock} label="Active Now" value={stats?.trips?.active ?? '—'}
                    sub="In progress" iconClass="bg-blue-600"
                />
                <StatCard
                    icon={TrendingUp} label="My Earnings" value={`₹${(stats?.totalEarnings ?? 0).toLocaleString()}`}
                    sub="From completed trips" iconClass="bg-emerald-600" valueClass="text-green-400"
                />
            </div>

            {/* Performance row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-white">{stats?.driver?.tripCompletionRate ?? 0}%</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${stats?.driver?.tripCompletionRate ?? 0}%` }} />
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 flex items-center gap-3">
                    <Shield size={24} className="text-amber-400 flex-shrink-0" />
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Safety Score</p>
                        <p className={`text-3xl font-bold ${(stats?.driver?.safetyScore ?? 0) >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                            {stats?.driver?.safetyScore ?? '—'}
                        </p>
                        <p className="text-slate-500 text-xs">Out of 100</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                    <p className="text-white font-semibold text-sm mb-4">Trips — Last 7 Days</p>
                    <div className="h-44">
                        <Bar data={tripData} options={chartOpts} />
                    </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                    <p className="text-white font-semibold text-sm mb-1">Earnings — Last 7 Days</p>
                    <p className="text-green-400 font-bold text-xl mb-3">₹{(stats?.totalEarnings ?? 0).toLocaleString()}</p>
                    <div className="h-36">
                        <Line data={earningsData} options={chartOpts} />
                    </div>
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/60">
                    <Bell size={15} className="text-indigo-400" />
                    <h3 className="text-white font-semibold text-sm">Recent Notifications</h3>
                </div>
                <div className="divide-y divide-slate-700/40">
                    {notifications.length === 0 && (
                        <p className="text-slate-500 text-sm text-center py-8">No notifications yet</p>
                    )}
                    {notifications.map(n => (
                        <div key={n._id} className={`px-5 py-3.5 flex items-start gap-3 ${!n.read ? 'bg-slate-700/20' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium">{n.title}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                                <p className="text-slate-600 text-xs mt-1">{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
