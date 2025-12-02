import axios from 'axios';
import { config } from '../config/index';
import { WordInfo, AIResponse, DashScopeResponse } from '../types/index';

function buildPrompt(word: string): string {
  return `你是一个专业的英语词典助手。请分析以下英文单词或短语，并以 JSON 格式返回详细信息。

单词/短语: "${word}"

请返回以下格式的 JSON（不要包含任何其他文字，只返回纯 JSON）:
{
  "english": "原始单词/短语",
  "phonetic": "音标",
  "partOfSpeech": ["词性数组"],
  "englishDef": "英文释义",
  "chineseDef": "中文释义",
  "isCET4": true,
  "isCET6": true,
  "isIELTS": true,
  "isTOEFL": true,
  "isGraduate": true,
  "cet4Freq": 3,
  "cet6Freq": 3,
  "ieltsFreq": 3,
  "toeflFreq": 3,
  "graduateFreq": 3
}

注意：词频为1-5的数字或null，5为最高频。`;
}

function parseAIResponse(content: string): WordInfo | null {
  try {
    const parsed = JSON.parse(content);
    return validateWordInfo(parsed);
  } catch {
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON. parse(objectMatch[0]);
        return validateWordInfo(parsed);
      } catch {
        console.error('解析 JSON 对象失败');
      }
    }
    console.error('无法解析 AI 响应:', content);
    return null;
  }
}

function validateWordInfo(data: Record<string, unknown>): WordInfo | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  if (!data.english || !data. chineseDef) {
    return null;
  }
  return {
    english: String(data.english),
    phonetic: String(data.phonetic || ''),
    partOfSpeech: Array.isArray(data.partOfSpeech)
      ? data.partOfSpeech.map(String)
      : [String(data.partOfSpeech || 'n.')],
    englishDef: String(data.englishDef || ''),
    chineseDef: String(data.chineseDef),
    isCET4: Boolean(data.isCET4),
    isCET6: Boolean(data.isCET6),
    isIELTS: Boolean(data. isIELTS),
    isTOEFL: Boolean(data.isTOEFL),
    isGraduate: Boolean(data.isGraduate),
    cet4Freq: parseFreq(data. cet4Freq),
    cet6Freq: parseFreq(data.cet6Freq),
    ieltsFreq: parseFreq(data. ieltsFreq),
    toeflFreq: parseFreq(data.toeflFreq),
    graduateFreq: parseFreq(data.graduateFreq),
  };
}

function parseFreq(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  if (isNaN(num) || num < 1 || num > 5) {
    return null;
  }
  return Math.round(num);
}

function getMockWordInfo(word: string): AIResponse {
  const mockData: Record<string, WordInfo> = {
    'hello': {
      english: 'hello',
      phonetic: '/həˈloʊ/',
      partOfSpeech: ['interj.', 'n.'],
      englishDef: 'used as a greeting or to begin a phone conversation',
      chineseDef: '你好；喂（用于问候或打电话）',
      isCET4: true,
      isCET6: false,
      isIELTS: true,
      isTOEFL: true,
      isGraduate: false,
      cet4Freq: 5,
      cet6Freq: null,
      ieltsFreq: 4,
      toeflFreq: 4,
      graduateFreq: null,
    },
    'abandon': {
      english: 'abandon',
      phonetic: '/əˈbændən/',
      partOfSpeech: ['v.', 'n. '],
      englishDef: 'to leave someone or something permanently',
      chineseDef: '放弃；遗弃；抛弃',
      isCET4: true,
      isCET6: true,
      isIELTS: true,
      isTOEFL: true,
      isGraduate: true,
      cet4Freq: 4,
      cet6Freq: 4,
      ieltsFreq: 4,
      toeflFreq: 4,
      graduateFreq: 5,
    },
    'comprehensive': {
      english: 'comprehensive',
      phonetic: '/ˌkɑːmprɪˈhensɪv/',
      partOfSpeech: ['adj. '],
      englishDef: 'including all or nearly all elements or aspects of something',
      chineseDef: '综合的；全面的；广泛的',
      isCET4: false,
      isCET6: true,
      isIELTS: true,
      isTOEFL: true,
      isGraduate: true,
      cet4Freq: null,
      cet6Freq: 4,
      ieltsFreq: 5,
      toeflFreq: 5,
      graduateFreq: 4,
    },
  };

  const lowerWord = word.toLowerCase();

  if (mockData[lowerWord]) {
    return { success: true, data: mockData[lowerWord] };
  }

  const randomBool = (): boolean => Math.random() > 0.5;
  const randomFreq = (): number | null => randomBool() ?  Math.ceil(Math.random() * 5) : null;

  return {
    success: true,
    data: {
      english: word,
      phonetic: '/... /',
      partOfSpeech: ['n.'],
      englishDef: 'Definition of "' + word + '" (mock data)',
      chineseDef: '"' + word + '" 的中文释义（模拟数据）',
      isCET4: randomBool(),
      isCET6: randomBool(),
      isIELTS: randomBool(),
      isTOEFL: randomBool(),
      isGraduate: randomBool(),
      cet4Freq: randomFreq(),
      cet6Freq: randomFreq(),
      ieltsFreq: randomFreq(),
      toeflFreq: randomFreq(),
      graduateFreq: randomFreq(),
    },
  };
}

export async function getWordInfo(word: string): Promise<AIResponse> {
  // 检查 API Key 是否配置
  const apiKey = config.dashscopeApiKey;
  const isApiKeyConfigured = apiKey && apiKey.length > 10 && apiKey !== 'your_api_key_here';

  if (!isApiKeyConfigured) {
    console.log('⚠️ 未配置有效的通义千问 API Key，使用模拟数据');
    return getMockWordInfo(word);
  }

  try {
    console.log('🤖 调用通义千问 API，单词:', word);
    
    const response = await axios.post<DashScopeResponse>(
      config.dashscopeBaseUrl + '/chat/completions',
      {
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英语词典助手，精通英语词汇、语法和各类英语考试。请始终以 JSON 格式返回结果。'
          },
          {
            role: 'user',
            content: buildPrompt(word)
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'AI 返回内容为空' };
    }

    console.log('✅ AI 返回内容:', content. substring(0, 100) + '...');

    const wordInfo = parseAIResponse(content);
    if (! wordInfo) {
      return { success: false, error: '解析 AI 响应失败' };
    }

    wordInfo.english = word;
    return { success: true, data: wordInfo };
  } catch (error) {
    console.error('❌ 调用通义千问 API 失败:', error);

    // 如果 API 调用失败，回退到模拟数据
    console.log('📦 回退到模拟数据');
    return getMockWordInfo(word);
  }
}

export async function getWordsInfo(words: string[]): Promise<Map<string, AIResponse>> {
  const results = new Map<string, AIResponse>();

  for (const word of words) {
    const result = await getWordInfo(word);
    results.set(word, result);

    if (words.indexOf(word) < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
