export interface FeatureInfo {
  slug: string;
  title: string;
  seoTitle: string;
  h1: string;
  metaDescription: string;
  directAnswer: string;
  shortDesc: string;
  iconName: string;
  sections: {
    heading: string;
    subheading?: string;
    content: string;
    bulletPoints?: string[];
  }[];
  workflows: {
    step: string;
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  relatedFeatures: {
    title: string;
    slug: string;
  }[];
}

export const FEATURES_DATA: Record<string, FeatureInfo> = {
  "pos-system": {
    slug: "pos-system",
    title: "Point of Sale (POS) Software",
    seoTitle: "POS Software for Small Businesses in Kenya | StoreGrid",
    h1: "Fast, Reliable Point of Sale (POS) Software for Retail Businesses",
    metaDescription:
      "StoreGrid POS speeds up checkout with instant barcode scanning, cash and Lipa Na M-PESA reconciliation, receipt printing, and offline sales protection.",
    directAnswer:
      "StoreGrid POS is a cloud-based retail checkout terminal that runs on PCs, tablets, and smartphones. It enables cashiers to scan barcodes, verify M-PESA and cash payments in real time, print thermal receipts, and synchronize inventory across all store branches.",
    shortDesc: "Fast barcode & touch checkout with live M-PESA verification and shift reconciliations.",
    iconName: "Receipt",
    sections: [
      {
        heading: "Touch & Barcode-Ready Speed at Checkout",
        content:
          "Keep checkout queues moving with fast SKU search, barcode scanner integration, and keyboard shortcuts. Cashiers can apply pre-configured line discounts, switch price tiers, and ring up high-volume transactions with zero lag.",
        bulletPoints: [
          "Instant barcode lookup with standard USB & Bluetooth 1D/2D scanners",
          "One-click item modifiers, custom weight-based pricing, and units",
          "Quick-access favorite items tiles for frequent retail goods",
        ],
      },
      {
        heading: "Automated M-PESA & Cash Reconciliations",
        content:
          "End daily cashier shortages and eliminate fake M-PESA payment screenshots. Cashiers validate transaction codes against live payment records, automatically balancing physical cash drawers with digital sales ledgers.",
        bulletPoints: [
          "Instant Lipa Na M-PESA Till and Paybill verification at checkout",
          "Split tender: accept part M-PESA, part cash, or store credit in one sale",
          "Shift opening and closing cash drawer countdown reports",
        ],
      },
      {
        heading: "Thermal Receipts & Digital Delivery",
        content:
          "Deliver professional branded receipts through 58mm/80mm ESC/POS thermal printers, or dispatch paperless digital receipts directly to customer WhatsApp and SMS.",
      },
    ],
    workflows: [
      { step: "01", title: "Scan or Search Item", description: "Point the barcode scanner or tap top selling product tiles to add items to cart." },
      { step: "02", title: "Select Payment Method", description: "Choose Lipa Na M-PESA, Cash, Bank Transfer, or Customer Credit Account." },
      { step: "03", title: "Verify & Print Receipt", description: "Confirm receipt of funds, generate digital receipt, and trigger immediate stock decrement." },
    ],
    faqs: [
      {
        question: "Does StoreGrid POS work on regular computers or phones?",
        answer: "Yes. StoreGrid is a modern web application that runs smoothly on Windows PCs, MacBooks, Android tablets, iPads, and smartphones via modern browsers.",
      },
      {
        question: "Does StoreGrid support thermal receipt printers?",
        answer: "Yes. StoreGrid works with standard 58mm and 80mm ESC/POS thermal printers connected via USB, Bluetooth, or local network.",
      },
      {
        question: "How does M-PESA integration prevent fraud?",
        answer: "Cashiers match customer payment reference codes directly in StoreGrid before completing orders, ensuring money is confirmed in your Till or Paybill.",
      },
    ],
    relatedFeatures: [
      { title: "Inventory Management", slug: "inventory-management" },
      { title: "M-PESA Integration", slug: "mpesa" },
      { title: "Sales Management", slug: "sales-management" },
    ],
  },
  "inventory-management": {
    slug: "inventory-management",
    title: "Inventory Management Software",
    seoTitle: "Inventory Management Software for Small Businesses | StoreGrid",
    h1: "Manage Your Business Stock in Real Time with StoreGrid",
    metaDescription:
      "Track stock quantities, low-stock reorder triggers, supplier purchase orders, product variants, and multi-branch inventory transfers in one system.",
    directAnswer:
      "StoreGrid Inventory Management tracks stock balances in real time as sales and purchases occur. It alerts store owners to low stock, manages wholesale and retail price margins, tracks expiry dates, and facilitates stock transfers between multiple store locations.",
    shortDesc: "Real-time stock valuation, automated low-stock reorder triggers, and branch stock movement audits.",
    iconName: "Boxes",
    sections: [
      {
        heading: "Track Stock Received and Sold Automatically",
        content:
          "Every sale rung up at the POS deducts stock instantly, while received purchase orders restock shelves automatically. Never wonder how much inventory is on the floor or locked in the stockroom.",
        bulletPoints: [
          "Real-time decrement on every sale, refund, or exchange",
          "Automated purchase order receipts and stock reception logs",
          "Stock valuation using FIFO and weighted average cost methods",
        ],
      },
      {
        heading: "Low-Stock Reorder Triggers & Expiry Monitoring",
        content:
          "Set minimum stock threshold triggers on fast-moving goods. StoreGrid generates automated reorder advisories before you run out of stock, preventing lost revenue and dissatisfied customers.",
        bulletPoints: [
          "Configurable reorder thresholds per item and per branch",
          "Perishable goods batch tracking with early expiry warning alerts",
          "Damaged, lost, or expired stock write-off adjustment logs",
        ],
      },
      {
        heading: "Multi-Branch Stock Transfers & Auditing",
        content:
          "Transfer goods between central storage and branch shops with full transit visibility. Perform periodic cycle counts with variance reconciliation to catch inventory shrinkage early.",
      },
    ],
    workflows: [
      { step: "01", title: "Add Products & Variants", description: "Create products with barcodes, cost prices, selling prices, and reorder levels." },
      { step: "02", title: "Monitor Live Quantities", description: "Watch stock levels adjust in real time across all counters and branch warehouses." },
      { step: "03", title: "Reorder with 1-Click", description: "Generate supplier purchase orders automatically when items dip below reorder levels." },
    ],
    faqs: [
      {
        question: "Can I manage products with multiple sizes, colors, or units?",
        answer: "Yes. StoreGrid supports product variants (e.g. Size, Color) and units of measure (e.g. pieces, cartons, kilograms, liters).",
      },
      {
        question: "Can I transfer stock from a main store to a branch shop?",
        answer: "Yes. StoreGrid allows branch-to-branch and warehouse-to-branch transfers with sender and receiver confirmation workflows.",
      },
      {
        question: "Does StoreGrid calculate profit margins on inventory?",
        answer: "Yes. StoreGrid tracks cost of goods sold (COGS) and calculates real-time gross margin per product and category.",
      },
    ],
    relatedFeatures: [
      { title: "POS Software", slug: "pos-system" },
      { title: "Purchase Management", slug: "purchases" },
      { title: "Multi-Branch Management", slug: "multi-branch" },
    ],
  },
  "sales-management": {
    slug: "sales-management",
    title: "Sales Management Software",
    seoTitle: "Retail Sales Management Software in Kenya | StoreGrid",
    h1: "Complete Retail Sales Management & Revenue Tracking",
    metaDescription:
      "Monitor daily revenue, cashier sales velocity, profit margins, sales refunds, and digital order histories across your retail business.",
    directAnswer:
      "StoreGrid Sales Management provides real-time visibility into sales volume, transaction histories, gross profit margins, and payment breakdown across all counters and store outlets.",
    shortDesc: "Real-time revenue monitoring, cashier performance metrics, and detailed transaction histories.",
    iconName: "TrendingUp",
    sections: [
      {
        heading: "Daily Sales Velocity & Cashier Metrics",
        content: "Track which products are driving revenue, which cashiers are outperforming targets, and what hours experience peak customer traffic.",
        bulletPoints: [
          "Hourly, daily, weekly, and monthly revenue dashboards",
          "Breakdown by payment tender (M-PESA, Cash, Credit, Card)",
          "Cashier audit logs with void and refund authorization requirements",
        ],
      },
      {
        heading: "Itemized Transaction Histories",
        content: "Access historical receipts and customer orders instantly for warranty verification, exchanges, or customer account inquiries.",
      },
    ],
    workflows: [
      { step: "01", title: "Record Transaction", description: "Cashier completes the sale on POS or invoices a B2B corporate customer." },
      { step: "02", title: "Live Sync", description: "Sales data, profit margins, and inventory counts sync instantaneously to central reports." },
      { step: "03", title: "Close Shift", description: "Run end-of-day reconciliation comparing recorded tender vs drawer cash." },
    ],
    faqs: [
      {
        question: "Can managers see sales when away from the shop?",
        answer: "Yes. StoreGrid is 100% cloud-based; owners and directors can monitor real-time sales on their mobile phones from anywhere.",
      },
      {
        question: "Can cashiers delete or modify completed sales without authorization?",
        answer: "No. Role-based security prevents unauthorized voids or discounts without a manager PIN or admin login.",
      },
    ],
    relatedFeatures: [
      { title: "POS Software", slug: "pos-system" },
      { title: "Business Reports", slug: "business-reports" },
      { title: "Credit Tracking", slug: "credit-management" },
    ],
  },
  "credit-management": {
    slug: "credit-management",
    title: "Customer Credit & Debt Ledger",
    seoTitle: "Customer Credit & Debt Management Software | StoreGrid",
    h1: "Track Customer Debts & Overdue Credit with StoreGrid",
    metaDescription:
      "Eliminate manual paper debt books. Manage customer credit balances, debt aging brackets (30/60/90 days), credit limits, and payment reminders.",
    directAnswer:
      "StoreGrid Credit & Debt Management replaces vulnerable manual paper debt books with a secure digital ledger. It sets credit limits per customer, calculates overdue balances, tracks partial settlements, and produces aging reports.",
    shortDesc: "Digital customer debt book, aging brackets, credit limits, and settlement records.",
    iconName: "CreditCard",
    sections: [
      {
        heading: "End Untracked Customer Debts",
        content: "Stop losing revenue to lost or disputed customer debt books. Every credit sale attaches directly to the customer's digital profile with timestamped receipts.",
        bulletPoints: [
          "Individual customer credit limits and credit approval rules",
          "Debt aging reports (Current, 1-30 days, 31-60 days, 60+ days overdue)",
          "Partial payment recording with automated balance recalculation",
        ],
      },
      {
        heading: "Automated Debt Reminders",
        content: "Send respectful WhatsApp and SMS balance statements to customers showing original purchases and remaining balance due.",
      },
    ],
    workflows: [
      { step: "01", title: "Select Customer on POS", description: "Assign the cart to a registered customer account with active credit approval." },
      { step: "02", title: "Record Credit Sale", description: "System updates their outstanding balance and decreases available credit limit." },
      { step: "03", title: "Collect Settlement", description: "Record partial or full M-PESA/Cash settlements and print updated statement receipts." },
    ],
    faqs: [
      {
        question: "Can I stop a customer from taking more credit when over the limit?",
        answer: "Yes. StoreGrid alerts cashiers and blocks credit checkout when a customer exceeds their allocated credit limit.",
      },
      {
        question: "Does the system track debts owed to suppliers too?",
        answer: "Yes. StoreGrid manages accounts payable (supplier debt) and accounts receivable (customer credit).",
      },
    ],
    relatedFeatures: [
      { title: "Invoicing", slug: "invoicing" },
      { title: "Customer Management", slug: "customer-management" },
      { title: "POS Software", slug: "pos-system" },
    ],
  },
  "invoicing": {
    slug: "invoicing",
    title: "B2B Invoicing & Billing Software",
    seoTitle: "Invoicing & Billing Software for Small Businesses in Kenya | StoreGrid",
    h1: "Professional Invoicing & B2B Tax Receipts with StoreGrid",
    metaDescription:
      "Generate compliant B2B tax invoices, delivery notes, quotes, and credit notes. Print or email professional PDF statements to business clients.",
    directAnswer:
      "StoreGrid Invoicing allows wholesale and retail businesses to create professional PDF quotes, proforma invoices, delivery notes, and tax invoices with customizable payment terms and M-PESA Paybill instructions.",
    shortDesc: "Generate tax-compliant PDF invoices, delivery notes, quotes, and payment receipts.",
    iconName: "FileText",
    sections: [
      {
        heading: "Professional Invoices with Instant PDF Generation",
        content: "Equip your wholesale or service business with polished, branded invoices featuring your business logo, PIN, bank details, and Paybill numbers.",
        bulletPoints: [
          "Convert proforma quotes into active invoices with one click",
          "Automated VAT 16% and zero-rated tax calculations",
          "Delivery notes and dispatch documentation generation",
        ],
      },
    ],
    workflows: [
      { step: "01", title: "Create Quote or Invoice", description: "Pick client, add line items with wholesale prices, and set payment due date." },
      { step: "02", title: "Send to Client", description: "Download PDF or send directly via WhatsApp or email with payment details." },
      { step: "03", title: "Reconcile Payments", description: "Apply incoming bank or M-PESA deposits to mark invoices partially or fully paid." },
    ],
    faqs: [
      {
        question: "Can I add Kenyan KRA PIN and VAT details to invoices?",
        answer: "Yes. You can add your business KRA PIN, VAT registration number, and your customer's PIN to every invoice.",
      },
    ],
    relatedFeatures: [
      { title: "Customer Management", slug: "customer-management" },
      { title: "Credit Tracking", slug: "credit-management" },
    ],
  },
  "expense-management": {
    slug: "expense-management",
    title: "Expense & Petty Cash Management",
    seoTitle: "Business Expense Tracking & Petty Cash Software | StoreGrid",
    h1: "Track Business Expenses and Protect Net Profit Margins",
    metaDescription:
      "Record shop rent, electricity, transport, casual labor, and supplier expenses. Tie petty cash outflows directly to daily reconciliation summaries.",
    directAnswer:
      "StoreGrid Expense Management lets business owners record every operational expense, categorize costs, track petty cash drawer withdrawals, and calculate true net profit margins alongside gross sales.",
    shortDesc: "Record petty cash, store rent, utilities, and vendor costs with receipt attachments.",
    iconName: "Wallet",
    sections: [
      {
        heading: "Categorized Expense Recording",
        content: "Track recurring store overheads including rent, utility bills, inventory freight, and daily casual wages to understand your true operational cost.",
        bulletPoints: [
          "Customizable expense categories (Rent, Utilities, Transport, Repairs, Marketing)",
          "Petty cash drawer payouts with cashier shift reconciliation",
          "Real-time net profit calculation: Gross Revenue minus COGS and Operating Expenses",
        ],
      },
    ],
    workflows: [
      { step: "01", title: "Log Expense Outflow", description: "Select category, enter amount, payment method, and upload receipt photo." },
      { step: "02", title: "Cash Drawer Sync", description: "If paid from cashier drawer, drawer balance deducts automatically." },
      { step: "03", title: "P&L Analysis", description: "Review expense breakdowns on monthly profit and loss financial statements." },
    ],
    faqs: [
      {
        question: "Can staff record petty cash taken from the cash till?",
        answer: "Yes. Staff can record drawer payouts with mandatory reason notes, ensuring physical cash counts match exactly at shift close.",
      },
    ],
    relatedFeatures: [
      { title: "Business Reports", slug: "business-reports" },
      { title: "Sales Management", slug: "sales-management" },
    ],
  },
  "purchases": {
    slug: "purchases",
    title: "Supplier Purchase Order Management",
    seoTitle: "Supplier Purchase Orders & Procurement Software | StoreGrid",
    h1: "Manage Supplier Purchase Orders and Incoming Shipments",
    metaDescription:
      "Create purchase orders, record incoming supplier deliveries, update stock cost prices, and manage supplier payment terms.",
    directAnswer:
      "StoreGrid Purchase Management streamlines procurement by generating formal purchase orders, verifying incoming vendor shipments against quantities ordered, and updating stock levels and supplier payable balances in one action.",
    shortDesc: "Create vendor purchase orders, receive shipments, and update inventory cost prices.",
    iconName: "Truck",
    sections: [
      {
        heading: "End-to-End Procurement Workflow",
        content: "Order inventory with confidence. Ensure your business receives the exact quantities agreed with suppliers at the approved purchase price.",
      },
    ],
    workflows: [
      { step: "01", title: "Draft Purchase Order", description: "Select supplier, pick products, and specify delivery dates and quantities." },
      { step: "02", title: "Receive Delivery", description: "Verify physical cartons against the order and accept full or partial shipments." },
      { step: "03", title: "Auto-Restock", description: "Stock automatically increments and supplier accounts payable records are updated." },
    ],
    faqs: [
      {
        question: "Does receiving a purchase order automatically increase inventory?",
        answer: "Yes. Confirming receipt immediately increments stock without manual inventory count adjustments.",
      },
    ],
    relatedFeatures: [
      { title: "Inventory Management", slug: "inventory-management" },
      { title: "Supplier Management", slug: "supplier-management" },
    ],
  },
  "customer-management": {
    slug: "customer-management",
    title: "Customer Management & CRM",
    seoTitle: "Customer CRM Software for Retail Businesses | StoreGrid",
    h1: "Build Customer Loyalty & Track Purchase Histories with StoreGrid",
    metaDescription:
      "Create customer profiles, track purchase histories, reward repeat shoppers with loyalty points, and send automated receipt notifications.",
    directAnswer:
      "StoreGrid Customer Management is a built-in CRM that stores client contact info, total spend, loyalty points, and outstanding balances. It helps retailers recognize VIP shoppers and boost repeat visits.",
    shortDesc: "Customer purchase history, contact profiles, credit limits, and VIP loyalty reward tiers.",
    iconName: "Users",
    sections: [
      {
        heading: "Complete Customer Profiles at Checkout",
        content: "Search customers by name or phone number in 2 seconds at the POS. View their loyalty tier and previous shopping habits instantly.",
      },
    ],
    workflows: [
      { step: "01", title: "Register Customer", description: "Enter name and phone number during or before POS checkout." },
      { step: "02", title: "Track Every Visit", description: "Every sale accumulates loyalty points and updates their lifetime spend ledger." },
    ],
    faqs: [
      {
        question: "Can I import existing customer phone lists from Excel?",
        answer: "Yes. You can import customer contacts and opening balances via CSV/Excel spreadsheets.",
      },
    ],
    relatedFeatures: [
      { title: "Loyalty Program", slug: "loyalty-program" },
      { title: "Credit Tracking", slug: "credit-management" },
    ],
  },
  "supplier-management": {
    slug: "supplier-management",
    title: "Supplier & Vendor Management",
    seoTitle: "Supplier & Vendor Management Software | StoreGrid",
    h1: "Manage Supplier Contacts, Deliveries & Accounts Payable",
    metaDescription:
      "Track supplier catalogs, price history, pending payments, payment terms, and delivery performance in a centralized vendor directory.",
    directAnswer:
      "StoreGrid Supplier Management organizes all vendor contacts, product price history, open orders, and outstanding accounts payable in one dashboard, making reordering simple and preventing duplicate payments.",
    shortDesc: "Track supplier contacts, historical price quotes, outstanding bills, and payment terms.",
    iconName: "Briefcase",
    sections: [
      {
        heading: "Maintain Clean Vendor Accounts",
        content: "Keep complete records of distributors, wholesalers, and manufacturers with historical pricing and payment histories.",
      },
    ],
    workflows: [
      { step: "01", title: "Add Supplier Profile", description: "Save contact person, phone, email, and payment details." },
      { step: "02", title: "Order Goods", description: "Create purchase orders linked directly to this vendor." },
    ],
    faqs: [
      {
        question: "Can I see which supplier offers the lowest cost for a product?",
        answer: "Yes. Purchase histories show previous purchase costs from each supplier.",
      },
    ],
    relatedFeatures: [
      { title: "Purchase Management", slug: "purchases" },
      { title: "Inventory Management", slug: "inventory-management" },
    ],
  },
  "staff-management": {
    slug: "staff-management",
    title: "Staff & Cashier Management",
    seoTitle: "Staff & Cashier Management Software with Role Security | StoreGrid",
    h1: "Role-Based Staff Permissions and Cashier Oversight",
    metaDescription:
      "Control staff access permissions, require manager PINs for discounts and voids, and track individual sales performance and cash collections.",
    directAnswer:
      "StoreGrid Staff Management empowers business owners to create individual logins for cashiers, storekeepers, and managers with granular role-based permissions, protecting confidential profit margins and preventing unauthorized checkout changes.",
    shortDesc: "Granular access roles, cashier PIN security, shift audit logs, and performance tracking.",
    iconName: "ShieldCheck",
    sections: [
      {
        heading: "Strict Multi-Tier Permission Controls",
        content: "Give staff the tools to do their jobs without exposing sensitive financial reports, supplier costs, or owner configuration settings.",
      },
    ],
    workflows: [
      { step: "01", title: "Create Staff Account", description: "Assign email or username and assign role (Cashier, Storekeeper, Manager, Admin)." },
      { step: "02", title: "Monitor Activity", description: "Audit individual cashier shifts, checkout receipts, and drawer balances." },
    ],
    faqs: [
      {
        question: "Can I block cashiers from seeing product purchase cost or net profits?",
        answer: "Yes. Cashier roles are restricted to checkout operations and cannot see supplier cost prices or store profit margins.",
      },
    ],
    relatedFeatures: [
      { title: "Payroll Tools", slug: "payroll" },
      { title: "Sales Targets", slug: "sales-targets" },
    ],
  },
  "payroll": {
    slug: "payroll",
    title: "Retail Staff Payroll & Commissions",
    seoTitle: "Staff Payroll & Sales Commission Software in Kenya | StoreGrid",
    h1: "Automate Employee Salaries, Commissions & Payslips",
    metaDescription:
      "Calculate monthly employee salaries, sales commission bonuses, statutory deductions, salary advances, and generate printable payslips.",
    directAnswer:
      "StoreGrid Payroll automates staff compensation for retail stores and service businesses. It combines base salary, automated sales commission incentives, and salary advances into monthly payroll sheets with downloadable employee payslips.",
    shortDesc: "Monthly employee salaries, sales commissions, salary advance deductions, and payslips.",
    iconName: "Banknote",
    sections: [
      {
        heading: "Automated Sales Commission Tracking",
        content: "Motivate sales clerks and cashiers by automatically linking their sales volume to percentage or fixed commission rewards.",
      },
    ],
    workflows: [
      { step: "01", title: "Configure Compensation", description: "Set monthly base salary and commission rules per staff member." },
      { step: "02", title: "Generate Monthly Payroll", description: "Review automated totals including advances and commissions, then approve." },
    ],
    faqs: [
      {
        question: "Can I print individual payslips for employees?",
        answer: "Yes. StoreGrid generates clear PDF payslips ready to print or email to employees.",
      },
    ],
    relatedFeatures: [
      { title: "Staff Management", slug: "staff-management" },
      { title: "Sales Targets", slug: "sales-targets" },
    ],
  },
  "sales-targets": {
    slug: "sales-targets",
    title: "Employee Sales Targets",
    seoTitle: "Employee Sales Targets & Performance Tracking | StoreGrid",
    h1: "Set and Track Monthly Sales Targets for Store Staff",
    metaDescription:
      "Drive revenue growth by setting individual and branch sales targets with visual progress bars, pacing metrics, and achievement rewards.",
    directAnswer:
      "StoreGrid Sales Targets helps business owners align their team with revenue goals by setting monthly sales targets for individual cashiers and branches, tracking live progress to motivate high performance.",
    shortDesc: "Set monthly sales goals, track real-time progress, and incentivize peak performance.",
    iconName: "Target",
    sections: [
      {
        heading: "Visual Progress & Motivation",
        content: "Give staff visibility into their monthly target progress to keep motivation high throughout each shift.",
      },
    ],
    workflows: [
      { step: "01", title: "Define Target Goal", description: "Set monthly revenue or unit volume target for a branch or staff member." },
      { step: "02", title: "Track Progress", description: "StoreGrid visualizes current progress vs expected pacing daily." },
    ],
    faqs: [
      {
        question: "Can targets be set per branch as well as per staff member?",
        answer: "Yes. You can assign targets to entire store branches or individual staff members.",
      },
    ],
    relatedFeatures: [
      { title: "Payroll Tools", slug: "payroll" },
      { title: "Business Reports", slug: "business-reports" },
    ],
  },
  "loyalty-program": {
    slug: "loyalty-program",
    title: "Customer Loyalty & Rewards Program",
    seoTitle: "Customer Loyalty & Rewards Software for Retailers | StoreGrid",
    h1: "Turn First-Time Buyers into Repeat Customers with StoreGrid Loyalty",
    metaDescription:
      "Reward repeat shoppers with points per shilling spent, tiered membership levels (Bronze to Platinum), and point redemption at POS checkout.",
    directAnswer:
      "StoreGrid Loyalty Program enables small businesses to launch customer rewards programs. Customers earn points based on their spend and can redeem points for discounts during future POS checkouts.",
    shortDesc: "Earn points per shilling spent, tiered member benefits, and POS redemption.",
    iconName: "Gift",
    sections: [
      {
        heading: "Effortless Points Accumulation at Checkout",
        content: "Points add to customer accounts automatically when their phone number is entered at checkout, without requiring separate plastic cards.",
      },
    ],
    workflows: [
      { step: "01", title: "Configure Points Rules", description: "Decide point earning rates (e.g. 1 point per KES 100) and redemption values." },
      { step: "02", title: "Redeem at POS", description: "Apply customer points as payment tender for instant cart discounts." },
    ],
    faqs: [
      {
        question: "Do customers need an app to use loyalty points?",
        answer: "No. Everything is identified using the customer's phone number during checkout.",
      },
    ],
    relatedFeatures: [
      { title: "Customer Management", slug: "customer-management" },
      { title: "POS Software", slug: "pos-system" },
    ],
  },
  "business-reports": {
    slug: "business-reports",
    title: "Business Reports & Financial Analytics",
    seoTitle: "Retail Business Reports & Profit Analytics Software | StoreGrid",
    h1: "Comprehensive Business Reports & Profit Intelligence",
    metaDescription:
      "Access gross profit margins, inventory valuation, daily sales summaries, cashier audits, and exportable financial reports in CSV and PDF.",
    directAnswer:
      "StoreGrid Business Reports turns raw transaction data into clear financial insights. Business owners can review real-time profit and loss statements, stock valuation, best-selling products, and end-of-day reconciliation summaries.",
    shortDesc: "Real-time P&L summaries, stock valuation, product velocity, and cash drawer reconciliations.",
    iconName: "BarChart3",
    sections: [
      {
        heading: "Know Your True Profits and Margins",
        content: "Stop guessing your earnings. StoreGrid calculates real gross profit (Revenue minus COGS) and net profit (Gross Margin minus Expenses) automatically.",
      },
    ],
    workflows: [
      { step: "01", title: "Select Date Range", description: "Filter reports by today, this week, this month, or custom date brackets." },
      { step: "02", title: "Analyze Performance", description: "Inspect margins by category, branch, or individual product." },
      { step: "03", title: "Export Reports", description: "Download CSV or PDF summaries for accountants or tax filing." },
    ],
    faqs: [
      {
        question: "Can I export reports for my accountant?",
        answer: "Yes. All reports can be exported instantly to CSV and printable PDF formats.",
      },
    ],
    relatedFeatures: [
      { title: "Sales Management", slug: "sales-management" },
      { title: "Expense Management", slug: "expense-management" },
    ],
  },
  "multi-branch": {
    slug: "multi-branch",
    title: "Multi-Branch & Warehouse Management",
    seoTitle: "Multi-Branch Retail Management Software in Kenya | StoreGrid",
    h1: "Manage Multiple Store Branches and Warehouses in One Account",
    metaDescription:
      "Centralize inventory, track inter-branch stock transfers, compare branch revenue, and maintain owner-level control across all retail outlets.",
    directAnswer:
      "StoreGrid Multi-Branch Management links multiple retail outlets, supermarkets, and central warehouses under a unified login. Business owners can track performance by branch, initiate inter-branch stock transfers, and view consolidated company financials.",
    shortDesc: "Unified central management, branch-to-branch transfers, and multi-location analytics.",
    iconName: "Building2",
    sections: [
      {
        heading: "One Unified Platform for All Outlets",
        content: "No need for separate disconnected software installations. Switch between store branches in seconds or view consolidated company performance.",
      },
    ],
    workflows: [
      { step: "01", title: "Create Branch Locations", description: "Add outlets with their respective addresses, cashiers, and inventory stocks." },
      { step: "02", title: "Transfer Inventory", description: "Send stock from main warehouse to branch shops with verification receipts." },
      { step: "03", title: "Consolidated View", description: "Compare branch sales side-by-side on your executive dashboard." },
    ],
    faqs: [
      {
        question: "Can a cashier in Branch A access Branch B records?",
        answer: "No. Staff can be locked to their assigned physical branch location.",
      },
    ],
    relatedFeatures: [
      { title: "Inventory Management", slug: "inventory-management" },
      { title: "Business Reports", slug: "business-reports" },
    ],
  },
  "mpesa": {
    slug: "mpesa",
    title: "Lipa Na M-PESA Integration",
    seoTitle: "Lipa Na M-PESA POS Integration for Small Businesses | StoreGrid",
    h1: "Automated Lipa Na M-PESA Payments & Reconciliations",
    metaDescription:
      "Reconcile M-PESA Till and Paybill payments instantly at POS checkout. Prevent fraudulent confirmation messages and speed up retail queues.",
    directAnswer:
      "StoreGrid M-PESA Integration connects retail checkouts directly with Safaricom Lipa Na M-PESA Till and Paybill accounts, ensuring instant verification of customer transaction codes and accurate end-of-day payment reconciliation.",
    shortDesc: "Direct Till & Paybill validation, automated payment matching, and zero cashier reconciliation lag.",
    iconName: "Smartphone",
    sections: [
      {
        heading: "Instant Checkout Verification",
        content: "Cashiers verify transaction reference codes on screen before issuing receipts, eliminating fake SMS screenshot scams.",
      },
    ],
    workflows: [
      { step: "01", title: "Customer Pays via M-PESA", description: "Customer sends funds to your Store Buy Goods Till or Paybill number." },
      { step: "02", title: "Verify Code", description: "Cashier enters or verifies the Safaricom confirmation code in StoreGrid POS." },
      { step: "03", title: "Receipt & Reconciliation", description: "Transaction logs to the day's M-PESA ledger and prints receipt." },
    ],
    faqs: [
      {
        question: "Does StoreGrid work with both Buy Goods Till numbers and Paybill numbers?",
        answer: "Yes. StoreGrid supports both Lipa Na M-PESA Buy Goods Till numbers and Paybill business numbers.",
      },
    ],
    relatedFeatures: [
      { title: "POS Software", slug: "pos-system" },
      { title: "Sales Management", slug: "sales-management" },
    ],
  },
};
