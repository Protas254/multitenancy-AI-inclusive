import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

logger = logging.getLogger("stockgrid.emails")

def _send_html_email(subject, recipient_email, text_content, html_content):
    """Safely dispatches an HTML email with text fallback without breaking caller on network failure."""
    if not recipient_email or "@" not in recipient_email:
        logger.warning(f"[StockGrid Email] Skipping email '{subject}' - invalid recipient: {recipient_email}")
        return False

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "StockGrid Cloud <stockgridke@gmail.com>")
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"[StockGrid Email] Successfully sent '{subject}' to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"[StockGrid Email] Error sending '{subject}' to {recipient_email}: {e}")
        return False


def _get_base_template(title, preheader, body_html, footer_note="StockGrid Multi-Tenant Retail Cloud • 24/7 Support: 0743849304"):
    """Returns a responsive HTML email layout with StockGrid styling."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }}
    .container {{ max-width: 600px; margin: 24px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }}
    .header {{ background: #0f172a; padding: 24px 32px; text-align: left; }}
    .logo {{ color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }}
    .logo-badge {{ background: #2563eb; color: #ffffff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; }}
    .body {{ padding: 32px; font-size: 14px; line-height: 1.6; color: #334155; }}
    .badge {{ display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }}
    .badge-info {{ background: #eff6ff; color: #1d4ed8; }}
    .badge-success {{ background: #ecfdf5; color: #047857; }}
    .badge-warning {{ background: #fffbeb; color: #b45309; }}
    .badge-danger {{ background: #fef2f2; color: #b91c1c; }}
    .stat-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }}
    .stat-val {{ font-size: 22px; font-weight: 800; color: #0f172a; font-family: monospace; }}
    .stat-lbl {{ font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }}
    .btn {{ display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 13px; margin-top: 16px; }}
    .footer {{ background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #64748b; text-align: center; }}
    table.data-table {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }}
    table.data-table th {{ background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 700; color: #475569; font-size: 11px; text-transform: uppercase; }}
    table.data-table td {{ padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    {preheader}
  </div>
  <div class="container">
    <div class="header">
      <div class="logo">
        StockGrid <span class="logo-badge">Retail Cloud</span>
      </div>
    </div>
    <div class="body">
      {body_html}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">{footer_note}</p>
      <p style="margin: 0; color: #94a3b8;">Nairobi, Kenya • Email: stockgridke@gmail.com • Hours: 24/7</p>
    </div>
  </div>
</body>
</html>"""


# ==============================================================================
# 1. MERCHANT / STORE OWNER EMAILS
# ==============================================================================

def send_welcome_store_setup_email(user, tenant, temp_password=None):
    """Sent upon registration with store URL, admin login credentials, and onboarding checklist."""
    subject = f"🎉 Welcome to StockGrid: {tenant.name} is Ready!"
    recipient = user.email or tenant.email
    pwd_info = f"<p><strong>Initial Password:</strong> <code>{temp_password}</code></p>" if temp_password else ""

    body = f"""
      <span class="badge badge-success">Account Provisioned</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Welcome to StockGrid, {user.name}!</h2>
      <p>Your multi-tenant store <strong>{tenant.name}</strong> is now live and configured on StockGrid Retail Cloud.</p>

      <div class="stat-card">
        <p style="margin: 0 0 8px 0;"><strong>Store ID:</strong> <code>{tenant.id}</code></p>
        <p style="margin: 0 0 8px 0;"><strong>Login Email:</strong> {user.email}</p>
        {pwd_info}
        <p style="margin: 0;"><strong>Workspace URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
      </div>

      <h3 style="color: #0f172a; margin-top: 24px;">🚀 Quick-Start Checklist:</h3>
      <ol style="padding-left: 20px; line-height: 1.8;">
        <li><strong>Add Your Products</strong>: Upload your SKU catalog or use barcode auto-entry.</li>
        <li><strong>Provision Cashiers</strong>: Add your team in Staff &amp; Team with assigned roles.</li>
        <li><strong>Start Selling</strong>: Launch POS Terminal to record fast M-Pesa &amp; Cash sales.</li>
        <li><strong>Reconcile Daily</strong>: Perform till closeouts at the end of each shift.</li>
      </ol>

      <a href="http://localhost:3000/dashboard" class="btn">Launch Business Dashboard &rarr;</a>
    """
    text = f"Welcome to StockGrid! Your store {tenant.name} is ready. Login at http://localhost:3000/login using {user.email}."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, "Your store workspace is ready", body))


