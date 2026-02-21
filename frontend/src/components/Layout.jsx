import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Truck, Users, Route, Wrench,
    Fuel, BarChart3, LogOut, Menu, X, Zap, ChevronLeft, ChevronRight, ShieldCheck, TrendingUp
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const allNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Dispatcher', 'Driver', 'Safety Officer', 'Financial Analyst'] },
    { to: '/vehicles', label: 'Vehicles', icon: Truck, roles: ['Manager', 'Dispatcher', 'Safety Officer'] },
    { to: '/drivers', label: 'Drivers', icon: Users, roles: ['Manager', 'Dispatcher', 'Safety Officer'] },
    { to: '/trips', label: 'Trips', icon: Route, roles: ['Manager', 'Dispatcher', 'Driver', 'Safety Officer'] },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['Manager', 'Dispatcher', 'Financial Analyst'] },
    { to: '/fuel', label: 'Fuel & Expenses', icon: Fuel, roles: ['Manager', 'Dispatcher', 'Financial Analyst'] },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['Manager', 'Financial Analyst'] },
];

const roleChip = {
    Admin: 'text-blue-700 bg-blue-50 border-blue-200',
    Manager: 'text-blue-600 bg-blue-50 border-blue-200',
    Dispatcher: 'text-green-600 bg-green-50 border-green-200',
    Driver: 'text-green-700 bg-green-50 border-green-200',
    'Safety Officer': 'text-green-600 bg-green-50 border-green-200',
    'Financial Analyst': 'text-blue-600 bg-blue-50 border-blue-200',
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
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 min-h-[64px]">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
                    <Zap size={15} className="text-white" strokeWidth={2.5} />
                </div>
                {!collapsed && (
                    <span className="text-gray-800 font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">FleetFlow</span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto text-gray-400 hover:text-indigo-500 transition-colors hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-indigo-50 flex-shrink-0"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="ml-auto text-gray-400 hover:text-gray-600 transition-colors lg:hidden"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Role badge */}
            {!collapsed && (
                <div className="px-4 pt-3 pb-1">
                    <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${roleChip[user?.role] || 'text-gray-500 bg-gray-100 border-gray-200'}`}>
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
                                ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
            <div className="border-t border-gray-100 p-3">
                <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-sm font-semibold truncate">{user?.name}</p>
                            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className={`
                hidden lg:flex flex-col flex-shrink-0
                ${collapsed ? 'w-[60px]' : 'w-56'}
                bg-white border-r border-gray-100 shadow-sm
                transition-all duration-200 ease-in-out
            `}>
                <SidebarContent />
            </aside>

            {/* Mobile sidebar drawer */}
            <aside className={`
                fixed lg:hidden inset-y-0 left-0 z-40 w-60 flex flex-col
                bg-white border-r border-gray-100 shadow-xl
                transition-transform duration-200 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                    >
                        <Menu size={18} />
                    </button>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Zap size={13} className="text-white" />
                        </div>
                        <span className="text-gray-800 font-bold text-sm">FleetFlow</span>
                    </div>

                    <div className="flex-1" />

                    {/* Right section */}
                    <div className="flex items-center gap-2">
                        <NotificationBell />

                        {/* User chip */}
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-gray-700 text-sm font-medium">{user?.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-semibold ${roleChip[user?.role] || ''}`}>{user?.role}</span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-all"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
                    <div className="p-5 xl:p-6 fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
