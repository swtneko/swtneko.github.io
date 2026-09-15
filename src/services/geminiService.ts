import { GoogleGenAI } from "@google/genai";
import { DrawnCard, ReadingTheme, SpreadType, DeckType, UserInfo, AppSettings, AIProvider } from '../types';

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
  tag?: string;
}

export const PROVIDER_MODELS: Record<AIProvider, ModelOption[]> = {
  auto: [
    { id: 'auto', name: 'Tự động thông minh', desc: 'Hệ thống tự động chọn mô hình nhanh và ổn định nhất theo tình trạng mạng', tag: 'Mặc định' }
  ],
  gemini: [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Mới nhất của Google - Siêu nhanh, thông minh và giàu cảm xúc', tag: 'Khuyên dùng' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', desc: 'Trí tuệ đỉnh cao - Phân tích Tarot, Chiêm tinh & Triết học sâu sắc nhất', tag: 'Bậc thầy tâm linh' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Mô hình Pro đa tầng, giải mã quẻ bài chi tiết và chuẩn xác', tag: 'Chuyên sâu' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Cân bằng lý tưởng giữa tốc độ phản hồi và độ sâu biểu tượng' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', desc: 'Siêu nhẹ, phản hồi tức thì, tối ưu hóa quota' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', desc: 'Mạnh mẽ nhất trên Groq, văn phong mượt mà và thông thái', tag: 'Khuyên dùng' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Groq)', desc: 'Mô hình suy luận chuyên sâu kết hợp tốc độ cực hạn của Groq LPU', tag: 'Suy luận' },
    { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B (Groq)', desc: 'Mô hình đa ngôn ngữ xuất sắc, tiếng Việt uyển chuyển và tự nhiên' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', desc: 'Tốc độ phản hồi tức thì (<0.5s), phản hồi siêu nhanh' },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek-V3 (Chat)', desc: 'Mô hình 671B MoE tiên tiến, tư duy triết học và văn phong huyền học cực hay', tag: 'Khuyên dùng' },
    { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Reasoner)', desc: 'Mô hình suy luận từng bước (Chain-of-Thought) giải nghĩa ẩn sâu', tag: 'Suy luận chuyên sâu' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (Flagship Omni)', desc: 'Mô hình toàn năng hàng đầu của OpenAI, văn phong trau chuốt và chuẩn xác', tag: 'Cao cấp' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Nhanh, thông minh, tối ưu chi phí và phản hồi mượt mà', tag: 'Khuyên dùng' },
    { id: 'o3-mini', name: 'o3-mini (Reasoning)', desc: 'Mô hình suy luận thế hệ mới với khả năng phân tích logic quẻ bài sâu sắc', tag: 'Suy luận mới' },
    { id: 'o1', name: 'o1 (Deep Reasoning)', desc: 'Mô hình tư duy sâu chuỗi nhân - quả cho các câu hỏi quan trọng', tag: 'Tư duy sâu' },
  ],
  openrouter: [
    { id: 'openrouter/free', name: 'OpenRouter Free Router (openrouter/free)', desc: 'Tự động định tuyến các mô hình AI hoàn toàn miễn phí trên OpenRouter', tag: 'Miễn phí 100%' },
    { id: 'openrouter/auto', name: 'OpenRouter Auto Router (openrouter/auto)', desc: 'Tự động lựa chọn mô hình tối ưu nhất trong hệ thống OpenRouter', tag: 'Tự động' },
  ],
};

