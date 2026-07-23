import { KeyboardPatternResult } from "@/interfaces";

const KEYBOARD_ROWS = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1234567890",
];

function generateSubstrings(row: string, minLen: number, maxLen: number): Set<string> {
  const subs = new Set<string>();
  for (let len = minLen; len <= Math.min(maxLen, row.length); len++) {
    for (let i = 0; i <= row.length - len; i++) {
      const sub = row.substring(i, i + len);
      subs.add(sub);
      subs.add(sub.split("").reverse().join(""));
    }
  }
  return subs;
}

let cachedPatterns: Set<string> | null = null;

function getAllKeyboardPatterns(): Set<string> {
  if (cachedPatterns) return cachedPatterns;

  cachedPatterns = new Set<string>();
  for (const row of KEYBOARD_ROWS) {
    const subs = generateSubstrings(row, 3, 8);
    for (const s of subs) {
      cachedPatterns.add(s);
    }
  }
  return cachedPatterns;
}

export function detectKeyboardPattern(password: string): KeyboardPatternResult {
  const lower = password.toLowerCase();
  const patterns = getAllKeyboardPatterns();
  const foundPatterns: string[] = [];

  for (const pattern of patterns) {
    if (lower.includes(pattern)) {
      foundPatterns.push(pattern);
    }
  }

  return { found: foundPatterns.length > 0, patterns: foundPatterns };
}
