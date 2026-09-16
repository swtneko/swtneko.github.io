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

// Ranked descending model hierarchies for automatic cascading fallback (Fallback base)
const GEMINI_DEFAULT_TIERS = [
  "gemini-3.8-flash",       // Bậc 1: Flagship mới nhất, phân tích biểu tượng sâu và nhanh
  "gemini-3.1-pro-preview", // Bậc 2: Bậc thầy suy luận Pro đa tầng
  "gemini-2.5-pro",         // Bậc 3: Pro ổn định cao cấp
  "gemini-2.5-flash",       // Bậc 4: Flash tốc độ cao cân bằng
  "gemini-3.1-flash-lite",  // Bậc 5: Flash-Lite siêu nhẹ tiết kiệm quota
  "gemini-flash-latest",    // Bậc 6: Mặc định dự phòng chung
];

const GROQ_DEFAULT_TIERS = [
  'llama-3.3-70b-versatile',
  'deepseek-r1-distill-llama-70b',
  'qwen-2.5-32b',
  'llama-3.1-8b-instant',
];

const DEEPSEEK_DEFAULT_TIERS = [
  'deepseek-chat',
  'deepseek-reasoner',
];

const OPENAI_DEFAULT_TIERS = [
  'gpt-4o',
  'gpt-4o-mini',
  'o3-mini',
];

// In-memory model discovery cache with 30-minute expiration
const modelCache: Record<string, { models: string[]; timestamp: number }> = {};
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút

// Helper to extract numeric version from model string (e.g., 'gemini-3.8-flash' -> 3.8, 'gemini-2.5-pro' -> 2.5)
const extractVersion = (modelName: string): number => {
  const match = modelName.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

// Smart model sorter: Newest version first -> Pro > Flash > Lite > Others
const sortGeminiModels = (models: string[]): string[] => {
  return [...models].sort((a, b) => {
    const verA = extractVersion(a);
    const verB = extractVersion(b);
    if (verB !== verA) return verB - verA; // Phiên bản lớn hơn (mới hơn) đứng trước

    // Cùng phiên bản: Pro ưu tiên hơn Flash, Flash ưu tiên hơn Flash-Lite
    const getTierWeight = (name: string): number => {
      const lower = name.toLowerCase();
      if (lower.includes('pro')) return 4;
      if (lower.includes('flash-lite') || lower.includes('lite')) return 2;
      if (lower.includes('flash')) return 3;
      return 1;
    };
    return getTierWeight(b) - getTierWeight(a);
  });
};

// Dynamic model fetcher from Google Gemini API
export const fetchDynamicGeminiModels = async (apiKey?: string): Promise<string[]> => {
  const key = apiKey || getGeminiKeys()[0];
  if (!key) return GEMINI_DEFAULT_TIERS;

  const cacheKey = `gemini_${key.slice(0, 8)}`;
  const cached = modelCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.models;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const fetched = data.models
          .filter((m: any) => {
            const name = (m.name || '').toLowerCase();
            const methods = m.supportedGenerationMethods || [];
            return (
              name.includes('gemini') &&
              methods.includes('generateContent') &&
              !name.includes('embedding') &&
              !name.includes('aqa') &&
              !name.includes('imagen') &&
              !name.includes('computer')
            );
          })
          .map((m: any) => m.name.replace(/^models\//, ''));

        if (fetched.length > 0) {
          const sorted = sortGeminiModels(Array.from(new Set([...fetched, ...GEMINI_DEFAULT_TIERS])));
          modelCache[cacheKey] = { models: sorted, timestamp: Date.now() };
          console.info(`[Auto-Fetch] Đã tự động cập nhật ${sorted.length} model mới nhất từ Google Gemini:`, sorted);
          return sorted;
        }
      }
    }
  } catch (e) {
    console.warn('[Auto-Fetch] Không thể fetch danh sách model Gemini tự động, sử dụng danh sách mặc định thông minh:', e);
  }

  return GEMINI_DEFAULT_TIERS;
};

