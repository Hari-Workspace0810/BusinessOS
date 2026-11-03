export type Role =
  | 'super_admin'
  | 'org_owner'
  | 'org_admin'
  | 'branch_manager'
  | 'finance_manager'
  | 'inventory_manager'
  | 'hr_manager'
  | 'sales_manager'
  | 'employee'
  | 'auditor';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  organizationId: string;
  branchId?: string;
  permissions: string[];
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  gstin?: string;
  currency: CurrencyCode;
  category: 'retail' | 'manufacturing' | 'services' | 'technology' | 'wholesale';
  email: string;
  phone: string;
  address: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  createdAt: string;
  logo?: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  isMain: boolean;
  managerName: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  budget: number;
  employeeCount: number;
}

export interface Employee {
  id: string;
  organizationId: string;
  branchId: string;
  departmentId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  dateOfJoining: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
  avatar: string;
}

export interface FinancialTransaction {
  id: string;
  organizationId: string;
  branchId: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  description: string;
  reference: string;
  paymentMethod: 'bank_transfer' | 'upi' | 'card' | 'cash';
  status: 'completed' | 'pending' | 'reversed';
  reversalOf?: string;
  taxAmount: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number; // e.g. 18 for 18% GST
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue' | 'cancelled';
  gstType: 'cgst_sgst' | 'igst';
}

export interface Product {
  id: string;
  organizationId: string;
  warehouseId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  minStock: number;
  maxStock: number;
  batchNumber: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Warehouse {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  code: string;
  location: string;
  capacityUnits: number;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  type: 'customer' | 'lead';
  stage: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  dealValue: number;
  clv: number;
  totalOrders: number;
  outstandingBalance: number;
  tags: string[];
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  rating: number;
  paymentTerms: string;
  outstandingPayable: number;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  organizationId: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'received' | 'cancelled';
  approvedBy?: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  clientName: string;
  budget: number;
  spent: number;
  startDate: string;
  deadline: string;
  progress: number; // 0-100
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  teamMembers: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
}

export interface LeaveRequest {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'casual' | 'maternity' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

export interface WorkflowRule {
  id: string;
  organizationId: string;
  name: string;
  trigger: 'low_stock' | 'invoice_overdue' | 'leave_requested' | 'po_high_value';
  thresholdValue?: number;
  action: 'notify_manager' | 'email_alert' | 'auto_approval';
  isEnabled: boolean;
}

export interface BusinessDocument {
  id: string;
  organizationId: string;
  title: string;
  category: 'invoice' | 'contract' | 'financial' | 'hr' | 'policy';
  fileType: string;
  fileSize: string;
  uploadDate: string;
  summary: string;
  aiAnalyzed: boolean;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: 'info' | 'warning' | 'urgent';
}
