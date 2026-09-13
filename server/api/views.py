from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth

from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification,
    DailyReconciliation
)
from .serializers import (
    TenantSerializer, UserSerializer, MembershipSerializer, CategorySerializer,
    SupplierSerializer, ProductSerializer, CustomerSerializer, SaleSerializer,
    ExpenseSerializer, StaffMemberSerializer, PayrollRecordSerializer,
    TargetSerializer, NotificationSerializer, DailyReconciliationSerializer
)

from rest_framework import exceptions

class TenantScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_tenant_id(self):
        user = self.request.user
        tenant_id = self.request.headers.get("X-Tenant-ID") or getattr(self.request, "tenant_id", None)

        if not tenant_id and user.is_authenticated:
            first_membership = user.memberships.select_related("tenant").first()
            if first_membership:
                tenant_id = first_membership.tenant_id

        if not tenant_id:
            first_tenant = Tenant.objects.first()
            tenant_id = first_tenant.id if first_tenant else None

        if user.is_authenticated and not user.is_superuser and tenant_id:
            has_access = user.memberships.filter(tenant_id=tenant_id).exists()
            if not has_access:
                raise exceptions.PermissionDenied(f"You do not have access to business '{tenant_id}'.")

        return tenant_id

    def get_queryset(self):
        tenant_id = self.get_tenant_id()
        if hasattr(self.queryset.model, "tenant"):
            if tenant_id:
                return self.queryset.filter(tenant_id=tenant_id)
            return self.queryset.none()
        return self.queryset

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        if not tenant_id:
            raise exceptions.ValidationError({"detail": "Active tenant ID is required to create resources."})
        tenant = get_object_or_404(Tenant, id=tenant_id)
        if hasattr(serializer.Meta.model, "tenant"):
            serializer.save(tenant=tenant)
        else:
            serializer.save()

class TenantViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TenantSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Tenant.objects.none()
        if user.is_superuser:
            return Tenant.objects.all().order_by("-created_at")
        return Tenant.objects.filter(memberships__user=user).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        import uuid
        tenant = serializer.save()
        Membership.objects.get_or_create(
            user=self.request.user,
            tenant=tenant,
            defaults={"role": "owner", "designation": "Business Owner"}
        )
        Category.objects.get_or_create(
            tenant=tenant,
            name="General Merchandise",
            defaults={"id": f"cat-{uuid.uuid4().hex[:8]}", "description": "Default Category"}
        )

