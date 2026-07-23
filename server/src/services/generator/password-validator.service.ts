import { PasswordAnalysisResult, StrengthResult } from "@/interfaces";
import { checkPasswordStrength, toStrengthResult } from "@/services/password";

const MIN_ACCEPTABLE_SCORE = 75;

export interface ValidationResult {
  valid: boolean;
  analysis: PasswordAnalysisResult;
  strengthResult: StrengthResult;
}

export function validateGeneratedPassword(password: string): ValidationResult {
  const analysis = checkPasswordStrength(password);
  const strengthResult = toStrengthResult(analysis, password);

  return {
    valid: analysis.score >= MIN_ACCEPTABLE_SCORE,
    analysis,
    strengthResult,
  };
}

export { MIN_ACCEPTABLE_SCORE };
