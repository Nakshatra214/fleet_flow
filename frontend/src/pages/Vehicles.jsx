import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Truck, X } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'Available': 'text-green-600 bg-green-50 border-green-200',
    'On Trip': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'In Shop': 'text-amber-600 bg-amber-50 border-amber-200',
};

const empty = { name: '', model: '', licensePlate: '', capacity: '', odometer: '', status: 'Available', fuelType: 'Diesel', year: '' };

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

function Modal({ title, data, onClose, onSave }) {
    const [form, setForm] = useState(data);
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg shadow-2xl shadow-gray-200/80 fade-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
                            <Truck size={16} className="text-white" />
                        </div>
                        <h2 className="text-gray-800 font-semibold text-lg">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[['Vehicle Name*', 'name', 'text'], ['Model*', 'model', 'text'], ['License Plate*', 'licensePlate', 'text'], ['Year', 'year', 'number']].map(([lbl, k, t]) => (
                            <div key={k}>
                                <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">{lbl}</label>
                                <input type={t} value={form[k]} onChange={f(k)} className={inputCls} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Capacity (kg)*</label>
                            <input type="number" value={form.capacity} onChange={f('capacity')} className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Odometer (km)</label>
                            <input type="number" value={form.odometer} onChange={f('odometer')} className={inputCls} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Status</label>
                            <select value={form.status} onChange={f('status')} className={selectCls}>
                                {['Available', 'On Trip', 'In Shop'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Fuel Type</label>
                            <select value={form.fuelType} onChange={f('fuelType')} className={selectCls}>
                                {['Diesel', 'Petrol', 'Electric', 'CNG'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-white transition-all">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow shadow-indigo-200">Save Vehicle</button>
                </div>
            </div>
        </div>
    );
}

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');

    const load = () => api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => toast.error('Failed to load vehicles'));
    useEffect(() => { load(); }, []);

    const save = async (form) => {
        try {
            if (modal.mode === 'add') await api.post('/vehicles', form);
            else await api.put(`/vehicles/${modal.data._id}`, form);
            toast.success(modal.mode === 'add' ? 'Vehicle added!' : 'Vehicle updated!');
            setModal(null); load();
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
            {/* Page header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                        <Truck size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vehicles</h1>
                        <p className="text-gray-400 text-sm">{vehicles.length} vehicles in fleet</p>
                    </div>
                </div>
                <button onClick={() => setModal({ mode: 'add', data: empty })}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow shadow-indigo-200">
                    <Plus size={16} /> Add Vehicle
                </button>
            </div>

            {/* Search */}
            <input type="text" placeholder="Search by name or license plate..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full max-w-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm" />

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                            {['Vehicle', 'License Plate', 'Capacity', 'Odometer', 'Fuel', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} className="text-center text-gray-400 py-14">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                        <Truck size={22} className="text-indigo-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No vehicles found</p>
                                </div>
                            </td></tr>
                        )}
                        {filtered.map(v => (
                            <tr key={v._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Truck size={15} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-gray-800 text-sm font-semibold">{v.name}</p>
                                            <p className="text-gray-400 text-xs">{v.model}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 text-gray-700 text-sm font-mono font-medium">{v.licensePlate}</td>
                                <td className="px-4 py-3.5 text-gray-600 text-sm">{v.capacity} kg</td>
                                <td className="px-4 py-3.5 text-gray-600 text-sm">{v.odometer?.toLocaleString()} km</td>
                                <td className="px-4 py-3.5 text-gray-500 text-sm">{v.fuelType}</td>
                                <td className="px-4 py-3.5">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[v.status]}`}>{v.status}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setModal({ mode: 'edit', data: v })}
                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => remove(v._id)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
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
