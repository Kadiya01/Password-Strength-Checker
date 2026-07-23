import { ScoringInput } from "@/interfaces";

export function calculateScore(input: ScoringInput): number {
  let score = 0;

  score += lengthScore(input.length);
  score += diversityScore(input.hasUppercase, input.hasLowercase, input.hasNumbers, input.hasSymbols);
  score += entropyScore(input.entropy);
  if (input.isPassphrase) score += passphraseBonus(input.length);

  if (input.dictionaryHit) score -= 50;
  if (input.keyboardPattern) score -= 20;
  if (input.sequence) score -= 15;
  if (input.repeated) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function lengthScore(length: number): number {
  return Math.min(30, length * 2.5);
}

function diversityScore(upper: boolean, lower: boolean, nums: boolean, syms: boolean): number {
  let pts = 0;
  if (upper) pts += 5;
  if (lower) pts += 5;
  if (nums) pts += 5;
  if (syms) pts += 5;
  return pts;
}

function entropyScore(entropy: number): number {
  return Math.min(25, entropy / 4);
}

function passphraseBonus(length: number): number {
  if (length >= 20) return 15;
  if (length >= 16) return 10;
  return 5;
}

export function getStrengthLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Weak";
  return "Very Weak";
}
