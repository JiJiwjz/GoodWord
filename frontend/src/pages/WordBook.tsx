import { useState, useEffect, useCallback } from 'react';
import { Card, Pagination, ConfirmModal } from '../components/common';
import { WordCard, WordFilter } from '../components/word';
import { useToastStore } from '../store';
import { getWords, deleteWord } from '../services/api';
import { BookOpen } from 'lucide-react';
import type { Word } from '../types';

export function WordBook() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; word: Word | null }>({
    open: false,
    word: null,
  });
  const [deleting, setDeleting] = useState(false);
  const { addToast } = useToastStore();

  const filterOptions = [
    { key: 'isCET4', label: 'CET-4' },
    { key: 'isCET6', label: 'CET-6' },
    { key: 'isIELTS', label: '雅思' },
    { key: 'isTOEFL', label: '托福' },
    { key: 'isGraduate', label: '考研' },
  ];

  // 获取单词列表
  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize: 10,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      Object.entries(activeFilters). forEach(([key, value]) => {
        if (value) {
          params[key] = true;
        }
      });

      const response = await getWords(params);

      if (response.success && response.data) {
        setWords(response.data. items);
        setTotalPages(response. data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('获取单词列表失败:', error);
      addToast('error', '获取单词列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, activeFilters, addToast]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 切换筛选
  const handleFilterChange = (key: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: ! prev[key],
    }));
    setPage(1);
  };

  // 删除单词
  const handleDelete = async () => {
    if (! deleteModal.word) return;

    setDeleting(true);
    try {
      const response = await deleteWord(deleteModal.word.id);
      if (response.success) {
        addToast('success', '删除成功');
        setDeleteModal({ open: false, word: null });
        fetchWords();
      } else {
        addToast('error', response.error || '删除失败');
      }
    } catch (error) {
      console.error('删除单词失败:', error);
      addToast('error', '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  // 构建筛选器配置
  const filters = filterOptions.map((opt) => ({
    ...opt,
    active: !!activeFilters[opt.key],
  }));

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">单词本</h1>
          <p className="text-gray-600 mt-1">共 {total} 个单词</p>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <WordFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />
      </Card>

      {/* 单词列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : words.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchValue || Object.values(activeFilters). some(Boolean)
              ? '没有找到匹配的单词'
              : '单词本为空'}
          </h3>
          <p className="text-gray-500">
            {searchValue || Object.values(activeFilters).some(Boolean)
              ? '尝试调整搜索条件或筛选器'
              : '去添加一些单词开始学习吧！'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {words. map((word) => (
            <WordCard
              key={word. id}
              word={word}
              showDelete
              onDelete={(id) => {
                const wordToDelete = words.find((w) => w. id === id);
                if (wordToDelete) {
                  setDeleteModal({ open: true, word: wordToDelete });
                }
              }}
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

      {/* 删除确认对话框 */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, word: null })}
        onConfirm={handleDelete}
        title="删除单词"
        message={`确定要删除单词 "${deleteModal.word?.english}" 吗？此操作不可恢复。`}
        confirmText="删除"
        danger
        loading={deleting}
      />
    </div>
  );
}
