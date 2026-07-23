import { calculateScore, getStrengthLabel } from "@/services/password/scoring-engine.service";

describe("ScoringEngine", () => {
  it("should give 0 for empty password", () => {
    const score = calculateScore({
      length: 0, entropy: 0, isPassphrase: false,
      dictionaryHit: false, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: false, hasLowercase: false, hasNumbers: false, hasSymbols: false,
    });
    expect(score).toBe(0);
  });

  it("should penalize dictionary hits heavily", () => {
    const clean = calculateScore({
      length: 10, entropy: 40, isPassphrase: false,
      dictionaryHit: false, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: true, hasSymbols: true,
    });
    const dirty = calculateScore({
      length: 10, entropy: 40, isPassphrase: false,
      dictionaryHit: true, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: true, hasSymbols: true,
    });
    expect(dirty).toBeLessThan(clean);
    expect(clean - dirty).toBe(50);
  });

  it("should penalize keyboard patterns", () => {
    const clean = calculateScore({
      length: 10, entropy: 40, isPassphrase: false,
      dictionaryHit: false, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: true, hasSymbols: true,
    });
    const dirty = calculateScore({
      length: 10, entropy: 40, isPassphrase: false,
      dictionaryHit: false, keyboardPattern: true, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: true, hasSymbols: true,
    });
    expect(dirty).toBeLessThan(clean);
  });

  it("should bonus passphrase", () => {
    const nonPass = calculateScore({
      length: 16, entropy: 60, isPassphrase: false,
      dictionaryHit: false, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: false, hasSymbols: false,
    });
    const pass = calculateScore({
      length: 16, entropy: 60, isPassphrase: true,
      dictionaryHit: false, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: false, hasSymbols: false,
    });
    expect(pass).toBeGreaterThan(nonPass);
  });

  it("should clamp score to 0-100", () => {
    const score = calculateScore({
      length: 128, entropy: 200, isPassphrase: true,
      dictionaryHit: false, keyboardPattern: false, sequence: false, repeated: false,
      hasUppercase: true, hasLowercase: true, hasNumbers: true, hasSymbols: true,
    });
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("getStrengthLabel", () => {
  it("should return 'Very Weak' for 0-19", () => {
    expect(getStrengthLabel(0)).toBe("Very Weak");
    expect(getStrengthLabel(19)).toBe("Very Weak");
  });

  it("should return 'Weak' for 20-39", () => {
    expect(getStrengthLabel(20)).toBe("Weak");
    expect(getStrengthLabel(39)).toBe("Weak");
  });

  it("should return 'Fair' for 40-59", () => {
    expect(getStrengthLabel(40)).toBe("Fair");
    expect(getStrengthLabel(59)).toBe("Fair");
  });

  it("should return 'Good' for 60-74", () => {
    expect(getStrengthLabel(60)).toBe("Good");
    expect(getStrengthLabel(74)).toBe("Good");
  });

  it("should return 'Strong' for 75-89", () => {
    expect(getStrengthLabel(75)).toBe("Strong");
    expect(getStrengthLabel(89)).toBe("Strong");
  });

  it("should return 'Excellent' for 90-100", () => {
    expect(getStrengthLabel(90)).toBe("Excellent");
    expect(getStrengthLabel(100)).toBe("Excellent");
  });
});
