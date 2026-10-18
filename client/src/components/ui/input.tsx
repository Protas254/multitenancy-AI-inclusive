import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  eyeToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, eyeToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const effectiveType = eyeToggle && type === "password" ? (showPassword ? "text" : "password") : type;

    if (icon || eyeToggle) {
      return (
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={effectiveType}
            className={cn(
              "flex h-10 w-full rounded-lg border border-slate-200 bg-white py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
              icon ? "pl-10" : "pl-3",
              eyeToggle ? "pr-10" : "pr-3",
              className
            )}
            ref={ref}
            {...props}
          />
          {eyeToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      );
    }

    return (
      <input
        type={effectiveType}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
