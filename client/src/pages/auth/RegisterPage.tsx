import React, { useState } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Building,
  Sliders,
  Package,
  Users,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Store,
  Plus,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { createTenant } = useTenant();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State across all steps
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Step 2: Business
    businessName: "",
    businessCategory: "Retail Supermarket and Grocery",
    businessPhone: "",
    businessEmail: "",
    location: "Nairobi, Kenya",
    address: "",

    // (Financial settings removed — defaults applied automatically)
    currency: "KES",
    taxRate: 16,
    financialYear: "01-01",
    acceptMpesa: true,
    acceptCash: true,
    acceptCard: true,

    // Step 3: Products
    products: [
      { name: "", buyingPrice: 0, sellingPrice: 0, stock: 10 },
    ],

    // Step 4: Staff
    staff: [
      { name: "", role: "Cashier", phone: "" },
    ],

    // Step 5: Target
    monthlyTarget: 100000,
  });

  const nextStep = () => setStep((s) => Math.min(6, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const addProductRow = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { name: "", buyingPrice: 0, sellingPrice: 0, stock: 10 }],
    }));
  };

  const removeProductRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const addStaffRow = () => {
    setFormData((prev) => ({
      ...prev,
      staff: [...prev.staff, { name: "", role: "Cashier", phone: "" }],
    }));
  };

  const { register } = useAuth();

  const handleFinishSetup = async () => {
    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessName: formData.businessName,
        businessCategory: formData.businessCategory,
        products: formData.products.filter((p) => p.name.trim().length > 0),
      });

      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = [
    "Personal Account",
    "Business Details",
    "Initial Products",
    "Staff Team",
    "Sales Target",
    "Complete",
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Step Progress */}
      {step < 6 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-blue-600">
              Step {step} of 5: {stepTitles[step - 1]}
            </span>
            <span className="text-slate-400 font-medium">{Math.round((step / 5) * 100)}%</span>
          </div>
          <Progress value={step} max={5} />
        </div>
      )}

      {/* STEP 1: Personal Account */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Create your owner account</h2>
            <p className="text-xs text-slate-500 mt-1">
              You will use these credentials to log in and manage your business.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Link href="/login" className="text-xs text-slate-500 hover:underline">
              Already have an account? Log in
            </Link>
            <Button onClick={nextStep} className="gap-1.5 text-xs font-bold">
              <span>Next: Business Info</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Business Profile */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Tell us about your business</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure your primary store or enterprise branch.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Business Name</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Business Category</label>
              <select
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <option value="Retail Supermarket and Grocery">Retail Supermarket and Grocery</option>
                <option value="Fashion and Apparel">Fashion and Apparel</option>
                <option value="Cosmetics and Beauty Care">Cosmetics and Beauty Care</option>
                <option value="Hardware and Building Supplies">Hardware and Building Supplies</option>
                <option value="Pharmacy and Chemist">Pharmacy and Chemist</option>
                <option value="Electronics and Tech">Electronics and Tech</option>
                <option value="Restaurant and Hospitality">Restaurant and Hospitality</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Store City / Region</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Physical Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
            <Button onClick={nextStep} className="gap-1.5 text-xs font-bold">
              <span>Next: Initial Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Initial Products */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Add your first products</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add a few items to immediately start selling in your POS terminal.
            </p>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {formData.products.map((prod, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Product #{idx + 1}</span>
                  {formData.products.length > 1 && (
                    <button
                      onClick={() => removeProductRow(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Product Name</label>
                  <Input
                    placeholder="e.g. Fresh Farm Milk 500ml"
                    value={prod.name}
                    onChange={(e) => {
                      const list = [...formData.products];
                      list[idx].name = e.target.value;
                      setFormData({ ...formData, products: list });
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">Buying Price (KES)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={prod.buyingPrice || ""}
                      onChange={(e) => {
                        const list = [...formData.products];
                        list[idx].buyingPrice = Number(e.target.value);
                        setFormData({ ...formData, products: list });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">Quantity</label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={prod.stock || ""}
                      onChange={(e) => {
                        const list = [...formData.products];
                        list[idx].stock = Number(e.target.value);
                        setFormData({ ...formData, products: list });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">Selling Price (KES)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={prod.sellingPrice || ""}
                      onChange={(e) => {
                        const list = [...formData.products];
                        list[idx].sellingPrice = Number(e.target.value);
                        setFormData({ ...formData, products: list });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={addProductRow} className="w-full gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Another Product</span>
          </Button>

          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
            <Button onClick={nextStep} className="gap-1.5 text-xs font-bold">
              <span>Next: Team and Staff</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Staff Team */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Add Staff Accounts</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add cashiers, storekeepers, or sales representatives.
            </p>
          </div>

          <div className="space-y-2.5">
            {formData.staff.map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Staff Full Name"
                    value={st.name}
                    onChange={(e) => {
                      const list = [...formData.staff];
                      list[idx].name = e.target.value;
                      setFormData({ ...formData, staff: list });
                    }}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={st.phone}
                    onChange={(e) => {
                      const list = [...formData.staff];
                      list[idx].phone = e.target.value;
                      setFormData({ ...formData, staff: list });
                    }}
                  />
                </div>
                <select
                  value={st.role}
                  onChange={(e) => {
                    const list = [...formData.staff];
                    list[idx].role = e.target.value;
                    setFormData({ ...formData, staff: list });
                  }}
                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Salesperson">Salesperson</option>
                  <option value="Storekeeper">Storekeeper</option>
                  <option value="Manager">Store Manager</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={addStaffRow} className="w-full gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Staff Member</span>
          </Button>

          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
            <Button onClick={nextStep} className="gap-1.5 text-xs font-bold">
              <span>Next: Sales Target</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Sales Targets */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Set Monthly Sales Target</h2>
            <p className="text-xs text-slate-500 mt-1">
              Give your team a milestone to work towards this month.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Monthly Target Amount ({formData.currency})
              </label>
              <Input
                type="number"
                value={formData.monthlyTarget}
                onChange={(e) => setFormData({ ...formData, monthlyTarget: Number(e.target.value) })}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-bold">Target Insight:</p>
              <p>
                To achieve this target, your business will need approximately{" "}
                <strong>
                  {formData.currency} {Math.round(formData.monthlyTarget / 30).toLocaleString("en-KE")}
                </strong>{" "}
                in daily sales.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
            <Button onClick={nextStep} className="gap-1.5 text-xs font-bold">
              <span>Complete Setup</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 6: Completed State */}
      {step === 6 && (
        <div className="text-center py-6 space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Your business is ready 🎉</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              We&apos;ve configured <strong className="text-slate-900">{formData.businessName}</strong> with all your settings, initial products, and cashiers.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 max-w-sm mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Business:</span>
              <span className="font-semibold">{formData.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Owner:</span>
              <span className="font-semibold">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Products:</span>
              <span className="font-semibold">{formData.products.length} Products</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Target:</span>
              <span className="font-semibold">{formData.currency} {formData.monthlyTarget.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={handleFinishSetup}
            isLoading={isLoading}
            className="w-full h-12 text-sm font-bold shadow-md"
          >
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
