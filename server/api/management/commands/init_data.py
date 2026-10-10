from django.core.management.base import BaseCommand
from api.models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification,
    CreditAccount, CreditPayment, StockMovement, Invoice, InvoiceItem,
    Purchase, PurchaseItem, LoyaltyReward, LoyaltyTransaction, SaaSPlan
)
from datetime import date, timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = "Initialize superuser Protas and seed sample multi-tenant store data"

    def handle(self, *args, **options):
        self.stdout.write("Initializing Django backend database...")

        # 1. Create Superuser Protas
        email = "protasjunior254@gmail.com"
        username = "Protas"
        password = "Protas@01"

        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_superuser(
                email=email,
                username=username,
                password=password,
                name="Protas Junior",
                phone="+254700000000"
            )
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' ({email}) created successfully."))
        else:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' password updated."))

        # 2. Seed Tenants
        tenant_fashion, _ = Tenant.objects.get_or_create(
            id="tenant-fashion",
            defaults={"name": "Fashion Hub Ltd", "slug": "fashion-hub", "plan": "enterprise", "currency": "KES"}
        )
        tenant_electro, _ = Tenant.objects.get_or_create(
            id="tenant-electronics",
            defaults={"name": "TechPoint Electronics", "slug": "techpoint", "plan": "pro", "currency": "KES"}
        )

        # 3. Create Memberships
        Membership.objects.get_or_create(
            user=user, tenant=tenant_fashion,
            defaults={"role": "owner", "designation": "Managing Director"}
        )
        Membership.objects.get_or_create(
            user=user, tenant=tenant_electro,
            defaults={"role": "owner", "designation": "Chief Executive"}
        )

        # 4. Seed Categories for Fashion Hub
        cat1, _ = Category.objects.get_or_create(
            id="cat-1", tenant=tenant_fashion,
            defaults={"name": "Apparel & Menswear", "description": "Men shirts, suits, trousers", "icon": "shirt"}
        )
        cat2, _ = Category.objects.get_or_create(
            id="cat-2", tenant=tenant_fashion,
            defaults={"name": "Footwear & Shoes", "description": "Leather shoes, sneakers", "icon": "footwear"}
        )

        # 5. Seed Suppliers
        sup1, _ = Supplier.objects.get_or_create(
            id="sup-1", tenant=tenant_fashion,
            defaults={
                "name": "Nairobi Garments Wholesalers",
                "contact_person": "Kamau Njuguna",
                "email": "sales@garments.co.ke",
                "phone": "+254711223344",
                "category": "Apparel"
            }
        )

        # 6. Seed Products
        p1, _ = Product.objects.get_or_create(
            id="prod-1", tenant=tenant_fashion,
            defaults={
                "name": "Italian Fit Slim Wool Suit - Navy",
                "sku": "SUIT-NV-001",
                "barcode": "61640001001",
                "category": cat1,
                "supplier": sup1,
                "buying_price": 8500,
                "selling_price": 14500,
                "current_stock": 18,
                "min_stock_level": 5,
                "description": "Premium 100% Italian virgin wool tailored suit."
            }
        )
        p2, _ = Product.objects.get_or_create(
            id="prod-2", tenant=tenant_fashion,
            defaults={
                "name": "Oxford Cotton Button-Down Shirt - White",
                "sku": "SHIRT-WH-002",
                "barcode": "61640001002",
                "category": cat1,
                "supplier": sup1,
                "buying_price": 1800,
                "selling_price": 3200,
                "current_stock": 35,
                "min_stock_level": 10,
                "description": "Breathable 100% cotton Oxford shirt."
            }
        )
        p3, _ = Product.objects.get_or_create(
            id="prod-3", tenant=tenant_fashion,
            defaults={
                "name": "Genuine Leather Derby Shoes - Brown",
                "sku": "SHOE-BR-003",
                "barcode": "61640001003",
                "category": cat2,
                "supplier": sup1,
                "buying_price": 4200,
                "selling_price": 7500,
                "current_stock": 4,  # Low stock alert
                "min_stock_level": 5,
                "description": "Handcrafted full-grain leather formal Derby shoes."
            }
        )

        # 7. Seed Customers
        c1, _ = Customer.objects.get_or_create(
            id="cust-1", tenant=tenant_fashion,
            defaults={
                "name": "David Ochieng",
                "email": "david.ochieng@gmail.com",
                "phone": "+254722114455",
                "total_purchases": 42000,
                "loyalty_points": 420
            }
        )
        c2, _ = Customer.objects.get_or_create(
            id="cust-2", tenant=tenant_fashion,
            defaults={
                "name": "Sarah Mwangi",
                "email": "sarah.mwangi@gmail.com",
                "phone": "+254711889900",
                "total_purchases": 28500,
                "loyalty_points": 285
            }
        )

        # 8. Seed Sales / Invoices
        if not Sale.objects.filter(tenant=tenant_fashion).exists():
            sale1 = Sale.objects.create(
                id="sale-1",
                tenant=tenant_fashion,
                invoice_number="INV-2026-001",
                customer=c1,
                customer_name=c1.name,
                cashier=user,
                cashier_name=user.name or "Protas",
                total_amount=17700,
                paid_amount=17700,
                payment_status="paid",
                payment_method="mpesa",
                notes="Paid via M-PESA Confirmation QX9812KL"
            )
            SaleItem.objects.create(
                sale=sale1, product=p1, product_name=p1.name, quantity=1, unit_price=14500, subtotal=14500
            )
            SaleItem.objects.create(
                sale=sale1, product=p2, product_name=p2.name, quantity=1, unit_price=3200, subtotal=3200
            )

        # 9. Seed Staff & Payroll
        stf1, _ = StaffMember.objects.get_or_create(
            id="stf-1", tenant=tenant_fashion,
            defaults={"name": "Grace Wanjiku", "email": "grace@fashionhub.co.ke", "phone": "+254733445566", "role": "Senior Cashier", "monthly_salary": 45000}
        )
        PayrollRecord.objects.get_or_create(
            id="pay-1", tenant=tenant_fashion, staff=stf1,
            defaults={"month": "August 2026", "base_salary": 45000, "bonus": 5000, "deductions": 2500, "net_salary": 47500, "status": "paid", "payment_date": date(2026, 8, 28)}
        )

        # 10. Seed Expenses
        Expense.objects.get_or_create(
            id="exp-1", tenant=tenant_fashion,
            defaults={"title": "Monthly Shop Rent - CBD", "amount": 65000, "category": "Rent & Utilities", "date": date(2026, 9, 1), "recorded_by": "Protas"}
        )

        # 11. Seed Notifications & Targets
        Notification.objects.get_or_create(
            id="notif-1", tenant=tenant_fashion,
            defaults={"title": "Low Stock Warning", "message": "Genuine Leather Derby Shoes - Brown is down to 4 units (below min 5).", "type": "warning"}
        )

        Target.objects.get_or_create(
            id="tgt-1", tenant=tenant_fashion,
            defaults={"title": "Q3 Revenue Goal", "target_amount": 1500000, "current_amount": 980000, "period": "Quarterly", "start_date": date(2026, 7, 1), "end_date": date(2026, 9, 30)}
        )

        # 12. Seed Credit Accounts & Payments
        cacc1, _ = CreditAccount.objects.get_or_create(
            id="cacc-1", tenant=tenant_fashion,
            defaults={
                "entity_type": "customer",
                "entity_id": c1.id,
                "entity_name": c1.name,
                "entity_phone": c1.phone,
                "reference_doc_id": "INV-2026-001",
                "reference_doc_type": "invoice",
                "total_amount": 14500,
                "paid_amount": 7000,
                "balance_due": 7500,
                "due_date": date(2026, 9, 30),
                "status": "current",
            }
        )
        CreditPayment.objects.get_or_create(
            id="cpay-1", tenant=tenant_fashion, credit_account=cacc1,
            defaults={
                "entity_type": "customer",
                "entity_name": c1.name,
                "amount": 7000,
                "payment_method": "mpesa",
                "reference_code": "QXR98321K",
                "recorded_by": "Grace Wanjiku",
                "notes": "Partial deposit"
            }
        )

        # 13. Seed Stock Movements
        StockMovement.objects.get_or_create(
            id="mov-1", tenant=tenant_fashion,
            defaults={
                "product": p1,
                "product_name": p1.name,
                "type": "adjustment_increase",
                "quantity": 10,
                "previous_stock": 8,
                "new_stock": 18,
                "reference_id": "ADJ-20260901",
                "reason": "Opening stock verification",
                "staff_name": "Protas Junior"
            }
        )

        # 14. Seed Invoices & Items
        inv1, _ = Invoice.objects.get_or_create(
            id="inv-1", tenant=tenant_fashion,
            defaults={
                "invoice_number": "INV-2026-0045",
                "customer": c1,
                "customer_name": c1.name,
                "customer_email": c1.email,
                "customer_phone": c1.phone,
                "customer_address": "Nairobi, Kenya",
                "issue_date": date(2026, 9, 1),
                "due_date": date(2026, 9, 20),
                "subtotal": 14500,
                "tax_amount": 2320,
                "discount_amount": 0,
                "total_amount": 16820,
                "amount_paid": 5000,
                "balance_due": 11820,
                "status": "partially_paid",
                "notes": "Corporate tailored suit order",
                "terms": "Net 30 days payment terms"
            }
        )
        InvoiceItem.objects.get_or_create(
            id="invitem-1", invoice=inv1,
            defaults={
                "description": "Italian Fit Slim Wool Suit - Navy",
                "quantity": 1,
                "unit_price": 14500,
                "discount": 0,
                "tax_rate": 16,
                "amount": 14500
            }
        )

        # 15. Seed Purchases & Items
        po1, _ = Purchase.objects.get_or_create(
            id="po-1", tenant=tenant_fashion,
            defaults={
                "purchase_number": "PO-2026-089",
                "supplier": sup1,
                "supplier_name": sup1.name,
                "subtotal": 85000,
                "tax": 13600,
                "shipping": 2000,
                "total_amount": 100600,
                "amount_paid": 100600,
                "balance": 0,
                "status": "received",
                "payment_status": "paid",
                "date": date(2026, 8, 25),
                "received_date": timezone.now(),
                "notes": "Bulk restocking of virgin wool suits"
            }
        )
        PurchaseItem.objects.get_or_create(
            id="poitem-1", purchase=po1,
            defaults={
                "product": p1,
                "product_name": p1.name,
                "sku": p1.sku,
                "quantity_ordered": 10,
                "quantity_received": 10,
                "unit_cost": 8500,
                "total": 85000
            }
        )

        # 16. Seed Loyalty Rewards & Transactions
        rew1, _ = LoyaltyReward.objects.get_or_create(
            id="rew-1", tenant=tenant_fashion,
            defaults={
                "title": "KES 1,000 In-Store Shopping Voucher",
                "description": "Redeemable on any retail item with min purchase of KES 5,000",
                "points_required": 250,
                "discount_amount": 1000,
                "is_active": True
            }
        )
        rew2, _ = LoyaltyReward.objects.get_or_create(
            id="rew-2", tenant=tenant_fashion,
            defaults={
                "title": "KES 500 VIP Customer Discount",
                "description": "Applies KES 500 discount on total cart value for entire order",
                "points_required": 400,
                "discount_amount": 500,
                "is_active": True
            }
        )
        LoyaltyTransaction.objects.get_or_create(
            id="ltx-1", tenant=tenant_fashion,
            defaults={
                "customer": c1,
                "customer_name": c1.name,
                "type": "earned",
                "points": 420,
                "description": "Points earned from Order #INV-2026-001"
            }
        )

        # 17. Seed SaaS Plans
        plans_data = [
            {
                "id": "starter",
                "name": "Starter Retail",
                "price": 2500,
                "billing_period": "monthly",
                "description": "Perfect for single-shop retailers and sole proprietors starting out.",
                "features": [
                    "1 Branch Location",
                    "Up to 3 Staff Accounts",
                    "Basic POS & Barcode Scanner",
                    "Daily Cash Reconciliation",
                    "Up to 500 Inventory SKUs",
                    "Standard Email Support"
                ],
                "max_staff": 3,
                "max_products": 500,
                "max_invoices_per_month": 50,
                "is_popular": False,
            },
            {
                "id": "professional",
                "name": "Growth Pro",
                "price": 6500,
                "billing_period": "monthly",
                "description": "Ideal for growing multi-staff retail stores, boutiques and supermarkets.",
                "features": [
                    "Up to 3 Branch Locations",
                    "Up to 10 Staff Roles (RBAC)",
                    "Full Invoicing & Credit Accounts",
                    "Automated Daily Reconciliations",
                    "Supplier Purchase Orders & Restocking",
                    "Customer Loyalty Program",
                    "Real-Time Profit & Loss Reports"
                ],
                "max_staff": 10,
                "max_products": 5000,
                "max_invoices_per_month": 500,
                "is_popular": True,
            },
            {
                "id": "enterprise",
                "name": "Enterprise Chain",
                "price": 15000,
                "billing_period": "monthly",
                "description": "For supermarket chains, franchise retailers, and high-volume operations.",
                "features": [
                    "Unlimited Branches & Warehouses",
                    "Unlimited Staff & Advanced RBAC",
                    "Automated Multi-Branch Audits",
                    "Custom ERP & Accounting Integrations",
                    "Priority 24/7 Dedicated Support",
                    "Dedicated Database & Custom Domain"
                ],
                "max_staff": 999,
                "max_products": 99999,
                "max_invoices_per_month": 99999,
                "is_popular": False,
            },
        ]
        for p in plans_data:
            SaaSPlan.objects.update_or_create(
                slug=p["id"],
                defaults={
                    "id": p["id"],
                    "slug": p["id"],
                    "name": p["name"],
                    "price": p["price"],
                    "billing_period": p["billing_period"],
                    "description": p["description"],
                    "features": p["features"],
                    "max_staff": p["max_staff"],
                    "max_products": p["max_products"],
                    "max_invoices_per_month": p["max_invoices_per_month"],
                    "is_popular": p["is_popular"],
                    "is_active": True,
                }
            )

        self.stdout.write(self.style.SUCCESS("Database initialized and full production sample data seeded successfully!"))
