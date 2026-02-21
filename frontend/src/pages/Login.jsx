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
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#0c6ee2] to-[#1e0a44]" />

            {/* Floating Decorative Elements (as in reference image) */}
            {/* Top Right Mustard Circle */}
            <div className="absolute top-[5%] right-[15%] w-10 h-10 bg-[#c8921a] rounded-full z-0" />

            {/* Middle Right Dark Purple Circle (cut off) */}
            <div className="absolute top-[40%] -right-4 w-12 h-12 bg-[#28094a] rounded-full z-0" />

            {/* Bottom Right Mustard Circle (large, partially visible) */}
            <div className="absolute -bottom-16 right-[3%] w-44 h-44 bg-[#c8921a] rounded-full z-0" />

            {/* Bottom Target/Ring Mustard Circle (middle) */}
            <div className="absolute -bottom-16 left-[50%] -translate-x-1/2 w-32 h-32 border-[12px] border-[#c8921a] rounded-full z-10" />

            {/* Bottom Middle Small Dark Purple Hovering Circle */}
            {/* ── CARD CONTAINER ── */}
            <div className="relative z-30 flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="bg-gradient-to-br from-[#1e0a44] to-[#0c6ee2] rounded-[2.5rem] p-10 sm:p-14 w-full max-w-[500px] border border-white/10"
                    style={{ boxShadow: '0 25px 60px -10px rgba(0,0,0,0.5)' }}>

                    {tab === 'login' ? (
                        <>
                            <h2 className="text-4xl font-extrabold text-white text-center mb-10">Welcome Back</h2>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email Field */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CircleUser className="h-[1.25rem] w-[1.25rem] text-white/70" strokeWidth={1.5} />
                                    </div>
                                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                                        placeholder="Username / Email"
                                        className="w-full bg-white/10 text-white rounded-full pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-base" />
                                </div>

                                {/* Password Field */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-[1.25rem] w-[1.25rem] text-white/70" strokeWidth={1.5} />
                                    </div>
                                    <input type={showPass ? 'text' : 'password'} value={loginPwd} onChange={e => setLoginPwd(e.target.value)} required
                                        placeholder="Password"
                                        className="w-full bg-white/10 text-white rounded-full pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-base" />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none">
                                        {showPass ? <Eye size={19} /> : <EyeOff size={19} />}
                                    </button>
                                </div>

                                {/* Checkbox & Forgot Password */}
                                <div className="flex items-center justify-between px-2 pt-2 pb-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-[16px] h-[16px] rounded bg-white/10 border border-white/30 appearance-none checked:bg-white checked:border-white transition-all relative
                                            after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[5px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-[#1e0a44] after:rotate-45 block" />
                                        <span className="text-sm font-medium text-white/80 group-hover:text-white">Remember Password</span>
                                    </label>
                                    <button type="button" className="text-sm font-semibold text-white/80 hover:text-white transition-colors focus:outline-none">Forgot Password</button>
                                </div>

                                {/* Login Button */}
                                <button type="submit" disabled={loading}
                                    className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] transition-all text-[#1e0a44] font-bold py-4 rounded-full text-base shadow-lg shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {loading ? <span className="w-5 h-5 inline-block border-2 border-[#1e0a44]/30 border-t-[#1e0a44] rounded-full animate-spin" /> : 'Login'}
                                </button>
                            </form>

                            <p className="text-center text-sm font-medium text-white/80 mt-8 mb-8">
                                Don't Have an Account? <button onClick={() => setTab('signup')} className="font-bold text-white hover:text-blue-200 transition-colors focus:outline-none">Sign Up</button>
                            </p>

                            <div className="pt-6 border-t border-white/20">
                                <p className="text-center text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Quick Demo Access</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Admin', email: 'admin@fleetflow.com', pwd: 'admin' },
                                        { label: 'Manager', email: 'nakshatragautam34@gmai.com', pwd: '123456' },
                                        { label: 'Dispatcher', email: 'dispatcher@fleetflow.com', pwd: 'dispatch123' },
                                        { label: 'Driver', email: 'naks12@gmail.com', pwd: '123456' },
                                        { label: 'Financial', email: 'financial@fleetflow.com', pwd: '123456' },
                                        { label: 'Safety', email: 'safety@fleetflow.com', pwd: 'safety123' },
                                    ].map(acc => (
                                        <button key={acc.label} type="button" onClick={() => setDemo(acc.email, acc.pwd)}
                                            className="px-2 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs font-medium focus:outline-none transition-all hover:scale-105 active:scale-95">
                                            {acc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-extrabold text-white text-center mb-8">Create Account</h2>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CircleUser className="h-[1.15rem] w-[1.15rem] text-white/70" strokeWidth={1.5} />
                                    </div>
                                    <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required placeholder="Full Name"
                                        className="w-full bg-white/10 text-white rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-sm" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-[1.15rem] w-[1.15rem] text-white/70" strokeWidth={1.5} />
                                    </div>
                                    <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required placeholder="Email Address"
                                        className="w-full bg-white/10 text-white rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-sm" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-[1.15rem] w-[1.15rem] text-white/70" strokeWidth={1.5} />
                                    </div>
                                    <input type={showPass ? 'text' : 'password'} value={signupPwd} onChange={e => setSignupPwd(e.target.value)} required placeholder="Password"
                                        className="w-full bg-white/10 text-white rounded-full pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors focus:outline-none">
                                        {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <select value={signupRole} onChange={e => setSignupRole(e.target.value)}
                                            className="w-full bg-white/10 text-white rounded-full pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium text-sm appearance-none">
                                            {ROLES.map(r => <option key={r} value={r} className="text-gray-900 bg-white shadow-lg">{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Phone className="h-[1.1rem] w-[1.1rem] text-white/70" strokeWidth={1.5} />
                                        </div>
                                        <input type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} placeholder="Phone"
                                            className="w-full bg-white/10 text-white rounded-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-sm" />
                                    </div>
                                </div>

                                {signupRole === 'Driver' && (
                                    <div className="bg-white/5 border border-white/20 rounded-3xl p-4 space-y-3">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Hash className="h-[1.1rem] w-[1.1rem] text-white/70" /></div>
                                            <input value={signupLicense} onChange={e => setSignupLicense(e.target.value)} required placeholder="License Number"
                                                className="w-full bg-white/10 text-white rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-sm" />
                                        </div>
                                        <input type="date" value={signupLicenseExpiry} onChange={e => setSignupLicenseExpiry(e.target.value)} required
                                            className="w-full bg-white/10 text-white rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium placeholder-white/50 text-sm styled-date" />
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] transition-all text-[#1e0a44] font-bold py-3.5 rounded-full text-base shadow-lg shadow-white/10 disabled:opacity-70 mt-6">
                                    {loading ? <span className="w-5 h-5 inline-block border-2 border-[#1e0a44]/30 border-t-[#1e0a44] rounded-full animate-spin" /> : 'Create Account'}
                                </button>
                            </form>

                            <p className="text-center text-sm font-medium text-white/80 mt-6">
                                Already Registered? <button onClick={() => setTab('login')} className="font-bold text-white hover:text-blue-200 transition-colors focus:outline-none">Login</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
