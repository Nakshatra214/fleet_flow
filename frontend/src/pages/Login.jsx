import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Truck, UserPlus, LogIn, ChevronRight, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const ROLES = ['Manager', 'Dispatcher', 'Driver', 'Safety Officer', 'Financial Analyst'];

export default function Login() {
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPwd, setLoginPwd] = useState('');
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
            toast.success('Welcome to FleetFlow!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally { setLoading(false); }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (signupPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (signupRole === 'Driver' && (!signupLicense || !signupLicenseExpiry)) {
            toast.error('Drivers must provide license number and expiry date'); return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register', {
                name: signupName, email: signupEmail, password: signupPwd, role: signupRole,
                phone: signupPhone, licenseNumber: signupLicense, licenseExpiry: signupLicenseExpiry,
            });
            toast.success('Account created! Please sign in.');
            setTab('login');
            setLoginEmail(signupEmail);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all";

    return (
        <div className="min-h-screen w-full flex">

            {/* ── LEFT PANEL ── Blue brand section */}
            <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-14 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-green-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 text-center">
                    {/* Logo */}
                    <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-7 border border-white/20 shadow-xl">
                        <Zap size={38} className="text-white" strokeWidth={2} />
                    </div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight mb-3">FleetFlow</h1>
                    <p className="text-blue-100 text-base mb-10 font-light">Smart Fleet Management System</p>

                    {/* Feature cards */}
                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                        {[
                            { icon: '🚛', label: 'Live Tracking' },
                            { icon: '📊', label: 'Analytics' },
                            { icon: '🛡️', label: 'Safety Scores' },
                            { icon: '💰', label: 'Finance Insights' },
                        ].map(({ icon, label }) => (
                            <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-3 py-4 text-center shadow-lg shadow-blue-900/20 hover:bg-white/15 transition-colors">
                                <p className="text-2xl mb-1.5">{icon}</p>
                                <p className="text-white text-xs font-semibold">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── Login / Signup form, vertically centered */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 sm:p-12">
                <div className="w-[80%] h-[70vh] overflow-y-auto flex flex-col justify-center bg-white rounded-3xl border border-gray-100 px-10 py-10"
                    style={{ boxShadow: '0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px 0 rgba(0,0,0,0.10)' }}>

                    {/* Mobile brand (hidden on desktop) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-3 shadow-lg shadow-blue-200">
                            <Zap size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">FleetFlow</h1>
                        <p className="text-gray-400 text-sm mt-1">Smart Fleet Management</p>
                    </div>

                    {/* Desktop heading */}
                    <div className="hidden lg:block mb-8">
                        <h2 className="text-4xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-400 mt-2 text-base">Sign in to your FleetFlow account</p>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex bg-gray-100 rounded-xl p-1.5 mb-8 shadow-inner">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-base font-semibold rounded-lg transition-all ${tab === 'login'
                                ? 'bg-white text-blue-600 shadow-md shadow-gray-200/70'
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LogIn size={16} /> Sign In
                        </button>
                        <button
                            onClick={() => setTab('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-base font-semibold rounded-lg transition-all ${tab === 'signup'
                                ? 'bg-white text-green-600 shadow-md shadow-gray-200/70'
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <UserPlus size={16} /> Create Account
                        </button>
                    </div>

                    {/* ── LOGIN FORM ── */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email Address</label>
                                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                                    placeholder="you@example.com" className={inputCls} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={loginPwd} onChange={e => setLoginPwd(e.target.value)} required
                                        placeholder="••••••••" className={inputCls + ' pr-12'} />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 text-base">
                                {loading
                                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Truck size={17} /> Sign In to FleetFlow</>}
                            </button>

                            <p className="text-center text-gray-400 text-sm">
                                No account?{' '}
                                <button type="button" onClick={() => setTab('signup')} className="text-blue-500 hover:text-blue-600 font-semibold">
                                    Create one free <ChevronRight size={13} className="inline" />
                                </button>
                            </p>

                            {/* Demo accounts */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Demo Accounts</p>
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Admin', email: 'admin@fleetflow.com', pwd: 'admin', dot: 'bg-blue-600' },
                                        { label: 'Manager', email: 'nakshatragautam34@gmai.com', pwd: '123456', dot: 'bg-blue-400' },
                                        { label: 'Dispatcher', email: 'dispatcher@fleetflow.com', pwd: 'dispatch123', dot: 'bg-green-500' },
                                        { label: 'Driver', email: 'naks12@gmail.com', pwd: '123456', dot: 'bg-green-400' },
                                        { label: 'Financial', email: 'financial@fleetflow.com', pwd: '123456', dot: 'bg-blue-300' },
                                        { label: 'Safety Off.', email: 'safety@fleetflow.com', pwd: 'safety123', dot: 'bg-green-300' },
                                    ].map(acc => (
                                        <button key={acc.label} type="button"
                                            onClick={() => { setLoginEmail(acc.email); setLoginPwd(acc.pwd); }}
                                            className="w-full flex items-center gap-3 bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-100 px-3.5 py-2.5 rounded-xl transition-all text-left group shadow-sm hover:shadow-md">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.dot}`} />
                                            <span className="text-gray-600 text-xs font-semibold w-20">{acc.label}</span>
                                            <span className="text-gray-400 text-xs flex-1 truncate group-hover:text-gray-600 transition-colors">{acc.email}</span>
                                            <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ── SIGNUP FORM ── */}
                    {tab === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required placeholder="Rahul Kumar" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={signupPwd} onChange={e => setSignupPwd(e.target.value)} required placeholder="Min 6 characters" className={inputCls + ' pr-12'} />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                                    <select value={signupRole} onChange={e => setSignupRole(e.target.value)} className={inputCls}>
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                                    <input type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} placeholder="+91 …" className={inputCls} />
                                </div>
                            </div>

                            {signupRole === 'Driver' && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2.5 shadow-sm">
                                    <p className="text-green-600 text-xs font-semibold">🪪 Driver License Details</p>
                                    <input value={signupLicense} onChange={e => setSignupLicense(e.target.value)} required placeholder="License Number*"
                                        className="w-full bg-white border border-green-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
                                    <input type="date" value={signupLicenseExpiry} onChange={e => setSignupLicenseExpiry(e.target.value)} required
                                        className="w-full bg-white border border-green-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-200 text-sm">
                                {loading
                                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><UserPlus size={15} /> Create My Account</>}
                            </button>
                            <p className="text-center text-gray-400 text-xs">
                                Already registered?{' '}
                                <button type="button" onClick={() => setTab('login')} className="text-blue-500 hover:text-blue-600 font-semibold">Sign in</button>
                            </p>
                        </form>
                    )}

                    <p className="text-center text-gray-300 text-xs mt-8">FleetFlow v1.0 · Hackathon Edition 2026</p>
                </div>
            </div>
        </div>
    );
}
