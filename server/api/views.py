from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth

from django.utils import timezone
from datetime import timedelta
from .models import (
    Tenant, User, Membership, Category, Supplier, Product, Customer,
    Sale, SaleItem, Expense, StaffMember, PayrollRecord, Target, Notification,
    DailyReconciliation, CreditAccount, CreditPayment, StockMovement,
    Invoice, InvoiceItem, Purchase, PurchaseItem, LoyaltyReward,
    LoyaltyTransaction, SaaSPlan
)
from .serializers import (
    TenantSerializer, UserSerializer, MembershipSerializer, CategorySerializer,
    SupplierSerializer, ProductSerializer, CustomerSerializer, SaleSerializer,
    ExpenseSerializer, StaffMemberSerializer, PayrollRecordSerializer,
    TargetSerializer, NotificationSerializer, DailyReconciliationSerializer,
    CreditAccountSerializer, CreditPaymentSerializer, StockMovementSerializer,
    InvoiceSerializer, PurchaseSerializer, LoyaltyRewardSerializer,
    LoyaltyTransactionSerializer, SaaSPlanSerializer
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
        invoice_number = data.get("invoiceNumber") or data.get("saleNumber") or f"INV-{Sale.objects.count() + 1001}"

        customer_id = data.get("customerId")
        customer = Customer.objects.filter(id=customer_id).first() if customer_id else None

        cashier_name = data.get("cashierName") or data.get("staffName") or "Store Cashier"

        sale = Sale.objects.create(
            tenant=tenant,
            invoice_number=invoice_number,
            customer=customer,
            customer_name=data.get("customerName", customer.name if customer else "Walk-in Customer"),
            cashier_name=cashier_name,
            total_amount=float(data.get("totalAmount", 0)),
            paid_amount=float(data.get("paidAmount", data.get("totalAmount", 0))),
            payment_status=data.get("paymentStatus", "paid"),
            payment_method=data.get("paymentMethod", "mpesa"),
            notes=data.get("notes", "")
        )

        for item in items_data:
            prod_id = item.get("productId")
            product = Product.objects.filter(id=prod_id).first() if prod_id else None
            qty = int(item.get("quantity", 1))
            unit_price = float(item.get("unitPrice", 0))
            subtotal = float(item.get("subtotal") if item.get("subtotal") is not None else (item.get("total") if item.get("total") is not None else qty * unit_price))

            SaleItem.objects.create(
                sale=sale,
                product=product,
                product_name=item.get("productName", product.name if product else "Item"),
                quantity=qty,
                unit_price=unit_price,
                subtotal=subtotal
            )

            if product:
                product.current_stock = max(0, product.current_stock - qty)
                product.save()
                from .notifications import trigger_low_stock_notification
                trigger_low_stock_notification(product)

        # Automated checks on quota achievement and credit limits
        from .notifications import (
            trigger_quota_achievement_notification,
            trigger_credit_limit_notification,
            trigger_high_value_sale_notification
        )
        if customer:
            trigger_credit_limit_notification(customer, tenant)
        cashier = StaffMember.objects.filter(tenant=tenant, name__iexact=sale.cashier_name).first()
        if cashier:
            trigger_quota_achievement_notification(cashier, tenant)

        # High-value sale trigger (e.g. >= KES 50,000)
        trigger_high_value_sale_notification(sale)

        # Digital sales receipt email if customer has email address
        if customer and customer.email:
            try:
                from .emails import send_digital_sales_receipt_email
                send_digital_sales_receipt_email(sale)
            except Exception:
                pass

        serializer = self.get_serializer(sale)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ExpenseViewSet(TenantScopedViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class StaffMemberViewSet(TenantScopedViewSet):
    queryset = StaffMember.objects.all()
    serializer_class = StaffMemberSerializer

    @action(detail=True, methods=["post"], url_path="create-login")
    def create_login_account(self, request, pk=None):
        """Create a User account + Membership for a staff member so they can log in."""
        staff = self.get_object()
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)

        email = request.data.get("email") or staff.email
        password = request.data.get("password")
        role = request.data.get("role", "cashier")  # default cashier

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not password or len(password) < 6:
            return Response({"detail": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user with this email already exists
        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            # Just add membership if they don't already have one for this tenant
            membership, created = Membership.objects.get_or_create(
                user=existing_user,
                tenant=tenant,
                defaults={"role": role, "designation": staff.role}
            )
            if not created:
                return Response({"detail": "This email already has access to this business."}, status=status.HTTP_409_CONFLICT)
            return Response({
                "detail": f"Existing user {email} has been granted {role} access to this business.",
                "userId": existing_user.id,
                "role": role
            })

        # Create new User
        import uuid
        user = User.objects.create_user(
            email=email,
            password=password,
            name=staff.name,
            username=email,
            phone=staff.phone or "",
        )

        # Create membership
        Membership.objects.create(
            user=user,
            tenant=tenant,
            role=role,
            designation=staff.role
        )

        # Update the staff email if different
        if staff.email != email:
            staff.email = email
            staff.save()

        # Send staff login welcome & activation email
        try:
            from .emails import send_staff_welcome_activation_email
            send_staff_welcome_activation_email(staff, password, role, tenant)
        except Exception:
            pass

        return Response({
            "detail": f"Login account created for {staff.name}. They can now log in with {email}.",
            "userId": user.id,
            "email": email,
            "role": role
        }, status=status.HTTP_201_CREATED)

class PayrollRecordViewSet(TenantScopedViewSet):
    queryset = PayrollRecord.objects.all()
    serializer_class = PayrollRecordSerializer

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        if not tenant_id:
            raise exceptions.ValidationError({"detail": "Active tenant ID is required."})
        tenant = get_object_or_404(Tenant, id=tenant_id)
        pr = serializer.save(tenant=tenant)

        # Send monthly payslip email to staff
        if pr.staff and pr.staff.email:
            try:
                from .emails import send_monthly_payslip_email
                send_monthly_payslip_email(pr)
            except Exception:
                pass

class TargetViewSet(TenantScopedViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer

class NotificationViewSet(TenantScopedViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer

    def list(self, request, *args, **kwargs):
        tenant_id = self.get_tenant_id()
        if tenant_id:
            tenant = Tenant.objects.filter(id=tenant_id).first()
            if tenant:
                from .notifications import run_all_background_checks
                run_all_background_checks(tenant)
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=["post"], url_path="run-checks")
    def run_checks(self, request):
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)
        from .notifications import run_all_background_checks
        alerts = run_all_background_checks(tenant)
        return Response({
            "detail": f"Ran all scheduled and event triggers. Generated {len(alerts)} alert(s).",
            "count": len(alerts)
        })

    @action(detail=False, methods=["post"], url_path="manager-override")
    def record_manager_override(self, request):
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)
        data = request.data
        action_title = data.get("actionTitle", "Manager Override")
        manager_name = data.get("managerName", request.user.name or request.user.username or "Store Manager")
        reason = data.get("reason", "Manager PIN authorization")

        from .notifications import trigger_manager_pin_void_notification
        notif = trigger_manager_pin_void_notification(tenant, action_title, manager_name, reason)
        return Response({
            "detail": "Manager PIN override recorded and flagged.",
            "notificationId": notif.id if notif else None
        })

class DailyReconciliationViewSet(TenantScopedViewSet):
    queryset = DailyReconciliation.objects.all()
    serializer_class = DailyReconciliationSerializer

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        if not tenant_id:
            raise exceptions.ValidationError({"detail": "Active tenant ID is required to create resources."})
        tenant = get_object_or_404(Tenant, id=tenant_id)
        rec = serializer.save(tenant=tenant)

        # Trigger Daily Reconciliation Sign-off notification & daily closeout digest email
        from .notifications import trigger_daily_reconciliation_signoff
        trigger_daily_reconciliation_signoff(rec)


class CreditAccountViewSet(TenantScopedViewSet):
    queryset = CreditAccount.objects.all()
    serializer_class = CreditAccountSerializer

    def perform_create(self, serializer):
        tenant_id = self.get_tenant_id()
        if not tenant_id:
            raise exceptions.ValidationError({"detail": "Active tenant ID is required."})
        tenant = get_object_or_404(Tenant, id=tenant_id)
        total_amount = float(serializer.validated_data.get("total_amount", 0))
        paid_amount = float(serializer.validated_data.get("paid_amount", 0))
        balance_due = max(0.0, total_amount - paid_amount)
        status_val = "cleared" if balance_due == 0 else serializer.validated_data.get("status", "current")
        serializer.save(tenant=tenant, balance_due=balance_due, status=status_val)

    def perform_update(self, serializer):
        total_amount = float(serializer.validated_data.get("total_amount", serializer.instance.total_amount))
        paid_amount = float(serializer.validated_data.get("paid_amount", serializer.instance.paid_amount))
        balance_due = max(0.0, total_amount - paid_amount)
        status_val = "cleared" if balance_due == 0 else serializer.validated_data.get("status", serializer.instance.status)
        serializer.save(balance_due=balance_due, status=status_val)


class CreditPaymentViewSet(TenantScopedViewSet):
    queryset = CreditPayment.objects.all()
    serializer_class = CreditPaymentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)

        credit_account_id = data.get("creditAccountId")
        account = get_object_or_404(CreditAccount, id=credit_account_id, tenant=tenant)

        amount = float(data.get("amount", 0))
        account.paid_amount = float(account.paid_amount) + amount
        account.balance_due = max(0.0, float(account.total_amount) - float(account.paid_amount))
        if account.balance_due == 0:
            account.status = "cleared"
        account.save()

        payment = CreditPayment.objects.create(
            tenant=tenant,
            credit_account=account,
            entity_type=account.entity_type,
            entity_name=account.entity_name,
            amount=amount,
            payment_method=data.get("paymentMethod", "cash"),
            reference_code=data.get("referenceCode", ""),
            recorded_by=data.get("recordedBy", request.user.name or request.user.username),
            notes=data.get("notes", "")
        )

        # Send credit payment confirmation email if customer
        if account.entity_type == "customer":
            customer = Customer.objects.filter(tenant=tenant, id=account.entity_id).first()
            if customer and customer.email:
                try:
                    from .emails import send_credit_payment_confirmation_email
                    send_credit_payment_confirmation_email(customer, amount, account.balance_due, tenant)
                except Exception:
                    pass

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StockMovementViewSet(TenantScopedViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    @action(detail=False, methods=["POST"], url_path="adjust")
    def adjust_stock(self, request):
        data = request.data
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)

        product_id = data.get("productId")
        product = get_object_or_404(Product, id=product_id, tenant=tenant)

        adj_type = data.get("type", "increase")
        quantity = int(data.get("quantity", 0))
        reason = data.get("reason", "Stock adjustment")
        notes = data.get("notes", "")
        staff_name = request.user.name or request.user.username or "Store Staff"

        prev_stock = product.current_stock
        if adj_type == "increase":
            new_stock = prev_stock + quantity
            mov_type = "adjustment_increase"
            diff = quantity
        elif adj_type == "decrease":
            new_stock = max(0, prev_stock - quantity)
            mov_type = "adjustment_decrease"
            diff = -quantity
        elif adj_type == "set":
            new_stock = max(0, quantity)
            diff = new_stock - prev_stock
            mov_type = "adjustment_increase" if diff >= 0 else "adjustment_decrease"
        else:
            new_stock = prev_stock
            mov_type = "adjustment_increase"
            diff = 0

        product.current_stock = new_stock
        product.save()

        full_reason = f"{reason} - {notes}" if notes else reason
        StockMovement.objects.create(
            tenant=tenant,
            product=product,
            product_name=product.name,
            type=mov_type,
            quantity=diff,
            previous_stock=prev_stock,
            new_stock=new_stock,
            reference_id=f"ADJ-{timezone.now().strftime('%Y%m%d%H%M')}",
            reason=full_reason,
            staff_name=staff_name
        )

        prod_serializer = ProductSerializer(product)
        return Response(prod_serializer.data, status=status.HTTP_200_OK)


class InvoiceViewSet(TenantScopedViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)

        items_data = data.get("items", [])
        invoice_number = data.get("invoiceNumber") or f"INV-2026-{str(Invoice.objects.filter(tenant=tenant).count() + 101).zfill(4)}"

        total_amount = float(data.get("totalAmount", 0))
        amount_paid = float(data.get("amountPaid", 0))
        balance_due = max(0.0, total_amount - amount_paid)
        status_val = "paid" if balance_due == 0 else data.get("status", "sent")

        customer_id = data.get("customerId")
        customer = Customer.objects.filter(id=customer_id, tenant=tenant).first() if customer_id else None

        invoice = Invoice.objects.create(
            tenant=tenant,
            invoice_number=invoice_number,
            customer=customer,
            customer_name=data.get("customerName", customer.name if customer else "Client"),
            customer_email=data.get("customerEmail", customer.email if customer else ""),
            customer_phone=data.get("customerPhone", customer.phone if customer else ""),
            customer_address=data.get("customerAddress", customer.address if customer else ""),
            issue_date=data.get("issueDate") or timezone.now().date(),
            due_date=data.get("dueDate") or (timezone.now().date() + timedelta(days=14)),
            subtotal=data.get("subtotal", total_amount),
            tax_amount=data.get("taxAmount", 0),
            discount_amount=data.get("discountAmount", 0),
            total_amount=total_amount,
            amount_paid=amount_paid,
            balance_due=balance_due,
            status=status_val,
            notes=data.get("notes", ""),
            terms=data.get("terms", "")
        )

        for item in items_data:
            InvoiceItem.objects.create(
                invoice=invoice,
                description=item.get("description", "Item"),
                quantity=item.get("quantity", 1),
                unit_price=item.get("unitPrice", 0),
                discount=item.get("discount", 0),
                tax_rate=item.get("taxRate", 16),
                amount=item.get("amount", 0)
            )

        # Send formal B2B tax invoice email if recipient email available
        if invoice.customer_email or (customer and customer.email):
            try:
                from .emails import send_formal_b2b_tax_invoice_email
                send_formal_b2b_tax_invoice_email(invoice)
            except Exception:
                pass

        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["POST"], url_path="record_payment")
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        amount = float(request.data.get("amount", 0))
        invoice.amount_paid = float(invoice.amount_paid) + amount
        invoice.balance_due = max(0.0, float(invoice.total_amount) - float(invoice.amount_paid))
        if invoice.balance_due == 0:
            invoice.status = "paid"
        else:
            invoice.status = "partially_paid"
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


