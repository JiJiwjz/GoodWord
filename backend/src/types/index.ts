// 单词信息（AI 返回的结构）
export interface WordInfo {
  english: string;           // 英文单词/短语
  phonetic: string;          // 音标
  partOfSpeech: string[];    // 词性列表
  englishDef: string;        // 英文释义
  chineseDef: string;        // 中文释义
  
  // 考试分类
  isCET4: boolean;
  isCET6: boolean;
  isIELTS: boolean;
  isTOEFL: boolean;
  isGraduate: boolean;
  
  // 词频（1-5，5为最高频）
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

// 考核相关类型
export interface QuizWord {
  id: number;
  chineseDef: string;
  partOfSpeech: string[];
}

export interface QuizResult {
  wordId: number;
  english: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizSessionData {
  sessionId: string;
  words: QuizWord[];
  currentIndex: number;
  results: QuizResult[];
}
