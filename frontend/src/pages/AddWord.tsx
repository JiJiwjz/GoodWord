import { useState } from 'react';
import { Card, Button, Input } from '../components/common';
import { WordCard } from '../components/word';
import { useToastStore } from '../store';
import { addWord } from '../services/api';
import { PlusCircle, Sparkles } from 'lucide-react';
import type { Word } from '../types';

export function AddWord() {
  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentWords, setRecentWords] = useState<Word[]>([]);
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const word = inputWord.trim();
    if (!word) {
      addToast('error', '请输入单词或短语');
      return;
    }

    setLoading(true);

    try {
      const response = await addWord(word);

      if (response. success && response.data) {
        addToast('success', `单词 "${word}" 添加成功！`);
        setRecentWords((prev) => [response.data!, ...prev]. slice(0, 5));
        setInputWord('');
      } else {
        addToast('error', response.error || '添加失败');
      }
    } catch (error) {
      console.error('添加单词失败:', error);
      addToast('error', '添加失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* 标题 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">添加单词</h1>
        <p className="text-gray-600">输入单词或短语，AI 将自动获取详细信息</p>
      </div>

      {/* 输入表单 */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="英文单词或短语"
            placeholder="例如：abandon, break down, comprehensive"
            value={inputWord}
            onChange={(e) => setInputWord(e. target.value)}
            disabled={loading}
            autoFocus
          />

          <Button
            type="submit"
            loading={loading}
            disabled={! inputWord.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                AI 正在分析...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                添加单词
              </>
            )}
          </Button>
        </form>

        {/* 提示信息 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 提示</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 支持单词（如：abandon）和短语（如：break down）</li>
            <li>• AI 会自动获取音标、释义、词性等信息</li>
            <li>• 自动识别该词所属的考试类型（CET-4/6、雅思、托福、考研）</li>
          </ul>
        </div>
      </Card>

      {/* 最近添加的单词 */}
      {recentWords.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近添加</h2>
          <div className="space-y-4">
            {recentWords.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
