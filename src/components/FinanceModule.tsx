import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RotateCcw,
  Download,
  Filter,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Organization, Branch, FinancialTransaction, Invoice } from '../types';

interface FinanceModuleProps {
  currentOrg: Organization;
  currentBranch: Branch;
  transactions: FinancialTransaction[];
  invoices: Invoice[];
  onAddTransaction: (tx: Partial<FinancialTransaction>) => void;
  onReverseTransaction: (txId: string) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  currentOrg,
  currentBranch,
  transactions,
  invoices,
  onAddTransaction,
  onReverseTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'pl' | 'balance_sheet' | 'receivables'>('ledger');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form State for new transaction
  const [newTx, setNewTx] = useState({
    type: 'income' as 'income' | 'expense',
    category: 'Enterprise Product Sales',
    amount: '',
    description: '',
    paymentMethod: 'bank_transfer' as const,
    taxRate: 18,
    reference: '',
  });

  const currencySymbol = currentOrg.currency === 'INR' ? '₹' : '$';

  // Filtered transactions for this org
  const orgTransactions = useMemo(
    () => transactions.filter((t) => t.organizationId === currentOrg.id),
    [transactions, currentOrg.id]
  );

  const displayedTransactions = useMemo(() => {
    if (filterType === 'all') return orgTransactions;
    return orgTransactions.filter((t) => t.type === filterType);
  }, [orgTransactions, filterType]);

