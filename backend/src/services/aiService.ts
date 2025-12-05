import axios from 'axios';
import { config } from '../config/index';
import { WordInfo, AIResponse, DashScopeResponse } from '../types/index';

// ==========================================
// 内部辅助函数
// ==========================================

function buildPrompt(word: string): string {
  return `你是一个专业的英语词汇分析专家，精通各类英语考试大纲。请分析以下单词。

单词: "${word}"

【考试分类标准 - 请严格遵守】
1. CET-4：大学英语四级，约 4500 词，都是最基础常见词汇（如 book, water, happy）
2. CET-6：大学英语六级，在四级基础上增加约 2000 个中等难度词汇
3. 雅思 IELTS：学术英语，约 8000 词，包含学术场景词汇
4. 托福 TOEFL：北美学术英语，约 8000-10000 词
5. 考研：研究生入学考试，约 5500 词

【重要规则】
- 简单日常词汇（如 hello, good, water）只属于 CET-4，不要标记为其他考试
- 中等词汇（如 abandon, comprehensive）可能属于多个考试
- 高级学术词汇（如 ubiquitous, ephemeral）通常只属于雅思/托福
- 不确定时，宁可少标记，也不要多标记
- 词频 1-5 分，5 分表示最核心高频词

请返回纯 JSON 格式（不要 Markdown 代码块）：
{
  "english": "${word}",
  "phonetic": "音标",
  "partOfSpeech": ["词性"],
  "englishDef": "英文释义",
  "chineseDef": "中文释义",
  "isCET4": true或false,
  "isCET6": true或false,
  "isIELTS": true或false,
  "isTOEFL": true或false,
  "isGraduate": true或false,
  "cet4Freq": 数字或null,
  "cet6Freq": 数字或null,
  "ieltsFreq": 数字或null,
  "toeflFreq": 数字或null,
  "graduateFreq": 数字或null
}`;
}

