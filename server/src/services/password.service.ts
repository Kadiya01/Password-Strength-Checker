import { GenerateInput, PasswordLogEntry, PasswordAnalysisResult } from "@/interfaces";
import { passwordRepository } from "@/repositories/password.repository";
import { checkPasswordStrength, toStrengthResult } from "@/services/password";
import { generatePassword as generate } from "@/utils/passwordGenerator";
import { parsePagination } from "@/interfaces";

export class PasswordService {
  checkStrength(password: string): PasswordAnalysisResult {
    return checkPasswordStrength(password);
  }

  generate(options: GenerateInput) {
    const password = generate({
      length: options.length,
      includeUppercase: options.includeUppercase,
      includeLowercase: options.includeLowercase,
      includeNumbers: options.includeNumbers,
      includeSymbols: options.includeSymbols,
      excludeAmbiguous: options.excludeAmbiguous,
    });

    const analysis = checkPasswordStrength(password);
    const strength = toStrengthResult(analysis, password);

    return { password, strength };
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

  async getHistory(userId: string, query: { page?: string; limit?: string }) {
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
