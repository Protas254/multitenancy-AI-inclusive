from django.contrib import admin
from django.utils.html import format_html
from django.urls import path, reverse
from django.shortcuts import redirect
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
        "status_badge",
        "approval_action",
        "is_active",
        "city_display",
        "phone",
        "customers_count",
        "created_at",
    )
    list_display_links = ("name",)
    list_editable = ("is_active",)  # Simple checkbox editable directly in table rows!
    search_fields = ("name", "slug", "id", "domain", "email", "phone", "address")
    list_filter = ("is_active", "status", "plan", "currency", "business_type")
    readonly_fields = ("id", "created_at")
    inlines = [MembershipInline, CategoryInline, StaffMemberInline, ProductInline]
    actions = ["activate_businesses", "deactivate_businesses"]

    def status_badge(self, obj):
        if obj.is_active and obj.status == "active":
            return format_html(
                '<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:12px; font-weight:700; font-size:11px; display:inline-flex; align-items:center; gap:4px;">'
                '● Active</span>'
            )
        elif obj.status == "pending" or not obj.is_active:
            return format_html(
                '<span style="background:#fef3c7; color:#b45309; padding:3px 8px; border-radius:12px; font-weight:700; font-size:11px; display:inline-flex; align-items:center; gap:4px;">'
                '⏳ Pending Approval</span>'
            )
        elif obj.status == "trial":
            return format_html(
                '<span style="background:#eff6ff; color:#1d4ed8; padding:3px 8px; border-radius:12px; font-weight:700; font-size:11px; display:inline-flex; align-items:center; gap:4px;">'
                '★ Trial</span>'
            )
        else:
            return format_html(
                '<span style="background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:12px; font-weight:700; font-size:11px;">'
                '{}</span>',
                obj.status.capitalize() if obj.status else "—"
            )
    status_badge.short_description = "Status"

    def approval_action(self, obj):
        if not obj.is_active or obj.status == "pending":
            url = reverse("admin:api_tenant_approve", args=[obj.id])
            return format_html(
                '<a class="button" href="{}" style="background:#16a34a; color:#ffffff !important; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; text-decoration:none; display:inline-block; white-space:nowrap;">'
                '✔ Approve &amp; Activate</a>',
                url
            )
        else:
            url = reverse("admin:api_tenant_deactivate", args=[obj.id])
            return format_html(
                '<a class="button" href="{}" style="background:#64748b; color:#ffffff !important; padding:4px 8px; border-radius:6px; font-size:10px; font-weight:600; text-decoration:none; display:inline-block; white-space:nowrap;">'
                '✘ Deactivate</a>',
                url
            )
    approval_action.short_description = "Approval Action"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<str:tenant_id>/approve/', self.admin_site.admin_view(self.approve_tenant_view), name='api_tenant_approve'),
            path('<str:tenant_id>/deactivate/', self.admin_site.admin_view(self.deactivate_tenant_view), name='api_tenant_deactivate'),
        ]
        return custom_urls + urls

    def approve_tenant_view(self, request, tenant_id):
        tenant = Tenant.objects.filter(pk=tenant_id).first()
        if tenant:
            tenant.status = "active"
            tenant.is_active = True
            tenant.save()
            try:
                from .emails import send_account_approved_email
                send_account_approved_email(tenant)
            except Exception:
                pass
            self.message_user(request, f"Tenant '{tenant.name}' has been approved and marked as active. An approval confirmation email has been dispatched.")
        return redirect(reverse("admin:api_tenant_changelist"))

    def deactivate_tenant_view(self, request, tenant_id):
        tenant = Tenant.objects.filter(pk=tenant_id).first()
        if tenant:
            tenant.status = "pending"
            tenant.is_active = False
            tenant.save()
            self.message_user(request, f"Tenant '{tenant.name}' has been deactivated (status set to pending).")
        return redirect(reverse("admin:api_tenant_changelist"))

    def save_model(self, request, obj, form, change):
        was_inactive = False
        if change:
            orig = Tenant.objects.filter(pk=obj.pk).first()
            if orig and (not orig.is_active or orig.status == "pending"):
                was_inactive = True

        if "is_active" in form.changed_data:
            obj.status = "active" if obj.is_active else "pending"
        elif "status" in form.changed_data:
            obj.is_active = True if obj.status == "active" else False

        super().save_model(request, obj, form, change)

        if was_inactive and obj.is_active and obj.status == "active":
            try:
                from .emails import send_account_approved_email
                send_account_approved_email(obj)
            except Exception:
                pass

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

    # ── Bulk actions ───────────────────────────────────────────────────────
    @admin.action(description="✔ Approve & Activate selected tenants")
    def activate_businesses(self, request, queryset):
        for tenant in queryset:
            tenant.status = "active"
            tenant.is_active = True
            tenant.save()
            try:
                from .emails import send_account_approved_email
                send_account_approved_email(tenant)
            except Exception:
                pass
        self.message_user(request, f"{queryset.count()} business(es) approved and activated. Approval emails dispatched.")

    @admin.action(description="✘ Deactivate selected tenants (set to pending)")
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
    list_display = ("name", "tenant", "phone", "credit_limit", "total_purchases", "loyalty_points")
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
    list_display = ("title", "tenant", "type", "assigned_to_staff", "target_amount", "current_amount", "period", "status")
    search_fields = ("title", "tenant__name", "assigned_to_staff__name")
    list_filter = ("tenant", "type", "period", "status")

@admin.register(Notification)
class NotificationAdmin(TenantScopedModelAdmin):
    list_display = ("title", "tenant", "type", "is_read", "created_at")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "type", "is_read")
