import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Book, Home, Plus, Award, History as HistoryIcon, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToastContainer } from './common';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/wordbook', icon: Book, label: 'Word Book' },
  { to: '/add', icon: Plus, label: 'Add Word' },
  { to: '/quiz', icon: Award, label: 'Quiz Mode' },
  { to: '/history', icon: HistoryIcon, label: 'History' },
];

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // 路由变化时关闭移动端菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen glass-panel border-r border-slate-800 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Book className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              GoodWord
            </span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "text-white bg-slate-800/50 shadow-inner"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                      />
                    )}
                    <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:text-indigo-400 transition-colors")} />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Daily Streak</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">12</span>
              <span className="text-xs text-indigo-400 mb-1">Days 🔥</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 移动端顶部栏 */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Book className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">GoodWord</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-slate-900 z-40 p-4"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 p-4 rounded-xl",
                      isActive ? "bg-slate-800 text-indigo-400" : "text-slate-400"
                    )
                  }
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-lg">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区域 */}
      <main className="flex-1 md:ml-64 min-h-screen relative">
        {/* 背景装饰 */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 mt-16 md:mt-0">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
