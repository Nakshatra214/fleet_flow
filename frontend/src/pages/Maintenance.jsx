import { useEffect, useState } from 'react';
import { Plus, X, Wrench, CheckCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'Scheduled': 'text-blue-600 bg-blue-50 border-blue-200',
    'In Shop': 'text-amber-600 bg-amber-50 border-amber-200',
    'Completed': 'text-green-600 bg-green-50 border-green-200',
};

const emptyForm = { vehicleId: '', serviceType: '', description: '', cost: '', status: 'In Shop' };

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

function Modal({ vehicles, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg shadow-2xl shadow-gray-200/80 fade-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow">
                            <Wrench size={16} className="text-white" />
                        </div>
                        <h2 className="text-gray-800 font-semibold text-lg">Add Maintenance Log</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Vehicle*</label>
                        <select value={form.vehicleId} onChange={f('vehicleId')} className={selectCls}>
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} ({v.status})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Service Type*</label>
                            <input value={form.serviceType} onChange={f('serviceType')} placeholder="e.g. Oil Change" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Cost (₹)</label>
                            <input type="number" value={form.cost} onChange={f('cost')} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Description</label>
                        <textarea value={form.description} onChange={f('description')} rows={2}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none" />
                    </div>
                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Status</label>
                        <select value={form.status} onChange={f('status')} className={selectCls}>
                            {['Scheduled', 'In Shop', 'Completed'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <p className="text-gray-400 text-xs mt-1">Selecting "In Shop" will automatically mark the vehicle as In Shop</p>
                    </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-all">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow shadow-indigo-200">Save Log</button>
                </div>
            </div>
        </div>
    );
}

export default function Maintenance() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const load = async () => {
        const [l, v] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
        setLogs(l.data); setVehicles(v.data);
    };
    useEffect(() => { load().catch(() => { }); }, []);

    const save = async (form) => {
        try {
            await api.post('/maintenance', form);
            toast.success('Maintenance log added! Vehicle status updated.');
            setShowModal(false); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const complete = async (id) => {
        try {
            await api.put(`/maintenance/${id}`, { status: 'Completed' });
            toast.success('✅ Maintenance completed! Vehicle is now Available.');
            load();
        } catch { toast.error('Update failed'); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-amber-200">
                        <Wrench size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Maintenance</h1>
                        <p className="text-gray-400 text-sm">{logs.length} maintenance records</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow shadow-indigo-200">
                    <Plus size={16} /> Add Log
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                            {['Vehicle', 'Service', 'Description', 'Cost', 'Date', 'Status', 'Action'].map(h => (
                                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-14">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                                        <Wrench size={22} className="text-amber-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No maintenance logs</p>
                                </div>
                            </td></tr>
                        )}
                        {logs.map(l => (
                            <tr key={l._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Wrench size={14} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-gray-800 text-sm font-semibold">{l.vehicleId?.name ?? '—'}</p>
                                            <p className="text-gray-400 text-xs">{l.vehicleId?.licensePlate}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 text-gray-800 text-sm font-semibold">{l.serviceType}</td>
                                <td className="px-4 py-3.5 text-gray-500 text-sm max-w-xs truncate">{l.description || '—'}</td>
                                <td className="px-4 py-3.5 text-gray-700 text-sm font-medium">₹{(l.cost || 0).toLocaleString()}</td>
                                <td className="px-4 py-3.5 text-gray-500 text-sm">{new Date(l.date).toLocaleDateString('en-IN')}</td>
                                <td className="px-4 py-3.5">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[l.status]}`}>{l.status}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                    {l.status !== 'Completed' && (
                                        <button onClick={() => complete(l._id)}
                                            className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-xs border border-green-200 bg-green-50 hover:bg-green-100 rounded-lg px-2.5 py-1.5 transition-all font-medium">
                                            <CheckCircle size={12} /> Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && <Modal vehicles={vehicles} onClose={() => setShowModal(false)} onSave={save} />}
        </div>
    );
}
