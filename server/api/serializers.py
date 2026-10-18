from django.db import models
from rest_framework import serializers
from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification,
    DailyReconciliation, CreditAccount, CreditPayment, StockMovement,
    Invoice, InvoiceItem, Purchase, PurchaseItem, LoyaltyReward,
    LoyaltyTransaction, SaaSPlan
)

class TenantSerializer(serializers.ModelSerializer):
    businessType = serializers.CharField(source="business_type", required=False, allow_blank=True)
    vatRate = serializers.FloatField(source="vat_rate", required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)
    location = serializers.SerializerMethodField()
    planStatus = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()
    branches = serializers.SerializerMethodField()
    staffCount = serializers.SerializerMethodField()
    productsCount = serializers.SerializerMethodField()
    monthlyRevenue = serializers.SerializerMethodField()
    totalSalesVolume = serializers.SerializerMethodField()
    ownerName = serializers.SerializerMethodField()
    ownerEmail = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = [
            "id", "name", "slug", "domain", "businessType", "phone", "email",
            "address", "location", "vatRate", "plan", "planStatus", "currency",
            "status", "settings", "branches", "staffCount", "productsCount",
            "monthlyRevenue", "totalSalesVolume", "ownerName", "ownerEmail", "createdAt"
        ]
        read_only_fields = ["id", "createdAt"]

    def get_location(self, obj):
        return obj.address or "Main Location"

    def get_planStatus(self, obj):
        return obj.status or "active"

    def get_settings(self, obj):
        return {
            "currency": obj.currency or "KES",
            "taxRate": float(obj.vat_rate) if obj.vat_rate is not None else 16.0,
            "taxEnabled": True,
            "financialYearStart": "01-01",
            "loyaltyPointsPer100Kes": 1,
            "lowStockThresholdDefault": 5,
        }

    def get_branches(self, obj):
        return [
            {
                "id": f"br-{obj.id}",
                "tenantId": obj.id,
                "name": "Main Branch",
                "location": obj.address or "Main Location",
                "address": obj.address or "Main Location",
                "phone": obj.phone or "",
                "isMain": True,
            }
        ]

    def get_staffCount(self, obj):
        return obj.staff.count()

    def get_productsCount(self, obj):
        return obj.products.count()

    def get_monthlyRevenue(self, obj):
        from django.utils import timezone
        now = timezone.now()
        rev = obj.sales.filter(created_at__year=now.year, created_at__month=now.month, payment_status="paid").aggregate(models.Sum("total_amount"))["total_amount__sum"] or 0
        if rev == 0:
            rev = obj.sales.filter(payment_status="paid").aggregate(models.Sum("total_amount"))["total_amount__sum"] or 0
        return float(rev)

    def get_totalSalesVolume(self, obj):
        vol = obj.sales.aggregate(models.Sum("total_amount"))["total_amount__sum"] or 0
        return float(vol)

    def get_ownerName(self, obj):
        owner_mem = obj.memberships.filter(role="owner").select_related("user").first()
        return owner_mem.user.name or owner_mem.user.username if owner_mem else "Business Owner"

    def get_ownerEmail(self, obj):
        owner_mem = obj.memberships.filter(role="owner").select_related("user").first()
        return owner_mem.user.email if owner_mem else (obj.email or "owner@business.co.ke")

class MembershipSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)
    tenantId = serializers.CharField(source="tenant.id", read_only=True)
    tenantName = serializers.CharField(source="tenant.name", read_only=True)
    userId = serializers.CharField(source="user.id", read_only=True)
    joinedAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "userId", "tenant", "tenantId", "tenantName", "role", "designation", "joinedAt", "created_at"]

