import { Request, Response, NextFunction } from "express";
import { dashboardService } from "@/services/dashboard.service";
import { analyticsService } from "@/services/analytics.service";
import { reportExportService } from "@/services/report-export.service";
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

  async getSecurityScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const score = await dashboardService.getSecurityScore(req.user!.id);
      ApiResponse.success(res, 200, "Security score retrieved", score);
    } catch (error) {
      next(error);
    }
  }

  async getLoginHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, startDate, endDate } = req.query;
      const result = await dashboardService.getLoginHistory(req.user!.id, {
        page: page as string,
        limit: limit as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      ApiResponse.success(res, 200, "Login history retrieved", result);
    } catch (error) {
      next(error);
    }
  }

  async getSecurityEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, eventType } = req.query;
      const result = await dashboardService.getSecurityEvents(req.user!.id, {
        page: page as string,
        limit: limit as string,
        eventType: eventType as string,
      });
      ApiResponse.success(res, 200, "Security events retrieved", result);
    } catch (error) {
      next(error);
    }
  }

  async getActivityTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, type } = req.query;
      const result = await dashboardService.getActivityTimeline(req.user!.id, {
        page: page as string,
        limit: limit as string,
        type: type as "login" | "password_check" | "security_event" | "registration",
      });
      ApiResponse.success(res, 200, "Activity timeline retrieved", result);
    } catch (error) {
      next(error);
    }
  }

  async getPasswordAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await dashboardService.getPasswordAnalytics(req.user!.id);
      ApiResponse.success(res, 200, "Password analytics retrieved", analytics);
    } catch (error) {
      next(error);
    }
  }

  async getChartData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const chartData = await analyticsService.getChartData(req.user!.id);
      ApiResponse.success(res, 200, "Chart data retrieved", chartData);
    } catch (error) {
      next(error);
    }
  }

  async getPasswordGenerationStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await analyticsService.getPasswordGenerationStats(req.user!.id);
      ApiResponse.success(res, 200, "Password generation stats retrieved", stats);
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format, type, startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const exportResult = await reportExportService.exportData(
        req.user!.id,
        (type as "password_logs" | "login_history" | "security_events") || "password_logs",
        (format as "csv" | "json") || "json",
        start,
        end
      );

      res.setHeader("Content-Type", exportResult.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
      res.send(exportResult.data);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
