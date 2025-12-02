import { Card, Badge } from '../common';
import { Calendar, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import type { QuizHistory } from '../../types';

interface HistoryCardProps {
  history: QuizHistory;
  onClick: () => void;
}

export function HistoryCard({ history, onClick }: HistoryCardProps) {
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

  // 根据准确率获取颜色
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-blue-600';
    if (accuracy >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracy: number) => {
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

            <Badge variant={getAccuracyBadge(history.accuracy) as 'success' | 'info' | 'warning' | 'danger'}>
              {history.accuracy}% 准确率
            </Badge>
          </div>
        </div>

        {/* 箭头 */}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );
}
