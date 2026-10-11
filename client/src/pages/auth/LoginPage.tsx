import React, { useState } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, AlertCircle, Clock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("john.kamau@business.co.ke");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActivation, setPendingActivation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingActivation(false);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const msg: string = err.message || "";
      if (msg.toLowerCase().includes("pending activation") || msg.toLowerCase().includes("pending")) {
        setPendingActivation(true);
      } else {
        setError(msg || "Failed to log in. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
    setPendingActivation(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome back</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your credentials to access your business management dashboard.
        </p>
      </div>

      {/* Generic error */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pending activation notice */}
      {pendingActivation && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">Account Pending Activation</p>
            <p>
              Your business has been registered but is awaiting approval by the administrator.
              You will be able to log in once your account is activated.
            </p>
          </div>
        </div>
      )}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            icon={<Lock className="h-4 w-4" />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        <Button type="submit" className="w-full h-11 text-xs font-bold" isLoading={isLoading}>
          Sign in to Dashboard
        </Button>
      </form>

      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
          Quick Demo Accounts (Password: <span className="text-slate-800 font-mono">password123</span>)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDemoAccount("john.kamau@business.co.ke")}
            className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all text-[11px]"
          >
            <span className="font-bold text-slate-800 block truncate">John Kamau</span>
            <span className="text-slate-500 text-[10px] block truncate">Business Owner</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoAccount("protasjunior254@gmail.com")}
            className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all text-[11px]"
          >
            <span className="font-bold text-slate-800 block truncate">Protas Junior</span>
            <span className="text-slate-500 text-[10px] block truncate">Superadmin (All Tenants)</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          Register new business
        </Link>
      </div>
    </div>
  );
}
