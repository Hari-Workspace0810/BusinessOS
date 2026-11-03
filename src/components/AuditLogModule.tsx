import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Info,
  Clock,
  User,
  Activity,
  CheckCircle2,
  RefreshCw,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  Database,
  Lock,
} from 'lucide-react';
import { Organization, AuditLogEntry } from '../types';
import {
  fetchAuditLogs,
  subscribeToAuditLogs,
  logAuditEvent,
} from '../services/firestoreService';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

interface AuditLogModuleProps {
  currentOrg: Organization;
  currentUser: { id: string; name: string; email?: string; role?: string };
}

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({
  currentOrg,
  currentUser,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Manual compliance note state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    action: 'COMPLIANCE_REVIEW_LOGGED',
    category: 'compliance' as AuditLogEntry['category'],
    severity: 'info' as AuditLogEntry['severity'],
    targetEntity: 'GovernanceRecord',
    description: '',
  });

  // Real-time subscription to tenant-scoped audit logs in Firestore
  useEffect(() => {
    if (!currentOrg?.id) return;
    setLoading(true);

    fetchAuditLogs(currentOrg.id)
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed initial audit logs fetch:', err);
        setLoading(false);
      });

    const unsubscribe = subscribeToAuditLogs(
      currentOrg.id,
      (updatedLogs) => {
        setLogs(updatedLogs);
        setLoading(false);
      },
      (err) => {
        console.error('Audit logs real-time error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrg.id]);

  // Filtered log items
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
      const matchSev = severityFilter === 'all' || log.severity === severityFilter;

      return matchSearch && matchCat && matchSev;
    });
  }, [logs, searchTerm, categoryFilter, severityFilter]);

  // Statistics
  const criticalCount = useMemo(
    () => logs.filter((l) => l.severity === 'critical').length,
    [logs]
  );
  const warningCount = useMemo(
    () => logs.filter((l) => l.severity === 'warning').length,
    [logs]
  );
  const financialCount = useMemo(
    () => logs.filter((l) => l.category === 'finance').length,
    [logs]
  );
  const inventoryCount = useMemo(
    () => logs.filter((l) => l.category === 'inventory').length,
    [logs]
  );

  // Handle Export CSV
  const handleExportCSV = () => {
    exportToCSV(
      `audit_trail_${currentOrg.id}_${new Date().toISOString().split('T')[0]}`,
      [
        { label: 'Timestamp (UTC)', key: 'timestamp' },
        { label: 'Action Event', key: 'action' },
        { label: 'Category', key: 'category' },
        { label: 'Severity', key: 'severity' },
        { label: 'Actor', key: 'actorName' },
        { label: 'Target Entity', key: 'targetEntity' },
        { label: 'Target Entity ID', key: 'targetEntityId' },
        { label: 'Description', key: 'description' },
      ],
      filteredLogs
    );
  };

  // Handle Export PDF
  const handleExportPDF = () => {
    exportToPDF({
      title: 'Enterprise Audit Trail & Accountability Report',
      subtitle: `Official Compliance Ledger for ${currentOrg.name}`,
      organizationName: currentOrg.name,
      generatedBy: `${currentUser.name} (${currentUser.role || 'Executive'})`,
      columns: [
        {
          label: 'Date & Time',
          key: 'timestamp',
          format: (val) => new Date(val).toLocaleString(),
        },
        { label: 'Action', key: 'action' },
        { label: 'Category', key: 'category' },
        { label: 'Severity', key: 'severity' },
        { label: 'Actor', key: 'actorName' },
        { label: 'Target', key: 'targetEntity' },
        { label: 'Audit Details', key: 'description' },
      ],
      data: filteredLogs,
      summaryMetrics: [
        { label: 'Total Scoped Events', value: filteredLogs.length },
        { label: 'Critical Severity', value: criticalCount },
        { label: 'Financial Alterations', value: financialCount },
        { label: 'Inventory Adjustments', value: inventoryCount },
      ],
    });
  };

  // Handle submitting manual note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.description) return;

    try {
      await logAuditEvent({
        organizationId: currentOrg.id,
        action: noteForm.action,
        category: noteForm.category,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        targetEntity: noteForm.targetEntity,
        targetEntityId: `rec-${Date.now()}`,
        description: noteForm.description,
        details: { manualNote: true, author: currentUser.name },
        severity: noteForm.severity,
      });

      setIsNoteModalOpen(false);
      setNoteForm({
        action: 'COMPLIANCE_REVIEW_LOGGED',
        category: 'compliance',
        severity: 'info',
        targetEntity: 'GovernanceRecord',
        description: '',
      });
    } catch (err) {
      console.error('Failed to log audit note:', err);
    }
  };

  const getSeverityBadge = (sev: AuditLogEntry['severity']) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Info className="w-2.5 h-2.5" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Header & Persistence Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Enterprise Audit Trail & Compliance
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE FIRESTORE
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Tamper-evident, tenant-isolated record of all sensitive business operations, financial reversals, and inventory adjustments.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Compliance Entry</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Download CSV of filtered audit records"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              title="Generate printable PDF audit document"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive PDF</span>
            </button>
          </div>
        </div>

        {/* Security Meta Line */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Database Scope:</span>
              <code className="text-slate-300 font-mono text-[10px]">ai-studio-businessos-68303b3d-b820-4979-8c6b-b983609000e7</code>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tenant ID:</span>
              <strong className="text-emerald-300 font-mono text-[10px]">{currentOrg.id}</strong>
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px]">
              Collection: <span className="text-slate-300">/auditLogs</span> &bull; Scoped by <span className="text-emerald-400">organizationId</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Total Audit Records
          </span>
          <div className="text-2xl font-bold text-white tracking-tight">{logs.length}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Live real-time stream</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Financial Reversals
          </span>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">{financialCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">General ledger adjustments</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Inventory Adjustments
          </span>
          <div className="text-2xl font-bold text-sky-400 tracking-tight">{inventoryCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Transfers & reconciliations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Critical Alerts
          </span>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{criticalCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">{warningCount} warnings recorded</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="finance">Finance & Ledger</option>
            <option value="inventory">Inventory & Warehouse</option>
            <option value="security">Security & Access</option>
            <option value="compliance">Compliance & Legal</option>
            <option value="governance">Corporate Governance</option>
            <option value="procurement">Procurement</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table / Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200">
            Audit Stream ({filteredLogs.length} events logged)
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Showing records for organization: {currentOrg.name}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
            <span>Streaming audit records from Cloud Firestore...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No audit records match the selected filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-slate-200">
                            {log.action}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {log.category}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Target: <strong className="text-slate-300">{log.targetEntity}</strong> ({log.targetEntityId})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 ml-7 md:ml-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>{log.actorName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                          title="View JSON Payload"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Payload / Diff */}
                  {isExpanded && log.details && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 pl-7">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Audit Event Metadata & Diff Payload
                      </div>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Compliance Entry Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Record Manual Compliance Audit Entry
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Directly records a notarized governance entry into the Firestore audit log collection.
            </p>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Action Event Code
                </label>
                <input
                  type="text"
                  value={noteForm.action}
                  onChange={(e) => setNoteForm({ ...noteForm, action: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={noteForm.category}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, category: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="compliance">Compliance</option>
                    <option value="finance">Finance</option>
                    <option value="inventory">Inventory</option>
                    <option value="security">Security</option>
                    <option value="governance">Governance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Severity
                  </label>
                  <select
                    value={noteForm.severity}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, severity: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Audit Findings & Description
                </label>
                <textarea
                  rows={3}
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  placeholder="Details of the manual review, statutory compliance check, or external audit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Save to Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogModule;