// Helper to retrieve all active Gemini keys (split by comma, newline, or space)
export const getGeminiKeys = (): string[] => {
  const keysSet = new Set<string>();

  // 1. Check custom keys from user settings in localStorage
  try {
    const saved = localStorage.getItem('celestial-settings');
    if (saved) {
      const parsed: AppSettings = JSON.parse(saved);
      if (parsed.customKeys?.gemini) {
        parsed.customKeys.gemini
          .split(/[\n,]+/)
          .map(k => k.trim())
          .filter(k => k.length > 5 && k !== 'MY_GEMINI_API_KEY')
          .forEach(k => keysSet.add(k));
      }
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Check Admin global system keys in localStorage
  try {
    const sys = localStorage.getItem('celestial-system-settings');
    if (sys) {
      const parsedSys = JSON.parse(sys);
      if (parsedSys.systemApiKeys?.gemini) {
        parsedSys.systemApiKeys.gemini
          .split(/[\n,]+/)
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 5 && k !== 'MY_GEMINI_API_KEY')
          .forEach((k: string) => keysSet.add(k));
      }
    }
  } catch (e) {
    // Ignore error
  }

  // 3. Check environment variables (Vercel / Vite build)
  const envKeys = [
    (process.env as any).GEMINI_API_KEYS,
    process.env.GEMINI_API_KEY,
    (import.meta as any).env?.VITE_GEMINI_API_KEY,
  ];

  for (const raw of envKeys) {
    if (typeof raw === 'string' && raw) {
      raw
        .split(/[\n,]+/)
        .map(k => k.trim())
        .filter(k => k.length > 5 && k !== 'undefined' && k !== 'null' && k !== 'MY_GEMINI_API_KEY')
        .forEach(k => keysSet.add(k));
    }
  }

  return Array.from(keysSet);
};

// Helper to get key for other providers
export const getProviderKey = (provider: 'deepseek' | 'groq' | 'openai' | 'openrouter'): string => {
  // 1. Check custom keys from user settings
  try {
    const saved = localStorage.getItem('celestial-settings');
    if (saved) {
      const parsed: AppSettings = JSON.parse(saved);
      const customKey = parsed.customKeys?.[provider]?.trim();
      if (customKey && customKey.length > 5) return customKey;
    }
  } catch (e) {}

  // 2. Check environment variables
  if (provider === 'deepseek') {
    const k = (process.env as any).DEEPSEEK_API_KEY || (import.meta as any).env?.VITE_DEEPSEEK_API_KEY;
    if (typeof k === 'string' && k.length > 5 && k !== 'undefined') return k.trim();
  } else if (provider === 'groq') {
    const k = (process.env as any).GROQ_API_KEY || (import.meta as any).env?.VITE_GROQ_API_KEY;
    if (typeof k === 'string' && k.length > 5 && k !== 'undefined') return k.trim();
  } else if (provider === 'openai') {
    const k = (process.env as any).OPENAI_API_KEY || (import.meta as any).env?.VITE_OPENAI_API_KEY;
    if (typeof k === 'string' && k.length > 5 && k !== 'undefined') return k.trim();
  } else if (provider === 'openrouter') {
    const k = (process.env as any).OPENROUTER_API_KEY || (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
    if (typeof k === 'string' && k.length > 5 && k !== 'undefined') return k.trim();
  }

  // Check admin global system keys if user didn't provide their own
  try {
    const sys = localStorage.getItem('celestial-system-settings');
    if (sys) {
      const parsedSys = JSON.parse(sys);
      if (parsedSys.systemApiKeys?.[provider]?.trim()) {
        return parsedSys.systemApiKeys[provider].trim();
      }
    }
  } catch (e) {}

  return "";
};

// Information helper for UI
export const getProviderStatus = () => {
  const geminiKeys = getGeminiKeys();
  const deepseek = getProviderKey('deepseek');
  const groq = getProviderKey('groq');
  const openai = getProviderKey('openai');
  const openrouter = getProviderKey('openrouter');

  return {
    gemini: { configured: geminiKeys.length > 0, count: geminiKeys.length },
    deepseek: { configured: !!deepseek },
    groq: { configured: !!groq },
    openai: { configured: !!openai },
    openrouter: { configured: !!openrouter },
  };
};

// Generic OpenAI-compatible caller (DeepSeek, Groq, OpenAI, OpenRouter)
const callOpenAICompatible = async (
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  extraHeaders: Record<string, string> = {}
): Promise<string> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia giải bài Tarot và bài Tây chuyên nghiệp, sâu sắc, huyền bí và tràn đầy sự khích lệ.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMessage = errorText;
    try {
      const errJson = JSON.parse(errorText);
      parsedMessage = errJson.error?.message || errorText;
    } catch {}
    throw new Error(`HTTP ${response.status}: ${parsedMessage}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Không nhận được nội dung phản hồi từ AI");
  }
  return content;
};

// Gemini generation with key rotation
const callGeminiWithRotation = async (prompt: string, requestedModel?: string): Promise<string> => {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error("MISSING_GEMINI_KEY");
  }

  const defaultGeminiModels = [
    "gemini-3.8-flash",
    "gemini-3.1-pro-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
  ];
  const models = requestedModel && requestedModel !== 'auto'
    ? [requestedModel, ...defaultGeminiModels.filter(m => m !== requestedModel)]
    : defaultGeminiModels;

  let lastError: any = null;

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const currentKey = keys[keyIndex];
    const ai = new GoogleGenAI({ apiKey: currentKey });

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        if (response.text) {
          const rotationNote = keys.length > 1 ? ` *(Khóa ${keyIndex + 1}/${keys.length})*` : '';
          return `${response.text}\n\n*✨ Diễn giải bởi Google Gemini (${model})${rotationNote}*`;
        }
      } catch (err: any) {
        console.warn(`Gemini key #${keyIndex + 1} with model ${model} failed:`, err);
        lastError = err;
        // If it's a rate limit (429) or quota or key error, break to next key
        const msg = String(err?.message || "").toLowerCase();
        if (msg.includes("429") || msg.includes("quota") || msg.includes("limit") || msg.includes("key")) {
          break; // move to next key immediately
        }
      }
    }
  }

  throw lastError || new Error("Tất cả khóa Gemini đều không phản hồi");
};

