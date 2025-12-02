import { prisma } from '../models/index';
import { getWordInfo } from './aiService';
import { WordInfo } from '../types/index';

// 添加单词
export async function addWord(english: string) {
  // 检查单词是否已存在
  const existing = await prisma.word.findUnique({
    where: { english: english.toLowerCase(). trim() },
  });

  if (existing) {
    return { success: false, error: '该单词已存在', data: existing };
  }

  // 调用 AI 获取单词信息
  const aiResult = await getWordInfo(english);

  if (!aiResult.success || !aiResult.data) {
    return { success: false, error: aiResult.error || '获取单词信息失败' };
  }

  const wordInfo = aiResult.data;

  // 存储到数据库
  const word = await prisma.word.create({
    data: {
      english: wordInfo.english. toLowerCase().trim(),
      phonetic: wordInfo.phonetic,
      partOfSpeech: JSON.stringify(wordInfo.partOfSpeech),
      englishDef: wordInfo.englishDef,
      chineseDef: wordInfo.chineseDef,
      isCET4: wordInfo.isCET4,
      isCET6: wordInfo.isCET6,
      isIELTS: wordInfo.isIELTS,
      isTOEFL: wordInfo.isTOEFL,
      isGraduate: wordInfo.isGraduate,
      cet4Freq: wordInfo.cet4Freq,
      cet6Freq: wordInfo.cet6Freq,
      ieltsFreq: wordInfo. ieltsFreq,
      toeflFreq: wordInfo.toeflFreq,
      graduateFreq: wordInfo.graduateFreq,
    },
  });

  return { success: true, data: formatWord(word) };
}

// 获取单词列表
export async function getWords(options: {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: {
    isCET4?: boolean;
    isCET6?: boolean;
    isIELTS?: boolean;
    isTOEFL?: boolean;
    isGraduate?: boolean;
  };
}) {
  const page = options.page || 1;
  const pageSize = options. pageSize || 20;
  const skip = (page - 1) * pageSize;

  // 构建查询条件
  const where: Record<string, unknown> = {};

  if (options.search) {
    where.OR = [
      { english: { contains: options.search } },
      { chineseDef: { contains: options.search } },
    ];
  }

  if (options. filter) {
    if (options.filter.isCET4 !== undefined) {
      where. isCET4 = options. filter.isCET4;
    }
    if (options. filter.isCET6 !== undefined) {
      where.isCET6 = options.filter.isCET6;
    }
    if (options.filter.isIELTS !== undefined) {
      where.isIELTS = options.filter. isIELTS;
    }
    if (options.filter.isTOEFL !== undefined) {
      where.isTOEFL = options.filter. isTOEFL;
    }
    if (options.filter.isGraduate !== undefined) {
      where.isGraduate = options.filter. isGraduate;
    }
  }

  // 查询数据
  const [words, total] = await Promise.all([
    prisma.word.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.word.count({ where }),
  ]);

  return {
    items: words.map(formatWord),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 获取单词详情
export async function getWordById(id: number) {
  const word = await prisma.word.findUnique({
    where: { id },
  });

  if (!word) {
    return { success: false, error: '单词不存在' };
  }

  return { success: true, data: formatWord(word) };
}

// 更新单词
export async function updateWord(id: number, data: Partial<WordInfo>) {
  const existing = await prisma.word.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: '单词不存在' };
  }

  const updateData: Record<string, unknown> = {};

  if (data.phonetic !== undefined) updateData.phonetic = data.phonetic;
  if (data. partOfSpeech !== undefined) updateData.partOfSpeech = JSON.stringify(data.partOfSpeech);
  if (data.englishDef !== undefined) updateData.englishDef = data.englishDef;
  if (data.chineseDef !== undefined) updateData.chineseDef = data. chineseDef;
  if (data.isCET4 !== undefined) updateData.isCET4 = data.isCET4;
  if (data.isCET6 !== undefined) updateData.isCET6 = data.isCET6;
  if (data.isIELTS !== undefined) updateData.isIELTS = data.isIELTS;
  if (data.isTOEFL !== undefined) updateData.isTOEFL = data.isTOEFL;
  if (data.isGraduate !== undefined) updateData. isGraduate = data. isGraduate;
  if (data.cet4Freq !== undefined) updateData.cet4Freq = data.cet4Freq;
  if (data.cet6Freq !== undefined) updateData.cet6Freq = data.cet6Freq;
  if (data.ieltsFreq !== undefined) updateData.ieltsFreq = data.ieltsFreq;
  if (data.toeflFreq !== undefined) updateData.toeflFreq = data.toeflFreq;
  if (data. graduateFreq !== undefined) updateData.graduateFreq = data.graduateFreq;

  const word = await prisma.word.update({
    where: { id },
    data: updateData,
  });

  return { success: true, data: formatWord(word) };
}

// 删除单词
export async function deleteWord(id: number) {
  const existing = await prisma.word.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: '单词不存在' };
  }

  await prisma.word.delete({
    where: { id },
  });

  return { success: true, message: '删除成功' };
}

// 获取单词统计
export async function getWordStats() {
  const [total, cet4Count, cet6Count, ieltsCount, toeflCount, graduateCount] = await Promise. all([
    prisma.word.count(),
    prisma. word.count({ where: { isCET4: true } }),
    prisma.word.count({ where: { isCET6: true } }),
    prisma.word.count({ where: { isIELTS: true } }),
    prisma.word.count({ where: { isTOEFL: true } }),
    prisma.word.count({ where: { isGraduate: true } }),
  ]);

  return {
    total,
    cet4Count,
    cet6Count,
    ieltsCount,
    toeflCount,
    graduateCount,
  };
}

// 格式化单词数据
function formatWord(word: {
  id: number;
  english: string;
  phonetic: string | null;
  partOfSpeech: string;
  englishDef: string | null;
  chineseDef: string;
  isCET4: boolean;
  isCET6: boolean;
  isIELTS: boolean;
  isTOEFL: boolean;
  isGraduate: boolean;
  cet4Freq: number | null;
  cet6Freq: number | null;
  ieltsFreq: number | null;
  toeflFreq: number | null;
  graduateFreq: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  let partOfSpeech: string[] = [];
  try {
    partOfSpeech = JSON.parse(word.partOfSpeech);
  } catch {
    partOfSpeech = word.partOfSpeech ?  [word.partOfSpeech] : [];
  }

  return {
    id: word. id,
    english: word. english,
    phonetic: word.phonetic,
    partOfSpeech,
    englishDef: word.englishDef,
    chineseDef: word.chineseDef,
    isCET4: word.isCET4,
    isCET6: word.isCET6,
    isIELTS: word.isIELTS,
    isTOEFL: word.isTOEFL,
    isGraduate: word.isGraduate,
    cet4Freq: word.cet4Freq,
    cet6Freq: word.cet6Freq,
    ieltsFreq: word.ieltsFreq,
    toeflFreq: word.toeflFreq,
    graduateFreq: word.graduateFreq,
    createdAt: word.createdAt. toISOString(),
    updatedAt: word.updatedAt.toISOString(),
  };
}
