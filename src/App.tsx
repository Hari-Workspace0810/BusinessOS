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
} from './data/mockDatabase';
import { api } from './services/api';
import {
  fetchOrganizationsFromFirestore,
  saveOrganizationToFirestore,
  subscribeToOrganizations,
  fetchTransactionsFromFirestore,
  saveTransactionToFirestore,
  reverseTransactionInFirestore,
  subscribeToTransactions,
  fetchProductsFromFirestore,
  saveProductToFirestore,
  updateProductStockInFirestore,
  subscribeToProducts,
  logAuditEvent,
} from './services/firestoreService';
import { AuthWrapper } from './components/AuthWrapper';
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
import { SupplyChainGame3D } from './components/SupplyChainGame3D';
import { GroundedIntelligenceModule } from './components/GroundedIntelligenceModule';
import { AudioIntelligenceModule } from './components/AudioIntelligenceModule';
import { BioscienceModule } from './components/BioscienceModule';
import { AuditLogModule } from './components/AuditLogModule';
import { Bell, AlertTriangle } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface BusinessOSAppProps {
  authenticatedUser: FirebaseUser;
  mappedUser: User;
  initialOrg: Organization;
  onSignOut: () => Promise<void>;
}

function BusinessOSApp({
  authenticatedUser,
  mappedUser,
  initialOrg,
  onSignOut,
}: BusinessOSAppProps) {
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
  const [currentOrg, setCurrentOrg] = useState<Organization>(initialOrg);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);

  // Current User with active Role
  const [currentUser, setCurrentUser] = useState<User>(mappedUser);

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

  // -------------------------------------------------------------
  // FIRESTORE PERSISTENCE & REAL-TIME HOOKS
  // -------------------------------------------------------------

  // 1. Fetch & Subscribe Organizations from Firestore
  useEffect(() => {
    fetchOrganizationsFromFirestore().then((orgs) => {
      if (orgs && orgs.length > 0) {
        setOrganizations(orgs);
      }
    });

    const unsub = subscribeToOrganizations((orgs) => {
      if (orgs && orgs.length > 0) {
        setOrganizations(orgs);
      }
    });
    return () => unsub();
  }, []);

  // 2. Fetch & Subscribe Transactions scoped by currentOrg.id for Tenant Isolation
  useEffect(() => {
    if (!currentOrg?.id) return;
    fetchTransactionsFromFirestore(currentOrg.id).then((txs) => {
      setTransactions(txs);
    });

    const unsub = subscribeToTransactions(currentOrg.id, (txs) => {
      setTransactions(txs);
    });
    return () => unsub();
  }, [currentOrg.id]);

  // 3. Fetch & Subscribe Products scoped by currentOrg.id for Tenant Isolation
  useEffect(() => {
    if (!currentOrg?.id) return;
    fetchProductsFromFirestore(currentOrg.id).then((prods) => {
      setProducts(prods);
    });

    const unsub = subscribeToProducts(currentOrg.id, (prods) => {
      setProducts(prods);
    });
    return () => unsub();
  }, [currentOrg.id]);

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

  // Register New Organization -> Persists to Firestore
  const handleCreateOrganization = async (newOrgData: Partial<Organization>) => {
    const created = await api.createOrganization(newOrgData);
    try {
      await saveOrganizationToFirestore(created);
      await logAuditEvent({
        organizationId: created.id,
        action: 'ORGANIZATION_CREATED',
        category: 'governance',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        targetEntity: 'Organization',
        targetEntityId: created.id,
        description: `New organization registered: ${created.name} (${created.category.toUpperCase()}) with base currency ${created.currency}.`,
        details: { plan: created.plan, category: created.category, currency: created.currency },
        severity: 'info',
      });
    } catch (err) {
      console.warn('Firestore saveOrganization fallback:', err);
    }
    setOrganizations((prev) => [...prev, created]);
    setCurrentOrg(created);

    // Create default HQ branch for this org
    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      organizationId: created.id,
      name: `${created.name} Headquarters`,
      code: 'HQ-01',
      city: 'Global HQ',
      state: 'State',
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

  // 1. Financial Transactions & Reversals -> Persists to Firestore
  const handleAddTransaction = async (txData: Partial<FinancialTransaction>) => {
    const created = await api.createTransaction(txData);
    try {
      await saveTransactionToFirestore(created);
      await logAuditEvent({
        organizationId: currentOrg.id,
        action: 'TRANSACTION_RECORDED',
        category: 'finance',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        targetEntity: 'FinancialTransaction',
        targetEntityId: created.id,
        description: `New ledger entry booked: ${created.type.toUpperCase()} of ${currentOrg.currency} ${created.amount.toLocaleString()} (${created.category}).`,
        details: { amount: created.amount, reference: created.reference, type: created.type },
        severity: 'info',
      });
    } catch (err) {
      console.warn('Firestore saveTransaction fallback:', err);
    }
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

    try {
      await reverseTransactionInFirestore(txId, reversalTx);
      await logAuditEvent({
        organizationId: currentOrg.id,
        action: 'TRANSACTION_REVERSED',
        category: 'finance',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        targetEntity: 'FinancialTransaction',
        targetEntityId: txId,
        description: `CRITICAL FINANCIAL REVERSAL: Reversal transaction ${reversalTx.id} posted against original ${target.reference} for amount ${currentOrg.currency} ${target.amount.toLocaleString()}.`,
        details: {
          originalTxId: txId,
          reversalTxId: reversalTx.id,
          amount: target.amount,
          reference: target.reference,
          reversedAt: new Date().toISOString(),
        },
        severity: 'critical',
      });
    } catch (err) {
      console.warn('Firestore reverseTransaction fallback:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'reversed' } : t))
    );
    setTransactions((prev) => [reversalTx, ...prev]);
  };

  // 2. POS Sale Completed -> Updates Invoices, Ledger, and Decrements Stock in Firestore
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

    try {
      await saveTransactionToFirestore(newIncomeTx);
    } catch (err) {
      console.warn('Firestore saveTransaction fallback:', err);
    }
    setTransactions((prev) => [newIncomeTx, ...prev]);

    // Decrement inventory stock in Firestore
    if (createdInv.items) {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = createdInv.items.find((i) => i.productId === prod.id);
          if (item) {
            const nextStock = Math.max(0, prod.currentStock - item.quantity);
            updateProductStockInFirestore(prod.id, nextStock).catch((err) =>
              console.warn('Firestore updateProductStock fallback:', err)
            );
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

  // 4. Products & Stock Transfers -> Persists to Firestore
  const handleAddProduct = async (productData: Partial<Product>) => {
    const created = await api.createProduct(productData);
    try {
      await saveProductToFirestore(created);
    } catch (err) {
      console.warn('Firestore saveProduct fallback:', err);
    }
    setProducts((prev) => [created, ...prev]);
  };

  const handleTransferStock = async (data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
  }) => {
    await api.transferStock(data);
    const existing = products.find((p) => p.id === data.productId);
    if (existing) {
      const updated = { ...existing, warehouseId: data.toWarehouseId };
      saveProductToFirestore(updated).catch((err) =>
        console.warn('Firestore saveProduct fallback:', err)
      );

      logAuditEvent({
        organizationId: currentOrg.id,
        action: 'STOCK_TRANSFER_EXECUTED',
        category: 'inventory',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        targetEntity: 'Product',
        targetEntityId: data.productId,
        description: `Depot stock transfer authorized: ${data.quantity} units of ${existing.name} (${existing.sku}) relocated from depot ${data.fromWarehouseId} to ${data.toWarehouseId}.`,
        details: { ...data, productName: existing.name, sku: existing.sku },
        severity: 'info',
      }).catch((err) => console.warn('Audit log fallback:', err));
    }
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

  // 7. Procurement: Create PO, Approve PO, Receive Goods (GRN)
  const handleCreatePO = async (poData: Partial<PurchaseOrder>) => {
    const created = await api.createPurchaseOrder(poData);
    setPurchaseOrders((prev) => [created, ...prev]);
  };

  const handleUpdatePOStatus = async (
    poId: string,
    status: PurchaseOrder['status']
  ) => {
    const target = purchaseOrders.find((p) => p.id === poId);
    if (!target) return;

    await api.updatePOStatus(poId, status);
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status } : p))
    );

    // If Goods Received (GRN), auto increment inventory and create accounts payable expense
    if (status === 'received') {
      const expenseTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        organizationId: target.organizationId,
        branchId: target.branchId,
        type: 'expense',
        category: 'Cost of Goods Sold (COGS)',
        amount: target.totalAmount,
        currency: currentOrg.currency,
        date: new Date().toISOString().split('T')[0],
        description: `GRN Settlement for PO #${target.poNumber} (${target.supplierName})`,
        reference: `GRN-${target.poNumber}`,
        paymentMethod: 'bank_transfer',
        status: 'completed',
        taxAmount: 0,
      };
      handleAddTransaction(expenseTx);

      // Increment inventory item stock
      setProducts((prev) =>
        prev.map((prod) => {
          const item = target.items.find((i) => i.productId === prod.id);
          if (item) {
            const nextStock = prod.currentStock + item.quantity;
            updateProductStockInFirestore(prod.id, nextStock).catch((e) =>
              console.warn(e)
            );
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

  // 8. Projects & Task Board
  const handleCreateTask = async (taskData: Partial<Task>) => {
    const created = await api.createTask(taskData);
    setTasks((prev) => [...prev, created]);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    await api.updateTaskStatus(taskId, status);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  // 9. Workflows: Toggle rules
  const handleToggleWorkflow = async (ruleId: string) => {
    await api.toggleWorkflow(ruleId);
    setWorkflows((prev) =>
      prev.map((w) => (w.id === ruleId ? { ...w, isEnabled: !w.isEnabled } : w))
    );
  };

  // 10. Documents Upload
  const handleUploadDocument = async (docData: Partial<BusinessDocument>) => {
    const created = await api.createDocument(docData);
    setDocuments((prev) => [created, ...prev]);
  };

  // 11. SaaS Plan Upgrade
  const handleUpdatePlan = (newPlan: Organization['plan']) => {
    const updated = { ...currentOrg, plan: newPlan };
    setCurrentOrg(updated);
    saveOrganizationToFirestore(updated).catch((e) => console.warn(e));
    setOrganizations((prev) =>
      prev.map((o) => (o.id === currentOrg.id ? updated : o))
    );
  };

  const activeAnnouncement = announcements.find(
    (a) => a.id !== dismissedAnnouncementId
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* System Announcement Banner */}
      {activeAnnouncement && (
        <aside
          aria-label="System announcement"
          className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2 text-xs flex items-center justify-between shadow-sm z-50 select-none"
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1">
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">{activeAnnouncement.title}:</span>
            <span className="opacity-90">{activeAnnouncement.message}</span>
          </div>
          <button
            onClick={() => setDismissedAnnouncementId(activeAnnouncement.id)}
            className="text-xs hover:opacity-80 underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Primary Top Navigation Bar */}
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
        onSignOut={onSignOut}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Navigation Sidebar */}
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
        <main
          className={`flex-1 overflow-y-auto ${
            activeTab === 'drone_sim_3d' ? 'p-0' : 'p-4 sm:p-6 lg:p-8'
          }`}
        >
          <div className={activeTab === 'drone_sim_3d' ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
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

            {activeTab === 'grounded_ai' && (
              <GroundedIntelligenceModule />
            )}

            {activeTab === 'audio_ai' && (
              <AudioIntelligenceModule />
            )}

            {activeTab === 'bioscience' && (
              <BioscienceModule />
            )}

            {activeTab === 'drone_sim_3d' && (
              <SupplyChainGame3D />
            )}

            {activeTab === 'simulator' && (
              <AdvancedSimulatorModule currentOrg={currentOrg} />
            )}

            {activeTab === 'audit_log' && (
              <AuditLogModule
                currentOrg={currentOrg}
                currentUser={currentUser}
              />
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

export default function App() {
  return (
    <AuthWrapper>
      {({ authenticatedUser, mappedUser, initialOrg, onSignOut }) => (
        <BusinessOSApp
          authenticatedUser={authenticatedUser}
          mappedUser={mappedUser}
          initialOrg={initialOrg}
          onSignOut={onSignOut}
        />
      )}
    </AuthWrapper>
  );
}