// Dynamic model fetcher from Groq API
export const fetchDynamicGroqModels = async (apiKey?: string): Promise<string[]> => {
  const key = apiKey || getProviderKey('groq');
  if (!key) return GROQ_DEFAULT_TIERS;

  const cacheKey = `groq_${key.slice(0, 8)}`;
  const cached = modelCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.models;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const fetched = data.data
          .map((m: any) => m.id)
          .filter((id: string) => {
            const lower = id.toLowerCase();
            return (
              (lower.includes('llama') || lower.includes('deepseek') || lower.includes('qwen') || lower.includes('gemma') || lower.includes('mixtral')) &&
              !lower.includes('whisper') &&
              !lower.includes('guard') &&
              !lower.includes('embedding')
            );
          });

        if (fetched.length > 0) {
          const combined = Array.from(new Set([...fetched, ...GROQ_DEFAULT_TIERS]));
          modelCache[cacheKey] = { models: combined, timestamp: Date.now() };
          console.info(`[Auto-Fetch] Đã tự động cập nhật ${combined.length} model mới từ Groq:`, combined);
          return combined;
        }
      }
    }
  } catch (e) {}

  return GROQ_DEFAULT_TIERS;
};

// Dynamic model fetcher from OpenAI API
export const fetchDynamicOpenAIModels = async (apiKey?: string): Promise<string[]> => {
  const key = apiKey || getProviderKey('openai');
  if (!key) return OPENAI_DEFAULT_TIERS;

  const cacheKey = `openai_${key.slice(0, 8)}`;
  const cached = modelCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.models;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const fetched = data.data
          .map((m: any) => m.id)
          .filter((id: string) => {
            const lower = id.toLowerCase();
            return (lower.startsWith('gpt-4') || lower.startsWith('o1') || lower.startsWith('o3') || lower.startsWith('gpt-5') || lower.startsWith('chatgpt')) && !lower.includes('audio') && !lower.includes('realtime') && !lower.includes('embed');
          });

        if (fetched.length > 0) {
          const combined = Array.from(new Set([...fetched, ...OPENAI_DEFAULT_TIERS]));
          modelCache[cacheKey] = { models: combined, timestamp: Date.now() };
          return combined;
        }
      }
    }
  } catch (e) {}

  return OPENAI_DEFAULT_TIERS;
};

