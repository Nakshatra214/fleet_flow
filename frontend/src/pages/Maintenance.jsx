import { useEffect, useState } from 'react';
import { Plus, X, Wrench, CheckCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'Scheduled': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    'In Shop': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    'Completed': 'text-green-400 bg-green-400/10 border-green-400/30',
};

const emptyForm = { vehicleId: '', serviceType: '', description: '', cost: '', status: 'In Shop' };

function Modal({ vehicles, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl fade-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <h2 className="text-white font-semibold text-lg">Add Maintenance Log</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Vehicle*</label>
                        <select value={form.vehicleId} onChange={f('vehicleId')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} ({v.status})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Service Type*</label>
                            <input value={form.serviceType} onChange={f('serviceType')} placeholder="e.g. Oil Change" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Cost (₹)</label>
                            <input type="number" value={form.cost} onChange={f('cost')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Description</label>
                        <textarea value={form.description} onChange={f('description')} rows={2} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                    </div>
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Status</label>
                        <select value={form.status} onChange={f('status')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                            {['Scheduled', 'In Shop', 'Completed'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <p className="text-slate-500 text-xs mt-1">Selecting "In Shop" will automatically mark the vehicle as In Shop</p>
                    </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-slate-700 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:text-white">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium">Save Log</button>
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Maintenance</h1>
                    <p className="text-slate-400 text-sm mt-1">{logs.length} maintenance records</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Log
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {['Vehicle', 'Service', 'Description', 'Cost', 'Date', 'Status', 'Action'].map(h => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {logs.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-12">No maintenance logs</td></tr>}
                        {logs.map(l => (
                            <tr key={l._id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Wrench size={14} className="text-amber-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-white text-sm font-medium">{l.vehicleId?.name ?? '—'}</p>
                                            <p className="text-slate-500 text-xs">{l.vehicleId?.licensePlate}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-white text-sm font-medium">{l.serviceType}</td>
                                <td className="px-4 py-3 text-slate-400 text-sm max-w-xs truncate">{l.description || '—'}</td>
                                <td className="px-4 py-3 text-slate-300 text-sm">₹{(l.cost || 0).toLocaleString()}</td>
                                <td className="px-4 py-3 text-slate-400 text-sm">{new Date(l.date).toLocaleDateString('en-IN')}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[l.status]}`}>{l.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {l.status !== 'Completed' && (
                                        <button onClick={() => complete(l._id)} className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs border border-green-400/30 rounded-lg px-2.5 py-1 transition-colors">
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