def send_daily_business_closeout_email(tenant):
    """Summary of the day's revenue, Cash vs M-Pesa split, net profit, total transactions, and till discrepancies."""
    today = timezone.now().date()
    sales = Sale.objects.filter(tenant=tenant, created_at__date=today, payment_status="paid")
    total_rev = float(sales.aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
    cash_rev = float(sales.filter(payment_method="cash").aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
    mpesa_rev = float(sales.filter(payment_method="mpesa").aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
    tx_count = sales.count()

    # Till reconciliation discrepancy
    from .models import DailyReconciliation
    rec = DailyReconciliation.objects.filter(tenant=tenant, date=today).first()
    discrepancy_badge = "<span class='badge badge-success'>Balanced</span>"
    if rec and abs(float(rec.cash_discrepancy)) > 0:
        discrepancy_badge = f"<span class='badge badge-danger'>Discrepancy: KES {rec.cash_discrepancy:,.2f}</span>"

    subject = f"📊 Daily Closeout Digest: {tenant.name} ({today.strftime('%d %b %Y')})"
    recipient = tenant.email or (tenant.memberships.filter(role="owner").first().user.email if tenant.memberships.filter(role="owner").exists() else None)

    body = f"""
      <span class="badge badge-info">End of Day Closeout</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Daily Business Summary</h2>
      <p>Here is your daily trading digest for <strong>{tenant.name}</strong> on {today.strftime('%A, %d %B %Y')}:</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
        <div class="stat-card" style="margin: 0;">
          <div class="stat-lbl">Total Daily Revenue</div>
          <div class="stat-val">KES {total_rev:,.2f}</div>
        </div>
        <div class="stat-card" style="margin: 0;">
          <div class="stat-lbl">Total Transactions</div>
          <div class="stat-val">{tx_count} sales</div>
        </div>
      </div>

      <table class="data-table">
        <tr><th>Channel / Tender</th><th>Amount Collected</th></tr>
        <tr><td><strong>M-Pesa Collections</strong></td><td>KES {mpesa_rev:,.2f}</td></tr>
        <tr><td><strong>Cash in Drawer</strong></td><td>KES {cash_rev:,.2f}</td></tr>
        <tr><td><strong>Cash Drawer Status</strong></td><td>{discrepancy_badge}</td></tr>
      </table>

      <a href="http://localhost:3000/reports" class="btn">View Full Financial Report &rarr;</a>
    """
    text = f"Daily Summary for {tenant.name}: Total Revenue KES {total_rev:,.2f} across {tx_count} transactions."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, f"Daily Revenue: KES {total_rev:,.2f}", body))


def send_critical_low_stock_email(tenant, product):
    """Sent immediately when fast-moving items reach 0 or drop below the minimum stock threshold."""
    subject = f"🚨 Critical Stock Alert: {product.name} ({product.current_stock} left)"
    recipient = tenant.email or (tenant.memberships.filter(role="owner").first().user.email if tenant.memberships.filter(role="owner").exists() else None)

    status_tag = "OUT OF STOCK" if product.current_stock <= 0 else f"{product.current_stock} Units Left"
    badge_cls = "badge-danger" if product.current_stock <= 0 else "badge-warning"
    supplier_info = f"<p><strong>Preferred Supplier:</strong> {product.supplier.name} ({product.supplier.phone})</p>" if getattr(product, "supplier", None) else ""

    body = f"""
      <span class="badge {badge_cls}">{status_tag}</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Replenishment Required</h2>
      <p>Inventory for <strong>{product.name}</strong> (SKU: <code>{product.sku}</code>) has dropped below its safe threshold.</p>

      <div class="stat-card">
        <div class="stat-lbl">Current On-Hand Stock</div>
        <div class="stat-val" style="color: {'#b91c1c' if product.current_stock <= 0 else '#b45309'};">{product.current_stock} units</div>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Minimum Safe Threshold: {product.min_stock_level} units</p>
      </div>

      {supplier_info}
      <a href="http://localhost:3000/inventory" class="btn">Open Inventory &amp; Restock &rarr;</a>
    """
    text = f"Critical Stock Alert for {product.name}: {product.current_stock} units remaining. Please reorder."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, f"{product.name} is running out of stock", body))


