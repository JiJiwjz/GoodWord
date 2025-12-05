import axios from 'axios';
import type {
  Word,
  WordStats,
  QuizSession,
  Phase1AnswerResult,
  Phase2AnswerResult,
  QuizFinishData,
  QuizHistory,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,  // 增加超时时间，因为生成干扰选项需要时间
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ==================== 单词 API ====================

export async function addWord(english: string): Promise<ApiResponse<Word>> {
  const response = await api. post<ApiResponse<Word>>('/words', { english });
  return response.data;
}

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

export async function getWordById(id: number): Promise<ApiResponse<Word>> {
  const response = await api.get<ApiResponse<Word>>(`/words/${id}`);
  return response.data;
}

export async function updateWord(id: number, data: Partial<Word>): Promise<ApiResponse<Word>> {
  const response = await api.put<ApiResponse<Word>>(`/words/${id}`, data);
  return response.data;
}

export async function deleteWord(id: number): Promise<ApiResponse<null>> {
  const response = await api. delete<ApiResponse<null>>(`/words/${id}`);
  return response.data;
}

export async function getWordStats(): Promise<ApiResponse<WordStats>> {
  const response = await api.get<ApiResponse<WordStats>>('/words/stats');
  return response.data;
}

// ==================== 考核 API ====================

export async function startQuiz(count: number): Promise<ApiResponse<QuizSession>> {
  const response = await api.post<ApiResponse<QuizSession>>('/quiz/start', { count });
  return response.data;
}

// 提交阶段1答案（中译英）
export async function submitPhase1Answer(
  sessionId: string,
  wordId: number,
  answer: string
): Promise<ApiResponse<Phase1AnswerResult>> {
  const response = await api.post<ApiResponse<Phase1AnswerResult>>('/quiz/submit/phase1', {
    sessionId,
    wordId,
    answer,
  });
  return response.data;
}

// 提交阶段2答案（英译中）
export async function submitPhase2Answer(
  sessionId: string,
  wordId: number,
  selectedIndex: number
): Promise<ApiResponse<Phase2AnswerResult>> {
  const response = await api.post<ApiResponse<Phase2AnswerResult>>('/quiz/submit/phase2', {
    sessionId,
    wordId,
    selectedIndex,
  });
  return response.data;
}

export async function finishQuiz(sessionId: string): Promise<ApiResponse<QuizFinishData>> {
  const response = await api.post<ApiResponse<QuizFinishData>>('/quiz/finish', { sessionId });
  return response.data;
}

export async function getQuizHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<QuizHistory>> {
  const response = await api.get<PaginatedResponse<QuizHistory>>('/quiz/history', { params });
  return response.data;
}

export async function getQuizDetail(sessionId: string): Promise<ApiResponse<QuizFinishData>> {
  const response = await api.get<ApiResponse<QuizFinishData>>(`/quiz/${sessionId}`);
  return response.data;
}

export default api;
