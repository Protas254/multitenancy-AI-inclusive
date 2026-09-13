from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Sum
from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification
)

class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    fields = ("user", "role", "designation", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True

class CategoryInline(admin.TabularInline):
    model = Category
    extra = 0
    fields = ("name", "icon", "description")
    show_change_link = True

class StaffMemberInline(admin.TabularInline):
    model = StaffMember
    extra = 0
    fields = ("name", "role", "phone", "monthly_salary", "status")
    show_change_link = True

class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = ("name", "sku", "buying_price", "selling_price", "current_stock", "is_active")
    show_change_link = True
    classes = ("collapse",)

class TenantScopedModelAdmin(admin.ModelAdmin):
    """Base Admin that respects ?tenant= in initial data when creating from Tenant Hub."""
    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        tenant_id = request.GET.get("tenant")
        if tenant_id:
            initial["tenant"] = tenant_id
        return initial

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("name", "id", "business_type", "plan", "currency", "status", "modules_summary", "manage_business_hub")
    search_fields = ("name", "slug", "id", "domain", "email", "phone")
    list_filter = ("plan", "status", "currency", "business_type")
    readonly_fields = ("id", "business_hub_dashboard", "created_at")
    inlines = [MembershipInline, CategoryInline, StaffMemberInline, ProductInline]

    fieldsets = (
        ("🏢 Business Management Hub", {
            "fields": ("business_hub_dashboard",),
            "description": "Click any department below to view or manage resources specifically for this business."
        }),
        ("Business Profile", {
            "fields": ("id", "name", "slug", "business_type", "domain", "status", "plan", "created_at")
        }),
        ("Contact & Location", {
            "fields": ("phone", "email", "address")
        }),
        ("Financial & Currency", {
            "fields": ("currency", "vat_rate")
        }),
    )

    def modules_summary(self, obj):
        products_count = obj.products.count()
        customers_count = obj.customers.count()
        sales_count = obj.sales.count()
        staff_count = obj.staff.count()
        return format_html(
            '<div style="font-size: 11px; line-height: 1.5; color: #94a3b8;">'
            '📦 <b>{}</b> prods &bull; 👥 <b>{}</b> custs<br/>'
            '💰 <b>{}</b> sales &bull; 🧑‍💼 <b>{}</b> staff'
            '</div>',
            products_count, customers_count, sales_count, staff_count
        )
    modules_summary.short_description = "Live Metrics"

    def manage_business_hub(self, obj):
        url = reverse("admin:api_tenant_change", args=[obj.id])
        return format_html(
            '<a href="{}" style="display: inline-block; padding: 4px 10px; background: #0284c7; color: #ffffff; '
            'border-radius: 6px; font-weight: bold; font-size: 11px; text-decoration: none;">'
            'Manage Business &rarr;</a>',
            url
        )
    manage_business_hub.short_description = "Action"

    def business_hub_dashboard(self, obj):
        if not obj.id:
            return "Save tenant to access Business Management Hub."

        cat_count = obj.categories.count()
        prod_count = obj.products.count()
        cust_count = obj.customers.count()
        sales_count = obj.sales.count()
        sales_total = obj.sales.aggregate(total=Sum("total_amount"))["total"] or 0
        exp_count = obj.expenses.count()
        exp_total = obj.expenses.aggregate(total=Sum("amount"))["total"] or 0
        staff_count = obj.staff.count()
        payroll_count = obj.payrolls.count()
        supplier_count = obj.suppliers.count()
        target_count = obj.targets.count()
        notif_count = obj.notifications.count()
        member_count = obj.memberships.count()

        cur = obj.currency or "KES"

        def module_card(title, count, extra, list_url, add_url, icon):
            return f'''
            <div style="background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 18px;">{icon}</span>
                        <span style="font-weight: 700; font-size: 13px; color: #38bdf8;">{title}</span>
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #f1f5f9; margin-bottom: 2px;">{count}</div>
                    {f'<div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">{extra}</div>' if extra else '<div style="height: 16px;"></div>'}
                </div>
                <div style="display: flex; gap: 6px; margin-top: 10px; border-top: 1px solid #1e293b; padding-top: 8px;">
                    <a href="{list_url}" style="flex: 1; text-align: center; background: #1e293b; color: #e2e8f0; padding: 5px 8px; border-radius: 5px; font-size: 11px; text-decoration: none; font-weight: 600; border: 1px solid #475569;">View All</a>
                    <a href="{add_url}" style="flex: 1; text-align: center; background: #0284c7; color: #ffffff; padding: 5px 8px; border-radius: 5px; font-size: 11px; text-decoration: none; font-weight: 600;">+ Add</a>
                </div>
            </div>
            '''

        cards = [
            module_card("Categories", f"{cat_count} Categories", "",
                        f"/admin/api/category/?tenant__id__exact={obj.id}",
                        f"/admin/api/category/add/?tenant={obj.id}", "🏷️"),
            module_card("Products & Catalog", f"{prod_count} Items", "",
                        f"/admin/api/product/?tenant__id__exact={obj.id}",
                        f"/admin/api/product/add/?tenant={obj.id}", "📦"),
            module_card("Customers CRM", f"{cust_count} Customers", "",
                        f"/admin/api/customer/?tenant__id__exact={obj.id}",
                        f"/admin/api/customer/add/?tenant={obj.id}", "👥"),
            module_card("Sales & Invoices", f"{sales_count} Orders", f"Revenue: {cur} {sales_total:,.0f}",
                        f"/admin/api/sale/?tenant__id__exact={obj.id}",
                        f"/admin/api/sale/add/?tenant={obj.id}", "💰"),
            module_card("Expenses", f"{exp_count} Records", f"Total: {cur} {exp_total:,.0f}",
                        f"/admin/api/expense/?tenant__id__exact={obj.id}",
                        f"/admin/api/expense/add/?tenant={obj.id}", "💸"),
            module_card("Staff Team", f"{staff_count} Members", "",
                        f"/admin/api/staffmember/?tenant__id__exact={obj.id}",
                        f"/admin/api/staffmember/add/?tenant={obj.id}", "🧑‍💼"),
            module_card("Payroll Records", f"{payroll_count} Slips", "",
                        f"/admin/api/payrollrecord/?tenant__id__exact={obj.id}",
                        f"/admin/api/payrollrecord/add/?tenant={obj.id}", "📑"),
            module_card("Suppliers", f"{supplier_count} Vendors", "",
                        f"/admin/api/supplier/?tenant__id__exact={obj.id}",
                        f"/admin/api/supplier/add/?tenant={obj.id}", "🚚"),
            module_card("Targets", f"{target_count} Goals", "",
                        f"/admin/api/target/?tenant__id__exact={obj.id}",
                        f"/admin/api/target/add/?tenant={obj.id}", "🎯"),
            module_card("Notifications", f"{notif_count} Alerts", "",
                        f"/admin/api/notification/?tenant__id__exact={obj.id}",
                        f"/admin/api/notification/add/?tenant={obj.id}", "🔔"),
            module_card("Team Access", f"{member_count} Members", "",
                        f"/admin/api/membership/?tenant__id__exact={obj.id}",
                        f"/admin/api/membership/add/?tenant={obj.id}", "🔐"),
        ]

        html = f'''
        <div style="background: #020617; padding: 18px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
                <div>
                    <h3 style="margin: 0; color: #f8fafc; font-size: 16px; font-weight: 800;">
                        {obj.name} <span style="font-size: 12px; color: #38bdf8; font-weight: 600;">({obj.id})</span>
                    </h3>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">
                        Industry: <b>{obj.business_type}</b> &bull; Plan: <b>{obj.plan.upper()}</b> &bull; Currency: <b>{cur}</b>
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <a href="/admin/api/tenant/" style="padding: 6px 12px; background: #1e293b; color: #94a3b8; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: 600;">&larr; All Businesses</a>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                {"".join(cards)}
            </div>
        </div>
        '''
        return format_html(html)

    business_hub_dashboard.short_description = "Department & Records Hub"

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "name", "phone", "is_staff", "is_superuser")
    search_fields = ("email", "username", "name", "phone")
    list_filter = ("is_staff", "is_superuser")

