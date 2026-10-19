import datetime
from django.utils import timezone
from django.db.models import Sum
from .models import (
    Tenant, Product, Customer, StaffMember, Target, Notification,
    DailyReconciliation, CreditAccount, Sale
)
from .emails import (
    send_critical_low_stock_email,
    send_target_achievement_email,
    send_daily_business_closeout_email,
    send_suspicious_activity_email,
    send_overdue_debt_notice_email
)


# ==============================================================================
# 1. INSTANT EVENT TRIGGERS (Triggered immediately on event occurrence)
# ==============================================================================

def trigger_low_stock_notification(product):
    """
    Zero Stockout & Low Stock Warning:
    Triggered when inventory reaches 0 or falls below minimum threshold.
    """
    if not product or not product.tenant:
        return None

    threshold = getattr(product, "min_stock_alert", getattr(product, "min_stock_level", 5)) or 5
    if product.current_stock <= threshold:
        today = timezone.now().date()
        is_zero = product.current_stock <= 0

        # Avoid spamming duplicates on the same day for unread alerts
        exists = Notification.objects.filter(
            tenant=product.tenant,
            type="low_stock",
            title__icontains=product.name[:30],
            created_at__date=today,
            is_read=False
        ).exists()

        if not exists:
            if is_zero:
                title = f"🚨 StockGrid Alert: {product.name} Out of Stock"
                msg = f"StockGrid Alert: {product.name} has reached 0 units. Reorder immediately."
            else:
                title = f"⚠️ Low Stock Alert: {product.name}"
                msg = f"StockGrid Alert: {product.name} is running low ({product.current_stock} units left, threshold: {threshold})."

            notif = Notification.objects.create(
                tenant=product.tenant,
                type="low_stock",
                title=title,
                message=msg,
                is_read=False
            )

            # Fire critical low stock email to store owner
            try:
                send_critical_low_stock_email(product.tenant, product)
            except Exception:
                pass

            return notif
    return None


def trigger_credit_limit_notification(customer, tenant):
    """
    Credit Limit Exceeded:
    Triggered when customer unpaid credit exceeds allowable credit limit.
    """
    if not customer or not tenant:
        return None

    limit = float(getattr(customer, "credit_limit", 50000) or 50000)
    unpaid_debt = float(
        CreditAccount.objects.filter(
            tenant=tenant,
            entity_id=customer.id,
            status__in=["current", "due_soon", "overdue"]
        ).aggregate(Sum("balance_due"))["balance_due__sum"] or 0
    )

    if unpaid_debt > limit and limit > 0:
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
            notif = Notification.objects.create(
                tenant=tenant,
                type="warning",
                title=f"🚨 Credit Warning: {customer.name} Exceeded Limit",
                message=f"Credit Warning: {customer.name} has reached their KES {limit:,.2f} credit limit (Owes KES {unpaid_debt:,.2f}, exceeded by KES {excess:,.2f}). Further credit sales locked.",
                is_read=False
            )

            # Send notice if account exists
            acc = CreditAccount.objects.filter(tenant=tenant, entity_id=customer.id).first()
            if acc:
                try:
                    send_overdue_debt_notice_email(customer, acc)
                except Exception:
                    pass

            return notif
    return None


def trigger_quota_achievement_notification(staff_member, tenant):
    """
    Staff Quota Hit:
    Triggered when a staff member achieves 100% of their monthly sales quota.
    """
    if not staff_member or not tenant:
        return None

    now = timezone.now()
    month_start = now.date().replace(day=1)

    target_obj = Target.objects.filter(
        tenant=tenant,
        assigned_to_staff=staff_member,
        start_date__lte=now.date(),
        end_date__gte=now.date()
    ).first()

    target_quota = float(target_obj.target_amount) if target_obj else 300000.0

    sales_total = float(
        Sale.objects.filter(
            tenant=tenant,
            cashier_name__iexact=staff_member.name,
            created_at__date__gte=month_start,
            payment_status="paid"
        ).aggregate(Sum("total_amount"))["total_amount__sum"] or 0
    )

    if sales_total >= target_quota and target_quota > 0:
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

            notif = Notification.objects.create(
                tenant=tenant,
                type="target_achieved",
                title=f"🎯 Quota Milestone: {staff_member.name} Hit Target!",
                message=f"Quota Milestone: {staff_member.name} just achieved their monthly target of KES {target_quota:,.2f} with KES {sales_total:,.2f} in sales!",
                is_read=False
            )

            # Fire celebration email
            try:
                send_target_achievement_email(staff_member, target_quota, sales_total)
            except Exception:
                pass

            return notif
    return None


def trigger_high_value_sale_notification(sale, threshold=50000.0):
    """
    High-Value Sale Recorded:
    Optional push to owner when a single transaction of KES 50,000+ is processed.
    """
    if not sale or not sale.tenant:
        return None

    amt = float(sale.total_amount)
    if amt >= threshold:
        return Notification.objects.create(
            tenant=sale.tenant,
            type="high_value_sale",
            title=f"💎 High-Value Sale: KES {amt:,.2f}",
            message=f"A transaction of KES {amt:,.2f} ({sale.payment_method.upper()}) was recorded by {sale.cashier_name} (Receipt: {sale.invoice_number}).",
            is_read=False
        )
    return None


