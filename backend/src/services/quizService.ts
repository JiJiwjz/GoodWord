import { prisma } from '../models/index';
import { generateId, compareAnswer } from '../utils/helpers';

// 开始新考核
export async function startQuiz(count: number) {
  // 获取单词总数
  const totalWords = await prisma.word. count();

  if (totalWords === 0) {
    return { success: false, error: '单词本为空，请先添加单词' };
  }

  // 如果单词数量不足，调整考核数量
  const actualCount = Math.min(count, totalWords);

  // 获取上一次考核的单词 ID
  const lastSession = await prisma.quizSession.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  let lastWordIds: number[] = [];
  if (lastSession && lastSession.wordIds) {
    try {
      lastWordIds = JSON.parse(lastSession.wordIds);
    } catch {
      lastWordIds = [];
    }
  }

  // 获取所有单词 ID
  const allWords = await prisma.word.findMany({
    select: { id: true },
  });
  const allWordIds = allWords.map(w => w.id);

  // 选择单词，尽量避免与上次重复
  let selectedIds: number[] = [];

  if (actualCount >= totalWords) {
    // 如果需要的数量大于等于总数，直接使用全部单词
    selectedIds = shuffleArray([...allWordIds]);
  } else {
    // 优先选择上次没考过的单词
    const notInLastSession = allWordIds.filter(id => !lastWordIds. includes(id));

    if (notInLastSession. length >= actualCount) {
      // 上次没考过的单词足够
      selectedIds = shuffleArray(notInLastSession). slice(0, actualCount);
    } else {
      // 上次没考过的不够，需要从上次考过的里面补充
      selectedIds = [... notInLastSession];
      const remaining = actualCount - notInLastSession.length;
      const fromLastSession = shuffleArray(
        allWordIds.filter(id => lastWordIds.includes(id))
      ).slice(0, remaining);
      selectedIds = shuffleArray([...selectedIds, ...fromLastSession]);
    }
  }

  // 创建考核批次
  const sessionId = generateId();
  const session = await prisma.quizSession.create({
    data: {
      sessionId,
      wordCount: actualCount,
      wordIds: JSON.stringify(selectedIds),
      status: 'ongoing',
    },
  });

  // 获取选中单词的详细信息
  const words = await prisma.word.findMany({
    where: { id: { in: selectedIds } },
    select: {
      id: true,
      english: true,
      chineseDef: true,
      partOfSpeech: true,
    },
  });

  // 按照 selectedIds 的顺序排序
  const orderedWords = selectedIds.map(id => {
    const word = words.find(w => w.id === id);
    if (! word) return null;

    let partOfSpeech: string[] = [];
    try {
      partOfSpeech = JSON.parse(word.partOfSpeech);
    } catch {
      partOfSpeech = word.partOfSpeech ?  [word.partOfSpeech] : [];
    }

    return {
      id: word. id,
      chineseDef: word.chineseDef,
      partOfSpeech,
    };
  }).filter(Boolean);

  return {
    success: true,
    data: {
      sessionId,
      totalCount: actualCount,
      words: orderedWords,
    },
  };
}

// 提交答案
export async function submitAnswer(
  sessionId: string,
  wordId: number,
  answer: string
) {
  // 检查考核批次是否存在
  const session = await prisma.quizSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    return { success: false, error: '考核批次不存在' };
  }

  if (session.status === 'completed') {
    return { success: false, error: '该考核已结束' };
  }

  // 检查单词是否在本次考核中
  let wordIds: number[] = [];
  try {
    wordIds = JSON. parse(session.wordIds);
  } catch {
    wordIds = [];
  }

  if (!wordIds.includes(wordId)) {
    return { success: false, error: '该单词不在本次考核中' };
  }

  // 检查是否已经回答过
  const existingRecord = await prisma.quizRecord.findFirst({
    where: { sessionId, wordId },
  });

  if (existingRecord) {
    return { success: false, error: '该单词已经回答过' };
  }

  // 获取正确答案
  const word = await prisma.word.findUnique({
    where: { id: wordId },
    select: { english: true },
  });

  if (!word) {
    return { success: false, error: '单词不存在' };
  }

  // 判断答案是否正确
  const isCorrect = compareAnswer(answer, word.english);

  // 记录答案
  await prisma.quizRecord.create({
    data: {
      wordId,
      sessionId,
      userAnswer: answer,
      isCorrect,
    },
  });

  // 更新考核统计
  if (isCorrect) {
    await prisma.quizSession.update({
      where: { sessionId },
      data: { correctCount: { increment: 1 } },
    });
  } else {
    await prisma. quizSession.update({
      where: { sessionId },
      data: { wrongCount: { increment: 1 } },
    });
  }

  return {
    success: true,
    data: {
      isCorrect,
      correctAnswer: word.english,
      userAnswer: answer,
    },
  };
}

