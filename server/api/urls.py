from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet, CategoryViewSet, SupplierViewSet, ProductViewSet,
    CustomerViewSet, SaleViewSet, ExpenseViewSet, StaffMemberViewSet,
    PayrollRecordViewSet, TargetViewSet, NotificationViewSet,
    DailyReconciliationViewSet, CreditAccountViewSet, CreditPaymentViewSet,
    StockMovementViewSet, InvoiceViewSet, PurchaseViewSet,
    LoyaltyRewardViewSet, LoyaltyTransactionViewSet, SaaSPlanViewSet,
    login_view, register_view, current_user_view, monthly_reconciliation_report,
    admin_platform_stats, saas_plans_view, dashboard_stats_view
)

router = DefaultRouter()
router.register(r"tenants", TenantViewSet, basename="tenant")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"sales", SaleViewSet, basename="sale")
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"staff", StaffMemberViewSet, basename="staff")
router.register(r"payroll", PayrollRecordViewSet, basename="payroll")
router.register(r"targets", TargetViewSet, basename="target")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"reconciliations", DailyReconciliationViewSet, basename="reconciliation")
router.register(r"credit-accounts", CreditAccountViewSet, basename="credit-account")
router.register(r"credit-payments", CreditPaymentViewSet, basename="credit-payment")
router.register(r"stock-movements", StockMovementViewSet, basename="stock-movement")
router.register(r"purchases", PurchaseViewSet, basename="purchase")
router.register(r"loyalty-rewards", LoyaltyRewardViewSet, basename="loyalty-reward")
router.register(r"loyalty-transactions", LoyaltyTransactionViewSet, basename="loyalty-transaction")
router.register(r"plans-admin", SaaSPlanViewSet, basename="saas-plan-admin")

urlpatterns = [
    path("auth/login/", login_view, name="auth_login"),
    path("auth/register/", register_view, name="auth_register"),
    path("auth/me/", current_user_view, name="auth_me"),
    path("reports/monthly-reconciliation/", monthly_reconciliation_report, name="monthly_reconciliation_report"),
    path("admin/stats/", admin_platform_stats, name="admin_platform_stats"),
    path("plans/", saas_plans_view, name="saas_plans"),
    path("dashboard/stats/", dashboard_stats_view, name="dashboard_stats"),
    path("", include(router.urls)),
]
