import { Request, Response, NextFunction } from "express";
import { userService } from "@/services/user.service";
import { ApiResponse } from "@/utils/ApiResponse";

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.id);
      ApiResponse.success(res, 200, "Profile retrieved", profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.updateProfile(req.user!.id, req.body);
      ApiResponse.success(res, 200, "Profile updated", profile);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