// Gemini generation with dynamic auto-fetched descending smart model tiers + multi-key rotation
const callGeminiWithRotation = async (prompt: string, requestedModel?: string): Promise<string> => {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error("MISSING_GEMINI_KEY");
  }

  // Auto-fetch latest dynamic models from Google API (using first key) or fallback gracefully
  const dynamicModels = await fetchDynamicGeminiModels(keys[0]);

  // Model hierarchy: If a specific model was requested and is not 'auto', place it first, followed by descending tiers
  const models = requestedModel && requestedModel !== 'auto'
    ? [requestedModel, ...dynamicModels.filter(m => m !== requestedModel)]
    : dynamicModels;

  let lastError: any = null;

  // STEP DOWN TIER BY TIER:
  // Try the best/newest model across ALL available API keys first.
  // If all keys run out of quota on that model, step down to the 2nd model and try all keys, then 3rd, etc.
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex];
    let quotaErrorCount = 0;

    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const currentKey = keys[keyIndex];
      try {
        const ai = new GoogleGenAI({ apiKey: currentKey });
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        if (response.text) {
          const rotationNote = keys.length > 1 ? ` *(Khóa ${keyIndex + 1}/${keys.length})*` : '';
          const fallbackNote = modelIndex > 0 ? ` *(Tự hạ bậc ${model})*` : '';
          return `${response.text}\n\n*✨ Diễn giải bởi Google Gemini (${model})${rotationNote}${fallbackNote}*`;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "").toLowerCase();
        console.warn(`[Gemini Fallback] Model ${model} (Key #${keyIndex + 1}/${keys.length}) gặp lỗi:`, err?.message || err);

        // If rate limited or quota exceeded, try next key
        if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted') || msg.includes('limit')) {
          quotaErrorCount++;
        }
      }
    }

    // If all keys failed on this model, loop automatically steps down to the next lower model in the hierarchy
    console.info(`[Gemini Fallback] Đã thử hết ${keys.length} key trên model [${model}] -> Tự động chuyển xuống bậc thấp hơn: [${models[modelIndex + 1] || 'Hết bậc'}]`);
  }

  throw lastError || new Error("Tất cả khóa và mô hình Gemini đều đã hết hạn mức (Quota Exceeded)");
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
      const dynamicGroq = await fetchDynamicGroqModels(key);
      const models = (modelToUse && modelToUse !== 'auto')
        ? [modelToUse, ...dynamicGroq.filter(m => m !== modelToUse)]
        : dynamicGroq;
      let lastErr: any = null;
      for (const m of models) {
        try {
          const res = await callOpenAICompatible(
            'https://api.groq.com/openai/v1/chat/completions',
            key,
            m,
            finalPrompt
          );
          return `${res}\n\n*⚡ Diễn giải bởi Groq (${m})*`;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[Groq Fallback] Model ${m} gặp lỗi:`, err?.message || err);
        }
      }
      throw lastErr || new Error("Tất cả mô hình Groq đều không phản hồi");
    }

    if (provider === 'deepseek') {
      const key = getProviderKey('deepseek');
      if (!key) throw new Error("Chưa cấu hình DeepSeek API Key");
      const models = (modelToUse && modelToUse !== 'auto')
        ? [modelToUse, ...DEEPSEEK_DEFAULT_TIERS.filter(m => m !== modelToUse)]
        : DEEPSEEK_DEFAULT_TIERS;
      let lastErr: any = null;
      for (const m of models) {
        try {
          const res = await callOpenAICompatible(
            'https://api.deepseek.com/chat/completions',
            key,
            m,
            finalPrompt
          );
          return `${res}\n\n*✨ Diễn giải bởi DeepSeek (${m})*`;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[DeepSeek Fallback] Model ${m} gặp lỗi:`, err?.message || err);
        }
      }
      throw lastErr || new Error("Tất cả mô hình DeepSeek đều không phản hồi");
    }

    if (provider === 'openai') {
      const key = getProviderKey('openai');
      if (!key) throw new Error("Chưa cấu hình OpenAI API Key");
      const dynamicOpenAI = await fetchDynamicOpenAIModels(key);
      const models = (modelToUse && modelToUse !== 'auto')
        ? [modelToUse, ...dynamicOpenAI.filter(m => m !== modelToUse)]
        : dynamicOpenAI;
      let lastErr: any = null;
      for (const m of models) {
        try {
          const res = await callOpenAICompatible(
            'https://api.openai.com/v1/chat/completions',
            key,
            m,
            finalPrompt
          );
          return `${res}\n\n*🌟 Diễn giải bởi OpenAI (${m})*`;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[OpenAI Fallback] Model ${m} gặp lỗi:`, err?.message || err);
        }
      }
      throw lastErr || new Error("Tất cả mô hình OpenAI đều không phản hồi");
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

// Tử Vi Đẩu Số Master interpretation
export const interpretTuViReading = async (
  laSoData: import('../types').LaSoTuViData,
  customQuestion?: string
): Promise<string> => {
  const { chuSo, cungList } = laSoData;
  const jsonString = JSON.stringify(laSoData, null, 2);

  const prompt = `
Bạn là một bậc thầy chuyên gia Tử Vi Đẩu Số truyền thống kết hợp tư duy tâm lý học hiện đại. Nhiệm vụ của bạn là tiếp nhận dữ liệu JSON lá số Tử Vi (gồm 12 cung, các tinh hệ, vòng tràng sinh, tứ hóa, tuần triệt, thân cư, cân lượng) và yêu cầu của đương số để đưa ra bài luận giải sâu sắc, chính xác, mang tính định hướng xây dựng cao nhất.

=== THÔNG TIN ĐƯƠNG SỐ & LÁ SỐ TỬ VI ===
- Đương số: ${chuSo.fullName} (${chuSo.gender}, ${chuSo.amDuongNamNu})
- Dương lịch: ${chuSo.solarDate} | Âm lịch: ${chuSo.lunarDateStr} (Tiết khí: ${chuSo.tietKhi || 'Bình thường'})
- Nơi sinh: ${chuSo.noiSinh || 'Việt Nam'}
- Can Chi: Năm ${chuSo.yearCanChi} - Tháng ${chuSo.monthCanChi} - Ngày ${chuSo.dayCanChi} - Giờ ${chuSo.hourCanChi} (${chuSo.canhGio}, ${chuSo.canhGioTime})
- Giờ sinh nhập: ${chuSo.birthTimeStr || chuSo.canhGioTime}
- Bản Mệnh: ${chuSo.banMenhNapAm} (Hành ${chuSo.banMenhElement}) | Cục: ${chuSo.cuc} (Số ${chuSo.cucNumber})
- Tương quan Mệnh - Cục: ${chuSo.tuongQuanMenhCuc}
- Chủ Mệnh: ${chuSo.chuMenh || 'Tham lang'} | Chủ Thân: ${chuSo.chuThan || 'Hỏa tinh'}
- Thân Cư: ${chuSo.thanCu || 'Quan lộc'} | Cung Lai Nhân: ${chuSo.cungLaiNhan || 'Cung Mệnh'}
- Cân Xương Tính Số: ${chuSo.canLuongChi || 'Đang tính'}
- Tuần Không tại: ${chuSo.tuanKhong?.join(', ') || 'Không'} | Triệt Không tại: ${chuSo.trietKhong?.join(', ') || 'Không'}
- Năm xem hạn: Năm ${chuSo.viewingYear} (${chuSo.viewingYearCanChi})
- Các nội dung trọng tâm muốn xem: ${chuSo.selectedTopics?.join(', ') || chuSo.selectedFocus || 'Tổng quan vận mệnh'}
${customQuestion ? `- Câu hỏi / Thắc mắc cụ thể của đương số: "${customQuestion}"` : '- Câu hỏi cụ thể: Không có câu hỏi riêng, yêu cầu luận giải toàn diện theo các nội dung đã chọn.'}

=== DỮ LIỆU CẤU TRÚC JSON LÁ SỐ (12 CUNG & TINH HỆ) ===
\`\`\`json
${jsonString}
\`\`\`

=== NGUYÊN TẮC LUẬN GIẢI QUAN TRỌNG ===
1. Tính logic và thuật toán:
- Luôn bám sát tương quan ngũ hành giữa Cục và Bản Mệnh (sinh, khắc, hòa).
- Đánh giá đắc/hãm của các Chính tinh tọa thủ, tam phương tứ chính hội chiếu.
- Đánh giá ảnh hưởng của Tuần / Triệt đến các cung và sao tọa thủ (đặc biệt nếu đóng tại Mệnh, Thân, Tài, Quan, Di).
- Chú ý vị trí của Tứ Hóa (**Hóa Lộc**, **Hóa Quyền**, **Hóa Khoa**, **Hóa Kỵ**) và sự giao thoa của Cát tinh / Sát tinh (**Kình Dương**, **Đà La**, **Hỏa Tinh**, **Linh Tinh**, **Địa Không**, **Địa Kiếp**).
- Vòng Tràng Sinh (Tràng Sinh, Đế Vượng, Tử, Tuyệt...) ảnh hưởng tới thế vượng suy của cung.
- Đánh giá Thân Cư (${chuSo.thanCu}) và các chủ đề đương số yêu cầu: ${chuSo.selectedTopics?.join(', ') || 'Toàn diện'}.

2. CẤU TRÚC BÀI LUẬN GIẢI BẮT BUỘC (Trình bày đúng 5 phần):
### **Phần 1: Tổng quan Bản Mệnh & Cục**
- Đánh giá tính cách cốt lõi, tư chất thiên bẩm, Cân lượng chỉ, Chủ Mệnh / Chủ Thân, Thân Cư và ưu thế tự nhiên.
- Bám sát tương quan ngũ hành giữa Cục (${chuSo.cuc}) và Bản Mệnh (${chuSo.banMenhNapAm}) để phân tích môi trường sống, cơ duyên và độ thuận lợi của đương số trên đường đời.

### **Phần 2: Luận giải 3 cung then chốt & Các nội dung đương số yêu cầu**
- Luận giải **Cung Mệnh** - **Cung Quan Lộc** - **Cung Tài Bạch** - **Cung Phu Thê** và các cung liên quan trực tiếp đến chủ đề đã chọn (${chuSo.selectedTopics?.join(', ') || 'Tổng quan'}).
- Chỉ rõ chính tinh đắc hãm, tam hợp hội chiếu và các phụ tinh cát/hung, ảnh hưởng của Tuần/Triệt.

### **Phần 3: Vận hạn năm hiện tại (Lưu niên năm ${chuSo.viewingYear} - ${chuSo.viewingYearCanChi}) & Tiểu vận**
- Phân tích vị trí Cung Tiểu Hạn năm ${chuSo.viewingYear} (${chuSo.viewingYearCanChi}), các sao Lưu Niên (L.Thái Tuế, L.Kình Dương, L.Đà La, L.Tang Môn...).
- Cơ hội bứt phá, những biến động cần lưu tâm trong năm. Các tháng âm lịch cần đề phòng rủi ro hoặc nắm bắt thời cơ.

### **Phần 4: Trả lời trực diện câu hỏi của đương số**
- Dựa vào cấu trúc lá số và các cung chức liên quan để trả lời trực tiếp câu hỏi: "${customQuestion || 'Định hướng phát triển bản thân và nắm bắt vận hội'}".
- Đưa ra lời khuyên hành động thực tế, lộ trình rõ ràng, dứt khoát; tuyệt đối không trả lời mập mờ, nước đôi hay chung chung.

### **Phần 5: Lời khuyên hành thiện & Tu tâm**
- Nhấn mạnh nguyên lý kinh điển **"Đức năng thắng số"**.
- Chỉ ra cách chuyển hóa vận hạn, hóa hung vi cát bằng lối sống, tư duy tích cực và hành động thiện lành cụ thể.

=== VĂN PHONG & GIỚI HẠN ===
- Hành văn trang nhã, uyên bác, giàu chiều sâu triết lý phương Đông, không gieo rắc nỗi sợ hãi hoặc mê tín dị đoan.
- Trình bày dạng Markdown với tiêu đề rõ ràng, gạch đầu dòng mạch lạc, in đậm các thuật ngữ sao quan trọng.
`;

  return await dispatchAiPrompt(prompt);
};

// Follow-up consultation for Tử Vi
export const interpretTuViFollowUp = async (
  laSoData: import('../types').LaSoTuViData,
  originalInterpretation: string,
  followUpQuestion: string
): Promise<string> => {
  const { chuSo } = laSoData;

  const prompt = `
Bạn là một Bậc Thầy Tử Vi Đẩu Số thông thái và giàu lòng trắc ẩn.
Đương số: ${chuSo.fullName} (${chuSo.amDuongNamNu}, sinh năm ${chuSo.yearCanChi} - Mệnh ${chuSo.banMenhNapAm}, Cục ${chuSo.cuc}).

Tóm tắt bài giải lá số trước đó:
${originalInterpretation.substring(0, 400)}...

---
CÂU HỎI / THẮC MẮC TIẾP THEO CỦA ĐƯƠNG SỐ:
"${followUpQuestion}"

YÊU CẦU LUẬN GIẢI:
1. Trực tiếp giải đáp thắc mắc "${followUpQuestion}" căn cứ vào quy luật sao Tử Vi, Cung chức liên quan và tương tác ngũ hành.
2. Đưa ra hướng giải quyết thực tế, thời điểm phù hợp để tiến hành hoặc phương pháp phòng tránh rủi ro.
3. Giọng văn từ tốn, thông tuệ, mang tính khích lệ và an lòng.
4. Trình bày Markdown gọn gàng, súc tích (khoảng 250-350 từ).
`;

  return await dispatchAiPrompt(prompt);
};
