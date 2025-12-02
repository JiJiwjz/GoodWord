import { Card, Button, Badge } from '../common';
import { ArrowLeft, Check, X, Calendar, Trophy } from 'lucide-react';
import type { QuizFinishData } from '../../types';

interface HistoryDetailProps {
  data: QuizFinishData;
  onBack: () => void;
}

export function HistoryDetail({ data, onBack }: HistoryDetailProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 根据准确率获取评价
  const getEvaluation = (accuracy: number) => {
    if (accuracy >= 90) return { text: '优秀', color: 'text-green-600', bg: 'bg-green-50' };
    if (accuracy >= 70) return { text: '良好', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (accuracy >= 50) return { text: '及格', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: '需加强', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const evaluation = getEvaluation(data.accuracy);

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回列表
      </Button>

      {/* 统计卡片 */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-full ${evaluation.bg}`}>
            <Trophy className={`w-8 h-8 ${evaluation.color}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">考核详情</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(data.completedAt)}</span>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{data.totalCount}</div>
            <div className="text-sm text-gray-500">总题数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.correctCount}</div>
            <div className="text-sm text-gray-500">正确</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{data.wrongCount}</div>
            <div className="text-sm text-gray-500">错误</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${evaluation.bg}`}>
            <div className={`text-2xl font-bold ${evaluation.color}`}>{data.accuracy}%</div>
            <div className="text-sm text-gray-500">准确率</div>
          </div>
        </div>

        {/* 评价 */}
        <div className={`text-center py-3 rounded-lg ${evaluation.bg}`}>
          <span className={`text-lg font-medium ${evaluation.color}`}>
            {evaluation.text}
          </span>
        </div>
      </Card>

      {/* 答题详情 */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">答题详情</h3>
        <div className="space-y-3">
          {data.results.map((result, index) => (
            <div
              key={result.wordId}
              className={`p-4 rounded-lg border ${
                result.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 p-1 rounded-full ${
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
                  {! result.isCorrect && (
                    <p className="text-sm text-red-600 mt-1">
                      你的答案：{result.userAnswer || '(跳过)'}
                    </p>
                  )}
                </div>
                <Badge variant={result.isCorrect ? 'success' : 'danger'}>
                  {result.isCorrect ? '正确' : '错误'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
