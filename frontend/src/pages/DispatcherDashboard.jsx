import { useEffect, useState } from 'react';
import { Truck, Users, CheckCircle, Route, ChevronRight, Clock, Zap } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

const statusColors = {
    Draft: 'text-gray-500 bg-gray-100 border-gray-200',
    Dispatched: 'text-indigo-600 bg-indigo-50 border-indigo-200',
};

export default function DispatcherDashboard({ user }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/analytics/dispatcher-stats').then(r => setStats(r.data)).catch(() => { });
    }, []);

    const donut = {
        labels: ['Available', 'On Trip', 'In Shop'],
        datasets: [{
            data: [stats?.vehicles?.available ?? 0, stats?.vehicles?.onTrip ?? 0, stats?.vehicles?.inShop ?? 0],
            backgroundColor: ['#22c55e', '#6366f1', '#f59e0b'], borderWidth: 2, borderColor: '#fff',
        }],
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dispatch Center</h1>
                <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name} · Dispatcher</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                    { icon: Truck, label: 'Available Vehicles', value: stats?.vehicles?.available ?? '—', sub: `${stats?.vehicles?.total ?? 0} total`, color: 'bg-green-500' },
                    { icon: Route, label: 'In Transit', value: stats?.vehicles?.onTrip ?? '—', sub: 'On Trip', color: 'bg-indigo-500' },
                    { icon: Users, label: 'Drivers On Duty', value: stats?.drivers?.onDuty ?? '—', sub: `${stats?.drivers?.total ?? 0} total`, color: 'bg-purple-500' },
                    { icon: CheckCircle, label: 'Completed Today', value: stats?.trips?.completedToday ?? '—', sub: 'Trips today', color: 'bg-emerald-500' },
                ].map(({ icon: Icon, label, value, sub, color }) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">{label}</p>
                            <p className="text-gray-800 text-2xl font-bold">{value}</p>
                            <p className="text-gray-400 text-xs">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Queue + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Pending dispatch */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3">Queue</p>
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-amber-500">{stats?.trips?.draft ?? 0}</p>
                            <p className="text-gray-400 text-xs mt-1">Draft</p>
                        </div>
                        <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-indigo-500">{stats?.trips?.dispatched ?? 0}</p>
                            <p className="text-gray-400 text-xs mt-1">Dispatched</p>
                        </div>
                    </div>
                    <div className="h-36">
                        <Doughnut data={donut} options={{
                            cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 10 }, padding: 8 } } },
                            maintainAspectRatio: false,
                        }} />
                    </div>
                </div>

                {/* Active Trips */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Zap size={15} className="text-indigo-500" />
                            <p className="text-gray-700 font-semibold text-sm">Live Trips</p>
                        </div>
                        <a href="/trips" className="text-indigo-500 text-xs hover:text-indigo-600 flex items-center gap-1 font-medium">
                            Manage all <ChevronRight size={12} />
                        </a>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {(!stats?.activeTrips || stats.activeTrips.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                                    <Route size={22} className="opacity-40" />
                                </div>
                                <p className="text-sm">No active trips right now</p>
                            </div>
                        )}
                        {stats?.activeTrips?.map(t => (
                            <div key={t._id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[t.status] || ''}`}>{t.status}</span>
                                        <span className="text-gray-700 text-sm font-semibold">{t.vehicleId?.name ?? '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                        <span className="font-medium text-gray-600">{t.origin}</span>
                                        <ChevronRight size={11} />
                                        <span className="font-medium text-gray-600">{t.destination}</span>
                                        {t.driverId && <span className="text-gray-400">· {t.driverId.name}</span>}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1 text-gray-400 text-xs">
                                    <Clock size={11} />
                                    {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick action */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-gray-800 font-semibold">Ready to dispatch a trip?</p>
                    <p className="text-gray-500 text-sm mt-0.5">{stats?.vehicles?.available ?? 0} vehicles available · {(stats?.drivers?.total ?? 0) - (stats?.drivers?.onDuty ?? 0)} drivers off duty</p>
                </div>
                <a href="/trips" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-200">
                    <Route size={15} /> Go to Trips
                </a>
            </div>
        </div>
    );
}
