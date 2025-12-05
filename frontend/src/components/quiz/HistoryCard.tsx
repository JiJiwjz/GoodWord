import { Card, Badge } from '../common';
import { Calendar, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import type { QuizHistory } from '../../types';

interface HistoryCardProps {
  history: QuizHistory;
  onClick: () => void;
}

export function HistoryCard({ history, onClick }: HistoryCardProps) {
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

  const getAccuracyBadge = (accuracy: number): 'success' | 'info' | 'warning' | 'danger' => {
    if (accuracy >= 90) return 'success';
    if (accuracy >= 70) return 'info';
    if (accuracy >= 50) return 'warning';
    return 'danger';
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* 日期 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(history.createdAt)}</span>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-6">
            <div>
              <span className="text-2xl font-bold text-gray-900">{history.wordCount}</span>
              <span className="text-sm text-gray-500 ml-1">词</span>
              <span className="text-lg text-gray-400 mx-1">/</span>
              <span className="text-lg font-medium text-gray-700">{history.totalQuestions}</span>
              <span className="text-sm text-gray-500 ml-1">题</span>
            </div>

            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{history.correctCount}</span>
            </div>

            <div className="flex items-center gap-1 text-red-600">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">{history.wrongCount}</span>
            </div>

            <Badge variant={getAccuracyBadge(history.accuracy)}>
              {history.accuracy}% 准确率
            </Badge>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );
}
