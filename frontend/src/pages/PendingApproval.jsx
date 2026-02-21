import { Clock, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/10 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="w-full max-w-md relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 mb-6 shadow-lg shadow-amber-100">
                    <Clock size={36} className="text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Awaiting Approval</h1>
                <p className="text-gray-500 mb-2">
                    Your <span className="text-gray-800 font-semibold">{user?.role}</span> account is pending review.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                    An admin will review your request and grant access shortly. You'll receive a notification once approved.
                </p>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 text-left shadow-sm">
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">Account Details</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-gray-800 font-semibold text-sm">{user?.name}</p>
                                <p className="text-gray-400 text-xs">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                            <Clock size={14} className="text-amber-500 flex-shrink-0" />
                            <span className="text-amber-600 text-sm font-medium">Pending Admin Approval</span>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-left">
                    <Mail size={16} className="text-indigo-500 flex-shrink-0" />
                    <p className="text-gray-500 text-sm">You'll get a notification when your account is approved or rejected.</p>
                </div>

                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex items-center justify-center gap-2 w-full border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 py-3 rounded-xl transition-colors text-sm shadow-sm"
                >
                    <LogOut size={15} /> Sign In with a Different Account
                </button>
            </div>
        </div>
    );
}
