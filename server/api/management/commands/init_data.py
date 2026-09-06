from django.core.management.base import BaseCommand
from api.models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification
)
from datetime import date

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

        self.stdout.write(self.style.SUCCESS("Database initialized and sample data seeded successfully!"))
