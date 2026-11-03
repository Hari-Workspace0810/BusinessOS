import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Building2,
  Users,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Organization } from '../types';

interface SubscriptionModuleProps {
  currentOrg: Organization;
  onUpdatePlan: (plan: Organization['plan']) => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free Community',
    priceINR: 0,
    priceUSD: 0,
    cadence: 'Forever Free',
    target: 'For solo entrepreneurs & pilot evaluations',
    maxUsers: 2,
    maxBranches: 1,
    maxInvoicesMonth: 25,
    aiQueriesMonth: 50,
    features: [
      'Single Branch Operations',
      'Basic Point of Sale & Billing',
      'Inventory Tracking (Up to 50 SKUs)',
      'Basic Financial Ledger',
      'Community Documentation Support',
    ],
  },
  {
    id: 'starter',
    name: 'Business Starter',
    priceINR: 4999,
    priceUSD: 59,
    cadence: 'per organization / month',
    target: 'For growing small businesses & retailers',
    maxUsers: 10,
    maxBranches: 2,
    maxInvoicesMonth: 250,
    aiQueriesMonth: 500,
    features: [
      'Up to 2 Operating Branches',
      'GST Tax Invoicing & E-Way Bills',
      'HRMS Attendance & Leave Tracker',
      'Procurement & Purchase Orders',
      'Gemini AI Business Assistant',
      'Standard Business Hours Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Scale',
    priceINR: 14999,
    priceUSD: 179,
    cadence: 'per organization / month',
    target: 'For mid-size multi-unit companies & manufacturing',
    maxUsers: 50,
    maxBranches: 5,
    maxInvoicesMonth: 2500,
    aiQueriesMonth: 3000,
    popular: true,
    features: [
      'Up to 5 Operating Branches',
      'Multi-Warehouse Inventory Transfer',
      'Predictive Finance & What-If Simulator',
      'Full Double-Entry GAAP Ledger & Audits',
      'Automated Workflow Notification Rules',
      'Dedicated Customer Success Partner',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Global',
    priceINR: 39999,
    priceUSD: 499,
    cadence: 'per organization / month',
    target: 'For multi-branch corporations & conglomerates',
    maxUsers: 9999,
    maxBranches: 9999,
    maxInvoicesMonth: 99999,
    aiQueriesMonth: 99999,
    features: [
      'Unlimited Branches & Hubs',
      'Granular Role-Based Access Control (RBAC)',
      'Full Gemini 3.8 Flash Neural Engine',
      'High-Volume POS & Automated GRN',
      'Custom ERP API & Webhook Integrations',
      '24/7 Dedicated SLA with 99.99% Uptime',
    ],
  },
];

export const SubscriptionModule: React.FC<SubscriptionModuleProps> = ({
  currentOrg,
  onUpdatePlan,
}) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [upgradedPlanName, setUpgradedPlanName] = useState('');

  const handleSelectPlan = (planId: Organization['plan'], planName: string) => {
    onUpdatePlan(planId);
    setUpgradedPlanName(planName);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription & Commercial License
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Transparent enterprise tier quotas · Real-time operational usage meters · Seamless upgrade
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              currency === 'INR'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            INR (₹)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              currency === 'USD'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      {/* Current Quota Utilization Strip */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">ACTIVE SUBSCRIPTION TIER:</span>
            <div className="text-base font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <span>{currentOrg.plan} Edition</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Active & Verified
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            Next renewal cycle: <strong className="text-slate-800 dark:text-slate-200">15 November 2026</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <div className="text-slate-400">Users Provisioned</div>
            <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
              5 / {currentOrg.plan === 'enterprise' ? 'Unlimited' : '50'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Branches Deployed</div>
            <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
              3 / {currentOrg.plan === 'enterprise' ? 'Unlimited' : '5'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Invoices Issued</div>
            <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
              3 / {currentOrg.plan === 'enterprise' ? 'Unlimited' : '2,500'}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Gemini Neural Queries</div>
            <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
              142 / {currentOrg.plan === 'enterprise' ? 'Unlimited' : '3,000'}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentOrg.plan === plan.id;
          const priceStr =
            currency === 'INR'
              ? plan.priceINR === 0
                ? '₹0'
                : `₹${plan.priceINR.toLocaleString()}`
              : plan.priceUSD === 0
              ? '$0'
              : `$${plan.priceUSD}`;

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{plan.name}</h3>
                    {plan.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{plan.target}</div>
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {priceStr}
                  </div>
                  <div className="text-[11px] text-slate-400">{plan.cadence}</div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan.id as any, plan.name)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select License Tier'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              License Tier Updated
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your organization <strong>{currentOrg.name}</strong> is now licensed under <strong>{upgradedPlanName}</strong>. Quotas and multi-branch modules have been immediately provisioned.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
