import { useEffect, useState } from 'react';
import { Truck, Users, Route, AlertTriangle, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
    },
};

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
    return (
        <div className={`${bg} border border-slate-700 rounded-xl p-5 flex items-center gap-4 hover:border-slate-600 transition-all duration-200`}>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
                {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);

    useEffect(() => {
        api.get('/analytics/dashboard').then(r => setStats(r.data)).catch(() => { });
        api.get('/analytics/trips-trend').then(r => setTrend(r.data)).catch(() => { });
    }, []);

    const vehicleDonutData = {
        labels: ['Available', 'On Trip', 'In Shop'],
        datasets: [{
            data: [stats?.vehicles.available ?? 0, stats?.vehicles.onTrip ?? 0, stats?.vehicles.inShop ?? 0],
            backgroundColor: ['#22c55e', '#6366f1', '#f59e0b'],
            borderWidth: 0,
        }],
    };

    const tripTrendData = {
        labels: trend.map(d => d.date),
        datasets: [{
            label: 'Trips',
            data: trend.map(d => d.count),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4,
        }],
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Real-time fleet overview</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Truck} label="Active Fleet" value={stats?.vehicles.total ?? '—'} sub={`${stats?.vehicles.available ?? 0} Available`} color="bg-indigo-600" bg="bg-slate-800" />
                <StatCard icon={AlertTriangle} label="In Maintenance" value={stats?.vehicles.inShop ?? '—'} sub="Vehicles in shop" color="bg-amber-500" bg="bg-slate-800" />
                <StatCard icon={Route} label="Pending Trips" value={stats?.trips.pending ?? '—'} sub={`${stats?.trips.total ?? 0} total trips`} color="bg-blue-600" bg="bg-slate-800" />
                <StatCard icon={TrendingUp} label="Utilization" value={`${stats?.utilizationRate ?? 0}%`} sub="Vehicles on trip" color="bg-emerald-600" bg="bg-slate-800" />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Drivers" value={stats?.drivers.total ?? '—'} sub={`${stats?.drivers.onDuty ?? 0} On Duty`} color="bg-purple-600" bg="bg-slate-800" />
                <StatCard icon={CheckCircle} label="Completed Trips" value={stats?.trips.completed ?? '—'} sub="All time" color="bg-green-600" bg="bg-slate-800" />
                <StatCard icon={Zap} label="Fuel Cost" value={`₹${(stats?.finances.totalFuelCost ?? 0).toLocaleString()}`} sub="Total fuel spend" color="bg-orange-600" bg="bg-slate-800" />
                <StatCard icon={Clock} label="Maintenance Cost" value={`₹${(stats?.finances.totalMaintenanceCost ?? 0).toLocaleString()}`} sub="Total service spend" color="bg-rose-600" bg="bg-slate-800" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vehicle status donut */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">Vehicle Status</h3>
                    <div className="h-52 flex items-center justify-center">
                        <Doughnut data={vehicleDonutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 11 } } } }, cutout: '70%' }} />
                    </div>
                </div>

                {/* Trip trend */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-white font-semibold mb-4">Trips — Last 7 Days</h3>
                    <div className="h-52">
                        <Line data={tripTrendData} options={{ ...chartDefaults, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* Status legend */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-slate-300">Available — ready to dispatch</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span><span className="text-slate-300">On Trip — currently active</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-slate-300">In Shop — under maintenance</span></div>
            </div>
        </div>
    );
}
