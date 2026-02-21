import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Fuel, Wrench, BarChart3, ChevronRight } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function FinancialDashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [profitTrend, setProfitTrend] = useState([]);
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/analytics/dashboard').then(r => setStats(r.data)).catch(() => { }),
            api.get('/analytics/profit-trend').then(r => setProfitTrend(r.data)).catch(() => { }),
            api.get('/trips').then(r => setTrips(r.data)).catch(() => { }),
        ]);
    }, []);

    const totalRevenue = profitTrend.reduce((s, d) => s + d.revenue, 0);
    const totalExpenses = profitTrend.reduce((s, d) => s + d.expenses, 0);
    const totalProfit = profitTrend.reduce((s, d) => s + d.profit, 0);
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    const activeDays = profitTrend.filter(d => d.revenue > 0 || d.expenses > 0);
    const chartDays = activeDays.length > 0 ? activeDays : profitTrend.slice(-14);

    const profitChart = {
        labels: chartDays.map(d => d.date),
        datasets: [
            { label: 'Revenue ₹', data: chartDays.map(d => d.revenue), backgroundColor: 'rgba(34,197,94,0.75)', borderRadius: 4 },
            { label: 'Expenses ₹', data: chartDays.map(d => d.expenses), backgroundColor: 'rgba(239,68,68,0.55)', borderRadius: 4 },
            { label: 'Profit ₹', data: chartDays.map(d => d.profit), backgroundColor: 'rgba(99,102,241,0.75)', borderRadius: 4 },
        ]
    };

    const revenueLineChart = {
        labels: chartDays.map(d => d.date),
        datasets: [{
            label: 'Net Profit ₹', data: chartDays.map(d => d.profit),
            borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#6366f1',
        }]
    };

    const chartOpts = {
        plugins: { legend: { labels: { color: '#64748b', font: { size: 10 } } } },
        scales: { x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 }, grid: { color: '#f1f5f9' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' } } },
        maintainAspectRatio: false,
    };

    const completedTrips = trips.filter(t => t.status === 'Completed').slice(-10).reverse();

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 shadow-sm">
                <div className="w-12 h-12 bg-white border border-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <TrendingUp size={24} className="text-violet-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Financial Analyst Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Revenue, expenses & profitability analysis · {user?.name}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                    { icon: DollarSign, label: 'Total Revenue (30d)', value: `₹${totalRevenue.toLocaleString()}`, sub: `${completedTrips.length} trips`, color: 'bg-green-500' },
                    { icon: Wrench, label: 'Total Expenses (30d)', value: `₹${totalExpenses.toLocaleString()}`, sub: 'Fuel + Maint + Pay', color: 'bg-red-500' },
                    { icon: TrendingUp, label: 'Net Profit (30d)', value: `₹${totalProfit.toLocaleString()}`, sub: profitMargin + '% margin', color: totalProfit >= 0 ? 'bg-indigo-500' : 'bg-rose-500' },
                    { icon: BarChart3, label: 'Fuel Costs', value: `₹${(stats?.finances?.totalFuelCost || 0).toLocaleString()}`, sub: 'All time total', color: 'bg-amber-500' },
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-green-500" /> Revenue vs Expenses vs Profit</p>
                    <div className="h-52">
                        {chartDays.some(d => d.revenue > 0 || d.expenses > 0) ? (
                            <Bar data={profitChart} options={chartOpts} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No financial data yet</div>
                        )}
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-indigo-500" /> Profit Trend</p>
                    <div className="h-52">
                        {chartDays.some(d => d.profit !== 0) ? (
                            <Line data={revenueLineChart} options={chartOpts} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No trend data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { icon: Fuel, label: 'Total Fuel Cost', value: stats?.finances?.totalFuelCost || 0, bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
                    { icon: Wrench, label: 'Total Maintenance Cost', value: stats?.finances?.totalMaintenanceCost || 0, bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600' },
                    { icon: DollarSign, label: 'Total Driver Pay', value: stats?.finances?.totalDriverPay || 0, bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600' },
                ].map(({ icon: Icon, label, value, bg, text }) => (
                    <div key={label} className={`border ${bg} rounded-2xl p-5 flex items-center gap-4`}>
                        <Icon size={22} className={text} />
                        <div>
                            <p className="text-gray-500 text-xs">{label}</p>
                            <p className="text-gray-800 text-xl font-bold">₹{value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trip Revenue Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <DollarSign size={15} className="text-green-500" />
                    <h3 className="text-gray-700 font-semibold text-sm">Recent Completed Trips (Revenue)</h3>
                    <span className="ml-auto text-xs text-gray-400">Last 10</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {completedTrips.length === 0
                        ? <p className="text-gray-400 text-sm text-center py-8">No completed trips yet</p>
                        : completedTrips.map(t => (
                            <div key={t._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 text-xs font-medium">{t.origin} <ChevronRight size={11} className="inline" /> {t.destination}</p>
                                    <p className="text-gray-400 text-xs">{t.driverId?.name} · {t.vehicleId?.name}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-green-500 text-xs font-bold">₹{(t.revenue || 0).toLocaleString()}</p>
                                    <p className="text-indigo-400 text-xs">Pay: ₹{(t.driverPay || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
