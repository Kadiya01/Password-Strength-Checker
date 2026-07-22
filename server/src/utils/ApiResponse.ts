import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponse {
  static success<T>(res: Response, statusCode: number, message: string, data?: T): Response {
    const body: SuccessResponse<T> = {
      success: true,
      message,
    };
    if (data !== undefined) {
      body.data = data;
    }
    return res.status(statusCode).json(body);
  }

  static error(res: Response, statusCode: number, message: string, errors?: Array<{ field: string; message: string }>): Response {
    const body: ErrorResponse = {
      success: false,
      message,
    };
    if (errors && errors.length > 0) {
      body.errors = errors;
    }
    return res.status(statusCode).json(body);
  }

  static paginated<T>(res: Response, data: T[], total: number, page: number, limit: number): Response {
    return ApiResponse.success(res, 200, "Data retrieved successfully", {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedData<T>);
  }
}
