import { useEffect, useState } from 'react';
import { Truck, Users, Route, AlertTriangle, TrendingUp, CheckCircle, Clock, Zap, TrendingDown } from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartBase = {
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
        x: { ticks: { color: '#64748b', maxTicksLimit: 10 }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
    },
    maintainAspectRatio: false,
};

function StatCard({ icon: Icon, label, value, sub, iconColor }) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4 hover:border-slate-600 transition-all">
            <div className={`w-11 h-11 ${iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-slate-400 text-xs truncate">{label}</p>
                <p className="text-white text-xl font-bold">{value}</p>
                {sub && <p className="text-slate-500 text-xs mt-0.5 truncate">{sub}</p>}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [profit, setProfit] = useState([]);

    useEffect(() => {
        api.get('/analytics/dashboard').then(r => setStats(r.data)).catch(() => { });
        api.get('/analytics/trips-trend').then(r => setTrend(r.data)).catch(() => { });
        api.get('/analytics/profit-trend').then(r => setProfit(r.data)).catch(() => { });
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
            tension: 0.4, fill: true,
            pointBackgroundColor: '#6366f1', pointRadius: 3,
        }],
    };

    // Profit chart — only show last 14 days with any data, or all 30
    const activeProfitDays = profit.filter(d => d.revenue > 0 || d.expenses > 0);
    const profitDisplay = activeProfitDays.length > 0 ? activeProfitDays : profit.slice(-10);
    const profitChartData = {
        labels: profitDisplay.map(d => d.date),
        datasets: [
            {
                label: 'Revenue (₹)',
                data: profitDisplay.map(d => d.revenue),
                backgroundColor: 'rgba(34,197,94,0.7)',
                borderRadius: 4,
            },
            {
                label: 'Expenses (₹)',
                data: profitDisplay.map(d => d.expenses),
                backgroundColor: 'rgba(239,68,68,0.6)',
                borderRadius: 4,
            },
            {
                label: 'Profit (₹)',
                data: profitDisplay.map(d => d.profit),
                backgroundColor: 'rgba(99,102,241,0.7)',
                borderRadius: 4,
            },
        ],
    };

    const totalProfit = profit.reduce((s, d) => s + d.profit, 0);
    const totalRevenue = profit.reduce((s, d) => s + d.revenue, 0);
    const totalExpenses = profit.reduce((s, d) => s + d.expenses, 0);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Real-time fleet overview</p>
            </div>

            {/* Row 1 stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard icon={Truck} label="Active Fleet" value={stats?.vehicles.total ?? '—'} sub={`${stats?.vehicles.available ?? 0} available`} iconColor="bg-indigo-600" />
                <StatCard icon={AlertTriangle} label="In Maintenance" value={stats?.vehicles.inShop ?? '—'} sub="Vehicles in shop" iconColor="bg-amber-500" />
                <StatCard icon={Route} label="Pending Trips" value={stats?.trips.pending ?? '—'} sub={`${stats?.trips.total ?? 0} total`} iconColor="bg-blue-600" />
                <StatCard icon={TrendingUp} label="Utilization" value={`${stats?.utilizationRate ?? 0}%`} sub="On trip ratio" iconColor="bg-emerald-600" />
            </div>

            {/* Row 2 stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard icon={Users} label="Total Drivers" value={stats?.drivers.total ?? '—'} sub={`${stats?.drivers.onDuty ?? 0} on duty`} iconColor="bg-purple-600" />
                <StatCard icon={CheckCircle} label="Completed Trips" value={stats?.trips.completed ?? '—'} sub="All time" iconColor="bg-green-600" />
                <StatCard icon={Zap} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub="From completed trips" iconColor="bg-orange-600" />
                <StatCard icon={totalProfit >= 0 ? TrendingUp : TrendingDown} label="Net Profit" value={`₹${totalProfit.toLocaleString()}`} sub="Revenue − Expenses" iconColor={totalProfit >= 0 ? 'bg-teal-600' : 'bg-rose-600'} />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Vehicle donut */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-white font-semibold text-sm mb-4">Vehicle Status</h3>
                    <div className="h-48 flex items-center justify-center">
                        <Doughnut data={vehicleDonutData} options={{
                            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11 } } } },
                            cutout: '68%', maintainAspectRatio: false,
                        }} />
                    </div>
                </div>

                {/* Trip trend */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-white font-semibold text-sm mb-4">Trips — Last 7 Days</h3>
                    <div className="h-48">
                        <Line data={tripTrendData} options={{ ...chartBase, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* Profit Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white font-semibold text-sm">Revenue vs Expenses vs Profit</h3>
                        <p className="text-slate-500 text-xs mt-0.5">Last 30 days · After cost-cutting analysis</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <span className="text-green-400">Revenue: ₹{totalRevenue.toLocaleString()}</span>
                        <span className="text-red-400">Expenses: ₹{totalExpenses.toLocaleString()}</span>
                        <span className={totalProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}>
                            Profit: {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="h-56">
                    {profitDisplay.some(d => d.revenue > 0 || d.expenses > 0) ? (
                        <Bar data={profitChartData} options={chartBase} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                            <TrendingUp size={32} className="opacity-20" />
                            <p>No financial data yet.</p>
                            <p className="text-xs">Add trips with revenue + fuel logs to see the profit chart.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-slate-400">Available — ready to dispatch</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span><span className="text-slate-400">On Trip — currently in transit</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-slate-400">In Shop — under maintenance</span></div>
            </div>
        </div>
    );
}
