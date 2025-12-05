import { Card, Badge } from '../common';
import { Volume2, Trash2 } from 'lucide-react';
import type { Word } from '../../types';
import { motion } from 'framer-motion';

// ... 接口定义 ...
interface WordCardProps {
  word: Word;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

export function WordCard({ word, onDelete, showDelete }: WordCardProps) {
  // ★★★ 增加安全检查，防止黑屏 ★★★
  if (!word) return null;

  const safeEnglish = word.english || 'Unknown';
  const safePhonetic = word.phonetic || '';
  // 确保 partOfSpeech 是数组，如果不是，转为空数组
  const safePartOfSpeech = Array.isArray(word.partOfSpeech) ? word.partOfSpeech : [];
  const safeChineseDef = word.chineseDef || '...';

  // 获取考试标签
  const examTags = [];
  if (word.isCET4) examTags.push({ label: 'CET-4', freq: word.cet4Freq });
  if (word.isCET6) examTags.push({ label: 'CET-6', freq: word.cet6Freq });
  if (word.isIELTS) examTags.push({ label: '雅思', freq: word.ieltsFreq });
  if (word.isTOEFL) examTags.push({ label: '托福', freq: word.toeflFreq });
  if (word.isGraduate) examTags.push({ label: '考研', freq: word.graduateFreq });

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发卡片点击
    const utterance = new SpeechSynthesisUtterance(safeEnglish);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card hover className="h-full flex flex-col group border-l-4 border-l-indigo-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
              {safeEnglish}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 mt-1 font-mono text-sm">
              {safePhonetic && <span>{safePhonetic}</span>}
              {safePhonetic && safePartOfSpeech.length > 0 && <span className="w-1 h-1 rounded-full bg-slate-600" />}
              {safePartOfSpeech.length > 0 && (
                <span className="text-indigo-400 italic">{safePartOfSpeech.join(', ')}</span>
              )}
            </div>
          </div>
          <button
            onClick={playPronunciation}
            className="p-2 rounded-full bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500 hover:text-white"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 mb-4 flex-grow">{safeChineseDef}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
          <div className="flex gap-2 flex-wrap">
            {examTags.map((tag) => (
              <span key={tag.label} className="px-2 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                {tag.label}
              </span>
            ))}
          </div>
          
          {showDelete && (
            <button 
              onClick={() => onDelete?.(word.id)}
              className="text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
