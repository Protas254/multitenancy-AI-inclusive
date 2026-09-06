import React, { useState } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Store, CheckCircle2, ArrowRight, ArrowLeft, Package, Users, Percent, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { title: "Store Profile", desc: "Confirm your store name and contact details" },
    { title: "Tax & Financials", desc: "Set VAT rate and M-Pesa till / paybill info" },
    { title: "Initial Products", desc: "Add starting merchandise to catalog" },
    { title: "Team Cashiers", desc: "Create cashier user accounts" },
    { title: "Launch Complete", desc: "Open your POS terminal" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to {currentTenant.name}
          </h1>
          <p className="text-xs text-slate-500">
            Let&apos;s get your business operating system setup in under 2 minutes.
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-blue-600">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </span>
            <span className="text-slate-400 font-medium">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          <Progress value={currentStep} max={steps.length} />
        </div>

        {/* Step Card */}
        <Card className="p-6 sm:p-8 shadow-md">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Verify Store Profile</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Business Name</label>
                  <Input defaultValue={currentTenant.name} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <Input defaultValue={currentTenant.businessType} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Store Address</label>
                  <Input defaultValue={currentTenant.address} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Tax & Currency Settings</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Currency</label>
                    <Input defaultValue="KES" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">VAT Rate (%)</label>
                    <Input type="number" defaultValue={16} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">KRA Tax PIN</label>
                  <Input placeholder="P051239847Z" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Catalog Ready</h2>
              <p className="text-xs text-slate-600">
                We&apos;ve pre-loaded sample best-seller inventory so you can test barcode scanning and sales immediately.
              </p>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Sample inventory loaded:</p>
                <p>• Italian Slim Suit (18 in stock)</p>
                <p>• Cotton Oxford Shirt (45 in stock)</p>
                <p>• Handcrafted Leather Shoes (12 in stock)</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Staff Cashiers</h2>
              <p className="text-xs text-slate-600">
                Your primary owner account is active. You can add more store employees anytime from the Staff menu.
              </p>
              <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">John Kamau</p>
                  <p className="text-[11px] text-slate-400">Owner & Administrator</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Ready
                </span>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center py-4 space-y-4">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">You are all set! 🎉</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your business is completely configured and ready for live sales.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-11 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                Enter Business OS Dashboard
              </Button>
            </div>
          )}

          {currentStep < 5 && (
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
              {currentStep > 1 ? (
                <Button variant="outline" size="sm" onClick={() => setCurrentStep((s) => s - 1)} className="gap-1 text-xs">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </Button>
              ) : <div />}

              <Button size="sm" onClick={() => setCurrentStep((s) => s + 1)} className="gap-1 text-xs font-bold">
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
