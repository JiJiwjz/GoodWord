import { Response } from 'express';

// 统一响应接口
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 成功响应
export function successResponse<T>(
  res: Response,
  data: T,
  message = '操作成功',
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

// 错误响应
export function errorResponse(
  res: Response,
  error: string,
  statusCode = 400
): Response {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res. status(statusCode). json(response);
}

// 分页响应
interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number
): Response {
  const totalPages = Math. ceil(total / pageSize);
  const data: PaginatedData<T> = {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
  return successResponse(res, data);
}
