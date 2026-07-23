import { PatternCheckResult } from "@/interfaces";
import { detectKeyboardPattern } from "./keyboard-pattern-detector.service";
import { detectSequence } from "./sequence-detector.service";

function hasRepeatedWords(password: string): boolean {
  const words = password
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s\-_.]+/)
    .filter((w) => w.length >= 2);

  const seen = new Set<string>();
  for (const word of words) {
    const lower = word.toLowerCase();
    if (seen.has(lower)) return true;
    seen.add(lower);
  }

  return false;
}

export function detectPatterns(password: string): PatternCheckResult {
  const keyboard = detectKeyboardPattern(password);
  const sequence = detectSequence(password);
  const repeatedWords = hasRepeatedWords(password);

  const patterns: string[] = [];
  if (keyboard.found) patterns.push(...keyboard.patterns);
  if (sequence.found) patterns.push(...sequence.patterns);

  return {
    keyboardPattern: keyboard.found,
    sequence: sequence.found,
    repeated: repeatedWords || (sequence.found && sequence.types.includes("repeated")),
    patterns,
  };
}
