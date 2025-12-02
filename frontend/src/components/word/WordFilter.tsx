import { clsx } from 'clsx';

interface FilterOption {
  key: string;
  label: string;
  active: boolean;
}

interface WordFilterProps {
  filters: FilterOption[];
  onFilterChange: (key: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function WordFilter({
  filters,
  onFilterChange,
  searchValue,
  onSearchChange,
}: WordFilterProps) {
  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索单词或释义..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 筛选标签 */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter. key)}
            className={clsx(
              'px-3 py-1. 5 rounded-full text-sm font-medium transition-colors',
              filter.active
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {filter. label}
          </button>
        ))}
      </div>
    </div>
  );
}
