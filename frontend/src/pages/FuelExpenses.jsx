import { useEffect, useState } from 'react';
import { Plus, X, Fuel } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const emptyForm = { vehicleId: '', liters: '', fuelCost: '', maintenanceCost: '0', kmDriven: '', notes: '' };

function Modal({ vehicles, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const totalCost = (parseFloat(form.fuelCost) || 0) + (parseFloat(form.maintenanceCost) || 0);
    const efficiency = form.liters > 0 && form.kmDriven > 0
        ? (parseFloat(form.kmDriven) / parseFloat(form.liters)).toFixed(2) : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl fade-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <h2 className="text-white font-semibold text-lg">Add Fuel / Expense Log</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Vehicle*</label>
                        <select value={form.vehicleId} onChange={f('vehicleId')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} — {v.licensePlate}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Liters*</label>
                            <input type="number" value={form.liters} onChange={f('liters')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">KM Driven</label>
                            <input type="number" value={form.kmDriven} onChange={f('kmDriven')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Fuel Cost (₹)*</label>
                            <input type="number" value={form.fuelCost} onChange={f('fuelCost')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Maintenance Cost (₹)</label>
                            <input type="number" value={form.maintenanceCost} onChange={f('maintenanceCost')} className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Notes</label>
                        <input value={form.notes} onChange={f('notes')} placeholder="Optional notes" className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                    </div>

                    {/* Auto-calculated preview */}
                    <div className="bg-slate-900 rounded-lg p-3 flex gap-6 text-sm">
                        <div>
                            <p className="text-slate-500">Total Cost</p>
                            <p className="text-white font-semibold">₹{totalCost.toLocaleString()}</p>
                        </div>
                        {efficiency && (
                            <div>
                                <p className="text-slate-500">Fuel Efficiency</p>
                                <p className="text-green-400 font-semibold">{efficiency} km/L</p>
                            </div>
                        )}
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

export default function FuelExpenses() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const load = async () => {
        const [l, v] = await Promise.all([api.get('/fuel'), api.get('/vehicles')]);
        setLogs(l.data); setVehicles(v.data);
    };
    useEffect(() => { load().catch(() => { }); }, []);

    const save = async (form) => {
        try {
            await api.post('/fuel', form);
            toast.success('Fuel log added!');
            setShowModal(false); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const totals = logs.reduce((acc, l) => ({
        fuel: acc.fuel + (l.fuelCost || 0),
        maintenance: acc.maintenance + (l.maintenanceCost || 0),
        total: acc.total + (l.totalCost || 0),
        liters: acc.liters + (l.liters || 0),
    }), { fuel: 0, maintenance: 0, total: 0, liters: 0 });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Fuel & Expenses</h1>
                    <p className="text-slate-400 text-sm mt-1">{logs.length} expense records</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Log
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fuel Cost', value: `₹${totals.fuel.toLocaleString()}`, color: 'text-orange-400' },
                    { label: 'Total Maintenance', value: `₹${totals.maintenance.toLocaleString()}`, color: 'text-amber-400' },
                    { label: 'Total Expenses', value: `₹${totals.total.toLocaleString()}`, color: 'text-red-400' },
                    { label: 'Total Fuel (L)', value: `${totals.liters.toLocaleString()}L`, color: 'text-blue-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <p className="text-slate-400 text-xs">{label}</p>
                        <p className={`${color} text-xl font-bold mt-1`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {['Vehicle', 'Liters', 'Fuel Cost', 'Maint. Cost', 'Total', 'Efficiency', 'Date'].map(h => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {logs.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-12">No fuel logs yet</td></tr>}
                        {logs.map(l => (
                            <tr key={l._id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Fuel size={14} className="text-orange-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-white text-sm font-medium">{l.vehicleId?.name ?? '—'}</p>
                                            <p className="text-slate-500 text-xs">{l.vehicleId?.licensePlate}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-sm">{l.liters}L</td>
                                <td className="px-4 py-3 text-slate-300 text-sm">₹{l.fuelCost?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-slate-300 text-sm">₹{l.maintenanceCost?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-white font-semibold text-sm">₹{l.totalCost?.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    {l.fuelEfficiency ? (
                                        <span className="text-green-400 text-sm">{l.fuelEfficiency} km/L</span>
                                    ) : <span className="text-slate-600 text-sm">—</span>}
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-sm">{new Date(l.date).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && <Modal vehicles={vehicles} onClose={() => setShowModal(false)} onSave={save} />}
        </div>
    );
}
