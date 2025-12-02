import { Router } from 'express';
import { validateStartQuiz, validateSubmitAnswer } from '../middlewares/validator';
import { asyncHandler } from '../middlewares/errorHandler';
import * as quizController from '../controllers/quizController';

const router = Router();

// POST /api/quiz/start - 开始新考核
router.post('/start', validateStartQuiz, asyncHandler(quizController.startQuiz));

// POST /api/quiz/submit - 提交答案
router.post('/submit', validateSubmitAnswer, asyncHandler(quizController.submitAnswer));

// POST /api/quiz/finish - 结束考核
router.post('/finish', asyncHandler(quizController.finishQuiz));

// GET /api/quiz/history - 获取考核历史
router.get('/history', asyncHandler(quizController.getHistory));

// GET /api/quiz/:sessionId - 获取考核详情
router.get('/:sessionId', asyncHandler(quizController.getQuizDetail));

export default router;
