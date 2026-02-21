import { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock, ShieldCheck } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const roleColors = {
    Manager: 'text-purple-600 bg-purple-50 border-purple-200',
    Dispatcher: 'text-blue-600 bg-blue-50 border-blue-200',
    Driver: 'text-green-600 bg-green-50 border-green-200',
    'Safety Officer': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'Financial Analyst': 'text-violet-600 bg-violet-50 border-violet-200',
};

function ApprovalCard({ user: u, onApprove, onReject }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                {u.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-semibold text-sm">{u.name}</p>
                <p className="text-gray-400 text-xs truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[u.role] || 'text-gray-500 bg-gray-100 border-gray-200'}`}>{u.role}</span>
                    <span className="text-gray-300 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onApprove(u._id, u.name)}
                    className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    <UserCheck size={13} /> Approve
                </button>
                <button onClick={() => onReject(u._id, u.name)}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                    <UserX size={13} /> Reject
                </button>
            </div>
        </div>
    );
}

export default function AdminDashboard({ user }) {
    const [pending, setPending] = useState([]);

    useEffect(() => {
        api.get('/auth/pending-users').then(r => setPending(r.data)).catch(() => { });
    }, []);

    const approve = async (id, name) => {
        try {
            await api.put(`/auth/approve/${id}`);
            toast.success(`✅ ${name} approved!`);
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
        <div className="min-h-full flex justify-center">
            <div className="space-y-6 w-full max-w-3xl">
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-blue-800">System Administration</h1>
                    <p className="text-blue-500 text-sm mt-1.5">Welcome back, {user?.name} · Review and manage pending account requests.</p>
                    {pending.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 bg-white border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl shadow-sm">
                            <Clock size={14} className="animate-pulse" />
                            {pending.length} pending approval{pending.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Pending Approvals Panel */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <Clock size={15} className="text-amber-500" />
                        <h3 className="text-gray-700 font-semibold text-sm">Pending Account Approvals</h3>
                        <span className="ml-auto text-xs bg-amber-100 text-amber-600 border border-amber-200 font-bold px-2.5 py-1 rounded-full">{pending.length} pending</span>
                    </div>
                    <div className="p-5">
                        {pending.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                                    <ShieldCheck size={30} className="text-indigo-400" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">All caught up!</p>
                                <p className="text-xs mt-1 text-gray-400">No pending account requests at this time.</p>
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
        </div>
    );
}
