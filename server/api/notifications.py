import datetime
from django.utils import timezone
from django.db.models import Sum
from .models import (
    Tenant, Product, Customer, StaffMember, Target, Notification,
    DailyReconciliation, CreditAccount, Sale
)

def trigger_low_stock_notification(product):
    """Generates a low stock alert if product is at or below its alert threshold."""
    if not product or not product.tenant:
        return None

    threshold = getattr(product, "min_stock_alert", getattr(product, "min_stock_level", 5)) or 5
    if product.current_stock <= threshold:
        today = timezone.now().date()
        # Avoid duplicate unread notifications for the same product on the same day
        exists = Notification.objects.filter(
            tenant=product.tenant,
            type="low_stock",
            title__icontains=product.name[:30],
            created_at__date=today,
            is_read=False
        ).exists()

        if not exists:
            status_text = "OUT OF STOCK" if product.current_stock <= 0 else f"{product.current_stock} units remaining"
            supplier_text = f" Contact {product.supplier.name}." if getattr(product, "supplier", None) else ""
            return Notification.objects.create(
                tenant=product.tenant,
                type="low_stock",
                title=f"⚠️ Low Stock Alert: {product.name}",
                message=f"{product.name} is running low ({status_text}, threshold: {threshold}).{supplier_text}",
                is_read=False
            )
    return None


def trigger_credit_limit_notification(customer, tenant):
    """Generates an alert if customer unpaid debt exceeds their credit limit."""
    if not customer or not tenant:
        return None

    limit = float(getattr(customer, "credit_limit", 50000) or 50000)
    # Calculate total unpaid debt from CreditAccount
    unpaid_debt = float(
        CreditAccount.objects.filter(
            tenant=tenant,
            entity_id=customer.id,
            status__in=["current", "due_soon", "overdue"]
        ).aggregate(Sum("balance_due"))["balance_due__sum"] or 0
    )

    if unpaid_debt > limit:
        today = timezone.now().date()
        exists = Notification.objects.filter(
            tenant=tenant,
            type="warning",
            title__icontains=customer.name[:30],
            created_at__date=today,
            is_read=False
        ).exists()

        if not exists:
            excess = unpaid_debt - limit
            return Notification.objects.create(
                tenant=tenant,
                type="warning",
                title=f"🚨 Credit Limit Exceeded: {customer.name}",
                message=f"{customer.name} owes KES {unpaid_debt:,.2f}, which exceeds their allowable credit limit of KES {limit:,.2f} by KES {excess:,.2f}.",
                is_read=False
            )
    return None


def trigger_quota_achievement_notification(staff_member, tenant):
    """Generates an achievement alert if staff member achieves their monthly sales quota."""
    if not staff_member or not tenant:
        return None

    now = timezone.now()
    month_start = now.date().replace(day=1)

    # 1. Look for explicit target assigned to staff
    target_obj = Target.objects.filter(
        tenant=tenant,
        assigned_to_staff=staff_member,
        start_date__lte=now.date(),
        end_date__gte=now.date()
    ).first()

    target_quota = float(target_obj.target_amount) if target_obj else 300000.0

    # 2. Aggregate completed sales closed by this staff member this month
    sales_total = float(
        Sale.objects.filter(
            tenant=tenant,
            cashier_name__iexact=staff_member.name,
            created_at__date__gte=month_start,
            payment_status="paid"
        ).aggregate(Sum("total_amount"))["total_amount__sum"] or 0
    )

    if sales_total >= target_quota and target_quota > 0:
        # Check if already celebrated this month
        exists = Notification.objects.filter(
            tenant=tenant,
            type="target_achieved",
            title__icontains=staff_member.name[:30],
            created_at__date__gte=month_start
        ).exists()

        if not exists:
            if target_obj and target_obj.status != "achieved":
                target_obj.status = "achieved"
                target_obj.save(update_fields=["status"])

            return Notification.objects.create(
                tenant=tenant,
                type="target_achieved",
                title=f"🎯 Monthly Quota Hit: {staff_member.name}",
                message=f"Outstanding work! {staff_member.name} has achieved their monthly sales quota by reaching KES {sales_total:,.2f} (Target: KES {target_quota:,.2f}).",
                is_read=False
            )
    return None


def trigger_daily_reconciliation_check(tenant):
    """Generates a reminder if cash drawer reconciliation has not been performed today."""
    if not tenant:
        return None

    today = timezone.now().date()
    reconciled = DailyReconciliation.objects.filter(tenant=tenant, date=today).exists()

    if not reconciled:
        # Remind if there were sales made today
        has_sales_today = Sale.objects.filter(tenant=tenant, created_at__date=today).exists()
        if has_sales_today:
            exists = Notification.objects.filter(
                tenant=tenant,
                type="reconciliation",
                created_at__date=today,
                is_read=False
            ).exists()

            if not exists:
                return Notification.objects.create(
                    tenant=tenant,
                    type="reconciliation",
                    title="📋 End-of-Day Register Reconciliation Due",
                    message=f"Sales transactions were recorded today ({today.strftime('%d %b %Y')}), but the physical cash drawer has not been reconciled yet. Please record your drawer count before closing.",
                    is_read=False
                )
    return None


def run_all_background_checks(tenant):
    """
    Executes all automated background checks for a tenant.
    Can be called on notification view, sale checkout, or cron command.
    """
    if not tenant:
        return []

    created_notifications = []

    # 1. Low stock checks
    for prod in Product.objects.filter(tenant=tenant, is_active=True):
        n = trigger_low_stock_notification(prod)
        if n:
            created_notifications.append(n)

    # 2. Customer credit limit checks
    for cust in Customer.objects.filter(tenant=tenant):
        n = trigger_credit_limit_notification(cust, tenant)
        if n:
            created_notifications.append(n)

    # 3. Staff quota achievement checks
    for staff in StaffMember.objects.filter(tenant=tenant, status="active"):
        n = trigger_quota_achievement_notification(staff, tenant)
        if n:
            created_notifications.append(n)

    # 4. Daily reconciliation check
    n_rec = trigger_daily_reconciliation_check(tenant)
    if n_rec:
        created_notifications.append(n_rec)

    return created_notifications