def send_weekly_performance_report_email(tenant):
    """Sent Monday morning: Week-over-week revenue growth, profit margin health, and top selling items."""
    now = timezone.now()
    week_start = now - timezone.timedelta(days=7)
    sales = Sale.objects.filter(tenant=tenant, created_at__gte=week_start, payment_status="paid")
    weekly_rev = float(sales.aggregate(Sum("total_amount"))["total_amount__sum"] or 0)
    tx_count = sales.count()

    subject = f"📈 Weekly Performance Digest: {tenant.name}"
    recipient = tenant.email or (tenant.memberships.filter(role="owner").first().user.email if tenant.memberships.filter(role="owner").exists() else None)

    body = f"""
      <span class="badge badge-info">Weekly Executive Digest</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Weekly Performance Overview</h2>
      <p>Here is your weekly financial performance snapshot for <strong>{tenant.name}</strong> over the past 7 days:</p>

      <div class="stat-card">
        <div class="stat-lbl">7-Day Gross Revenue</div>
        <div class="stat-val">KES {weekly_rev:,.2f}</div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Total Completed Checkouts: {tx_count}</p>
      </div>

      <p>Keep your catalog updated and review staff sales quotas to maintain momentum this week.</p>
      <a href="http://localhost:3000/reports" class="btn">View Analytics Dashboard &rarr;</a>
    """
    text = f"Weekly Performance Digest for {tenant.name}: KES {weekly_rev:,.2f} generated across {tx_count} sales."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, f"Weekly Revenue: KES {weekly_rev:,.2f}", body))


def send_subscription_receipt_email(tenant, plan_name, amount, mpesa_ref=None):
    """Reminder or payment confirmation receipt with invoice details."""
    ref_str = mpesa_ref or f"MPESA-{timezone.now().strftime('%Y%m%d%H%M')}"
    subject = f"🧾 StockGrid Subscription Receipt: {plan_name} (KES {amount:,.2f})"
    recipient = tenant.email or (tenant.memberships.filter(role="owner").first().user.email if tenant.memberships.filter(role="owner").exists() else None)

    body = f"""
      <span class="badge badge-success">Payment Received</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Subscription Renewed Successfully</h2>
      <p>Thank you for subscribing to StockGrid Retail Cloud for <strong>{tenant.name}</strong>.</p>

      <table class="data-table">
        <tr><th>Description</th><th>Details</th></tr>
        <tr><td><strong>Subscription Plan</strong></td><td>{plan_name}</td></tr>
        <tr><td><strong>Amount Paid</strong></td><td>KES {amount:,.2f}</td></tr>
        <tr><td><strong>Payment Reference</strong></td><td><code>{ref_str}</code></td></tr>
        <tr><td><strong>Billing Period</strong></td><td>30 Days (Active)</td></tr>
      </table>

      <p style="font-size: 12px; color: #64748b;">Your multi-tenant store license is active with full 24/7 cloud backup and support.</p>
      <a href="http://localhost:3000/dashboard" class="btn">Open App Workspace &rarr;</a>
    """
    text = f"StockGrid subscription receipt for {tenant.name}: {plan_name} - KES {amount:,.2f}. Ref: {ref_str}."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, f"Payment Receipt: KES {amount:,.2f}", body))


