import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Truck, AlertTriangle, CheckCircle, X } from 'lucide-react';
import api from '../api';

const typeConfig = {
    trip_assigned: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    trip_dispatched: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    trip_completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    general: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
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

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, []);

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
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
            >
                <Bell size={17} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Bell size={15} className="text-indigo-500" />
                            <h3 className="text-gray-700 font-semibold text-sm">Notifications</h3>
                            {unread > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button onClick={markAllRead} title="Mark all read"
                                    className="text-gray-400 hover:text-indigo-500 transition-colors">
                                    <CheckCheck size={15} />
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-2">
                                    <Bell size={20} className="opacity-40" />
                                </div>
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                        {notifications.map(n => {
                            const { icon: Icon, color, bg } = typeConfig[n.type] || typeConfig.general;
                            return (
                                <div key={n._id}
                                    className={`flex gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${bg}`}>
                                        <Icon size={14} className={color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 text-xs font-semibold">{n.title}</p>
                                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                                        <p className="text-gray-300 text-[10px] mt-1">
                                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <button onClick={() => markRead(n._id)} title="Mark read"
                                            className="flex-shrink-0 text-gray-400 hover:text-green-500 transition-colors mt-1">
                                            <Check size={14} />
                                        </button>
                                    )}
                                    {n.read && <div className="w-2 h-2 rounded-full bg-green-400/50 mt-2 flex-shrink-0" />}
                                </div>
                            );
                        })}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                            <p className="text-gray-400 text-xs">{notifications.length} total · {unread} unread</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
