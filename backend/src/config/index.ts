import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // 服务器配置
  port: process.env.PORT || 3000,
  nodeEnv: process. env.NODE_ENV || 'development',
  
  // 数据库配置
  databaseUrl: process. env.DATABASE_URL || 'file:./dev.db',
  
  // 通义千问 API 配置
  dashscopeApiKey: process.env. DASHSCOPE_API_KEY || '',
  dashscopeBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  
  // CORS 配置 - 允许所有来源（开发环境）
  frontendUrl: process. env.FRONTEND_URL || '*',
};
