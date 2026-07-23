import crypto from "crypto";
import { PassphraseGeneratorOptions } from "@/interfaces";
import { PASSPHRASE_WORD_LIST, WORD_LIST_LENGTH } from "@/data/word-list";

const SEPARATOR_CHARS = "!@#$%^&*";
const MIN_WORDS = 4;
const MAX_WORDS = 8;

export function generateSecurePassphrase(options: PassphraseGeneratorOptions): string {
  const { words = 5, separator = "-" } = options;

  if (words < MIN_WORDS || words > MAX_WORDS) {
    throw new Error(`Word count must be between ${MIN_WORDS} and ${MAX_WORDS}`);
  }

  const selectedWords: string[] = [];
  for (let i = 0; i < words; i++) {
    const idx = crypto.randomInt(0, WORD_LIST_LENGTH);
    selectedWords.push(PASSPHRASE_WORD_LIST[idx]);
  }

  const resolvedSeparator = resolveSeparator(separator);

  return selectedWords.join(resolvedSeparator);
}

function resolveSeparator(separator: string): string {
  switch (separator) {
    case " ":
      return " ";
    case "-":
      return "-";
    case "_":
      return "_";
    case "number": {
      const idx = crypto.randomInt(0, 10);
      return String(idx);
    }
    case "symbol": {
      const idx = crypto.randomInt(0, SEPARATOR_CHARS.length);
      return SEPARATOR_CHARS[idx];
    }
    default:
      return separator;
  }
}
