import { useAuth } from '../context/AuthContext';
import ManagerDashboard from './ManagerDashboard';
import DispatcherDashboard from './DispatcherDashboard';
import DriverDashboard from './DriverDashboard';

/**
 * Smart dashboard router — renders the correct role-specific dashboard.
 * Manager    → ManagerDashboard    (fleet overview, profit charts, approval panel)
 * Dispatcher → DispatcherDashboard (live trips queue, vehicle status, dispatch CTA)
 * Driver     → DriverDashboard     (personal rides, earnings, weekly chart, notifications)
 */
export default function Dashboard() {
    const { user } = useAuth();

    if (user?.role === 'Manager') return <ManagerDashboard user={user} />;
    if (user?.role === 'Dispatcher') return <DispatcherDashboard user={user} />;
    if (user?.role === 'Driver') return <DriverDashboard user={user} />;

    return <div className="text-slate-400 p-8">Unknown role. Contact your administrator.</div>;
}