// Core multi-provider dispatcher with fallback & rotation
export const dispatchAiPrompt = async (
  prompt: string,
  options?: { provider?: AIProvider; model?: string; allowFallback?: boolean }
): Promise<string> => {
  // 1. Read user local settings
  let userProvider: AIProvider = 'auto';
  let userModel: string = 'auto';
  let userAllowFallback = true;
  try {
    const saved = localStorage.getItem('celestial-settings');
    if (saved) {
      const parsed: AppSettings = JSON.parse(saved);
      if (parsed.aiProvider) userProvider = parsed.aiProvider;
      if (parsed.aiModel) userModel = parsed.aiModel;
      if (parsed.allowFallback !== undefined) userAllowFallback = parsed.allowFallback;
    }
  } catch (e) {}

  // 2. Read Admin global system settings from localStorage
  let globalProvider: AIProvider = 'auto';
  let globalModel: string = 'auto';
  let globalAllowFallback = true;
  let customSystemPrompt = '';
  let aiProviderPriority: AIProvider[] = ['groq', 'gemini', 'deepseek', 'openai', 'openrouter'];
  let enabledAiProviders: Partial<Record<AIProvider, boolean>> = {};

  try {
    const sys = localStorage.getItem('celestial-system-settings');
    if (sys) {
      const parsedSys = JSON.parse(sys);
      if (parsedSys.globalAiProvider) globalProvider = parsedSys.globalAiProvider;
      if (parsedSys.globalAiModel) globalModel = parsedSys.globalAiModel;
      if (parsedSys.allowFallback !== undefined) globalAllowFallback = parsedSys.allowFallback;
      if (parsedSys.customSystemPrompt) customSystemPrompt = parsedSys.customSystemPrompt;
      if (parsedSys.aiProviderPriority && Array.isArray(parsedSys.aiProviderPriority)) {
        aiProviderPriority = parsedSys.aiProviderPriority;
      }
      if (parsedSys.enabledAiProviders) {
        enabledAiProviders = parsedSys.enabledAiProviders;
      }
    }
  } catch (e) {}

  // 2.5 Check if there is an assigned AI provider and model for the logged-in user:
  let assignedProvider: string | null = null;
  let assignedModel: string | null = null;
  try {
    const syncedUserStr = localStorage.getItem('celestial-synced-user');
    if (syncedUserStr) {
      const syncedUser = JSON.parse(syncedUserStr);
      if (syncedUser.assignedProvider && syncedUser.assignedProvider !== 'auto') {
        assignedProvider = syncedUser.assignedProvider;
      }
      if (syncedUser.assignedModel && syncedUser.assignedModel !== 'auto') {
        assignedModel = syncedUser.assignedModel;
      }
    }
  } catch (e) {}

  // Determine effective target provider:
  // User's assigned provider > Explicit option > Admin's global setting (if not 'auto') > First in aiProviderPriority > 'auto'
  let targetProvider: AIProvider = (assignedProvider as AIProvider) || options?.provider || 'auto';
  if (targetProvider === 'auto') {
    if (globalProvider !== 'auto') {
      targetProvider = globalProvider;
    }
  }

  // Determine effective target model:
  // User's assigned model > Explicit option > Admin's global setting > 'auto'
  let targetModel: string = assignedModel || options?.model || 'auto';
  if (targetModel === 'auto') {
    if (globalModel && globalModel !== 'auto') {
      targetModel = globalModel;
    }
  }

  // Filter priority chain to only enabled providers
  const activePriorityChain: AIProvider[] = aiProviderPriority.filter(p => {
    if (p === 'auto') return false;
    return enabledAiProviders[p] ?? true;
  });

  // Determine allowFallback
  const allowFallback = options?.allowFallback ?? (userProvider !== 'auto' ? userAllowFallback : globalAllowFallback);

  // If a custom system prompt was defined in Admin settings, prepend it:
  let finalPrompt = prompt;
  if (customSystemPrompt?.trim()) {
    finalPrompt = `[CHỈ DẪN QUẢN TRỊ VIÊN HỆ THỐNG]:\n${customSystemPrompt.trim()}\n\n---\n${prompt}`;
  }

  const providerNames: Record<AIProvider, string> = {
    auto: 'Tự động thông minh',
    gemini: 'Google Gemini',
    groq: 'Groq Cloud',
    deepseek: 'DeepSeek',
    openai: 'OpenAI GPT',
    openrouter: 'OpenRouter',
  };

  // Helper to execute a single provider call
  const executeProvider = async (provider: AIProvider, modelToUse: string): Promise<string> => {
    if (provider === 'gemini') {
      const geminiKeys = getGeminiKeys();
      if (geminiKeys.length === 0) {
        throw new Error("Chưa có Google Gemini API Key khả dụng (vui lòng dán key tại Cài đặt hoặc Admin Panel)");
      }
      return await callGeminiWithRotation(finalPrompt, modelToUse);
    }

    if (provider === 'groq') {
      const key = getProviderKey('groq');
      if (!key) throw new Error("Chưa cấu hình Groq API Key");
      const model = (modelToUse && modelToUse !== 'auto') ? modelToUse : 'llama-3.3-70b-versatile';
      const res = await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        key,
        model,
        finalPrompt
      );
      return `${res}\n\n*⚡ Diễn giải bởi Groq (${model})*`;
    }

    if (provider === 'deepseek') {
      const key = getProviderKey('deepseek');
      if (!key) throw new Error("Chưa cấu hình DeepSeek API Key");
      const model = (modelToUse && modelToUse !== 'auto') ? modelToUse : 'deepseek-chat';
      const res = await callOpenAICompatible(
        'https://api.deepseek.com/chat/completions',
        key,
        model,
        finalPrompt
      );
      return `${res}\n\n*✨ Diễn giải bởi DeepSeek (${model})*`;
    }

    if (provider === 'openai') {
      const key = getProviderKey('openai');
      if (!key) throw new Error("Chưa cấu hình OpenAI API Key");
      const model = (modelToUse && modelToUse !== 'auto') ? modelToUse : 'gpt-4o-mini';
      const res = await callOpenAICompatible(
        'https://api.openai.com/v1/chat/completions',
        key,
        model,
        finalPrompt
      );
      return `${res}\n\n*🌟 Diễn giải bởi OpenAI (${model})*`;
    }

    if (provider === 'openrouter') {
      const key = getProviderKey('openrouter');
      if (!key) throw new Error("Chưa cấu hình OpenRouter API Key");
      const model = (modelToUse && modelToUse !== 'auto') ? modelToUse : 'openrouter/free';
      const res = await callOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        key,
        model,
        finalPrompt,
        {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Celestial Tarot',
        }
      );
      return `${res}\n\n*🌌 Diễn giải bởi OpenRouter (${model})*`;
    }

    throw new Error(`Nhà cung cấp AI không xác định: ${provider}`);
  };

  // If user or admin chose a specific provider (not 'auto'):
  if (targetProvider !== 'auto') {
    try {
      return await executeProvider(targetProvider, targetModel);
    } catch (err: any) {
      console.warn(`Lỗi khi gọi model được chọn (${targetProvider} / ${targetModel}):`, err);
      
      // If user disabled fallback, or if key was missing and user explicitly picked this provider:
      if (!allowFallback) {
        return `### ⚠️ Không thể kết nối với ${providerNames[targetProvider]}
**Nguyên nhân:** ${err?.message || 'Không thể phản hồi'}

Hệ thống đang cấu hình **chỉ sử dụng ${providerNames[targetProvider]} (${targetModel})**.
- **Cách khắc phục:** 
1. Mở biểu tượng **⚙️ Cài đặt** (hoặc Admin Panel), kiểm tra lại API Key cho **${providerNames[targetProvider]}**.
2. Hoặc bật tùy chọn **"Tự động chuyển sang nhà cung cấp dự phòng khi lỗi (Auto-Fallback)"** để quẻ bài luôn được hoàn thành.`;
      }

      console.info(`Đang chuyển sang nhà cung cấp dự phòng...`);
    }
  }

  // Fallback sequence or 'auto' mode using admin configured activePriorityChain:
  const fallbackList: AIProvider[] = activePriorityChain.filter(
    p => p !== targetProvider
  );

  const allToTry = targetProvider === 'auto'
    ? activePriorityChain
    : fallbackList;

  const errors: string[] = [];

  for (const provider of allToTry) {
    try {
      const res = await executeProvider(provider, 'auto');
      if (targetProvider !== 'auto') {
        return `> ℹ️ *Thông báo: Không thể kết nối với **${providerNames[targetProvider]}** (thiếu API key hoặc hết quota). Hệ thống đã tự động chuyển sang **${providerNames[provider]}**.* \n\n${res}`;
      }
      return res;
    } catch (err: any) {
      errors.push(`${providerNames[provider]}: ${err?.message || 'Lỗi kết nối'}`);
    }
  }

  const status = getProviderStatus();
  const configuredAny = status.gemini.configured || status.deepseek.configured || status.groq.configured || status.openai.configured || status.openrouter.configured;

  if (!configuredAny) {
    return `### ⚠️ Chưa tìm thấy khóa API
Ứng dụng cần ít nhất một khóa API để kết nối trí tuệ nhân tạo:
1. **Google Gemini (Miễn phí):** Lấy tại [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. **Groq (Miễn phí & Cực nhanh):** Lấy tại [console.groq.com](https://console.groq.com).
3. **DeepSeek / OpenAI / OpenRouter:** Bạn có thể nhập trực tiếp tại biểu tượng **⚙️ Cài đặt** ở góc trên màn hình.`;
  }

  return `### ⚠️ Không thể kết nối với các dịch vụ AI
${errors.map(e => `- ${e}`).join('\n')}

Vui lòng kiểm tra lại quota hoặc thử lại sau.`;
};

