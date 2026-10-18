import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AppLayout from "./pages/app/AppLayout";
import AuthLayout from "./pages/auth/AuthLayout";

// Landing and General
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

// Onboarding
import OnboardingPage from "./pages/onboarding/OnboardingPage";

// App Modules
import DashboardPage from "./pages/app/DashboardPage";
import PosPage from "./pages/app/PosPage";
import InventoryPage from "./pages/app/InventoryPage";
import ProductsPage from "./pages/app/ProductsPage";
import ProductDetailPage from "./pages/app/ProductDetailPage";
import SalesPage from "./pages/app/SalesPage";
import SaleDetailPage from "./pages/app/SaleDetailPage";
import InvoicesPage from "./pages/app/InvoicesPage";
import NewInvoicePage from "./pages/app/NewInvoicePage";
import InvoiceDetailPage from "./pages/app/InvoiceDetailPage";
import CustomersPage from "./pages/app/CustomersPage";
import CustomerDetailPage from "./pages/app/CustomerDetailPage";
import SuppliersPage from "./pages/app/SuppliersPage";
import SupplierDetailPage from "./pages/app/SupplierDetailPage";
import StaffPage from "./pages/app/StaffPage";
import StaffDetailPage from "./pages/app/StaffDetailPage";
import ExpensesPage from "./pages/app/ExpensesPage";
import PurchasesPage from "./pages/app/PurchasesPage";
import CreditPage from "./pages/app/CreditPage";
import PayrollPage from "./pages/app/PayrollPage";
import LoyaltyPage from "./pages/app/LoyaltyPage";
import TargetsPage from "./pages/app/TargetsPage";
import ReportsPage from "./pages/app/ReportsPage";
import ReconciliationReportsPage from "./pages/app/ReconciliationReportsPage";
import NotificationsPage from "./pages/app/NotificationsPage";
import SettingsPage from "./pages/app/SettingsPage";

import { ProtectedModuleRoute } from "./components/auth/ProtectedModuleRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing and About */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Admin Route - Redirect to Dashboard */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

        {/* Onboarding Flow - Redirect to Dashboard */}
        <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />

        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Core SaaS App Routes */}
        <Route element={<AppLayout />}>
          {/* Operations Available to all roles with their specific views */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/:id" element={<SaleDetailPage />} />

          {/* Customer CRM and Invoices */}
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route
            path="/invoices"
            element={
              <ProtectedModuleRoute module="invoices">
                <InvoicesPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/invoices/new"
            element={
              <ProtectedModuleRoute module="invoices" action="create">
                <NewInvoicePage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <ProtectedModuleRoute module="invoices">
                <InvoiceDetailPage />
              </ProtectedModuleRoute>
            }
          />

          {/* Protected Financial & Wholesale Management Areas */}
          <Route
            path="/purchases"
            element={
              <ProtectedModuleRoute module="purchases">
                <PurchasesPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedModuleRoute module="suppliers">
                <SuppliersPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/suppliers/:id"
            element={
              <ProtectedModuleRoute module="suppliers">
                <SupplierDetailPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedModuleRoute module="expenses">
                <ExpensesPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/credit"
            element={
              <ProtectedModuleRoute module="credit">
                <CreditPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedModuleRoute module="payroll">
                <PayrollPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedModuleRoute module="staff">
                <StaffPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/staff/:id"
            element={
              <ProtectedModuleRoute module="staff">
                <StaffDetailPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/targets"
            element={
              <ProtectedModuleRoute module="targets">
                <TargetsPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/loyalty"
            element={
              <ProtectedModuleRoute module="loyalty" minPlan="growth">
                <LoyaltyPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedModuleRoute module="reports">
                <ReportsPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/reports/closing"
            element={
              <ProtectedModuleRoute module="reports">
                <ReconciliationReportsPage />
              </ProtectedModuleRoute>
            }
          />
          <Route
            path="/closing-reports"
            element={
              <ProtectedModuleRoute module="reports">
                <ReconciliationReportsPage />
              </ProtectedModuleRoute>
            }
          />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route
            path="/settings"
            element={
              <ProtectedModuleRoute module="settings">
                <SettingsPage />
              </ProtectedModuleRoute>
            }
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