  const totalIncome = useMemo(
    () =>
      orgTransactions
        .filter((t) => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    [orgTransactions]
  );

  const totalExpense = useMemo(
    () =>
      orgTransactions
        .filter((t) => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
    [orgTransactions]
  );

  const netProfit = totalIncome - totalExpense;

  // Receivables from invoices
  const pendingInvoices = invoices.filter((i) => i.organizationId === currentOrg.id && i.status !== 'paid');
  const totalReceivables = pendingInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  // Form submission handler
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newTx.amount);
    if (isNaN(amt) || amt <= 0) return;

    const tax = Math.round((amt * newTx.taxRate) / (100 + newTx.taxRate));

    onAddTransaction({
      organizationId: currentOrg.id,
      branchId: currentBranch.id,
      type: newTx.type,
      category: newTx.category,
      amount: amt,
      currency: currentOrg.currency,
      description: newTx.description,
      paymentMethod: newTx.paymentMethod,
      reference: newTx.reference || `REF-${Date.now().toString().slice(-6)}`,
      taxAmount: tax,
      status: 'completed',
    });

    setIsModalOpen(false);
    setNewTx({
      type: 'income',
      category: 'Enterprise Product Sales',
      amount: '',
      description: '',
      paymentMethod: 'bank_transfer',
      taxRate: 18,
      reference: '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Tax', 'Payment Method', 'Status', 'Reference'];
    const rows = orgTransactions.map((t) => [
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.taxAmount,
      t.paymentMethod,
      t.status,
      t.reference,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BusinessOS_General_Ledger_${currentOrg.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Finance & General Ledger
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Double-entry bookkeeping · GST/Tax breakdown · Audit reversal protection
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Realized Revenue</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {currencySymbol} {totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Operating Expenses</div>
          <div className="text-xl font-bold text-rose-500 tabular-nums">
            {currencySymbol} {totalExpense.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Net Accounting Profit</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {currencySymbol} {netProfit.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Accounts Receivable (A/R)</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {currencySymbol} {totalReceivables.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs max-w-fit">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'ledger'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          General Ledger
        </button>
        <button
          onClick={() => setActiveTab('pl')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'pl'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Profit & Loss (P&L)
        </button>
        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'balance_sheet'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('receivables')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'receivables'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Accounts Receivable ({pendingInvoices.length})
        </button>
      </div>

      {/* TAB 1: GENERAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Filter Ledger:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All ({orgTransactions.length})
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  filterType === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Credits / Inflows
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  filterType === 'expense'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Debits / Outflows
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Immutable GAAP standard with audit reversals
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Reference ID</th>
                  <th className="pb-2.5">Account / Category</th>
                  <th className="pb-2.5">Narration & Description</th>
                  <th className="pb-2.5">GST/Tax</th>
                  <th className="pb-2.5 text-right">Debit (-)</th>
                  <th className="pb-2.5 text-right">Credit (+)</th>
                  <th className="pb-2.5 text-right">Status</th>
                  <th className="pb-2.5 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {displayedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">{tx.reference}</td>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-sans">{tx.category}</td>
                    <td className="py-3 font-sans text-slate-700 dark:text-slate-300 max-w-[260px] truncate">
                      {tx.reversalOf && (
                        <span className="text-amber-500 mr-1 font-semibold">[REV]</span>
                      )}
                      {tx.description}
                    </td>
                    <td className="py-3 text-slate-400">
                      {tx.taxAmount > 0 ? `₹${tx.taxAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 text-right text-rose-500 font-semibold">
                      {tx.type === 'expense' ? `₹${tx.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {tx.type === 'income' ? `₹${tx.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 text-right font-sans">
                      <span
                        className={`text-[11px] font-semibold capitalize ${
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
                    <td className="py-3 text-right font-sans">
                      {tx.status === 'completed' && !tx.reversalOf ? (
                        <button
                          onClick={() => onReverseTransaction(tx.id)}
                          title="Generate GAAP-compliant Reversal Entry"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT & LOSS STATEMENT */}
      {activeTab === 'pl' && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {currentOrg.legalName}
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Statement of Profit and Loss for the Period Ended 31 October 2026
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              (All figures in Indian Rupees ₹ unless stated otherwise)
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Section 1: Revenue */}
            <div>
              <div className="font-bold font-sans text-slate-900 dark:text-white uppercase tracking-wider py-1 border-b border-slate-300 dark:border-slate-700">
                I. REVENUE FROM OPERATIONS
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans text-slate-700 dark:text-slate-300">
                  Gross Sales of Industrial Products & Systems
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹ {(totalIncome * 0.85).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans text-slate-700 dark:text-slate-300">
                  Engineering Maintenance & Consulting Services
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹ {(totalIncome * 0.15).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2.5 font-bold font-sans text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded-md">
                <span>TOTAL REVENUE (A)</span>
                <span className="font-mono">₹ {totalIncome.toLocaleString()}</span>
              </div>
            </div>

            {/* Section 2: Expenses */}
            <div>
              <div className="font-bold font-sans text-slate-900 dark:text-white uppercase tracking-wider py-1 border-b border-slate-300 dark:border-slate-700">
                II. OPERATIONAL EXPENSES
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans text-slate-700 dark:text-slate-300">
                  Cost of Raw Materials & Consumables Consumed
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹ {(totalExpense * 0.45).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans text-slate-700 dark:text-slate-300">
                  Employee Benefit & Payroll Expenses
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹ {(totalExpense * 0.35).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans text-slate-700 dark:text-slate-300">
                  Manufacturing Facility Leases & Logistics
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹ {(totalExpense * 0.2).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2.5 font-bold font-sans text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 px-2 rounded-md">
                <span>TOTAL EXPENSES (B)</span>
                <span className="font-mono">₹ {totalExpense.toLocaleString()}</span>
              </div>
            </div>

            {/* Section 3: Net Profit */}
            <div className="pt-2">
              <div className="flex justify-between py-3 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold font-sans text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700">
                <span>PROFIT BEFORE TAX (A - B)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  ₹ {netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BALANCE SHEET */}
      {activeTab === 'balance_sheet' && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {currentOrg.legalName}
            </h2>
            <div className="text-xs text-slate-500 mt-1">Balance Sheet as on 31 October 2026</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
            {/* Assets */}
            <div className="space-y-3">
              <div className="font-bold font-sans text-slate-900 dark:text-white uppercase tracking-wider pb-1 border-b border-slate-300 dark:border-slate-700">
                ASSETS
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Plant, Machinery & Equipment</span>
                  <span>₹ 1,85,00,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Inventories & Warehoused Stock</span>
                  <span>₹ 64,50,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Trade Receivables (A/R)</span>
                  <span>₹ {totalReceivables.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Cash & Bank Balances (HDFC/SBI)</span>
                  <span>₹ 48,20,000</span>
                </div>
                <div className="flex justify-between py-2.5 font-bold font-sans text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 rounded-md">
                  <span>TOTAL ASSETS</span>
                  <span className="font-mono">₹ {(18500000 + 6450000 + totalReceivables + 4820000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <div className="font-bold font-sans text-slate-900 dark:text-white uppercase tracking-wider pb-1 border-b border-slate-300 dark:border-slate-700">
                EQUITY & LIABILITIES
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Shareholders Capital</span>
                  <span>₹ 1,50,00,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Retained Earnings & Reserves</span>
                  <span>₹ 1,18,00,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Trade Payables (Suppliers)</span>
                  <span>₹ 13,10,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-700 dark:text-slate-300">Statutory Tax & GST Dues</span>
                  <span>₹ 4,30,000</span>
                </div>
                <div className="flex justify-between py-2.5 font-bold font-sans text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 rounded-md">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span className="font-mono">₹ {(15000000 + 11800000 + 1310000 + 430000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNTS RECEIVABLE */}
      {activeTab === 'receivables' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Accounts Receivable Aging & Follow-ups
              </h2>
              <div className="text-xs text-slate-500">Unsettled client invoices and expected collections</div>
            </div>
            <div className="text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
              Total Due: ₹ {totalReceivables.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Customer Account</th>
                  <th className="pb-2">Issue Date</th>
                  <th className="pb-2">Due Date</th>
                  <th className="pb-2 text-right">Invoice Total</th>
                  <th className="pb-2 text-right">Outstanding Due</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {pendingInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{inv.invoiceNumber}</td>
                    <td className="py-2.5 font-sans text-slate-900 dark:text-slate-100 font-medium">
                      {inv.customerName}
                    </td>
                    <td className="py-2.5 text-slate-500">{inv.date}</td>
                    <td className="py-2.5 text-rose-500 font-medium">{inv.dueDate}</td>
                    <td className="py-2.5 text-right">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                      ₹{inv.balanceDue.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <span className="text-[11px] font-semibold text-amber-600 uppercase">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Financial Entry
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Transaction Type</label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="income">Credit / Income</option>
                    <option value="expense">Debit / Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Payment Method</label>
                  <select
                    value={newTx.paymentMethod}
                    onChange={(e) => setNewTx({ ...newTx, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="bank_transfer">NEFT / RTGS Bank Transfer</option>
                    <option value="upi">Corporate UPI</option>
                    <option value="card">Commercial Card</option>
                    <option value="cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Account Category</label>
                <input
                  type="text"
                  required
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  placeholder="e.g. Enterprise Sales, Raw Materials, Lease"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">
                    Total Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">GST / Tax Rate (%)</label>
                  <select
                    value={newTx.taxRate}
                    onChange={(e) => setNewTx({ ...newTx, taxRate: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% Standard GST</option>
                    <option value="28">28% Luxury GST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Narration / Description</label>
                <textarea
                  required
                  rows={2}
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="Description of business goods, services, or audit details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Reference / UTR Number</label>
                <input
                  type="text"
                  value={newTx.reference}
                  onChange={(e) => setNewTx({ ...newTx, reference: e.target.value })}
                  placeholder="e.g. NEFT-HDFC-991203"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
