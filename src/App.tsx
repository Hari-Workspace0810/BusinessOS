import React, { useState, useEffect } from 'react';
import {
  Organization,
  Branch,
  Role,
  User,
  FinancialTransaction,
  Invoice,
  Product,
  Customer,
  Supplier,
  PurchaseOrder,
  Project,
  Task,
  AttendanceRecord,
  LeaveRequest,
  WorkflowRule,
  BusinessDocument,
  SystemAnnouncement,
} from './types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_TRANSACTIONS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE,
  INITIAL_WORKFLOWS,
  INITIAL_DOCUMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_USERS,
} from './data/mockDatabase';
import { api } from './services/api';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { FinanceModule } from './components/FinanceModule';
import { InventoryModule } from './components/InventoryModule';
import { POSModule } from './components/POSModule';
import { SalesBillingModule } from './components/SalesBillingModule';
import { CRMModule } from './components/CRMModule';
import { HRMSModule } from './components/HRMSModule';
import { ProcurementModule } from './components/ProcurementModule';
import { ProjectsModule } from './components/ProjectsModule';
import { BIAnalyticsModule } from './components/BIAnalyticsModule';
import { AIAssistantModule } from './components/AIAssistantModule';
import { AdvancedSimulatorModule } from './components/AdvancedSimulatorModule';
import { DocumentHubModule } from './components/DocumentHubModule';
import { SubscriptionModule } from './components/SubscriptionModule';
import { SuperAdminModule } from './components/SuperAdminModule';
import { WorkflowsModule } from './components/WorkflowsModule';
import { NewOrgWizard } from './components/NewOrgWizard';
import { Bell, AlertTriangle } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Synchronize darkMode class on html root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Multi-tenant core state
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrg, setCurrentOrg] = useState<Organization>(INITIAL_ORGANIZATIONS[0]);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);

  // Current User with active Role
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Interconnected Application Entities
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(INITIAL_WORKFLOWS);
  const [documents, setDocuments] = useState<BusinessDocument[]>(INITIAL_DOCUMENTS);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState<boolean>(false);
  const [dismissedAnnouncementId, setDismissedAnnouncementId] = useState<string | null>(null);

  // Switch organization helper
  const handleSelectOrg = (org: Organization) => {
    setCurrentOrg(org);
    const orgBranches = branches.filter((b) => b.organizationId === org.id);
    if (orgBranches.length > 0) {
      setCurrentBranch(orgBranches[0]);
    }
  };

  // Switch branch helper
  const handleSelectBranch = (branch: Branch) => {
    setCurrentBranch(branch);
  };

  // Switch role helper
  const handleSelectRole = (role: Role) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  // Register New Organization
  const handleCreateOrganization = async (newOrgData: Partial<Organization>) => {
    const created = await api.createOrganization(newOrgData);
    setOrganizations((prev) => [...prev, created]);
    setCurrentOrg(created);

    // Create default HQ branch for this org
    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      organizationId: created.id,
      name: `${created.name} Headquarters`,
      code: 'HQ-01',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: created.address,
      isMain: true,
      managerName: currentUser.name,
    };
    setBranches((prev) => [...prev, newBranch]);
    setCurrentBranch(newBranch);
    setActiveTab('dashboard');
  };

  // -------------------------------------------------------------
  // Interconnected Business Operations Handlers
  // -------------------------------------------------------------

  // 1. Financial Transactions & Reversals
  const handleAddTransaction = async (txData: Partial<FinancialTransaction>) => {
    const created = await api.createTransaction(txData);
    setTransactions((prev) => [created, ...prev]);
  };

  const handleReverseTransaction = async (txId: string) => {
    const target = transactions.find((t) => t.id === txId);
    if (!target || target.status === 'reversed') return;

    const reversalTx: FinancialTransaction = {
      ...target,
      id: `tx-rev-${Date.now()}`,
      type: target.type === 'income' ? 'expense' : 'income',
      description: `[REVERSAL] Reversal of ${target.reference}: ${target.description}`,
      reversalOf: target.id,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'reversed' } : t))
    );
    setTransactions((prev) => [reversalTx, ...prev]);
  };

  // 2. POS Sale Completed -> Updates Invoices, Ledger, and Decrements Stock
  const handleCompleteSale = async (invoicePayload: Partial<Invoice>) => {
    const createdInv = await api.createInvoice(invoicePayload);
    setInvoices((prev) => [createdInv, ...prev]);

    // Record cash inflow in ledger
    const newIncomeTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      organizationId: createdInv.organizationId,
      branchId: createdInv.branchId,
      type: 'income',
      category: 'Point of Sale (POS) Revenue',
      amount: createdInv.amountPaid,
      currency: currentOrg.currency,
      date: createdInv.date,
      description: `POS Receipt #${createdInv.invoiceNumber} (${createdInv.customerName})`,
      reference: `POS-${Date.now().toString().slice(-6)}`,
      paymentMethod: 'upi',
      status: 'completed',
      taxAmount: createdInv.totalTax,
    };
    setTransactions((prev) => [newIncomeTx, ...prev]);

    // Decrement inventory stock
    if (createdInv.items) {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = createdInv.items.find((i) => i.productId === prod.id);
          if (item) {
            const nextStock = Math.max(0, prod.currentStock - item.quantity);
            return {
              ...prod,
              currentStock: nextStock,
              status: nextStock <= prod.reorderLevel ? 'low_stock' : 'in_stock',
            };
          }
          return prod;
        })
      );
    }
  };

  // 3. Create B2B Customer Invoice
  const handleCreateInvoice = async (invoiceData: Partial<Invoice>) => {
    const created = await api.createInvoice(invoiceData);
    setInvoices((prev) => [created, ...prev]);
  };

  // 4. Products & Stock Transfers
  const handleAddProduct = async (productData: Partial<Product>) => {
    const created = await api.createProduct(productData);
    setProducts((prev) => [created, ...prev]);
  };

  const handleTransferStock = async (data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
  }) => {
    await api.transferStock(data);
    // Refresh products view
    setProducts((prev) =>
      prev.map((p) =>
        p.id === data.productId ? { ...p, warehouseId: data.toWarehouseId } : p
      )
    );
  };

  // 5. CRM: Add Customer & Advance Pipeline Stage
  const handleAddCustomer = async (custData: Partial<Customer>) => {
    const created = await api.createCustomer(custData);
    setCustomers((prev) => [...prev, created]);
  };

  const handleUpdateCustomerStage = async (id: string, stage: Customer['stage']) => {
    await api.updateCustomerStage(id, stage);
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage } : c))
    );
  };

  // 6. HRMS: Add Staff, Punch Attendance, Approve Leave
  const handleAddEmployee = async (empData: any) => {
    const created = await api.createEmployee(empData);
    setEmployees((prev) => [...prev, created]);
  };

  const handlePunchAttendance = async (empId: string, empName: string) => {
    const rec = await api.punchAttendance(empId, empName);
    setAttendance((prev) => {
      const existing = prev.find((a) => a.id === rec.id || a.date === rec.date);
      if (existing) {
        return prev.map((a) => (a.id === existing.id ? rec : a));
      }
      return [rec, ...prev];
    });
  };

  const handleUpdateLeaveStatus = async (leaveId: string, status: 'approved' | 'rejected') => {
    await api.updateLeaveStatus(leaveId, status);
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status } : l))
    );
  };

  // 7. Procurement: Create PO, Approve PO, and GRN Receipt (Auto-stocks + Accounts Payable)
  const handleCreatePO = async (poData: Partial<PurchaseOrder>) => {
    const created = await api.createPurchaseOrder(poData);
    setPurchaseOrders((prev) => [created, ...prev]);
  };

  const handleUpdatePOStatus = async (id: string, status: PurchaseOrder['status']) => {
    await api.updatePOStatus(id, status);
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          // If received, replenish stock and record expense
          if (status === 'received') {
            for (const item of po.items) {
              setProducts((pList) =>
                pList.map((p) =>
                  p.id === item.productId
                    ? {
                        ...p,
                        currentStock: p.currentStock + item.quantity,
                        status:
                          p.currentStock + item.quantity > p.reorderLevel
                            ? 'in_stock'
                            : 'low_stock',
                      }
                    : p
                )
              );
            }
            // Add expense transaction for accounts payable
            setTransactions((txList) => [
              {
                id: `tx-${Date.now()}`,
                organizationId: po.organizationId,
                branchId: po.branchId,
                type: 'expense',
                category: 'Vendor Goods Received (GRN)',
                amount: po.totalAmount,
                currency: currentOrg.currency,
                date: new Date().toISOString().split('T')[0],
                description: `Settled GRN fulfillment for ${po.poNumber} from ${po.supplierName}`,
                reference: `GRN-${Date.now().toString().slice(-6)}`,
                paymentMethod: 'bank_transfer',
                status: 'completed',
                taxAmount: Math.round(po.totalAmount * 0.18),
              },
              ...txList,
            ]);
          }
          return { ...po, status };
        }
        return po;
      })
    );
  };

  // 8. Projects & Task Board
  const handleCreateTask = async (taskData: Partial<Task>) => {
    const created = await api.createTask(taskData);
    setTasks((prev) => [...prev, created]);
  };

  const handleUpdateTaskStatus = async (id: string, status: Task['status']) => {
    await api.updateTaskStatus(id, status);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  // 9. Workflows toggle
  const handleToggleWorkflow = async (id: string) => {
    await api.toggleWorkflow(id);
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isEnabled: !w.isEnabled } : w))
    );
  };

  // 10. Documents
  const handleUploadDocument = async (docData: Partial<BusinessDocument>) => {
    const created = await api.createDocument(docData);
    setDocuments((prev) => [created, ...prev]);
  };

  // 11. Subscription Plan Update
  const handleUpdatePlan = (newPlan: Organization['plan']) => {
    setCurrentOrg((prev) => ({ ...prev, plan: newPlan }));
    setOrganizations((prev) =>
      prev.map((o) => (o.id === currentOrg.id ? { ...o, plan: newPlan } : o))
    );
  };

  // Active announcement
  const activeAnnouncement = announcements.find((a) => a.id !== dismissedAnnouncementId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Global Top Navigation Bar */}
      <TopBar
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={handleSelectOrg}
        currentBranch={currentBranch}
        branches={branches.filter((b) => b.organizationId === currentOrg.id)}
        onSelectBranch={handleSelectBranch}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenNewOrgModal={() => setIsNewOrgModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Broadcast Announcement Banner if active */}
      {activeAnnouncement && (
        <div className="bg-slate-900 text-white dark:bg-slate-800 px-6 py-2 text-xs flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-300">
              [{activeAnnouncement.title}]:
            </span>
            <span className="text-slate-300">{activeAnnouncement.message}</span>
          </div>
          <button
            onClick={() => setDismissedAnnouncementId(activeAnnouncement.id)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Enterprise Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          userRole={currentUser.role}
          pendingApprovalsCount={
            purchaseOrders.filter((po) => po.status === 'pending_approval').length +
            leaveRequests.filter((l) => l.status === 'pending').length
          }
          lowStockCount={
            products.filter(
              (p) => p.organizationId === currentOrg.id && p.currentStock <= p.reorderLevel
            ).length
          }
        />

        {/* Central Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                currentOrg={currentOrg}
                currentBranch={currentBranch}
                transactions={transactions}
                invoices={invoices}
                products={products}
                customers={customers}
                employees={employees}
                purchaseOrders={purchaseOrders}
                leaveRequests={leaveRequests}
                onNavigateTab={setActiveTab}
                onApprovePO={(id) => handleUpdatePOStatus(id, 'approved')}
                onApproveLeave={(id) => handleUpdateLeaveStatus(id, 'approved')}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceModule
                currentOrg={currentOrg}
                currentBranch={currentBranch}
                transactions={transactions}
                invoices={invoices}
                onAddTransaction={handleAddTransaction}
                onReverseTransaction={handleReverseTransaction}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryModule
                currentOrg={currentOrg}
                products={products}
                onAddProduct={handleAddProduct}
                onTransferStock={handleTransferStock}
              />
            )}

            {activeTab === 'pos' && (
              <POSModule
                currentOrg={currentOrg}
                currentBranch={currentBranch}
                products={products}
                customers={customers}
                onCompleteSale={handleCompleteSale}
              />
            )}

            {activeTab === 'sales' && (
              <SalesBillingModule
                currentOrg={currentOrg}
                currentBranch={currentBranch}
                invoices={invoices}
                customers={customers}
                products={products}
                onCreateInvoice={handleCreateInvoice}
              />
            )}

            {activeTab === 'crm' && (
              <CRMModule
                currentOrg={currentOrg}
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateStage={handleUpdateCustomerStage}
              />
            )}

            {activeTab === 'hrms' && (
              <HRMSModule
                currentOrg={currentOrg}
                currentBranch={currentBranch}
                departments={departments}
                employees={employees}
                attendance={attendance}
                leaveRequests={leaveRequests}
                onAddEmployee={handleAddEmployee}
                onPunchAttendance={handlePunchAttendance}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
              />
            )}

            {activeTab === 'procurement' && (
              <ProcurementModule
                currentOrg={currentOrg}
                currentBranch={currentBranch}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                products={products}
                onCreatePO={handleCreatePO}
                onUpdatePOStatus={handleUpdatePOStatus}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsModule
                currentOrg={currentOrg}
                projects={projects}
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            )}

            {activeTab === 'bi' && (
              <BIAnalyticsModule
                currentOrg={currentOrg}
                branches={branches.filter((b) => b.organizationId === currentOrg.id)}
                transactions={transactions}
                products={products}
                customers={customers}
              />
            )}

            {activeTab === 'ai_copilot' && (
              <AIAssistantModule currentOrg={currentOrg} />
            )}

            {activeTab === 'simulator' && (
              <AdvancedSimulatorModule currentOrg={currentOrg} />
            )}

            {activeTab === 'documents' && (
              <DocumentHubModule
                currentOrg={currentOrg}
                documents={documents}
                onUploadDocument={handleUploadDocument}
              />
            )}

            {activeTab === 'workflows' && (
              <WorkflowsModule
                currentOrg={currentOrg}
                workflows={workflows}
                onToggleWorkflow={handleToggleWorkflow}
              />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionModule
                currentOrg={currentOrg}
                onUpdatePlan={handleUpdatePlan}
              />
            )}

            {activeTab === 'superadmin' && (
              <SuperAdminModule organizations={organizations} />
            )}
          </div>
        </main>
      </div>

      {/* Multi-Tenant Organization Registration Wizard Modal */}
      <NewOrgWizard
        isOpen={isNewOrgModalOpen}
        onClose={() => setIsNewOrgModalOpen(false)}
        onCreateOrg={handleCreateOrganization}
      />
    </div>
  );
}
