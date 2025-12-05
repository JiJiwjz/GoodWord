// 单词信息（AI 返回的结构）
export interface WordInfo {
  english: string;
  phonetic: string;
  partOfSpeech: string[];
  englishDef: string;
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
}

// AI API 响应
export interface AIResponse {
  success: boolean;
  data?: WordInfo;
  error?: string;
}

// 通义千问 API 响应结构
export interface DashScopeResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  usage: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
  };
}

// 干扰选项生成请求
export interface DistractorRequest {
  words: {
    english: string;
    chineseDef: string;
  }[];
}

// 干扰选项生成响应
export interface DistractorResponse {
  success: boolean;
  data?: {
    [english: string]: string[];  // 每个单词对应3个干扰选项
  };
  error?: string;
}

// 考核单词（中译英阶段）
export interface QuizWordPhase1 {
  id: number;
  chineseDef: string;
  partOfSpeech: string[];
}

// 考核单词（英译中阶段）
export interface QuizWordPhase2 {
  id: number;
  english: string;
  phonetic: string | null;
  partOfSpeech: string[];
  options: string[];      // 4个选项（包含正确答案）
  correctIndex: number;   // 正确答案的索引
}

// 考核会话数据
export interface QuizSessionData {
  sessionId: string;
  totalCount: number;
  phase1Words: QuizWordPhase1[];  // 中译英单词
  phase2Words: QuizWordPhase2[];  // 英译中单词
}
