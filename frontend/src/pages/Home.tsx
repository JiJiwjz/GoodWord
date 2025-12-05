import { useEffect, useState } from 'react';
import { Card, Button } from '../components/common';
import { Book, Trophy, TrendingUp, Activity, ArrowRight, Plus } from 'lucide-react';
import { getWordStats } from '../services/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { WordStats } from '../types';

export function Home() {
  const [stats, setStats] = useState<WordStats | null>(null);
  
  useEffect(() => {
    getWordStats().then(res => res.success && setStats(res.data!));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* 欢迎头部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Hello, <span className="text-gradient">Learner</span> 👋
          </h1>
          <p className="text-slate-400">Ready to expand your vocabulary today?</p>
        </div>
        <Link to="/add">
          <Button size="lg" className="rounded-full">
            <Plus className="w-5 h-5 mr-2" />
            New Word
          </Button>
        </Link>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Words" 
          value={stats?.total || 0} 
          icon={Book} 
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard 
          title="Mastered" 
          value={stats ? stats.cet4Count + stats.cet6Count : 0} 
          icon={Trophy} 
          color="text-yellow-400"
          bg="bg-yellow-500/10"
        />
        <StatCard 
          title="Accuracy" 
          value="85%" 
          icon={Activity} 
          color="text-green-400"
          bg="bg-green-500/10"
        />
        <StatCard 
          title="Streak" 
          value="12 Days" 
          icon={TrendingUp} 
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 快速开始卡片 */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Start Daily Quiz</h2>
            <p className="text-slate-300 mb-8 max-w-md">
              Challenge yourself with a personalized quiz based on your recent vocabulary.
              We've prepared a set of 20 words for you.
            </p>
            <Link to="/quiz">
              <Button size="lg" className="px-8">
                Start Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          {/* 装饰背景 */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-indigo-500 transform translate-x-12 translate-y-12" />
          </div>
        </Card>

        {/* 考试分布 */}
        <Card>
          <h3 className="text-lg font-semibold mb-6 text-slate-200">Vocabulary Distribution</h3>
          <div className="space-y-4">
            <ProgressItem label="CET-4" value={stats?.cet4Count || 0} total={stats?.total || 1} color="bg-blue-500" />
            <ProgressItem label="CET-6" value={stats?.cet6Count || 0} total={stats?.total || 1} color="bg-purple-500" />
            <ProgressItem label="IELTS" value={stats?.ieltsCount || 0} total={stats?.total || 1} color="bg-pink-500" />
            <ProgressItem label="TOEFL" value={stats?.toeflCount || 0} total={stats?.total || 1} color="bg-orange-500" />
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card hover className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </Card>
  );
}

function ProgressItem({ label, value, total, color }: any) {
  const percent = Math.min(100, Math.round((value / total) * 100)) || 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value} words</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
    </div>
  );
}