function cleanJsonString(content: string): string {
  let clean = content. trim();
  clean = clean.replace(/^```json\s*/i, ''). replace(/^```\s*/i, '');
  clean = clean. replace(/\s*```$/, '');
  return clean;
}

function validateWordInfo(data: Record<string, unknown>): WordInfo | null {
  if (!data || typeof data !== 'object') return null;

  const parseString = (val: unknown, def: string = ''): string => {
    if (val === null || val === undefined) return def;
    return String(val);
  };

  const parseBoolean = (val: unknown): boolean => {
    return val === true || val === 'true';
  };

  const parseFreq = (val: unknown): number | null => {
    const n = Number(val);
    if (isNaN(n) || n < 1 || n > 5) return null;
    return Math.round(n);
  };

  const parseArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val. map(String);
    if (typeof val === 'string') return [val];
    return ['n. '];
  };

  const isCET4 = parseBoolean(data.isCET4);
  const isCET6 = parseBoolean(data.isCET6);
  const isIELTS = parseBoolean(data.isIELTS);
  const isTOEFL = parseBoolean(data.isTOEFL);
  const isGraduate = parseBoolean(data.isGraduate);

  return {
    english: parseString(data.english, 'Unknown'),
    phonetic: parseString(data.phonetic, ''),
    partOfSpeech: parseArray(data.partOfSpeech),
    englishDef: parseString(data.englishDef, ''),
    chineseDef: parseString(data.chineseDef, '暂无释义'),
    isCET4: isCET4,
    isCET6: isCET6,
    isIELTS: isIELTS,
    isTOEFL: isTOEFL,
    isGraduate: isGraduate,
    cet4Freq: isCET4 ?  parseFreq(data.cet4Freq) : null,
    cet6Freq: isCET6 ? parseFreq(data. cet6Freq) : null,
    ieltsFreq: isIELTS ? parseFreq(data. ieltsFreq) : null,
    toeflFreq: isTOEFL ? parseFreq(data.toeflFreq) : null,
    graduateFreq: isGraduate ?  parseFreq(data.graduateFreq) : null,
  };
}

function parseAIResponse(content: string): WordInfo | null {
  try {
    const cleanContent = cleanJsonString(content);
    const parsed = JSON.parse(cleanContent);
    return validateWordInfo(parsed);
  } catch (e) {
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]);
        return validateWordInfo(parsed);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function getMockWordInfo(word: string): AIResponse {
  return {
    success: true,
    data: {
      english: word,
      phonetic: '/... /',
      partOfSpeech: ['n.'],
      englishDef: 'Definition not available',
      chineseDef: '释义获取失败',
      isCET4: false,
      isCET6: false,
      isIELTS: false,
      isTOEFL: false,
      isGraduate: false,
      cet4Freq: null,
      cet6Freq: null,
      ieltsFreq: null,
      toeflFreq: null,
      graduateFreq: null,
    },
  };
}

// ==========================================
// 公开导出函数
// ==========================================

export async function getWordInfo(word: string): Promise<AIResponse> {
  const apiKey = config.dashscopeApiKey;

  if (!apiKey || apiKey.length < 10 || apiKey.includes('your_')) {
    console.log('⚠️ 使用模拟数据 (Key无效)');
    return getMockWordInfo(word);
  }

  try {
    console.log('🤖 AI请求: "' + word + '"');
    const response = await axios. post<DashScopeResponse>(
      config.dashscopeBaseUrl + '/chat/completions',
      {
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英语词汇专家。请严格按照用户要求返回纯JSON格式，不要添加任何Markdown标记或额外文字。',
          },
          { role: 'user', content: buildPrompt(word) },
        ],
        temperature: 0.1,
      },
      {
        headers: { Authorization: 'Bearer ' + apiKey },
        timeout: 20000,
      }
    );

    const content = response.data. choices[0]?.message?.content;
    if (!content) throw new Error('Empty content');

    const info = parseAIResponse(content);
    if (!info) return getMockWordInfo(word);

    info.english = word;
    return { success: true, data: info };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ AI错误:', errMsg);
    return getMockWordInfo(word);
  }
}

export async function generateDistractors(
  words: Array<{ english: string; chineseDef: string }>
): Promise<Record<string, string[]>> {
  const apiKey = config.dashscopeApiKey;

  if (! apiKey || apiKey.length < 10 || apiKey. includes('your_')) {
    console. log('⚠️ 使用本地生成干扰选项');
    return generateLocalDistractors(words);
  }

  try {
    const wordList = words.map(function (w) {
      return w.english + ': ' + w. chineseDef;
    }). join('\n');

    const prompt = '请为以下每个英文单词生成3个干扰选项（错误的中文释义），用于英译中选择题。\n\n单词列表：\n' + wordList + '\n\n要求：\n1. 干扰选项应该与正确答案有一定相似性，但必须是错误的\n2. 干扰选项应该是真实存在的中文词义\n3. 干扰选项的长度应与正确答案相近\n4. 每个单词必须有恰好3个干扰选项\n\n请返回纯 JSON 格式（不要 Markdown 代码块）：\n{\n  "单词1": ["干扰项1", "干扰项2", "干扰项3"],\n  "单词2": ["干扰项1", "干扰项2", "干扰项3"]\n}';

    console.log('🤖 生成干扰选项，数量:', words.length);

    const response = await axios.post<DashScopeResponse>(
      config. dashscopeBaseUrl + '/chat/completions',
      {
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英语考试出题专家。请返回纯JSON格式，不要添加Markdown标记。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: { Authorization: 'Bearer ' + apiKey },
        timeout: 30000,
      }
    );

    const content = response.data. choices[0]?. message?.content;
    if (!content) throw new Error('Empty content');

    const cleanContent = cleanJsonString(content);
    try {
      const result = JSON.parse(cleanContent);
      console.log('✅ AI干扰选项生成成功');
      return result;
    } catch {
      const objectMatch = content. match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      throw new Error('JSON parse failed');
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error. message : String(error);
    console. error('❌ AI生成干扰选项失败:', errMsg);
    console.log('📦 回退到本地生成');
    return generateLocalDistractors(words);
  }
}

function generateLocalDistractors(
  words: Array<{ english: string; chineseDef: string }>
): Record<string, string[]> {
  const distractorPool = [
    '增加', '减少', '改变', '保持', '发展', '支持', '反对', '创造', '破坏', '建立',
    '消除', '获得', '失去', '提高', '降低', '扩大', '缩小', '加强', '削弱', '促进',
    '方法', '结果', '原因', '目的', '过程', '条件', '环境', '机会', '挑战', '问题',
    '解决方案', '优势', '劣势', '特点', '本质', '现象', '规律', '趋势', '影响', '作用',
    '重要的', '主要的', '基本的', '特殊的', '普通的', '复杂的', '简单的', '明显的',
    '潜在的', '实际的', '理论的', '具体的', '抽象的', '积极的', '消极的', '有效的',
    '无效的', '直接的', '间接的', '相关的', '系统', '结构', '功能', '价值', '意义',
    '概念', '理论', '实践', '经验', '知识', '能力', '水平', '程度', '范围', '领域',
  ];

  const result: Record<string, string[]> = {};

  words.forEach(function (word) {
    const filtered = distractorPool.filter(function (d) {
      const def = word.chineseDef.toLowerCase();
      const distractor = d.toLowerCase();
      return ! def.includes(distractor) && !distractor. includes(def) && def !== distractor;
    });

    const shuffled = filtered.sort(function () {
      return Math.random() - 0.5;
    });

    result[word.english] = shuffled.slice(0, 3);

    while (result[word. english].length < 3) {
      result[word.english]. push('选项' + (result[word.english]. length + 1));
    }
  });

  return result;
}
