import { CrackTimes } from "@/interfaces";

const CRACK_TIME_TABLE: Array<{ minEntropy: number; offline: string; online: string; gpu: string; dictionary: string }> = [
  { minEntropy: 0,   offline: "Instantly",     online: "Instantly",     gpu: "Instantly",     dictionary: "Instantly" },
  { minEntropy: 20,  offline: "Instantly",     online: "Instantly",     gpu: "Instantly",     dictionary: "Instantly" },
  { minEntropy: 28,  offline: "Instantly",     online: "Seconds",       gpu: "Instantly",     dictionary: "Instantly" },
  { minEntropy: 35,  offline: "Seconds",       online: "Minutes",       gpu: "Seconds",       dictionary: "Instantly" },
  { minEntropy: 40,  offline: "Minutes",       online: "Hours",         gpu: "Minutes",       dictionary: "Seconds" },
  { minEntropy: 50,  offline: "Hours",         online: "Days",          gpu: "Minutes",       dictionary: "Minutes" },
  { minEntropy: 55,  offline: "Days",          online: "Months",        gpu: "Hours",         dictionary: "Hours" },
  { minEntropy: 60,  offline: "Weeks",         online: "Years",         gpu: "Days",          dictionary: "Days" },
  { minEntropy: 65,  offline: "Months",        online: "Decades",       gpu: "Weeks",         dictionary: "Weeks" },
  { minEntropy: 70,  offline: "Years",         online: "Centuries",     gpu: "Months",        dictionary: "Months" },
  { minEntropy: 80,  offline: "Millennia",     online: "Millennia",     gpu: "Years",         dictionary: "Years" },
  { minEntropy: 90,  offline: "Millions of years", online: "Heat death of universe", gpu: "Decades", dictionary: "Decades" },
  { minEntropy: 100, offline: "Cosmic scale",  online: "Cosmic scale",  gpu: "Millennia",     dictionary: "Centuries" },
];

function lookupTime(entropy: number, field: "offline" | "online" | "gpu" | "dictionary"): string {
  let result = CRACK_TIME_TABLE[0][field];
  for (const row of CRACK_TIME_TABLE) {
    if (entropy >= row.minEntropy) {
      result = row[field];
    } else {
      break;
    }
  }
  return result;
}

export function estimateCrackTime(entropy: number): string {
  return lookupTime(entropy, "gpu");
}

export function estimateCrackTimes(entropy: number): CrackTimes {
  return {
    offline: lookupTime(entropy, "offline"),
    online: lookupTime(entropy, "online"),
    gpu: lookupTime(entropy, "gpu"),
    dictionary: lookupTime(entropy, "dictionary"),
  };
}
