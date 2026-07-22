import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt.config";

export class TokenService {
  signAccessToken(payload: { sub: string; email: string; role: string }): string {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions);
  }

  signRefreshToken(payload: { sub: string; email: string; role: string }, rememberMe = false): string {
    const expiresIn = rememberMe ? "30d" : jwtConfig.refreshExpiresIn;
    return jwt.sign(payload, jwtConfig.secret, { expiresIn } as jwt.SignOptions);
  }

  verify(token: string): jwt.JwtPayload {
    return jwt.verify(token, jwtConfig.secret) as jwt.JwtPayload;
  }

  decode(token: string): jwt.JwtPayload | null {
    return jwt.decode(token) as jwt.JwtPayload | null;
  }
}

export const tokenService = new TokenService();
