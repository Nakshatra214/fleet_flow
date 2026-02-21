import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Analytics from './pages/Analytics';

// Private route — must be logged in
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-900">
            <div className="flex flex-col items-center gap-3 text-slate-400">
                <span className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm">Loading FleetFlow…</p>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/login" replace />;
}

// Public route — logged-in users can't see login
function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/" replace /> : children;
}

// Role-based guard — redirect to dashboard if role not allowed
function RoleRoute({ children, allowedRoles }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* All roles */}
                <Route index element={<Dashboard />} />
                <Route path="trips" element={<Trips />} />

                {/* Manager + Dispatcher only */}
                <Route path="vehicles" element={<RoleRoute allowedRoles={['Manager', 'Dispatcher']}><Vehicles /></RoleRoute>} />
                <Route path="drivers" element={<RoleRoute allowedRoles={['Manager', 'Dispatcher']}><Drivers /></RoleRoute>} />
                <Route path="maintenance" element={<RoleRoute allowedRoles={['Manager', 'Dispatcher']}><Maintenance /></RoleRoute>} />
                <Route path="fuel" element={<RoleRoute allowedRoles={['Manager', 'Dispatcher']}><FuelExpenses /></RoleRoute>} />

                {/* Manager only */}
                <Route path="analytics" element={<RoleRoute allowedRoles={['Manager']}><Analytics /></RoleRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '12px' },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
                        duration: 4000,
                    }}
                />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
