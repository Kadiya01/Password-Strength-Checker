import { Request, Response, NextFunction } from "express";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { ApiResponse } from "@/utils/ApiResponse";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body, {
        ipAddress: req.ip ?? "unknown",
        userAgent: req.get("user-agent") ?? "unknown",
      });
      ApiResponse.success(res, 201, "Registration successful", result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body, {
        ipAddress: req.ip ?? "unknown",
        userAgent: req.get("user-agent") ?? "unknown",
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: (req.body.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 200, "Login successful", {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.id, {
          ipAddress: req.ip ?? "unknown",
          userAgent: req.get("user-agent") ?? "unknown",
        });
      }

      res.clearCookie("refreshToken");
      ApiResponse.success(res, 200, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        ApiResponse.error(res, 401, "Refresh token required");
        return;
      }

      const result = await authService.refreshToken(token);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 200, "Token refreshed successfully", {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body);
      ApiResponse.success(
        res,
        200,
        "If an account with that email exists, a reset link has been sent.",
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body);
      ApiResponse.success(res, 200, "Password has been reset successfully");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!.id, req.body, {
        ipAddress: req.ip ?? "unknown",
        userAgent: req.get("user-agent") ?? "unknown",
      });
      ApiResponse.success(res, 200, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.verifyEmail(req.body);
      ApiResponse.success(res, 200, "Email verified successfully");
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.id);
      ApiResponse.success(res, 200, "Profile retrieved", profile);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
