import api from "./api";
import type { StrengthResult, GenerateOptions, GenerateResult, PasswordLog } from "@/types/password.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

// Local storage key for fallback history
const FALLBACK_HISTORY_KEY = "sentinelpass_history_fallback";

// Helper to calculate entropy and strength details locally
export function calculateLocalStrength(password: string): StrengthResult {
  const len = password.length;
  if (!len) {
    return {
      score: 0,
      label: "Very Weak",
      details: { hasUppercase: false, hasLowercase: false, hasNumbers: false, hasSymbols: false, length: 0, entropy: 0 },
      recommendations: ["Password cannot be empty."]
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  // Pool size calculation
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33; // Standard special characters

  if (poolSize === 0) poolSize = 1; // Fallback

  const entropy = len * Math.log2(poolSize);

  // Calculate score (0-100)
  let score = 0;
  // Length contribution (up to 40 points)
  score += Math.min(len * 3, 40);
  // Variety contribution (up to 40 points)
  if (hasLowercase) score += 10;
  if (hasUppercase) score += 10;
  if (hasNumbers) score += 10;
  if (hasSymbols) score += 10;
  // Extra bonus for length (up to 20 points)
  if (len >= 12) score += 10;
  if (len >= 16) score += 10;

  // Deduct points for repetitive characters
  const uniqueChars = new Set(password).size;
  const repeatDeduction = Math.max(0, (len - uniqueChars) * 2);
  score = Math.max(0, score - repeatDeduction);

  // Scale/Cap score
  score = Math.min(100, Math.round(score));

  let label = "Very Weak";
  if (score >= 90) label = "Excellent";
  else if (score >= 75) label = "Strong";
  else if (score >= 60) label = "Good";
  else if (score >= 40) label = "Fair";
  else if (score >= 20) label = "Weak";

  // Create recommendations based on missing items
  const recommendations: string[] = [];
  if (len < 12) {
    recommendations.push("Increase password length to at least 12 characters.");
  }
  if (!hasUppercase) {
    recommendations.push("Add at least one uppercase letter (A-Z).");
  }
  if (!hasLowercase) {
    recommendations.push("Add at least one lowercase letter (a-z).");
  }
  if (!hasNumbers) {
    recommendations.push("Add at least one numerical digit (0-9).");
  }
  if (!hasSymbols) {
    recommendations.push("Add at least one special character or symbol (e.g. @, #, $).");
  }
  if (uniqueChars / len < 0.7) {
    recommendations.push("Reduce repeating characters to increase structural complexity.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Your password meets all security criteria. Great job!");
  }

  return {
    score,
    label,
    details: {
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      length: len,
      entropy
    },
    recommendations
  };
}

export const passwordService = {
  async checkStrength(password: string): Promise<StrengthResult> {
    try {
      const { data } = await api.post<ApiResponse<StrengthResult>>("/password/check-strength", { password });
      if (data.data) {
        // Save to local logs for sync
        this.saveLocalLog(password, data.data);
        return data.data;
      }
    } catch {
      // Fallback to local calculation if offline
      const localResult = calculateLocalStrength(password);
      this.saveLocalLog(password, localResult);
      return localResult;
    }
    throw new Error("Unable to check strength");
  },

  async generate(options: GenerateOptions = {}): Promise<GenerateResult> {
    try {
      const { data } = await api.post<ApiResponse<GenerateResult>>("/password/generate", options);
      if (data.data) return data.data;
    } catch {
      // Fallback generator
      const length = options.length || 16;
      let chars = "";
      
      const lowercaseSet = "abcdefghijklmnopqrstuvwxyz";
      const uppercaseSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbersSet = "0123456789";
      const symbolsSet = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      let similar = /[iIl1oO0]/;
      let ambiguous = /[{}[\]()/\'\"`~,;:.<>]/;

      let filteredLowercase = lowercaseSet;
      let filteredUppercase = uppercaseSet;
      let filteredNumbers = numbersSet;
      let filteredSymbols = symbolsSet;

      if (options.excludeAmbiguous) {
        filteredLowercase = filteredLowercase.replace(similar, "");
        filteredUppercase = filteredUppercase.replace(similar, "");
        filteredNumbers = filteredNumbers.replace(similar, "");
        filteredSymbols = filteredSymbols.split("").filter(c => !ambiguous.test(c)).join("");
      }

      if (options.includeLowercase !== false) chars += filteredLowercase;
      if (options.includeUppercase) chars += filteredUppercase;
      if (options.includeNumbers) chars += filteredNumbers;
      if (options.includeSymbols) chars += filteredSymbols;

      if (!chars) chars = filteredLowercase; // Fallback

      let password = "";
      for (let i = 0; i < length; i++) {
        const idx = Math.floor(Math.random() * chars.length);
        password += chars[idx];
      }

      return {
        password,
        strength: calculateLocalStrength(password)
      };
    }
    throw new Error("Unable to generate password");
  },

  async getHistory(page = 1, limit = 20): Promise<PaginatedResponse<PasswordLog>> {
    try {
      const { data } = await api.get<ApiResponse<PaginatedResponse<PasswordLog>>>("/password/history", {
        params: { page, limit },
      });
      if (data.data) return data.data;
    } catch {
      // Local fallback
      const stored = localStorage.getItem(FALLBACK_HISTORY_KEY);
      const allLogs: PasswordLog[] = stored ? JSON.parse(stored) : [];
      
      const startIndex = (page - 1) * limit;
      const paginatedLogs = allLogs.slice(startIndex, startIndex + limit);
      
      return {
        data: paginatedLogs,
        pagination: {
          page,
          limit,
          total: allLogs.length,
          totalPages: Math.ceil(allLogs.length / limit)
        }
      };
    }
    throw new Error("Unable to fetch history");
  },

  // Save history log locally for dashboard stats/log consistency
  saveLocalLog(password: string, result: StrengthResult): void {
    const stored = localStorage.getItem(FALLBACK_HISTORY_KEY);
    const logs: PasswordLog[] = stored ? JSON.parse(stored) : [];

    const newLog: PasswordLog = {
      id: Date.now(),
      userId: 1,
      strengthScore: result.score,
      strengthLabel: result.label,
      hasUppercase: result.details.hasUppercase,
      hasLowercase: result.details.hasLowercase,
      hasNumbers: result.details.hasNumbers,
      hasSymbols: result.details.hasSymbols,
      entropy: result.details.entropy,
      createdAt: new Date().toISOString()
    };

    // Keep logs within size limit
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop();

    localStorage.setItem(FALLBACK_HISTORY_KEY, JSON.stringify(logs));
  },

  clearHistory(): void {
    localStorage.removeItem(FALLBACK_HISTORY_KEY);
  }
};
