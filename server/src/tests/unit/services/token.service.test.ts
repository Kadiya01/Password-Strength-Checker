import jwt from "jsonwebtoken";

const JWT_SECRET = "test-access-secret-key-for-testing-32ch";
const JWT_REFRESH_SECRET = "test-refresh-secret-key-for-testing-32ch";

jest.mock("@/config/jwt.config", () => ({
  jwtConfig: {
    secret: "test-access-secret-key-for-testing-32ch",
    refreshSecret: "test-refresh-secret-key-for-testing-32ch",
    expiresIn: "15m",
    refreshExpiresIn: "7d",
  },
}));

import { TokenService } from "@/services/token.service";

describe("TokenService", () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
  });

  describe("signAccessToken", () => {
    it("should return a valid JWT string", () => {
      const token = tokenService.signAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      expect(typeof token).toBe("string");
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });

    it("should contain correct userId, email, role", () => {
      const token = tokenService.signAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      expect(decoded.sub).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.role).toBe("USER");
    });

    it("should have expiration set", () => {
      const token = tokenService.signAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp! - decoded.iat!).toBeGreaterThan(0);
    });
  });

  describe("signRefreshToken", () => {
    it("should return a valid JWT string with default expiry", () => {
      const token = tokenService.signRefreshToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
      expect(decoded).toBeDefined();
    });

    it("should contain correct payload", () => {
      const token = tokenService.signRefreshToken({
        sub: "user-123",
        email: "test@example.com",
        role: "ADMIN",
      });

      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
      expect(decoded.sub).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.role).toBe("ADMIN");
    });

    it("should contain a jti claim", () => {
      const token = tokenService.signRefreshToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
      expect(decoded.jti).toBeDefined();
      expect(typeof decoded.jti).toBe("string");
    });

    it("should use 30d expiry when rememberMe is true", () => {
      const token = tokenService.signRefreshToken(
        { sub: "user-123", email: "test@example.com", role: "USER" },
        true,
      );

      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      const tokenLifetime = decoded.exp! - decoded.iat!;
      expect(tokenLifetime).toBeGreaterThanOrEqual(thirtyDaysInSeconds);
    });

    it("should use 7d expiry when rememberMe is false", () => {
      const token = tokenService.signRefreshToken(
        { sub: "user-123", email: "test@example.com", role: "USER" },
        false,
      );

      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      const tokenLifetime = decoded.exp! - decoded.iat!;
      expect(tokenLifetime).toBeGreaterThanOrEqual(sevenDaysInSeconds);
      expect(tokenLifetime).toBeLessThan(thirtyDaysInSeconds);
    });
  });

  describe("verifyAccessToken", () => {
    it("should succeed with a valid access token", () => {
      const token = tokenService.signAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.sub).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
    });

    it("should throw for an expired token", () => {
      const token = jwt.sign(
        { sub: "user-123", email: "test@example.com", role: "USER" },
        JWT_SECRET,
        { expiresIn: "0s", algorithm: "HS256" },
      );

      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });

    it("should throw for an invalid signature", () => {
      const token = jwt.sign(
        { sub: "user-123", email: "test@example.com", role: "USER" },
        "wrong-secret",
        { algorithm: "HS256" },
      );

      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });

    it("should throw for a malformed token", () => {
      expect(() => tokenService.verifyAccessToken("not.a.valid.jwt")).toThrow();
    });

    it("should throw for an empty string", () => {
      expect(() => tokenService.verifyAccessToken("")).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should succeed with a valid refresh token", () => {
      const token = tokenService.signRefreshToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = tokenService.verifyRefreshToken(token);
      expect(decoded.sub).toBe("user-123");
      expect(decoded.jti).toBeDefined();
    });

    it("should throw when verifying refresh token with access secret", () => {
      const token = tokenService.signRefreshToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });
  });

  describe("verify (backward compatibility)", () => {
    it("should delegate to verifyAccessToken", () => {
      const token = tokenService.signAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = tokenService.verify(token);
      expect(decoded.sub).toBe("user-123");
    });
  });

  describe("decode", () => {
    it("should decode a valid token without verifying", () => {
      const token = tokenService.signAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "USER",
      });

      const decoded = tokenService.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded!.sub).toBe("user-123");
    });

    it("should decode an expired token (no verification)", () => {
      const token = jwt.sign(
        { sub: "user-123", email: "test@example.com", role: "USER" },
        JWT_SECRET,
        { expiresIn: "0s" },
      );

      const decoded = tokenService.decode(token);
      expect(decoded).toBeDefined();
    });

    it("should return null for invalid token", () => {
      const decoded = tokenService.decode("not-a-jwt");
      expect(decoded).toBeNull();
    });
  });
});
