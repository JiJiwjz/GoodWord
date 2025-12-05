import { Card, Button, Badge } from '../common';
import { Trophy, RotateCcw, Home, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { QuizFinishData } from '../../types';

interface QuizResultProps {
  data: QuizFinishData;
  onRestart: () => void;
}

export function QuizResult({ data, onRestart }: QuizResultProps) {
  const navigate = useNavigate();

  const getEvaluation = (accuracy: number) => {
    if (accuracy >= 90) return { text: '太棒了！', emoji: '🎉', color: 'text-green-600' };
    if (accuracy >= 70) return { text: '做得不错！', emoji: '👍', color: 'text-blue-600' };
    if (accuracy >= 50) return { text: '继续加油！', emoji: '💪', color: 'text-orange-600' };
    return { text: '需要多练习', emoji: '📚', color: 'text-red-600' };
  };

  const evaluation = getEvaluation(data.accuracy);

  const renderResults = (results: typeof data.phase1Results, title: string, phase: number) => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={`${phase}-${result.wordId}`}
            className={`p-4 rounded-lg border ${
              result.isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-1 rounded-full ${
                  result. isCorrect ? 'bg-green-200' : 'bg-red-200'
                }`}
              >
                {result.isCorrect ? (
                  <Check className="w-4 h-4 text-green-700" />
                ) : (
                  <X className="w-4 h-4 text-red-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                  <span className="font-bold text-gray-900">{result.english}</span>
                </div>
                <p className="text-sm text-gray-600">{result.chineseDef}</p>
                {! result.isCorrect && result.userAnswer && (
                  <p className="text-sm text-red-600 mt-1">
                    你的答案：{result. userAnswer}
                  </p>
                )}
              </div>
              <Badge variant={result.isCorrect ? 'success' : 'danger'}>
                {result.isCorrect ?  '正确' : '错误'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 结果统计卡片 */}
      <Card className="text-center py-8">
        <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">考核完成！</h1>
        <p className={`text-xl ${evaluation.color} mb-6`}>
          {evaluation.emoji} {evaluation.text}
        </p>

        {/* 统计数据 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{data.totalQuestions}</div>
            <div className="text-sm text-gray-500">总题数</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{data.totalCount}</div>
            <div className="text-sm text-gray-500">单词数</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{data.correctCount}</div>
            <div className="text-sm text-gray-500">正确</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{data.wrongCount}</div>
            <div className="text-sm text-gray-500">错误</div>
          </div>
        </div>

        {/* 准确率 */}
        <div className="mb-6">
          <div className="text-5xl font-bold text-blue-600 mb-2">{data.accuracy}%</div>
          <div className="text-gray-500">综合准确率</div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <Button onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            再来一次
          </Button>
        </div>
      </Card>

      {/* 阶段1详细结果 */}
      {data.phase1Results.length > 0 && renderResults(data.phase1Results, '阶段一：中译英', 1)}

      {/* 阶段2详细结果 */}
      {data.phase2Results. length > 0 && renderResults(data.phase2Results, '阶段二：英译中', 2)}
    </div>
  );
}
