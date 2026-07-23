import {
  PasswordAnalysisResult,
  StrengthResult,
  GeneratorEntropyResult,
  GenerateEnhancedResult,
  GeneratePassphraseResult,
} from "@/interfaces";

export function formatPasswordResponse(
  password: string,
  entropyResult: GeneratorEntropyResult,
  analysis: PasswordAnalysisResult,
  strengthResult: StrengthResult
): GenerateEnhancedResult {
  return {
    password,
    strength: strengthResult,
    entropy: entropyResult.entropy,
    strengthLabel: analysis.strength,
    crackTime: analysis.crackTime,
    score: analysis.score,
  };
}

export function formatPassphraseResponse(
  passphrase: string,
  entropyResult: GeneratorEntropyResult,
  analysis: PasswordAnalysisResult
): GeneratePassphraseResult {
  return {
    passphrase,
    entropy: entropyResult.entropy,
    strength: analysis.strength,
    crackTime: analysis.crackTime,
  };
}
