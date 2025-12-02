import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../common';
import { Check, X, ArrowRight, SkipForward } from 'lucide-react';

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
  const timerRef = useRef<NodeJS. Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 清除所有定时器
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef. current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef. current);
      countdownRef.current = null;
    }
  };

  // 每次切换题目时清空答案并聚焦
  useEffect(() => {
    setAnswer('');
    setCountdown(3);
    clearAllTimers();
    
    if (! result) {
      inputRef.current?.focus();
    }
  }, [currentIndex]);

  // 显示结果后开始倒计时
  useEffect(() => {
    if (result) {
      setCountdown(3);
      
      // 倒计时显示
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef. current! );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 3秒后自动下一题
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
      onSubmit(answer. trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && result) {
      handleNext();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>第 {currentIndex + 1} 题</span>
          <span>{currentIndex + 1} / {totalCount}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <Card className="text-center py-8">
        {/* 词性 */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {partOfSpeech. join(' / ') || '未知词性'}
          </span>
        </div>

        {/* 中文释义 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{chineseDef}</h2>

        {/* 答题区域 */}
        {! result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="请输入英文单词或短语"
              className="w-full px-4 py-3 text-center text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onSkip}
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                跳过
              </Button>
              <Button
                type="submit"
                disabled={!answer.trim()}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                提交
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6" onKeyDown={handleKeyDown}>
            {/* 结果显示 */}
            <div
              className={`p-6 rounded-xl ${
                result.isCorrect
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {result.isCorrect ? (
                  <>
                    <Check className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-bold text-green-600">回答正确！</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6 text-red-600" />
                    <span className="text-lg font-bold text-red-600">回答错误</span>
                  </>
                )}
              </div>

              <div className="space-y-2 text-left">
                <p className="text-gray-700">
                  <span className="font-medium">正确答案：</span>
                  <span className="text-green-700 font-bold ml-2">{result.correctAnswer}</span>
                </p>
                {! result.isCorrect && (
                  <p className="text-gray-700">
                    <span className="font-medium">你的答案：</span>
                    <span className="text-red-600 ml-2">{result.userAnswer || '(跳过)'}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 下一题按钮（带倒计时） */}
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentIndex < totalCount - 1 ? (
                <>
                  下一题
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-sm">
                    {countdown}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              ) : (
                <>
                  查看结果
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-sm">
                    {countdown}
                  </span>
                </>
              )}
            </Button>

            {/* 倒计时提示 */}
            <p className="text-sm text-gray-500">
              {countdown} 秒后自动进入{currentIndex < totalCount - 1 ? '下一题' : '结果页'}，点击按钮可提前跳转
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
