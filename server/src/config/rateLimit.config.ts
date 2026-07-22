import { config } from "./index";

export const rateLimitConfig = {
  global: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts. Please try again later.",
  },
  passwordCheck: {
    windowMs: 60 * 1000,
    max: 30,
    message: "Too many password check requests. Please slow down.",
  },
  passwordGenerate: {
    windowMs: 60 * 1000,
    max: 20,
    message: "Too many password generation requests. Please slow down.",
  },
} as const;