def send_suspicious_activity_email(tenant, alert_title, alert_details):
    """Immediate alert if Manager PIN is entered incorrectly 3+ times or multiple high-value cart voids occur."""
    subject = f"⚠️ Security Alert: {alert_title} - {tenant.name}"
    recipient = tenant.email or (tenant.memberships.filter(role="owner").first().user.email if tenant.memberships.filter(role="owner").exists() else None)

    body = f"""
      <span class="badge badge-danger">Security &amp; Loss Prevention</span>
      <h2 style="margin-top: 4px; color: #b91c1c;">{alert_title}</h2>
      <p>An anomalous event was flagged on your store POS terminal:</p>

      <div class="stat-card" style="border-left: 4px solid #b91c1c;">
        <p style="margin: 0; font-size: 13px; color: #334155;">{alert_details}</p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">Timestamp: {timezone.now().strftime('%d %b %Y, %I:%M %p')}</p>
      </div>

      <p style="font-size: 12px; color: #64748b;">If this was authorized by a store manager, no action is needed. Otherwise, review your till audit log.</p>
      <a href="http://localhost:3000/sales" class="btn">Audit Sales &amp; Logs &rarr;</a>
    """
    text = f"Security Alert for {tenant.name}: {alert_title}. {alert_details}"
    return _send_html_email(subject, recipient, text, _get_base_template(subject, alert_title, body))


# ==============================================================================
# 2. STAFF MEMBER EMAILS
# ==============================================================================

def send_staff_welcome_activation_email(staff_member, temp_password, role, tenant):
    """Sent when the owner creates an employee account, containing login username, role, and temporary password."""
    subject = f"🔑 Welcome to {tenant.name}: Your Staff Login Credentials"
    recipient = staff_member.email

    body = f"""
      <span class="badge badge-info">Staff Account Created</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Welcome to the Team, {staff_member.name}!</h2>
      <p>An employee account has been created for you at <strong>{tenant.name}</strong> on StockGrid.</p>

      <div class="stat-card">
        <p style="margin: 0 0 6px 0;"><strong>Username / Email:</strong> {staff_member.email}</p>
        <p style="margin: 0 0 6px 0;"><strong>Assigned Role:</strong> <span style="text-transform: capitalize;">{role}</span></p>
        <p style="margin: 0;"><strong>Initial Password:</strong> <code>{temp_password}</code></p>
      </div>

      <p>You can use these credentials to log in to the POS terminal, ring up customer sales, and track your daily performance.</p>
      <a href="http://localhost:3000/login" class="btn">Log In to POS Terminal &rarr;</a>
    """
    text = f"Your staff account for {tenant.name} has been created. Username: {staff_member.email}, Password: {temp_password}. Log in at http://localhost:3000/login."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, "Your employee credentials are ready", body))


def send_monthly_payslip_email(payroll_record):
    """Breakdown of base salary, sales commissions earned, deductions, and net payout."""
    staff = payroll_record.staff
    tenant = payroll_record.tenant
    subject = f"💵 Payslip Notification: {payroll_record.month} - {staff.name}"
    recipient = staff.email

    body = f"""
      <span class="badge badge-success">Compensation Advice</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Payslip for {payroll_record.month}</h2>
      <p>Dear {staff.name}, here is your compensation statement from <strong>{tenant.name}</strong>:</p>

      <table class="data-table">
        <tr><th>Earning / Deduction Item</th><th>Amount</th></tr>
        <tr><td>Base Monthly Salary</td><td>KES {float(payroll_record.base_salary):,.2f}</td></tr>
        <tr><td>Commissions &amp; Bonuses</td><td>+ KES {float(payroll_record.bonus):,.2f}</td></tr>
        <tr><td>Statutory / Other Deductions</td><td>- KES {float(payroll_record.deductions):,.2f}</td></tr>
        <tr style="background: #f8fafc; font-weight: 800;">
          <td><strong>NET DISBURSEMENT</strong></td>
          <td style="color: #047857; font-size: 15px;">KES {float(payroll_record.net_salary):,.2f}</td>
        </tr>
      </table>

      <p style="font-size: 11px; color: #64748b;">Payment Status: <strong>{payroll_record.status.upper()}</strong></p>
    """
    text = f"Payslip for {payroll_record.month}: Net payout KES {float(payroll_record.net_salary):,.2f}."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, f"Payslip {payroll_record.month}: KES {float(payroll_record.net_salary):,.2f}", body))


