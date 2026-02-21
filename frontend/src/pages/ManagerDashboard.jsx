import { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock, CheckCircle, TrendingUp, Truck, Users, BarChart3, Eye } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import api from '../api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ApprovalCard({ user: u, onApprove, onReject }) {
    const roleColors = { Manager: 'text-purple-400 bg-purple-400/10 border-purple-400/30', Dispatcher: 'text-blue-400 bg-blue-400/10 border-blue-400/30', Driver: 'text-green-400 bg-green-400/10 border-green-400/30' };
    return (
        <div className="bg-slate-700/40 border border-slate-600/60 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-700/60 transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {u.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{u.name}</p>
                <p className="text-slate-400 text-xs truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[u.role]}`}>{u.role}</span>
                    <span className="text-slate-600 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onApprove(u._id, u.name)}
                    className="flex items-center gap-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    <UserCheck size={13} /> Approve
                </button>
                <button onClick={() => onReject(u._id, u.name)}
                    className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                    <UserX size={13} /> Reject
                </button>
            </div>
        </div>
    );
}

export default function ManagerDashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [profitTrend, setProfitTrend] = useState([]);
    const [pending, setPending] = useState([]);
    const [loadingApproval, setLoadingApproval] = useState({});

    const load = async () => {
        await Promise.all([
            api.get('/analytics/dashboard').then(r => setStats(r.data)).catch(() => { }),
            api.get('/analytics/profit-trend').then(r => setProfitTrend(r.data)).catch(() => { }),
            api.get('/auth/pending-users').then(r => setPending(r.data)).catch(() => { }),
        ]);
    };
    useEffect(() => { load(); }, []);

    const approve = async (id, name) => {
        setLoadingApproval(p => ({ ...p, [id]: 'approving' }));
        try {
            await api.put(`/auth/approve/${id}`);
            toast.success(`✅ ${name} approved! They can now sign in.`);
            setPending(prev => prev.filter(u => u._id !== id));
        } catch { toast.error('Approval failed'); }
        setLoadingApproval(p => ({ ...p, [id]: null }));
    };

    const reject = async (id, name) => {
        setLoadingApproval(p => ({ ...p, [id]: 'rejecting' }));
        try {
            await api.put(`/auth/reject/${id}`);
            toast.success(`${name} rejected.`);
            setPending(prev => prev.filter(u => u._id !== id));
        } catch { toast.error('Rejection failed'); }
        setLoadingApproval(p => ({ ...p, [id]: null }));
    };

    const totalRevenue = profitTrend.reduce((s, d) => s + d.revenue, 0);
    const totalProfit = profitTrend.reduce((s, d) => s + d.profit, 0);
    const totalExpenses = profitTrend.reduce((s, d) => s + d.expenses, 0);

    const activeProfitDays = profitTrend.filter(d => d.revenue > 0 || d.expenses > 0);
    const profitDisplay = activeProfitDays.length > 0 ? activeProfitDays : profitTrend.slice(-10);
    const profitChart = {
        labels: profitDisplay.map(d => d.date),
        datasets: [
            { label: 'Revenue ₹', data: profitDisplay.map(d => d.revenue), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4 },
            { label: 'Expenses ₹', data: profitDisplay.map(d => d.expenses), backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 4 },
            { label: 'Profit ₹', data: profitDisplay.map(d => d.profit), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4 },
        ],
    };

    const vehicleDonut = {
        labels: ['Available', 'On Trip', 'In Shop'],
        datasets: [{ data: [stats?.vehicles?.available ?? 0, stats?.vehicles?.onTrip ?? 0, stats?.vehicles?.inShop ?? 0], backgroundColor: ['#22c55e', '#6366f1', '#f59e0b'], borderWidth: 0 }],
    };

    const chartOpts = {
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
        scales: { x: { ticks: { color: '#64748b', maxTicksLimit: 8 }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } } },
        maintainAspectRatio: false,
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Full fleet overview · {user?.name}</p>
                </div>
                {pending.length > 0 && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-400 text-sm font-semibold">
                        <Clock size={15} className="animate-pulse" />
                        {pending.length} pending approval{pending.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Pending Approvals Panel */}
            {pending.length > 0 && (
                <div className="bg-slate-800/80 border border-amber-500/20 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/60 bg-amber-500/5">
                        <Clock size={15} className="text-amber-400" />
                        <h3 className="text-white font-semibold text-sm">Pending Account Approvals</h3>
                        <span className="ml-auto text-xs bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {pending.map(u => (
                            <ApprovalCard key={u._id} user={u} onApprove={approve} onReject={reject} />
                        ))}
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                    { icon: Truck, label: 'Active Fleet', value: stats?.vehicles?.total ?? '—', sub: `${stats?.vehicles?.available ?? 0} available`, color: 'bg-indigo-600' },
                    { icon: Users, label: 'Active Drivers', value: stats?.drivers?.total ?? '—', sub: `${stats?.drivers?.onDuty ?? 0} on duty`, color: 'bg-purple-600' },
                    { icon: CheckCircle, label: 'Trips Completed', value: stats?.trips?.completed ?? '—', sub: 'All time', color: 'bg-green-600' },
                    { icon: TrendingUp, label: 'Net Profit (30d)', value: `₹${totalProfit.toLocaleString()}`, sub: `Rev ₹${totalRevenue.toLocaleString()}`, color: totalProfit >= 0 ? 'bg-teal-600' : 'bg-rose-600' },
                ].map(({ icon: Icon, label, value, sub, color }) => (
                    <div key={label} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon size={19} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-400 text-xs">{label}</p>
                            <p className="text-white text-xl font-bold truncate">{value}</p>
                            <p className="text-slate-500 text-xs">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Vehicle donut */}
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                    <p className="text-white font-semibold text-sm mb-3">Vehicle Status</p>
                    <div className="h-48">
                        <Doughnut data={vehicleDonut} options={{ cutout: '66%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 10 } } }, maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Profit chart */}
                <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <p className="text-white font-semibold text-sm">Revenue vs Expenses vs Profit</p>
                        <div className="flex gap-3 text-xs">
                            <span className="text-green-400">Rev: ₹{totalRevenue.toLocaleString()}</span>
                            <span className="text-red-400">Exp: ₹{totalExpenses.toLocaleString()}</span>
                            <span className={totalProfit >= 0 ? 'text-indigo-400' : 'text-rose-400'}>Profit: ₹{totalProfit.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="h-48">
                        {profitDisplay.some(d => d.revenue > 0 || d.expenses > 0) ? (
                            <Bar data={profitChart} options={chartOpts} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                <BarChart3 size={28} className="opacity-20 mr-3" /> No financial data yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Manage Vehicles', sub: `${stats?.vehicles?.total ?? 0} total`, href: '/vehicles', color: 'from-indigo-600/20 to-indigo-600/5', border: 'border-indigo-500/20' },
                    { label: 'Manage Drivers', sub: `${stats?.drivers?.total ?? 0} total`, href: '/drivers', color: 'from-purple-600/20 to-purple-600/5', border: 'border-purple-500/20' },
                    { label: 'All Trips', sub: `${stats?.trips?.total ?? 0} total`, href: '/trips', color: 'from-blue-600/20 to-blue-600/5', border: 'border-blue-500/20' },
                    { label: 'Full Analytics', sub: 'ROI & efficiency', href: '/analytics', color: 'from-green-600/20 to-green-600/5', border: 'border-green-500/20' },
                ].map(({ label, sub, href, color, border }) => (
                    <a key={href} href={href} className={`bg-gradient-to-br ${color} border ${border} rounded-xl p-4 flex items-center justify-between hover:scale-[1.02] transition-transform group`}>
                        <div>
                            <p className="text-white font-semibold text-sm">{label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
                        </div>
                        <Eye size={14} className="text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
                    </a>
                ))}
            </div>
        </div>
    );
}
