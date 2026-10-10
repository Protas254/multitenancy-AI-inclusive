// ==========================================
// USER and TENANT and RBAC TYPES
// ==========================================

export type UserRole =
  | "owner"
  | "manager"
  | "cashier"
  | "salesperson"
  | "storekeeper"
  | "accountant"
  | "admin";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

export type PermissionModule =
  | "dashboard"
  | "sales"
  | "pos"
  | "products"
  | "inventory"
  | "purchases"
  | "expenses"
  | "customers"
  | "suppliers"
  | "staff"
  | "payroll"
  | "targets"
  | "credit"
  | "loyalty"
  | "invoices"
  | "reports"
  | "notifications"
  | "settings"
  | "subscription";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isSuperAdmin?: boolean;
  memberships?: Membership[];
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export interface TenantSettings {
  currency: string;
  taxRate: number; // e.g. 16 for 16% VAT
  taxEnabled: boolean;
  taxNumber?: string;
  financialYearStart: string; // e.g. "01-01"
  receiptHeader?: string;
  receiptFooter?: string;
  loyaltyPointsPer100Kes: number;
  lowStockThresholdDefault: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  businessType: string; // e.g. "Fashion and Apparel", "Cosmetics and Beauty", "Retail Supermarket"
  phone: string;
  email: string;
  address: string;
  location: string;
  website?: string;
  branches: Branch[];
  settings: TenantSettings;
  plan: "starter" | "professional" | "enterprise";
  planStatus: "active" | "trial" | "past_due" | "canceled";
  nextBillingDate: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  branchId?: string;
  customPermissions?: Partial<Record<PermissionModule, PermissionAction[]>>;
  joinedAt: string;
}

// ==========================================
// PRODUCT and INVENTORY
// ==========================================

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  supplierId?: string;
  supplierName?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = "purchase" | "sale" | "adjustment_increase" | "adjustment_decrease" | "transfer";

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceId?: string; // saleId, purchaseId, or adjustmentId
  reason: string;
  staffName: string;
  date: string;
}

export interface StockAdjustmentRequest {
  productId: string;
  type: "increase" | "decrease" | "set";
  quantity: number;
  reason: string;
  notes?: string;
}

// ==========================================
// SALES and POS
// ==========================================

export type PaymentMethod = "cash" | "mpesa" | "card" | "credit" | "bank_transfer" | "split";
export type SaleStatus = "completed" | "refunded" | "partially_refunded" | "voided";

export interface SaleFilterParams {
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  buyingPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: string; // e.g. "SALE-00124"
  tenantId: string;
  branchId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string; // M-Pesa code or Card auth
  status: SaleStatus;
  staffId: string;
  staffName: string;
  date: string;
  createdAt?: string;
  notes?: string;
  isCreditSale?: boolean;
}

// ==========================================
// CUSTOMER and CRM and LOYALTY
// ==========================================

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  orderCount: number;
  outstandingCredit: number;
  creditLimit: number;
  loyaltyPoints: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lastPurchaseDate?: string;
  status: "active" | "inactive" | "blocked";
  createdAt: string;
  notes?: string;
}

export interface LoyaltyReward {
  id: string;
  tenantId: string;
  title: string;
  pointsRequired: number;
  discountAmount: number;
  description: string;
  isActive: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  type: "earned" | "redeemed" | "adjusted";
  points: number;
  saleId?: string;
  description: string;
  date: string;
}

// ==========================================
// SUPPLIERS and PURCHASES
// ==========================================

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  productsCount: number;
  totalPurchases: number;
  amountPaid: number;
  outstandingBalance: number;
  status: "active" | "inactive";
  createdAt: string;
}

export type PurchaseStatus = "pending" | "received" | "partially_received" | "canceled";
export type PurchasePaymentStatus = "unpaid" | "partially_paid" | "paid";

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // e.g. "PO-2026-089"
  tenantId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  date: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
}

// ==========================================
// EXPENSES
// ==========================================

export type ExpenseCategory =
  | "Rent and Utilities"
  | "Salaries and Wages"
  | "Inventory and Logistics"
  | "Marketing and Ads"
  | "Maintenance and Repairs"
  | "Licenses and Taxes"
  | "Office and Admin"
  | "Other";

