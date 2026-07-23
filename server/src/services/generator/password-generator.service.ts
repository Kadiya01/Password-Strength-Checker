import crypto from "crypto";
import { PasswordGeneratorOptions } from "@/interfaces";
import { buildCharacterPool, CHARSETS } from "./character-pool-builder.service";

const MAX_RETRY_ATTEMPTS = 50;
const MAX_LENGTH = 64;
const MIN_LENGTH = 8;

export function generateSecurePassword(options: PasswordGeneratorOptions): string {
  const { length = 16, ...poolOptions } = options;
  const pool = buildCharacterPool(poolOptions);

  if (pool.length === 0) {
    throw new Error("Character pool is empty. Enable at least one character set.");
  }

  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new Error(`Password length must be between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }

  const enabledSets = getEnabledSets(poolOptions);

  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    const password = generateRandomString(pool, length);

    if (satisfiesConstraints(password, enabledSets, poolOptions.excludeAmbiguous)) {
      return password;
    }
  }

  return generateWithGuarantee(pool, length, enabledSets);
}

function generateRandomString(pool: string, length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[bytes[i] % pool.length];
  }
  return result;
}

function satisfiesConstraints(
  password: string,
  enabledSets: { set: string; required: boolean }[],
  excludeAmbiguous: boolean
): boolean {
  for (const { set, required } of enabledSets) {
    if (!required) continue;

    let chars = set;
    if (excludeAmbiguous) {
      chars = chars
        .split("")
        .filter((ch) => !/^(O|0|I|l|1|\||\{|\}|\[|\])$/.test(ch))
        .join("");
    }

    let found = false;
    for (const ch of password) {
      if (chars.includes(ch)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

function generateWithGuarantee(
  pool: string,
  length: number,
  enabledSets: { set: string; required: boolean }[]
): string {
  const chars = pool.split("");
  const result: string[] = [];

  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, chars.length);
    result.push(chars[idx]);
  }

  let position = 0;
  for (const { set, required } of enabledSets) {
    if (!required || position >= length) continue;

    const charIdx = crypto.randomInt(0, set.length);
    result[position] = set[charIdx];
    position++;
  }

  return result.join("");
}

interface EnabledSet {
  set: string;
  required: boolean;
}

function getEnabledSets(options: {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): EnabledSet[] {
  const sets: EnabledSet[] = [];
  if (options.uppercase) sets.push({ set: CHARSETS.uppercase, required: true });
  if (options.lowercase) sets.push({ set: CHARSETS.lowercase, required: true });
  if (options.numbers) sets.push({ set: CHARSETS.numbers, required: true });
  if (options.symbols) sets.push({ set: CHARSETS.symbols, required: true });
  return sets;
}
