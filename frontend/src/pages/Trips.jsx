import { useEffect, useState } from 'react';
import { Plus, X, CheckCircle, XCircle, ChevronRight, Package } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'Draft': 'text-slate-400 bg-slate-400/10 border-slate-400/30',
    'Dispatched': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
    'Completed': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Cancelled': 'text-red-400 bg-red-400/10 border-red-400/30',
};

const nextStatus = { 'Draft': 'Dispatched', 'Dispatched': 'Completed' };

const emptyForm = { vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '', revenue: '', distanceKm: '', status: 'Draft' };

function CreateModal({ vehicles, drivers, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const [warning, setWarning] = useState('');
    const f = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (k === 'vehicleId' || k === 'cargoWeight') setWarning(''); };

    const checkCapacity = () => {
        if (!form.vehicleId || !form.cargoWeight) return;
        const v = vehicles.find(v => v._id === form.vehicleId);
        if (v && parseFloat(form.cargoWeight) > v.capacity) {
            setWarning(`⚠️ Cargo (${form.cargoWeight}kg) exceeds vehicle capacity (${v.capacity}kg)`);
        } else if (v) {
            setWarning('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl fade-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <h2 className="text-white font-semibold text-lg">Create New Trip</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Vehicle*</label>
                        <select value={form.vehicleId} onChange={f('vehicleId')} onBlur={checkCapacity}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                            <option value="">Select Vehicle</option>
                            {vehicles.filter(v => v.status === 'Available').map(v => (
                                <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} ({v.capacity}kg cap)</option>
                            ))}
                        </select>
                        <p className="text-slate-500 text-xs mt-1">Only available vehicles shown</p>
                    </div>
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Driver*</label>
                        <select value={form.driverId} onChange={f('driverId')}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                            <option value="">Select Driver</option>
                            {drivers.map(d => (
                                <option key={d._id} value={d._id}>{d.name} — Safety: {d.safetyScore}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Origin*</label>
                            <input value={form.origin} onChange={f('origin')} placeholder="e.g. Mumbai" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Destination*</label>
                            <input value={form.destination} onChange={f('destination')} placeholder="e.g. Surat" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Cargo (kg)*</label>
                            <input type="number" value={form.cargoWeight} onChange={f('cargoWeight')} onBlur={checkCapacity} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Distance (km)</label>
                            <input type="number" value={form.distanceKm} onChange={f('distanceKm')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Revenue (₹)</label>
                            <input type="number" value={form.revenue} onChange={f('revenue')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    {warning && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                            <XCircle size={16} className="flex-shrink-0" /> {warning}
                        </div>
                    )}
                </div>
                <div className="flex gap-3 p-5 border-t border-slate-700 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:text-white">Cancel</button>
                    <button onClick={() => !warning && onSave(form)} disabled={!!warning}
                        className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">
                        Create Trip
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
            toast.success('Trip created! Vehicle marked On Trip.');
            setShowModal(false); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create trip'); }
    };

    const advanceStatus = async (trip) => {
        const next = nextStatus[trip.status];
        if (!next) return;
        try {
            await api.put(`/trips/${trip._id}`, { status: next });
            toast.success(`Trip ${next === 'Completed' ? '✅ Completed! Vehicle is now Available.' : 'dispatched.'}`);
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    };

    const cancel = async (id) => {
        if (!confirm('Cancel this trip?')) return;
        try { await api.put(`/trips/${id}`, { status: 'Cancelled' }); toast.success('Trip cancelled'); load(); }
        catch { toast.error('Cancel failed'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Trip Management</h1>
                    <p className="text-slate-400 text-sm mt-1">{trips.length} total trips</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> New Trip
                </button>
            </div>

            <div className="space-y-3">
                {trips.length === 0 && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
                        <Package size={40} className="mx-auto mb-3 opacity-30" />
                        No trips yet. Create your first trip!
                    </div>
                )}
                {trips.map(t => (
                    <div key={t._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[t.status]}`}>{t.status}</span>
                                    <span className="text-white font-medium text-sm">{t.vehicleId?.name ?? '—'} <span className="text-slate-500">via</span> {t.driverId?.name ?? '—'}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                                    <span>{t.origin}</span>
                                    <ChevronRight size={14} />
                                    <span>{t.destination}</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="flex items-center gap-1"><Package size={12} />{t.cargoWeight} kg</span>
                                    {t.revenue > 0 && <><span className="text-slate-600">•</span><span className="text-green-400">₹{t.revenue?.toLocaleString()}</span></>}
                                </div>
                                <p className="text-slate-600 text-xs mt-1">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {nextStatus[t.status] && (
                                    <button onClick={() => advanceStatus(t)} className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                        <CheckCircle size={13} /> {nextStatus[t.status]}
                                    </button>
                                )}
                                {(t.status === 'Draft' || t.status === 'Dispatched') && (
                                    <button onClick={() => cancel(t._id)} className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                        <XCircle size={13} /> Cancel
                                    </button>
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