class CategoryViewSet(TenantScopedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SupplierViewSet(TenantScopedViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class ProductViewSet(TenantScopedViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        if not tenant_id:
            raise exceptions.ValidationError({"detail": "Active tenant ID is required to create resources."})
        tenant = get_object_or_404(Tenant, id=tenant_id)
        
        category = None
        cat_id = self.request.data.get("categoryId") or self.request.data.get("category_id")
        if cat_id:
            category = Category.objects.filter(id=cat_id, tenant=tenant).first()
        if not category:
            category = Category.objects.filter(tenant=tenant).first()
            
        serializer.save(tenant=tenant, category=category)

class CustomerViewSet(TenantScopedViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SaleViewSet(TenantScopedViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)

        items_data = data.get("items", [])
        invoice_number = data.get("invoiceNumber") or f"INV-{Sale.objects.count() + 1001}"

        customer_id = data.get("customerId")
        customer = Customer.objects.filter(id=customer_id).first() if customer_id else None

        sale = Sale.objects.create(
            tenant=tenant,
            invoice_number=invoice_number,
            customer=customer,
            customer_name=data.get("customerName", customer.name if customer else "Walk-in Customer"),
            cashier_name=data.get("cashierName", "Store Cashier"),
            total_amount=data.get("totalAmount", 0),
            paid_amount=data.get("paidAmount", data.get("totalAmount", 0)),
            payment_status=data.get("paymentStatus", "paid"),
            payment_method=data.get("paymentMethod", "mpesa"),
            notes=data.get("notes", "")
        )

        for item in items_data:
            prod_id = item.get("productId")
            product = Product.objects.filter(id=prod_id).first() if prod_id else None
            qty = item.get("quantity", 1)
            unit_price = item.get("unitPrice", 0)
            subtotal = item.get("subtotal", qty * unit_price)

            SaleItem.objects.create(
                sale=sale,
                product=product,
                product_name=item.get("productName", product.name if product else "Item"),
                quantity=qty,
                unit_price=unit_price,
                subtotal=subtotal
            )

            if product and product.current_stock >= qty:
                product.current_stock -= qty
                product.save()

        serializer = self.get_serializer(sale)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ExpenseViewSet(TenantScopedViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class StaffMemberViewSet(TenantScopedViewSet):
    queryset = StaffMember.objects.all()
    serializer_class = StaffMemberSerializer

class PayrollRecordViewSet(TenantScopedViewSet):
    queryset = PayrollRecord.objects.all()
    serializer_class = PayrollRecordSerializer

class TargetViewSet(TenantScopedViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer

class NotificationViewSet(TenantScopedViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class DailyReconciliationViewSet(TenantScopedViewSet):
    queryset = DailyReconciliation.objects.all()
    serializer_class = DailyReconciliationSerializer

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        if not tenant_id:
            raise exceptions.ValidationError({"detail": "Active tenant ID is required to create resources."})
        tenant = get_object_or_404(Tenant, id=tenant_id)
        serializer.save(tenant=tenant)

# Auth API Endpoints
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""

    user = User.objects.filter(email__iexact=email).first()
    if user and user.check_password(password):
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        memberships_data = MembershipSerializer(user.memberships.select_related("tenant").all(), many=True).data
        active_tenant_id = memberships_data[0]["tenantId"] if memberships_data else None

        return Response({
            "token": str(refresh.access_token),
            "refreshToken": str(refresh),
            "user": user_data,
            "memberships": memberships_data,
            "activeTenantId": active_tenant_id,
        })
    
    return Response({"detail": "Invalid email or password. Please try again."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    import uuid
    from django.utils.text import slugify

    data = request.data
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    name = data.get("fullName") or data.get("name") or (email.split("@")[0] if email else "User")
    phone = data.get("phone", "")

    if not email or not password:
        return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email__iexact=email).exists():
        return Response({"detail": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(email=email, password=password, name=name, phone=phone)
    
    business_name = data.get("businessName") or f"{name}'s Business"
    tenant_id = f"tenant-{uuid.uuid4().hex[:8]}"
    slug = f"{slugify(business_name)}-{uuid.uuid4().hex[:4]}"

    tenant = Tenant.objects.create(
        id=tenant_id,
        name=business_name,
        slug=slug,
        business_type=data.get("businessType") or data.get("businessCategory") or "Retail Supermarket",
        phone=data.get("businessPhone") or phone,
        email=data.get("businessEmail") or email,
        address=data.get("address") or data.get("location") or "Nairobi, Kenya",
        vat_rate=data.get("taxRate", 16.0),
        plan=data.get("plan", "pro"),
        currency=data.get("currency", "KES")
    )

    # Seed default category for new tenant
    Category.objects.create(
        id=f"cat-{uuid.uuid4().hex[:8]}",
        tenant=tenant,
        name="General Merchandise",
        description="Default Category"
    )

    # Seed initial products if provided by the wizard
    initial_products = data.get("products", [])
    if isinstance(initial_products, list):
        for idx, item in enumerate(initial_products):
            p_name = item.get("name", "").strip() if isinstance(item, dict) else ""
            if p_name:
                Product.objects.create(
                    id=f"prod-{uuid.uuid4().hex[:8]}",
                    tenant=tenant,
                    name=p_name,
                    sku=f"SKU-{uuid.uuid4().hex[:6].upper()}",
                    buying_price=item.get("buyingPrice", 0),
                    selling_price=item.get("sellingPrice", 0),
                    current_stock=item.get("stock", 10),
                )

    # Create Owner Membership
    Membership.objects.create(user=user, tenant=tenant, role="owner", designation="Business Owner")

    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data
    memberships_data = MembershipSerializer(user.memberships.select_related("tenant").all(), many=True).data

    return Response({
        "token": str(refresh.access_token),
        "refreshToken": str(refresh),
        "user": user_data,
        "memberships": memberships_data,
        "activeTenantId": tenant.id
    }, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def current_user_view(request):
    user_data = UserSerializer(request.user).data
    return Response(user_data)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def monthly_reconciliation_report(request):
    user = request.user
    tenant_id = request.headers.get("X-Tenant-ID") or getattr(request, "tenant_id", None)
    if not tenant_id and user.is_authenticated:
        first_membership = user.memberships.select_related("tenant").first()
        if first_membership:
            tenant_id = first_membership.tenant_id

    if not tenant_id:
        return Response([])

    tenant = get_object_or_404(Tenant, id=tenant_id)
    year = request.query_params.get("year")
    try:
        year = int(year) if year else None
    except ValueError:
        year = None

    recs_qs = DailyReconciliation.objects.filter(tenant=tenant)
    if year:
        recs_qs = recs_qs.filter(date__year=year)

    months_map = {}
    for rec in recs_qs.order_by("-date"):
        month_key = rec.date.strftime("%B %Y")
        if month_key not in months_map:
            months_map[month_key] = {
                "month": month_key,
                "monthKey": rec.date.strftime("%Y-%m"),
                "physicalTotal": 0.0,
                "systemTotal": 0.0,
                "variance": 0.0,
                "discrepancyCount": 0,
                "totalCount": 0,
            }
        physical = float(rec.actual_cash + rec.mpesa_actual + rec.card_actual)
        system = float(rec.expected_cash + rec.mpesa_expected + rec.card_expected)
        variance = float(rec.cash_discrepancy + rec.mpesa_discrepancy + rec.card_discrepancy)

        months_map[month_key]["physicalTotal"] += physical
        months_map[month_key]["systemTotal"] += system
        months_map[month_key]["variance"] += variance
        months_map[month_key]["totalCount"] += 1
        if rec.status == "discrepancy" or abs(variance) > 0.01:
            months_map[month_key]["discrepancyCount"] += 1

    summary = []
    for m in months_map.values():
        m["discrepancyRatio"] = f"{m['discrepancyCount']}/{m['totalCount']}"
        summary.append(m)

    return Response(summary)

