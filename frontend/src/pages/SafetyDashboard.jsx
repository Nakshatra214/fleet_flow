import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Car, Route, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_COLORS = {
    'Available': 'text-green-400 bg-green-400/10 border-green-400/20',
    'On Trip': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'In Shop': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'Completed': 'text-green-400 bg-green-400/10 border-green-400/20',
    'Dispatched': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'Draft': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    'Cancelled': 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function SafetyDashboard({ user }) {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/drivers').then(r => setDrivers(r.data)).catch(() => { }),
            api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => { }),
            api.get('/trips').then(r => setTrips(r.data)).catch(() => { }),
        ]);
    }, []);

    const expiredLicenses = drivers.filter(d => new Date(d.licenseExpiry) < new Date());
    const expiringSoon = drivers.filter(d => {
        const exp = new Date(d.licenseExpiry);
        const now = new Date();
        const diff = (exp - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
    });
    const inShopVehicles = vehicles.filter(v => v.status === 'In Shop');
    const avgSafetyScore = drivers.length > 0
        ? Math.round(drivers.reduce((s, d) => s + (d.safetyScore || 0), 0) / drivers.length)
        : 0;

    const safetyChart = {
        labels: [...drivers].sort((a, b) => a.safetyScore - b.safetyScore).map(d => d.name),
        datasets: [{
            label: 'Safety Score',
            data: [...drivers].sort((a, b) => a.safetyScore - b.safetyScore).map(d => d.safetyScore || 0),
            backgroundColor: (ctx) => {
                const v = ctx.dataset.data[ctx.dataIndex];
                return v >= 80 ? 'rgba(34,197,94,0.7)' : v >= 60 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)';
            },
            borderRadius: 5,
        }]
    };

    const recentTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    const statCards = [
        { icon: ShieldCheck, label: 'Avg Safety Score', value: avgSafetyScore + '/100', sub: `${drivers.length} active drivers`, color: 'bg-green-600' },
        { icon: AlertTriangle, label: 'Expired Licenses', value: expiredLicenses.length, sub: 'Needs immediate renewal', color: 'bg-red-600' },
        { icon: Clock, label: 'Expiring in 30d', value: expiringSoon.length, sub: 'Proactive renewal needed', color: 'bg-amber-600' },
        { icon: Car, label: 'Vehicles In Shop', value: inShopVehicles.length, sub: 'Under maintenance', color: 'bg-indigo-600' },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4 bg-slate-800/80 border border-green-500/20 rounded-2xl p-5">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={24} className="text-green-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Safety Officer Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Fleet safety, driver compliance & incident overview · {user?.name}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {statCards.map(({ icon: Icon, label, value, sub, color }) => (
                    <div key={label} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon size={19} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-400 text-xs">{label}</p>
                            <p className="text-white text-xl font-bold">{value}</p>
                            <p className="text-slate-500 text-xs">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Safety Score Chart + License Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Safety score chart */}
                <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                    <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-green-400" /> Driver Safety Scores</p>
                    <div className="h-52">
                        {drivers.length > 0 ? (
                            <Bar data={safetyChart} options={{
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: '#1e293b' } },
                                    y: { min: 0, max: 100, ticks: { color: '#64748b' }, grid: { color: '#334155' } }
                                },
                                maintainAspectRatio: false
                            }} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">No driver data</div>
                        )}
                    </div>
                </div>

                {/* License Alerts */}
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 overflow-hidden">
                    <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-400" /> License Alerts</p>
                    <div className="space-y-2 overflow-y-auto max-h-52">
                        {[...expiredLicenses.map(d => ({ ...d, alert: 'expired', urgency: 'red' })),
                        ...expiringSoon.map(d => ({ ...d, alert: 'expiring', urgency: 'amber' }))].length === 0
                            ? <p className="text-slate-500 text-sm text-center py-4">✅ All licenses valid</p>
                            : [...expiredLicenses.map(d => ({ ...d, alert: 'expired', urgency: 'red' })),
                            ...expiringSoon.map(d => ({ ...d, alert: 'expiring', urgency: 'amber' }))]
                                .map(d => (
                                    <div key={d._id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${d.urgency === 'red' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                        <AlertTriangle size={12} className={d.urgency === 'red' ? 'text-red-400' : 'text-amber-400'} />
                                        <div>
                                            <p className="text-white font-medium">{d.name}</p>
                                            <p className={d.urgency === 'red' ? 'text-red-400' : 'text-amber-400'}>
                                                {d.alert === 'expired' ? 'License EXPIRED' : `Expires ${new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                                            </p>
                                        </div>
                                    </div>
                                ))
                        }
                    </div>
                </div>
            </div>

            {/* Recent Trips (read-only) */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/60">
                    <Route size={15} className="text-indigo-400" />
                    <h3 className="text-white font-semibold text-sm">Recent Trips (Read-Only)</h3>
                    <span className="ml-auto text-xs text-slate-500">{trips.length} total</span>
                </div>
                <div className="divide-y divide-slate-700/40 max-h-72 overflow-y-auto">
                    {recentTrips.length === 0
                        ? <p className="text-slate-500 text-sm text-center py-8">No trips yet</p>
                        : recentTrips.map(t => (
                            <div key={t._id} className="flex items-center gap-3 px-5 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[t.status] || ''}`}>{t.status}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{t.origin} → {t.destination}</p>
                                    <p className="text-slate-500 text-xs">{t.driverId?.name} · {t.vehicleId?.name}</p>
                                </div>
                                <p className="text-slate-600 text-xs flex-shrink-0">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            </div>
                        ))}
                </div>
            </div>

            {/* Vehicles in Shop */}
            {inShopVehicles.length > 0 && (
                <div className="bg-slate-800/80 border border-amber-500/20 rounded-2xl p-5">
                    <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Car size={15} className="text-amber-400" /> Vehicles Currently In Shop</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {inShopVehicles.map(v => (
                            <div key={v._id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs">
                                <p className="text-white font-medium">{v.name}</p>
                                <p className="text-amber-400">{v.licensePlate} · {v.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
