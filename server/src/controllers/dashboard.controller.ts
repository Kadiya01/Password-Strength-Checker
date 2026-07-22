import { Request, Response, NextFunction } from "express";
import { dashboardService } from "@/services/dashboard.service";
import { ApiResponse } from "@/utils/ApiResponse";

export class DashboardController {
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getStatistics(req.user!.id);
      ApiResponse.success(res, 200, "Dashboard statistics retrieved", stats);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
