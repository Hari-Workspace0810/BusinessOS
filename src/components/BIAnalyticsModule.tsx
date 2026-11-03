import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Building,
  Users,
  Package,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Organization, Branch, FinancialTransaction, Product, Customer } from '../types';

interface BIAnalyticsModuleProps {
  currentOrg: Organization;
  branches: Branch[];
  transactions: FinancialTransaction[];
  products: Product[];
  customers: Customer[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const BIAnalyticsModule: React.FC<BIAnalyticsModuleProps> = ({
  currentOrg,
  branches,
  transactions,
  products,
  customers,
}) => {
  const [metricView, setMetricView] = useState<'revenue' | 'expenses' | 'branches' | 'cohorts'>('revenue');

  // Revenue Streams Data
  const streamData = [
    { stream: 'IoT Smart Gateways', value: 3850000 },
    { stream: 'Industrial Servomotors', value: 2420000 },
    { stream: 'PLC Controllers', value: 1650000 },
    { stream: 'Annual SLA Maintenance', value: 1200000 },
    { stream: 'Optic Sensor Modules', value: 890000 },
  ];

  // Expense Categories Data
  const expenseData = [
    { name: 'Raw Materials & Alloys', value: 1850000 },
    { name: 'Executive & Eng Payroll', value: 1040000 },
    { name: 'Depot & Facility Leases', value: 580000 },
    { name: 'Freight & Supply Logistics', value: 340000 },
    { name: 'Cloud Infrastructure & R&D', value: 210000 },
  ];

  // Branch Performance Comparison
  const branchPerformanceData = [
    { branch: 'Mumbai HQ', revenue: 4200000, margin: 34, headcount: 38 },
    { branch: 'Bengaluru Tech', revenue: 2650000, margin: 41, headcount: 24 },
    { branch: 'Delhi NCR Hub', revenue: 1950000, margin: 28, headcount: 18 },
  ];

  // Customer Cohort Retention %
  const cohortData = [
    { month: 'Month 1', cohort2025: 100, cohort2026: 100 },
    { month: 'Month 2', cohort2025: 92, cohort2026: 96 },
    { month: 'Month 3', cohort2025: 86, cohort2026: 91 },
    { month: 'Month 4', cohort2025: 81, cohort2026: 88 },
    { month: 'Month 5', cohort2025: 78, cohort2026: 85 },
    { month: 'Month 6', cohort2025: 75, cohort2026: 83 },
  ];

  const handleExportBIReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Stream,Value\n' +
      streamData.map((s) => `"${s.stream}",${s.value}`).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'BusinessOS_Intelligence_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Business Intelligence & Deep Analytics
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Cohort retention · Multi-branch unit economics · Product line margin contribution
          </div>
        </div>

        <button
          onClick={handleExportBIReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export BI Dataset</span>
        </button>
      </div>

      {/* Segmented view tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs max-w-fit">
        {[
          { id: 'revenue', label: 'Revenue Streams' },
          { id: 'expenses', label: 'Cost Centers' },
          { id: 'branches', label: 'Branch Unit Economics' },
          { id: 'cohorts', label: 'Cohort Retention' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMetricView(tab.id as any)}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              metricView === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW: REVENUE STREAMS */}
      {metricView === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Revenue Volume by Product & Service Line (₹)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streamData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="stream" stroke="#94a3b8" fontSize={11} angle={-10} textAnchor="end" />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(val: any) => [val !== undefined ? `₹${Number(val).toLocaleString()}` : '', 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Stream Share Breakdown
            </h2>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={streamData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {streamData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [val !== undefined ? `₹${Number(val).toLocaleString()}` : '', '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {streamData.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="truncate max-w-[150px]">{s.stream}</span>
                  </span>
                  <span className="font-mono font-semibold">₹{(s.value / 100000).toFixed(1)}L</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: EXPENSES */}
      {metricView === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cost Center Allocation
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                  <Tooltip
                    formatter={(val: any) => [val !== undefined ? `₹${Number(val).toLocaleString()}` : '', 'Expense']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              OpEx Concentration
            </h2>
            <div className="space-y-3 text-xs pt-2">
              {expenseData.map((item, idx) => {
                const total = expenseData.reduce((acc, c) => acc + c.value, 0);
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>{item.name}</span>
                      <span className="font-mono font-semibold">₹{(item.value / 100000).toFixed(1)}L ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: BRANCHES */}
      {metricView === 'branches' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Branch-Level Profitability & Unit Economics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Branch Operations Hub</th>
                  <th className="pb-2.5 text-right">Revenue (₹)</th>
                  <th className="pb-2.5 text-right">Gross Margin %</th>
                  <th className="pb-2.5 text-right">Headcount</th>
                  <th className="pb-2.5 text-right">Revenue Per Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {branchPerformanceData.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {b.branch}
                    </td>
                    <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{b.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-slate-700 dark:text-slate-300">
                      {b.margin}%
                    </td>
                    <td className="py-3 text-right text-slate-500">{b.headcount}</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Math.round(b.revenue / b.headcount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: COHORTS */}
      {metricView === 'cohorts' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Enterprise Client Retention Curve by Annual Cohort (%)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohortData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(val: any) => [val !== undefined ? `${val}%` : '', 'Retention']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="cohort2026" stroke="#10b981" strokeWidth={2} name="2026 Cohort" />
                <Line type="monotone" dataKey="cohort2025" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} name="2025 Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
