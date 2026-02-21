import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Truck, UserPlus, LogIn, ChevronRight, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const ROLES = ['Manager', 'Dispatcher', 'Driver'];

export default function Login() {
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPwd, setLoginPwd] = useState('');

    // Signup form state
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPwd, setSignupPwd] = useState('');
    const [signupRole, setSignupRole] = useState('Dispatcher');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupLicense, setSignupLicense] = useState('');
    const [signupLicenseExpiry, setSignupLicenseExpiry] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(loginEmail, loginPwd);
            toast.success('Welcome to FleetFlow! 🚛');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (signupPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (signupRole === 'Driver' && (!signupLicense || !signupLicenseExpiry)) {
            toast.error('Drivers must provide license number and expiry date');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register', {
                name: signupName, email: signupEmail, password: signupPwd, role: signupRole,
                phone: signupPhone, licenseNumber: signupLicense, licenseExpiry: signupLicenseExpiry,
            });
            toast.success(`Account created! Please sign in now.`, { duration: 4000 });
            // Redirect to sign-in tab (NOT auto-login)
            setTab('login');
            setLoginEmail(signupEmail);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-xl shadow-indigo-500/30">
                        <Zap size={28} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">FleetFlow</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">Smart Fleet Management System</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Tab bar */}
                    <div className="flex border-b border-slate-700/60">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${tab === 'login'
                                ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/5'
                                : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LogIn size={15} /> Sign In
                        </button>
                        <button
                            onClick={() => setTab('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${tab === 'signup'
                                ? 'text-white border-b-2 border-violet-500 bg-violet-500/5'
                                : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <UserPlus size={15} /> Create Account
                        </button>
                    </div>

                    <div className="p-7">
                        {/* LOGIN */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                                        placeholder="you@example.com"
                                        className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'} value={loginPwd} onChange={e => setLoginPwd(e.target.value)} required
                                            placeholder="••••••••"
                                            className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-sm">
                                    {loading
                                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Truck size={15} /> Sign In to FleetFlow</>}
                                </button>
                                <p className="text-center text-slate-500 text-xs pt-1">
                                    No account?{' '}
                                    <button type="button" onClick={() => setTab('signup')} className="text-indigo-400 hover:text-indigo-300 font-semibold">
                                        Create one free <ChevronRight size={11} className="inline" />
                                    </button>
                                </p>

                                {/* Demo hint */}
                                <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3.5 space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Demo Accounts</p>
                                    {[
                                        { label: 'Manager', email: 'manager@fleetflow.com', pwd: 'manager123', color: 'text-purple-400' },
                                        { label: 'Dispatcher', email: 'dispatcher@fleetflow.com', pwd: 'dispatch123', color: 'text-blue-400' },
                                        { label: 'Driver', email: 'driver@fleetflow.com', pwd: 'driver123', color: 'text-green-400' },
                                    ].map(acc => (
                                        <button key={acc.label} type="button"
                                            onClick={() => { setLoginEmail(acc.email); setLoginPwd(acc.pwd); }}
                                            className="w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-700/60 px-3 py-2 rounded-lg transition-colors text-left group">
                                            <div className={`text-xs font-bold px-1.5 py-0.5 rounded border ${acc.color} border-current bg-current/10 min-w-[70px] text-center`}>{acc.label}</div>
                                            <span className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors flex-1 truncate">{acc.email}</span>
                                            <span className="text-slate-600 text-xs group-hover:text-indigo-400 transition-colors">Click to fill →</span>
                                        </button>
                                    ))}
                                </div>
                            </form>
                        )}

                        {/* SIGNUP */}
                        {tab === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                        <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required placeholder="Rahul Kumar"
                                            className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                                        <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required placeholder="you@example.com"
                                            className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                                        <div className="relative">
                                            <input type={showPass ? 'text' : 'password'} value={signupPwd} onChange={e => setSignupPwd(e.target.value)} required placeholder="Min 6 characters"
                                                className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                                            <button type="button" onClick={() => setShowPass(!showPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                                        <select value={signupRole} onChange={e => setSignupRole(e.target.value)}
                                            className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all">
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                                        <input type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} placeholder="+91 …"
                                            className="w-full bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                                    </div>
                                </div>

                                {/* Driver-specific fields */}
                                {signupRole === 'Driver' && (
                                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-3">
                                        <p className="text-green-400 text-xs font-semibold flex items-center gap-1.5">🪪 Driver License Details</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5 col-span-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Number*</label>
                                                <input value={signupLicense} onChange={e => setSignupLicense(e.target.value)} required placeholder="MH1234567890"
                                                    className="w-full bg-slate-900/80 border border-green-500/40 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-all" />
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Expiry*</label>
                                                <input type="date" value={signupLicenseExpiry} onChange={e => setSignupLicenseExpiry(e.target.value)} required
                                                    className="w-full bg-slate-900/80 border border-green-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 text-sm">
                                    {loading
                                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><UserPlus size={15} /> Create My Account</>}
                                </button>
                                <p className="text-center text-slate-500 text-xs">
                                    Already registered?{' '}
                                    <button type="button" onClick={() => setTab('login')} className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign in</button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
                <p className="text-center text-slate-700 text-xs mt-5">FleetFlow v1.0 · Hackathon Edition 2026</p>
            </div>
        </div>
    );
}
