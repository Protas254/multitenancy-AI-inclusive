import { PayrollRun, PayrollItem } from "../types";
import { INITIAL_PAYROLL_RUN, INITIAL_STAFF } from "../mock/initialData";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const payrollApi = {
  async getPayrollRuns(tenantId: string = "tenant-fashion"): Promise<PayrollRun[]> {
    const stored = apiClient.getStorage<PayrollRun[]>("payroll_runs", [INITIAL_PAYROLL_RUN]);
    return stored.filter((p) => p.tenantId === tenantId);
  },

  async getCurrentRun(tenantId: string = "tenant-fashion"): Promise<PayrollRun> {
    const runs = await this.getPayrollRuns(tenantId);
    if (runs.length > 0) return runs[0];

    // Generate fallback from staff
    const staff = apiClient.getStorage("staff", INITIAL_STAFF).filter((s: any) => s.tenantId === tenantId);
    const items: PayrollItem[] = staff.map((s: any) => {
      const basic = s.basicSalary;
      const commission = Math.round((s.salesThisMonth * (s.commissionRate || 0)) / 100);
      const allowances = 5000;
      const deductions = Math.round(basic * 0.08); // rough tax/statutory
      const gross = basic + commission + allowances;
      return {
        id: generateId("pi"),
        staffId: s.id,
        staffName: s.name,
        role: s.role,
        basicSalary: basic,
        allowances,
        overtime: 0,
        commission,
        grossPay: gross,
        deductions,
        netPay: gross - deductions,
        status: "pending",
      };
    });

    const totalGross = items.reduce((acc, i) => acc + i.grossPay, 0);
    const totalDeductions = items.reduce((acc, i) => acc + i.deductions, 0);

    return {
      id: generateId("pr"),
      tenantId,
      periodMonth: "September 2026",
      totalEmployees: items.length,
      totalGross,
      totalDeductions,
      totalNet: totalGross - totalDeductions,
      status: "draft",
      items,
    };
  },

  async approvePayroll(id: string, approverName: string = "John Kamau"): Promise<PayrollRun> {
    const runs = apiClient.getStorage<PayrollRun[]>("payroll_runs", [INITIAL_PAYROLL_RUN]);
    const index = runs.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Payroll run not found");

    runs[index].status = "approved";
    runs[index].approvedBy = approverName;
    runs[index].approvedDate = new Date().toISOString();
    runs[index].items.forEach((i) => (i.status = "approved"));

    apiClient.setStorage("payroll_runs", runs);
    return runs[index];
  },

  async markPaid(id: string): Promise<PayrollRun> {
    const runs = apiClient.getStorage<PayrollRun[]>("payroll_runs", [INITIAL_PAYROLL_RUN]);
    const index = runs.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Payroll run not found");

    runs[index].status = "paid";
    runs[index].items.forEach((i) => {
      i.status = "paid";
      i.paymentDate = new Date().toISOString();
      i.paymentMethod = "mpesa";
    });

    apiClient.setStorage("payroll_runs", runs);
    return runs[index];
  },
};
