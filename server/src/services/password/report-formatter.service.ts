import {
  PasswordAnalysisResult,
  PasswordChecks,
  EntropyResult,
  PatternCheckResult,
} from "@/interfaces";

export function formatReport(input: {
  password: string;
  entropyResult: EntropyResult;
  dictionaryFound: boolean;
  patternResult: PatternCheckResult;
  score: number;
  strength: string;
  crackTime: string;
  isPassphrase: boolean;
  suggestions: string[];
}): PasswordAnalysisResult {
  const checks: PasswordChecks = {
    length: input.password.length >= 12,
    uppercase: /[A-Z]/.test(input.password),
    lowercase: /[a-z]/.test(input.password),
    numbers: /[0-9]/.test(input.password),
    symbols: /[^a-zA-Z0-9]/.test(input.password),
    dictionary: input.dictionaryFound,
    keyboardPattern: input.patternResult.keyboardPattern,
    sequence: input.patternResult.sequence,
    repeated: input.patternResult.repeated,
  };

  return {
    score: input.score,
    strength: input.strength,
    entropy: input.entropyResult.bits,
    crackTime: `Estimated ${input.crackTime}`,
    passphrase: input.isPassphrase,
    checks,
    suggestions: input.suggestions,
  };
}
