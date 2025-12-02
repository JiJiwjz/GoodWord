import { Badge, Card } from '../common';
import { Volume2, Trash2 } from 'lucide-react';
import type { Word } from '../../types';

interface WordCardProps {
  word: Word;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

export function WordCard({ word, onDelete, showDelete = false }: WordCardProps) {
  // 获取考试标签
  const examTags = [];
  if (word.isCET4) examTags. push({ label: 'CET-4', freq: word.cet4Freq });
  if (word.isCET6) examTags. push({ label: 'CET-6', freq: word. cet6Freq });
  if (word.isIELTS) examTags.push({ label: '雅思', freq: word.ieltsFreq });
  if (word.isTOEFL) examTags.push({ label: '托福', freq: word.toeflFreq });
  if (word.isGraduate) examTags.push({ label: '考研', freq: word. graduateFreq });

  // 播放发音
  const playPronunciation = () => {
    const utterance = new SpeechSynthesisUtterance(word.english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* 单词和音标 */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{word.english}</h3>
            <button
              onClick={playPronunciation}
              className="p-1. 5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="播放发音"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* 音标和词性 */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            {word.phonetic && <span>{word.phonetic}</span>}
            {word.partOfSpeech. length > 0 && (
              <span className="text-blue-600">{word.partOfSpeech. join(' / ')}</span>
            )}
          </div>

          {/* 释义 */}
          <div className="space-y-1 mb-4">
            <p className="text-gray-900">{word.chineseDef}</p>
            {word.englishDef && (
              <p className="text-sm text-gray-500 italic">{word.englishDef}</p>
            )}
          </div>

          {/* 考试标签 */}
          {examTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {examTags.map((tag) => (
                <Badge key={tag. label} variant="info">
                  {tag.label}
                  {tag.freq && <span className="ml-1 opacity-75">★{tag.freq}</span>}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 删除按钮 */}
        {showDelete && onDelete && (
          <button
            onClick={() => onDelete(word.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="删除单词"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
}
