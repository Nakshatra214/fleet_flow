import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Car, Route, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_COLORS = {
    'Completed': 'text-green-600 bg-green-50 border-green-200',
    'Dispatched': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'Draft': 'text-gray-500 bg-gray-100 border-gray-200',
    'Cancelled': 'text-red-500 bg-red-50 border-red-200',
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
        const diff = (new Date(d.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
    });
    const inShopVehicles = vehicles.filter(v => v.status === 'In Shop');
    const avgSafetyScore = drivers.length > 0
        ? Math.round(drivers.reduce((s, d) => s + (d.safetyScore || 0), 0) / drivers.length) : 0;

    const sortedDrivers = [...drivers].sort((a, b) => a.safetyScore - b.safetyScore);
    const safetyChart = {
        labels: sortedDrivers.map(d => d.name),
        datasets: [{
            label: 'Safety Score',
            data: sortedDrivers.map(d => d.safetyScore || 0),
            backgroundColor: sortedDrivers.map(d => d.safetyScore >= 80 ? 'rgba(34,197,94,0.75)' : d.safetyScore >= 60 ? 'rgba(245,158,11,0.75)' : 'rgba(239,68,68,0.75)'),
            borderRadius: 5,
        }]
    };

    const recentTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    const statCards = [
        { icon: ShieldCheck, label: 'Avg Safety Score', value: avgSafetyScore + '/100', sub: `${drivers.length} drivers`, color: 'bg-green-500' },
        { icon: AlertTriangle, label: 'Expired Licenses', value: expiredLicenses.length, sub: 'Needs renewal', color: 'bg-red-500' },
        { icon: AlertTriangle, label: 'Expiring in 30d', value: expiringSoon.length, sub: 'Renew soon', color: 'bg-amber-500' },
        { icon: Car, label: 'Vehicles In Shop', value: inShopVehicles.length, sub: 'Under maintenance', color: 'bg-indigo-500' },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 shadow-sm">
                <div className="w-12 h-12 bg-white border border-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ShieldCheck size={24} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Safety Officer Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Fleet safety, compliance & incident overview · {user?.name}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {statCards.map(({ icon: Icon, label, value, sub, color }) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow`}>
                            <Icon size={19} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-gray-500 text-xs">{label}</p>
                            <p className="text-gray-800 text-xl font-bold">{value}</p>
                            <p className="text-gray-400 text-xs">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Safety Score Chart + License Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-green-500" /> Driver Safety Scores</p>
                    <div className="h-52">
                        {drivers.length > 0 ? (
                            <Bar data={safetyChart} options={{
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { color: '#f1f5f9' } },
                                    y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' } }
                                },
                                maintainAspectRatio: false
                            }} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No driver data</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-500" /> License Alerts</p>
                    <div className="space-y-2 overflow-y-auto max-h-52">
                        {[...expiredLicenses.map(d => ({ ...d, urgency: 'red' })),
                        ...expiringSoon.map(d => ({ ...d, urgency: 'amber' }))].length === 0
                            ? <p className="text-gray-400 text-sm text-center py-4">✅ All licenses valid</p>
                            : [...expiredLicenses.map(d => ({ ...d, urgency: 'red' })),
                            ...expiringSoon.map(d => ({ ...d, urgency: 'amber' }))]
                                .map(d => (
                                    <div key={d._id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${d.urgency === 'red' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                        <AlertTriangle size={12} className={d.urgency === 'red' ? 'text-red-500' : 'text-amber-500'} />
                                        <div>
                                            <p className="text-gray-700 font-medium">{d.name}</p>
                                            <p className={d.urgency === 'red' ? 'text-red-500' : 'text-amber-500'}>
                                                {d.urgency === 'red' ? 'License EXPIRED' : `Expires ${new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>
            </div>

            {/* Recent Trips (read-only) */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <Route size={15} className="text-indigo-500" />
                    <h3 className="text-gray-700 font-semibold text-sm">Recent Trips (Read-Only)</h3>
                    <span className="ml-auto text-xs text-gray-400">{trips.length} total</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {recentTrips.length === 0
                        ? <p className="text-gray-400 text-sm text-center py-8">No trips yet</p>
                        : recentTrips.map(t => (
                            <div key={t._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[t.status] || ''}`}>{t.status}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 text-xs font-medium truncate">{t.origin} → {t.destination}</p>
                                    <p className="text-gray-400 text-xs">{t.driverId?.name} · {t.vehicleId?.name}</p>
                                </div>
                                <p className="text-gray-300 text-xs flex-shrink-0">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            </div>
                        ))}
                </div>
            </div>

            {/* Vehicles in Shop */}
            {inShopVehicles.length > 0 && (
                <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2"><Car size={15} className="text-amber-500" /> Vehicles In Shop</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {inShopVehicles.map(v => (
                            <div key={v._id} className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs">
                                <p className="text-gray-700 font-medium">{v.name}</p>
                                <p className="text-amber-500">{v.licensePlate} · {v.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
