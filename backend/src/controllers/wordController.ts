import { Request, Response } from 'express';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import * as wordService from '../services/wordService';

// 添加单词
export async function addWord(req: Request, res: Response) {
  const { english } = req.body;

  console.log('📝 添加单词:', english);

  const result = await wordService.addWord(english);

  if (! result.success) {
    return errorResponse(res, result.error || '添加失败', 400);
  }

  return successResponse(res, result.data, '单词添加成功', 201);
}

// 获取单词列表
export async function getWords(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const search = req.query.search as string;

  // 解析筛选条件
  const filter: Record<string, boolean> = {};
  if (req.query.isCET4 === 'true') filter.isCET4 = true;
  if (req.query.isCET6 === 'true') filter.isCET6 = true;
  if (req. query.isIELTS === 'true') filter.isIELTS = true;
  if (req.query.isTOEFL === 'true') filter.isTOEFL = true;
  if (req. query.isGraduate === 'true') filter.isGraduate = true;

  const result = await wordService.getWords({
    page,
    pageSize,
    search,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  });

  return paginatedResponse(res, result. items, result.total, result.page, result.pageSize);
}

// 获取单词详情
export async function getWordById(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return errorResponse(res, '无效的单词 ID', 400);
  }

  const result = await wordService.getWordById(id);

  if (!result.success) {
    return errorResponse(res, result.error || '单词不存在', 404);
  }

  return successResponse(res, result.data);
}

// 更新单词
export async function updateWord(req: Request, res: Response) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return errorResponse(res, '无效的单词 ID', 400);
  }

  const result = await wordService.updateWord(id, req.body);

  if (!result.success) {
    return errorResponse(res, result.error || '更新失败', 400);
  }

  return successResponse(res, result.data, '更新成功');
}

// 删除单词
export async function deleteWord(req: Request, res: Response) {
  const id = parseInt(req.params. id);

  if (isNaN(id)) {
    return errorResponse(res, '无效的单词 ID', 400);
  }

  const result = await wordService.deleteWord(id);

  if (!result. success) {
    return errorResponse(res, result.error || '删除失败', 400);
  }

  return successResponse(res, null, '删除成功');
}

// 获取统计信息
export async function getStats(req: Request, res: Response) {
  const stats = await wordService.getWordStats();
  return successResponse(res, stats);
}