class PurchaseViewSet(TenantScopedViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        tenant_id = self.get_tenant_id()
        tenant = get_object_or_404(Tenant, id=tenant_id)

        items_data = data.get("items", [])
        purchase_number = data.get("purchaseNumber") or f"PO-2026-{str(Purchase.objects.filter(tenant=tenant).count() + 101).zfill(3)}"

        total_amount = float(data.get("totalAmount", 0))
        amount_paid = float(data.get("amountPaid", 0))
        balance = max(0.0, total_amount - amount_paid)
        payment_status = "paid" if balance == 0 else "partially_paid" if amount_paid > 0 else "unpaid"

        supplier_id = data.get("supplierId")
        supplier = Supplier.objects.filter(id=supplier_id, tenant=tenant).first() if supplier_id else None

        purchase = Purchase.objects.create(
            tenant=tenant,
            purchase_number=purchase_number,
            supplier=supplier,
            supplier_name=data.get("supplierName", supplier.name if supplier else "Supplier"),
            subtotal=data.get("subtotal", total_amount),
            tax=data.get("tax", 0),
            shipping=data.get("shipping", 0),
            total_amount=total_amount,
            amount_paid=amount_paid,
            balance=balance,
            status="pending",
            payment_status=payment_status,
            date=data.get("date") or timezone.now().date(),
            expected_delivery_date=data.get("expectedDeliveryDate"),
            notes=data.get("notes", "")
        )

        for item in items_data:
            prod_id = item.get("productId")
            product = Product.objects.filter(id=prod_id, tenant=tenant).first() if prod_id else None
            qty = item.get("quantity", item.get("quantityOrdered", 1))
            unit_cost = item.get("unitCost", 0)
            PurchaseItem.objects.create(
                purchase=purchase,
                product=product,
                product_name=item.get("productName", product.name if product else "Item"),
                sku=item.get("sku", product.sku if product else ""),
                quantity_ordered=qty,
                unit_cost=unit_cost,
                total=item.get("total", float(qty) * float(unit_cost))
            )

        # Send supplier purchase order email
        if supplier and supplier.email:
            try:
                from .emails import send_supplier_po_email
                send_supplier_po_email(purchase)
            except Exception:
                pass

        serializer = self.get_serializer(purchase)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["POST"], url_path="receive")
    def receive_stock(self, request, pk=None):
        purchase = self.get_object()
        purchase.status = "received"
        purchase.received_date = timezone.now()
        purchase.save()

        staff_name = request.data.get("staffName", request.user.name or request.user.username or "Store Manager")
        for item in purchase.items.all():
            item.quantity_received = item.quantity_ordered
            item.save()

            if item.product:
                prev = item.product.current_stock
                nxt = prev + item.quantity_ordered
                item.product.current_stock = nxt
                item.product.save()

                StockMovement.objects.create(
                    tenant=purchase.tenant,
                    product=item.product,
                    product_name=item.product.name,
                    type="purchase",
                    quantity=item.quantity_ordered,
                    previous_stock=prev,
                    new_stock=nxt,
                    reference_id=purchase.purchase_number,
                    reason=f"Restocked from {purchase.supplier_name}",
                    staff_name=staff_name
                )

        serializer = self.get_serializer(purchase)
        return Response(serializer.data)


