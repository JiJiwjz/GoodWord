import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Home, PlusCircle, ClipboardCheck, History } from 'lucide-react';
import { clsx } from 'clsx';
import { ToastContainer } from './common';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/wordbook', icon: BookOpen, label: '单词本' },
  { to: '/add', icon: PlusCircle, label: '添加单词' },
  { to: '/quiz', icon: ClipboardCheck, label: '开始考核' },
  { to: '/history', icon: History, label: '考核历史' },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">单词记忆助手</span>
            </div>

            {/* 导航链接 */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item. to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item. label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16">
          {navItems. map((item) => (
            <NavLink
              key={item.to}
              to={item. to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                  isActive ?  'text-blue-600' : 'text-gray-600'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Toast 通知 */}
      <ToastContainer />
    </div>
  );
}
