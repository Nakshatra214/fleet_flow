import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, X, AlertCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusColors = {
    'On Duty': 'text-green-600 bg-green-50 border-green-200',
    'Off Duty': 'text-gray-500 bg-gray-100 border-gray-200',
};

const empty = { name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', status: 'Off Duty', safetyScore: 100, tripCompletionRate: 0 };

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

function isExpired(date) { return new Date(date) < new Date(); }
function expiresSoon(date) {
    const d = new Date(date), now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
}

function Modal({ title, data, onClose, onSave }) {
    const [form, setForm] = useState({ ...data, licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry).toISOString().split('T')[0] : '' });
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg shadow-2xl shadow-gray-200/80 fade-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
                            <Users size={16} className="text-white" />
                        </div>
                        <h2 className="text-gray-800 font-semibold text-lg">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[['Full Name*', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'text'], ['License No.*', 'licenseNumber', 'text']].map(([lbl, k, t]) => (
                            <div key={k}>
                                <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">{lbl}</label>
                                <input type={t} value={form[k]} onChange={f(k)} className={inputCls} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">License Expiry*</label>
                            <input type="date" value={form.licenseExpiry} onChange={f('licenseExpiry')} className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Status</label>
                            <select value={form.status} onChange={f('status')} className={selectCls}>
                                {['On Duty', 'Off Duty'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Safety Score (0-100)</label>
                            <input type="number" min="0" max="100" value={form.safetyScore} onChange={f('safetyScore')} className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Trip Completion %</label>
                            <input type="number" min="0" max="100" value={form.tripCompletionRate} onChange={f('tripCompletionRate')} className={inputCls} />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-all">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow shadow-indigo-200">Save Driver</button>
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
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Drivers</h1>
                        <p className="text-gray-400 text-sm">{drivers.length} drivers registered</p>
                    </div>
                </div>
                <button onClick={() => setModal({ mode: 'add', data: empty })}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow shadow-indigo-200">
                    <Plus size={16} /> Add Driver
                </button>
            </div>

            {/* Search */}
            <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full max-w-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm" />

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                            {['Driver', 'License', 'Expiry', 'Safety Score', 'Completion', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-14">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                        <Users size={22} className="text-indigo-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No drivers found</p>
                                </div>
                            </td></tr>
                        )}
                        {filtered.map(d => {
                            const expired = isExpired(d.licenseExpiry);
                            const soon = expiresSoon(d.licenseExpiry);
                            return (
                                <tr key={d._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow shadow-indigo-200">
                                                {d.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-gray-800 text-sm font-semibold">{d.name}</p>
                                                <p className="text-gray-400 text-xs">{d.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-600 text-sm font-mono">{d.licenseNumber}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            {(expired || soon) && <AlertCircle size={14} className={expired ? 'text-red-500' : 'text-amber-500'} />}
                                            <span className={`text-sm ${expired ? 'text-red-500' : soon ? 'text-amber-500' : 'text-gray-600'}`}>
                                                {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        {expired && <p className="text-red-500 text-xs font-semibold">EXPIRED</p>}
                                        {soon && !expired && <p className="text-amber-500 text-xs">Expires soon</p>}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${d.safetyScore}%` }} />
                                            </div>
                                            <span className="text-gray-700 text-sm font-medium">{d.safetyScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-700 text-sm font-medium">{d.tripCompletionRate}%</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusColors[d.status]}`}>{d.status}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setModal({ mode: 'edit', data: d })}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => remove(d._id)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
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
