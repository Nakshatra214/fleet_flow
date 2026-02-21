import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, User, X, AlertCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'On Duty': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Off Duty': 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

const empty = { name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', status: 'Off Duty', safetyScore: 100, tripCompletionRate: 0 };

function isExpired(date) { return new Date(date) < new Date(); }
function expiresSoon(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
}

function Modal({ title, data, onClose, onSave }) {
    const [form, setForm] = useState({ ...data, licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry).toISOString().split('T')[0] : '' });
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
                        {[['Full Name*', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'text'], ['License No.*', 'licenseNumber', 'text']].map(([lbl, k, t]) => (
                            <div key={k}>
                                <label className="text-slate-300 text-sm block mb-1.5">{lbl}</label>
                                <input type={t} value={form[k]} onChange={f(k)} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">License Expiry*</label>
                            <input type="date" value={form.licenseExpiry} onChange={f('licenseExpiry')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Status</label>
                            <select value={form.status} onChange={f('status')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                                {['On Duty', 'Off Duty'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Safety Score (0-100)</label>
                            <input type="number" min="0" max="100" value={form.safetyScore} onChange={f('safetyScore')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Trip Completion %</label>
                            <input type="number" min="0" max="100" value={form.tripCompletionRate} onChange={f('tripCompletionRate')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-slate-700 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:text-white">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Save Driver</button>
                </div>
            </div>
        </div>
    );
}

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState('');

    const load = () => api.get('/drivers').then(r => setDrivers(r.data)).catch(() => toast.error('Failed to load drivers'));
    useEffect(() => { load(); }, []);

    const save = async (form) => {
        try {
            if (modal.mode === 'add') await api.post('/drivers', form);
            else await api.put(`/drivers/${modal.data._id}`, form);
            toast.success(modal.mode === 'add' ? 'Driver added!' : 'Driver updated!');
            setModal(null); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this driver?')) return;
        try { await api.delete(`/drivers/${id}`); toast.success('Deleted'); load(); }
        catch { toast.error('Delete failed'); }
    };

    const filtered = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Drivers</h1>
                    <p className="text-slate-400 text-sm mt-1">{drivers.length} drivers registered</p>
                </div>
                <button onClick={() => setModal({ mode: 'add', data: empty })} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Driver
                </button>
            </div>

            <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full max-w-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {['Driver', 'License', 'Expiry', 'Safety Score', 'Completion', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-12">No drivers found</td></tr>}
                        {filtered.map(d => {
                            const expired = isExpired(d.licenseExpiry);
                            const soon = expiresSoon(d.licenseExpiry);
                            return (
                                <tr key={d._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{d.name.charAt(0)}</div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{d.name}</p>
                                                <p className="text-slate-500 text-xs">{d.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-sm font-mono">{d.licenseNumber}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {(expired || soon) && <AlertCircle size={14} className={expired ? 'text-red-400' : 'text-amber-400'} />}
                                            <span className={`text-sm ${expired ? 'text-red-400' : soon ? 'text-amber-400' : 'text-slate-300'}`}>
                                                {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        {expired && <p className="text-red-400 text-xs">EXPIRED</p>}
                                        {soon && !expired && <p className="text-amber-400 text-xs">Expires soon</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${d.safetyScore}%` }} />
                                            </div>
                                            <span className="text-slate-300 text-sm">{d.safetyScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 text-sm">{d.tripCompletionRate}%</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[d.status]}`}>{d.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setModal({ mode: 'edit', data: d })} className="text-slate-400 hover:text-indigo-400 transition-colors"><Pencil size={15} /></button>
                                            <button onClick={() => remove(d._id)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {modal && <Modal title={modal.mode === 'add' ? 'Add Driver' : 'Edit Driver'} data={modal.data} onClose={() => setModal(null)} onSave={save} />}
        </div>
    );
}
