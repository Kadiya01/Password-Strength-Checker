import { describe, it, expect } from "vitest";
import { formatDate, getStrengthColor, getStrengthBgColor, getStrengthBarColor } from "@/utils/formatters";

describe("formatDate", () => {
  it("should format a valid date string", () => {
    const result = formatDate("2025-01-15T10:30:00Z");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should format a Date object", () => {
    const result = formatDate(new Date("2025-06-01T12:00:00Z"));
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});

describe("getStrengthColor", () => {
  it("should return emerald for score >= 91", () => {
    expect(getStrengthColor(95)).toContain("emerald");
  });

  it("should return green for score 76-90", () => {
    expect(getStrengthColor(80)).toContain("green");
  });

  it("should return yellow for score 51-75", () => {
    expect(getStrengthColor(60)).toContain("yellow");
  });

  it("should return orange for score 26-50", () => {
    expect(getStrengthColor(35)).toContain("orange");
  });

  it("should return red for score < 26", () => {
    expect(getStrengthColor(10)).toContain("red");
  });
});

describe("getStrengthBgColor", () => {
  it("should return bg-emerald for high score", () => {
    expect(getStrengthBgColor(95)).toContain("bg-emerald");
  });

  it("should return bg-red for low score", () => {
    expect(getStrengthBgColor(10)).toContain("bg-red");
  });
});

describe("getStrengthBarColor", () => {
  it("should return bg-green for strong score", () => {
    expect(getStrengthBarColor(80)).toContain("bg-green");
  });

  it("should return bg-red for weak score", () => {
    expect(getStrengthBarColor(5)).toContain("bg-red");
  });
});
