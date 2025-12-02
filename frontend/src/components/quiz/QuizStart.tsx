import { useState } from 'react';
import { Card, Button } from '../common';
import { PlayCircle } from 'lucide-react';

interface QuizStartProps {
  onStart: (count: number) => void;
  loading: boolean;
  totalWords: number;
}

const countOptions = [10, 20, 30, 50];

export function QuizStart({ onStart, loading, totalWords }: QuizStartProps) {
  const [selectedCount, setSelectedCount] = useState(10);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">单词考核</h1>
        <p className="text-gray-600">检验你的单词记忆成果</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* 单词数量选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择考核数量
            </label>
            <div className="grid grid-cols-4 gap-3">
              {countOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  disabled={count > totalWords}
                  className={`py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                    selectedCount === count
                      ? 'bg-blue-600 text-white'
                      : count > totalWords
                      ?  'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            {totalWords < 10 && (
              <p className="mt-2 text-sm text-orange-600">
                当前单词本共 {totalWords} 个单词
                {totalWords === 0 ?  '，请先添加单词' : ''}
              </p>
            )}
          </div>

          {/* 开始按钮 */}
          <Button
            onClick={() => onStart(Math.min(selectedCount, totalWords))}
            disabled={totalWords === 0}
            loading={loading}
            className="w-full"
            size="lg"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            开始考核
          </Button>
        </div>
      </Card>

      {/* 说明 */}
      <Card className="bg-blue-50 border-blue-100">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📝 考核说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 系统会显示中文释义和词性</li>
          <li>• 请输入对应的英文单词或短语</li>
          <li>• 答案不区分大小写</li>
          <li>• 每次考核尽量避免与上次重复</li>
        </ul>
      </Card>
    </div>
  );
}