class LoyaltyRewardViewSet(TenantScopedViewSet):
    queryset = LoyaltyReward.objects.all()
    serializer_class = LoyaltyRewardSerializer

    @action(detail=True, methods=["POST"], url_path="redeem")
    def redeem_reward(self, request, pk=None):
        reward = self.get_object()
        customer_id = request.data.get("customerId")
        customer = get_object_or_404(Customer, id=customer_id, tenant=reward.tenant)

        if customer.loyalty_points < reward.points_required:
            return Response(
                {"detail": f"Insufficient points. Customer has {customer.loyalty_points} points, needs {reward.points_required}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        customer.loyalty_points -= reward.points_required
        customer.save()

        tx = LoyaltyTransaction.objects.create(
            tenant=reward.tenant,
            customer=customer,
            customer_name=customer.name,
            type="redeemed",
            points=reward.points_required,
            description=f"Redeemed {reward.title}"
        )
        return Response(LoyaltyTransactionSerializer(tx).data, status=status.HTTP_201_CREATED)


class LoyaltyTransactionViewSet(TenantScopedViewSet):
    queryset = LoyaltyTransaction.objects.all()
    serializer_class = LoyaltyTransactionSerializer


class SaaSPlanViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = SaaSPlan.objects.filter(is_active=True)
    serializer_class = SaaSPlanSerializer

# Auth API Endpoints
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""

    user = User.objects.filter(email__iexact=email).first()
    if user and user.check_password(password):
        # Super admins can always log in
        if not user.is_superuser:
            memberships = user.memberships.select_related("tenant").all()
            if memberships.exists() and all(m.tenant.status == "pending" for m in memberships):
                return Response(
                    {"detail": "Your business account is pending activation by the administrator. You will be notified once it is approved.", "pendingActivation": True},
                    status=status.HTTP_403_FORBIDDEN
                )

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
        currency=data.get("currency", "KES"),
        status="pending",
        is_active=False,
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

    # Send Welcome & Store Setup Email to new merchant
    try:
        from .emails import send_welcome_store_setup_email
        send_welcome_store_setup_email(user, tenant, temp_password=password)
    except Exception:
        pass

    return Response({
        "message": "Registration successful. Your business account is pending activation by the administrator.",
        "pendingActivation": True,
        "businessName": business_name,
        "email": email,
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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def admin_platform_stats(request):
    total_tenants = Tenant.objects.count()
    active_tenants = Tenant.objects.filter(status="active").count()

    plan_prices = {"starter": 2500, "professional": 6500, "pro": 6500, "enterprise": 15000}
    mrr = sum(plan_prices.get(t.plan.lower(), 2500) for t in Tenant.objects.filter(status="active"))

    total_sales_volume = float(Sale.objects.aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
    now = timezone.now()
    new_tenants = Tenant.objects.filter(created_at__year=now.year, created_at__month=now.month).count()

    return Response({
        "totalTenants": total_tenants,
        "activeTenants": active_tenants,
        "mrr": mrr,
        "totalSalesVolume": total_sales_volume,
        "churnRate": 1.5,
        "newTenantsThisMonth": new_tenants if new_tenants > 0 else total_tenants,
    })


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def saas_plans_view(request):
    plans = SaaSPlan.objects.filter(is_active=True)
    if not plans.exists():
        defaults = [
            {
                "id": "starter",
                "slug": "starter",
                "name": "Starter Retail",
                "price": 1000,
                "billing_period": "monthly",
                "description": "Perfect for single-shop retailers and sole proprietors starting out.",
                "features": ["1 Branch Location", "Up to 2 Staff Accounts (Owner + Cashier)", "Core POS & Barcode Scanner", "Up to 500 Inventory SKUs", "Daily Sales Receipts", "Standard Email Support"],
                "max_staff": 2,
                "max_products": 500,
                "max_invoices_per_month": 50,
                "is_popular": False,
            },
            {
                "id": "professional",
                "slug": "professional",
                "name": "Growth Pro",
                "price": 2000,
                "billing_period": "monthly",
                "description": "Ideal for growing retail stores, supermarkets, and boutiques requiring staff control.",
                "features": ["Up to 3 Branch Locations", "Up to 10 Staff Roles (Manager PIN Protection)", "Protected Financials (Hidden P&L, Wholesale & Payroll)", "Customer CRM & Loyalty Program", "Expense Tracking & Profit/Loss Analytics", "B2B Invoicing & Customer Credit Accounts", "Supplier Purchase Orders & Restocking", "Priority WhatsApp Support"],
                "max_staff": 10,
                "max_products": 10000,
                "max_invoices_per_month": 500,
                "is_popular": True,
            },
            {
                "id": "enterprise",
                "slug": "enterprise",
                "name": "Enterprise Chain",
                "price": 3000,
                "billing_period": "monthly",
                "description": "For retail chains, supermarkets, franchises, and central warehouse operations.",
                "features": ["Unlimited Branch Locations & Central Warehouses", "Unlimited Staff Accounts & Custom Role Builder", "Inter-Branch Stock Transfers & Transit Tracking", "Consolidated Head-Office Financial Reports", "Multi-Branch Tax & Automated Reconciliations", "AI Predictive Restocking & Demand Forecasting", "Dedicated Account Manager & 24/7 SLA"],
                "max_staff": 999,
                "max_products": 99999,
                "max_invoices_per_month": 99999,
                "is_popular": False,
            },
        ]
        for p in defaults:
            SaaSPlan.objects.create(**p)
        plans = SaaSPlan.objects.filter(is_active=True)

    return Response(SaaSPlanSerializer(plans, many=True).data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_view(request):
    user = request.user
    tenant_id = request.headers.get("X-Tenant-ID") or getattr(request, "tenant_id", None)
    if not tenant_id and user.is_authenticated:
        mem = user.memberships.select_related("tenant").first()
        if mem:
            tenant_id = mem.tenant_id
    if not tenant_id:
        first_t = Tenant.objects.first()
        tenant_id = first_t.id if first_t else None

    if not tenant_id:
        return Response({})

    tenant = get_object_or_404(Tenant, id=tenant_id)
    today = timezone.now().date()

    today_sales_qs = Sale.objects.filter(tenant=tenant, created_at__date=today)
    today_sales = float(today_sales_qs.aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
    today_orders = today_sales_qs.count()

    today_expenses = float(Expense.objects.filter(tenant=tenant, date=today).aggregate(Sum("amount"))["amount__sum"] or 0)
    today_profit = today_sales - today_expenses

    chart_data_7d = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = "Today" if i == 0 else day.strftime("%a %d")
        s_val = float(Sale.objects.filter(tenant=tenant, created_at__date=day).aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
        e_val = float(Expense.objects.filter(tenant=tenant, date=day).aggregate(Sum("amount"))["amount__sum"] or 0)
        chart_data_7d.append({
            "date": day_str,
            "sales": s_val,
            "expenses": e_val,
            "profit": s_val - e_val
        })

    chart_data_30d = []
    for w in range(4, 0, -1):
        start_w = today - timedelta(days=w * 7)
        end_w = start_w + timedelta(days=7)
        s_val = float(Sale.objects.filter(tenant=tenant, created_at__date__gte=start_w, created_at__date__lt=end_w).aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
        e_val = float(Expense.objects.filter(tenant=tenant, date__gte=start_w, date__lt=end_w).aggregate(Sum("amount"))["amount__sum"] or 0)
        chart_data_30d.append({
            "date": f"Week {5 - w}",
            "sales": s_val,
            "expenses": e_val,
            "profit": s_val - e_val
        })

    top_items = (
        SaleItem.objects.filter(sale__tenant=tenant)
        .values("product_name")
        .annotate(unitsSold=Sum("quantity"), revenue=Sum("subtotal"))
        .order_by("-revenue")[:5]
    )
    top_products = [
        {
            "name": item["product_name"],
            "unitsSold": item["unitsSold"],
            "revenue": float(item["revenue"]),
            "category": "Catalog Item"
        }
        for item in top_items
    ]

    target_obj = Target.objects.filter(tenant=tenant).first()
    if target_obj:
        if target_obj.current_amount and float(target_obj.current_amount) > 0:
            achieved = float(target_obj.current_amount)
        else:
            achieved = float(Sale.objects.filter(
                tenant=tenant,
                created_at__date__gte=target_obj.start_date,
                created_at__date__lte=target_obj.end_date,
                payment_status="paid"
            ).aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
        target_data = {
            "title": target_obj.title,
            "targetAmount": float(target_obj.target_amount),
            "achievedAmount": achieved,
            "periodLabel": f"{target_obj.start_date.strftime('%d %b')} – {target_obj.end_date.strftime('%d %b %Y')}",
        }
    else:
        target_data = {
            "title": "Monthly Revenue Target",
            "targetAmount": 500000,
            "achievedAmount": today_sales,
            "periodLabel": "This Month",
        }

    return Response({
        "todaySales": today_sales,
        "todayExpenses": today_expenses,
        "todayProfit": today_profit,
        "todayOrders": today_orders,
        "chartData7d": chart_data_7d,
        "chartData30d": chart_data_30d,
        "topProducts": top_products,
        "target": target_data,
    })


