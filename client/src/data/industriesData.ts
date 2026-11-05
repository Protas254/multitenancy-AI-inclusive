export interface IndustryInfo {
  slug: string;
  name: string;
  seoTitle: string;
  h1: string;
  metaDescription: string;
  directAnswer: string;
  heroTagline: string;
  challenges: {
    title: string;
    description: string;
  }[];
  keyFeatures: {
    title: string;
    description: string;
    slug: string;
  }[];
  typicalWorkflow: {
    step: string;
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  recommendedPlan: string;
}

export const INDUSTRIES_DATA: Record<string, IndustryInfo> = {
  "retail-shops": {
    slug: "retail-shops",
    name: "Retail Shops & Boutiques",
    seoTitle: "Retail Shop Management & POS Software in Kenya | StoreGrid",
    h1: "Run Your Retail Shop Smarter with StoreGrid POS & Stock Software",
    metaDescription:
      "Modern retail software for Kenyan general retail shops, minimarts, cosmetics boutiques, and gift shops. Fast checkout, stock alerts, and M-PESA reconciliation.",
    directAnswer:
      "StoreGrid for Retail Shops is an easy-to-use POS and stock management solution designed for retail stores in Kenya. It handles barcode checkout, cash and M-PESA reconciliation, customer credit accounts, and low-stock reorder alerts.",
    heroTagline: "Everything you need to speed up counter checkout, track inventory shrinkage, and eliminate cashier reconciliation disputes.",
    challenges: [
      {
        title: "Cash and M-PESA Reconciliation Discrepancies",
        description: "Retailers struggle to match physical cash drawer counts with M-PESA Till balances at the end of every busy shift.",
      },
      {
        title: "Untracked Inventory Shrinkage",
        description: "Stock discrepancies between what was bought from suppliers and what was rung up at the till lead to unmeasured financial losses.",
      },
      {
        title: "Customer Debt Disorganization",
        description: "Paper credit books get damaged, lost, or disputed, preventing timely recovery of outstanding debts.",
      },
    ],
    keyFeatures: [
      { title: "Point of Sale (POS)", description: "High-speed barcode scanner checkout with thermal receipt printing.", slug: "pos-system" },
      { title: "M-PESA Integration", description: "Validate Safaricom transaction reference codes directly on screen.", slug: "mpesa" },
      { title: "Customer Credit Ledger", description: "Track customer debt balances with aging brackets and limits.", slug: "credit-management" },
      { title: "Low-Stock Alerts", description: "Receive instant notifications when shelf inventory reaches minimum levels.", slug: "inventory-management" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Morning Shift Open", description: "Cashier opens shift by counting opening drawer float in StoreGrid." },
      { step: "02", title: "Ring Up Daily Sales", description: "Scan barcodes, accept M-PESA or cash, and issue printable receipts." },
      { step: "03", title: "Close Shift & Audit", description: "Reconcile counted cash and verified M-PESA payments in under 2 minutes." },
    ],
    faqs: [
      {
        question: "Can I use StoreGrid with a handheld barcode scanner?",
        answer: "Yes. StoreGrid works natively with any standard USB or Bluetooth handheld barcode scanner.",
      },
      {
        question: "How long does it take to train retail shop cashiers?",
        answer: "Most cashiers learn StoreGrid in less than 15 minutes due to the intuitive visual checkout screen.",
      },
    ],
    recommendedPlan: "Starter Retail or Growth Pro",
  },
  "supermarkets": {
    slug: "supermarkets",
    name: "Supermarkets & Minimarts",
    seoTitle: "Supermarket & Minimart POS Software in Kenya | StoreGrid",
    h1: "High-Volume POS and Stock Software for Supermarkets & Minimarts",
    metaDescription:
      "Enterprise POS software built for multi-counter supermarkets in Kenya. Handle barcode scanning, weigh scales, supplier deliveries, and central warehousing.",
    directAnswer:
      "StoreGrid Supermarket Software supports multi-till checkout lines, high-volume barcode scanning, wholesale and retail pack conversions, supplier purchase orders, and multi-branch stock distribution.",
    heroTagline: "Built for peak customer traffic, thousands of product SKUs, and disciplined cashier drawer oversight.",
    challenges: [
      {
        title: "Long Checkout Queues during Rush Hours",
        description: "Laggy checkout systems frustrate shoppers during evening and weekend peaks.",
      },
      {
        title: "Complex Pack and Unit Conversions",
        description: "Supermarkets purchase bulk cartons or crates and sell individual packets or units without losing count.",
      },
      {
        title: "Cashier Thefts and Unauthorized Discounts",
        description: "Loose till operations without manager authorization locks lead to significant drawer shrinkage.",
      },
    ],
    keyFeatures: [
      { title: "Multi-Counter POS", description: "Connect multiple cashier terminals simultaneously to one shared inventory.", slug: "pos-system" },
      { title: "Manager Authorization PINs", description: "Require manager approval for item voids, returns, and manual discounts.", slug: "staff-management" },
      { title: "Supplier Procurement", description: "Manage purchase orders, bulk receiving, and accounts payable.", slug: "purchases" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Receive Bulk Pallets", description: "Check in supplier goods and unpack bulk cases into retail unit quantities." },
      { step: "02", title: "Multi-Lane Checkout", description: "Multiple cashiers ring up customer baskets simultaneously with barcode scanners." },
      { step: "03", title: "Warehouse Stock Replenish", description: "Trigger internal stock transfers from central storage to checkout shelves." },
    ],
    faqs: [
      {
        question: "Can multiple cashiers ring up sales at the same time?",
        answer: "Yes. StoreGrid synchronizes multiple POS terminals in real time without stock conflicts.",
      },
    ],
    recommendedPlan: "Enterprise Chain",
  },
  "wholesalers": {
    slug: "wholesalers",
    name: "Wholesale & Distribution Businesses",
    seoTitle: "Wholesale & Distributor Business Software in Kenya | StoreGrid",
    h1: "Wholesale Management, B2B Invoicing & Bulk Inventory Control",
    metaDescription:
      "Software for wholesalers and distributors in Kenya. Multi-tier wholesale pricing, credit limits, delivery notes, and bulk warehouse transfers.",
    directAnswer:
      "StoreGrid for Wholesalers empowers bulk distributors with tiered pricing (Retail, Wholesale, VIP), B2B tax invoice and delivery note generation, customer credit aging ledgers, and supplier debt management.",
    heroTagline: "Manage bulk shipments, customer credit limits, and delivery notes from one centralized dashboard.",
    challenges: [
      {
        title: "Tracking High-Value Customer Credit Books",
        description: "Wholesale clients buy goods on 30-day or 60-day terms, making disciplined credit aging tracking critical.",
      },
      {
        title: "Tiered Pricing Management",
        description: "Different customers receive different wholesale price breaks based on order volume and relationship.",
      },
    ],
    keyFeatures: [
      { title: "B2B Invoicing & Delivery Notes", description: "Create professional tax-compliant PDF invoices and packing lists.", slug: "invoicing" },
      { title: "Customer Credit Aging", description: "Track 30/60/90-day overdue accounts with automated statements.", slug: "credit-management" },
      { title: "Multi-Warehouse Management", description: "Manage goods across central depots and distribution vans.", slug: "multi-branch" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Receive Wholesale Order", description: "Create a formal sales quote or order with volume discount pricing." },
      { step: "02", title: "Dispatch Goods", description: "Print delivery notes and decrement warehouse inventory quantities." },
      { step: "03", title: "Collect Bank / M-PESA Payment", description: "Apply incoming customer payments to reconcile the outstanding invoice." },
    ],
    faqs: [
      {
        question: "Can I set custom pricing tiers for wholesale customers?",
        answer: "Yes. StoreGrid supports multiple pricing tiers such as Standard Retail, Wholesale, and Key Account pricing.",
      },
    ],
    recommendedPlan: "Growth Pro or Enterprise Chain",
  },
  "hardware-stores": {
    slug: "hardware-stores",
    name: "Hardware & Building Material Stores",
    seoTitle: "Hardware Shop & Building Materials POS Software | StoreGrid",
    h1: "Hardware Store Inventory, Pricing & Credit Management Software",
    metaDescription:
      "Manage hardware materials, cement, timber, pipes, paints, and tools with StoreGrid. Support contractor credit accounts, delivery notes, and bulk pricing.",
    directAnswer:
      "StoreGrid for Hardware Stores simplifies managing thousands of building items, custom units of measurement (meters, pieces, bags), contractor debt accounts, and delivery dispatch documentation.",
    heroTagline: "Stop losing money on contractor debts and complex fractional hardware units.",
    challenges: [
      {
        title: "Contractor Credit Management",
        description: "Contractors take cement and steel on credit and pay only when project phases complete.",
      },
      {
        title: "Massive Inventory Variations",
        description: "Hardware stores stock thousands of plumbing, electrical, and structural items with diverse sizes.",
      },
    ],
    keyFeatures: [
      { title: "Contractor Debt Accounts", description: "Set individual contractor credit ceilings and track project invoices.", slug: "credit-management" },
      { title: "Delivery Notes", description: "Generate dispatch notes for building site truck deliveries.", slug: "invoicing" },
      { title: "Multi-Unit Support", description: "Sell goods by bag, length in meters, weight, or individual piece.", slug: "inventory-management" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Contractor Site Order", description: "Add required materials to contractor project invoice." },
      { step: "02", title: "Loading & Dispatch", description: "Print delivery slip for truck driver and decrement yard stock." },
      { step: "03", title: "Payment Settlement", description: "Record partial milestone bank or M-PESA deposits from the builder." },
    ],
    faqs: [
      {
        question: "Can I print delivery slips for truck drivers?",
        answer: "Yes. StoreGrid generates printable delivery notes showing item quantities without displaying internal profit margins.",
      },
    ],
    recommendedPlan: "Growth Pro",
  },
  "barbershops": {
    slug: "barbershops",
    name: "Barbershops & Kinyozi",
    seoTitle: "Barbershop (Kinyozi) POS & Commission Software in Kenya | StoreGrid",
    h1: "Barbershop POS, Barber Commission & Daily Cash Reconciliation",
    metaDescription:
      "Manage your kinyozi or barbershop with StoreGrid. Track barber sales commissions, M-PESA payments, client bookings, and product retail sales.",
    directAnswer:
      "StoreGrid for Barbershops helps salon and kinyozi owners calculate barber daily commissions, record client hair grooming services, track product retail sales (beard oils, hair dyes), and prevent cashier cash shrinkage.",
    heroTagline: "Automate barber commissions, track daily M-PESA collections, and know your true daily profit.",
    challenges: [
      {
        title: "Manual Daily Barber Commission Splits",
        description: "Owners waste hours each evening calculating percentage splits for 5 to 15 different barbers.",
      },
      {
        title: "Direct-to-Barber M-PESA Payments",
        description: "Clients send money to individual barbers' personal phones instead of the business Till.",
      },
    ],
    keyFeatures: [
      { title: "Automated Barber Commissions", description: "Assign custom commission percentages (e.g. 50/50, 60/40) per barber.", slug: "payroll" },
      { title: "Lipa Na M-PESA Checkout", description: "Route all client payments into the official shop Till with instant validation.", slug: "mpesa" },
      { title: "Retail Product Sales", description: "Sell and track styling products alongside grooming services.", slug: "inventory-management" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Select Barber & Service", description: "Cashier selects Barber and customer service (e.g. Haircut, Beard trim, Dye)." },
      { step: "02", title: "Receive M-PESA Payment", description: "Client pays to shop Till and cashier verifies reference on POS." },
      { step: "03", title: "End of Day Commission", description: "StoreGrid automatically prints payout summary per barber with zero math errors." },
    ],
    faqs: [
      {
        question: "Can different barbers have different commission percentages?",
        answer: "Yes. You can customize commission rates individually for senior stylists, barbers, and apprentices.",
      },
    ],
    recommendedPlan: "Starter Retail",
  },
  "salons": {
    slug: "salons",
    name: "Beauty Salons & Hair Studios",
    seoTitle: "Beauty Salon POS & Stylist Commission Software in Kenya | StoreGrid",
    h1: "Salon POS, Stylist Commissions & Inventory Management Software",
    metaDescription:
      "Complete software for beauty salons and hair studios. Track stylist service commissions, hair products inventory, customer loyalty, and daily cash flow.",
    directAnswer:
      "StoreGrid for Salons manages hair salon operations including stylist commission payouts, tracking chemical and product usage, client loyalty rewards, and daily M-PESA reconciliation.",
    heroTagline: "Elevate your salon business with transparent stylist compensation, VIP client loyalty, and live stock control.",
    challenges: [
      {
        title: "Disappearing Hair Products and Chemicals",
        description: "Expensive hair oils, braids, shampoos, and treatments disappear without accurate usage records.",
      },
      {
        title: "Stylist Commission Disputes",
        description: "Disagreements over who performed which service lead to workplace friction.",
      },
    ],
    keyFeatures: [
      { title: "Stylist Commission Engine", description: "Calculate fair stylist payouts automatically on every service.", slug: "payroll" },
      { title: "Product Inventory Tracking", description: "Track both retail merchandise for sale and salon back-bar products.", slug: "inventory-management" },
      { title: "Customer Loyalty Points", description: "Reward loyal clients with redeemable points to boost salon retention.", slug: "loyalty-program" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Check In Client", description: "Select customer profile and assign hair stylist or nail technician." },
      { step: "02", title: "Ring Up Services & Goods", description: "Combine braiding service and purchased shampoo in one bill." },
      { step: "03", title: "Payout & Reports", description: "Review daily revenue, stylist commissions, and stock depletion." },
    ],
    faqs: [
      {
        question: "Can I track loyalty points for salon customers?",
        answer: "Yes. StoreGrid awards loyalty points based on service spend which clients can redeem for discounts.",
      },
    ],
    recommendedPlan: "Growth Pro",
  },
  "spas": {
    slug: "spas",
    name: "Spas & Wellness Centers",
    seoTitle: "Spa & Wellness Center Management Software | StoreGrid",
    h1: "Spa POS, Therapist Commission & Wellness Service Management",
    metaDescription:
      "Software for spas, massage centers, and wellness studios in Kenya. Manage therapist commissions, package sales, customer profiles, and product stock.",
    directAnswer:
      "StoreGrid for Spas helps wellness centers streamline treatment billing, therapist commission allocation, gift vouchers, product inventory, and customer relationship management.",
    heroTagline: "Streamlined operational serenity for modern spas, massage clinics, and wellness retreats.",
    challenges: [
      {
        title: "Therapist Room & Commission Allocation",
        description: "Tracking multiple therapists and multi-service treatment packages.",
      },
    ],
    keyFeatures: [
      { title: "Therapist Commission Automation", description: "Automatically calculate treatment service payouts.", slug: "payroll" },
      { title: "Oils & Cosmetic Inventory", description: "Monitor consumable treatment products and retail sales.", slug: "inventory-management" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Treatment Booking", description: "Book massage or facial package and assign therapist." },
      { step: "02", title: "POS Checkout", description: "Client pays via M-PESA or Card; receipt generates instantly." },
    ],
    faqs: [
      {
        question: "Does StoreGrid support gift vouchers or prepaid packages?",
        answer: "Yes. StoreGrid allows customer credit balances and package tracking.",
      },
    ],
    recommendedPlan: "Growth Pro",
  },
  "electronics": {
    slug: "electronics",
    name: "Electronics & Phone Shops",
    seoTitle: "Electronics & Mobile Phone Shop POS Software | StoreGrid",
    h1: "Electronics POS, Serial Number / IMEI Tracking & Warranty Records",
    metaDescription:
      "Manage electronics, smartphones, accessories, and repairs. Track serial numbers/IMEIs, print branded receipts, and verify customer warranties.",
    directAnswer:
      "StoreGrid for Electronics Stores is designed for smartphone retailers, laptop dealers, and gadget stores. It tracks serial and IMEI numbers on receipts, manages warranty histories, and monitors accessories stock.",
    heroTagline: "Protect your tech store with serial number warranty tracking and instant M-PESA sales verification.",
    challenges: [
      {
        title: "Warranty Disputes without Serial Records",
        description: "Customers return counterfeit or broken items claiming they purchased them from your store.",
      },
      {
        title: "High Inventory Value & Shrinkage Risk",
        description: "Small high-value items like iPhones, AirPods, and flash drives are vulnerable to theft.",
      },
    ],
    keyFeatures: [
      { title: "Serial & IMEI Number Logging", description: "Record device serial numbers on receipts for foolproof warranty tracking.", slug: "pos-system" },
      { title: "Stock Auditing & Discrepancy Alerts", description: "Real-time tracking of high-value electronics inventory.", slug: "inventory-management" },
      { title: "Supplier Warranties", description: "Track supplier returns and defect replacements.", slug: "supplier-management" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Scan Device IMEI/Serial", description: "Capture unique device identifier during stock-in and checkout." },
      { step: "02", title: "Print Warranty Receipt", description: "Generate customer receipt displaying serial number and warranty validity." },
      { step: "03", title: "Verify Claims", description: "Look up receipt by serial number instantly when warranty claims arise." },
    ],
    faqs: [
      {
        question: "Can StoreGrid print IMEI numbers on customer receipts?",
        answer: "Yes. StoreGrid allows you to attach unique IMEI or serial numbers to individual sales items on receipts.",
      },
    ],
    recommendedPlan: "Growth Pro",
  },
  "clothing-stores": {
    slug: "clothing-stores",
    name: "Clothing & Footwear Boutiques",
    seoTitle: "Clothing Boutique & Shoe Store POS Software | StoreGrid",
    h1: "Boutique POS, Size & Color Variants & Inventory Management",
    metaDescription:
      "Software for clothing boutiques and shoe retailers in Kenya. Manage size/color matrices, barcode label printing, customer loyalty, and seasonal sales.",
    directAnswer:
      "StoreGrid for Clothing Stores makes managing fashion retail easy with product variant matrices (Size, Color, Brand), barcode generation, customer loyalty points, and real-time inventory tracking.",
    heroTagline: "Organize sizes, colors, and styles without inventory confusion or lost sales.",
    challenges: [
      {
        title: "Managing Hundreds of Size and Color Combinations",
        description: "Running out of size Medium while having excess Extra-Large in stock due to unsegmented tracking.",
      },
    ],
    keyFeatures: [
      { title: "Product Variant Matrix", description: "Manage items across multiple sizes, colors, and cuts.", slug: "inventory-management" },
      { title: "Customer VIP Loyalty", description: "Reward repeat fashion buyers with tiered member discounts.", slug: "loyalty-program" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Stock In New Collection", description: "Enter dress or shoe styles with their respective size/color variants." },
      { step: "02", title: "Scan Barcode at Counter", description: "Sell specific variant; inventory decrements the exact size and color." },
    ],
    faqs: [
      {
        question: "Can I print custom barcode stickers for clothing tags?",
        answer: "Yes. StoreGrid generates barcodes that can be printed on standard label printers.",
      },
    ],
    recommendedPlan: "Starter Retail or Growth Pro",
  },
  "furniture-timber": {
    slug: "furniture-timber",
    name: "Furniture & Timber Yards",
    seoTitle: "Furniture Workshop & Timber Yard Software in Kenya | StoreGrid",
    h1: "Furniture Workshop, Timber Inventory & Custom Job Costing Software",
    metaDescription:
      "Software for timber yards, carpentry workshops, and furniture showrooms. Manage raw lumber, custom orders, client deposits, and delivery slips.",
    directAnswer:
      "StoreGrid for Furniture and Timber Businesses tracks linear feet and board volumes of lumber, custom workshop customer orders, partial deposit payments, and dispatch delivery notes.",
    heroTagline: "Master lumber stock, customer custom order deposits, and delivery fulfillment.",
    challenges: [
      {
        title: "Tracking Client Order Deposits",
        description: "Clients pay 50% deposit for custom furniture and settle the remaining balance upon delivery.",
      },
      {
        title: "Raw Timber vs Finished Furniture Costing",
        description: "Difficulty understanding exact material and carpenter wage costs on custom pieces.",
      },
    ],
    keyFeatures: [
      { title: "Custom Job Deposits", description: "Record milestone deposits with remaining balance tracking.", slug: "credit-management" },
      { title: "Delivery Slips", description: "Generate dispatch notes for furniture transport.", slug: "invoicing" },
      { title: "Carpenter Commission / Wages", description: "Track piece-rate and commission wages for workshop craftsmen.", slug: "payroll" },
    ],
    typicalWorkflow: [
      { step: "01", title: "Record Custom Order", description: "Enter client specifications and record 50% advance deposit." },
      { step: "02", title: "Workshop Production", description: "Track material usage and carpenter compensation." },
      { step: "03", title: "Final Delivery & Settlement", description: "Collect remaining balance upon customer delivery confirmation." },
    ],
    faqs: [
      {
        question: "Can I record a partial deposit and settle the rest later?",
        answer: "Yes. StoreGrid supports partial payments and tracks outstanding balances with automated payment receipts.",
      },
    ],
    recommendedPlan: "Growth Pro",
  },
};
