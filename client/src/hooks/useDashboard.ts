import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardService.getStatistics(),
  });
}

export function useLoginHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["login-history", params],
    queryFn: () => dashboardService.getLoginHistory(params),
  });
}

export function useSecurityScore() {
  return useQuery({
    queryKey: ["security-score"],
    queryFn: () => dashboardService.getSecurityScore(),
  });
}
