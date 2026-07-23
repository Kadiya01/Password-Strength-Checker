import {
  PasswordAnalysisResult,
  StrengthResult,
} from "@/interfaces";
import { calculateEntropy } from "./entropy-calculator.service";
import { checkDictionary } from "./dictionary-checker.service";
import { detectLeetspeak } from "./leetspeak-detector.service";
import { detectPatterns } from "./pattern-detector.service";
import { calculateScore, getStrengthLabel } from "./scoring-engine.service";
import { estimateCrackTime } from "./crack-time-estimator.service";
import { generateSuggestions } from "./suggestion.service";
import { formatReport } from "./report-formatter.service";

function detectPassphrase(password: string): boolean {
  const spaceWords = password.trim().split(/\s+/);
  if (spaceWords.length >= 3) return true;

  const camelWords = password.replace(/([a-z])([A-Z])/g, "$1 $2").split(/\s+/);
  if (camelWords.length >= 4) return true;

  const hasSpaces = /\s/.test(password);
  if (hasSpaces && password.length >= 16) return true;

  return false;
}

export function checkPasswordStrength(password: string): PasswordAnalysisResult {
  const entropyResult = calculateEntropy(password);

  const dictResult = checkDictionary(password);
  let dictHit = dictResult.found;

  if (!dictHit) {
    const leet = detectLeetspeak(password);
    if (leet.isLeet) {
      const leetDict = checkDictionary(leet.normalized);
      dictHit = leetDict.found;
    }
  }

  const patternResult = detectPatterns(password);
  const isPassphrase = detectPassphrase(password);

  const score = calculateScore({
    length: password.length,
    entropy: entropyResult.bits,
    isPassphrase,
    dictionaryHit: dictHit,
    keyboardPattern: patternResult.keyboardPattern,
    sequence: patternResult.sequence,
    repeated: patternResult.repeated,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[^a-zA-Z0-9]/.test(password),
  });

  const strength = getStrengthLabel(score);
  const crackTime = estimateCrackTime(entropyResult.bits);

  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
    dictionary: dictHit,
    keyboardPattern: patternResult.keyboardPattern,
    sequence: patternResult.sequence,
    repeated: patternResult.repeated,
  };

  const suggestions = generateSuggestions({
    length: password.length,
    checks,
    isPassphrase,
    entropy: entropyResult.bits,
  });

  return formatReport({
    password,
    entropyResult,
    dictionaryFound: dictHit,
    patternResult,
    score,
    strength,
    crackTime,
    isPassphrase,
    suggestions,
  });
}

export function toStrengthResult(result: PasswordAnalysisResult, password: string): StrengthResult {
  return {
    score: result.score,
    label: result.strength,
    details: {
      hasUppercase: result.checks.uppercase,
      hasLowercase: result.checks.lowercase,
      hasNumbers: result.checks.numbers,
      hasSymbols: result.checks.symbols,
      length: password.length,
      entropy: result.entropy,
    },
    recommendations: result.suggestions,
  };
}
