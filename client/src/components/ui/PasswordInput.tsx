import { useState, forwardRef, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showCapsLockWarning?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, showCapsLockWarning = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isCapsLockActive, setIsCapsLockActive] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const caps = e.getModifierState("CapsLock");
      setIsCapsLockActive(caps);
    };

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-11 w-full rounded-xl border border-gray-200 bg-white/60 pl-4 pr-11 py-2 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-900/60 dark:focus:border-blue-500 dark:focus:bg-gray-900",
              error && "border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500",
              className
            )}
            onKeyDown={handleKeyDown}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>

        {showCapsLockWarning && isCapsLockActive && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Caps Lock is active</span>
          </div>
        )}

        {error && <p className="text-[11px] font-medium text-red-600 dark:text-red-500">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
