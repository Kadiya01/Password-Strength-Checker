import jwt from "jsonwebtoken";
import crypto from "crypto";
import { jwtConfig } from "@/config/jwt.config";

const ACCESS_ALGORITHM = "HS256";
const REFRESH_ALGORITHM = "HS256";

export class TokenService {
  signAccessToken(payload: { sub: string; email: string; role: string }): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: ACCESS_ALGORITHM,
    } as jwt.SignOptions);
  }

  signRefreshToken(payload: { sub: string; email: string; role: string }, rememberMe = false): string {
    const expiresIn = rememberMe ? "30d" : jwtConfig.refreshExpiresIn;
    return jwt.sign(
      { ...payload, jti: crypto.randomUUID() },
      jwtConfig.refreshSecret,
      { expiresIn, algorithm: REFRESH_ALGORITHM } as jwt.SignOptions
    );
  }

  verifyAccessToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [ACCESS_ALGORITHM],
    }) as jwt.JwtPayload;
  }

  verifyRefreshToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, jwtConfig.refreshSecret, {
      algorithms: [REFRESH_ALGORITHM],
    }) as jwt.JwtPayload;
  }

  verify(token: string): jwt.JwtPayload {
    return this.verifyAccessToken(token);
  }

  decode(token: string): jwt.JwtPayload | null {
    return jwt.decode(token) as jwt.JwtPayload | null;
  }
}

export const tokenService = new TokenService();