export interface Expense {
  id: string;
  tenantId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  recordedBy: string;
  description?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  recurringFrequency?: "monthly" | "weekly" | "annually";
  status: "approved" | "pending" | "rejected";
}

// ==========================================
// DEBT and CREDIT MANAGEMENT
// ==========================================

export interface CreditAccount {
  id: string;
  tenantId: string;
  entityType: "customer" | "supplier";
  entityId: string;
  entityName: string;
  entityPhone: string;
  referenceDocId: string; // saleNumber or purchaseNumber
  referenceDocType: "sale" | "invoice" | "purchase";
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  createdAt: string;
  status: "current" | "due_soon" | "overdue" | "cleared";
}

export interface CreditPayment {
  id: string;
  tenantId: string;
  creditAccountId: string;
  entityType: "customer" | "supplier";
  entityName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceCode?: string;
  date: string;
  recordedBy: string;
  notes?: string;
}

// ==========================================
// INVOICING
// ==========================================

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0045"
  tenantId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  createdAt: string;
}

// ==========================================
// STAFF and PAYROLL and TARGETS
// ==========================================

export interface Staff {
  id: string;
  tenantId: string;
  userId?: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  nationalId?: string;
  hireDate: string;
  basicSalary: number;
  commissionRate: number; // percentage, e.g. 2.5%
  salesThisMonth: number;
  monthlyTarget: number;
  status: "active" | "on_leave" | "inactive";
  avatar?: string;
}

export type StaffMember = Staff;

export interface PayrollItem {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  commission: number;
  grossPay: number;
  deductions: number; // NHIF, NSSF, PAYE or advance
  netPay: number;
  status: "pending" | "approved" | "paid";
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  periodMonth: string; // e.g. "August 2026"
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: "draft" | "approved" | "paid";
  approvedBy?: string;
  approvedDate?: string;
  items: PayrollItem[];
}

export interface SalesTarget {
  id: string;
  tenantId: string;
  title: string;
  type: "business" | "team" | "individual";
  assignedToStaffId?: string;
  assignedToStaffName?: string;
  targetAmount: number;
  achievedAmount: number;
  startDate: string;
  endDate: string;
  period: "daily" | "weekly" | "monthly" | "quarterly";
  status: "active" | "completed" | "missed";
}

// ==========================================
// NOTIFICATIONS and PLATFORM ADMIN
// ==========================================

export type NotificationType =
  | "low_stock"
  | "new_sale"
  | "invoice_overdue"
  | "credit_payment_due"
  | "target_achieved"
  | "payroll_ready"
  | "purchase_received"
  | "system";

export interface NotificationItem {
  id: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
  severity: "info" | "success" | "warning" | "danger";
}

export interface SaaSPlan {
  id: "starter" | "professional" | "enterprise";
  name: string;
  price: number;
  billingPeriod: "monthly" | "annually";
  description: string;
  features: string[];
  maxStaff: number;
  maxProducts: number;
  maxInvoicesPerMonth: number;
  isPopular?: boolean;
}

export interface PlatformTenantOverview {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  businessType: string;
  plan: "starter" | "professional" | "enterprise";
  status: "active" | "trial" | "past_due" | "canceled";
  staffCount: number;
  productsCount: number;
  monthlyRevenue: number;
  totalSalesVolume: number;
  createdAt: string;
}

// ==========================================
// DAILY RECONCILIATIONS
// ==========================================

export type ReconciliationStatus = "reconciled" | "discrepancy" | "pending";

export interface DailyReconciliation {
  id: string;
  tenantId: string;
  tenantName: string;
  branchId: string;
  branchName: string;
  date: string;
  openingFloat: number;
  cashSales: number;
  cashExpenses: number;
  expectedCash: number;
  actualCash: number;
  cashDiscrepancy: number; // actualCash - expectedCash
  mpesaExpected: number;
  mpesaActual: number;
  mpesaDiscrepancy: number;
  cardExpected: number;
  cardActual: number;
  cardDiscrepancy: number;
  totalCollected: number;
  status: ReconciliationStatus;
  reconciledBy: string;
  verifiedAt?: string;
  notes?: string;
}
