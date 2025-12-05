import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../common';
import { Check, ArrowRight, Clock, Sparkles, SkipForward, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface QuizCardProps {
  wordId: number;
  chineseDef: string;
  partOfSpeech: string[];
  currentIndex: number;
  totalCount: number;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  result: {
    isCorrect: boolean;
    correctAnswer: string;
    userAnswer: string;
  } | null;
  onNext: () => void;
}

export function QuizCard({
  chineseDef,
  partOfSpeech,
  currentIndex,
  totalCount,
  onSubmit,
  onSkip,
  result,
  onNext,
}: QuizCardProps) {
  const [answer, setAnswer] = useState('');
  const [countdown, setCountdown] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清除所有定时器
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // 每次切换题目时清空答案并聚焦
  useEffect(() => {
    setAnswer('');
    setCountdown(3);
    clearAllTimers();
    
    // 稍微延迟聚焦，配合动画
    setTimeout(() => {
      if (!result) {
        inputRef.current?.focus();
      }
    }, 300);
  }, [currentIndex]);

  // 显示结果后开始倒计时
  useEffect(() => {
    if (result) {
      setCountdown(3);
      
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        onNext();
      }, 3000);
    }

    return () => {
      clearAllTimers();
    };
  }, [result, onNext]);

  // 手动点击下一题
  const handleNext = () => {
    clearAllTimers();
    onNext();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 如果在结果页按回车，直接下一题
    if (e.key === 'Enter' && result) {
      handleNext();
    }
  };

  // 计算进度百分比
  const progress = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0" onKeyDown={handleKeyDown}>
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between mb-8 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-400 font-mono">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-sm uppercase tracking-wider text-slate-500">/ {String(totalCount).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium tracking-wide text-slate-300">Phase 1: Recall</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 bg-slate-800 rounded-full mb-12 overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: `${((currentIndex) / totalCount) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

      {/* 主卡片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="py-12 px-6 md:px-16 relative border-t-4 border-t-indigo-500 shadow-2xl shadow-black/40 bg-[#1e293b]/80">
            {/* 词性标签 (悬浮) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <span className="bg-slate-900 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold border border-slate-700 shadow-xl uppercase tracking-wider">
                {partOfSpeech.join(', ')}
              </span>
            </div>

            <div className="text-center space-y-10 mt-4">
              {/* 问题区域 */}
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
                  {chineseDef}
                </h2>
                <p className="text-slate-500 font-medium">Type the English word below</p>
              </div>

              {!result ? (
                /* 输入表单 */
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8">
                  <div className="relative group">
                    <input
                      ref={inputRef}
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-slate-700 text-center text-3xl md:text-4xl font-bold py-4 text-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-800/50"
                      placeholder="Type here..."
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    {/* 装饰光晕 */}
                    <div className="absolute inset-0 -inset-y-4 bg-indigo-500/5 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity rounded-full pointer-events-none" />
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={onSkip}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!answer.trim()} 
                      className="px-8 min-w-[140px] shadow-lg shadow-indigo-500/25"
                      size="lg"
                    >
                      Check
                    </Button>
                  </div>
                </form>
              ) : (
                /* 结果展示 */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className={cn(
                    "p-6 rounded-2xl border backdrop-blur-md transition-colors duration-300",
                    result.isCorrect 
                      ? "bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_30px_-5px_rgba(34,197,94,0.2)]" 
                      : "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]"
                  )}>
                    <div className="flex flex-col items-center gap-3">
                      {result.isCorrect ? (
                        <div className="p-3 bg-green-500/20 rounded-full">
                          <Sparkles className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/20 rounded-full">
                          <X className="w-8 h-8" />
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold">
                        {result.isCorrect ? "Correct!" : "Not quite..."}
                      </h3>
                      
                      <div className="mt-2 text-center w-full">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Correct Answer</p>
                        <p className="text-3xl font-bold text-white tracking-wide font-mono bg-slate-900/50 py-2 rounded-lg mx-auto max-w-[300px]">
                          {result.correctAnswer}
                        </p>
                        
                        {!result.isCorrect && (
                          <div className="mt-3 text-sm">
                            <span className="text-slate-500 mr-2">You typed:</span>
                            <span className="text-red-400 line-through opacity-80">{result.userAnswer || "(skipped)"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <Button 
                      onClick={handleNext} 
                      size="lg" 
                      className="w-full max-w-xs group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Next Question 
                        <span className="ml-3 bg-white/20 px-2 py-0.5 rounded text-xs font-mono group-hover:bg-white/30 transition-colors">
                          {countdown}s
                        </span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {/* 按钮内的进度条背景 */}
                      <motion.div 
                        className="absolute inset-0 bg-white/10 z-0"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 3, ease: "linear" }}
                      />
                    </Button>
                    <p className="text-xs text-slate-600">
                      Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-sans">Enter</kbd> to continue
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
