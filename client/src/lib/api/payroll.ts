import { PayrollRun } from "../types";
import { apiClient } from "./client";

export const payrollApi = {
  async getPayrollRuns(_tenantId?: string): Promise<PayrollRun[]> {
    try {
      const data = await apiClient.get<any[]>("/payroll/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching payroll:", err);
      return [];
    }
  },

  async getCurrentRun(tenantId?: string): Promise<PayrollRun> {
    const runs = await this.getPayrollRuns(tenantId);
    if (runs.length > 0) return runs[0];

    return {
      id: "pr-new",
      tenantId: tenantId || "",
      periodMonth: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
      totalEmployees: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      status: "draft",
      items: [],
    };
  },

  async approvePayroll(id: string, approverName: string = "Owner"): Promise<PayrollRun> {
    try {
      return await apiClient.patch<PayrollRun>(`/payroll/${id}/`, {
        status: "approved",
        approvedBy: approverName,
        approvedDate: new Date().toISOString(),
      });
    } catch {
      return {
        id,
        tenantId: "",
        periodMonth: "Current",
        totalEmployees: 0,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        status: "approved",
        items: [],
      };
    }
  },

  async markPaid(id: string): Promise<PayrollRun> {
    try {
      return await apiClient.patch<PayrollRun>(`/payroll/${id}/`, {
        status: "paid",
        paymentDate: new Date().toISOString(),
      });
    } catch {
      return {
        id,
        tenantId: "",
        periodMonth: "Current",
        totalEmployees: 0,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        status: "paid",
        items: [],
      };
    }
  },
};