def trigger_manager_pin_void_notification(tenant, action_title, manager_name="Store Manager", reason="Store authorization"):
    """
    Manager PIN Void / Override Trigger:
    Instant notification whenever a manager authorizes a cart wipe, void, or custom discount.
    """
    if not tenant:
        return None

    notif = Notification.objects.create(
        tenant=tenant,
        type="security_override",
        title=f"🛡️ Manager PIN Override: {action_title}",
        message=f"Manager PIN authorization performed by {manager_name} for '{action_title}'. Reason: {reason}.",
        is_read=False
    )

    try:
        send_suspicious_activity_email(tenant, f"Manager Override: {action_title}", f"Authorized by {manager_name}. Details: {reason}")
    except Exception:
        pass

    return notif


# ==============================================================================
# 2. SCHEDULED BACKGROUND TIME TRIGGERS
# ==============================================================================

def trigger_daily_reconciliation_check(tenant):
    """
    Evening Till Closeout Reminder (7:30 PM daily):
    'StockGrid: Daily register drawer is still open. Don't forget to run your blind closeout and balance cash.'
    """
    if not tenant:
        return None

    today = timezone.now().date()
    reconciled = DailyReconciliation.objects.filter(tenant=tenant, date=today).exists()

    if not reconciled:
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
                    title="📋 Evening Till Closeout Reminder",
                    message="StockGrid: Daily register drawer is still open. Don't forget to run your blind closeout and balance cash.",
                    is_read=False
                )
    return None


def trigger_morning_replenishment_check(tenant):
    """
    Morning Stock Replenishment Reminder (8:00 AM daily):
    'StockGrid: [X] products need shelf restocking before opening doors today.'
    """
    if not tenant:
        return None

    today = timezone.now().date()
    low_products = Product.objects.filter(
        tenant=tenant,
        is_active=True,
        current_stock__lte=5
    )
    low_count = low_products.count()

    if low_count > 0:
        exists = Notification.objects.filter(
            tenant=tenant,
            type="low_stock",
            title__icontains="Morning Stock Replenishment",
            created_at__date=today
        ).exists()

        if not exists:
            sample_names = ", ".join(low_products.values_list("name", flat=True)[:3])
            return Notification.objects.create(
                tenant=tenant,
                type="low_stock",
                title="🌅 Morning Stock Replenishment Reminder",
                message=f"StockGrid: {low_count} product(s) need shelf restocking before opening doors today ({sample_names}).",
                is_read=False
            )
    return None


def trigger_end_of_month_payroll_check(tenant):
    """
    End-of-Month Payroll Reminder (28th of each month):
    'StockGrid: Monthly payroll is ready for review. Approve and disburse staff compensation.'
    """
    if not tenant:
        return None

    today = timezone.now().date()
    # Check if today is on or after the 28th of the month
    if today.day >= 28:
        month_str = today.strftime("%B %Y")
        exists = Notification.objects.filter(
            tenant=tenant,
            type="payroll",
            title__icontains=month_str,
            created_at__date__gte=today.replace(day=28)
        ).exists()

        if not exists:
            return Notification.objects.create(
                tenant=tenant,
                type="payroll",
                title=f"💵 End-of-Month Payroll Reminder ({month_str})",
                message="StockGrid: Monthly payroll is ready for review. Approve and disburse staff compensation.",
                is_read=False
            )
    return None


def trigger_daily_reconciliation_signoff(reconciliation):
    """
    Daily Reconciliation Sign-Off:
    Notification confirming the daily shift has been closed and locked by the manager.
    """
    if not reconciliation or not reconciliation.tenant:
        return None

    tenant = reconciliation.tenant
    disc = float(reconciliation.cash_discrepancy)
    disc_text = f"Discrepancy: KES {disc:,.2f}" if disc != 0 else "Drawer is perfectly balanced."

    notif = Notification.objects.create(
        tenant=tenant,
        type="reconciliation",
        title=f"🔒 Daily Shift Reconciled ({reconciliation.date})",
        message=f"Register drawer closed for {reconciliation.date}. Actual Cash: KES {float(reconciliation.actual_cash):,.2f}. {disc_text}",
        is_read=False
    )

    # Send closeout digest email to owner
    try:
        send_daily_business_closeout_email(tenant)
    except Exception:
        pass

    return notif


# ==============================================================================
# 3. COMPREHENSIVE RUNNER (Called on schedule, API polling, or checkout)
# ==============================================================================

def run_all_background_checks(tenant):
    """
    Runs both instant and time-based automated background triggers.
    """
    if not tenant:
        return []

    created_notifications = []

    # 1. Product stock checks
    for prod in Product.objects.filter(tenant=tenant, is_active=True):
        n = trigger_low_stock_notification(prod)
        if n:
            created_notifications.append(n)

    # 2. Customer credit checks
    for cust in Customer.objects.filter(tenant=tenant):
        n = trigger_credit_limit_notification(cust, tenant)
        if n:
            created_notifications.append(n)

    # 3. Staff quota checks
    for staff in StaffMember.objects.filter(tenant=tenant, status="active"):
        n = trigger_quota_achievement_notification(staff, tenant)
        if n:
            created_notifications.append(n)

    # 4. Morning replenishment check
    n_morn = trigger_morning_replenishment_check(tenant)
    if n_morn:
        created_notifications.append(n_morn)

    # 5. Evening till closeout check
    n_rec = trigger_daily_reconciliation_check(tenant)
    if n_rec:
        created_notifications.append(n_rec)

    # 6. End of month payroll check
    n_pay = trigger_end_of_month_payroll_check(tenant)
    if n_pay:
        created_notifications.append(n_pay)

    return created_notifications
