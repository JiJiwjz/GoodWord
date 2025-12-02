import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

// 验证添加单词请求
export function validateAddWord(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const { english } = req.body;

  if (!english || typeof english !== 'string') {
    return errorResponse(res, '请提供有效的英文单词或短语', 400);
  }

  const trimmed = english.trim();
  if (trimmed.length === 0) {
    return errorResponse(res, '单词不能为空', 400);
  }

  if (trimmed.length > 100) {
    return errorResponse(res, '单词或短语长度不能超过100个字符', 400);
  }

  // 将处理后的值放回 body
  req.body.english = trimmed;
  next();
}

// 验证开始考核请求
export function validateStartQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const { count } = req.body;
  const validCounts = [10, 20, 30, 50];

  if (!count || !validCounts.includes(count)) {
    return errorResponse(
      res,
      `请选择有效的考核数量: ${validCounts.join(', ')}`,
      400
    );
  }

  next();
}

// 验证提交答案请求
export function validateSubmitAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const { sessionId, wordId, answer } = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return errorResponse(res, '无效的考核批次ID', 400);
  }

  if (!wordId || typeof wordId !== 'number') {
    return errorResponse(res, '无效的单词ID', 400);
  }

  if (typeof answer !== 'string') {
    return errorResponse(res, '请提供答案', 400);
  }

  next();
}
