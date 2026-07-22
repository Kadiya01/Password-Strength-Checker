import { Request, Response } from "express";
import { ApiResponse } from "@/utils/ApiResponse";

export function notFoundHandler(_req: Request, res: Response): void {
  ApiResponse.error(res, 404, "Route not found");
}
