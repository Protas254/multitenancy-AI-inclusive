import React, { useState } from "react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Reset your password</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered business email and we&apos;ll send you a password recovery link.
        </p>
      </div>

      {isSent ? (
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Check your inbox</h3>
          <p className="text-xs text-slate-600">
            We sent a password reset link to <strong className="text-slate-900">{email}</strong>.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <Input
              type="email"
              icon={<Mail className="h-4 w-4" />}
              placeholder="name@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-11 text-xs font-bold" isLoading={isLoading}>
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