def send_target_achievement_email(staff_member, target_quota, sales_total):
    """Automatic cheer email when a salesperson hits 100% of their monthly revenue quota."""
    subject = f"🎉 Congratulations {staff_member.name}: Monthly Sales Target Achieved!"
    recipient = staff_member.email

    body = f"""
      <span class="badge badge-success">Milestone Reached</span>
      <h2 style="margin-top: 4px; color: #0f172a;">You Hit 100% of Your Target! 🎯</h2>
      <p>Outstanding performance, {staff_member.name}! You have officially achieved your monthly sales quota for <strong>{staff_member.tenant.name}</strong>.</p>

      <div class="stat-card">
        <div class="stat-lbl">Total Sales Closed</div>
        <div class="stat-val" style="color: #047857;">KES {sales_total:,.2f}</div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Assigned Quota: KES {target_quota:,.2f}</p>
      </div>

      <p>Your dedication drives the store's success. Your commission for hitting this quota will reflect on your monthly payslip.</p>
    """
    text = f"Congratulations {staff_member.name}! You achieved your monthly sales quota of KES {target_quota:,.2f} with KES {sales_total:,.2f} in sales."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, "Sales Target Achieved!", body))


# ==============================================================================
# 3. CUSTOMER & SUPPLIER EMAILS
# ==============================================================================

def send_digital_sales_receipt_email(sale):
    """Sent immediately after checkout if customer email is captured."""
    customer_email = None
    if getattr(sale, "customer", None) and sale.customer.email:
        customer_email = sale.customer.email

    if not customer_email:
        return False

    tenant = sale.tenant
    subject = f"🧾 Receipt for Sale {sale.invoice_number} - {tenant.name}"

    items_html = ""
    for it in sale.items.all():
        items_html += f"<tr><td>{it.product_name} &times; {it.quantity}</td><td style='text-align:right;'>KES {float(it.subtotal):,.2f}</td></tr>"

    vat_amount = round(float(sale.total_amount) * 0.16 / 1.16, 2)

    body = f"""
      <span class="badge badge-success">E-Receipt</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Thank you for your purchase!</h2>
      <p>Here is your digital sales receipt from <strong>{tenant.name}</strong>:</p>

      <div class="stat-card" style="margin-bottom: 12px;">
        <p style="margin: 0 0 4px 0;"><strong>Receipt No:</strong> {sale.invoice_number}</p>
        <p style="margin: 0 0 4px 0;"><strong>Date:</strong> {sale.created_at.strftime('%d %b %Y, %I:%M %p')}</p>
        <p style="margin: 0;"><strong>Served By:</strong> {sale.cashier_name}</p>
      </div>

      <table class="data-table">
        <tr><th>Item / Qty</th><th style="text-align:right;">Subtotal</th></tr>
        {items_html}
        <tr><td>VAT (16% Inclusive)</td><td style="text-align:right;">KES {vat_amount:,.2f}</td></tr>
        <tr style="background:#f8fafc; font-weight:800; font-size:14px;">
          <td>Total Paid ({sale.payment_method.upper()})</td>
          <td style="text-align:right; color:#0f172a;">KES {float(sale.total_amount):,.2f}</td>
        </tr>
      </table>

      <p style="font-size: 11px; text-align: center; color: #64748b; margin-top: 20px;">
        {tenant.address or 'Thank you for shopping with us!'}
      </p>
    """
    text = f"Receipt {sale.invoice_number} from {tenant.name}: KES {float(sale.total_amount):,.2f}. Thank you for your business!"
    return _send_html_email(subject, customer_email, text, _get_base_template(subject, f"Receipt for KES {float(sale.total_amount):,.2f}", body))


