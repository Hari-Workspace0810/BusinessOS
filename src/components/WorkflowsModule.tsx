import React from 'react';
import {
  Workflow,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Organization, WorkflowRule } from '../types';

interface WorkflowsModuleProps {
  currentOrg: Organization;
  workflows: WorkflowRule[];
  onToggleWorkflow: (id: string) => void;
}

export const WorkflowsModule: React.FC<WorkflowsModuleProps> = ({
  currentOrg,
  workflows,
  onToggleWorkflow,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Automated Business Workflows
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Event-driven triggers · Multi-tier authorization rules · Low-stock replenishment automation
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Organization Rules: <strong>{currentOrg.name}</strong>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              wf.isEnabled
                ? 'border-emerald-500/80 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-70'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {wf.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    wf.isEnabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {wf.isEnabled ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Event Trigger:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 uppercase font-semibold">
                    {wf.trigger.replace('_', ' ')}
                  </span>
                </div>
                {wf.thresholdValue && (
                  <div className="flex justify-between text-slate-500">
                    <span>Threshold Limit:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {wf.trigger === 'po_high_value' ? `₹${wf.thresholdValue.toLocaleString()}` : `${wf.thresholdValue} units`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Action Dispatched:</span>
                  <span className="font-sans text-slate-800 dark:text-slate-200 font-medium">
                    {wf.action.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Trigger Status</span>
              <button
                onClick={() => onToggleWorkflow(wf.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  wf.isEnabled
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {wf.isEnabled ? 'Deactivate' : 'Enable Rule'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
