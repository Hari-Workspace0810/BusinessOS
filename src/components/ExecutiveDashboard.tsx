import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Users,
  Building,
  Receipt,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Organization,
  Branch,
  FinancialTransaction,
  Invoice,
  Product,
  Customer,
  Employee,
  PurchaseOrder,
  LeaveRequest,
} from '../types';

interface ExecutiveDashboardProps {
  currentOrg: Organization;
  currentBranch: Branch;
  transactions: FinancialTransaction[];
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  employees: Employee[];
  purchaseOrders: PurchaseOrder[];
  leaveRequests: LeaveRequest[];
  onNavigateTab: (tab: string) => void;
  onApprovePO: (poId: string) => void;
  onApproveLeave: (leaveId: string) => void;
}

type DateFilter = 'today' | '7d' | '30d' | 'current_month' | 'qtd' | 'ytd';

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  currentOrg,
  currentBranch,
  transactions,
  invoices,
  products,
  customers,
  employees,
  purchaseOrders,
  leaveRequests,
  onNavigateTab,
  onApprovePO,
  onApproveLeave,
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');

  // Filtered dataset calculations
  const orgTransactions = useMemo(
    () => transactions.filter((t) => t.organizationId === currentOrg.id),
    [transactions, currentOrg.id]
  );

  const orgInvoices = useMemo(
    () => invoices.filter((i) => i.organizationId === currentOrg.id),
    [invoices, currentOrg.id]
  );

  const orgProducts = useMemo(
    () => products.filter((p) => p.organizationId === currentOrg.id),
    [products, currentOrg.id]
  );

  const totalRevenue = useMemo(() => {
    return orgTransactions
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [orgTransactions]);

  const totalExpenses = useMemo(() => {
    return orgTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [orgTransactions]);

  const netProfit = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const pendingReceivables = useMemo(() => {
    return orgInvoices
      .filter((i) => i.status !== 'paid')
      .reduce((acc, i) => acc + i.balanceDue, 0);
  }, [orgInvoices]);

  const inventoryValuation = useMemo(() => {
    return orgProducts.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  }, [orgProducts]);

  const lowStockProducts = useMemo(() => {
    return orgProducts.filter((p) => p.currentStock <= p.reorderLevel);
  }, [orgProducts]);

  const pendingPOs = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === 'pending_approval');
  }, [purchaseOrders]);

  const pendingLeaves = useMemo(() => {
    return leaveRequests.filter((l) => l.status === 'pending');
  }, [leaveRequests]);

  // Chart time series (Monthly performance)
  const revenueChartData = [
    { period: 'May 2026', revenue: 2800000, expenses: 1950000, profit: 850000 },
    { period: 'Jun 2026', revenue: 3100000, expenses: 2200000, profit: 900000 },
    { period: 'Jul 2026', revenue: 3450000, expenses: 2100000, profit: 1350000 },
    { period: 'Aug 2026', revenue: 3900000, expenses: 2450000, profit: 1450000 },
    { period: 'Sep 2026', revenue: 4200000, expenses: 2600000, profit: 1600000 },
    { period: 'Oct 2026', revenue: totalRevenue, expenses: totalExpenses, profit: netProfit },
  ];

  const departmentPerformance = [
    { name: 'Engineering', budget: 3500000, spent: 2850000 },
    { name: 'Operations', budget: 4500000, spent: 3950000 },
    { name: 'Sales & CRM', budget: 2800000, spent: 2400000 },
    { name: 'Finance & Admin', budget: 1500000, spent: 1200000 },
  ];

  const currencySymbol = currentOrg.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter Segmented Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Performance Cockpit
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{currentOrg.name}</span>
            <span aria-hidden="true">·</span>
            <span>Branch: {currentBranch.name}</span>
            <span aria-hidden="true">·</span>
            <span>Consolidated Real-time View</span>
          </div>
        </div>

        {/* Date Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'current_month', label: 'Current Month' },
            { id: 'qtd', label: 'Quarter to Date' },
            { id: 'ytd', label: 'Year to Date' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id as DateFilter)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                dateFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Revenue</span>
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {currencySymbol} {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            From {orgTransactions.filter((t) => t.type === 'income').length} settled customer transactions
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Operational Expenses</span>
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> -3.5%
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {currencySymbol} {totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Payroll, leases, raw materials & fulfillment
          </div>
        </div>

        {/* Net Operating Profit */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Net Operating Profit</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {netMargin}% Margin
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {currencySymbol} {netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            EBITDA-adjusted authorized ledger balance
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Pending Receivables</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {orgInvoices.filter((i) => i.status !== 'paid').length} open invoices
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {currencySymbol} {pendingReceivables.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Outstanding customer collections
          </div>
        </div>
      </div>

      {/* Secondary Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Inventory Valuation</div>
            <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {currencySymbol} {inventoryValuation.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Enterprise Accounts</div>
            <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {customers.length} Accounts & Leads
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Active Workforce</div>
            <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {employees.length} Personnel across 3 Branches
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Low Stock Reorders</div>
            <div className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {lowStockProducts.length} Items Require Action
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Trends (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Revenue, Expense & Operating Profit Trajectory
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Past 6 months audited monthly cash flows ({currentOrg.currency})
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val: any) => [val !== undefined ? `₹${Number(val).toLocaleString()}` : '', '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Budget vs Spent (1 col) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Department Utilization
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">Budget vs Actual Spent</div>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Ledger
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  formatter={(val: any) => [val !== undefined ? `₹${Number(val).toLocaleString()}` : '', '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="spent" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Actual Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Centers: Pending Approvals & Recent Audit Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals (1 col) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Pending Approvals
            </h2>
            <span className="text-xs text-slate-400">{pendingPOs.length + pendingLeaves.length} items</span>
          </div>

          <div className="space-y-3">
            {pendingPOs.map((po) => (
              <div
                key={po.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{po.poNumber}</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                    ₹{po.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-500">Supplier: {po.supplierName}</div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onApprovePO(po.id)}
                    className="flex-1 py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors"
                  >
                    Authorize PO
                  </button>
                  <button
                    onClick={() => onNavigateTab('procurement')}
                    className="py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-[11px]"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}

            {pendingLeaves.map((lve) => (
              <div
                key={lve.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{lve.employeeName}</span>
                  <span className="text-[11px] text-slate-400">{lve.days} days ({lve.leaveType})</span>
                </div>
                <div className="text-slate-500">{lve.reason}</div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onApproveLeave(lve.id)}
                    className="flex-1 py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors"
                  >
                    Approve Leave
                  </button>
                  <button
                    onClick={() => onNavigateTab('hrms')}
                    className="py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-[11px]"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}

            {pendingPOs.length === 0 && pendingLeaves.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No pending managerial approvals. Everything is clear.
              </div>
            )}
          </div>
        </div>

        {/* Recent Financial Transactions Audit Trail (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Authorized Ledger Activity
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Immutable double-entry transaction record with reversal histories
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
            >
              Full Ledger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {orgTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 font-mono text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-2.5 max-w-[240px] truncate text-slate-800 dark:text-slate-200 font-medium">
                      {tx.description}
                    </td>
                    <td className="py-2.5 text-slate-500 whitespace-nowrap">{tx.category}</td>
                    <td className="py-2.5 uppercase font-mono text-[10px] text-slate-400">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td
                      className={`py-2.5 text-right font-semibold tabular-nums whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-[11px] font-medium capitalize ${
                          tx.status === 'completed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : tx.status === 'reversed'
                            ? 'text-rose-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
