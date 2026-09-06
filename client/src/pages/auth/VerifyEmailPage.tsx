import React from "react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="text-center space-y-6">
      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Mail className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Verify your email</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We sent a verification link to your registered email address. Please confirm your email to activate your full SME OS account.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
        Did not receive the email?{" "}
        <button className="text-blue-600 font-semibold hover:underline">Click here to resend</button>
      </div>

      <div className="pt-2">
        <Link href="/dashboard">
          <Button className="w-full h-11 text-xs font-bold gap-1.5">
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
