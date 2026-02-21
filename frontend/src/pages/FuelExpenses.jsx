import { useEffect, useState } from 'react';
import { Plus, X, Fuel } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

// Indian fuel prices (approximate, Feb 2026 — can be updated)
// In a real app these would come from an API like petroleum.nic.in
const FUEL_PRICES = {
    Diesel: 90.0,     // ₹/liter (Delhi avg)
    Petrol: 95.0,
    CNG: 74.0,
    Electric: 8.0,   // ₹/kWh
};

const emptyForm = { vehicleId: '', liters: '', fuelCost: '', maintenanceCost: '0', kmDriven: '', notes: '', detectedFuelType: '' };

function Modal({ vehicles, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const [autoPrice, setAutoPrice] = useState(null); // detected price/L

    const selectedVehicle = vehicles.find(v => v._id === form.vehicleId);

    // Auto-fill fuel cost when vehicle or liters change
    useEffect(() => {
        if (!selectedVehicle) { setAutoPrice(null); return; }
        const fuelType = selectedVehicle.fuelType || 'Diesel';
        const pricePerL = FUEL_PRICES[fuelType] || FUEL_PRICES.Diesel;
        setAutoPrice(pricePerL);
        if (form.liters && parseFloat(form.liters) > 0) {
            const calculated = (parseFloat(form.liters) * pricePerL).toFixed(2);
            setForm(prev => ({ ...prev, fuelCost: calculated, detectedFuelType: fuelType }));
        }
    }, [form.vehicleId, form.liters]);

    const f = (k) => (e) => {
        const updated = { ...form, [k]: e.target.value };
        setForm(updated);
    };

    const totalCost = (parseFloat(form.fuelCost) || 0) + (parseFloat(form.maintenanceCost) || 0);
    const efficiency = parseFloat(form.liters) > 0 && parseFloat(form.kmDriven) > 0
        ? (parseFloat(form.kmDriven) / parseFloat(form.liters)).toFixed(2) : null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl fade-in max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                    <h2 className="text-white font-semibold text-lg">Add Fuel / Expense Log</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-4">

                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Vehicle*</label>
                        <select value={form.vehicleId} onChange={f('vehicleId')}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} ({v.fuelType || 'Diesel'})</option>)}
                        </select>
                    </div>

                    {/* Auto-price banner */}
                    {selectedVehicle && autoPrice && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-2 text-xs">
                            <Fuel size={13} className="text-indigo-400 flex-shrink-0" />
                            <span className="text-indigo-300">
                                <strong>{selectedVehicle.fuelType || 'Diesel'}</strong> detected → Current price:
                                <strong className="text-indigo-200"> ₹{autoPrice}/liter</strong> · Fuel cost auto-calculated from liters
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Liters*</label>
                            <input type="number" value={form.liters} onChange={f('liters')} min="0" step="0.1"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">
                                Fuel Cost (₹)
                                {autoPrice && <span className="text-indigo-400 text-xs ml-1">(auto-calculated)</span>}
                            </label>
                            <input type="number" value={form.fuelCost} onChange={f('fuelCost')} min="0"
                                className="w-full bg-slate-900 border border-indigo-500 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">KM Driven</label>
                            <input type="number" value={form.kmDriven} onChange={f('kmDriven')} min="0"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm block mb-1.5">Maintenance Cost (₹)</label>
                            <input type="number" value={form.maintenanceCost} onChange={f('maintenanceCost')} min="0"
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm block mb-1.5">Notes</label>
                        <input value={form.notes} onChange={f('notes')} placeholder="Optional notes"
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-900 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                            <p className="text-slate-500 text-xs">Fuel Cost</p>
                            <p className="text-orange-400 font-semibold">₹{(parseFloat(form.fuelCost) || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center border-x border-slate-700">
                            <p className="text-slate-500 text-xs">Total Cost</p>
                            <p className="text-white font-bold">₹{totalCost.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs">Efficiency</p>
                            <p className="text-green-400 font-semibold">{efficiency ? `${efficiency} km/L` : '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-slate-700 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 border border-slate-600 rounded-lg hover:text-white">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Save Log</button>
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
                    <p className="text-slate-400 text-sm mt-0.5">{logs.length} expense records</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Log
                </button>
            </div>

            {/* Fuel price reference */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Current Fuel Prices (Auto-Applied)</p>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(FUEL_PRICES).map(([type, price]) => (
                        <div key={type} className="flex items-center gap-2">
                            <Fuel size={13} className="text-orange-400" />
                            <span className="text-slate-300 text-sm">{type}:</span>
                            <span className="text-orange-400 font-semibold text-sm">₹{price}/L</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Fuel Cost', value: `₹${totals.fuel.toLocaleString()}`, color: 'text-orange-400' },
                    { label: 'Total Maintenance', value: `₹${totals.maintenance.toLocaleString()}`, color: 'text-amber-400' },
                    { label: 'Total Expenses', value: `₹${totals.total.toLocaleString()}`, color: 'text-red-400' },
                    { label: 'Total Fuel (L)', value: `${totals.liters.toFixed(1)}L`, color: 'text-blue-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <p className="text-slate-400 text-xs">{label}</p>
                        <p className={`${color} text-xl font-bold mt-1`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead>
                            <tr className="border-b border-slate-700">
                                {['Vehicle', 'Liters', 'Fuel Cost', 'Maint.', 'Total', 'km/L', 'Date'].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {logs.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-12">No fuel logs yet</td></tr>}
                            {logs.map(l => (
                                <tr key={l._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Fuel size={13} className="text-orange-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-white text-sm font-medium whitespace-nowrap">{l.vehicleId?.name ?? '—'}</p>
                                                <p className="text-slate-500 text-xs">{l.vehicleId?.licensePlate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">{l.liters}L</td>
                                    <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">₹{l.fuelCost?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">₹{l.maintenanceCost?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-white font-semibold text-sm whitespace-nowrap">₹{l.totalCost?.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        {l.fuelEfficiency ? <span className="text-green-400 text-sm whitespace-nowrap">{l.fuelEfficiency}</span> : <span className="text-slate-600 text-sm">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-sm whitespace-nowrap">{new Date(l.date).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && <Modal vehicles={vehicles} onClose={() => setShowModal(false)} onSave={save} />}
        </div>
    );
}
