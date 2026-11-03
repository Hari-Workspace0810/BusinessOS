import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Package,
  ShoppingCart,
  Receipt,
  Users2,
  UserCheck,
  Truck,
  KanbanSquare,
  BarChart3,
  Bot,
  Activity,
  FileText,
  Workflow,
  CreditCard,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: Role;
  pendingApprovalsCount?: number;
  lowStockCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  userRole,
  pendingApprovalsCount = 1,
  lowStockCount = 2,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'finance', label: 'Finance & Accounting', icon: Wallet },
        { id: 'inventory', label: 'Inventory & Warehouses', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
        { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart },
        { id: 'sales', label: 'Sales & Invoices', icon: Receipt },
      ],
    },
    {
      title: 'ENTERPRISE RELATIONS',
      items: [
        { id: 'crm', label: 'CRM & Sales Pipeline', icon: Users2 },
        { id: 'hrms', label: 'HRMS & Payroll', icon: UserCheck },
        { id: 'procurement', label: 'Procurement & Suppliers', icon: Truck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined },
        { id: 'projects', label: 'Projects & Tasks', icon: KanbanSquare },
      ],
    },
    {
      title: 'INTELLIGENCE & AI',
      items: [
        { id: 'bi', label: 'Business Intelligence', icon: BarChart3 },
        { id: 'ai_copilot', label: 'Gemini AI Assistant', icon: Bot, highlight: true },
        { id: 'simulator', label: 'Health & Risk Simulator', icon: Activity },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'documents', label: 'Documents & Reports', icon: FileText },
        { id: 'workflows', label: 'Automated Workflows', icon: Workflow },
        { id: 'subscription', label: 'Subscription & SaaS', icon: CreditCard },
        ...(userRole === 'super_admin'
          ? [{ id: 'superadmin', label: 'Super Admin Console', icon: ShieldAlert }]
          : []),
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 select-none ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.highlight
                        ? 'text-emerald-500'
                        : 'text-slate-400 dark:text-slate-400'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && item.badge !== undefined && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            BusinessOS v2.4 Enterprise
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
