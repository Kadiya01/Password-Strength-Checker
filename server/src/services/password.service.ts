import { GenerateInput, GenerateResult, PasswordLogEntry } from "@/interfaces";
import { passwordRepository } from "@/repositories/password.repository";
import { checkPasswordStrength } from "./password-strength.service";
import { generatePassword as generate } from "@/utils/passwordGenerator";
import { parsePagination } from "@/interfaces";

export class PasswordService {
  checkStrength(password: string) {
    return checkPasswordStrength(password);
  }

  generate(options: GenerateInput): GenerateResult {
    const password = generate({
      length: options.length,
      includeUppercase: options.includeUppercase,
      includeLowercase: options.includeLowercase,
      includeNumbers: options.includeNumbers,
      includeSymbols: options.includeSymbols,
      excludeAmbiguous: options.excludeAmbiguous,
    });

    const strength = checkPasswordStrength(password);

    return { password, strength };
  }

  async logStrengthCheck(userId: string, result: ReturnType<typeof checkPasswordStrength>): Promise<void> {
    await passwordRepository.createLog({
      userId,
      strengthScore: result.score,
      strengthLabel: result.label,
      hasUppercase: result.details.hasUppercase,
      hasLowercase: result.details.hasLowercase,
      hasNumbers: result.details.hasNumbers,
      hasSymbols: result.details.hasSymbols,
      entropy: result.details.entropy,
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
