import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Organization, Product, Warehouse } from '../types';
import { INITIAL_WAREHOUSES } from '../data/mockDatabase';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

interface InventoryModuleProps {
  currentOrg: Organization;
  products: Product[];
  onAddProduct: (prod: Partial<Product>) => void;
  onTransferStock: (data: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  currentOrg,
  products,
  onAddProduct,
  onTransferStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<Product | null>(null);

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    category: 'IoT Controllers',
    unit: 'Units',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    reorderLevel: '50',
    warehouseId: 'wh-1',
  });

  // Transfer form state
  const [transferData, setTransferData] = useState({
    productId: products[0]?.id || '',
    fromWarehouseId: 'wh-1',
    toWarehouseId: 'wh-2',
    quantity: '10',
  });

  const orgProducts = useMemo(
    () => products.filter((p) => p.organizationId === currentOrg.id),
    [products, currentOrg.id]
  );

  const warehouses = INITIAL_WAREHOUSES.filter((w) => w.organizationId === currentOrg.id);

  const categories = useMemo(() => {
    const set = new Set(orgProducts.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [orgProducts]);

  const filteredProducts = useMemo(() => {
    return orgProducts.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm);
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [orgProducts, searchTerm, selectedCategory]);

  const totalValuation = useMemo(
    () => orgProducts.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0),
    [orgProducts]
  );

  const lowStockCount = useMemo(
    () => orgProducts.filter((p) => p.currentStock <= p.reorderLevel).length,
    [orgProducts]
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      organizationId: currentOrg.id,
      name: newProd.name,
      sku: newProd.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: newProd.category,
      unit: newProd.unit,
      costPrice: parseFloat(newProd.costPrice) || 0,
      sellingPrice: parseFloat(newProd.sellingPrice) || 0,
      currentStock: parseInt(newProd.currentStock, 10) || 0,
      reorderLevel: parseInt(newProd.reorderLevel, 10) || 20,
      minStock: 20,
      maxStock: 500,
      warehouseId: newProd.warehouseId,
      batchNumber: `BT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}X`,
    });
    setIsAddModalOpen(false);
    setNewProd({
      name: '',
      sku: '',
      category: 'IoT Controllers',
      unit: 'Units',
      costPrice: '',
      sellingPrice: '',
      currentStock: '',
      reorderLevel: '50',
      warehouseId: 'wh-1',
    });
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    onTransferStock({
      productId: transferData.productId,
      fromWarehouseId: transferData.fromWarehouseId,
      toWarehouseId: transferData.toWarehouseId,
      quantity: parseInt(transferData.quantity, 10) || 0,
    });
    setIsTransferModalOpen(false);
  };

  const currencySymbol = currentOrg.currency === 'INR' ? '₹' : '$';

  const handleExportCSV = () => {
    exportToCSV(
      `Inventory_Catalog_${currentOrg.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`,
      [
        { label: 'SKU Code', key: 'sku' },
        { label: 'Product Name', key: 'name' },
        { label: 'Category', key: 'category' },
        { label: 'Current Stock', key: 'currentStock' },
        { label: 'Unit', key: 'unit' },
        { label: `Cost Price (${currentOrg.currency})`, key: 'costPrice' },
        { label: `Selling Price (${currentOrg.currency})`, key: 'sellingPrice' },
        { label: 'Reorder Level', key: 'reorderLevel' },
        { label: 'Stock Status', key: 'status' },
        { label: 'Barcode', key: 'barcode' },
      ],
      filteredProducts
    );
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Warehouse Inventory Catalog & Valuation Report',
      subtitle: `Official Stock Ledger & Depot Audit for ${currentOrg.name}`,
      organizationName: currentOrg.name,
      columns: [
        { label: 'SKU', key: 'sku' },
        { label: 'Product Name', key: 'name' },
        { label: 'Category', key: 'category' },
        { label: 'Stock', key: 'currentStock', format: (v, row) => `${v} ${row.unit}` },
        { label: `Cost`, key: 'costPrice', format: (v) => `${currencySymbol} ${v.toLocaleString()}` },
        { label: `Price`, key: 'sellingPrice', format: (v) => `${currencySymbol} ${v.toLocaleString()}` },
        { label: 'Status', key: 'status', format: (v) => v === 'low_stock' ? 'LOW STOCK' : 'IN STOCK' },
      ],
      data: filteredProducts,
      summaryMetrics: [
        { label: 'Filtered Catalog Items', value: filteredProducts.length },
        { label: 'Total Valuation', value: `${currencySymbol} ${totalValuation.toLocaleString()}` },
        { label: 'Low Stock Alerts', value: lowStockCount },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory & Warehouse Logistics
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Multi-depot stock allocation · Automated reorder triggers · Barcode tracking
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Download CSV of currently filtered inventory"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Generate printable PDF of inventory catalog"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Warehouse Transfer</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Catalog Items</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {orgProducts.length} Active SKUs
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Inventory Valuation</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹ {totalValuation.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Critical Reorder Alerts</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {lowStockCount} SKUs Low
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Active Fulfillment Warehouses</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {warehouses.length} Facilities
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {lowStockCount} items have fallen below their safety buffer thresholds. Recommend issuing replenishment purchase orders.
            </span>
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-[11px] font-semibold underline text-amber-800 dark:text-amber-300 ml-4 whitespace-nowrap"
          >
            Review Restock
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SKU, Product Name, or Barcode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors capitalize whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2.5">Item Name</th>
                <th className="pb-2.5">SKU</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Batch #</th>
                <th className="pb-2.5 text-right">Cost Price</th>
                <th className="pb-2.5 text-right">Selling Price</th>
                <th className="pb-2.5 text-right">Stock Level</th>
                <th className="pb-2.5 text-right">Reorder Threshold</th>
                <th className="pb-2.5 text-right">Status</th>
                <th className="pb-2.5 text-right">Barcode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredProducts.map((p) => {
                const isLow = p.currentStock <= p.reorderLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{p.sku}</td>
                    <td className="py-3 font-sans text-slate-500">{p.category}</td>
                    <td className="py-3 text-slate-400">{p.batchNumber}</td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-300">
                      ₹{p.costPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{p.sellingPrice.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 text-right font-bold text-sm ${
                        isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </td>
                    <td className="py-3 text-right text-slate-400">{p.reorderLevel} {p.unit}</td>
                    <td className="py-3 text-right font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          isLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      <button
                        onClick={() => setSelectedBarcodeProduct(p)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Barcode & QR Payload"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WAREHOUSE DISTRIBUTION CARDS */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-500" /> Multi-Warehouse Hub Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900 dark:text-white">{wh.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{wh.code}</span>
              </div>
              <div className="text-[11px] text-slate-500">{wh.location}</div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Capacity Utilization</span>
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                  {Math.round((orgProducts.reduce((sum, p) => sum + p.currentStock, 0) / wh.capacityUnits) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Inventory Product
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Industrial Sensor Array 4X"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    placeholder="e.g. APX-SNS-04X"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProd.sellingPrice}
                    onChange={(e) => setNewProd({ ...newProd, sellingPrice: e.target.value })}
                    placeholder="e.g. 6200"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.currentStock}
                    onChange={(e) => setNewProd({ ...newProd, currentStock: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Reorder Level</label>
                  <input
                    type="number"
                    required
                    value={newProd.reorderLevel}
                    onChange={(e) => setNewProd({ ...newProd, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAREHOUSE TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inter-Warehouse Stock Transfer
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Select Product</label>
                <select
                  value={transferData.productId}
                  onChange={(e) => setTransferData({ ...transferData, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {orgProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Available: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Source Depot</label>
                  <select
                    value={transferData.fromWarehouseId}
                    onChange={(e) => setTransferData({ ...transferData, fromWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Target Depot</label>
                  <select
                    value={transferData.toWarehouseId}
                    onChange={(e) => setTransferData({ ...transferData, toWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARCODE & QR INSPECTOR MODAL */}
      {selectedBarcodeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Item Traceability Payload
            </h3>
            <div className="text-xs text-slate-500">{selectedBarcodeProduct.name}</div>

            {/* Simulated Clean Barcode Render */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 inline-block space-y-2">
              <div className="flex items-center justify-center gap-1 h-16 px-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-slate-900 h-full ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'}`}
                  />
                ))}
              </div>
              <div className="font-mono text-xs tracking-widest text-slate-900">
                {selectedBarcodeProduct.barcode}
              </div>
            </div>

            <div className="text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-[11px] font-mono space-y-1 text-slate-600 dark:text-slate-300">
              <div>SKU: {selectedBarcodeProduct.sku}</div>
              <div>Batch: {selectedBarcodeProduct.batchNumber}</div>
              <div>Buffer: {selectedBarcodeProduct.reorderLevel} units</div>
            </div>

            <button
              onClick={() => setSelectedBarcodeProduct(null)}
              className="w-full py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
