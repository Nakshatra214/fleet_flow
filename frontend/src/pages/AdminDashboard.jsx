import { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock, ShieldCheck } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

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
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[u.role] || 'text-slate-400 border-slate-400'}`}>{u.role}</span>
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

export default function AdminDashboard({ user }) {
    const [pending, setPending] = useState([]);

    const load = async () => {
        try {
            const res = await api.get('/auth/pending-users');
            setPending(res.data);
        } catch (e) { console.error(e); }
    };
    useEffect(() => { load(); }, []);

    const approve = async (id, name) => {
        try {
            await api.put(`/auth/approve/${id}`);
            toast.success(`✅ ${name} approved! They can now sign in.`);
            setPending(prev => prev.filter(u => u._id !== id));
        } catch { toast.error('Approval failed'); }
    };

    const reject = async (id, name) => {
        try {
            await api.put(`/auth/reject/${id}`);
            toast.success(`${name} rejected.`);
            setPending(prev => prev.filter(u => u._id !== id));
        } catch { toast.error('Rejection failed'); }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 bg-slate-800/80 border border-emerald-500/20 rounded-2xl p-6">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={28} className="text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">System Administration</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Welcome back, {user?.name} · Ensure all account requests are verified.</p>
                </div>
            </div>

            {/* Pending Approvals Panel */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
                    <Clock size={16} className="text-amber-400" />
                    <h3 className="text-white font-semibold text-sm">Action Details: Pending Account Approvals</h3>
                    <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-2.5 py-1 rounded-full">{pending.length} pending</span>
                </div>

                <div className="p-5">
                    {pending.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <ShieldCheck size={40} className="mb-4 opacity-20 text-emerald-400" />
                            <p className="text-sm font-medium text-slate-400">All caught up!</p>
                            <p className="text-xs mt-1">There are no pending account requests at this time.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map(u => (
                                <ApprovalCard key={u._id} user={u} onApprove={approve} onReject={reject} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
