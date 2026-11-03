import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Organization, Branch, Invoice, Customer, Product, InvoiceItem } from '../types';

interface SalesBillingModuleProps {
  currentOrg: Organization;
  currentBranch: Branch;
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  onCreateInvoice: (inv: Partial<Invoice>) => void;
}

export const SalesBillingModule: React.FC<SalesBillingModuleProps> = ({
  currentOrg,
  currentBranch,
  invoices,
  customers,
  products,
  onCreateInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'overdue'>('all');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // New Invoice Form
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 10 },
  ]);

  const orgInvoices = useMemo(
    () => invoices.filter((i) => i.organizationId === currentOrg.id),
    [invoices, currentOrg.id]
  );

  const filteredInvoices = useMemo(() => {
    return orgInvoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orgInvoices, searchTerm, statusFilter]);

  const totalBilled = useMemo(
    () => orgInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
    [orgInvoices]
  );
  const totalCollected = useMemo(
    () => orgInvoices.reduce((sum, i) => sum + i.amountPaid, 0),
    [orgInvoices]
  );
  const totalOutstanding = useMemo(
    () => orgInvoices.reduce((sum, i) => sum + i.balanceDue, 0),
    [orgInvoices]
  );

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustId) || customers[0];

    const items: InvoiceItem[] = lineItems.map((li, idx) => {
      const prod = products.find((p) => p.id === li.productId);
      const unitPrice = prod ? prod.sellingPrice : 5000;
      return {
        id: `item-${Date.now()}-${idx}`,
        productId: li.productId,
        productName: prod ? prod.name : 'Custom Item',
        sku: prod ? prod.sku : 'CUSTOM',
        quantity: li.quantity,
        unitPrice,
        discount: 0,
        taxRate: 18,
        amount: unitPrice * li.quantity,
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + tax;

    onCreateInvoice({
      organizationId: currentOrg.id,
      branchId: currentBranch.id,
      customerId: cust.id,
      customerName: cust.name,
      customerGstin: cust.gstin,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items,
      subtotal,
      cgst: Math.round(tax / 2),
      sgst: Math.round(tax / 2),
      igst: 0,
      totalTax: tax,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      status: 'unpaid',
      gstType: 'cgst_sgst',
    });

    setIsNewInvoiceOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sales & Enterprise Invoicing
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            GST-compliant invoices · Payment tracking · Automated general ledger linkage
          </div>
        </div>

        <button
          onClick={() => setIsNewInvoiceOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Customer Invoice</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Invoiced (Cumulative)</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            ₹ {totalBilled.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Settled Collections</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹ {totalCollected.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Open Balance (Receivables)</div>
          <div className="text-xl font-bold text-rose-500 tabular-nums">
            ₹ {totalOutstanding.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Invoices List Card */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice number or client name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['all', 'paid', 'partial', 'unpaid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2.5">Invoice Number</th>
                <th className="pb-2.5">Client Enterprise</th>
                <th className="pb-2.5">Date Issued</th>
                <th className="pb-2.5">Due Date</th>
                <th className="pb-2.5 text-right">Taxable</th>
                <th className="pb-2.5 text-right">GST (18%)</th>
                <th className="pb-2.5 text-right">Total (₹)</th>
                <th className="pb-2.5 text-right">Balance Due</th>
                <th className="pb-2.5 text-right">Status</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</td>
                  <td className="py-3 font-sans font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                    {inv.customerName}
                  </td>
                  <td className="py-3 text-slate-500">{inv.date}</td>
                  <td className="py-3 text-slate-500">{inv.dueDate}</td>
                  <td className="py-3 text-right text-slate-600 dark:text-slate-300">
                    ₹{inv.subtotal.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    ₹{inv.totalTax.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                    ₹{inv.totalAmount.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 text-right font-bold ${
                      inv.balanceDue > 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    ₹{inv.balanceDue.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-sans">
                    <span
                      className={`text-[11px] font-semibold uppercase ${
                        inv.status === 'paid'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : inv.status === 'partial'
                          ? 'text-amber-600'
                          : 'text-rose-500'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    <button
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      title="View / Print Tax Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Enterprise Customer Invoice
              </h3>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Customer Account</label>
                  <select
                    value={selectedCustId}
                    onChange={(e) => setSelectedCustId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-500 font-medium">Billed Products</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    + Add Product Line
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const next = [...lineItems];
                        next[idx].productId = e.target.value;
                        setLineItems(next);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.sellingPrice.toLocaleString()})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...lineItems];
                        next[idx].quantity = parseInt(e.target.value, 10) || 1;
                        setLineItems(next);
                      }}
                      className="w-20 px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                    />

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VIEW MODAL */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Invoice Document Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg p-6 space-y-4 bg-white text-slate-900 font-sans text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-base font-bold text-slate-900">{currentOrg.legalName}</div>
                  <div className="text-slate-500">{currentOrg.address}</div>
                  <div className="text-slate-600 font-mono mt-1">GSTIN: {currentOrg.gstin}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold uppercase tracking-wider text-slate-900">TAX INVOICE</div>
                  <div className="font-mono text-emerald-700 font-bold mt-0.5">{selectedInvoiceForPrint.invoiceNumber}</div>
                  <div className="text-slate-500 font-mono mt-1">Date: {selectedInvoiceForPrint.date}</div>
                  <div className="text-rose-600 font-mono">Due: {selectedInvoiceForPrint.dueDate}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">BILLED TO:</div>
                  <div className="font-bold text-slate-900">{selectedInvoiceForPrint.customerName}</div>
                  {selectedInvoiceForPrint.customerGstin && (
                    <div className="font-mono text-slate-600">GSTIN: {selectedInvoiceForPrint.customerGstin}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">STATUS</div>
                  <div className="font-bold uppercase text-slate-900">{selectedInvoiceForPrint.status}</div>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 font-semibold text-slate-600">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {selectedInvoiceForPrint.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 font-sans font-medium text-slate-900">{item.productName}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-semibold">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-3 border-t border-slate-300">
                <div className="w-56 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-sans">Subtotal</span>
                    <span>₹{selectedInvoiceForPrint.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-sans">Tax (GST 18%)</span>
                    <span>₹{selectedInvoiceForPrint.totalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
                    <span className="font-sans">Total</span>
                    <span className="text-emerald-700">₹{selectedInvoiceForPrint.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
