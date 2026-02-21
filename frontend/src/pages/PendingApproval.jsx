import { Clock, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="w-full max-w-md relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 mb-6">
                    <Clock size={36} className="text-amber-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Awaiting Approval</h1>
                <p className="text-slate-400 mb-2">
                    Your <span className="text-white font-semibold">{user?.role}</span> account is pending review.
                </p>
                <p className="text-slate-500 text-sm mb-8">
                    A fleet manager will review your request and grant access shortly. You'll receive a notification once approved.
                </p>

                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 mb-6 text-left">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Account Details</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">{user?.name}</p>
                                <p className="text-slate-400 text-xs">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                            <Clock size={14} className="text-amber-400 flex-shrink-0" />
                            <span className="text-amber-400 text-sm font-medium">Pending Manager Approval</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 mb-6 flex items-center gap-3 text-left">
                    <Mail size={16} className="text-indigo-400 flex-shrink-0" />
                    <p className="text-slate-400 text-sm">You'll get a notification when your account is approved or rejected.</p>
                </div>

                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex items-center justify-center gap-2 w-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 py-3 rounded-xl transition-colors text-sm"
                >
                    <LogOut size={15} /> Sign In with a Different Account
                </button>
            </div>
        </div>
    );
}
