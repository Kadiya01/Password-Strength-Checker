import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, profileSchema } from "@/utils/validators";

describe("loginSchema", () => {
  it("should pass with valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("should fail with empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("should fail with empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("should accept optional rememberMe", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "pass", rememberMe: true });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "StrongP@ss1",
    confirmPassword: "StrongP@ss1",
    terms: true,
  };

  it("should pass with valid data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail when passwords do not match", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "DifferentP@ss1" });
    expect(result.success).toBe(false);
  });

  it("should fail with short password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Ab1!", confirmPassword: "Ab1!" });
    expect(result.success).toBe(false);
  });

  it("should fail without uppercase letter", () => {
    const result = registerSchema.safeParse({ ...validData, password: "strongpass1!", confirmPassword: "strongpass1!" });
    expect(result.success).toBe(false);
  });

  it("should fail without special character", () => {
    const result = registerSchema.safeParse({ ...validData, password: "StrongPass1", confirmPassword: "StrongPass1" });
    expect(result.success).toBe(false);
  });

  it("should fail without accepting terms", () => {
    const result = registerSchema.safeParse({ ...validData, terms: false });
    expect(result.success).toBe(false);
  });

  it("should fail with short fullName", () => {
    const result = registerSchema.safeParse({ ...validData, fullName: "A" });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("should pass with valid data", () => {
    const result = profileSchema.safeParse({ fullName: "Test User", email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid email", () => {
    const result = profileSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("should fail with short fullName", () => {
    const result = profileSchema.safeParse({ fullName: "A" });
    expect(result.success).toBe(false);
  });

  it("should fail with invalid username characters", () => {
    const result = profileSchema.safeParse({ username: "user name!" });
    expect(result.success).toBe(false);
  });

  it("should accept valid username", () => {
    const result = profileSchema.safeParse({ username: "user_name123" });
    expect(result.success).toBe(true);
  });
});
