import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  
  // 生成页码数组
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '... ', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* 页码 */}
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={clsx(
            'min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-blue-600 text-white'
              : page === '...'
              ? 'text-gray-400 cursor-default'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {page}
        </button>
      ))}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          currentPage === totalPages
            ?  'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
