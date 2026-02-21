import { useAuth } from '../context/AuthContext';
import ManagerDashboard from './ManagerDashboard';
import DispatcherDashboard from './DispatcherDashboard';
import DriverDashboard from './DriverDashboard';
import AdminDashboard from './AdminDashboard';
import SafetyDashboard from './SafetyDashboard';
import FinancialDashboard from './FinancialDashboard';

export default function Dashboard() {
    const { user } = useAuth();

    if (user?.role === 'Admin') return <AdminDashboard user={user} />;
    if (user?.role === 'Manager') return <ManagerDashboard user={user} />;
    if (user?.role === 'Dispatcher') return <DispatcherDashboard user={user} />;
    if (user?.role === 'Driver') return <DriverDashboard user={user} />;
    if (user?.role === 'Safety Officer') return <SafetyDashboard user={user} />;
    if (user?.role === 'Financial Analyst') return <FinancialDashboard user={user} />;

    return <div className="text-slate-400 p-8">Unknown role. Contact your administrator.</div>;
}
