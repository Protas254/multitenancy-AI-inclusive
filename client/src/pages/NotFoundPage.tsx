import React from "react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Store, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/common/SEO";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <SEO
        title="Page Not Found | StockGrid"
        description="The requested page could not be found."
        noindex={true}
        nofollow={true}
      />
      <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
        <Store className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-4">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
}
