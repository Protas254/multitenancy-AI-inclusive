import React, { useState } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Building,
  Package,
  Users,
  Target,
  CheckCircle2,
  Store,
  Plus,
  Trash2,
  Clock,
  Mail,
} from "lucide-react";

const STEPS = [
  { label: "Account", icon: User },
  { label: "Business", icon: Building },
  { label: "Products", icon: Package },
  { label: "Staff", icon: Users },
  { label: "Target", icon: Target },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map((s, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-100 text-slate-400"}`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-[10px] font-semibold ${active ? "text-blue-600" : done ? "text-slate-500" : "text-slate-300"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 mx-1 rounded transition-all ${done ? "bg-blue-600" : "bg-slate-100"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState<{ businessName: string; email: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessCategory: "Retail Supermarket and Grocery",
    businessPhone: "",
    businessEmail: "",
    location: "Nairobi, Kenya",
    address: "",
    currency: "KES",
    taxRate: 16,
    products: [{ name: "", buyingPrice: 0, sellingPrice: 0, stock: 10 }],
    staff: [{ name: "", role: "Cashier", phone: "" }],
    monthlyTarget: 100000,
  });

  const next = () => setStep((s) => Math.min(5, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const addProductRow = () =>
    setFormData((p) => ({ ...p, products: [...p.products, { name: "", buyingPrice: 0, sellingPrice: 0, stock: 10 }] }));

  const removeProductRow = (i: number) =>
    setFormData((p) => ({ ...p, products: p.products.filter((_, idx) => idx !== i) }));

  const addStaffRow = () =>
    setFormData((p) => ({ ...p, staff: [...p.staff, { name: "", role: "Cashier", phone: "" }] }));

  const handleFinishSetup = async () => {
    setIsLoading(true);
    try {
      const res = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessName: formData.businessName,
        businessCategory: formData.businessCategory,
        products: formData.products.filter((p) => p.name.trim().length > 0),
      });
      if (res?.pendingActivation) {
        setRegistered({ businessName: res.businessName || formData.businessName, email: res.email || formData.email });
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Pending activation screen ────────────────────────────────────────────
  if (registered) {
    return (
      <div className="text-center py-6 space-y-6">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Clock className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Pending Activation 🎉</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Your business <strong className="text-slate-900">{registered.businessName}</strong> has been registered successfully.
            An administrator will review and activate your account shortly.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 space-y-2 max-w-sm mx-auto text-left">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Check your inbox</p>
              <p className="text-amber-700">
                A confirmation email has been sent to <strong>{registered.email}</strong>. Once the super admin activates your business, you can log in.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3 max-w-sm mx-auto text-left">
          <p className="font-semibold text-slate-700">What happens next?</p>
          <div className="space-y-2">
            {[
              "Your registration request has been received",
              "The super admin reviews and marks your business as active",
              "You receive a notification and can log in",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </div>
                <span className="text-slate-600">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/login" className="inline-block text-xs font-semibold text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Horizontal step progress — no arrows */}
      <StepBar current={step} />

      {/* STEP 1 ─ Personal Account */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Create your owner account</h2>
            <p className="text-xs text-slate-500 mt-1">You will use these credentials to log in and manage your business.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
              </div>
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center">
            <Link href="/login" className="text-xs text-slate-500 hover:underline">Already have an account? Log in</Link>
            <Button onClick={next} className="text-xs font-bold">Next: Business Info</Button>
          </div>
        </div>
      )}

      {/* STEP 2 ─ Business Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Tell us about your business</h2>
            <p className="text-xs text-slate-500 mt-1">Configure your primary store or enterprise branch.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Business Name</label>
              <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Business Category</label>
              <select
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <option>Retail Supermarket and Grocery</option>
                <option>Fashion and Apparel</option>
                <option>Cosmetics and Beauty Care</option>
                <option>Hardware and Building Supplies</option>
                <option>Pharmacy and Chemist</option>
                <option>Electronics and Tech</option>
                <option>Restaurant and Hospitality</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Store City / Region</label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Physical Address</label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prev} className="text-xs">Back</Button>
            <Button onClick={next} className="text-xs font-bold">Next: Initial Products</Button>
          </div>
        </div>
      )}

      {/* STEP 3 ─ Products */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Add your first products</h2>
            <p className="text-xs text-slate-500 mt-1">Add a few items to immediately start selling in your POS terminal.</p>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {formData.products.map((prod, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Product #{idx + 1}</span>
                  {formData.products.length > 1 && (
                    <button onClick={() => removeProductRow(idx)} className="text-red-500 hover:text-red-700">
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
                  {(["buyingPrice", "stock", "sellingPrice"] as const).map((field) => (
                    <div key={field}>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                        {field === "buyingPrice" ? "Buying Price (KES)" : field === "stock" ? "Quantity" : "Selling Price (KES)"}
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={prod[field] || ""}
                        onChange={(e) => {
                          const list = [...formData.products];
                          list[idx] = { ...list[idx], [field]: Number(e.target.value) };
                          setFormData({ ...formData, products: list });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addProductRow} className="w-full gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /><span>Add Another Product</span>
          </Button>
          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prev} className="text-xs">Back</Button>
            <Button onClick={next} className="text-xs font-bold">Next: Team and Staff</Button>
          </div>
        </div>
      )}

      {/* STEP 4 ─ Staff */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Add Staff Accounts</h2>
            <p className="text-xs text-slate-500 mt-1">Add cashiers, storekeepers, or sales representatives.</p>
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
            <Plus className="h-3.5 w-3.5" /><span>Add Staff Member</span>
          </Button>
          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prev} className="text-xs">Back</Button>
            <Button onClick={next} className="text-xs font-bold">Next: Sales Target</Button>
          </div>
        </div>
      )}

      {/* STEP 5 ─ Sales Target + Submit */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Set Monthly Sales Target</h2>
            <p className="text-xs text-slate-500 mt-1">Give your team a milestone to work towards this month.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Monthly Target Amount ({formData.currency})</label>
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
                <strong>{formData.currency} {Math.round(formData.monthlyTarget / 30).toLocaleString("en-KE")}</strong> in daily sales.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              After submitting, your business will be <strong>pending activation</strong>. The super admin will review and activate your account before you can log in.
            </span>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prev} className="text-xs">Back</Button>
            <Button onClick={handleFinishSetup} isLoading={isLoading} className="text-xs font-bold">
              Submit for Activation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