// Main interpretation dispatcher
export const interpretReading = async (
  question: string,
  theme: ReadingTheme,
  spreadType: SpreadType,
  drawnCards: DrawnCard[],
  deckType: DeckType,
  userInfo: UserInfo
): Promise<string> => {
  const cardsInfo = drawnCards.map((c, i) => {
    const pos = c.positionName ? ` (Vị trí: ${c.positionName === 'Past' ? 'Quá khứ' : c.positionName === 'Present' ? 'Hiện tại' : 'Tương lai'})` : '';
    const meaning = c.isReversed ? c.card.meaningReversed : c.card.meaningUpright;
    const keywords = (c.isReversed ? c.card.keywordsReversed : c.card.keywordsUpright)?.join(', ') || '';
    const astro = [c.card.element ? `Nguyên tố: ${c.card.element}` : '', c.card.zodiac ? `Cung hoàng đạo: ${c.card.zodiac}` : '', c.card.planet ? `Hành tinh: ${c.card.planet}` : ''].filter(Boolean).join(' | ');
    const specificField = theme === ReadingTheme.LOVE 
      ? (c.isReversed ? c.card.loveReversed : c.card.love)
      : theme === ReadingTheme.CAREER || theme === ReadingTheme.STUDY
      ? (c.isReversed ? c.card.careerReversed : c.card.career)
      : (c.isReversed ? c.card.spiritualReversed : c.card.spiritual);

    let details = `${i + 1}. ${c.card.name}${c.isReversed ? ' (Ngược)' : ' (Xuôi)'}${pos}: ${meaning}`;
    if (keywords) details += `\n   - Từ khóa cốt lõi: ${keywords}`;
    if (astro) details += `\n   - Năng lượng vũ trụ & Chiêm tinh: ${astro}`;
    if (specificField) details += `\n   - Chỉ dẫn theo khía cạnh: ${specificField}`;
    return details;
  }).join('\n\n');

  const deckName = deckType === DeckType.TAROT ? 'Tarot' : 'Bài Tây (Playing Cards)';

  const birthInfoStr = [
    userInfo.gender ? `Giới tính: ${userInfo.gender}` : '',
    userInfo.birthDate ? `Ngày sinh: ${userInfo.birthDate}` : userInfo.birthYear ? `Năm sinh: ${userInfo.birthYear}` : '',
    userInfo.birthTime ? `Giờ sinh: ${userInfo.birthTime}` : '',
  ].filter(Boolean).join(' | ');

  const prompt = `
    Bạn là một chuyên gia giải bài ${deckName} chuyên nghiệp, có kiến thức sâu sắc về tâm linh, số học và chiêm tinh học.
    Hãy phân tích trải bài ${deckName} sau đây cho người dùng.
    
    Thông tin người xem:
    - Họ và tên: ${userInfo.fullName}
    - ${birthInfoStr || 'Thời điểm sinh: Không cung cấp'}
    - Nhu cầu/Câu hỏi cụ thể: "${userInfo.request || 'Không có'}"
    
    Câu hỏi của người dùng cho trải bài này: "${question}"
    Chủ đề: ${theme}
    Kiểu trải bài: ${spreadType}
    
    Các lá bài đã rút:
    ${cardsInfo}
    
    YÊU CẦU VỀ ĐỊNH DẠNG (RẤT QUAN TRỌNG):
    1. Sử dụng các icon (emoji) phù hợp để làm câu trả lời sinh động (ví dụ: ✨, 🔮, 🃏, 🌟, ❤️, 💼, 🌙, ☀️).
    2. Chia câu trả lời thành các đoạn rõ ràng, có cách dòng (xuống dòng 2 lần) để dễ đọc.
    3. Cấu trúc bài viết:
       - Lời chào cá nhân hóa gửi tới ${userInfo.fullName}.
       - Giải mã chi tiết từng lá bài (kèm icon và phân tích sâu sắc theo năng lượng chiêm tinh/ngày sinh của người hỏi).
       - Tổng kết và lời khuyên từ vũ trụ dành riêng cho tình huống này.
    4. Sử dụng ngôn ngữ huyền bí nhưng gần gũi, sâu sắc và mang tính khích lệ.
    5. Trình bày bằng Markdown để các tiêu đề và danh sách hiển thị đẹp mắt.
    6. PHẢI TRẢ LỜI BẰNG TIẾNG VIỆT.
    7. Độ dài khoảng 300-400 từ để đảm bảo sự chi tiết.
  `;

  return await dispatchAiPrompt(prompt);
};

