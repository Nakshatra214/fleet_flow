import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, Truck } from 'lucide-react';

const demoAccounts = [
    { role: 'Manager', email: 'manager@fleetflow.com', password: 'manager123', color: 'text-purple-400', desc: 'Full access' },
    { role: 'Dispatcher', email: 'dispatcher@fleetflow.com', password: 'dispatch123', color: 'text-blue-400', desc: 'Trip management' },
    { role: 'Driver', email: 'driver@fleetflow.com', password: 'driver123', color: 'text-green-400', desc: 'View only' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back! 🚛');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (acc) => { setEmail(acc.email); setPassword(acc.password); };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
                        <Zap size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">FleetFlow</h1>
                    <p className="text-slate-400 mt-1">Smart Fleet Management System</p>
                </div>

                {/* Login card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Truck size={16} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6">
                        <p className="text-xs text-slate-500 text-center mb-3">Demo Accounts (click to fill)</p>
                        <div className="grid grid-cols-3 gap-2">
                            {demoAccounts.map((acc) => (
                                <button
                                    key={acc.role}
                                    onClick={() => fillDemo(acc)}
                                    className="bg-slate-900/60 hover:bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-left transition-all duration-150 group"
                                >
                                    <p className={`text-xs font-semibold ${acc.color}`}>{acc.role}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{acc.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-sm mt-4">FleetFlow v1.0 • Hackathon Edition 2026</p>
            </div>
        </div>
    );
}
