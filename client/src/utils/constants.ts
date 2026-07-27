export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://password-strength-checker-qa6b.onrender.com/api";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const STRENGTH_LABELS = {
  VERY_WEAK: "Very Weak",
  WEAK: "Weak",
  FAIR: "Fair",
  STRONG: "Strong",
  VERY_STRONG: "Very Strong",
} as const;
