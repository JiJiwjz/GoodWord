import { useState, useEffect } from 'react';
import { QuizStart, QuizCard, QuizCardPhase2, QuizResult } from '../components/quiz';
import { Card, Button } from '../components/common';
import { useToastStore } from '../store';
import { getWordStats, startQuiz, submitPhase1Answer, submitPhase2Answer, finishQuiz } from '../services/api';
import { ArrowRight, BookOpen, Languages, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { QuizSession, QuizFinishData, Phase1AnswerResult, Phase2AnswerResult } from '../types';

type QuizStage = 'start' | 'loading' | 'phase1' | 'transition' | 'phase2' | 'result';

export function Quiz() {
  const [stage, setStage] = useState<QuizStage>('start');
  const [loading, setLoading] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase1Result, setPhase1Result] = useState<Phase1AnswerResult | null>(null);
  const [phase2Result, setPhase2Result] = useState<Phase2AnswerResult | null>(null);
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
    setStage('loading');
    try {
      const response = await startQuiz(count);
      if (response.success && response.data) {
        setSession(response.data);
        setCurrentIndex(0);
        setPhase1Result(null);
        setStage('phase1');
      } else {
        addToast('error', response.error || '开始考核失败');
        setStage('start');
      }
    } catch (error) {
      console.error('开始考核失败:', error);
      addToast('error', '开始考核失败');
      setStage('start');
    } finally {
      setLoading(false);
    }
  };

  // 提交阶段1答案（中译英）
  const handlePhase1Submit = async (answer: string) => {
    if (!session) return;

    const currentWord = session.phase1Words[currentIndex];
    
    try {
      const response = await submitPhase1Answer(session.sessionId, currentWord.id, answer);
      if (response.success && response.data) {
        setPhase1Result(response.data);
      } else {
        addToast('error', response.error || '提交答案失败');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      addToast('error', '提交答案失败');
    }
  };

  // 阶段1跳过
  const handlePhase1Skip = async () => {
    if (!session) return;

    const currentWord = session. phase1Words[currentIndex];
    
    try {
      const response = await submitPhase1Answer(session.sessionId, currentWord.id, '');
      if (response.success && response.data) {
        setPhase1Result(response. data);
      }
    } catch (error) {
      console.error('跳过失败:', error);
    }
  };

  // 阶段1下一题
  const handlePhase1Next = () => {
    if (!session) return;

    if (currentIndex < session.phase1Words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase1Result(null);
    } else {
      // 进入过渡页面
      setStage('transition');
    }
  };

  // 进入阶段2
  const handleStartPhase2 = () => {
    setCurrentIndex(0);
    setPhase2Result(null);
    setStage('phase2');
  };

  // 提交阶段2答案（英译中）
  const handlePhase2Submit = async (selectedIndex: number) => {
    if (!session) return;

    const currentWord = session. phase2Words[currentIndex];
    
    try {
      const response = await submitPhase2Answer(session.sessionId, currentWord.id, selectedIndex);
      if (response.success && response.data) {
        setPhase2Result(response.data);
      } else {
        addToast('error', response.error || '提交答案失败');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      addToast('error', '提交答案失败');
    }
  };

  // 阶段2下一题
  const handlePhase2Next = async () => {
    if (!session) return;

    if (currentIndex < session. phase2Words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase2Result(null);
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
    setPhase1Result(null);
    setPhase2Result(null);
    setFinishData(null);
    setStage('start');
  };

  // ==========================================
  // 渲染不同阶段
  // ==========================================

  // 开始页面
  if (stage === 'start') {
    return (
      <QuizStart
        onStart={handleStart}
        loading={loading}
        totalWords={totalWords}
      />
    );
  }

  // 加载中
  if (stage === 'loading') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="py-12 bg-slate-800/80 border border-slate-700">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">正在准备考核...</h2>
            <p className="text-slate-400">AI 正在生成题目选项，请稍候</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 阶段1：中译英
  if (stage === 'phase1' && session) {
    const currentWord = session.phase1Words[currentIndex];
    return (
      <QuizCard
        wordId={currentWord.id}
        chineseDef={currentWord.chineseDef}
        partOfSpeech={currentWord.partOfSpeech}
        currentIndex={currentIndex}
        totalCount={session.totalCount}
        onSubmit={handlePhase1Submit}
        onSkip={handlePhase1Skip}
        result={phase1Result}
        onNext={handlePhase1Next}
      />
    );
  }

  // 过渡页面：阶段1完成，准备进入阶段2
  if (stage === 'transition' && session) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="py-12 px-8 bg-slate-800/90 border border-slate-600 shadow-2xl">
            {/* 图标 */}
            <div className="inline-flex p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mb-6 border border-green-500/30">
              <Languages className="w-14 h-14 text-green-400" />
            </div>

            {/* 标题 */}
            <h2 className="text-3xl font-bold text-white mb-3">
              🎉 阶段一完成！
            </h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
              接下来进入 <span className="text-green-400 font-bold">阶段二：英译中</span>
              <br />
              <span className="text-slate-400 text-base">根据英文单词选择正确的中文释义</span>
            </p>
            
            {/* 进度指示器 */}
            <div className="flex items-center justify-center gap-6 mb-10">
              {/* 阶段1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10">
                  <BookOpen className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-sm text-slate-400 mb-1">阶段一</p>
                <p className="font-bold text-white text-lg">中译英</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-green-400 font-semibold">已完成</span>
                </div>
              </div>

              {/* 箭头 */}
              <div className="flex flex-col items-center">
                <ArrowRight className="w-8 h-8 text-slate-500" />
              </div>

              {/* 阶段2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-green-500/40 shadow-lg shadow-green-500/10 animate-pulse">
                  <Languages className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-sm text-slate-400 mb-1">阶段二</p>
                <p className="font-bold text-white text-lg">英译中</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-orange-400 text-xl">○</span>
                  <span className="text-orange-400 font-semibold">待开始</span>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-slate-900/50 rounded-xl p-4 mb-8 border border-slate-700">
              <p className="text-slate-400 text-sm">
                本轮共 <span className="text-white font-bold">{session.totalCount}</span> 个单词，
                每个单词需要回答 <span className="text-white font-bold">2</span> 道题
              </p>
            </div>

            {/* 开始按钮 */}
            <Button 
              onClick={handleStartPhase2} 
              size="lg" 
              className="w-full text-lg py-4 shadow-xl shadow-indigo-500/20"
            >
              开始阶段二
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 阶段2：英译中
  if (stage === 'phase2' && session) {
    const currentWord = session. phase2Words[currentIndex];
    return (
      <QuizCardPhase2
        wordId={currentWord.id}
        english={currentWord.english}
        phonetic={currentWord. phonetic}
        partOfSpeech={currentWord.partOfSpeech}
        options={currentWord.options}
        currentIndex={currentIndex}
        totalCount={session.totalCount}
        onSubmit={handlePhase2Submit}
        result={phase2Result}
        onNext={handlePhase2Next}
      />
    );
  }

  // 结果页面
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
