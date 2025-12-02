import { randomUUID } from 'crypto';

// 生成唯一 ID
export function generateId(): string {
  return randomUUID();
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 安全解析 JSON
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON. parse(json) as T;
  } catch {
    return defaultValue;
  }
}

// 字符串转 JSON 字符串（用于存储数组）
export function toJsonString(value: unknown): string {
  return JSON. stringify(value);
}

// 比较单词答案（忽略大小写和首尾空格）
export function compareAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  return normalizedUser === normalizedCorrect;
}
