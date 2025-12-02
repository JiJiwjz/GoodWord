import axios from 'axios';
import type {
  Word,
  WordStats,
  QuizSession,
  AnswerResult,
  QuizFinishData,
  QuizHistory,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ==================== 单词 API ====================

// 添加单词
export async function addWord(english: string): Promise<ApiResponse<Word>> {
  const response = await api. post<ApiResponse<Word>>('/words', { english });
  return response.data;
}

// 获取单词列表
export async function getWords(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  isCET4?: boolean;
  isCET6?: boolean;
  isIELTS?: boolean;
  isTOEFL?: boolean;
  isGraduate?: boolean;
}): Promise<PaginatedResponse<Word>> {
  const response = await api.get<PaginatedResponse<Word>>('/words', { params });
  return response.data;
}

// 获取单词详情
export async function getWordById(id: number): Promise<ApiResponse<Word>> {
  const response = await api.get<ApiResponse<Word>>(`/words/${id}`);
  return response. data;
}

// 更新单词
export async function updateWord(id: number, data: Partial<Word>): Promise<ApiResponse<Word>> {
  const response = await api.put<ApiResponse<Word>>(`/words/${id}`, data);
  return response.data;
}

// 删除单词
export async function deleteWord(id: number): Promise<ApiResponse<null>> {
  const response = await api. delete<ApiResponse<null>>(`/words/${id}`);
  return response.data;
}

// 获取单词统计
export async function getWordStats(): Promise<ApiResponse<WordStats>> {
  const response = await api.get<ApiResponse<WordStats>>('/words/stats');
  return response.data;
}

// ==================== 考核 API ====================

// 开始考核
export async function startQuiz(count: number): Promise<ApiResponse<QuizSession>> {
  const response = await api.post<ApiResponse<QuizSession>>('/quiz/start', { count });
  return response.data;
}

// 提交答案
export async function submitAnswer(
  sessionId: string,
  wordId: number,
  answer: string
): Promise<ApiResponse<AnswerResult>> {
  const response = await api.post<ApiResponse<AnswerResult>>('/quiz/submit', {
    sessionId,
    wordId,
    answer,
  });
  return response.data;
}

// 结束考核
export async function finishQuiz(sessionId: string): Promise<ApiResponse<QuizFinishData>> {
  const response = await api.post<ApiResponse<QuizFinishData>>('/quiz/finish', { sessionId });
  return response.data;
}

// 获取考核历史
export async function getQuizHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<QuizHistory>> {
  const response = await api.get<PaginatedResponse<QuizHistory>>('/quiz/history', { params });
  return response.data;
}

// 获取考核详情
export async function getQuizDetail(sessionId: string): Promise<ApiResponse<QuizFinishData>> {
  const response = await api.get<ApiResponse<QuizFinishData>>(`/quiz/${sessionId}`);
  return response.data;
}

export default api;
