import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Truck, Users, Route, Wrench,
    Fuel, BarChart3, LogOut, Menu, X, Zap
} from 'lucide-react';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vehicles', label: 'Vehicles', icon: Truck },
    { to: '/drivers', label: 'Drivers', icon: Users },
    { to: '/trips', label: 'Trips', icon: Route },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/fuel', label: 'Fuel & Expenses', icon: Fuel },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const roleColors = {
    Manager: 'text-purple-400 bg-purple-400/10',
    Dispatcher: 'text-blue-400 bg-blue-400/10',
    Driver: 'text-green-400 bg-green-400/10',
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap size={16} className="text-white" />
                    </div>
                    {sidebarOpen && (
                        <span className="text-white font-bold text-lg tracking-tight">FleetFlow</span>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-slate-400 hover:text-white transition-colors">
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-150 group ${isActive
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`
                            }
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User info */}
                <div className="border-t border-slate-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user?.name?.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[user?.role] || 'text-slate-400'}`}>
                                    {user?.role}
                                </span>
                            </div>
                        )}
                        <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