def send_credit_due_reminder_email(customer, credit_account):
    """Polite notification 3 days before credit debt is due, with M-Pesa Paybill / Till instructions."""
    if not customer.email:
        return False

    tenant = credit_account.tenant
    subject = f"📅 Friendly Reminder: Account Balance Due - {tenant.name}"

    body = f"""
      <span class="badge badge-warning">Payment Reminder</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Upcoming Account Balance Due</h2>
      <p>Dear {customer.name},</p>
      <p>This is a polite reminder that your credit balance of <strong>KES {float(credit_account.balance_due):,.2f}</strong> with <strong>{tenant.name}</strong> is due for settlement.</p>

      <div class="stat-card">
        <div class="stat-lbl">Outstanding Balance</div>
        <div class="stat-val" style="color: #b45309;">KES {float(credit_account.balance_due):,.2f}</div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Due Date: {credit_account.due_date.strftime('%d %b %Y') if credit_account.due_date else 'Immediate'}</p>
      </div>

      <p>To settle via M-Pesa, please use store number <strong>{tenant.phone or 'Contact Store'}</strong> or visit our counter.</p>
    """
    text = f"Reminder from {tenant.name}: Your credit balance of KES {float(credit_account.balance_due):,.2f} is due for settlement."
    return _send_html_email(subject, customer.email, text, _get_base_template(subject, "Credit Balance Reminder", body))


def send_overdue_debt_notice_email(customer, credit_account):
    """Follow-up email when customer credit balance passes the agreed due date."""
    if not customer.email:
        return False

    tenant = credit_account.tenant
    subject = f"⚠️ Overdue Notice: Immediate Settlement Required - {tenant.name}"

    body = f"""
      <span class="badge badge-danger">Overdue Notice</span>
      <h2 style="margin-top: 4px; color: #b91c1c;">Account Balance Overdue</h2>
      <p>Dear {customer.name},</p>
      <p>Your credit account with <strong>{tenant.name}</strong> currently has an overdue balance of <strong>KES {float(credit_account.balance_due):,.2f}</strong>.</p>

      <div class="stat-card" style="border-left: 4px solid #b91c1c;">
        <div class="stat-lbl">Overdue Balance</div>
        <div class="stat-val" style="color: #b91c1c;">KES {float(credit_account.balance_due):,.2f}</div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Please clear this balance to keep your credit line in good standing.</p>
      </div>

      <p>Please contact store management at {tenant.phone or 'the store'} for payment arrangements.</p>
    """
    text = f"Overdue Notice from {tenant.name}: Your balance of KES {float(credit_account.balance_due):,.2f} is overdue. Please settle immediately."
    return _send_html_email(subject, customer.email, text, _get_base_template(subject, "Overdue Account Balance", body))


def send_credit_payment_confirmation_email(customer, amount_paid, remaining_balance, tenant):
    """Instant receipt acknowledging partial or full debt settlement with remaining balance."""
    if not customer or not customer.email:
        return False

    status_txt = "Debt Fully Cleared 🎉" if remaining_balance <= 0 else f"Remaining Balance: KES {remaining_balance:,.2f}"
    badge_cls = "badge-success" if remaining_balance <= 0 else "badge-info"
    subject = f"✅ Payment Confirmation: KES {amount_paid:,.2f} Received - {tenant.name}"

    body = f"""
      <span class="badge {badge_cls}">Payment Received</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Credit Payment Receipt</h2>
      <p>Dear {customer.name},</p>
      <p>We confirm receipt of your credit repayment of <strong>KES {amount_paid:,.2f}</strong> for <strong>{tenant.name}</strong>.</p>

      <div class="stat-card">
        <div class="stat-lbl">Payment Status</div>
        <div class="stat-val" style="color: #047857;">{status_txt}</div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Payment Date: {timezone.now().strftime('%d %b %Y, %I:%M %p')}</p>
      </div>

      <p>Thank you for keeping your account in good standing.</p>
    """
    text = f"Payment confirmation from {tenant.name}: KES {amount_paid:,.2f} received. Remaining balance: KES {remaining_balance:,.2f}."
    return _send_html_email(subject, customer.email, text, _get_base_template(subject, f"Payment Received: KES {amount_paid:,.2f}", body))


