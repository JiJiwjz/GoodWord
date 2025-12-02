import { useState, useEffect, useCallback } from 'react';
import { Card, Pagination } from '../components/common';
import { HistoryCard, HistoryDetail } from '../components/quiz';
import { useToastStore } from '../store';
import { getQuizHistory, getQuizDetail } from '../services/api';
import { History as HistoryIcon } from 'lucide-react';
import type { QuizHistory, QuizFinishData } from '../types';

export function History() {
  const [histories, setHistories] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<QuizFinishData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { addToast } = useToastStore();

  // 获取历史记录列表
  const fetchHistories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getQuizHistory({ page, pageSize: 10 });
      if (response.success && response.data) {
        setHistories(response.data. items);
        setTotalPages(response. data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
      addToast('error', '获取历史记录失败');
    } finally {
      setLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  // 获取详情
  const handleViewDetail = async (sessionId: string) => {
    setDetailLoading(true);
    setSelectedSession(sessionId);
    try {
      const response = await getQuizDetail(sessionId);
      if (response.success && response.data) {
        setDetailData(response.data);
      } else {
        addToast('error', response.error || '获取详情失败');
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('获取详情失败:', error);
      addToast('error', '获取详情失败');
      setSelectedSession(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    setSelectedSession(null);
    setDetailData(null);
  };

  // 显示详情页面
  if (selectedSession && detailData) {
    return <HistoryDetail data={detailData} onBack={handleBack} />;
  }

  // 加载详情中
  if (detailLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">考核历史</h1>
        <p className="text-gray-600 mt-1">共 {total} 次考核记录</p>
      </div>

      {/* 历史列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : histories.length === 0 ? (
        <Card className="text-center py-12">
          <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无考核记录</h3>
          <p className="text-gray-500">完成一次考核后，记录会显示在这里</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {histories.map((history) => (
            <HistoryCard
              key={history. sessionId}
              history={history}
              onClick={() => handleViewDetail(history.sessionId)}
            />
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
