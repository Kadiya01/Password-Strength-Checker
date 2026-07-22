import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X, ShieldAlert, Clock, BarChart } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/utils/validators";
import { useRegister } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { calculateLocalStrength } from "@/services/passwordService";

export default function RegisterForm() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    }
  });

  const passwordVal = watch("password") || "";
  const confirmPasswordVal = watch("confirmPassword") || "";

  // Live strength analysis
  const strength = calculateLocalStrength(passwordVal);
  const showStats = passwordVal.length > 0;

  // Checklist items
  const checks = [
    { label: "Minimum 8 characters", met: passwordVal.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(passwordVal) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(passwordVal) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(passwordVal) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(passwordVal) },
    { label: "Passwords match", met: passwordVal.length > 0 && passwordVal === confirmPasswordVal },
  ];

  // Map password score to color
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Convert entropy to estimated crack time text
  const getEstimatedCrackTime = (entropy: number) => {
    if (entropy === 0) return "0 seconds";
    const guessesPerSec = 1e10; // 10 Billion guesses/second (Standard GPU rig)
    const combinations = Math.pow(2, entropy);
    const seconds = (combinations / 2) / guessesPerSec;

    if (seconds < 1) return "Instant";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
  };

  const onSubmit = (data: RegisterFormData) => {
    // Map fullName into firstName and lastName for API compat
    const parts = data.fullName.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");
    
    registerUser.mutate({
      email: data.email,
      username: data.email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
      password: data.password,
      firstName,
      lastName,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <Input
        label="Full Name"
        placeholder="Jane Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      
      <Input
        label="Email Address"
        type="email"
        placeholder="jane.doe@enterprise.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordInput
        label="Password"
        placeholder="Enter a secure password"
        error={errors.password?.message}
        {...register("password")}
      />

      {/* Live Strength Display */}
      {showStats && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-900/30">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-500 dark:text-gray-400">Strength: {strength.label}</span>
            <span className="text-blue-600 dark:text-blue-400">{strength.score}/100</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(strength.score)}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <BarChart className="h-3.5 w-3.5" />
              <span>Entropy: <b>{Math.round(strength.details.entropy)} bits</b></span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Crack time: <b>{getEstimatedCrackTime(strength.details.entropy)}</b></span>
            </div>
          </div>
        </div>
      )}

      <PasswordInput
        label="Confirm Password"
        placeholder="Repeat your password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {/* Security Checklists */}
      <div className="rounded-xl border border-gray-100 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Vulnerability checklist
        </span>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              {c.met ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 dark:text-gray-700" />
              )}
              <span
                className={`text-xs ${
                  c.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="space-y-1">
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
            {...register("terms")}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
            I agree to the Terms of Service and Privacy Policy, and understand evaluations are performed locally in the browser.
          </span>
        </label>
        {errors.terms && <p className="text-[11px] font-medium text-red-600 dark:text-red-500">{errors.terms.message}</p>}
      </div>

      <Button type="submit" isLoading={registerUser.isPending} className="w-full h-11 rounded-xl">
        Create Sentinel Account
      </Button>
    </form>
  );
}
