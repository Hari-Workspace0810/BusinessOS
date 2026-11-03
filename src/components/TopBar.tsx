import React from 'react';
import {
  Building2,
  ChevronDown,
  Moon,
  Sun,
  Shield,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Organization, Branch, Role, User } from '../types';

interface TopBarProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  currentBranch: Branch;
  branches: Branch[];
  onSelectBranch: (branch: Branch) => void;
  currentUser: User;
  onSelectRole: (role: Role) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenNewOrgModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  org_owner: 'Org Owner',
  org_admin: 'Org Admin',
  branch_manager: 'Branch Manager',
  finance_manager: 'Finance Manager',
  inventory_manager: 'Inventory Manager',
  hr_manager: 'HR Manager',
  sales_manager: 'Sales Manager',
  employee: 'Employee',
  auditor: 'Auditor',
};

export const TopBar: React.FC<TopBarProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  currentBranch,
  branches,
  onSelectBranch,
  currentUser,
  onSelectRole,
  darkMode,
  onToggleTheme,
  onOpenNewOrgModal,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tighter">
            B·OS
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            BusinessOS
          </span>
        </div>

        {/* Organization Dropdown */}
        <div className="relative group ml-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[140px]">{currentOrg.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute left-0 mt-1 w-56 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
              SWITCH TENANT
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => onSelectOrg(org)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                  org.id === currentOrg.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className="truncate">{org.name}</span>
                <span className="text-[10px] text-slate-400">{org.currency}</span>
              </button>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
              <button
                onClick={onOpenNewOrgModal}
                className="w-full text-left px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                + Register Organization
              </button>
            </div>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="relative group">
          <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{currentBranch.city}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute left-0 mt-1 w-56 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
              ACTIVE BRANCH
            </div>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBranch(b)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                  b.id === currentBranch.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className="truncate">{b.name}</span>
                <span className="text-[10px] text-slate-400">{b.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => onSelectTab('finance')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'finance' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
          }`}
        >
          Finance & Ledger
        </button>
        <button
          onClick={() => onSelectTab('inventory')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'inventory' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
          }`}
        >
          Warehouses & Stock
        </button>
        <button
          onClick={() => onSelectTab('ai_copilot')}
          className={`flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'ai_copilot' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Gemini AI Engine</span>
        </button>
        <button
          onClick={() => onSelectTab('simulator')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'simulator' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
          }`}
        >
          Health & Simulator
        </button>
      </nav>

      {/* Zone 3: 1 primary action & role control */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Switcher (Empowers testing RBAC in real-time) */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 transition-all whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline text-slate-400">Role:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {ROLE_LABELS[currentUser.role]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute right-0 mt-1 w-48 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 hidden group-hover:block z-50">
            <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
              TEST ROLE-BASED ACCESS
            </div>
            {(
              [
                'org_owner',
                'super_admin',
                'finance_manager',
                'inventory_manager',
                'hr_manager',
                'sales_manager',
                'employee',
                'auditor',
              ] as Role[]
            ).map((r) => (
              <button
                key={r}
                onClick={() => onSelectRole(r)}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
                  currentUser.role === r
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-700">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
          />
        </div>
      </div>
    </header>
  );
};