// Follow-up question direct interpretation
export const interpretFollowUp = async (
  originalQuestion: string,
  theme: ReadingTheme,
  originalCards: DrawnCard[],
  originalInterpretation: string,
  followUpQuestion: string,
  deckType: DeckType,
  userInfo: UserInfo
): Promise<string> => {
  const cardsInfo = originalCards.map((c, i) =>
    `${i + 1}. ${c.card.name} (${c.isReversed ? 'Ngược' : 'Xuôi'})`
  ).join(', ');

  const birthInfoStr = [
    userInfo.gender ? `Giới tính: ${userInfo.gender}` : '',
    userInfo.birthDate ? `Ngày sinh: ${userInfo.birthDate}` : userInfo.birthYear ? `Năm sinh: ${userInfo.birthYear}` : '',
    userInfo.birthTime ? `Giờ sinh: ${userInfo.birthTime}` : '',
  ].filter(Boolean).join(' | ');

  const prompt = `
    Bạn là một Tarot Reader chuyên nghiệp, uyên bác và giàu lòng thấu cảm.
    Người hỏi: ${userInfo.fullName} (${birthInfoStr || 'Thời điểm sinh: Không rõ'})
    Bộ bài đang dùng: ${deckType === DeckType.TAROT ? 'Tarot' : 'Bài Tây 52 lá'}
    Chủ đề ban đầu: ${theme}
    Câu hỏi ban đầu: "${originalQuestion}"
    Các lá bài đã xuất hiện trong trải bài trước: ${cardsInfo}
    
    Tóm tắt lời giải ban đầu:
    ${originalInterpretation.substring(0, 500)}...
    
    ---
    CÂU HỎI TIẾP NỐI CỦA NGƯỜI HỎI:
    "${followUpQuestion}"
    
    YÊU CẦU PHÂN TÍCH:
    1. Trực tiếp giải đáp thắc mắc/câu hỏi tiếp nối "${followUpQuestion}" dựa trên năng lượng của những lá bài đã xuất hiện.
    2. Chỉ ra chi tiết liên kết cụ thể giữa câu hỏi này với lá bài nào trong trải bài gốc.
    3. Đưa ra lời khuyên hành động thực tế, giúp người hỏi an tâm và rõ ràng hướng đi tiếp theo.
    4. Trình bày dạng Markdown với các gạch đầu dòng rõ ràng, kèm emoji huyền bí (🔮, ✨, 🌟).
    5. Trả lời bằng tiếng Việt, súc tích, sâu sắc (khoảng 200-300 từ).
  `;

  return await dispatchAiPrompt(prompt);
};

