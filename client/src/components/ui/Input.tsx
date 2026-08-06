import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "flex h-11 w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-2 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
              "dark:border-gray-800 dark:bg-gray-900/60 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-500/30 dark:disabled:bg-gray-900",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500/30",
              leftIcon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-medium text-red-600 dark:text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
