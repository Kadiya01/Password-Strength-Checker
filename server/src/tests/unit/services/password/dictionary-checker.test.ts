import { checkDictionary } from "@/services/password/dictionary-checker.service";

describe("DictionaryChecker", () => {
  it("should detect 'password'", () => {
    const result = checkDictionary("password");
    expect(result.found).toBe(true);
    expect(result.matched).toBe("password");
  });

  it("should detect '123456'", () => {
    const result = checkDictionary("123456");
    expect(result.found).toBe(true);
  });

  it("should detect 'qwerty'", () => {
    const result = checkDictionary("qwerty");
    expect(result.found).toBe(true);
  });

  it("should detect 'admin'", () => {
    const result = checkDictionary("admin");
    expect(result.found).toBe(true);
  });

  it("should be case insensitive", () => {
    const result = checkDictionary("PASSWORD");
    expect(result.found).toBe(true);
    expect(result.matched).toBe("password");
  });

  it("should detect with stripped separators", () => {
    const result = checkDictionary("pass-word");
    expect(result.found).toBe(true);
  });

  it("should not flag a strong unique password", () => {
    const result = checkDictionary("Xk9#mP2$vL7nQ!4w");
    expect(result.found).toBe(false);
  });

  it("should not flag empty string", () => {
    const result = checkDictionary("");
    expect(result.found).toBe(false);
  });

  it("should detect trailing-digit variants", () => {
    const result = checkDictionary("password123");
    expect(result.found).toBe(true);
  });

  it("should detect 'letmein'", () => {
    const result = checkDictionary("letmein");
    expect(result.found).toBe(true);
  });
});
