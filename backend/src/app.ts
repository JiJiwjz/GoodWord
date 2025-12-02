import express from 'express';
import cors from 'cors';
import { config } from './config/index';
import { connectDatabase, disconnectDatabase } from './models/index';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes/index';

// 创建 Express 应用
const app = express();

// ==================== 中间件配置 ====================

// CORS 配置 - 允许所有来源
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 解析 JSON 请求体
app. use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 请求日志（开发环境）
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ==================== 路由配置 ====================

// API 路由
app.use('/api', routes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    name: '单词记忆助手 API',
    version: '1.0. 0',
    endpoints: {
      health: '/api/health',
      words: '/api/words',
      quiz: '/api/quiz',
    },
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404). json({
    success: false,
    error: `路由不存在: ${req.method} ${req.path}`,
  });
});

// ==================== 错误处理 ====================

app.use(errorHandler);

// ==================== 启动服务器 ====================

async function startServer() {
  try {
    // 连接数据库
    await connectDatabase();

    // 启动服务器 - 监听所有网络接口
    app.listen(Number(config.port), '0.0.0.0', () => {
      console. log('🚀 ================================');
      console. log(`🚀 单词记忆助手 API 服务已启动`);
      console. log(`🚀 环境: ${config. nodeEnv}`);
      console.log(`🚀 端口: ${config.port}`);
      console.log(`🚀 本地: http://localhost:${config.port}`);
      console.log(`🚀 网络: http://0.0.0.0:${config.port}`);
      console.log('🚀 ================================');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n👋 正在关闭服务器...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console. log('\n👋 正在关闭服务器.. .');
  await disconnectDatabase();
  process.exit(0);
});

// 启动
startServer();

export default app;
