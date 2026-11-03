import React, { useState, useMemo } from 'react';
import {
  Users2,
  Plus,
  Kanban,
  Table as TableIcon,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  ChevronRight,
  Search,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Organization, Customer } from '../types';

interface CRMModuleProps {
  currentOrg: Organization;
  customers: Customer[];
  onAddCustomer: (cust: Partial<Customer>) => void;
  onUpdateStage: (id: string, stage: Customer['stage']) => void;
}

const PIPELINE_STAGES: { id: Customer['stage']; title: string; color: string }[] = [
  { id: 'new', title: 'New Leads', color: 'border-slate-400' },
  { id: 'contacted', title: 'Contacted', color: 'border-blue-400' },
  { id: 'proposal', title: 'Proposal Sent', color: 'border-amber-400' },
  { id: 'negotiation', title: 'Negotiation', color: 'border-purple-400' },
  { id: 'won', title: 'Closed Won', color: 'border-emerald-500' },
  { id: 'lost', title: 'Closed Lost', color: 'border-rose-400' },
];

export const CRMModule: React.FC<CRMModuleProps> = ({
  currentOrg,
  customers,
  onAddCustomer,
  onUpdateStage,
}) => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'directory'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New customer form state
  const [newCust, setNewCust] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    type: 'lead' as 'lead' | 'customer',
    stage: 'new' as Customer['stage'],
    dealValue: '',
  });

  const orgCustomers = useMemo(
    () => customers.filter((c) => c.organizationId === currentOrg.id),
    [customers, currentOrg.id]
  );

  const filteredCustomers = useMemo(() => {
    return orgCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orgCustomers, searchTerm]);

  const pipelineValue = useMemo(() => {
    return orgCustomers
      .filter((c) => c.stage !== 'lost')
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);
  }, [orgCustomers]);

  const totalWonValue = useMemo(() => {
    return orgCustomers
      .filter((c) => c.stage === 'won')
      .reduce((sum, c) => sum + (c.clv || c.dealValue || 0), 0);
  }, [orgCustomers]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer({
      organizationId: currentOrg.id,
      name: newCust.name,
      company: newCust.company,
      email: newCust.email,
      phone: newCust.phone,
      gstin: newCust.gstin,
      address: newCust.address,
      type: newCust.type,
      stage: newCust.stage,
      dealValue: parseFloat(newCust.dealValue) || 0,
      tags: ['New Prospect', 'Inbound'],
    });
    setIsAddModalOpen(false);
    setNewCust({
      name: '',
      company: '',
      email: '',
      phone: '',
      gstin: '',
      address: '',
      type: 'lead',
      stage: 'new',
      dealValue: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enterprise CRM & Sales Pipeline
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Key enterprise accounts · Sales conversion funnel · Customer Lifetime Value (CLV)
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Pipeline
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'directory'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Directory
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account / Lead</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Active Pipeline Volume</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            ₹ {pipelineValue.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Realized Won CLV</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹ {totalWonValue.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Corporate Accounts</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {orgCustomers.length} Accounts
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Win Conversion Rate</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {orgCustomers.length > 0
              ? Math.round((orgCustomers.filter((c) => c.stage === 'won').length / orgCustomers.length) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts, contact persons, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageCustomers = filteredCustomers.filter((c) => c.stage === stage.id);
            const stageValue = stageCustomers.reduce((acc, c) => acc + (c.dealValue || 0), 0);

            return (
              <div
                key={stage.id}
                className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 min-w-[210px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {stage.title}
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {stageCustomers.length}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  ₹ {stageValue.toLocaleString()}
                </div>

                <div className="space-y-2.5 min-h-[300px]">
                  {stageCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xs space-y-2 text-xs hover:border-emerald-500/50 transition-all"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {cust.company || cust.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{cust.name}</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹ {cust.dealValue.toLocaleString()}
                      </div>

                      {/* Advance Stage buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <select
                          value={cust.stage}
                          onChange={(e) => onUpdateStage(cust.id, e.target.value as any)}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        >
                          {PIPELINE_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageCustomers.length === 0 && (
                    <div className="p-4 text-center text-[11px] text-slate-400">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DIRECTORY TABLE */}
      {viewMode === 'directory' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Company / Enterprise</th>
                  <th className="pb-2.5">Primary Contact</th>
                  <th className="pb-2.5">Email</th>
                  <th className="pb-2.5">GSTIN</th>
                  <th className="pb-2.5">Funnel Stage</th>
                  <th className="pb-2.5 text-right">Deal Value</th>
                  <th className="pb-2.5 text-right">CLV Realized</th>
                  <th className="pb-2.5 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {c.company || c.name}
                    </td>
                    <td className="py-3 font-sans text-slate-700 dark:text-slate-300">{c.name}</td>
                    <td className="py-3 text-slate-500">{c.email}</td>
                    <td className="py-3 text-slate-400">{c.gstin || '—'}</td>
                    <td className="py-3 font-sans capitalize font-medium text-slate-800 dark:text-slate-200">
                      {c.stage}
                    </td>
                    <td className="py-3 text-right text-slate-700 dark:text-slate-300">
                      ₹{c.dealValue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{c.clv.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        c.outstandingBalance > 0 ? 'text-rose-500' : 'text-slate-400'
                      }`}
                    >
                      ₹{c.outstandingBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT / LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register Customer or Sales Prospect
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Company / Enterprise</label>
                  <input
                    type="text"
                    required
                    value={newCust.company}
                    onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
                    placeholder="e.g. Reliance Logistics"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    required
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    placeholder="e.g. Ramesh Nair"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    placeholder="procurement@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Pipeline Stage</label>
                  <select
                    value={newCust.stage}
                    onChange={(e) => setNewCust({ ...newCust, stage: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Expected Deal Value (₹)</label>
                  <input
                    type="number"
                    value={newCust.dealValue}
                    onChange={(e) => setNewCust({ ...newCust, dealValue: e.target.value })}
                    placeholder="e.g. 5000000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={newCust.gstin}
                  onChange={(e) => setNewCust({ ...newCust, gstin: e.target.value })}
                  placeholder="e.g. 27AAACT2727Q1ZW"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
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
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account Dossier
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-semibold">ENTERPRISE NAME</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{selectedCustomer.company || selectedCustomer.name}</div>
                <div className="text-slate-500">{selectedCustomer.address}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">CONTACT PERSON</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.name}</div>
                  <div className="text-slate-500">{selectedCustomer.phone}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">STAGE</div>
                  <div className="font-bold uppercase text-emerald-600 dark:text-emerald-400">{selectedCustomer.stage}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold font-sans">CLV (LIFETIME VALUE)</div>
                  <div className="font-bold text-slate-900 dark:text-white">₹{selectedCustomer.clv.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold font-sans">OUTSTANDING AR</div>
                  <div className="font-bold text-rose-500">₹{selectedCustomer.outstandingBalance.toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">ACCOUNT TAGS</div>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {selectedCustomer.tags?.map((tag, i) => (
                    <span key={i} className="text-slate-600 dark:text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs mt-2"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
