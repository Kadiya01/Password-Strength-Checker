import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt.config";
import { UnauthorizedError } from "@/utils/ApiError";
import { AuthenticatedUser } from "@/interfaces";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authentication required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
}
