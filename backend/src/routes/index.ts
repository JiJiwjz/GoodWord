import { Router } from 'express';
import wordRoutes from './wordRoutes';
import quizRoutes from './quizRoutes';
import { getWordInfo } from '../services/aiService';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

// AI 服务测试接口
router.get('/test-ai', async (req, res) => {
  const word = (req.query.word as string) || 'hello';
  
  console.log(`🤖 测试 AI 服务，单词: ${word}`);
  
  const result = await getWordInfo(word);
  
  res.json({
    success: result.success,
    word,
    data: result.data,
    error: result.error,
  });
});

// 注册路由
router.use('/words', wordRoutes);
router.use('/quiz', quizRoutes);

export default router;
