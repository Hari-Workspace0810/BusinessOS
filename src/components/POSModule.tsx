import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CheckCircle2,
  Printer,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  User,
} from 'lucide-react';
import { Organization, Branch, Product, Customer, Invoice, InvoiceItem } from '../types';

interface POSModuleProps {
  currentOrg: Organization;
  currentBranch: Branch;
  products: Product[];
  customers: Customer[];
  onCompleteSale: (invoice: Partial<Invoice>) => void;
}

export const POSModule: React.FC<POSModuleProps> = ({
  currentOrg,
  currentBranch,
  products,
  customers,
  onCompleteSale,
}) => {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash' | 'bank_transfer'>('upi');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [gstType, setGstType] = useState<'cgst_sgst' | 'igst'>('cgst_sgst');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  const orgProducts = useMemo(
    () => products.filter((p) => p.organizationId === currentOrg.id && p.currentStock > 0),
    [products, currentOrg.id]
  );

  const filteredProducts = useMemo(() => {
    return orgProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
    );
  }, [orgProducts, searchTerm]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || customers[0],
    [customers, selectedCustomerId]
  );

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.currentStock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Price calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const taxableSubtotal = rawSubtotal - discountAmount;
  const taxRate = 18; // standard 18% GST
  const totalTax = Math.round((taxableSubtotal * taxRate) / 100);
  const cgst = gstType === 'cgst_sgst' ? Math.round(totalTax / 2) : 0;
  const sgst = gstType === 'cgst_sgst' ? Math.round(totalTax / 2) : 0;
  const igst = gstType === 'igst' ? totalTax : 0;
  const grandTotal = taxableSubtotal + totalTax;

  // Checkout Execution
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const items: InvoiceItem[] = cart.map((item) => ({
      id: `item-${Date.now()}-${item.product.id}`,
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
      discount: 0,
      taxRate,
      amount: item.product.sellingPrice * item.quantity,
    }));

    const invoicePayload: Partial<Invoice> = {
      organizationId: currentOrg.id,
      branchId: currentBranch.id,
      customerId: selectedCustomer?.id || 'cust-walkin',
      customerName: selectedCustomer?.name || 'Walk-in Enterprise Client',
      customerGstin: selectedCustomer?.gstin,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items,
      subtotal: taxableSubtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount: grandTotal,
      amountPaid: grandTotal,
      balanceDue: 0,
      status: 'paid',
      gstType,
    };

    onCompleteSale(invoicePayload);

    // Save for print preview
    setCompletedInvoice({
      ...invoicePayload,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    } as Invoice);

    clearCart();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Point of Sale & Billing Terminal
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Real-time stock deduction · Automated GST tax calculation · Instant Tax Invoice issuance
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500">
            Terminal Branch: <strong className="text-slate-800 dark:text-slate-200">{currentBranch.name}</strong>
          </div>
        </div>
      </div>

      {/* POS Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by SKU, name, or scan barcode..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inCart = cart.find((item) => item.product.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 text-left transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {p.name}
                      </span>
                      {inCart && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                          {inCart.quantity} in cart
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">{p.sku}</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        ₹{p.sellingPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Stock: {p.currentStock} {p.unit}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">+ Add to bill</span>
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-2 p-8 text-center text-xs text-slate-400">
                  No matching inventory products found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Cart & Invoice Calculations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" /> Current Order Cart
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Customer Selector */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-500 font-medium">Billed Enterprise Account</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name} {c.gstin ? `(GST: ${c.gstin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ₹{item.product.sellingPrice.toLocaleString()} × {item.quantity} = ₹
                      {(item.product.sellingPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-600 dark:text-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold tabular-nums text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-600 dark:text-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  Cart is empty. Select items from the catalog on the left.
                </div>
              )}
            </div>

            {/* Taxes & Settings */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">GST Tax Type</label>
                  <select
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="cgst_sgst">Intra-State (CGST 9% + SGST 9%)</option>
                    <option value="igst">Inter-State (IGST 18%)</option>
                  </select>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-slate-500 block mb-1">Payment Tender</label>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-medium">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'bank_transfer', label: 'NEFT', icon: Receipt },
                    { id: 'cash', label: 'Cash', icon: Banknote },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === m.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span className="font-sans">Subtotal</span>
                  <span>₹{rawSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span className="font-sans">Discount ({discountPercent}%)</span>
                    <span>- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {gstType === 'cgst_sgst' ? (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span className="font-sans">Central GST (9%)</span>
                      <span>₹{cgst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span className="font-sans">State GST (9%)</span>
                      <span>₹{sgst.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span className="font-sans">Integrated GST (18%)</span>
                    <span>₹{igst.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-sans">Grand Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale & Issue GST Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETED INVOICE / PRINTABLE MODAL */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            {/* Modal actions bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Tax Invoice Generated Successfully
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setCompletedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Content */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-6 space-y-6 bg-white text-slate-900 font-sans text-xs">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">{currentOrg.legalName}</div>
                  <div className="text-slate-500">{currentOrg.address}</div>
                  <div className="text-slate-600 font-mono mt-1">
                    GSTIN: <strong>{currentOrg.gstin || '27AAACA1234A1Z5'}</strong>
                  </div>
                  <div className="text-slate-500">Email: {currentOrg.email} · Phone: {currentOrg.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    TAX INVOICE
                  </div>
                  <div className="font-mono text-emerald-700 font-bold mt-1">
                    {completedInvoice.invoiceNumber}
                  </div>
                  <div className="text-slate-500 font-mono mt-1">Date: {completedInvoice.date}</div>
                  <div className="text-slate-500 font-mono">Branch: {currentBranch.code}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
                <div>
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">BILLED TO (BUYER)</div>
                  <div className="font-bold text-slate-900">{completedInvoice.customerName}</div>
                  {completedInvoice.customerGstin && (
                    <div className="font-mono text-slate-600">GSTIN: {completedInvoice.customerGstin}</div>
                  )}
                  <div className="text-slate-500">Terms: Immediate Settlement</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">PAYMENT STATUS</div>
                  <div className="font-bold text-emerald-700 uppercase">FULLY PAID (SETTLED)</div>
                  <div className="text-slate-500 font-mono">Tender: {paymentMethod.toUpperCase()}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 font-semibold text-slate-600">
                    <th className="pb-2">Description of Goods</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Tax Rate</th>
                    <th className="pb-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {completedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-sans font-medium text-slate-900">{item.productName}</td>
                      <td className="py-2 text-slate-500">{item.sku}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right">{item.taxRate}%</td>
                      <td className="py-2 text-right font-semibold">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tax & Total Calculation */}
              <div className="flex justify-end pt-3 border-t border-slate-300">
                <div className="w-64 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-sans">Taxable Amount</span>
                    <span>₹{completedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {completedInvoice.gstType === 'cgst_sgst' ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-sans">CGST (9%)</span>
                        <span>₹{completedInvoice.cgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-sans">SGST (9%)</span>
                        <span>₹{completedInvoice.sgst.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span className="font-sans">IGST (18%)</span>
                      <span>₹{completedInvoice.igst.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
                    <span className="font-sans">Total Amount</span>
                    <span className="text-emerald-700">₹{completedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signoff */}
              <div className="flex justify-between items-end pt-8 text-[11px] text-slate-500">
                <div>
                  <div>Declaration: We declare that this invoice shows the actual price of the goods</div>
                  <div>described and that all particulars are true and correct.</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{currentOrg.legalName}</div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1">Authorised Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
