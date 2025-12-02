import { PrismaClient } from '@prisma/client';

// 创建 Prisma 客户端单例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma. prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 数据库连接测试
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process. exit(1);
  }
}

// 数据库断开连接
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📤 数据库连接已断开');
}
