import { useMutation } from "@tanstack/react-query";
import { passwordService } from "@/services/passwordService";

export function usePasswordStrength() {
  return useMutation({
    mutationFn: (password: string) => passwordService.checkStrength(password),
  });
}
