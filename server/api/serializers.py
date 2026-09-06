from rest_framework import serializers
from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification
)

class TenantSerializer(serializers.ModelSerializer):
    businessType = serializers.CharField(source="business_type", required=False, allow_blank=True)
    vatRate = serializers.FloatField(source="vat_rate", required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Tenant
        fields = ["id", "name", "slug", "domain", "businessType", "phone", "email", "address", "vatRate", "plan", "currency", "status", "createdAt"]

class MembershipSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)
    tenantId = serializers.CharField(source="tenant.id", read_only=True)
    tenantName = serializers.CharField(source="tenant.name", read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "tenant", "tenantId", "tenantName", "role", "designation", "created_at"]

class UserSerializer(serializers.ModelSerializer):
    memberships = MembershipSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "name", "phone", "avatar", "memberships"]

class CategorySerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "tenantId", "name", "description", "icon"]

class SupplierSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    contactPerson = serializers.CharField(source="contact_person", required=False, allow_blank=True)

    class Meta:
        model = Supplier
        fields = ["id", "tenantId", "name", "contactPerson", "email", "phone", "address", "category"]

class ProductSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    categoryId = serializers.CharField(source="category_id", read_only=True, allow_null=True)
    categoryName = serializers.SerializerMethodField()
    supplierId = serializers.CharField(source="supplier_id", read_only=True, allow_null=True)
    supplierName = serializers.SerializerMethodField()
    buyingPrice = serializers.FloatField(source="buying_price")
    sellingPrice = serializers.FloatField(source="selling_price")
    currentStock = serializers.IntegerField(source="current_stock")
    minStockLevel = serializers.IntegerField(source="min_stock_level")
    isActive = serializers.BooleanField(source="is_active", default=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "tenantId", "name", "sku", "barcode", "categoryId", "categoryName",
            "supplierId", "supplierName", "buyingPrice", "sellingPrice", "currentStock",
            "minStockLevel", "isActive", "description", "createdAt", "updatedAt"
        ]

    def get_categoryName(self, obj):
        return obj.category.name if obj.category else "General"

    def get_supplierName(self, obj):
        return obj.supplier.name if obj.supplier else None

class CustomerSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    totalPurchases = serializers.FloatField(source="total_purchases", read_only=True)
    loyaltyPoints = serializers.IntegerField(source="loyalty_points", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "tenantId", "name", "email", "phone", "address", "totalPurchases", "loyaltyPoints", "createdAt"]

class SaleItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source="product_id", read_only=True, allow_null=True)
    productName = serializers.CharField(source="product_name")
    unitPrice = serializers.FloatField(source="unit_price")

    class Meta:
        model = SaleItem
        fields = ["id", "productId", "productName", "quantity", "unitPrice", "subtotal"]

class SaleSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    invoiceNumber = serializers.CharField(source="invoice_number")
    customerId = serializers.CharField(source="customer_id", read_only=True, allow_null=True)
    customerName = serializers.CharField(source="customer_name", allow_blank=True)
    cashierId = serializers.CharField(source="cashier_id", read_only=True, allow_null=True)
    cashierName = serializers.CharField(source="cashier_name", allow_blank=True)
    totalAmount = serializers.FloatField(source="total_amount")
    paidAmount = serializers.FloatField(source="paid_amount")
    paymentStatus = serializers.CharField(source="payment_status")
    paymentMethod = serializers.CharField(source="payment_method")
    items = SaleItemSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id", "tenantId", "invoiceNumber", "customerId", "customerName",
            "cashierId", "cashierName", "totalAmount", "paidAmount", "paymentStatus",
            "paymentMethod", "notes", "items", "createdAt"
        ]

class ExpenseSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    recordedBy = serializers.CharField(source="recorded_by", allow_blank=True)

    class Meta:
        model = Expense
        fields = ["id", "tenantId", "title", "amount", "category", "date", "recordedBy", "notes"]

class StaffMemberSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    monthlySalary = serializers.FloatField(source="monthly_salary")

    class Meta:
        model = StaffMember
        fields = ["id", "tenantId", "name", "email", "phone", "role", "monthlySalary", "status"]

class PayrollRecordSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    staffId = serializers.CharField(source="staff_id", read_only=True)
    staffName = serializers.CharField(source="staff.name", read_only=True)
    staffRole = serializers.CharField(source="staff.role", read_only=True)
    baseSalary = serializers.FloatField(source="base_salary")
    netSalary = serializers.FloatField(source="net_salary")
    paymentDate = serializers.DateField(source="payment_date", allow_null=True, required=False)

    class Meta:
        model = PayrollRecord
        fields = ["id", "tenantId", "staffId", "staffName", "staffRole", "month", "baseSalary", "bonus", "deductions", "netSalary", "status", "paymentDate"]

class TargetSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    targetAmount = serializers.FloatField(source="target_amount")
    currentAmount = serializers.FloatField(source="current_amount")
    startDate = serializers.DateField(source="start_date")
    endDate = serializers.DateField(source="end_date")

    class Meta:
        model = Target
        fields = ["id", "tenantId", "title", "targetAmount", "currentAmount", "period", "startDate", "endDate"]

class NotificationSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    isRead = serializers.BooleanField(source="is_read")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "tenantId", "title", "message", "type", "isRead", "createdAt"]
