import { Router } from 'express';
import { validateAddWord } from '../middlewares/validator';
import { asyncHandler } from '../middlewares/errorHandler';
import * as wordController from '../controllers/wordController';

const router = Router();

// GET /api/words/stats - 获取统计信息（放在 /:id 前面）
router.get('/stats', asyncHandler(wordController.getStats));

// POST /api/words - 添加新单词
router.post('/', validateAddWord, asyncHandler(wordController.addWord));

// GET /api/words - 获取单词列表
router.get('/', asyncHandler(wordController. getWords));

// GET /api/words/:id - 获取单词详情
router.get('/:id', asyncHandler(wordController.getWordById));

// PUT /api/words/:id - 更新单词
router. put('/:id', asyncHandler(wordController.updateWord));

// DELETE /api/words/:id - 删除单词
router.delete('/:id', asyncHandler(wordController.deleteWord));

export default router;
