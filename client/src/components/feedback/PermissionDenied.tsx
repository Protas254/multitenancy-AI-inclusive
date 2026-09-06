import React from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import Link from "@/components/ui/link";

interface PermissionDeniedProps {
  moduleName?: string;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  moduleName = "this page",
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 border border-amber-100">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        You do not have permission to view or manage {moduleName}. Contact your business owner or store administrator to adjust your role access permissions.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
