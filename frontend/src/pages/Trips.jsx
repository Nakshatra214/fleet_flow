import { useEffect, useState } from 'react';
import { Plus, X, CheckCircle, XCircle, ChevronRight, Package, AlertTriangle, Route } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const statusColors = {
    'Draft': 'text-gray-500 bg-gray-100 border-gray-200',
    'Dispatched': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'Completed': 'text-green-600 bg-green-50 border-green-200',
    'Cancelled': 'text-red-500 bg-red-50 border-red-200',
};

const nextStatus = { 'Draft': 'Dispatched', 'Dispatched': 'Completed' };

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

function CreateModal({ vehicles, drivers, onClose, onSave }) {
    const [vehicleId, setVehicleId] = useState('');
    const [driverId, setDriverId] = useState('');
    const [cargoWeight, setCargoWeight] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [revenue, setRevenue] = useState('');
    const [driverPay, setDriverPay] = useState('');
    const [distanceKm, setDistanceKm] = useState('');
    const [loading, setLoading] = useState(false);

    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const selectedVehicle = availableVehicles.find(v => v._id === vehicleId);
    const capacityWarning =
        selectedVehicle && cargoWeight && Number(cargoWeight) > selectedVehicle.capacity
            ? `⚠️ ${cargoWeight}kg exceeds vehicle capacity (${selectedVehicle.capacity}kg)`
            : '';
    const selectedDriver = drivers.find(d => d._id === driverId);
    const licenseExpired = selectedDriver && new Date(selectedDriver.licenseExpiry) < new Date();

    const handleSave = async () => {
        if (!vehicleId || !driverId || !cargoWeight || !origin || !destination) {
            toast.error('Please fill all required fields (*)'); return;
        }
        if (capacityWarning) { toast.error('Resolve cargo weight before saving'); return; }
        if (licenseExpired) { toast.error('Cannot use driver with expired license'); return; }
        setLoading(true);
        try {
            await onSave({ vehicleId, driverId, cargoWeight: Number(cargoWeight), origin, destination, revenue: Number(revenue) || 0, driverPay: Number(driverPay) || 0, distanceKm: Number(distanceKm) || 0, status: 'Draft' });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg shadow-2xl shadow-gray-200/80">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
                            <Route size={16} className="text-white" />
                        </div>
                        <h2 className="text-gray-800 font-semibold text-lg">Create New Trip</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                            Vehicle* <span className="text-gray-400 text-xs normal-case font-normal">(Available only)</span>
                        </label>
                        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={selectCls}>
                            <option value="">Select a vehicle</option>
                            {availableVehicles.length === 0 && <option disabled>No available vehicles</option>}
                            {availableVehicles.map(v => (
                                <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} · Cap: {v.capacity}kg</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Driver*</label>
                        <select value={driverId} onChange={e => setDriverId(e.target.value)} className={selectCls}>
                            <option value="">Select a driver</option>
                            {drivers.map(d => (
                                <option key={d._id} value={d._id}>{d.name} — Score: {d.safetyScore} · License: {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}</option>
                            ))}
                        </select>
                        {licenseExpired && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12} /> This driver's license is expired!</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Origin*</label>
                            <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Mumbai" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Destination*</label>
                            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Surat" className={inputCls} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Cargo (kg)*</label>
                            <input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} min="0" placeholder="0"
                                className={`w-full bg-gray-50 border ${capacityWarning ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'} text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all`} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Dist. (km)</label>
                            <input type="number" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} min="0" placeholder="0" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Rev. (₹)</label>
                            <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} min="0" placeholder="0" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Driver Pay (₹)</label>
                            <input type="number" value={driverPay} onChange={e => setDriverPay(e.target.value)} min="0" placeholder="0" className={inputCls} />
                        </div>
                    </div>
                    {capacityWarning && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-600 text-sm">
                            <XCircle size={16} className="flex-shrink-0" /><span>{capacityWarning}</span>
                        </div>
                    )}
                    {selectedVehicle && !capacityWarning && cargoWeight && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-green-600 text-sm">
                            <CheckCircle size={14} className="flex-shrink-0" /><span>Cargo fits! {cargoWeight}kg / {selectedVehicle.capacity}kg capacity</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={loading || !!capacityWarning}
                        className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow shadow-indigo-200">
                        {loading ? 'Creating…' : 'Create Trip'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Trips() {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [confirmCancelId, setConfirmCancelId] = useState(null);

    const load = async () => {
        const [t, v, d] = await Promise.all([api.get('/trips'), api.get('/vehicles'), api.get('/drivers')]);
        setTrips(t.data); setVehicles(v.data); setDrivers(d.data);
    };
    useEffect(() => { load().catch(() => { }); }, []);

    const save = async (form) => {
        try {
            await api.post('/trips', form);
            toast.success('✅ Trip created! Vehicle marked On Trip.');
            setShowModal(false); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create trip'); }
    };

    const advanceStatus = async (trip) => {
        const next = nextStatus[trip.status];
        if (!next) return;
        try {
            await api.put(`/trips/${trip._id}`, { status: next });
            toast.success(next === 'Completed' ? '✅ Trip Completed! Vehicle is now Available.' : '🚛 Trip Dispatched.');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    };

    const cancel = async (id) => {
        try {
            await api.put(`/trips/${id}`, { status: 'Cancelled' });
            toast.success('Trip cancelled. Vehicle now Available.');
            setConfirmCancelId(null); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); setConfirmCancelId(null); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                        <Route size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Trip Management</h1>
                        <p className="text-gray-400 text-sm">{trips.length} total trips</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow shadow-indigo-200">
                    <Plus size={16} /> New Trip
                </button>
            </div>

            {/* Trip cards */}
            <div className="space-y-3">
                {trips.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Package size={26} className="text-indigo-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No trips yet. Click <strong className="text-indigo-600">New Trip</strong> to create one.</p>
                    </div>
                )}
                {trips.map(t => (
                    <div key={t._id} className="bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-md rounded-2xl p-4 transition-all shadow-sm">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[t.status]}`}>{t.status}</span>
                                    <span className="text-gray-800 font-semibold text-sm truncate">
                                        {t.vehicleId?.name ?? '—'} <span className="text-gray-400 font-normal">via</span> {t.driverId?.name ?? '—'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm flex-wrap">
                                    <span className="font-semibold text-gray-700">{t.origin}</span>
                                    <ChevronRight size={14} className="text-gray-400" />
                                    <span className="font-semibold text-gray-700">{t.destination}</span>
                                    <span className="text-gray-300">·</span>
                                    <span className="flex items-center gap-1 text-gray-500"><Package size={12} />{t.cargoWeight} kg</span>
                                    {t.revenue > 0 && user?.role !== 'Driver' && <><span className="text-gray-300">·</span><span className="text-green-600 font-semibold">Rev: ₹{t.revenue?.toLocaleString()}</span></>}
                                    {t.driverPay > 0 && <><span className="text-gray-300">·</span><span className="text-indigo-600 font-semibold">Pay: ₹{t.driverPay?.toLocaleString()}</span></>}
                                </div>
                                <p className="text-gray-400 text-xs mt-1">
                                    {new Date(t.date || t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {t.status === 'Draft' && user?.role !== 'Driver' && (
                                    <button onClick={() => advanceStatus(t)}
                                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                                        <CheckCircle size={13} /> Dispatch
                                    </button>
                                )}
                                {t.status === 'Dispatched' && user?.role === 'Driver' && (
                                    <button onClick={() => advanceStatus(t)}
                                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                                        <CheckCircle size={13} /> Complete
                                    </button>
                                )}
                                {(t.status === 'Draft' || t.status === 'Dispatched') && user?.role !== 'Driver' && (
                                    confirmCancelId === t._id ? (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-red-500 text-xs font-semibold">Confirm cancel?</span>
                                            <button onClick={() => cancel(t._id)} className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors">Yes</button>
                                            <button onClick={() => setConfirmCancelId(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-xs transition-colors">No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmCancelId(t._id)}
                                            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                                            <XCircle size={13} /> Cancel
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && <CreateModal vehicles={vehicles} drivers={drivers} onClose={() => setShowModal(false)} onSave={save} />}
        </div>
    );
}
