import { StrengthResult } from "@/interfaces";

// TODO: Implement password strength algorithm in next phase
export function checkPasswordStrength(password: string): StrengthResult {
  return {
    score: 0,
    label: "Not Implemented",
    details: {
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSymbols: false,
      length: password.length,
      entropy: 0,
    },
    recommendations: ["Password strength checking will be implemented in the next phase."],
  };
}
