import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification,
    CreditAccount
)
from api.notifications import run_all_background_checks

class Command(BaseCommand):
    help = "Seed complete, realistic data for Aren Enterprice (tenant-1e257fb0)"

    def handle(self, *args, **options):
        self.stdout.write("Seeding realistic business data for Aren Enterprice...")

        # 1. Tenant Business Information
        tenant, _ = Tenant.objects.get_or_create(
            id="tenant-1e257fb0",
            defaults={"name": "Aren Enterprice", "slug": "aren-enterprice"}
        )
        tenant.name = "Aren Enterprice"
        tenant.business_type = "Supermarket & General Retail"
        tenant.plan = "growth"
        tenant.status = "active"
        tenant.is_active = True
        tenant.phone = "+254 743 849 304"
        tenant.email = "stockgridke@gmail.com"
        tenant.address = "Westlands Commercial Tower, Ground Floor, Mpaka Road"
        tenant.city = "Nairobi"
        tenant.currency = "KES"
        tenant.save()
        self.stdout.write(self.style.SUCCESS(f"✓ Business Information updated: {tenant.name}"))

        # 2. Team Access (Memberships)
        protas = User.objects.filter(email="protasjunior254@gmail.com").first()
        if protas:
            Membership.objects.get_or_create(
                user=protas, tenant=tenant,
                defaults={"role": "owner", "designation": "Director / Platform Owner"}
            )

        steve_user, _ = User.objects.get_or_create(
            email="steve@gmail.com",
            defaults={
                "username": "steve_aren",
                "name": "Steve Aren",
                "phone": "+254 743 849 304",
                "role": "owner"
            }
        )
        steve_user.set_password("password123")
        steve_user.save()
        Membership.objects.get_or_create(
            user=steve_user, tenant=tenant,
            defaults={"role": "owner", "designation": "Managing Director"}
        )
        self.stdout.write(self.style.SUCCESS("✓ Team Memberships seeded"))

        # 3. Categories
        cat_data = [
            ("Beverages & Soft Drinks", "coffee", "Bottled mineral water, sodas, energy drinks, and juices"),
            ("Groceries & Staples", "shopping-cart", "Flour, premium rice, cooking oils, sugar, and dry grains"),
            ("Toiletries & Hygiene", "sparkles", "Bath soaps, detergent powders, oral care, and sanitizers"),
            ("Dairy & Fresh Bakery", "package", "Fresh whole milk, natural yoghurt, sliced bread, and butter"),
            ("Snacks & Confectionery", "smile", "Cookies, biscuits, savory crisps, chocolates, and mints")
        ]
        categories = {}
        for name, icon, desc in cat_data:
            cat, _ = Category.objects.get_or_create(
                tenant=tenant, name=name,
                defaults={"icon": icon, "description": desc}
            )
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS(f"✓ {len(categories)} Categories ready"))

        # 4. Suppliers
        sup_data = [
            ("Bidco Africa Ltd", "Peter Ndungu", "+254 722 100 200", "orders@bidco-africa.com", "Thika Industrial Area", "Net 30"),
            ("Brookside Dairy Kenya", "Esther Wambui", "+254 733 400 500", "supply@brookside.co.ke", "Ruiru, Kiambu", "Net 14"),
            ("Unilever East Africa", "Joseph Omondi", "+254 711 600 700", "sales@unilever.co.ke", "Industrial Area, Nairobi", "Net 30"),
            ("Nairobi Wholesale Distributors", "Francis Karanja", "+254 720 800 900", "orders@nairobidistributors.co.ke", "Kirinyaga Road, Nairobi", "Cash on Delivery")
        ]
        suppliers = {}
        for sname, contact, phone, email, addr, terms in sup_data:
            sup, _ = Supplier.objects.get_or_create(
                tenant=tenant, name=sname,
                defaults={
                    "contact_person": contact, "phone": phone,
                    "email": email, "address": addr, "category": "Wholesale Distributor"
                }
            )
            suppliers[sname] = sup
        self.stdout.write(self.style.SUCCESS(f"✓ {len(suppliers)} Suppliers ready"))

        # 5. Products & Catalog (Including intentional low-stock items to test triggers)
        prod_data = [
            ("Fresh Fri Cooking Oil 2L", "AREN-OIL-001", "616110001234", "Groceries & Staples", "Bidco Africa Ltd", 480, 580, 35, 10),
            ("Pembe Maize Meal 2kg", "AREN-FLR-002", "616110002345", "Groceries & Staples", "Nairobi Wholesale Distributors", 160, 210, 52, 15),
            ("Brookside Fresh Whole Milk 500ml", "AREN-MLK-003", "616110003456", "Dairy & Fresh Bakery", "Brookside Dairy Kenya", 55, 70, 4, 10), # LOW STOCK!
            ("Dawaat Long Grain Basmati Rice 2kg", "AREN-RIC-004", "616110004567", "Groceries & Staples", "Nairobi Wholesale Distributors", 390, 490, 24, 8),
            ("Geisha Rose Bath Soap 225g", "AREN-SOP-005", "616110005678", "Toiletries & Hygiene", "Unilever East Africa", 85, 120, 32, 10),
            ("Colgate Maximum Cavity Protection 100ml", "AREN-PST-006", "616110006789", "Toiletries & Hygiene", "Unilever East Africa", 130, 180, 19, 8),
            ("Coca Cola 500ml PET", "AREN-BEV-007", "616110007890", "Beverages & Soft Drinks", "Nairobi Wholesale Distributors", 50, 70, 48, 15),
            ("Kericho Gold Pure Kenya Tea 250g", "AREN-TEA-008", "616110008901", "Beverages & Soft Drinks", "Nairobi Wholesale Distributors", 195, 260, 2, 8), # LOW STOCK!
            ("Oreo Vanilla Cream Biscuits 120g", "AREN-SNK-009", "616110009012", "Snacks & Confectionery", "Nairobi Wholesale Distributors", 85, 120, 40, 12),
            ("Sunlight Lavender Washing Powder 1kg", "AREN-DET-010", "616110010123", "Toiletries & Hygiene", "Unilever East Africa", 230, 310, 28, 8),
        ]
        products = {}
        for pname, sku, barcode, cname, sname, bp, sp, stock, min_alert in prod_data:
            p, _ = Product.objects.get_or_create(
                tenant=tenant, sku=sku,
                defaults={
                    "name": pname, "barcode": barcode,
                    "category": categories.get(cname),
                    "supplier": suppliers.get(sname),
                    "buying_price": bp, "selling_price": sp,
                    "current_stock": stock, "min_stock_level": min_alert,
                    "is_active": True
                }
            )
            # Sync fields
            p.name = pname
            p.current_stock = stock
            p.min_stock_level = min_alert
            p.save()
            products[pname] = p
        self.stdout.write(self.style.SUCCESS(f"✓ {len(products)} Products seeded in catalog"))

        # 6. Customers
        cust_data = [
            ("Beatrice Wanjiru", "+254 722 345 678", "beatrice.w@gmail.com", "Muthithi Road, Westlands", 30000, 45200, 450),
            ("Kevin Omondi", "+254 733 987 654", "kevin.omondi@outlook.com", "4th Parklands Avenue, Nairobi", 15000, 18600, 180), # WILL TRIGGER CREDIT EXCEED
            ("Grace Mutua", "+254 712 111 222", "grace.mutua@yahoo.com", "Spring Valley Estate, Nairobi", 50000, 94000, 940),
            ("Brian Kiprop", "+254 724 333 444", "brian.kiprop@gmail.com", "Rhapta Road, Westlands", 20000, 31500, 310)
        ]
        customers = {}
        for cname, phone, email, addr, limit, purchases, points in cust_data:
            c, _ = Customer.objects.get_or_create(
                tenant=tenant, name=cname,
                defaults={
                    "phone": phone, "email": email, "address": addr,
                    "credit_limit": limit, "total_purchases": purchases,
                    "loyalty_points": points
                }
            )
            c.credit_limit = limit
            c.save()
            customers[cname] = c
        self.stdout.write(self.style.SUCCESS(f"✓ {len(customers)} Customers seeded"))

        # 7. Credit Accounts (Customer Debt)
        # Kevin Omondi owes 22,500 (exceeding 15,000 credit limit -> Trigger alert)
        CreditAccount.objects.get_or_create(
            id="cacc-aren-01", tenant=tenant,
            defaults={
                "entity_type": "customer",
                "entity_id": customers["Kevin Omondi"].id,
                "entity_name": "Kevin Omondi",
                "entity_phone": customers["Kevin Omondi"].phone,
                "reference_doc_id": "INV-AREN-980",
                "reference_doc_type": "sale",
                "total_amount": 27500,
                "paid_amount": 5000,
                "balance_due": 22500,
                "due_date": timezone.now().date() + datetime.timedelta(days=7),
                "status": "overdue",
                "notes": "Bulk household supplies purchase on credit account"
            }
        )
        # Beatrice owes 8,500 (within 30,000 limit)
        CreditAccount.objects.get_or_create(
            id="cacc-aren-02", tenant=tenant,
            defaults={
                "entity_type": "customer",
                "entity_id": customers["Beatrice Wanjiru"].id,
                "entity_name": "Beatrice Wanjiru",
                "entity_phone": customers["Beatrice Wanjiru"].phone,
                "reference_doc_id": "INV-AREN-994",
                "reference_doc_type": "sale",
                "total_amount": 12000,
                "paid_amount": 3500,
                "balance_due": 8500,
                "due_date": timezone.now().date() + datetime.timedelta(days=14),
                "status": "current",
                "notes": "Monthly pantry restocking"
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Customer Credit Accounts seeded"))

        # 8. Staff Members
        staff_data = [
            ("Faith Chebet", "Cashier", "+254 714 555 666", "faith@arenenterprise.co.ke", 32000),
            ("Dennis Mwangi", "Sales Representative", "+254 725 777 888", "dennis@arenenterprise.co.ke", 35000),
            ("Samuel Maina", "Store Operations Manager", "+254 721 999 000", "samuel@arenenterprise.co.ke", 55000)
        ]
        staff = {}
        for sname, role, phone, email, sal in staff_data:
            st, _ = StaffMember.objects.get_or_create(
                tenant=tenant, name=sname,
                defaults={"role": role, "phone": phone, "email": email, "monthly_salary": sal, "status": "active"}
            )
            staff[sname] = st
        self.stdout.write(self.style.SUCCESS(f"✓ {len(staff)} Staff members seeded"))

        # 9. Targets (Store Monthly & Staff Quota)
        now = timezone.now()
        start_m = now.date().replace(day=1)
        import calendar
        _, last_day = calendar.monthrange(now.year, now.month)
        end_m = now.date().replace(day=last_day)

        # Company Target
        Target.objects.update_or_create(
            id="tgt-9c5a94e9ce",
            defaults={
                "tenant": tenant,
                "title": "Aren October Revenue Milestone",
                "type": "business",
                "target_amount": 600000,
                "current_amount": 284000,
                "period": "Monthly",
                "start_date": start_m,
                "end_date": end_m,
                "status": "active"
            }
        )
        # Faith Chebet Quota (Target 250,000 -> achieved!)
        Target.objects.update_or_create(
            id="tgt-aren-faith",
            defaults={
                "tenant": tenant,
                "title": "Faith Chebet Monthly Sales Quota",
                "type": "individual",
                "assigned_to_staff": staff["Faith Chebet"],
                "target_amount": 250000,
                "current_amount": 265400,
                "period": "Monthly",
                "start_date": start_m,
                "end_date": end_m,
                "status": "achieved"
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Sales Targets seeded"))

        # 10. Sales Transactions
        today = now.date()
        yesterday = today - datetime.timedelta(days=1)
        two_days_ago = today - datetime.timedelta(days=2)

        sales_data = [
            ("INV-AREN-1001", customers["Beatrice Wanjiru"], "Faith Chebet", 5800, "paid", "mpesa", today, [
                ("Fresh Fri Cooking Oil 2L", 2, 580),
                ("Dawaat Long Grain Basmati Rice 2kg", 3, 490),
                ("Pembe Maize Meal 2kg", 4, 210),
                ("Colgate Maximum Cavity Protection 100ml", 2, 180),
                ("Brookside Fresh Whole Milk 500ml", 10, 70),
            ]),
            ("INV-AREN-1002", None, "Faith Chebet", 3450, "paid", "cash", today, [
                ("Fresh Fri Cooking Oil 2L", 2, 580),
                ("Pembe Maize Meal 2kg", 5, 210),
                ("Geisha Rose Bath Soap 225g", 4, 120),
                ("Coca Cola 500ml PET", 4, 70),
            ]),
            ("INV-AREN-1003", customers["Grace Mutua"], "Dennis Mwangi", 8200, "paid", "mpesa", yesterday, [
                ("Dawaat Long Grain Basmati Rice 2kg", 8, 490),
                ("Fresh Fri Cooking Oil 2L", 4, 580),
                ("Sunlight Lavender Washing Powder 1kg", 4, 310),
            ]),
            ("INV-AREN-1004", None, "Faith Chebet", 1950, "paid", "cash", yesterday, [
                ("Coca Cola 500ml PET", 10, 70),
                ("Oreo Vanilla Cream Biscuits 120g", 5, 120),
                ("Brookside Fresh Whole Milk 500ml", 5, 70),
            ]),
            ("INV-AREN-1005", customers["Brian Kiprop"], "Faith Chebet", 14500, "paid", "mpesa", two_days_ago, [
                ("Fresh Fri Cooking Oil 2L", 10, 580),
                ("Pembe Maize Meal 2kg", 15, 210),
                ("Dawaat Long Grain Basmati Rice 2kg", 8, 490),
                ("Sunlight Lavender Washing Powder 1kg", 5, 310),
            ]),
            # Additional high-volume batch so Faith's month-to-date sales verifiable hit KES 265,400
            ("INV-AREN-1000", customers["Grace Mutua"], "Faith Chebet", 239700, "paid", "mpesa", start_m + datetime.timedelta(days=2), [
                ("Fresh Fri Cooking Oil 2L", 150, 580),
                ("Dawaat Long Grain Basmati Rice 2kg", 180, 490),
                ("Pembe Maize Meal 2kg", 200, 210),
                ("Sunlight Lavender Washing Powder 1kg", 80, 310),
            ])
        ]

        for inv_num, cust, cashier, total, pstatus, pmethod, sdate, items in sales_data:
            s, created = Sale.objects.get_or_create(
                tenant=tenant, invoice_number=inv_num,
                defaults={
                    "customer": cust,
                    "customer_name": cust.name if cust else "Walk-in Customer",
                    "cashier_name": cashier,
                    "total_amount": total,
                    "paid_amount": total,
                    "payment_status": pstatus,
                    "payment_method": pmethod,
                    "notes": "Store retail POS sale"
                }
            )
            # Update created_at date
            Sale.objects.filter(id=s.id).update(created_at=timezone.make_aware(datetime.datetime.combine(sdate, datetime.time(14, 30))))

            if created:
                for iname, qty, uprice in items:
                    SaleItem.objects.create(
                        sale=s,
                        product=products.get(iname),
                        product_name=iname,
                        quantity=qty,
                        unit_price=uprice,
                        subtotal=qty * uprice
                    )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(sales_data)} Sales & Line Items seeded"))

        # 11. Expenses
        exp_data = [
            ("Shop Rent - Westlands Commercial Tower", 60000, "Rent & Utilities", start_m, "Steve Aren"),
            ("Kenya Power Commercial Electricity", 8450, "Utilities", start_m + datetime.timedelta(days=4), "Samuel Maina"),
            ("Zuku Business Fiber Internet 50Mbps", 5500, "Utilities", start_m + datetime.timedelta(days=3), "Samuel Maina"),
            ("Custom Branded Kraft Carrier Bags (2000 pcs)", 9200, "Packaging & Store Supplies", start_m + datetime.timedelta(days=7), "Samuel Maina"),
            ("Thermal Paper Receipt Rolls (50 rolls)", 3500, "Store Supplies", start_m + datetime.timedelta(days=9), "Faith Chebet"),
            ("Daily Staff Lunch & Tea Subsidy", 4500, "Staff Welfare", yesterday, "Samuel Maina")
        ]
        for title, amt, cat, edate, recby in exp_data:
            Expense.objects.get_or_create(
                tenant=tenant, title=title,
                defaults={"amount": amt, "category": cat, "date": edate, "recorded_by": recby}
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(exp_data)} Operating Expenses seeded"))

        # 12. Payroll Records
        month_label = now.strftime("%B %Y")
        for sname, s_obj in staff.items():
            base = float(s_obj.monthly_salary)
            bonus = 5000 if sname == "Faith Chebet" else 0 # Commission on hitting target
            deductions = 1500 # NHIF & NSSF
            net = base + bonus - deductions
            PayrollRecord.objects.get_or_create(
                tenant=tenant, staff=s_obj, month=month_label,
                defaults={
                    "base_salary": base,
                    "bonus": bonus,
                    "deductions": deductions,
                    "net_salary": net,
                    "status": "approved",
                    "payment_date": today
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(staff)} Payroll records seeded"))

        # 13. Trigger Automated Notification Engine for Aren Enterprice
        notifs = run_all_background_checks(tenant)
        self.stdout.write(self.style.SUCCESS(f"✓ Automated Notification Engine fired: generated {len(notifs)} real-time alerts!"))

        self.stdout.write(self.style.SUCCESS("\n🎉 Successfully populated all 12 modules for Aren Enterprice!"))