// 结束考核
export async function finishQuiz(sessionId: string) {
  // 检查考核批次是否存在
  const session = await prisma.quizSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    return { success: false, error: '考核批次不存在' };
  }

  if (session.status === 'completed') {
    return { success: false, error: '该考核已经结束' };
  }

  // 更新考核状态
  const updatedSession = await prisma. quizSession.update({
    where: { sessionId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // 获取所有答题记录
  const records = await prisma.quizRecord.findMany({
    where: { sessionId },
    include: {
      word: {
        select: {
          english: true,
          chineseDef: true,
        },
      },
    },
  });

  // 格式化结果
  const results = records.map(record => ({
    wordId: record.wordId,
    english: record.word.english,
    chineseDef: record. word.chineseDef,
    userAnswer: record.userAnswer,
    isCorrect: record.isCorrect,
  }));

  // 计算准确率
  const accuracy = session.wordCount > 0
    ? Math.round((updatedSession.correctCount / session. wordCount) * 100)
    : 0;

  return {
    success: true,
    data: {
      sessionId,
      totalCount: session. wordCount,
      answeredCount: records.length,
      correctCount: updatedSession.correctCount,
      wrongCount: updatedSession.wrongCount,
      accuracy,
      results,
      completedAt: updatedSession.completedAt,
    },
  };
}

// 获取考核历史
export async function getQuizHistory(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;

  const [sessions, total] = await Promise.all([
    prisma.quizSession. findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.quizSession.count({ where: { status: 'completed' } }),
  ]);

  const items = sessions.map(session => {
    const accuracy = session.wordCount > 0
      ? Math.round((session.correctCount / session.wordCount) * 100)
      : 0;

    return {
      sessionId: session.sessionId,
      wordCount: session.wordCount,
      correctCount: session.correctCount,
      wrongCount: session. wrongCount,
      accuracy,
      createdAt: session.createdAt. toISOString(),
      completedAt: session.completedAt?.toISOString() || null,
    };
  });

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 获取考核详情
export async function getQuizDetail(sessionId: string) {
  const session = await prisma. quizSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    return { success: false, error: '考核批次不存在' };
  }

  const records = await prisma.quizRecord.findMany({
    where: { sessionId },
    include: {
      word: {
        select: {
          english: true,
          chineseDef: true,
          partOfSpeech: true,
        },
      },
    },
    orderBy: { quizDate: 'asc' },
  });

  const results = records.map(record => {
    let partOfSpeech: string[] = [];
    try {
      partOfSpeech = JSON.parse(record.word.partOfSpeech);
    } catch {
      partOfSpeech = [];
    }

    return {
      wordId: record.wordId,
      english: record. word.english,
      chineseDef: record.word.chineseDef,
      partOfSpeech,
      userAnswer: record.userAnswer,
      isCorrect: record.isCorrect,
    };
  });

  const accuracy = session.wordCount > 0
    ? Math.round((session.correctCount / session.wordCount) * 100)
    : 0;

  return {
    success: true,
    data: {
      sessionId: session.sessionId,
      status: session.status,
      wordCount: session.wordCount,
      correctCount: session.correctCount,
      wrongCount: session. wrongCount,
      accuracy,
      results,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString() || null,
    },
  };
}

// 工具函数：随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
