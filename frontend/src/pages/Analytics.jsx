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
    plugins: { legend: { labels: { color: '#64748b', font: { size: 11 } } } },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
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
            { label: 'Revenue (₹)', data: roi.map(r => r.revenue), backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6 },
            { label: 'Expenses (₹)', data: roi.map(r => r.expenses), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6 },
            { label: 'ROI (₹)', data: roi.map(r => r.roi), backgroundColor: 'rgba(34,197,94,0.8)', borderRadius: 6 },
        ],
    };

    const effChart = {
        labels: efficiency.map(e => e.vehicleName),
        datasets: [{
            label: 'km/Liter',
            data: efficiency.map(e => e.efficiency),
            backgroundColor: 'rgba(249,115,22,0.8)',
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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
                        <p className="text-gray-400 text-sm">Vehicle performance and financial overview</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => exportCSV(roi, 'fleet_roi.csv')}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-gray-200 shadow-sm">
                        <Download size={15} className="text-indigo-500" /> Export ROI CSV
                    </button>
                    <button onClick={() => exportCSV(efficiency, 'fuel_efficiency.csv')}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-gray-200 shadow-sm">
                        <Download size={15} className="text-orange-500" /> Export Efficiency CSV
                    </button>
                </div>
            </div>

            {/* ROI Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                        <TrendingUp size={18} className="text-indigo-600" />
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Vehicle ROI — Revenue vs Expenses</h3>
                </div>
                <div className="h-72">
                    {roi.length > 0 ? (
                        <Bar data={roiChart} options={chartOpts} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">No ROI data. Add trips with revenue to see analytics.</div>
                    )}
                </div>
            </div>

            {/* Fuel Efficiency Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-orange-50 rounded-lg">
                        <span className="text-orange-500 text-lg leading-none">⛽</span>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Fuel Efficiency per Vehicle (km/Liter)</h3>
                </div>
                <div className="h-72">
                    {efficiency.length > 0 ? (
                        <Bar data={effChart} options={chartOpts} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">No fuel data. Add fuel logs with km driven to see efficiency.</div>
                    )}
                </div>
            </div>

            {/* ROI Table */}
            {roi.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-gray-800 font-bold text-lg">ROI Breakdown</h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {['Vehicle', 'License', 'Revenue', 'Expenses', 'ROI'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {roi.map(r => (
                                <tr key={r.licensePlate} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-5 py-4 text-gray-800 text-sm font-semibold">{r.vehicle}</td>
                                    <td className="px-5 py-4 text-gray-500 text-sm font-mono">{r.licensePlate}</td>
                                    <td className="px-5 py-4 text-green-600 text-sm font-medium">₹{r.revenue.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-red-500 text-sm font-medium">₹{r.expenses.toLocaleString()}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-sm font-bold ${r.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
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
