// 单词类型
export interface Word {
  id: number;
  english: string;
  phonetic: string | null;
  partOfSpeech: string[];
  englishDef: string | null;
  chineseDef: string;
  isCET4: boolean;
  isCET6: boolean;
  isIELTS: boolean;
  isTOEFL: boolean;
  isGraduate: boolean;
  cet4Freq: number | null;
  cet6Freq: number | null;
  ieltsFreq: number | null;
  toeflFreq: number | null;
  graduateFreq: number | null;
  createdAt: string;
  updatedAt: string;
}

// 单词统计
export interface WordStats {
  total: number;
  cet4Count: number;
  cet6Count: number;
  ieltsCount: number;
  toeflCount: number;
  graduateCount: number;
}

// 考核单词
export interface QuizWord {
  id: number;
  chineseDef: string;
  partOfSpeech: string[];
}

// 考核会话
export interface QuizSession {
  sessionId: string;
  totalCount: number;
  words: QuizWord[];
}

// 答案结果
export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
}

// 考核结果
export interface QuizResult {
  wordId: number;
  english: string;
  chineseDef: string;
  userAnswer: string | null;
  isCorrect: boolean;
}

// 考核完成数据
export interface QuizFinishData {
  sessionId: string;
  totalCount: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  results: QuizResult[];
  completedAt: string;
}

// 考核历史记录
export interface QuizHistory {
  sessionId: string;
  wordCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  createdAt: string;
  completedAt: string | null;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
}
