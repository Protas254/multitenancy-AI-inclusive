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
    """Base Admin for models scoped to a Tenant with horizontal top navigation."""
    change_list_template = "admin/api/tenant_scoped_change_list.html"

    def get_tenant_id_from_request(self, request):
        return (
            request.GET.get("tenant__id__exact")
            or request.GET.get("tenant_id")
            or request.GET.get("tenant")
        )

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        tenant_id = self.get_tenant_id_from_request(request)
        if tenant_id:
            tenant = Tenant.objects.filter(pk=tenant_id).first()
            if tenant:
                extra_context["current_tenant"] = tenant
                extra_context["active_tenant_section"] = self.model._meta.model_name
        return super().changelist_view(request, extra_context=extra_context)

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        tenant = None
        if object_id:
            obj = self.get_object(request, object_id)
            if obj and hasattr(obj, "tenant"):
                tenant = obj.tenant
        if not tenant:
            tenant_id = self.get_tenant_id_from_request(request)
            if tenant_id:
                tenant = Tenant.objects.filter(pk=tenant_id).first()
        if tenant:
            extra_context["current_tenant"] = tenant
            extra_context["active_tenant_section"] = self.model._meta.model_name
        return super().changeform_view(request, object_id, form_url, extra_context=extra_context)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        tenant_id = self.get_tenant_id_from_request(request)
        if tenant_id:
            initial["tenant"] = tenant_id
        return initial

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    # ── List view columns (horizontal, matching the layout requested) ──────
    list_display = (
        "name",
        "business_type",
        "plan",
        "status",
        "city_display",
        "phone",
        "customers_count",
        "is_active",
        "created_at",
        "contact_messages_display",
    )
    list_display_links = ("name",)
    list_editable = ("is_active",)  # Simple checkbox editable directly in table rows!
    search_fields = ("name", "slug", "id", "domain", "email", "phone", "address")
    list_filter = ("is_active", "status", "plan", "currency", "business_type")
    readonly_fields = ("id", "created_at")
    inlines = [MembershipInline, CategoryInline, StaffMemberInline, ProductInline]
    actions = ["activate_businesses", "deactivate_businesses"]

    def save_model(self, request, obj, form, change):
        # Keep status and is_active in sync on single edit
        if "is_active" in form.changed_data:
            obj.status = "active" if obj.is_active else "pending"
        super().save_model(request, obj, form, change)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        if object_id:
            tenant = Tenant.objects.filter(pk=object_id).first()
            if tenant:
                extra_context["current_tenant"] = tenant
                extra_context["active_tenant_section"] = "business_info"
        return super().changeform_view(request, object_id, form_url, extra_context=extra_context)

    fieldsets = (
        ("Business Profile", {
            "fields": ("id", "name", "slug", "business_type", "domain", "status", "is_active", "plan", "created_at")
        }),
        ("Contact & Location", {
            "fields": ("phone", "email", "address")
        }),
        ("Financial & Currency", {
            "fields": ("currency", "vat_rate")
        }),
    )

    # ── Custom column: city extracted from address ─────────────────────────
    def city_display(self, obj):
        # Try to derive city: first word of address, or address itself
        addr = (obj.address or "").strip()
        city = addr.split(",")[0].strip() if "," in addr else addr
        return city or "—"
    city_display.short_description = "City"

    # ── Custom column: customer count ──────────────────────────────────────
    def customers_count(self, obj):
        count = obj.customers.count()
        if count == 0:
            return "—"
        url = f"/admin/api/customer/?tenant__id__exact={obj.id}"
        return format_html(
            '<a href="{}" style="font-weight:600;">👥 {} customers</a>',
            url, count
        )
    customers_count.short_description = "Customers"

    # ── Custom column: contact messages count ─────────────────────────────
    def contact_messages_display(self, obj):
        # Placeholder — extend when you have a ContactMessage model
        return "—"
    contact_messages_display.short_description = "Contact Messages"

    # ── Bulk actions ───────────────────────────────────────────────────────
    @admin.action(description="✔ Activate selected businesses")
    def activate_businesses(self, request, queryset):
        updated = queryset.update(status="active", is_active=True)
        self.message_user(request, f"{updated} business(es) marked as active.")

    @admin.action(description="✘ Deactivate selected businesses")
    def deactivate_businesses(self, request, queryset):
        updated = queryset.update(status="pending", is_active=False)
        self.message_user(request, f"{updated} business(es) deactivated (set to pending).")

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
