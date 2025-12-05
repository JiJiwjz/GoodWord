import { Router } from 'express';
import { validateStartQuiz } from '../middlewares/validator';
import { asyncHandler } from '../middlewares/errorHandler';
import * as quizController from '../controllers/quizController';

const router = Router();

// POST /api/quiz/start - 开始新考核
router. post('/start', validateStartQuiz, asyncHandler(quizController.startQuiz));

// POST /api/quiz/submit/phase1 - 提交阶段1答案（中译英）
router.post('/submit/phase1', asyncHandler(quizController.submitPhase1Answer));

// POST /api/quiz/submit/phase2 - 提交阶段2答案（英译中）
router.post('/submit/phase2', asyncHandler(quizController.submitPhase2Answer));

// POST /api/quiz/finish - 结束考核
router.post('/finish', asyncHandler(quizController.finishQuiz));

// GET /api/quiz/history - 获取考核历史
router.get('/history', asyncHandler(quizController.getHistory));

// GET /api/quiz/:sessionId - 获取考核详情
router.get('/:sessionId', asyncHandler(quizController. getQuizDetail));

export default router;
