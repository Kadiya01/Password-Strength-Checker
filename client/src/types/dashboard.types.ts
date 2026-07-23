export interface StrengthDistribution {
  weak: number;
  fair: number;
  strong: number;
  veryStrong: number;
}

export interface DashboardStatistics {
  totalPasswordsChecked: number;
  averageStrength: number;
  strengthDistribution: StrengthDistribution;
  recentActivity: LoginActivity[];
  securityScore: number;
}

export interface LoginActivity {
  id: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  createdAt: string;
}

export interface SecurityScore {
  overall: number;
  factors: SecurityScoreFactor[];
  recommendations: string[];
}

export interface SecurityScoreFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface PasswordAnalytics {
  totalChecked: number;
  averageStrength: number;
  averageEntropy: number;
  distribution: StrengthDistribution;
  trendOverTime: PasswordTrend[];
  topPatterns: PasswordPattern[];
}

export interface PasswordTrend {
  date: string;
  count: number;
  averageScore: number;
}

export interface PasswordPattern {
  pattern: string;
  count: number;
  percentage: number;
}

export interface SecurityEventRecord {
  id: string;
  eventType: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityTimelineItem {
  id: string;
  type: "login" | "password_check" | "security_event" | "registration";
  description: string;
  ipAddress?: string;
  success?: boolean;
  createdAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface PasswordChart {
  strengthDistribution: ChartData;
  strengthOverTime: ChartData;
  activityHeatmap: ActivityHeatmapData;
}

export interface ActivityHeatmapData {
  hours: number[];
  days: string[];
  data: number[][];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
