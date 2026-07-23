import { CharacterPoolOptions } from "@/interfaces";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

const AMBIGUOUS_CHARS = new Set(["O", "0", "I", "l", "1", "|", "{", "}", "[", "]"]);

export function buildCharacterPool(options: CharacterPoolOptions): string {
  let pool = "";

  if (options.uppercase) pool += CHARSETS.uppercase;
  if (options.lowercase) pool += CHARSETS.lowercase;
  if (options.numbers) pool += CHARSETS.numbers;
  if (options.symbols) pool += CHARSETS.symbols;

  if (options.excludeAmbiguous) {
    pool = pool
      .split("")
      .filter((ch) => !AMBIGUOUS_CHARS.has(ch))
      .join("");
  }

  return pool;
}

export function getCharacterSetLabels(options: CharacterPoolOptions): string[] {
  const labels: string[] = [];
  if (options.uppercase) labels.push("uppercase");
  if (options.lowercase) labels.push("lowercase");
  if (options.numbers) labels.push("numbers");
  if (options.symbols) labels.push("symbols");
  return labels;
}

export { AMBIGUOUS_CHARS, CHARSETS };
