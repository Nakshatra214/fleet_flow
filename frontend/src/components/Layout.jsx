import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Truck, Users, Route, Wrench,
    Fuel, BarChart3, LogOut, Menu, X, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import NotificationBell from './NotificationBell';

// Nav config with role access
const allNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Manager', 'Dispatcher', 'Driver'] },
    { to: '/vehicles', label: 'Vehicles', icon: Truck, roles: ['Manager', 'Dispatcher'] },
    { to: '/drivers', label: 'Drivers', icon: Users, roles: ['Manager', 'Dispatcher'] },
    { to: '/trips', label: 'Trips', icon: Route, roles: ['Manager', 'Dispatcher', 'Driver'] },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['Manager', 'Dispatcher'] },
    { to: '/fuel', label: 'Fuel & Expenses', icon: Fuel, roles: ['Manager', 'Dispatcher'] },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['Manager'] },
];

const roleChip = {
    Manager: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    Dispatcher: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    Driver: 'text-green-400 bg-green-400/10 border-green-400/30',
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = allNavItems.filter(item => item.roles.includes(user?.role));
    const handleLogout = () => { logout(); navigate('/login'); };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-700/60 min-h-[64px]">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                    <Zap size={15} className="text-white" strokeWidth={2.5} />
                </div>
                {!collapsed && (
                    <span className="text-white font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">FleetFlow</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto text-slate-500 hover:text-white transition-colors hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-slate-700 flex-shrink-0"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="ml-auto text-slate-500 hover:text-white transition-colors lg:hidden"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Role badge */}
            {!collapsed && (
                <div className="px-4 pt-3 pb-1">
                    <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${roleChip[user?.role] || ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {user?.role}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden px-2">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? label : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl transition-all duration-150 group ${isActive
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`
                        }
                    >
                        <Icon size={17} className="flex-shrink-0" />
                        {!collapsed && (
                            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User profile */}
            <div className="border-t border-slate-700/60 p-3">
                <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-400/10"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className={`
        hidden lg:flex flex-col flex-shrink-0
        ${collapsed ? 'w-[60px]' : 'w-56'}
        bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/60
        transition-all duration-200 ease-in-out
      `}>
                <SidebarContent />
            </aside>

            {/* Mobile sidebar drawer */}
            <aside className={`
        fixed lg:hidden inset-y-0 left-0 z-40 w-60 flex flex-col
        bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/60
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <SidebarContent />
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-xl flex-shrink-0">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700"
                    >
                        <Menu size={18} />
                    </button>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <Zap size={13} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-sm">FleetFlow</span>
                    </div>

                    <div className="flex-1" />

                    {/* Right section */}
                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* User chip */}
                        <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${roleChip[user?.role] || ''}`}>{user?.role}</span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 border border-slate-700/60 transition-all"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-5 xl:p-6 max-w-screen-xl mx-auto fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
