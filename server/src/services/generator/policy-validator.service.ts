import { ValidationError } from "@/utils/ApiError";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const MIN_WORDS = 4;
const MAX_WORDS = 8;

export interface GenerationPolicy {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
}

export interface PassphrasePolicy {
  words?: number;
  separator?: string;
}

export function validateGenerationPolicy(options: GenerationPolicy): void {
  const length = options.length ?? 16;

  if (length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    throw new ValidationError([
      { field: "length", message: `Length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}` },
    ]);
  }

  const hasAnyCharset =
    (options.uppercase ?? true) ||
    (options.lowercase ?? true) ||
    (options.numbers ?? true) ||
    (options.symbols ?? true);

  if (!hasAnyCharset) {
    throw new ValidationError([
      { field: "characterSets", message: "At least one character set must be enabled" },
    ]);
  }
}

export function validatePassphrasePolicy(options: PassphrasePolicy): void {
  const words = options.words ?? 5;

  if (words < MIN_WORDS || words > MAX_WORDS) {
    throw new ValidationError([
      { field: "words", message: `Word count must be between ${MIN_WORDS} and ${MAX_WORDS}` },
    ]);
  }

  const validSeparators = [" ", "-", "_", "number", "symbol"];
  const separator = options.separator ?? "-";

  if (!validSeparators.includes(separator)) {
    throw new ValidationError([
      { field: "separator", message: `Separator must be one of: ${validSeparators.join(", ")}` },
    ]);
  }
}

export { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MIN_WORDS, MAX_WORDS };
