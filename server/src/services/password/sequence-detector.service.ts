import { SequenceCheckResult } from "@/interfaces";

function findSequentialChars(password: string): string[] {
  const results: string[] = [];
  const lower = password.toLowerCase();

  for (let i = 0; i <= lower.length - 3; i++) {
    let ascending = true;
    let descending = true;

    for (let j = 0; j < 2; j++) {
      const diff = lower.charCodeAt(i + j + 1) - lower.charCodeAt(i + j);
      if (diff !== 1) ascending = false;
      if (diff !== -1) descending = false;
    }

    if (ascending || descending) {
      let end = i + 2;
      while (end < lower.length) {
        const diff = lower.charCodeAt(end) - lower.charCodeAt(end - 1);
        if (ascending && diff === 1) end++;
        else if (descending && diff === -1) end++;
        else break;
      }
      const seq = lower.substring(i, end);
      if (seq.length >= 3) results.push(seq);
      i = end - 1;
    }
  }

  return results;
}

function findRepeatedChars(password: string): string[] {
  const results: string[] = [];
  const lower = password.toLowerCase();

  let count = 1;
  for (let i = 1; i <= lower.length; i++) {
    if (i < lower.length && lower[i] === lower[i - 1]) {
      count++;
    } else {
      if (count >= 3) {
        results.push(lower.substring(i - count, i));
      }
      count = 1;
    }
  }

  return results;
}

function findRepeatedSubstrings(password: string): string[] {
  const results: string[] = [];
  const lower = password.toLowerCase();

  for (let subLen = 1; subLen <= Math.floor(lower.length / 2); subLen++) {
    if (lower.length % subLen !== 0) continue;
    const sub = lower.substring(0, subLen);
    let matches = true;
    for (let j = subLen; j < lower.length; j += subLen) {
      if (lower.substring(j, j + subLen) !== sub) {
        matches = false;
        break;
      }
    }
    if (matches && subLen < lower.length) {
      results.push(sub);
    }
  }

  return results;
}

function findDatePatterns(password: string): string[] {
  const results: string[] = [];
  const datePatterns = [
    /^\d{2}[-./]\d{2}[-./]\d{4}$/,
    /^\d{4}[-./]\d{2}[-./]\d{2}$/,
    /^\d{8}$/,
    /^(0[1-9]|1[0-2])\d{4}$/,
  ];

  for (const pattern of datePatterns) {
    if (pattern.test(password)) {
      results.push(password);
    }
  }

  const yearPattern = /(19\d{2}|20[0-2]\d)/;
  const match = password.match(yearPattern);
  if (match && password.length <= 12) {
    results.push(match[0]);
  }

  return results;
}

export function detectSequence(password: string): SequenceCheckResult {
  const types: string[] = [];
  const patterns: string[] = [];

  const seqs = findSequentialChars(password);
  if (seqs.length > 0) {
    types.push("sequential");
    patterns.push(...seqs);
  }

  const repeats = findRepeatedChars(password);
  if (repeats.length > 0) {
    types.push("repeated");
    patterns.push(...repeats);
  }

  const substrings = findRepeatedSubstrings(password);
  if (substrings.length > 0) {
    types.push("repeatedSubstring");
    patterns.push(...substrings);
  }

  const dates = findDatePatterns(password);
  if (dates.length > 0) {
    types.push("date");
    patterns.push(...dates);
  }

  return { found: types.length > 0, types, patterns };
}
