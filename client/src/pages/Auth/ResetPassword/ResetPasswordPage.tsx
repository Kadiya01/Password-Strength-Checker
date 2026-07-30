import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useResetPassword } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState("");
  const resetPassword = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMatchError("");
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setMatchError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setMatchError("Password must be at least 8 characters");
      return;
    }
    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          navigate("/login");
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Invalid Reset Link
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This reset link is missing or invalid. Please request a new one.
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
          Set New Password
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
        <PasswordInput
          id="reset-new-password"
          label="New Password"
          placeholder="Enter new password"
          autoComplete="new-password"
          showCapsLockWarning
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <PasswordInput
          id="reset-confirm-password"
          label="Confirm New Password"
          placeholder="Repeat new password"
          autoComplete="new-password"
          showCapsLockWarning
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {(matchError || (resetPassword.isError && !matchError)) && (
          <p className="text-xs text-red-500">
            {matchError || (resetPassword.error as Error).message}
          </p>
        )}

        <Button type="submit" isLoading={resetPassword.isPending} className="w-full h-11 rounded-xl">
          Reset Password
        </Button>
      </form>

      <div className="border-t border-gray-100 pt-4 text-center dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
