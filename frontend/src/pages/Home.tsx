import { useEffect, useState } from 'react';
import { Card } from '../components/common';
import { BookOpen, GraduationCap, Globe, Award } from 'lucide-react';
import { getWordStats } from '../services/api';
import type { WordStats } from '../types';

export function Home() {
  const [stats, setStats] = useState<WordStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getWordStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('获取统计失败:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statItems = [
    { label: '总单词数', value: stats?.total || 0, icon: BookOpen, color: 'blue' },
    { label: 'CET-4 词汇', value: stats?.cet4Count || 0, icon: Award, color: 'green' },
    { label: 'CET-6 词汇', value: stats?.cet6Count || 0, icon: Award, color: 'purple' },
    { label: '雅思/托福', value: (stats?. ieltsCount || 0) + (stats?.toeflCount || 0), icon: Globe, color: 'orange' },
    { label: '考研词汇', value: stats?.graduateCount || 0, icon: GraduationCap, color: 'red' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 欢迎信息 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎使用单词记忆助手</h1>
        <p className="text-gray-600">高效记忆，轻松备考</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((item) => (
          <Card key={item. label} className="text-center">
            <div className={`inline-flex p-3 rounded-full ${colorClasses[item.color]} mb-3`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-500">{item.label}</div>
          </Card>
        ))}
      </div>

      {/* 快速入口 */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/add"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">添加单词</div>
              <div className="text-sm text-gray-500">输入单词自动获取释义</div>
            </div>
          </a>
          <a
            href="/quiz"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">开始考核</div>
              <div className="text-sm text-gray-500">检验你的记忆成果</div>
            </div>
          </a>
          <a
            href="/wordbook"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">单词本</div>
              <div className="text-sm text-gray-500">查看已添加的单词</div>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
}
