from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet, CategoryViewSet, SupplierViewSet, ProductViewSet,
    CustomerViewSet, SaleViewSet, ExpenseViewSet, StaffMemberViewSet,
    PayrollRecordViewSet, TargetViewSet, NotificationViewSet,
    DailyReconciliationViewSet,
    login_view, register_view, current_user_view, monthly_reconciliation_report
)

router = DefaultRouter()
router.register(r"tenants", TenantViewSet, basename="tenant")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"sales", SaleViewSet, basename="sale")
router.register(r"invoices", SaleViewSet, basename="invoice")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"staff", StaffMemberViewSet, basename="staff")
router.register(r"payroll", PayrollRecordViewSet, basename="payroll")
router.register(r"targets", TargetViewSet, basename="target")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"reconciliations", DailyReconciliationViewSet, basename="reconciliation")

urlpatterns = [
    path("auth/login/", login_view, name="auth_login"),
    path("auth/register/", register_view, name="auth_register"),
    path("auth/me/", current_user_view, name="auth_me"),
    path("reports/monthly-reconciliation/", monthly_reconciliation_report, name="monthly_reconciliation_report"),
    path("", include(router.urls)),
]
