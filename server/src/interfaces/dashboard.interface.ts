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
  id: string;
  ipAddress: string;
  success: boolean;
  createdAt: Date;
}
