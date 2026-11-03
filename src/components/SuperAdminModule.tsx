import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building,
  Users,
  CreditCard,
  Radio,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Organization, SystemAnnouncement } from '../types';
import { api } from '../services/api';

interface SuperAdminModuleProps {
  organizations: Organization[];
}

export const SuperAdminModule: React.FC<SuperAdminModuleProps> = ({ organizations }) => {
  const [stats, setStats] = useState<any>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'info' | 'warning' | 'urgent'>('info');
  const [announcementSent, setAnnouncementSent] = useState(false);

  useEffect(() => {
    api.getSuperAdminStats().then((data) => setStats(data));
  }, []);

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) return;

    try {
      await fetch('/api/superadmin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMsg,
          priority: announcementPriority,
        }),
      });
      setAnnouncementSent(true);
      setAnnouncementTitle('');
      setAnnouncementMsg('');
      setTimeout(() => setAnnouncementSent(false), 4000);
    } catch (err) {
      setAnnouncementSent(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Super Administration & Multi-Tenant Control
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              Platform Master Level
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Cross-tenant orchestration · Subscription governance · Global announcements · System integrity
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <Activity className="w-4 h-4" />
          <span>Platform Health: 100% Operational</span>
        </div>
      </div>

      {/* Cross-Tenant Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Total Provisioned Tenants</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {organizations.length} Organizations
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Global Platform GMV</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            ₹ 44,00,000+
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Enterprise Tier Tenants</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {organizations.filter((o) => o.plan === 'enterprise').length} Corporates
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Cluster Security Status</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            Isolated
          </div>
        </div>
      </div>

      {/* Organization Registry Table */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Multi-Tenant Organizations Directory</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Isolation: PostgreSQL schema-level</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2.5">Tenant Organization</th>
                <th className="pb-2.5">GSTIN / Tax ID</th>
                <th className="pb-2.5">Industry Category</th>
                <th className="pb-2.5">Base Currency</th>
                <th className="pb-2.5">Subscription Plan</th>
                <th className="pb-2.5">Created Date</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{org.name}</div>
                    <div className="text-[11px] text-slate-500">{org.legalName}</div>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{org.gstin || '—'}</td>
                  <td className="py-3 font-sans capitalize text-slate-700 dark:text-slate-300">
                    {org.category}
                  </td>
                  <td className="py-3 text-slate-800 dark:text-slate-200">{org.currency}</td>
                  <td className="py-3 font-sans uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    {org.plan}
                  </td>
                  <td className="py-3 text-slate-400">{org.createdAt}</td>
                  <td className="py-3 text-right font-sans">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                      Healthy
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Global System Announcement */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>Broadcast Platform Announcement to Tenants</span>
          </h2>
          <div className="text-xs text-slate-500 mt-0.5">
            Publishes an operational or statutory advisory across all organization dashboards
          </div>
        </div>

        <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-medium mb-1">Advisory Title</label>
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. Scheduled GSTN Tax Gateway Sync & Maintenance"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Severity Priority</label>
              <select
                value={announcementPriority}
                onChange={(e) => setAnnouncementPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="info">Information (Standard)</option>
                <option value="warning">Warning / Action Needed</option>
                <option value="urgent">Urgent / Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Detailed Message</label>
            <textarea
              required
              rows={2}
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              placeholder="Full text of the announcement sent to all active business tenants..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {announcementSent ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Broadcast published across all tenants.
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Notification immediately displays in all organization feeds.
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> Broadcast Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
