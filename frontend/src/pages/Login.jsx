import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, User, Truck, UserPlus, LogIn } from 'lucide-react';
import api from '../api';

const roles = ['Manager', 'Dispatcher', 'Driver'];

export default function Login() {
    const [tab, setTab] = useState('login'); // 'login' | 'signup'
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Dispatcher' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 🚛');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check your email and password.');
        } finally { setLoading(false); }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast.error('Please fill all fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            localStorage.setItem('ff_token', data.token);
            localStorage.setItem('ff_user', JSON.stringify(data.user));
            // Re-initialize auth context
            await login(form.email, form.password);
            toast.success(`Welcome, ${data.user.name}! Account created 🚀`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
                        <Zap size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">FleetFlow</h1>
                    <p className="text-slate-400 mt-1">Smart Fleet Management System</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LogIn size={15} /> Sign In
                        </button>
                        <button
                            onClick={() => setTab('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <UserPlus size={15} /> Create Account
                        </button>
                    </div>

                    {/* LOGIN FORM */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" value={form.email} onChange={f('email')} required placeholder="your@email.com"
                                        className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={f('password')} required placeholder="••••••••"
                                        className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Truck size={16} /> Sign In</>}
                            </button>
                            <div className="text-center pt-2">
                                <p className="text-slate-500 text-sm">Don't have an account?{' '}
                                    <button type="button" onClick={() => setTab('signup')} className="text-indigo-400 hover:text-indigo-300 font-medium">Create one free</button>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* SIGNUP FORM */}
                    {tab === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.name} onChange={f('name')} required placeholder="e.g. Rahul Kumar"
                                        className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" value={form.email} onChange={f('email')} required placeholder="your@email.com"
                                        className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={f('password')} required placeholder="Min 6 characters"
                                        className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                                <select value={form.role} onChange={f('role')}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <p className="text-slate-500 text-xs mt-1">Manager = full access · Dispatcher = trips · Driver = view</p>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={16} /> Create Account</>}
                            </button>
                            <p className="text-center text-slate-500 text-sm">
                                Already have an account?{' '}
                                <button type="button" onClick={() => setTab('login')} className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</button>
                            </p>
                        </form>
                    )}
                </div>
                <p className="text-center text-slate-600 text-xs mt-4">FleetFlow v1.0 · Hackathon Edition 2026</p>
            </div>
        </div>
    );
}
