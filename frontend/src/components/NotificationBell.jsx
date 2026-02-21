import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Truck, AlertTriangle, CheckCircle, X } from 'lucide-react';
import api from '../api';

const typeConfig = {
    trip_assigned: { icon: Truck, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
    trip_dispatched: { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    trip_completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
    general: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const panelRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count'),
            ]);
            setNotifications(notifRes.data);
            setUnread(countRes.data.count);
        } catch (_) { }
    };

    // Poll every 15 seconds for new notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnread(prev => Math.max(0, prev - 1));
        } catch (_) { }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnread(0);
        } catch (_) { }
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-700/60 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
                <Bell size={17} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-800 animate-pulse">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95">
                        <div className="flex items-center gap-2">
                            <Bell size={15} className="text-indigo-400" />
                            <h3 className="text-white font-semibold text-sm">Notifications</h3>
                            {unread > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button onClick={markAllRead} title="Mark all read"
                                    className="text-slate-400 hover:text-indigo-400 transition-colors">
                                    <CheckCheck size={15} />
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                <Bell size={28} className="opacity-30 mb-2" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                        {notifications.map(n => {
                            const { icon: Icon, color, bg } = typeConfig[n.type] || typeConfig.general;
                            return (
                                <div
                                    key={n._id}
                                    className={`flex gap-3 px-4 py-3.5 border-b border-slate-700/50 transition-colors hover:bg-slate-700/30 ${!n.read ? 'bg-slate-700/20' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${bg}`}>
                                        <Icon size={14} className={color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-semibold">{n.title}</p>
                                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                                        <p className="text-slate-600 text-[10px] mt-1">
                                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <button onClick={() => markRead(n._id)} title="Mark read"
                                            className="flex-shrink-0 text-slate-500 hover:text-green-400 transition-colors mt-1">
                                            <Check size={14} />
                                        </button>
                                    )}
                                    {n.read && <div className="w-2 h-2 rounded-full bg-green-400/40 mt-2 flex-shrink-0" />}
                                </div>
                            );
                        })}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-700 text-center">
                            <p className="text-slate-500 text-xs">{notifications.length} total · {unread} unread</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
