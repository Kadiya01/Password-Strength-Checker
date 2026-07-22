import { ShieldCheck, HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/50 py-6 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>NIST SP 800-63B & OWASP Compliant</span>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} SentinelPass. Developed for Enterprise and Academic Cryptographic Evaluation.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
