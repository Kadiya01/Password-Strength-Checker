import { useQuery } from "@tanstack/react-query";
import { passwordService } from "@/services/passwordService";

export function usePasswordHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["password-history", page, limit],
    queryFn: () => passwordService.getHistory(page, limit),
  });
}