def send_formal_b2b_tax_invoice_email(invoice):
    """Downloadable formal tax invoice for corporate B2B purchases."""
    recipient = invoice.customer_email
    if not recipient and invoice.customer and invoice.customer.email:
        recipient = invoice.customer.email

    if not recipient:
        return False

    tenant = invoice.tenant
    subject = f"📄 Tax Invoice {invoice.invoice_number} from {tenant.name}"

    items_html = ""
    for it in invoice.items.all():
        items_html += f"<tr><td>{it.product_name} &times; {it.quantity}</td><td style='text-align:right;'>KES {float(it.subtotal):,.2f}</td></tr>"

    body = f"""
      <span class="badge badge-info">Tax Invoice</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Invoice #{invoice.invoice_number}</h2>
      <p>Please find attached your invoice from <strong>{tenant.name}</strong> for {invoice.customer_name}:</p>

      <table class="data-table">
        <tr><th>Item / Description</th><th style="text-align:right;">Subtotal</th></tr>
        {items_html}
        <tr><td><strong>VAT (16%)</strong></td><td style="text-align:right;">KES {float(invoice.tax_total):,.2f}</td></tr>
        <tr style="background:#f8fafc; font-weight:800;">
          <td>Total Due</td>
          <td style="text-align:right; color:#0f172a;">KES {float(invoice.total_amount):,.2f}</td>
        </tr>
      </table>

      <p><strong>Payment Due Date:</strong> {invoice.due_date.strftime('%d %b %Y') if invoice.due_date else 'Net 30'}</p>
      <a href="http://localhost:3000/invoices/{invoice.id}" class="btn">View &amp; Download PDF Invoice &rarr;</a>
    """
    text = f"Tax Invoice {invoice.invoice_number} from {tenant.name}: Total Due KES {float(invoice.total_amount):,.2f}."
    return _send_html_email(subject, recipient, text, _get_base_template(subject, f"Invoice #{invoice.invoice_number}", body))


def send_supplier_po_email(purchase_order):
    """Automated reorder sheet sent directly to suppliers when stock is depleted."""
    supplier = purchase_order.supplier
    if not supplier or not supplier.email:
        return False

    tenant = purchase_order.tenant
    subject = f"📦 Purchase Order {purchase_order.po_number} from {tenant.name}"

    items_html = ""
    for it in purchase_order.items.all():
        items_html += f"<tr><td>{it.product_name}</td><td>{it.quantity} units</td><td style='text-align:right;'>KES {float(it.unit_cost):,.2f}</td></tr>"

    body = f"""
      <span class="badge badge-info">Purchase Order</span>
      <h2 style="margin-top: 4px; color: #0f172a;">Purchase Order #{purchase_order.po_number}</h2>
      <p>Dear {supplier.name},</p>
      <p>Please process the following inventory replenishment order from <strong>{tenant.name}</strong>:</p>

      <table class="data-table">
        <tr><th>Product</th><th>Quantity</th><th style="text-align:right;">Unit Cost</th></tr>
        {items_html}
        <tr style="background:#f8fafc; font-weight:800;">
          <td colspan="2">Total Order Value</td>
          <td style="text-align:right; color:#0f172a;">KES {float(purchase_order.total_amount):,.2f}</td>
        </tr>
      </table>

      <p><strong>Delivery Address:</strong> {tenant.address or 'Store Receiving Bay'}</p>
      <p><strong>Contact Tel:</strong> {tenant.phone or 'Store Purchasing Officer'}</p>
    """
    text = f"Purchase Order {purchase_order.po_number} from {tenant.name}: Total KES {float(purchase_order.total_amount):,.2f}."
    return _send_html_email(subject, supplier.email, text, _get_base_template(subject, f"PO #{purchase_order.po_number}", body))
