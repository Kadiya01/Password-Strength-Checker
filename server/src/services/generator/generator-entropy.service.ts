import { GeneratorEntropyResult } from "@/interfaces";

const CRACK_TIME_THRESHOLDS: Array<{ minEntropy: number; time: string }> = [
  { minEntropy: 0, time: "Instantly" },
  { minEntropy: 20, time: "Instantly" },
  { minEntropy: 28, time: "Seconds" },
  { minEntropy: 35, time: "Minutes" },
  { minEntropy: 40, time: "Hours" },
  { minEntropy: 50, time: "Days" },
  { minEntropy: 55, time: "Months" },
  { minEntropy: 60, time: "Weeks" },
  { minEntropy: 65, time: "Months" },
  { minEntropy: 70, time: "Years" },
  { minEntropy: 80, time: "Millennia" },
  { minEntropy: 90, time: "Millions of years" },
  { minEntropy: 100, time: "Cosmic scale" },
];

export function calculateGeneratorEntropy(poolSize: number, length: number): GeneratorEntropyResult {
  if (poolSize <= 0 || length <= 0) {
    return { entropy: 0, poolSize: 0, searchSpace: 0, estimatedCrackTime: "Instantly" };
  }

  const entropy = parseFloat((Math.log2(poolSize) * length).toFixed(1));
  const searchSpace = Math.pow(poolSize, length);
  const estimatedCrackTime = lookupCrackTime(entropy);

  return {
    entropy,
    poolSize,
    searchSpace,
    estimatedCrackTime,
  };
}

function lookupCrackTime(entropy: number): string {
  let result = CRACK_TIME_THRESHOLDS[0].time;
  for (const row of CRACK_TIME_THRESHOLDS) {
    if (entropy >= row.minEntropy) {
      result = row.time;
    } else {
      break;
    }
  }
  return result;
}
