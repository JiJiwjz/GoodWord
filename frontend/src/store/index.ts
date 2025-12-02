import { create } from 'zustand';
import type { Word, WordStats, QuizSession, QuizResult } from '../types';

// 单词状态
interface WordState {
  words: Word[];
  stats: WordStats | null;
  loading: boolean;
  setWords: (words: Word[]) => void;
  setStats: (stats: WordStats) => void;
  setLoading: (loading: boolean) => void;
  addWord: (word: Word) => void;
  removeWord: (id: number) => void;
}

export const useWordStore = create<WordState>((set) => ({
  words: [],
  stats: null,
  loading: false,
  setWords: (words) => set({ words }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  addWord: (word) => set((state) => ({ words: [word, ...state. words] })),
  removeWord: (id) => set((state) => ({ words: state.words. filter((w) => w. id !== id) })),
}));

// 考核状态
interface QuizState {
  session: QuizSession | null;
  currentIndex: number;
  results: QuizResult[];
  isFinished: boolean;
  setSession: (session: QuizSession | null) => void;
  setCurrentIndex: (index: number) => void;
  addResult: (result: QuizResult) => void;
  setFinished: (finished: boolean) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  session: null,
  currentIndex: 0,
  results: [],
  isFinished: false,
  setSession: (session) => set({ session }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  addResult: (result) => set((state) => ({ results: [...state. results, result] })),
  setFinished: (finished) => set({ isFinished: finished }),
  resetQuiz: () => set({ session: null, currentIndex: 0, results: [], isFinished: false }),
}));

// 通知状态
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Date.now(). toString();
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    // 3秒后自动移除
    setTimeout(() => {
      set((state) => ({ toasts: state. toasts.filter((t) => t. id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts. filter((t) => t.id !== id) })),
}));
