import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// 全局错误处理中间件
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error('❌ Error:', err);

  // 处理自定义错误
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // 处理 Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2002') {
      return errorResponse(res, '该记录已存在', 409);
    }
    if (prismaError.code === 'P2025') {
      return errorResponse(res, '记录不存在', 404);
    }
  }

  // 处理其他错误
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : '服务器内部错误';
  
  return errorResponse(res, message, 500);
}

// 异步处理器包装（捕获 async 函数中的错误）
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
