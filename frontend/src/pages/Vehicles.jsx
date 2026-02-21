import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Truck, X } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'Available': 'text-green-400 bg-green-400/10 border-green-400/30',
    'On Trip': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
    'In Shop': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
};

const empty = { name: '', model: '', licensePlate: '', capacity: '', odometer: '', status: 'Available', fuelType: 'Diesel', year: '' };

function Modal({ title, data, onClose, onSave }) {
    const [form, setForm] = useState(data);
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl fade-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <h2 className="text-white font-semibold text-lg">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[['Vehicle Name*', 'name', 'text'], ['Model*', 'model', 'text'], ['License Plate*', 'licensePlate', 'text'], ['Year', 'year', 'number']].map(([lbl, k, t]) => (
                            <div key={k}>
                                <label className="text-slate-300 text-sm block mb-1.5">{lbl}</label>
                                <input type={t} value={form[k]} onChange={f(k)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Capacity (kg)*</label>
                            <input type="number" value={form.capacity} onChange={f('capacity')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Odometer (km)</label>
                            <input type="number" value={form.odometer} onChange={f('odometer')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Status</label>
                            <select value={form.status} onChange={f('status')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                                {['Available', 'On Trip', 'In Shop'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Fuel Type</label>
                            <select value={form.fuelType} onChange={f('fuelType')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                                {['Diesel', 'Petrol', 'Electric', 'CNG'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-slate-700 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Save Vehicle</button>
                </div>
            </div>
        </div>
    );
}

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [modal, setModal] = useState(null); // null | {mode:'add'|'edit', data}
    const [search, setSearch] = useState('');

    const load = () => api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => toast.error('Failed to load vehicles'));
    useEffect(() => { load(); }, []);

    const save = async (form) => {
        try {
            if (modal.mode === 'add') await api.post('/vehicles', form);
            else await api.put(`/vehicles/${modal.data._id}`, form);
            toast.success(modal.mode === 'add' ? 'Vehicle added!' : 'Vehicle updated!');
            setModal(null);
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this vehicle?')) return;
        try { await api.delete(`/vehicles/${id}`); toast.success('Deleted'); load(); }
        catch { toast.error('Delete failed'); }
    };

    const filtered = vehicles.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Vehicles</h1>
                    <p className="text-slate-400 text-sm mt-1">{vehicles.length} vehicles in fleet</p>
                </div>
                <button onClick={() => setModal({ mode: 'add', data: empty })} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Vehicle
                </button>
            </div>

            {/* Search */}
            <input type="text" placeholder="Search by name or license plate..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full max-w-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />

            {/* Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700 text-left">
                            {['Vehicle', 'License Plate', 'Capacity', 'Odometer', 'Fuel', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} className="text-center text-slate-500 py-12">No vehicles found</td></tr>
                        )}
                        {filtered.map(v => (
                            <tr key={v._id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Truck size={14} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{v.name}</p>
                                            <p className="text-slate-500 text-xs">{v.model}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-sm font-mono">{v.licensePlate}</td>
                                <td className="px-4 py-3 text-slate-300 text-sm">{v.capacity} kg</td>
                                <td className="px-4 py-3 text-slate-300 text-sm">{v.odometer?.toLocaleString()} km</td>
                                <td className="px-4 py-3 text-slate-400 text-sm">{v.fuelType}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[v.status]}`}>{v.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setModal({ mode: 'edit', data: v })} className="text-slate-400 hover:text-indigo-400 transition-colors"><Pencil size={15} /></button>
                                        <button onClick={() => remove(v._id)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal && <Modal title={modal.mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'} data={modal.data} onClose={() => setModal(null)} onSave={save} />}
        </div>
    );
}
