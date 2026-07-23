import api from "./api";
import type {
  PasswordAnalysisResult,
  GenerateOptions,
  GenerateResult,
  GeneratePassphraseResult,
  PasswordLog,
} from "@/types/password.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export function calculateLocalStrength(password: string): {
  score: number;
  label: string;
  details: { hasUppercase: boolean; hasLowercase: boolean; hasNumbers: boolean; hasSymbols: boolean; length: number; entropy: number };
  recommendations: string[];
} {
  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      details: { hasUppercase: false, hasLowercase: false, hasNumbers: false, hasSymbols: false, length: 0, entropy: 0 },
      recommendations: ["Enter a password to analyze"],
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const length = password.length;

  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33;

  const entropy = poolSize > 0 ? length * Math.log2(poolSize) : 0;
  const score = Math.min(100, Math.round(entropy / 1.5));

  const recommendations: string[] = [];
  if (length < 8) recommendations.push("Use at least 8 characters");
  if (!hasUppercase) recommendations.push("Add uppercase letters");
  if (!hasLowercase) recommendations.push("Add lowercase letters");
  if (!hasNumbers) recommendations.push("Add numbers");
  if (!hasSymbols) recommendations.push("Add special characters");
  if (recommendations.length === 0) recommendations.push("Great job! Your password looks strong.");

  let label = "Very Weak";
  if (score >= 90) label = "Very Strong";
  else if (score >= 75) label = "Strong";
  else if (score >= 50) label = "Fair";
  else if (score >= 25) label = "Weak";

  return {
    score,
    label,
    details: { hasUppercase, hasLowercase, hasNumbers, hasSymbols, length, entropy: Math.round(entropy) },
    recommendations,
  };
}

export const passwordService = {
  async checkStrength(password: string): Promise<PasswordAnalysisResult> {
    const { data } = await api.post<ApiResponse<PasswordAnalysisResult>>("/password/check-strength", { password });
    if (!data.data) throw new Error(data.message || "Failed to check password strength");
    return data.data;
  },

  async generate(options: GenerateOptions = {}): Promise<GenerateResult> {
    const { data } = await api.post<ApiResponse<GenerateResult>>("/password/generate", options);
    if (!data.data) throw new Error(data.message || "Failed to generate password");
    return data.data;
  },

  async generatePassphrase(options: { words?: number; separator?: string } = {}): Promise<GeneratePassphraseResult> {
    const { data } = await api.post<ApiResponse<GeneratePassphraseResult>>("/password/generate-passphrase", options);
    if (!data.data) throw new Error(data.message || "Failed to generate passphrase");
    return data.data;
  },

  async getHistory(page = 1, limit = 20): Promise<PaginatedResponse<PasswordLog>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<PasswordLog>>>("/password/history", {
      params: { page, limit },
    });
    if (!data.data) throw new Error(data.message || "Failed to fetch history");
    return data.data;
  },

  async clearHistory(): Promise<void> {
    // Backend does not support clearing history - this is a no-op
    // that prevents runtime errors if the button is clicked
  },
};

export type PasswordService = typeof passwordService;
