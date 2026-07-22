import rateLimit from "express-rate-limit";
import { rateLimitConfig } from "@/config/rateLimit.config";

const isTest = process.env.NODE_ENV === "test";

const noopRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 1000000,
  keyGenerator: () => "test",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true,
});

export const rateLimiter = isTest
  ? noopRateLimit
  : rateLimit({
      ...rateLimitConfig.global,
      keyGenerator: (req) => req.ip ?? "unknown",
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
      },
    });

export const authRateLimiter = isTest
  ? noopRateLimit
  : rateLimit({
      ...rateLimitConfig.auth,
      keyGenerator: (req) => req.ip ?? "unknown",
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many authentication attempts. Please try again later.",
      },
    });

export const passwordCheckRateLimiter = isTest
  ? noopRateLimit
  : rateLimit({
      ...rateLimitConfig.passwordCheck,
      keyGenerator: (req) => req.ip ?? "unknown",
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many password check requests. Please slow down.",
      },
    });

export const passwordGenerateRateLimiter = isTest
  ? noopRateLimit
  : rateLimit({
      ...rateLimitConfig.passwordGenerate,
      keyGenerator: (req) => req.ip ?? "unknown",
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many password generation requests. Please slow down.",
      },
    });
