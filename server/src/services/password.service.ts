import {
  GenerateInput,
  PasswordLogEntry,
  PasswordAnalysisResult,
  GenerateEnhancedResult,
  GeneratePassphraseResult,
  PassphraseGeneratorOptions,
} from "@/interfaces";
import { passwordRepository } from "@/repositories/password.repository";
import { checkPasswordStrength } from "@/services/password";
import { parsePagination } from "@/interfaces";
import {
  generateSecurePassword,
  generateSecurePassphrase,
  calculateGeneratorEntropy,
  validateGeneratedPassword,
  validateGenerationPolicy,
  validatePassphrasePolicy,
  formatPasswordResponse,
  formatPassphraseResponse,
  buildCharacterPool,
} from "@/services/generator";

const MAX_QUALITY_RETRY_ATTEMPTS = 50;

export class PasswordService {
  checkStrength(password: string): PasswordAnalysisResult {
    return checkPasswordStrength(password);
  }

  generate(options: GenerateInput): GenerateEnhancedResult {
    const policyOptions = {
      length: options.length ?? 16,
      uppercase: options.includeUppercase ?? true,
      lowercase: options.includeLowercase ?? true,
      numbers: options.includeNumbers ?? true,
      symbols: options.includeSymbols ?? true,
      excludeAmbiguous: options.excludeAmbiguous ?? false,
    };

    validateGenerationPolicy(policyOptions);

    const pool = buildCharacterPool(policyOptions);
    const entropyResult = calculateGeneratorEntropy(pool.length, policyOptions.length);

    for (let attempt = 0; attempt < MAX_QUALITY_RETRY_ATTEMPTS; attempt++) {
      const password = generateSecurePassword(policyOptions);
      const validation = validateGeneratedPassword(password);

      if (validation.valid) {
        return formatPasswordResponse(password, entropyResult, validation.analysis, validation.strengthResult);
      }
    }

    const password = generateSecurePassword(policyOptions);
    const validation = validateGeneratedPassword(password);
    return formatPasswordResponse(password, entropyResult, validation.analysis, validation.strengthResult);
  }

  generatePassphrase(options: PassphraseGeneratorOptions): GeneratePassphraseResult {
    const policyOptions = {
      words: options.words ?? 5,
      separator: options.separator ?? "-",
    };

    validatePassphrasePolicy(policyOptions);

    const passphrase = generateSecurePassphrase(policyOptions);
    const analysis = checkPasswordStrength(passphrase);

    const wordCount = policyOptions.words;
    const poolSize = 2048;
    const entropyResult = calculateGeneratorEntropy(poolSize, wordCount);

    return formatPassphraseResponse(passphrase, entropyResult, analysis);
  }

  async logStrengthCheck(userId: string, result: PasswordAnalysisResult): Promise<void> {
    await passwordRepository.createLog({
      userId,
      strengthScore: result.score,
      strengthLabel: result.strength,
      hasUppercase: result.checks.uppercase,
      hasLowercase: result.checks.lowercase,
      hasNumbers: result.checks.numbers,
      hasSymbols: result.checks.symbols,
      entropy: result.entropy,
    });
  }

  async getHistory(userId: string, query: { page?: string; limit?: string }): Promise<{ data: PasswordLogEntry[]; total: number; page: number; limit: number }> {
    const pagination = parsePagination(query);
    const { data, total } = await passwordRepository.getLogsByUser(userId, pagination.skip, pagination.limit);

    return {
      data: data as PasswordLogEntry[],
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }
}

export const passwordService = new PasswordService();
