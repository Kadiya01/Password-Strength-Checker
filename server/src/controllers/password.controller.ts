import { Request, Response, NextFunction } from "express";
import { passwordService } from "@/services/password.service";
import { ApiResponse } from "@/utils/ApiResponse";

export class PasswordController {
  async checkStrength(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = passwordService.checkStrength(req.body.password);

      if (req.user) {
        await passwordService.logStrengthCheck(req.user.id, result);
      }

      ApiResponse.success(res, 200, "Password strength analyzed", result);
    } catch (error) {
      next(error);
    }
  }

  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = passwordService.generate(req.body);
      ApiResponse.success(res, 200, "Password generated", result);
    } catch (error) {
      next(error);
    }
  }

  async generatePassphrase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = passwordService.generatePassphrase(req.body);
      ApiResponse.success(res, 200, "Passphrase generated", result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await passwordService.getHistory(req.user!.id, req.query as { page?: string; limit?: string });
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }
}

export const passwordController = new PasswordController();
