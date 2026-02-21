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
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const sidebarW = collapsed ? 'w-14' : 'w-56';

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        ${sidebarW} flex-shrink-0
        bg-slate-800 border-r border-slate-700
        flex flex-col
        transition-all duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo row */}
                <div className="flex items-center gap-2 px-3 py-4 border-b border-slate-700 min-h-[61px]">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap size={15} className="text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-white font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">FleetFlow</span>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto text-slate-400 hover:text-white transition-colors hidden lg:block flex-shrink-0"
                    >
                        {collapsed ? <Menu size={16} /> : <X size={16} />}
                    </button>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="ml-auto text-slate-400 hover:text-white transition-colors lg:hidden flex-shrink-0"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 mx-2 my-0.5 px-2.5 py-2.5 rounded-lg transition-all duration-150 group ${isActive
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                                }`
                            }
                            title={collapsed ? label : undefined}
                        >
                            <Icon size={17} className="flex-shrink-0" />
                            {!collapsed && (
                                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User info */}
                <div className="border-t border-slate-700 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0 mr-1">
                                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[user?.role] || 'text-slate-400'}`}>
                                    {user?.role}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Logout"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile topbar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-800 lg:hidden flex-shrink-0">
                    <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center">
                            <Zap size={12} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-sm">FleetFlow</span>
                    </div>
                </div>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-5 max-w-screen-xl mx-auto fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
