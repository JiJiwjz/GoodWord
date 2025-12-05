import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../common';
import { Check, X, ArrowRight, Volume2 } from 'lucide-react';
import type { Phase2AnswerResult } from '../../types';

interface QuizCardPhase2Props {
  wordId: number;
  english: string;
  phonetic: string | null;
  partOfSpeech: string[];
  options: string[];
  currentIndex: number;
  totalCount: number;
  onSubmit: (selectedIndex: number) => void;
  result: Phase2AnswerResult | null;
  onNext: () => void;
}

export function QuizCardPhase2({
  english,
  phonetic,
  partOfSpeech,
  options,
  currentIndex,
  totalCount,
  onSubmit,
  result,
  onNext,
}: QuizCardPhase2Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef. current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  useEffect(() => {
    setSelectedIndex(null);
    setCountdown(3);
    clearAllTimers();
  }, [currentIndex]);

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

  const handleNext = () => {
    clearAllTimers();
    onNext();
  };

  const handleSelect = (index: number) => {
    if (result) return;
    setSelectedIndex(index);
    onSubmit(index);
  };

  const playPronunciation = () => {
    const utterance = new SpeechSynthesisUtterance(english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const getOptionStyle = (index: number) => {
    if (! result) {
      return selectedIndex === index
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
    }

    if (index === result.correctIndex) {
      return 'border-green-500 bg-green-50';
    }

    if (index === result. selectedIndex && ! result.isCorrect) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 opacity-50';
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>阶段二：英译中 - 第 {currentIndex + 1} 题</span>
          <span>{currentIndex + 1} / {totalCount}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <Card className="text-center py-8">
        {/* 词性 */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {partOfSpeech. join(' / ') || '未知词性'}
          </span>
        </div>

        {/* 英文单词 */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-gray-900">{english}</h2>
          <button
            onClick={playPronunciation}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* 音标 */}
        {phonetic && (
          <p className="text-gray-500 mb-8">{phonetic}</p>
        )}

        {/* 选项 */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={!! result}
              className={`w-full p-4 text-left border-2 rounded-xl transition-all ${getOptionStyle(index)}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {result && index === result.correctIndex && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {result && index === result.selectedIndex && !result.isCorrect && (
                  <X className="w-5 h-5 text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 结果提示 */}
        {result && (
          <div className="mt-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              result.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {result.isCorrect ?  (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">回答正确！</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-medium">回答错误</span>
                </>
              )}
            </div>

            {/* 下一题按钮 */}
            <div className="mt-6">
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
              <p className="mt-2 text-sm text-gray-500">
                {countdown} 秒后自动进入{currentIndex < totalCount - 1 ? '下一题' : '结果页'}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
