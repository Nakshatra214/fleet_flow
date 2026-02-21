import { useEffect, useState } from 'react';
import { CheckCircle, TrendingUp, Truck, Users, BarChart3, Eye } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function ManagerDashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [profitTrend, setProfitTrend] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/analytics/dashboard').then(r => setStats(r.data)).catch(() => { }),
            api.get('/analytics/profit-trend').then(r => setProfitTrend(r.data)).catch(() => { }),
        ]);
    }, []);

    const totalRevenue = profitTrend.reduce((s, d) => s + d.revenue, 0);
    const totalProfit = profitTrend.reduce((s, d) => s + d.profit, 0);
    const totalExpenses = profitTrend.reduce((s, d) => s + d.expenses, 0);

    const activeProfitDays = profitTrend.filter(d => d.revenue > 0 || d.expenses > 0);
    const profitDisplay = activeProfitDays.length > 0 ? activeProfitDays : profitTrend.slice(-10);

    const profitChart = {
        labels: profitDisplay.map(d => d.date),
        datasets: [
            { label: 'Revenue ₹', data: profitDisplay.map(d => d.revenue), backgroundColor: 'rgba(34,197,94,0.75)', borderRadius: 5 },
            { label: 'Expenses ₹', data: profitDisplay.map(d => d.expenses), backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 5 },
            { label: 'Profit ₹', data: profitDisplay.map(d => d.profit), backgroundColor: 'rgba(99,102,241,0.75)', borderRadius: 5 },
        ],
    };

    const vehicleDonut = {
        labels: ['Available', 'On Trip', 'In Shop'],
        datasets: [{ data: [stats?.vehicles?.available ?? 0, stats?.vehicles?.onTrip ?? 0, stats?.vehicles?.inShop ?? 0], backgroundColor: ['#22c55e', '#6366f1', '#f59e0b'], borderWidth: 2, borderColor: '#fff' }],
    };

    const chartOpts = {
        plugins: { legend: { labels: { color: '#64748b', font: { size: 10 } } } },
        scales: { x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { color: '#f1f5f9' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' } } },
        maintainAspectRatio: false,
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Full fleet overview · {user?.name}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                    { icon: Truck, label: 'Active Fleet', value: stats?.vehicles?.total ?? '—', sub: `${stats?.vehicles?.available ?? 0} available`, color: 'bg-indigo-600' },
                    { icon: Users, label: 'Active Drivers', value: stats?.drivers?.total ?? '—', sub: `${stats?.drivers?.onDuty ?? 0} on duty`, color: 'bg-purple-500' },
                    { icon: CheckCircle, label: 'Trips Completed', value: stats?.trips?.completed ?? '—', sub: 'All time', color: 'bg-green-500' },
                    { icon: TrendingUp, label: 'Net Profit (30d)', value: `₹${totalProfit.toLocaleString()}`, sub: `Rev ₹${totalRevenue.toLocaleString()}`, color: totalProfit >= 0 ? 'bg-teal-500' : 'bg-rose-500' },
                ].map(({ icon: Icon, label, value, sub, color }) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow`}>
                            <Icon size={19} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-gray-500 text-xs">{label}</p>
                            <p className="text-gray-800 text-xl font-bold truncate">{value}</p>
                            <p className="text-gray-400 text-xs">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Vehicle donut */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3">Vehicle Status</p>
                    <div className="h-48">
                        <Doughnut data={vehicleDonut} options={{ cutout: '66%', plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 10 }, padding: 10 } } }, maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Profit chart */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <p className="text-gray-700 font-semibold text-sm">Revenue vs Expenses vs Profit</p>
                        <div className="flex gap-3 text-xs">
                            <span className="text-green-500 font-medium">Rev: ₹{totalRevenue.toLocaleString()}</span>
                            <span className="text-red-400 font-medium">Exp: ₹{totalExpenses.toLocaleString()}</span>
                            <span className={`font-medium ${totalProfit >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>Profit: ₹{totalProfit.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="h-48">
                        {profitDisplay.some(d => d.revenue > 0 || d.expenses > 0) ? (
                            <Bar data={profitChart} options={chartOpts} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                <BarChart3 size={28} className="opacity-30 mr-3" /> No financial data yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Manage Vehicles', sub: `${stats?.vehicles?.total ?? 0} total`, href: '/vehicles', bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100', text: 'text-indigo-700' },
                    { label: 'Manage Drivers', sub: `${stats?.drivers?.total ?? 0} total`, href: '/drivers', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100', text: 'text-purple-700' },
                    { label: 'All Trips', sub: `${stats?.trips?.total ?? 0} total`, href: '/trips', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100', text: 'text-blue-700' },
                    { label: 'Full Analytics', sub: 'ROI & efficiency', href: '/analytics', bg: 'bg-green-50 hover:bg-green-100 border-green-100', text: 'text-green-700' },
                ].map(({ label, sub, href, bg, text }) => (
                    <a key={href} href={href} className={`${bg} border rounded-xl p-4 flex items-center justify-between transition-colors group`}>
                        <div>
                            <p className={`${text} font-semibold text-sm`}>{label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                        </div>
                        <Eye size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                    </a>
                ))}
            </div>
        </div>
    );
}
