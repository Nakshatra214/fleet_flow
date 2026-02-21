import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Download, TrendingUp } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
    },
};

export default function Analytics() {
    const [roi, setRoi] = useState([]);
    const [efficiency, setEfficiency] = useState([]);

    useEffect(() => {
        api.get('/analytics/roi').then(r => setRoi(r.data)).catch(() => { });
        api.get('/analytics/fuel-efficiency').then(r => setEfficiency(r.data)).catch(() => { });
    }, []);

    const roiChart = {
        labels: roi.map(r => r.vehicle),
        datasets: [
            { label: 'Revenue (₹)', data: roi.map(r => r.revenue), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 },
            { label: 'Expenses (₹)', data: roi.map(r => r.expenses), backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 6 },
            { label: 'ROI (₹)', data: roi.map(r => r.roi), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 6 },
        ],
    };

    const effChart = {
        labels: efficiency.map(e => e.vehicleName),
        datasets: [{
            label: 'km/Liter',
            data: efficiency.map(e => e.efficiency),
            backgroundColor: 'rgba(251,146,60,0.7)',
            borderRadius: 6,
        }],
    };

    const exportCSV = (data, filename) => {
        if (!data.length) { toast.error('No data to export'); return; }
        const keys = Object.keys(data[0]);
        const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
                    <p className="text-slate-400 text-sm mt-1">Vehicle performance and financial overview</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => exportCSV(roi, 'fleet_roi.csv')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-600">
                        <Download size={15} /> Export ROI CSV
                    </button>
                    <button onClick={() => exportCSV(efficiency, 'fuel_efficiency.csv')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-600">
                        <Download size={15} /> Export Efficiency CSV
                    </button>
                </div>
            </div>

            {/* ROI Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-indigo-400" />
                    <h3 className="text-white font-semibold">Vehicle ROI — Revenue vs Expenses</h3>
                </div>
                <div className="h-72">
                    {roi.length > 0 ? (
                        <Bar data={roiChart} options={chartOpts} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">No ROI data. Add trips with revenue to see analytics.</div>
                    )}
                </div>
            </div>

            {/* Fuel Efficiency Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-orange-400 text-xl">⛽</span>
                    <h3 className="text-white font-semibold">Fuel Efficiency per Vehicle (km/Liter)</h3>
                </div>
                <div className="h-72">
                    {efficiency.length > 0 ? (
                        <Bar data={effChart} options={chartOpts} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">No fuel data. Add fuel logs with km driven to see efficiency.</div>
                    )}
                </div>
            </div>

            {/* ROI Table */}
            {roi.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold">ROI Breakdown</h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                {['Vehicle', 'License', 'Revenue', 'Expenses', 'ROI'].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {roi.map(r => (
                                <tr key={r.licensePlate} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3 text-white text-sm font-medium">{r.vehicle}</td>
                                    <td className="px-4 py-3 text-slate-400 text-sm font-mono">{r.licensePlate}</td>
                                    <td className="px-4 py-3 text-green-400 text-sm">₹{r.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-red-400 text-sm">₹{r.expenses.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-semibold ${r.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {r.roi >= 0 ? '+' : ''}₹{r.roi.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
