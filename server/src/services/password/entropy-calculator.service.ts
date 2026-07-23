import { EntropyResult } from "@/interfaces";

export function calculateEntropy(password: string): EntropyResult {
  if (password.length === 0) {
    return { bits: 0, poolSize: 0, searchSpace: "2^0", algorithm: "Empty input" };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  // eslint-disable-next-line no-control-regex
  const hasUnicode = /[^\x00-\x7F]/.test(password);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32;
  if (hasUnicode) poolSize += 100;

  if (poolSize === 0) poolSize = 26;

  const bits = parseFloat((Math.log2(poolSize) * password.length).toFixed(1));

  return {
    bits,
    poolSize,
    searchSpace: `2^${bits}`,
    algorithm: `Shannon entropy: log2(${poolSize}) * ${password.length} = ${bits} bits`,
  };
}
