import { useState, useEffect } from 'react';
import { QuizStart, QuizCard, QuizResult } from '../components/quiz';
import { useToastStore } from '../store';
import { getWordStats, startQuiz, submitAnswer, finishQuiz } from '../services/api';
import type { QuizSession, QuizFinishData, AnswerResult } from '../types';

type QuizStage = 'start' | 'quiz' | 'result';

export function Quiz() {
  const [stage, setStage] = useState<QuizStage>('start');
  const [loading, setLoading] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<AnswerResult | null>(null);
  const [finishData, setFinishData] = useState<QuizFinishData | null>(null);
  const { addToast } = useToastStore();

  // 获取单词总数
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getWordStats();
        if (response.success && response.data) {
          setTotalWords(response.data.total);
        }
      } catch (error) {
        console.error('获取统计失败:', error);
      }
    }
    fetchStats();
  }, []);

  // 开始考核
  const handleStart = async (count: number) => {
    setLoading(true);
    try {
      const response = await startQuiz(count);
      if (response.success && response.data) {
        setSession(response.data);
        setCurrentIndex(0);
        setCurrentResult(null);
        setStage('quiz');
      } else {
        addToast('error', response.error || '开始考核失败');
      }
    } catch (error) {
      console.error('开始考核失败:', error);
      addToast('error', '开始考核失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交答案
  const handleSubmit = async (answer: string) => {
    if (!session) return;

    const currentWord = session.words[currentIndex];
    
    try {
      const response = await submitAnswer(session.sessionId, currentWord. id, answer);
      if (response. success && response.data) {
        setCurrentResult(response.data);
      } else {
        addToast('error', response.error || '提交答案失败');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      addToast('error', '提交答案失败');
    }
  };

  // 跳过
  const handleSkip = async () => {
    if (!session) return;

    const currentWord = session.words[currentIndex];
    
    try {
      const response = await submitAnswer(session.sessionId, currentWord.id, '');
      if (response.success && response.data) {
        setCurrentResult(response.data);
      }
    } catch (error) {
      console.error('跳过失败:', error);
    }
  };

  // 下一题
  const handleNext = async () => {
    if (!session) return;

    if (currentIndex < session.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentResult(null);
    } else {
      // 完成考核
      try {
        const response = await finishQuiz(session.sessionId);
        if (response.success && response.data) {
          setFinishData(response.data);
          setStage('result');
        } else {
          addToast('error', response.error || '结束考核失败');
        }
      } catch (error) {
        console.error('结束考核失败:', error);
        addToast('error', '结束考核失败');
      }
    }
  };

  // 重新开始
  const handleRestart = () => {
    setSession(null);
    setCurrentIndex(0);
    setCurrentResult(null);
    setFinishData(null);
    setStage('start');
  };

  // 渲染不同阶段
  if (stage === 'start') {
    return (
      <QuizStart
        onStart={handleStart}
        loading={loading}
        totalWords={totalWords}
      />
    );
  }

  if (stage === 'quiz' && session) {
    const currentWord = session.words[currentIndex];
    return (
      <QuizCard
        wordId={currentWord. id}
        chineseDef={currentWord.chineseDef}
        partOfSpeech={currentWord.partOfSpeech}
        currentIndex={currentIndex}
        totalCount={session.totalCount}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        result={currentResult}
        onNext={handleNext}
      />
    );
  }

  if (stage === 'result' && finishData) {
    return (
      <QuizResult
        data={finishData}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}
