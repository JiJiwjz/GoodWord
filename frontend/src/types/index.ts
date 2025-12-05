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

// 考核单词（阶段1：中译英）
export interface QuizWordPhase1 {
  id: number;
  chineseDef: string;
  partOfSpeech: string[];
}

// 考核单词（阶段2：英译中）
export interface QuizWordPhase2 {
  id: number;
  english: string;
  phonetic: string | null;
  partOfSpeech: string[];
  options: string[];
  correctIndex: number;
}

// 考核会话
export interface QuizSession {
  sessionId: string;
  totalCount: number;
  phase1Words: QuizWordPhase1[];
  phase2Words: QuizWordPhase2[];
}

// 阶段1答案结果
export interface Phase1AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
}

// 阶段2答案结果
export interface Phase2AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  correctIndex: number;
  userAnswer: string;
  selectedIndex: number;
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
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  phase1Results: QuizResult[];
  phase2Results: QuizResult[];
  completedAt: string;
}

// 考核历史记录
export interface QuizHistory {
  sessionId: string;
  wordCount: number;
  totalQuestions: number;
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
