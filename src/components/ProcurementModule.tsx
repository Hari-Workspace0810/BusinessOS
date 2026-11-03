import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  PackageCheck,
  Star,
  FileCheck,
  Building,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Organization, Branch, Supplier, PurchaseOrder, Product } from '../types';

interface ProcurementModuleProps {
  currentOrg: Organization;
  currentBranch: Branch;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onCreatePO: (po: Partial<PurchaseOrder>) => void;
  onUpdatePOStatus: (id: string, status: PurchaseOrder['status']) => void;
}

export const ProcurementModule: React.FC<ProcurementModuleProps> = ({
  currentOrg,
  currentBranch,
  suppliers,
  purchaseOrders,
  products,
  onCreatePO,
  onUpdatePOStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);

  // New PO State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState('');
  const [poLines, setPoLines] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 50 },
  ]);

  const orgSuppliers = useMemo(
    () => suppliers.filter((s) => s.organizationId === currentOrg.id),
    [suppliers, currentOrg.id]
  );

  const orgPOs = useMemo(
    () => purchaseOrders.filter((po) => po.organizationId === currentOrg.id),
    [purchaseOrders, currentOrg.id]
  );

  const totalCommittedPO = useMemo(
    () => orgPOs.reduce((sum, po) => sum + po.totalAmount, 0),
    [orgPOs]
  );

  const totalOutstandingPayable = useMemo(
    () => orgSuppliers.reduce((sum, s) => sum + s.outstandingPayable, 0),
    [orgSuppliers]
  );

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = orgSuppliers.find((s) => s.id === selectedSupplierId) || orgSuppliers[0];

    const items = poLines.map((line, idx) => {
      const prod = products.find((p) => p.id === line.productId);
      const unitCost = prod ? prod.costPrice : 3000;
      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: line.productId,
        productName: prod ? prod.name : 'Component Item',
        quantity: line.quantity,
        unitPrice: unitCost,
        total: unitCost * line.quantity,
      };
    });

    const totalAmount = items.reduce((sum, it) => sum + it.total, 0);

    onCreatePO({
      organizationId: currentOrg.id,
      branchId: currentBranch.id,
      supplierId: sup.id,
      supplierName: sup.name,
      date: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items,
      totalAmount,
    });

    setIsNewPOOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Procurement & Supply Chain
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Vendor management · Multi-tier purchase approvals · Goods Received Notes (GRN)
          </div>
        </div>

        <button
          onClick={() => setIsNewPOOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate Purchase Order</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Committed Procurement</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            ₹ {totalCommittedPO.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Accounts Payable (Suppliers)</div>
          <div className="text-xl font-bold text-rose-500 tabular-nums">
            ₹ {totalOutstandingPayable.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Pending Approval POs</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {orgPOs.filter((p) => p.status === 'pending_approval').length} Orders
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Strategic Suppliers</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {orgSuppliers.length} Verified Vendors
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs max-w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Purchase Orders ({orgPOs.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Vendor Profiles ({orgSuppliers.length})
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">PO Number</th>
                  <th className="pb-2.5">Supplier Partner</th>
                  <th className="pb-2.5">Order Date</th>
                  <th className="pb-2.5">Expected Delivery</th>
                  <th className="pb-2.5">Line Items</th>
                  <th className="pb-2.5 text-right">PO Total</th>
                  <th className="pb-2.5 text-right">Approval Status</th>
                  <th className="pb-2.5 text-right">GRN & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {orgPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{po.poNumber}</td>
                    <td className="py-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                      {po.supplierName}
                    </td>
                    <td className="py-3 text-slate-500">{po.date}</td>
                    <td className="py-3 text-slate-500">{po.expectedDate}</td>
                    <td className="py-3 font-sans text-slate-600 dark:text-slate-300">
                      {po.items.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{po.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-sans">
                      <span
                        className={`text-[11px] font-semibold uppercase ${
                          po.status === 'received'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : po.status === 'approved'
                            ? 'text-blue-600'
                            : po.status === 'pending_approval'
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {po.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      {po.status === 'pending_approval' && (
                        <button
                          onClick={() => onUpdatePOStatus(po.id, 'approved')}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px]"
                        >
                          Approve PO
                        </button>
                      )}
                      {po.status === 'approved' && (
                        <button
                          onClick={() => onUpdatePOStatus(po.id, 'received')}
                          className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <PackageCheck className="w-3 h-3" /> Receive (GRN)
                        </button>
                      )}
                      {po.status === 'received' && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Stock Integrated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orgSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{sup.name}</h3>
                  <div className="text-[11px] text-slate-500">{sup.address}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {sup.rating}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{sup.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{sup.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GSTIN:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{sup.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credit Terms:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{sup.paymentTerms}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Payable Balance:</span>
                <span className="font-bold font-mono text-rose-500">
                  ₹{sup.outstandingPayable.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PO MODAL */}
      {isNewPOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Supplier Purchase Order
              </h3>
              <button
                onClick={() => setIsNewPOOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Vendor Partner</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {orgSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Select Item to Replenish</label>
                <div className="flex items-center gap-2">
                  <select
                    value={poLines[0].productId}
                    onChange={(e) => {
                      const next = [...poLines];
                      next[0].productId = e.target.value;
                      setPoLines(next);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Cost: ₹{p.costPrice.toLocaleString()})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={poLines[0].quantity}
                    onChange={(e) => {
                      const next = [...poLines];
                      next[0].quantity = parseInt(e.target.value, 10) || 1;
                      setPoLines(next);
                    }}
                    className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPOOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