@admin.register(Membership)
class MembershipAdmin(TenantScopedModelAdmin):
    list_display = ("user", "tenant", "role", "designation", "created_at")
    search_fields = ("user__email", "tenant__name", "role")
    list_filter = ("tenant", "role")

@admin.register(Category)
class CategoryAdmin(TenantScopedModelAdmin):
    list_display = ("name", "tenant", "icon")
    search_fields = ("name", "tenant__name")
    list_filter = ("tenant",)

@admin.register(Supplier)
class SupplierAdmin(TenantScopedModelAdmin):
    list_display = ("name", "tenant", "contact_person", "phone", "email")
    search_fields = ("name", "tenant__name", "phone")
    list_filter = ("tenant",)

@admin.register(Product)
class ProductAdmin(TenantScopedModelAdmin):
    list_display = ("name", "sku", "tenant", "buying_price", "selling_price", "current_stock", "min_stock_level", "is_active")
    search_fields = ("name", "sku", "barcode", "tenant__name")
    list_filter = ("tenant", "is_active", "category")

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0

@admin.register(Sale)
class SaleAdmin(TenantScopedModelAdmin):
    list_display = ("invoice_number", "tenant", "customer_name", "total_amount", "payment_status", "payment_method", "created_at")
    search_fields = ("invoice_number", "customer_name", "tenant__name")
    list_filter = ("tenant", "payment_status", "payment_method")
    inlines = [SaleItemInline]

@admin.register(Customer)
class CustomerAdmin(TenantScopedModelAdmin):
    list_display = ("name", "tenant", "phone", "total_purchases", "loyalty_points")
    search_fields = ("name", "phone", "tenant__name")
    list_filter = ("tenant",)

@admin.register(Expense)
class ExpenseAdmin(TenantScopedModelAdmin):
    list_display = ("title", "tenant", "amount", "category", "date")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "category")

@admin.register(StaffMember)
class StaffMemberAdmin(TenantScopedModelAdmin):
    list_display = ("name", "tenant", "role", "monthly_salary", "status")
    search_fields = ("name", "role", "tenant__name")
    list_filter = ("tenant", "status")

@admin.register(PayrollRecord)
class PayrollRecordAdmin(TenantScopedModelAdmin):
    list_display = ("staff", "tenant", "month", "net_salary", "status", "payment_date")
    search_fields = ("staff__name", "tenant__name", "month")
    list_filter = ("tenant", "status")

@admin.register(Target)
class TargetAdmin(TenantScopedModelAdmin):
    list_display = ("title", "tenant", "target_amount", "current_amount", "period")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "period")

@admin.register(Notification)
class NotificationAdmin(TenantScopedModelAdmin):
    list_display = ("title", "tenant", "type", "is_read", "created_at")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "type", "is_read")
