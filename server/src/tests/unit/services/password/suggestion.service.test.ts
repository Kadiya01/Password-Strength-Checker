import { generateSuggestions } from "@/services/password/suggestion.service";

describe("SuggestionService", () => {
  it("should suggest increasing length for short passwords", () => {
    const suggestions = generateSuggestions({
      length: 8,
      checks: { length: false, uppercase: true, lowercase: true, numbers: true, symbols: true, dictionary: false, keyboardPattern: false, sequence: false, repeated: false },
      isPassphrase: false,
      entropy: 40,
    });
    expect(suggestions.some((s) => s.includes("length"))).toBe(true);
  });

  it("should suggest uppercase when missing", () => {
    const suggestions = generateSuggestions({
      length: 12,
      checks: { length: true, uppercase: false, lowercase: true, numbers: true, symbols: true, dictionary: false, keyboardPattern: false, sequence: false, repeated: false },
      isPassphrase: false,
      entropy: 50,
    });
    expect(suggestions.some((s) => s.includes("uppercase"))).toBe(true);
  });

  it("should suggest avoiding dictionary words", () => {
    const suggestions = generateSuggestions({
      length: 12,
      checks: { length: true, uppercase: true, lowercase: true, numbers: true, symbols: true, dictionary: true, keyboardPattern: false, sequence: false, repeated: false },
      isPassphrase: false,
      entropy: 50,
    });
    expect(suggestions.some((s) => s.includes("common passwords") || s.includes("breach"))).toBe(true);
  });

  it("should suggest avoiding keyboard patterns", () => {
    const suggestions = generateSuggestions({
      length: 12,
      checks: { length: true, uppercase: true, lowercase: true, numbers: true, symbols: true, dictionary: false, keyboardPattern: true, sequence: false, repeated: false },
      isPassphrase: false,
      entropy: 50,
    });
    expect(suggestions.some((s) => s.includes("keyboard"))).toBe(true);
  });

  it("should suggest passphrase for short non-passphrase passwords", () => {
    const suggestions = generateSuggestions({
      length: 10,
      checks: { length: true, uppercase: true, lowercase: true, numbers: true, symbols: false, dictionary: false, keyboardPattern: false, sequence: false, repeated: false },
      isPassphrase: false,
      entropy: 45,
    });
    expect(suggestions.some((s) => s.includes("passphrase"))).toBe(true);
  });

  it("should return fewer suggestions for strong passwords", () => {
    const suggestions = generateSuggestions({
      length: 20,
      checks: { length: true, uppercase: true, lowercase: true, numbers: true, symbols: true, dictionary: false, keyboardPattern: false, sequence: false, repeated: false },
      isPassphrase: true,
      entropy: 80,
    });
    expect(suggestions.length).toBe(0);
  });
});