class UserSerializer(serializers.ModelSerializer):
    memberships = MembershipSerializer(many=True, read_only=True)
    isSuperAdmin = serializers.BooleanField(source="is_superuser", read_only=True)
    isStaff = serializers.BooleanField(source="is_staff", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "name", "phone", "avatar", "isSuperAdmin", "isStaff", "memberships"]

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
    categoryId = serializers.CharField(source="category_id", required=False, allow_null=True, allow_blank=True, default="")
    categoryName = serializers.SerializerMethodField()
    supplierId = serializers.CharField(source="supplier_id", required=False, allow_null=True, allow_blank=True, default="")
    supplierName = serializers.SerializerMethodField()
    sku = serializers.CharField(required=False, allow_blank=True, default="")
    barcode = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")
    description = serializers.CharField(required=False, allow_blank=True, default="")
    buyingPrice = serializers.FloatField(source="buying_price", required=False, default=0.0)
    sellingPrice = serializers.FloatField(source="selling_price", required=False, default=0.0)
    currentStock = serializers.IntegerField(source="current_stock", required=False, default=0)
    minStockLevel = serializers.IntegerField(source="min_stock_level", required=False, default=5)
    isActive = serializers.BooleanField(source="is_active", default=True, required=False)
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
    creditLimit = serializers.FloatField(source="credit_limit", required=False, default=50000.0)
    totalPurchases = serializers.FloatField(source="total_purchases", read_only=True)
    loyaltyPoints = serializers.IntegerField(source="loyalty_points", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "tenantId", "name", "email", "phone", "address", "creditLimit", "totalPurchases", "loyaltyPoints", "createdAt"]

class SaleItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source="product_id", read_only=True, allow_null=True)
    productName = serializers.CharField(source="product_name")
    unitPrice = serializers.FloatField(source="unit_price")
    total = serializers.FloatField(source="subtotal", read_only=True)

    class Meta:
        model = SaleItem
        fields = ["id", "productId", "productName", "quantity", "unitPrice", "subtotal", "total"]

class SaleSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    invoiceNumber = serializers.CharField(source="invoice_number")
    saleNumber = serializers.CharField(source="invoice_number", read_only=True)
    customerId = serializers.CharField(source="customer_id", read_only=True, allow_null=True)
    customerName = serializers.CharField(source="customer_name", allow_blank=True)
    cashierId = serializers.CharField(source="cashier_id", read_only=True, allow_null=True)
    cashierName = serializers.CharField(source="cashier_name", allow_blank=True)
    staffName = serializers.CharField(source="cashier_name", read_only=True)
    totalAmount = serializers.FloatField(source="total_amount")
    paidAmount = serializers.FloatField(source="paid_amount")
    paymentStatus = serializers.CharField(source="payment_status")
    paymentMethod = serializers.CharField(source="payment_method")
    items = SaleItemSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    date = serializers.DateTimeField(source="created_at", read_only=True)
    subtotal = serializers.SerializerMethodField()
    taxTotal = serializers.SerializerMethodField()
    discountTotal = serializers.SerializerMethodField()

    status = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "id", "tenantId", "invoiceNumber", "saleNumber", "customerId", "customerName",
            "cashierId", "cashierName", "staffName", "totalAmount", "paidAmount", "paymentStatus",
            "paymentMethod", "status", "notes", "items", "createdAt", "date", "subtotal", "taxTotal", "discountTotal"
        ]

    def get_status(self, obj):
        """Derive a frontend-compatible status from payment_status and payment_method."""
        if obj.payment_method == "credit":
            return "credit"
        if obj.payment_status == "paid":
            return "completed"
        if obj.payment_status == "partial":
            return "partially_refunded"
        return "completed"  # default

    def get_subtotal(self, obj):
        items = obj.items.all()
        if items.exists():
            return float(sum(item.subtotal for item in items))
        return float(obj.total_amount)

    def get_taxTotal(self, obj):
        # 16% VAT inclusive
        return round(float(obj.total_amount) * 0.16 / 1.16, 2)

    def get_discountTotal(self, obj):
        return 0.0

class ExpenseSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    recordedBy = serializers.CharField(source="recorded_by", allow_blank=True)

    class Meta:
        model = Expense
        fields = ["id", "tenantId", "title", "amount", "category", "date", "recordedBy", "notes"]

class StaffMemberSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    monthlySalary = serializers.FloatField(source="monthly_salary")
    basicSalary = serializers.FloatField(source="monthly_salary")  # alias for frontend
    hireDate = serializers.SerializerMethodField()
    salesThisMonth = serializers.SerializerMethodField()
    commissionRate = serializers.SerializerMethodField()
    monthlyTarget = serializers.SerializerMethodField()
    hasLoginAccount = serializers.SerializerMethodField()
    loginEmail = serializers.SerializerMethodField()

    class Meta:
        model = StaffMember
        fields = [
            "id", "tenantId", "name", "email", "phone", "role",
            "monthlySalary", "basicSalary", "status",
            "hireDate", "salesThisMonth", "commissionRate", "monthlyTarget",
            "hasLoginAccount", "loginEmail"
        ]

    def get_hireDate(self, obj):
        return str(obj.id)[:10] if obj.id else ""

    def get_salesThisMonth(self, obj):
        from django.utils import timezone
        from .models import Sale
        now = timezone.now()
        total = Sale.objects.filter(
            tenant=obj.tenant,
            cashier_name__iexact=obj.name,
            created_at__year=now.year,
            created_at__month=now.month
        ).aggregate(total=models.Sum("total_amount"))["total"]
        return float(total or 0)

    def get_commissionRate(self, obj):
        return 2.0

    def get_monthlyTarget(self, obj):
        return 300000.0

    def get_hasLoginAccount(self, obj):
        from .models import User, Membership
        return Membership.objects.filter(tenant=obj.tenant, user__email=obj.email).exists()

    def get_loginEmail(self, obj):
        return obj.email

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
    currentAmount = serializers.FloatField(source="current_amount", required=False, default=0.0)
    achievedAmount = serializers.SerializerMethodField()
    assignedToStaffId = serializers.CharField(source="assigned_to_staff_id", required=False, allow_null=True)
    assignedToStaffName = serializers.SerializerMethodField()
    startDate = serializers.DateField(source="start_date")
    endDate = serializers.DateField(source="end_date")
    type = serializers.CharField(required=False, default="business")
    status = serializers.CharField(required=False, default="active")

    class Meta:
        model = Target
        fields = [
            "id", "tenantId", "title", "type", "targetAmount", "currentAmount",
            "achievedAmount", "assignedToStaffId", "assignedToStaffName",
            "period", "startDate", "endDate", "status"
        ]

    def get_achievedAmount(self, obj):
        if obj.current_amount and float(obj.current_amount) > 0:
            return float(obj.current_amount)
        from .models import Sale
        from django.db.models import Sum
        sales_sum = Sale.objects.filter(
            tenant=obj.tenant,
            created_at__date__gte=obj.start_date,
            created_at__date__lte=obj.end_date,
            payment_status="paid"
        ).aggregate(Sum("total_amount"))["total_amount__sum"] or 0
        return float(sales_sum)

    def get_assignedToStaffName(self, obj):
        return obj.assigned_to_staff.name if obj.assigned_to_staff else None

class NotificationSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    isRead = serializers.BooleanField(source="is_read")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "tenantId", "title", "message", "type", "isRead", "createdAt"]


class DailyReconciliationSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    openingFloat = serializers.FloatField(source="opening_float")
    cashSales = serializers.FloatField(source="cash_sales")
    cashExpenses = serializers.FloatField(source="cash_expenses")
    expectedCash = serializers.FloatField(source="expected_cash")
    actualCash = serializers.FloatField(source="actual_cash")
    cashDiscrepancy = serializers.FloatField(source="cash_discrepancy")
    mpesaExpected = serializers.FloatField(source="mpesa_expected")
    mpesaActual = serializers.FloatField(source="mpesa_actual")
    mpesaDiscrepancy = serializers.FloatField(source="mpesa_discrepancy")
    cardExpected = serializers.FloatField(source="card_expected")
    cardActual = serializers.FloatField(source="card_actual")
    cardDiscrepancy = serializers.FloatField(source="card_discrepancy")
    totalCollected = serializers.FloatField(source="total_collected")
    reconciledBy = serializers.CharField(source="reconciled_by", allow_blank=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = DailyReconciliation
        fields = [
            "id", "tenantId", "date", "openingFloat", "cashSales", "cashExpenses",
            "expectedCash", "actualCash", "cashDiscrepancy",
            "mpesaExpected", "mpesaActual", "mpesaDiscrepancy",
            "cardExpected", "cardActual", "cardDiscrepancy",
            "totalCollected", "status", "reconciledBy", "notes",
            "createdAt", "updatedAt"
        ]


class CreditPaymentSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    creditAccountId = serializers.CharField(source="credit_account_id", required=False)
    entityType = serializers.CharField(source="entity_type", required=False)
    entityName = serializers.CharField(source="entity_name", required=False, allow_blank=True)
    paymentMethod = serializers.CharField(source="payment_method", default="cash")
    referenceCode = serializers.CharField(source="reference_code", required=False, allow_blank=True)
    recordedBy = serializers.CharField(source="recorded_by", required=False, allow_blank=True)
    amount = serializers.FloatField()
    date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = CreditPayment
        fields = [
            "id", "tenantId", "creditAccountId", "entityType", "entityName",
            "amount", "paymentMethod", "referenceCode", "date", "recordedBy", "notes"
        ]


class CreditAccountSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    entityType = serializers.CharField(source="entity_type")
    entityId = serializers.CharField(source="entity_id", required=False, allow_blank=True)
    entityName = serializers.CharField(source="entity_name")
    entityPhone = serializers.CharField(source="entity_phone", required=False, allow_blank=True)
    referenceDocId = serializers.CharField(source="reference_doc_id", required=False, allow_blank=True)
    referenceDocType = serializers.CharField(source="reference_doc_type", required=False, default="sale")
    totalAmount = serializers.FloatField(source="total_amount")
    paidAmount = serializers.FloatField(source="paid_amount", required=False, default=0.0)
    balanceDue = serializers.FloatField(source="balance_due", required=False)
    dueDate = serializers.DateField(source="due_date")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    payments = CreditPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = CreditAccount
        fields = [
            "id", "tenantId", "entityType", "entityId", "entityName", "entityPhone",
            "referenceDocId", "referenceDocType", "totalAmount", "paidAmount",
            "balanceDue", "dueDate", "status", "notes", "createdAt", "payments"
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    productId = serializers.CharField(source="product_id", read_only=True, allow_null=True)
    productName = serializers.CharField(source="product_name")
    previousStock = serializers.IntegerField(source="previous_stock", read_only=True)
    newStock = serializers.IntegerField(source="new_stock", read_only=True)
    referenceId = serializers.CharField(source="reference_id", required=False, allow_blank=True)
    staffName = serializers.CharField(source="staff_name", required=False, allow_blank=True)
    date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id", "tenantId", "productId", "productName", "type", "quantity",
            "previousStock", "newStock", "referenceId", "reason", "staffName", "date"
        ]


class InvoiceItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source="product_id", required=False, allow_null=True, allow_blank=True)
    unitPrice = serializers.FloatField(source="unit_price")
    taxRate = serializers.FloatField(source="tax_rate", default=16.0)
    amount = serializers.FloatField(required=False)

    class Meta:
        model = InvoiceItem
        fields = ["id", "productId", "description", "quantity", "unitPrice", "discount", "taxRate", "amount"]


class InvoiceSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    invoiceNumber = serializers.CharField(source="invoice_number", required=False)
    customerId = serializers.CharField(source="customer_id", required=False, allow_null=True, allow_blank=True)
    customerName = serializers.CharField(source="customer_name")
    customerEmail = serializers.EmailField(source="customer_email", required=False, allow_blank=True)
    customerPhone = serializers.CharField(source="customer_phone", required=False, allow_blank=True)
    customerAddress = serializers.CharField(source="customer_address", required=False, allow_blank=True)
    issueDate = serializers.DateField(source="issue_date")
    dueDate = serializers.DateField(source="due_date")
    subtotal = serializers.FloatField()
    taxAmount = serializers.FloatField(source="tax_amount", required=False, default=0.0)
    discountAmount = serializers.FloatField(source="discount_amount", required=False, default=0.0)
    totalAmount = serializers.FloatField(source="total_amount")
    amountPaid = serializers.FloatField(source="amount_paid", required=False, default=0.0)
    balanceDue = serializers.FloatField(source="balance_due", required=False)
    items = InvoiceItemSerializer(many=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "tenantId", "invoiceNumber", "customerId", "customerName",
            "customerEmail", "customerPhone", "customerAddress", "issueDate", "dueDate",
            "subtotal", "taxAmount", "discountAmount", "totalAmount", "amountPaid",
            "balanceDue", "status", "notes", "terms", "items", "createdAt"
        ]


class PurchaseItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source="product_id", required=False, allow_null=True, allow_blank=True)
    productName = serializers.CharField(source="product_name")
    quantityOrdered = serializers.IntegerField(source="quantity_ordered")
    quantityReceived = serializers.IntegerField(source="quantity_received", required=False, default=0)
    unitCost = serializers.FloatField(source="unit_cost")
    total = serializers.FloatField(required=False)

    class Meta:
        model = PurchaseItem
        fields = ["id", "productId", "productName", "sku", "quantityOrdered", "quantityReceived", "unitCost", "total"]


class PurchaseSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    purchaseNumber = serializers.CharField(source="purchase_number", required=False)
    supplierId = serializers.CharField(source="supplier_id", required=False, allow_null=True, allow_blank=True)
    supplierName = serializers.CharField(source="supplier_name")
    totalAmount = serializers.FloatField(source="total_amount")
    amountPaid = serializers.FloatField(source="amount_paid", required=False, default=0.0)
    balance = serializers.FloatField(required=False)
    paymentStatus = serializers.CharField(source="payment_status", default="unpaid")
    expectedDeliveryDate = serializers.DateField(source="expected_delivery_date", required=False, allow_null=True)
    receivedDate = serializers.DateTimeField(source="received_date", required=False, allow_null=True)
    items = PurchaseItemSerializer(many=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Purchase
        fields = [
            "id", "tenantId", "purchaseNumber", "supplierId", "supplierName",
            "subtotal", "tax", "shipping", "totalAmount", "amountPaid", "balance",
            "status", "paymentStatus", "date", "expectedDeliveryDate", "receivedDate",
            "notes", "items", "createdAt"
        ]


class LoyaltyRewardSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    pointsRequired = serializers.IntegerField(source="points_required")
    discountAmount = serializers.FloatField(source="discount_amount")
    isActive = serializers.BooleanField(source="is_active", default=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = LoyaltyReward
        fields = ["id", "tenantId", "title", "pointsRequired", "discountAmount", "description", "isActive", "createdAt"]


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    customerId = serializers.CharField(source="customer_id", required=False, allow_null=True)
    customerName = serializers.CharField(source="customer_name")
    saleId = serializers.CharField(source="sale_id", required=False, allow_null=True)
    date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = LoyaltyTransaction
        fields = ["id", "tenantId", "customerId", "customerName", "type", "points", "saleId", "description", "date"]


class SaaSPlanSerializer(serializers.ModelSerializer):
    billingPeriod = serializers.CharField(source="billing_period", default="monthly")
    maxStaff = serializers.IntegerField(source="max_staff", default=5)
    maxProducts = serializers.IntegerField(source="max_products", default=500)
    maxInvoicesPerMonth = serializers.IntegerField(source="max_invoices_per_month", default=100)
    isPopular = serializers.BooleanField(source="is_popular", default=False)
    isActive = serializers.BooleanField(source="is_active", default=True)

    class Meta:
        model = SaaSPlan
        fields = [
            "id", "slug", "name", "price", "billingPeriod", "description",
            "features", "maxStaff", "maxProducts", "maxInvoicesPerMonth", "isPopular", "isActive"
        ]

