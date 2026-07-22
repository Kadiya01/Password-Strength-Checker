import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/utils/validators";
import { useLogin } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";

export default function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4 text-left">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@enterprise.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300">
            Password
          </label>
          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert("Password recovery email has been simulated. Check console logs.");
              console.log("Simulating password recovery for current session email.");
            }}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </a>
        </div>
        <PasswordInput
          placeholder="Enter your password"
          error={errors.password?.message}
          showCapsLockWarning={true}
          {...register("password")}
        />
      </div>

      <div className="flex items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
            {...register("rememberMe")}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">Remember my session on this device</span>
        </label>
      </div>

      <Button type="submit" isLoading={login.isPending} className="w-full h-11 rounded-xl">
        Sign In to Portal
      </Button>
    </form>
  );
}
