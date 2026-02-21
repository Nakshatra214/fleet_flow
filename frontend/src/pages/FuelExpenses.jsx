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

const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

function Modal({ vehicles, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const [autoPrice, setAutoPrice] = useState(null);

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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg shadow-2xl shadow-gray-200/80 fade-in max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Fuel size={16} className="text-white" />
                        </div>
                        <h2 className="text-gray-800 font-semibold text-lg">Add Fuel / Expense Log</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Vehicle*</label>
                        <select value={form.vehicleId} onChange={f('vehicleId')} className={selectCls}>
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} — {v.licensePlate} ({v.fuelType || 'Diesel'})</option>)}
                        </select>
                    </div>

                    {/* Auto-price banner */}
                    {selectedVehicle && autoPrice && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs">
                            <Fuel size={13} className="text-indigo-500 flex-shrink-0" />
                            <span className="text-gray-600">
                                <strong className="text-indigo-700">{selectedVehicle.fuelType || 'Diesel'}</strong> detected → Current price:
                                <strong className="text-indigo-700"> ₹{autoPrice}/liter</strong> · Fuel cost auto-calculated from liters
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Liters*</label>
                            <input type="number" value={form.liters} onChange={f('liters')} min="0" step="0.1" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                                Fuel Cost (₹) {autoPrice && <span className="text-indigo-500 normal-case font-normal ml-1">(auto)</span>}
                            </label>
                            <input type="number" value={form.fuelCost} onChange={f('fuelCost')} min="0" className={inputCls} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">KM Driven</label>
                            <input type="number" value={form.kmDriven} onChange={f('kmDriven')} min="0" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Maint. Cost (₹)</label>
                            <input type="number" value={form.maintenanceCost} onChange={f('maintenanceCost')} min="0" className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Notes</label>
                        <input value={form.notes} onChange={f('notes')} placeholder="Optional notes" className={inputCls} />
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Fuel Cost</p>
                            <p className="text-orange-500 font-bold text-base mt-0.5">₹{(parseFloat(form.fuelCost) || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center border-x border-gray-200">
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Cost</p>
                            <p className="text-gray-800 font-bold text-base mt-0.5">₹{totalCost.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Efficiency</p>
                            <p className="text-green-600 font-bold text-base mt-0.5">{efficiency ? `${efficiency} km/L` : '—'}</p>
                        </div>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
                        <Fuel size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Fuel & Expenses</h1>
                        <p className="text-gray-400 text-sm">{logs.length} expense records</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow shadow-indigo-200">
                    <Plus size={16} /> Add Log
                </button>
            </div>

            {/* Fuel price reference */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Current Fuel Prices (Auto-Applied)</p>
                <div className="flex flex-wrap gap-5">
                    {Object.entries(FUEL_PRICES).map(([type, price]) => (
                        <div key={type} className="flex items-center gap-2 bg-orange-50/50 px-3 py-1.5 rounded-lg border border-orange-100">
                            <Fuel size={14} className="text-orange-500" />
                            <span className="text-gray-600 text-sm font-medium">{type}:</span>
                            <span className="text-orange-600 font-bold text-sm">₹{price}/L</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fuel Cost', value: `₹${totals.fuel.toLocaleString()}`, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Total Maintenance', value: `₹${totals.maintenance.toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Total Expenses', value: `₹${totals.total.toLocaleString()}`, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Total Fuel (L)', value: `${totals.liters.toFixed(1)}L`, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
                        <div className="flex items-end gap-2">
                            <div className={`w-1.5 h-6 rounded-full ${bg} overflow-hidden`}><div className={`h-full w-full ${color.replace('text-', 'bg-')}`}></div></div>
                            <p className={`${color} text-2xl font-bold leading-none`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {['Vehicle', 'Liters', 'Fuel Cost', 'Maint.', 'Total', 'km/L', 'Date'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-14">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                            <Fuel size={22} className="text-orange-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No fuel logs yet</p>
                                    </div>
                                </td></tr>
                            )}
                            {logs.map(l => (
                                <tr key={l._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Fuel size={15} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-gray-800 text-sm font-semibold whitespace-nowrap">{l.vehicleId?.name ?? '—'}</p>
                                                <p className="text-gray-400 text-xs">{l.vehicleId?.licensePlate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-700 font-medium text-sm whitespace-nowrap">{l.liters}L</td>
                                    <td className="px-5 py-3.5 text-gray-600 text-sm whitespace-nowrap">₹{l.fuelCost?.toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-gray-600 text-sm whitespace-nowrap">₹{l.maintenanceCost?.toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-gray-800 font-bold text-sm whitespace-nowrap">₹{l.totalCost?.toLocaleString()}</td>
                                    <td className="px-5 py-3.5">
                                        {l.fuelEfficiency ? <span className="text-green-600 font-semibold text-sm whitespace-nowrap">{l.fuelEfficiency}</span> : <span className="text-gray-400 text-sm">—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 text-sm whitespace-nowrap">{new Date(l.date).toLocaleDateString('en-IN')}</td>
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
