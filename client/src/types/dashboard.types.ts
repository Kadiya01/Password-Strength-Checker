export interface DashboardStatistics {
  totalPasswordsChecked: number;
  averageStrength: number;
  strengthDistribution: {
    weak: number;
    fair: number;
    strong: number;
    veryStrong: number;
  };
  recentActivity: LoginActivity[];
  securityScore: number;
}

export interface LoginActivity {
  id: number;
  ipAddress: string;
  success: boolean;
  createdAt: string;
}
