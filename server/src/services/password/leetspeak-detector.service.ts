import { LeetCheckResult } from "@/interfaces";

const LEET_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "8": "b",
  "(": "c",
  "{": "c",
  "[": "c",
  "3": "e",
  "9": "g",
  "#": "h",
  "1": "i",
  "!": "i",
  "|": "l",
  "0": "o",
  "5": "s",
  "$": "s",
  "7": "t",
  "+": "t",
  "%": "x",
};

export function detectLeetspeak(password: string): LeetCheckResult {
  let isLeet = false;
  let normalized = "";

  for (const char of password) {
    const lower = char.toLowerCase();
    if (LEET_MAP[lower]) {
      isLeet = true;
      normalized += LEET_MAP[lower];
    } else {
      normalized += lower;
    }
  }

  return { normalized, isLeet };
}
