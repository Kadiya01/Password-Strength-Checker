import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    forgotPassword.mutate(email.trim());
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter your registered email to receive a reset link
        </p>
      </div>

      {forgotPassword.isSuccess ? (
        <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          If an account with that email exists, a reset link has been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@enterprise.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={forgotPassword.isError ? (forgotPassword.error as Error).message : undefined}
          />

          <Button type="submit" isLoading={forgotPassword.isPending} className="w-full h-11 rounded-xl">
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="border-t border-gray-100 pt-4 text-center dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
