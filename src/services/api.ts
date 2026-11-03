import {
  Organization,
  Branch,
  Department,
  Employee,
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
} from '../types';

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
} from '../data/mockDatabase';

// Helper for safe fetch with mock fallback
async function safeFetch<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(`HTTP error ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    return safeFetch('/api/organizations', undefined, INITIAL_ORGANIZATIONS);
  },
  async createOrganization(org: Partial<Organization>): Promise<Organization> {
    return safeFetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(org),
    }, {
      id: `org-${Date.now()}`,
      name: org.name || 'New Organization',
      legalName: org.legalName || 'New Org Ltd',
      currency: org.currency || 'INR',
      category: org.category || 'services',
      email: org.email || 'info@company.com',
      phone: org.phone || '+91 99999 00000',
      address: org.address || 'Headquarters',
      plan: 'starter',
      createdAt: new Date().toISOString().split('T')[0],
    });
  },

  // Branches
  async getBranches(orgId?: string): Promise<Branch[]> {
    return safeFetch(
      orgId ? `/api/branches?orgId=${orgId}` : '/api/branches',
      undefined,
      orgId ? INITIAL_BRANCHES.filter((b) => b.organizationId === orgId) : INITIAL_BRANCHES
    );
  },

  // Departments & Employees
  async getDepartments(orgId?: string): Promise<Department[]> {
    return safeFetch(
      orgId ? `/api/departments?orgId=${orgId}` : '/api/departments',
      undefined,
      orgId ? INITIAL_DEPARTMENTS.filter((d) => d.organizationId === orgId) : INITIAL_DEPARTMENTS
    );
  },
  async getEmployees(orgId?: string, branchId?: string): Promise<Employee[]> {
    let url = '/api/employees';
    const params = new URLSearchParams();
    if (orgId) params.append('orgId', orgId);
    if (branchId) params.append('branchId', branchId);
    if (params.toString()) url += `?${params.toString()}`;

    let fallback = INITIAL_EMPLOYEES;
    if (orgId) fallback = fallback.filter((e) => e.organizationId === orgId);
    if (branchId) fallback = fallback.filter((e) => e.branchId === branchId);

    return safeFetch(url, undefined, fallback);
  },
  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    return safeFetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    }, {
      id: `emp-${Date.now()}`,
      employeeCode: `APX-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'active',
      avatar: '/src/assets/images/avatar_ceo_executive_1793707704596.jpg',
      ...employee,
    } as Employee);
  },

  // Transactions
  async getTransactions(orgId?: string, branchId?: string): Promise<FinancialTransaction[]> {
    let url = '/api/transactions';
    const params = new URLSearchParams();
    if (orgId) params.append('orgId', orgId);
    if (branchId) params.append('branchId', branchId);
    if (params.toString()) url += `?${params.toString()}`;

    let fallback = INITIAL_TRANSACTIONS;
    if (orgId) fallback = fallback.filter((t) => t.organizationId === orgId);
    if (branchId) fallback = fallback.filter((t) => t.branchId === branchId);

    return safeFetch(url, undefined, fallback);
  },
  async createTransaction(tx: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    return safeFetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    }, {
      id: `tx-${Date.now()}`,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      ...tx,
    } as FinancialTransaction);
  },
  async reverseTransaction(id: string): Promise<any> {
    return safeFetch(`/api/transactions/${id}/reverse`, {
      method: 'POST',
    });
  },

  // Invoices
  async getInvoices(orgId?: string): Promise<Invoice[]> {
    return safeFetch(
      orgId ? `/api/invoices?orgId=${orgId}` : '/api/invoices',
      undefined,
      orgId ? INITIAL_INVOICES.filter((i) => i.organizationId === orgId) : INITIAL_INVOICES
    );
  },
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    return safeFetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    }, {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      ...invoice,
    } as Invoice);
  },

  // Inventory / Products
  async getProducts(orgId?: string): Promise<Product[]> {
    return safeFetch(
      orgId ? `/api/products?orgId=${orgId}` : '/api/products',
      undefined,
      orgId ? INITIAL_PRODUCTS.filter((p) => p.organizationId === orgId) : INITIAL_PRODUCTS
    );
  },
  async createProduct(prod: Partial<Product>): Promise<Product> {
    return safeFetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    }, {
      id: `prod-${Date.now()}`,
      status: 'in_stock',
      ...prod,
    } as Product);
  },
  async transferStock(data: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }) {
    return safeFetch('/api/products/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, { success: true, message: 'Stock transferred.' });
  },

  // Customers & CRM
  async getCustomers(orgId?: string): Promise<Customer[]> {
    return safeFetch(
      orgId ? `/api/customers?orgId=${orgId}` : '/api/customers',
      undefined,
      orgId ? INITIAL_CUSTOMERS.filter((c) => c.organizationId === orgId) : INITIAL_CUSTOMERS
    );
  },
  async createCustomer(cust: Partial<Customer>): Promise<Customer> {
    return safeFetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust),
    }, {
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      clv: 0,
      outstandingBalance: 0,
      ...cust,
    } as Customer);
  },
  async updateCustomerStage(id: string, stage: Customer['stage']): Promise<any> {
    return safeFetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
  },

  // Suppliers & Procurement
  async getSuppliers(orgId?: string): Promise<Supplier[]> {
    return safeFetch(
      orgId ? `/api/suppliers?orgId=${orgId}` : '/api/suppliers',
      undefined,
      orgId ? INITIAL_SUPPLIERS.filter((s) => s.organizationId === orgId) : INITIAL_SUPPLIERS
    );
  },
  async getPurchaseOrders(orgId?: string): Promise<PurchaseOrder[]> {
    return safeFetch(
      orgId ? `/api/purchase-orders?orgId=${orgId}` : '/api/purchase-orders',
      undefined,
      orgId ? INITIAL_PURCHASE_ORDERS.filter((p) => p.organizationId === orgId) : INITIAL_PURCHASE_ORDERS
    );
  },
  async createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return safeFetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(po),
    });
  },
  async updatePOStatus(id: string, status: PurchaseOrder['status']): Promise<any> {
    return safeFetch(`/api/purchase-orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // Projects & Tasks
  async getProjects(orgId?: string): Promise<Project[]> {
    return safeFetch(
      orgId ? `/api/projects?orgId=${orgId}` : '/api/projects',
      undefined,
      orgId ? INITIAL_PROJECTS.filter((p) => p.organizationId === orgId) : INITIAL_PROJECTS
    );
  },
  async getTasks(): Promise<Task[]> {
    return safeFetch('/api/tasks', undefined, INITIAL_TASKS);
  },
  async createTask(task: Partial<Task>): Promise<Task> {
    return safeFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
  },
  async updateTaskStatus(id: string, status: Task['status']): Promise<any> {
    return safeFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // HRMS: Attendance & Leave
  async getAttendance(): Promise<AttendanceRecord[]> {
    return safeFetch('/api/attendance', undefined, INITIAL_ATTENDANCE);
  },
  async punchAttendance(employeeId: string, employeeName: string): Promise<AttendanceRecord> {
    return safeFetch('/api/attendance/punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, employeeName }),
    });
  },
  async getLeaves(orgId?: string): Promise<LeaveRequest[]> {
    return safeFetch(
      orgId ? `/api/leaves?orgId=${orgId}` : '/api/leaves',
      undefined,
      orgId ? INITIAL_LEAVE_REQUESTS.filter((l) => l.organizationId === orgId) : INITIAL_LEAVE_REQUESTS
    );
  },
  async submitLeave(leave: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return safeFetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leave),
    });
  },
  async updateLeaveStatus(id: string, status: 'approved' | 'rejected'): Promise<any> {
    return safeFetch(`/api/leaves/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // Workflows & Documents
  async getWorkflows(): Promise<WorkflowRule[]> {
    return safeFetch('/api/workflows', undefined, INITIAL_WORKFLOWS);
  },
  async toggleWorkflow(id: string): Promise<any> {
    return safeFetch(`/api/workflows/${id}/toggle`, { method: 'PATCH' });
  },
  async getDocuments(): Promise<BusinessDocument[]> {
    return safeFetch('/api/documents', undefined, INITIAL_DOCUMENTS);
  },
  async createDocument(doc: Partial<BusinessDocument>): Promise<BusinessDocument> {
    return safeFetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
  },

  // Gemini AI Endpoints
  async askAIAssistant(query: string, organizationId: string, chatHistory: any[]): Promise<{ reply: string; model?: string }> {
    return safeFetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, organizationId, chatHistory }),
    }, {
      reply: 'BusinessOS Analysis: Total revenue stands healthy with positive operational margin. Key priority: restock Optic Sensor Arrays and collect pending receivables from Tata Projects.',
    });
  },

  async runBusinessSimulation(data: {
    organizationId: string;
    priceChangePercent: number;
    expenseChangePercent: number;
    headcountDelta: number;
    marketingBudgetDelta: number;
  }): Promise<{ simulatedRevenue: number; simulatedExpenses: number; simulatedProfit: number; profitDelta: number; analysis: string }> {
    return safeFetch('/api/gemini/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, {
      simulatedRevenue: 4620000,
      simulatedExpenses: 2340000,
      simulatedProfit: 2280000,
      profitDelta: -180000,
      analysis: 'Simulated baseline projection completed.',
    });
  },

  async analyzeDocumentWithAI(documentTitle: string, documentCategory: string, userQuery?: string): Promise<{ success: boolean; analysis: string }> {
    return safeFetch('/api/gemini/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentTitle, documentCategory, userQuery }),
    }, {
      success: true,
      analysis: `Analysis for "${documentTitle}": Verified corporate document under category ${documentCategory}.`,
    });
  },

  async searchGrounding(query: string, marketContext?: string): Promise<{
    success: boolean;
    text: string;
    sources: Array<{ title: string; uri: string }>;
    queries: string[];
  }> {
    return safeFetch('/api/gemini/grounded-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, marketContext }),
    }, {
      success: true,
      text: `Market Intelligence Report on "${query}":\n\n• Trends: Global demand continues accelerating across automated SaaS ERP and supply chain operations.\n• Regulatory: Compliance mandates strict digital audit trails and ESG reporting.\n• Margin benchmarks: Typical high-performing enterprise margins range from 22% to 28%.`,
      sources: [
        { title: 'Global Enterprise SaaS & ERP Market Report 2025', uri: 'https://example.com/reports/saas-2025' },
        { title: 'Supply Chain Resiliency Index', uri: 'https://example.com/supplychain-index' },
      ],
      queries: [query, `${query} enterprise market trends`],
    });
  },

  async mapsGrounding(query: string, location?: { latitude: number; longitude: number }): Promise<{
    success: boolean;
    text: string;
    places: Array<{ title: string; uri: string }>;
  }> {
    return safeFetch('/api/gemini/grounded-maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location }),
    }, {
      success: true,
      text: `Geographic Logistics & Hub Intelligence for "${query}": Multimodal logistics access with rail corridors and direct port expressways.`,
      places: [
        { title: `${query} Central Logistics Hub`, uri: 'https://maps.google.com/?q=logistics+hub' },
        { title: 'Intermodal Freight Terminal', uri: 'https://maps.google.com/?q=freight+terminal' },
      ],
    });
  },

  async transcribeAudio(audioBase64: string, mimeType?: string, prompt?: string): Promise<{
    success: boolean;
    transcription: string;
  }> {
    return safeFetch('/api/gemini/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType, prompt }),
    }, {
      success: true,
      transcription: "Executive Meeting Transcript: 'Review completed. Approved PO for thermal sensors. A/R collection follow-ups scheduled for Friday.'",
    });
  },

  async analyzeBioscience(compoundName?: string, smiles?: string, targetQuery?: string): Promise<{
    success: boolean;
    analysis: string;
  }> {
    return safeFetch('/api/gemini/science', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compoundName, smiles, targetQuery }),
    }, {
      success: true,
      analysis: `Pharma & Bioscience Intelligence for "${compoundName || smiles || 'Molecule'}": Small-molecule therapeutic agent compliant with Lipinski's Rule of 5. Shelf life 24 months at -20°C.`,
    });
  },

  async generateVideoScript(productOrTheme: string, targetAudience?: string, durationSeconds?: number): Promise<{
    success: boolean;
    title: string;
    scenes: Array<{
      sceneNumber: number;
      duration: string;
      visualPrompt: string;
      audioNarration: string;
      cameraMovement: string;
    }>;
  }> {
    return safeFetch('/api/gemini/video-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productOrTheme, targetAudience, durationSeconds }),
    }, {
      success: true,
      title: `${productOrTheme} - Enterprise Commercial Showcase`,
      scenes: [
        {
          sceneNumber: 1,
          duration: '4s',
          visualPrompt: 'Cinematic drone shot flying through a high-tech automated warehouse with autonomous robots and glowing amber telemetry lights',
          audioNarration: 'In a world of relentless enterprise velocity, precision is everything.',
          cameraMovement: 'Wide tracking shot descending smoothly',
        },
        {
          sceneNumber: 2,
          duration: '5s',
          visualPrompt: 'Ultra-sharp close-up of executive holographic cockpit interface showing real-time global revenue metrics and logistics nodes',
          audioNarration: 'Meet BusinessOS: The next-generation autonomous operating system for modern business operations.',
          cameraMovement: 'Macro pan across illuminated glass UI',
        },
        {
          sceneNumber: 3,
          duration: '6s',
          visualPrompt: 'Sleek composite quadcopter drone lifting a secured cargo pallet from a robotic docking station and flying into the sunset',
          audioNarration: 'From supply chain synchronization to AI-governed financial ledgers, operate with total clarity.',
          cameraMovement: 'Low-angle dynamic hero shot pushing upward',
        },
      ],
    });
  },

  async getSuperAdminStats() {
    return safeFetch('/api/superadmin/stats', undefined, {
      totalOrganizations: 2,
      totalBranches: 4,
      totalEmployees: 5,
      totalPlatformTransactions: 6,
      totalPlatformGrossRevenue: 4400000,
      planBreakdown: { enterprise: 1, professional: 1, starter: 0, free: 0 },
      systemHealth: '100% Operational',
      announcements: [],
    });
  },
};
