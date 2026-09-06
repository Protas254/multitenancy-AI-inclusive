from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404

from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification
)
from .serializers import (
    TenantSerializer, UserSerializer, MembershipSerializer, CategorySerializer,
    SupplierSerializer, ProductSerializer, CustomerSerializer, SaleSerializer,
    ExpenseSerializer, StaffMemberSerializer, PayrollRecordSerializer,
    TargetSerializer, NotificationSerializer
)

class TenantScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_tenant_id(self):
        return getattr(self.request, "tenant_id", "tenant-fashion")

    def get_queryset(self):
        tenant_id = self.get_tenant_id()
        if hasattr(self.queryset.model, "tenant"):
            return self.queryset.filter(tenant_id=tenant_id)
        return self.queryset

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)
        if hasattr(serializer.Meta.model, "tenant"):
            serializer.save(tenant=tenant)
        else:
            serializer.save()

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [permissions.AllowAny]

class CategoryViewSet(TenantScopedViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SupplierViewSet(TenantScopedViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class ProductViewSet(TenantScopedViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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

# Auth API Endpoints
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = User.objects.filter(email=email).first()
    if user and user.check_password(password):
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        memberships_data = MembershipSerializer(user.memberships.all(), many=True).data
        return Response({
            "token": str(refresh.access_token),
            "user": user_data,
            "memberships": memberships_data
        })
    
    return Response({"detail": "Invalid credentials. Please try again."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    import uuid
    from django.utils.text import slugify

    data = request.data
    email = data.get("email")
    password = data.get("password")
    name = data.get("fullName") or data.get("name") or email.split("@")[0]
    phone = data.get("phone", "")

    if User.objects.filter(email=email).exists():
        return Response({"detail": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(email=email, password=password, name=name, phone=phone)
    
    business_name = data.get("businessName") or f"{name}'s Store"
    tenant_id = f"tenant-{uuid.uuid4().hex[:8]}"
    slug = f"{slugify(business_name)}-{uuid.uuid4().hex[:4]}"

    tenant = Tenant.objects.create(
        id=tenant_id,
        name=business_name,
        slug=slug,
        business_type=data.get("businessType", "Retail Supermarket"),
        phone=phone,
        email=email,
        plan=data.get("plan", "pro"),
        currency=data.get("currency", "KES")
    )

    # Default category for new tenant
    Category.objects.create(id=f"cat-{uuid.uuid4().hex[:8]}", tenant=tenant, name="General Merchandise", description="Default Category")

    Membership.objects.create(user=user, tenant=tenant, role="owner", designation="Business Owner")

    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data
    memberships_data = MembershipSerializer(user.memberships.all(), many=True).data

    return Response({
        "token": str(refresh.access_token),
        "user": user_data,
        "memberships": memberships_data,
        "activeTenantId": tenant.id
    }, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def current_user_view(request):
    user = User.objects.first()
    if not user:
        return Response({"detail": "No user found."}, status=status.HTTP_404_NOT_FOUND)
    
    user_data = UserSerializer(user).data
    return Response(user_data)
