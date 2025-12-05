import { Request, Response } from 'express';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import * as quizService from '../services/quizService';

// 开始考核
export async function startQuiz(req: Request, res: Response) {
  const { count } = req.body;

  console.log('🎯 开始考核，数量:', count);

  const result = await quizService.startQuiz(count);

  if (! result.success) {
    return errorResponse(res, result.error || '开始考核失败', 400);
  }

  return successResponse(res, result.data, '考核开始');
}

// 提交阶段1答案（中译英）
export async function submitPhase1Answer(req: Request, res: Response) {
  const { sessionId, wordId, answer } = req. body;

  const result = await quizService.submitPhase1Answer(sessionId, wordId, answer);

  if (! result.success) {
    return errorResponse(res, result. error || '提交答案失败', 400);
  }

  return successResponse(res, result. data);
}

// 提交阶段2答案（英译中）
export async function submitPhase2Answer(req: Request, res: Response) {
  const { sessionId, wordId, selectedIndex } = req.body;

  const result = await quizService. submitPhase2Answer(sessionId, wordId, selectedIndex);

  if (!result.success) {
    return errorResponse(res, result.error || '提交答案失败', 400);
  }

  return successResponse(res, result. data);
}

// 结束考核
export async function finishQuiz(req: Request, res: Response) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return errorResponse(res, '请提供考核批次 ID', 400);
  }

  const result = await quizService.finishQuiz(sessionId);

  if (! result.success) {
    return errorResponse(res, result. error || '结束考核失败', 400);
  }

  return successResponse(res, result.data, '考核结束');
}

// 获取考核历史
export async function getHistory(req: Request, res: Response) {
  const page = parseInt(req. query.page as string) || 1;
  const pageSize = parseInt(req. query.pageSize as string) || 10;

  const result = await quizService.getQuizHistory(page, pageSize);

  return paginatedResponse(res, result.items, result.total, result.page, result. pageSize);
}

// 获取考核详情
export async function getQuizDetail(req: Request, res: Response) {
  const { sessionId } = req.params;

  if (! sessionId) {
    return errorResponse(res, '请提供考核批次 ID', 400);
  }

  const result = await quizService.getQuizDetail(sessionId);

  if (!result.success) {
    return errorResponse(res, result.error || '获取考核详情失败', 404);
  }

  return successResponse(res, result.data);
}
