import { useEffect, useState } from 'react';
import { Plus, X, CheckCircle, XCircle, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'Draft': 'text-slate-400 bg-slate-400/10 border-slate-400/30',
    'Dispatched': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
    'Completed': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Cancelled': 'text-red-400 bg-red-400/10 border-red-400/30',
};

const nextStatus = { 'Draft': 'Dispatched', 'Dispatched': 'Completed' };

function CreateModal({ vehicles, drivers, onClose, onSave }) {
    const [vehicleId, setVehicleId] = useState('');
    const [driverId, setDriverId] = useState('');
    const [cargoWeight, setCargoWeight] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [revenue, setRevenue] = useState('');
    const [distanceKm, setDistanceKm] = useState('');
    const [loading, setLoading] = useState(false);

    // Available vehicles only
    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const selectedVehicle = availableVehicles.find(v => v._id === vehicleId);

    // Capacity warning – computed inline, no effect needed
    const capacityWarning =
        selectedVehicle && cargoWeight && Number(cargoWeight) > selectedVehicle.capacity
            ? `⚠️ ${cargoWeight}kg exceeds vehicle capacity (${selectedVehicle.capacity}kg)`
            : '';

    // Driver license warning
    const selectedDriver = drivers.find(d => d._id === driverId);
    const licenseExpired = selectedDriver && new Date(selectedDriver.licenseExpiry) < new Date();

    const handleSave = async () => {
        if (!vehicleId || !driverId || !cargoWeight || !origin || !destination) {
            toast.error('Please fill all required fields (*)');
            return;
        }
        if (capacityWarning) { toast.error('Resolve cargo weight before saving'); return; }
        if (licenseExpired) { toast.error('Cannot use driver with expired license'); return; }

        setLoading(true);
        try {
            await onSave({ vehicleId, driverId, cargoWeight: Number(cargoWeight), origin, destination, revenue: Number(revenue) || 0, distanceKm: Number(distanceKm) || 0, status: 'Draft' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                    <h2 className="text-white font-semibold text-lg">Create New Trip</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Vehicle */}
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Vehicle* <span className="text-slate-500 text-xs ml-1">(Available only)</span></label>
                        <select
                            value={vehicleId}
                            onChange={e => setVehicleId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">Select a vehicle</option>
                            {availableVehicles.length === 0 && <option disabled>No available vehicles</option>}
                            {availableVehicles.map(v => (
                                <option key={v._id} value={v._id}>
                                    {v.name} — {v.licensePlate} · Cap: {v.capacity}kg
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Driver */}
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Driver*</label>
                        <select
                            value={driverId}
                            onChange={e => setDriverId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">Select a driver</option>
                            {drivers.map(d => (
                                <option key={d._id} value={d._id}>
                                    {d.name} — Score: {d.safetyScore} · License: {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                                </option>
                            ))}
                        </select>
                        {licenseExpired && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12} /> This driver's license is expired!</p>
                        )}
                    </div>

                    {/* Origin / Destination */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Origin*</label>
                            <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Mumbai"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Destination*</label>
                            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Surat"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    {/* Cargo / Distance / Revenue */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Cargo (kg)*</label>
                            <input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} min="0" placeholder="0"
                                className={`w-full bg-slate-900 border ${capacityWarning ? 'border-red-500' : 'border-slate-600'} text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500`} />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Distance (km)</label>
                            <input type="number" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} min="0" placeholder="0"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Revenue (₹)</label>
                            <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} min="0" placeholder="0"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    {/* Warnings */}
                    {capacityWarning && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-sm">
                            <XCircle size={16} className="flex-shrink-0" />
                            <span>{capacityWarning}</span>
                        </div>
                    )}
                    {selectedVehicle && !capacityWarning && cargoWeight && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2.5 text-green-400 text-sm">
                            <CheckCircle size={14} className="flex-shrink-0" />
                            <span>Cargo fits! {cargoWeight}kg / {selectedVehicle.capacity}kg capacity</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t border-slate-700 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !!capacityWarning}
                        className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Creating…' : 'Create Trip'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const load = async () => {
        const [t, v, d] = await Promise.all([api.get('/trips'), api.get('/vehicles'), api.get('/drivers')]);
        setTrips(t.data); setVehicles(v.data); setDrivers(d.data);
    };
    useEffect(() => { load().catch(() => { }); }, []);

    const save = async (form) => {
        try {
            await api.post('/trips', form);
            toast.success('✅ Trip created! Vehicle marked On Trip.');
            setShowModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create trip');
        }
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
        if (!window.confirm('Cancel this trip?')) return;
        try {
            await api.put(`/trips/${id}`, { status: 'Cancelled' });
            toast.success('Trip cancelled. Vehicle now Available.');
            load();
        } catch { toast.error('Cancel failed'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Trip Management</h1>
                    <p className="text-slate-400 text-sm mt-0.5">{trips.length} total trips</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={16} /> New Trip
                </button>
            </div>

            <div className="space-y-3">
                {trips.length === 0 && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                        <Package size={40} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-500">No trips yet. Click <strong className="text-slate-400">New Trip</strong> to create one.</p>
                    </div>
                )}
                {trips.map(t => (
                    <div key={t._id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[t.status]}`}>{t.status}</span>
                                    <span className="text-white font-medium text-sm truncate">
                                        {t.vehicleId?.name ?? '—'} <span className="text-slate-500">via</span> {t.driverId?.name ?? '—'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm flex-wrap">
                                    <span className="font-medium text-slate-300">{t.origin}</span>
                                    <ChevronRight size={14} />
                                    <span className="font-medium text-slate-300">{t.destination}</span>
                                    <span className="text-slate-600">·</span>
                                    <span className="flex items-center gap-1"><Package size={12} />{t.cargoWeight} kg</span>
                                    {t.revenue > 0 && <><span className="text-slate-600">·</span><span className="text-green-400 font-medium">₹{t.revenue?.toLocaleString()}</span></>}
                                </div>
                                <p className="text-slate-600 text-xs mt-1">
                                    {new Date(t.date || t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {nextStatus[t.status] && (
                                    <button
                                        onClick={() => advanceStatus(t)}
                                        className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <CheckCircle size={13} /> {nextStatus[t.status]}
                                    </button>
                                )}
                                {(t.status === 'Draft' || t.status === 'Dispatched') && (
                                    <button
                                        onClick={() => cancel(t._id)}
                                        className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <XCircle size={13} /> Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <CreateModal
                    vehicles={vehicles}
                    drivers={drivers}
                    onClose={() => setShowModal(false)}
                    onSave={save}
                />
            )}
        </div>
    );
}
