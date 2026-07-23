import { describe, it, expect } from "vitest";
import { cn } from "@/utils/cn";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle single class", () => {
    const result = cn("text-sm");
    expect(result).toBe("text-sm");
  });

  it("should handle tailwind merge conflicts", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });
});
