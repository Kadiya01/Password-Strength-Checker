import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import type { LoginFormData } from "@/utils/validators";

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data.email, data.password),
    onSuccess: (result) => {
      setAuth(result.user, result.token);
      addToast({ type: "success", message: "Login successful!" });
      navigate("/dashboard");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      addToast({
        type: "error",
        message: error.response?.data?.message || "Login failed. Please try again.",
      });
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUiStore();

  return useMutation({
    mutationFn: (payload: Parameters<typeof authService.register>[0]) => authService.register(payload),
    onSuccess: (result) => {
      setAuth(result.user, result.token);
      addToast({ type: "success", message: "Registration successful!" });
      navigate("/dashboard");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      addToast({
        type: "error",
        message: error.response?.data?.message || "Registration failed. Please try again.",
      });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
  });
}
