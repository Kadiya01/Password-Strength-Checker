import { COMMON_PASSWORDS } from "@/data/common-passwords";
import { DictionaryCheckResult } from "@/interfaces";

export function checkDictionary(password: string): DictionaryCheckResult {
  const lower = password.toLowerCase();

  if (COMMON_PASSWORDS.has(lower)) {
    return { found: true, matched: lower };
  }

  const stripped = lower.replace(/[\s\-_.]/g, "");
  if (stripped !== lower && COMMON_PASSWORDS.has(stripped)) {
    return { found: true, matched: stripped };
  }

  if (lower.length > 4) {
    const prefix = lower.substring(0, lower.length - 2);
    if (COMMON_PASSWORDS.has(prefix)) {
      return { found: true, matched: prefix };
    }
  }

  const noTrailingDigits = lower.replace(/\d+$/, "");
  if (noTrailingDigits.length >= 4 && noTrailingDigits !== lower) {
    if (COMMON_PASSWORDS.has(noTrailingDigits)) {
      return { found: true, matched: noTrailingDigits };
    }
  }

  return { found: false, matched: null };
}
