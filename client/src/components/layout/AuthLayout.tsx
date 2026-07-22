import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Shield, Lock } from "lucide-react";
import { useUiStore } from "@/store/uiStore";

export default function AuthLayout() {
  const { theme } = useUiStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-950 cyber-grid">
      <div className="w-full max-w-lg">
        {/* Branding header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 shadow-sm dark:text-blue-500">
              <Shield className="h-7 w-7 animate-pulse" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              SentinelPass
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            NIST SP 800-63B Compliant Cryptographic Strength Verification
          </p>
        </div>

        {/* Panel Wrapper */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl sm:p-8">
          <Outlet />
        </div>

        {/* Informative footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <Lock className="h-3 w-3" />
          <span>All credentials hashed locally prior to submission</span>
        </div>
      </div>
    </div>
  );
}
