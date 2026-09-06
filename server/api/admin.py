from django.contrib import admin
from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification
)

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("name", "id", "slug", "plan", "currency", "status", "created_at")
    search_fields = ("name", "slug", "id", "domain")
    list_filter = ("plan", "status", "currency")

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "name", "phone", "is_staff", "is_superuser")
    search_fields = ("email", "username", "name", "phone")
    list_filter = ("is_staff", "is_superuser")

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "tenant", "role", "designation", "created_at")
    search_fields = ("user__email", "tenant__name", "role")
    list_filter = ("role", "tenant")

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant", "icon")
    search_fields = ("name", "tenant__name")
    list_filter = ("tenant",)

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant", "contact_person", "phone", "email")
    search_fields = ("name", "tenant__name", "phone")
    list_filter = ("tenant",)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "tenant", "buying_price", "selling_price", "current_stock", "min_stock_level", "is_active")
    search_fields = ("name", "sku", "barcode", "tenant__name")
    list_filter = ("tenant", "is_active", "category")

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "tenant", "customer_name", "total_amount", "payment_status", "payment_method", "created_at")
    search_fields = ("invoice_number", "customer_name", "tenant__name")
    list_filter = ("tenant", "payment_status", "payment_method")
    inlines = [SaleItemInline]

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant", "phone", "total_purchases", "loyalty_points")
    search_fields = ("name", "phone", "tenant__name")
    list_filter = ("tenant",)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "amount", "category", "date")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "category")

@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant", "role", "monthly_salary", "status")
    search_fields = ("name", "role", "tenant__name")
    list_filter = ("tenant", "status")

@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    list_display = ("staff", "tenant", "month", "net_salary", "status", "payment_date")
    search_fields = ("staff__name", "tenant__name", "month")
    list_filter = ("tenant", "status")

@admin.register(Target)
class TargetAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "target_amount", "current_amount", "period")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "period")

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "tenant", "type", "is_read", "created_at")
    search_fields = ("title", "tenant__name")
    list_filter = ("tenant", "type", "is_read")
