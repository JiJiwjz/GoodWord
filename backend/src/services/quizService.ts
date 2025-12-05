import { prisma } from '../models/index';
import { generateId, compareAnswer } from '../utils/helpers';
import { generateDistractors } from './aiService';

// 随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 开始新考核
export async function startQuiz(count: number) {
  // 获取单词总数
  const totalWords = await prisma.word.count();

  if (totalWords === 0) {
    return { success: false, error: '单词本为空，请先添加单词' };
  }

  // 如果单词数量不足，调整考核数量
  const actualCount = Math.min(count, totalWords);

  // 获取上一次考核的单词 ID
  const lastSession = await prisma. quizSession.findFirst({
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

  // 获取所有单词
  const allWords = await prisma.word.findMany({
    select: {
      id: true,
      english: true,
      phonetic: true,
      partOfSpeech: true,
      chineseDef: true,
    },
  });

  const allWordIds = allWords.map(w => w.id);

  // 选择单词，尽量避免与上次重复
  let selectedIds: number[] = [];

  if (actualCount >= totalWords) {
    selectedIds = shuffleArray([...allWordIds]);
  } else {
    const notInLastSession = allWordIds.filter(id => !lastWordIds.includes(id));

    if (notInLastSession.length >= actualCount) {
      selectedIds = shuffleArray(notInLastSession). slice(0, actualCount);
    } else {
      selectedIds = [... notInLastSession];
      const remaining = actualCount - notInLastSession.length;
      const fromLastSession = shuffleArray(
        allWordIds. filter(id => lastWordIds.includes(id))
      ). slice(0, remaining);
      selectedIds = shuffleArray([...selectedIds, ...fromLastSession]);
    }
  }

  // 获取选中的单词详情
  const selectedWords = selectedIds.map(id => allWords.find(w => w.id === id)! );

  // 生成干扰选项
  const wordList = selectedWords. map(w => ({
    english: w.english,
    chineseDef: w.chineseDef,
  }));

  console.log('📝 开始生成干扰选项.. .');
  const distractors = await generateDistractors(wordList);
  console.log('✅ 干扰选项生成完成');

  // 构建阶段1数据（中译英）
  const phase1Words = selectedWords.map(word => {
    let partOfSpeech: string[] = [];
    try {
      partOfSpeech = JSON.parse(word. partOfSpeech);
    } catch {
      partOfSpeech = word.partOfSpeech ?  [word.partOfSpeech] : [];
    }

    return {
      id: word.id,
      chineseDef: word.chineseDef,
      partOfSpeech,
    };
  });

  // 构建阶段2数据（英译中）- 打乱顺序
  const shuffledForPhase2 = shuffleArray([...selectedWords]);
  const phase2Words = shuffledForPhase2.map(word => {
    let partOfSpeech: string[] = [];
    try {
      partOfSpeech = JSON.parse(word.partOfSpeech);
    } catch {
      partOfSpeech = word.partOfSpeech ?  [word.partOfSpeech] : [];
    }

    // 获取干扰选项
    const wordDistractors = distractors[word.english] || ['选项A', '选项B', '选项C'];
    
    // 将正确答案和干扰选项混合并打乱
    const allOptions = [word.chineseDef, ...wordDistractors. slice(0, 3)];
    const shuffledOptions = shuffleArray(allOptions);
    const correctIndex = shuffledOptions.indexOf(word. chineseDef);

    return {
      id: word.id,
      english: word.english,
      phonetic: word.phonetic,
      partOfSpeech,
      options: shuffledOptions,
      correctIndex,
    };
  });

  // 创建考核批次
  const sessionId = generateId();
  await prisma.quizSession.create({
    data: {
      sessionId,
      wordCount: actualCount,
      wordIds: JSON.stringify(selectedIds),
      phase2Data: JSON.stringify(phase2Words),  // 保存阶段2数据
      status: 'ongoing',
    },
  });

  return {
    success: true,
    data: {
      sessionId,
      totalCount: actualCount,
      phase1Words,
      phase2Words,
    },
  };
}

// 提交阶段1答案（中译英）
export async function submitPhase1Answer(
  sessionId: string,
  wordId: number,
  answer: string
) {
  const session = await prisma.quizSession. findUnique({
    where: { sessionId },
  });

  if (!session) {
    return { success: false, error: '考核批次不存在' };
  }

  if (session.status === 'completed') {
    return { success: false, error: '该考核已结束' };
  }

  let wordIds: number[] = [];
  try {
    wordIds = JSON.parse(session.wordIds);
  } catch {
    wordIds = [];
  }

  if (! wordIds.includes(wordId)) {
    return { success: false, error: '该单词不在本次考核中' };
  }

  // 检查是否已经回答过
  const existingRecord = await prisma. quizRecord.findFirst({
    where: { sessionId, wordId, phase: 1 },
  });

  if (existingRecord) {
    return { success: false, error: '该单词已经回答过' };
  }

  // 获取正确答案
  const word = await prisma. word.findUnique({
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
      phase: 1,
    },
  });

  // 更新考核统计
  if (isCorrect) {
    await prisma. quizSession.update({
      where: { sessionId },
      data: { correctCount: { increment: 1 } },
    });
  } else {
    await prisma.quizSession.update({
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

// 提交阶段2答案（英译中）
export async function submitPhase2Answer(
  sessionId: string,
  wordId: number,
  selectedIndex: number
) {
  const session = await prisma.quizSession. findUnique({
    where: { sessionId },
  });

  if (!session) {
    return { success: false, error: '考核批次不存在' };
  }

  if (session.status === 'completed') {
    return { success: false, error: '该考核已结束' };
  }

  // 获取阶段2数据
  let phase2Data: { id: number; options: string[]; correctIndex: number }[] = [];
  try {
    phase2Data = JSON.parse(session.phase2Data || '[]');
  } catch {
    phase2Data = [];
  }

  const wordData = phase2Data. find(w => w.id === wordId);
  if (!wordData) {
    return { success: false, error: '该单词不在本次考核中' };
  }

  // 检查是否已经回答过
  const existingRecord = await prisma.quizRecord.findFirst({
    where: { sessionId, wordId, phase: 2 },
  });

  if (existingRecord) {
    return { success: false, error: '该单词已经回答过' };
  }

  // 判断答案是否正确
  const isCorrect = selectedIndex === wordData.correctIndex;
  const selectedAnswer = wordData.options[selectedIndex] || '';
  const correctAnswer = wordData.options[wordData.correctIndex] || '';

  // 记录答案
  await prisma.quizRecord. create({
    data: {
      wordId,
      sessionId,
      userAnswer: selectedAnswer,
      isCorrect,
      phase: 2,
    },
  });

  // 更新考核统计
  if (isCorrect) {
    await prisma.quizSession.update({
      where: { sessionId },
      data: { correctCount: { increment: 1 } },
    });
  } else {
    await prisma.quizSession.update({
      where: { sessionId },
      data: { wrongCount: { increment: 1 } },
    });
  }

  return {
    success: true,
    data: {
      isCorrect,
      correctAnswer,
      correctIndex: wordData. correctIndex,
      userAnswer: selectedAnswer,
      selectedIndex,
    },
  };
}

// 结束考核
export async function finishQuiz(sessionId: string) {
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
  const updatedSession = await prisma.quizSession.update({
    where: { sessionId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // 获取所有答题记录
  const records = await prisma.quizRecord. findMany({
    where: { sessionId },
    include: {
      word: {
        select: {
          english: true,
          chineseDef: true,
        },
      },
    },
    orderBy: [{ phase: 'asc' }, { quizDate: 'asc' }],
  });

  // 分阶段统计
  const phase1Records = records.filter(r => r.phase === 1);
  const phase2Records = records.filter(r => r.phase === 2);

  const phase1Results = phase1Records.map(record => ({
    wordId: record.wordId,
    english: record.word. english,
    chineseDef: record.word.chineseDef,
    userAnswer: record.userAnswer,
    isCorrect: record. isCorrect,
  }));

  const phase2Results = phase2Records.map(record => ({
    wordId: record.wordId,
    english: record.word. english,
    chineseDef: record.word.chineseDef,
    userAnswer: record. userAnswer,
    isCorrect: record. isCorrect,
  }));

  // 计算总体准确率（两个阶段总题数）
  const totalQuestions = session.wordCount * 2;
  const accuracy = totalQuestions > 0
    ? Math.round((updatedSession.correctCount / totalQuestions) * 100)
    : 0;

  return {
    success: true,
    data: {
      sessionId,
      totalCount: session.wordCount,
      totalQuestions,
      answeredCount: records.length,
      correctCount: updatedSession.correctCount,
      wrongCount: updatedSession.wrongCount,
      accuracy,
      phase1Results,
      phase2Results,
      completedAt: updatedSession.completedAt,
    },
  };
}

// 获取考核历史
export async function getQuizHistory(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;

  const [sessions, total] = await Promise. all([
    prisma.quizSession.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.quizSession. count({ where: { status: 'completed' } }),
  ]);

  const items = sessions.map(session => {
    const totalQuestions = session.wordCount * 2;
    const accuracy = totalQuestions > 0
      ? Math.round((session. correctCount / totalQuestions) * 100)
      : 0;

    return {
      sessionId: session.sessionId,
      wordCount: session.wordCount,
      totalQuestions,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
      accuracy,
      createdAt: session.createdAt. toISOString(),
      completedAt: session.completedAt?. toISOString() || null,
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

  if (! session) {
    return { success: false, error: '考核批次不存在' };
  }

  const records = await prisma.quizRecord. findMany({
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
    orderBy: [{ phase: 'asc' }, { quizDate: 'asc' }],
  });

  const phase1Records = records.filter(r => r.phase === 1);
  const phase2Records = records.filter(r => r.phase === 2);

  const formatResults = (recs: typeof records) => recs.map(record => {
    let partOfSpeech: string[] = [];
    try {
      partOfSpeech = JSON.parse(record.word.partOfSpeech);
    } catch {
      partOfSpeech = [];
    }

    return {
      wordId: record.wordId,
      english: record.word. english,
      chineseDef: record.word.chineseDef,
      partOfSpeech,
      userAnswer: record.userAnswer,
      isCorrect: record.isCorrect,
    };
  });

  const totalQuestions = session. wordCount * 2;
  const accuracy = totalQuestions > 0
    ?  Math.round((session.correctCount / totalQuestions) * 100)
    : 0;

  return {
    success: true,
    data: {
      sessionId: session.sessionId,
      status: session.status,
      wordCount: session.wordCount,
      totalQuestions,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
      accuracy,
      phase1Results: formatResults(phase1Records),
      phase2Results: formatResults(phase2Records),
      createdAt: session. createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString() || null,
    },
  };
}
