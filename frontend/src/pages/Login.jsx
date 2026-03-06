import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CircleUser, Lock, Eye, EyeOff, Mail, Phone, Hash, ShieldAlert } from 'lucide-react';
import api from '../api';

const ROLES = ['Manager', 'Dispatcher', 'Driver', 'Safety Officer', 'Financial Analyst'];

export default function Login() {
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPwd, setLoginPwd] = useState('');

    // Auto-login helpers
    const setDemo = (email, pwd) => { setLoginEmail(email); setLoginPwd(pwd); };

    // Signup
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

    const inputClasses = "w-full bg-[#f6f6f6] text-gray-800 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#28094a]/20 transition-all font-medium placeholder-gray-500 text-sm";

    return (
        <div className="min-h-screen w-full relative flex overflow-hidden bg-white">

            {/* ── BACKGROUND ── */}
            {/* Left Gradient Half */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-blue-500 to-blue-900" />

            {/* ── CARD CONTAINER ── */}
            <div className="relative z-30 flex-1 flex items-center justify-center p-4 lg:p-12">
                <div className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-3xl p-8 sm:p-16 w-full max-w-xl border border-white/20 shadow-2xl"
                    style={{ boxShadow: '0 25px 60px -5px rgba(0,0,0,0.6), 0 0 40px rgba(12, 110, 226, 0.3)' }}>

                    {tab === 'login' ? (
                        <>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-center mb-12 drop-shadow-md">Welcome Back</h2>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Field */}
                                <div className="relative">
                                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                                        placeholder="Username / Email"
                                        className="w-full bg-white/10 text-white rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-lg shadow-inner" />
                                </div>

                                {/* Password Field */}
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={loginPwd} onChange={e => setLoginPwd(e.target.value)} required
                                        placeholder="Password"
                                        className="w-full bg-white/10 text-white rounded-full pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-lg shadow-inner" />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none">
                                        {showPass ? <Eye size={22} /> : <EyeOff size={22} />}
                                    </button>
                                </div>

                                {/* Checkbox & Forgot Password */}
                                <div className="flex flex-wrap items-center justify-between px-2 pt-2 pb-4 gap-4">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="checkbox" className="w-5 h-5 rounded bg-white/10 border border-white/30 appearance-none checked:bg-white checked:border-white transition-all relative
                                            after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[6px] after:h-[12px] after:border-r-2 after:border-b-2 after:border-blue-900 after:rotate-45 block shadow-sm" />
                                        <span className="text-base font-medium text-white/80 group-hover:text-white">Remember Password</span>
                                    </label>
                                    <button type="button" className="text-base font-semibold text-white/80 hover:text-white transition-colors focus:outline-none drop-shadow-sm">Forgot Password</button>
                                </div>

                                {/* Login Button */}
                                <button type="submit" disabled={loading}
                                    className="w-full bg-white hover:bg-gray-100 active:scale-[0.98] transition-all text-blue-900 font-bold py-4 rounded-full text-xl shadow-xl shadow-indigo-900/50 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {loading ? <span className="w-6 h-6 inline-block border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" /> : 'Login'}
                                </button>
                            </form>

                            <p className="text-center text-base font-medium text-white/80 mt-10 mb-8 drop-shadow-sm">
                                Don't Have an Account? <button onClick={() => setTab('signup')} className="font-bold text-white hover:text-blue-200 transition-colors focus:outline-none">Sign Up</button>
                            </p>

                            <div className="pt-8 border-t border-white/20">
                                <p className="text-center text-sm font-semibold text-white/60 uppercase tracking-widest mb-6">Quick Demo Access</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: 'Admin', email: 'admin@fleetflow.com', pwd: 'admin' },
                                        { label: 'Manager', email: 'nakshatragautam34@gmai.com', pwd: '123456' },
                                        { label: 'Dispatcher', email: 'dispatcher@fleetflow.com', pwd: 'dispatch123' },
                                        { label: 'Driver', email: 'naks12@gmail.com', pwd: '123456' },
                                        { label: 'Financial', email: 'financial@fleetflow.com', pwd: '123456' },
                                        { label: 'Safety', email: 'safety@fleetflow.com', pwd: 'safety123' },
                                    ].map(acc => (
                                        <button key={acc.label} type="button" onClick={() => setDemo(acc.email, acc.pwd)}
                                            className="px-2 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-none transition-all hover:scale-105 active:scale-95 shadow-md">
                                            {acc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-10 drop-shadow-md">Create Account</h2>

                            <form onSubmit={handleSignup} className="space-y-5">
                                <div className="relative">
                                    <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required placeholder="Full Name"
                                        className="w-full bg-white/10 text-white rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-lg shadow-inner" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Mail className="h-6 w-6 text-white/70" strokeWidth={1.5} />
                                    </div>
                                    <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required placeholder="Email Address"
                                        className="w-full bg-white/10 text-white rounded-full pl-16 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-lg shadow-inner" />
                                </div>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={signupPwd} onChange={e => setSignupPwd(e.target.value)} required placeholder="Password"
                                        className="w-full bg-white/10 text-white rounded-full pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-lg shadow-inner" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none">
                                        {showPass ? <Eye size={22} /> : <EyeOff size={22} />}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <select value={signupRole} onChange={e => setSignupRole(e.target.value)}
                                            className="w-full bg-white/10 text-white rounded-full pl-6 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium text-lg appearance-none cursor-pointer shadow-inner">
                                            {ROLES.map(r => <option key={r} value={r} className="text-gray-900 bg-white shadow-lg">{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                                        </div>
                                        <input type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} placeholder="Phone"
                                            className="w-full bg-white/10 text-white rounded-full pl-14 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-lg shadow-inner" />
                                    </div>
                                </div>

                                {signupRole === 'Driver' && (
                                    <div className="bg-white/5 border border-white/20 rounded-3xl p-5 space-y-4 shadow-inner">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-white/70" /></div>
                                            <input value={signupLicense} onChange={e => setSignupLicense(e.target.value)} required placeholder="License Number"
                                                className="w-full bg-white/10 text-white rounded-full pl-14 pr-6 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-base shadow-inner" />
                                        </div>
                                        <input type="date" value={signupLicenseExpiry} onChange={e => setSignupLicenseExpiry(e.target.value)} required
                                            className="w-full bg-white/10 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-base styled-date shadow-inner" />
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full bg-white hover:bg-gray-100 active:scale-[0.98] transition-all text-blue-900 font-bold py-4 rounded-full text-xl shadow-xl shadow-indigo-900/50 disabled:opacity-70 mt-8">
                                    {loading ? <span className="w-6 h-6 inline-block border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" /> : 'Create Account'}
                                </button>
                            </form>

                            <p className="text-center text-base font-medium text-white/80 mt-8 drop-shadow-sm">
                                Already Registered? <button onClick={() => setTab('login')} className="font-bold text-white hover:text-blue-200 transition-colors focus:outline-none">Login</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