// Follow-up question with newly drawn clarification card(s)
export const interpretFollowUpWithNewCards = async (
  originalQuestion: string,
  theme: ReadingTheme,
  originalCards: DrawnCard[],
  originalInterpretation: string,
  followUpQuestion: string,
  newCards: DrawnCard[],
  deckType: DeckType,
  userInfo: UserInfo
): Promise<string> => {
  const oldCards = originalCards.map((c) => `${c.card.name} (${c.isReversed ? 'Ngược' : 'Xuôi'})`).join(', ');
  const newCardsInfo = newCards.map((c, i) =>
    `+ Lá rút thêm ${i + 1}: ${c.card.name} (${c.isReversed ? 'Ngược' : 'Xuôi'}) - Ý nghĩa: ${c.isReversed ? c.card.meaningReversed : c.card.meaningUpright}`
  ).join('\n');

  const birthInfoStr = [
    userInfo.gender ? `Giới tính: ${userInfo.gender}` : '',
    userInfo.birthDate ? `Ngày sinh: ${userInfo.birthDate}` : userInfo.birthYear ? `Năm sinh: ${userInfo.birthYear}` : '',
    userInfo.birthTime ? `Giờ sinh: ${userInfo.birthTime}` : '',
  ].filter(Boolean).join(' | ');

  const prompt = `
    Bạn là một Tarot Reader chuyên nghiệp, uyên bác và sâu sắc.
    Người hỏi: ${userInfo.fullName} (${birthInfoStr || 'Thời điểm sinh: Không rõ'})
    Bộ bài: ${deckType === DeckType.TAROT ? 'Tarot' : 'Bài Tây 52 lá'}
    Câu hỏi ban đầu: "${originalQuestion}" (Chủ đề: ${theme})
    Các lá bài nền tảng ban đầu: ${oldCards}
    
    ---
    CÂU HỎI MỚI / THẮC MẮC TIẾP NỐI:
    "${followUpQuestion}"
    
    CÁC LÁ BÀI VỪA ĐƯỢC RÚT THÊM ĐỂ LÀM RÕ (CLARIFICATION CARDS):
    ${newCardsInfo}
    
    YÊU CẦU PHÂN TÍCH:
    1. Giải mã chi tiết năng lượng và thông điệp của (các) lá bài vừa rút thêm dành riêng cho câu hỏi "${followUpQuestion}".
    2. Phân tích sự kết hợp giữa lá bài mới này với mạch năng lượng từ các lá bài trước đó (diễn biến thuận lợi hay cần lưu tâm điều gì).
    3. Đưa ra lời khuyên vũ trụ cụ thể và hướng đi sáng tỏ cho ${userInfo.fullName}.
    4. Trình bày dạng Markdown, cấu trúc mạch lạc, dùng emoji trang nhã (🃏, 🔮, ✨).
    5. Trả lời bằng tiếng Việt, sâu sắc và truyền cảm hứng (khoảng 250-350 từ).
  `;

  return await dispatchAiPrompt(prompt);
};
