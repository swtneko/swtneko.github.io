import { GoogleGenAI } from "@google/genai";
import { DrawnCard, ReadingTheme, SpreadType, DeckType, UserInfo, AppSettings, AIProvider } from '../types';

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
  tag?: string;
}

export interface OpenRouterFreeModel {
  id: string;
  name: string;
  desc: string;
  context_length?: number;
  tag?: string;
  created?: number;
}

export const OPENROUTER_MODELS_CACHE_KEY = 'celestial-openrouter-free-models';
export const GEMINI_MODELS_CACHE_KEY = 'celestial-gemini-fetched-models';

export const DEFAULT_GEMINI_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Mô hình thế hệ mới nhất của Google - Siêu nhanh, thông minh và phản hồi mượt', tag: 'Mới nhất • Khuyên dùng' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Mô hình Pro cao cấp - Phân tích sâu sắc đa tầng quẻ bài Tarot & Tử Vi', tag: 'Pro • Chuyên sâu' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Tốc độ cực nhanh, phản hồi tức thì', tag: 'Tốc độ cao' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', desc: 'Mô hình gọn nhẹ, tiết kiệm quota', tag: 'Tiết kiệm' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Mô hình tiêu chuẩn ổn định, hoạt động mượt mà' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Mô hình suy luận chuyên sâu 1.5' },
];

export const getCachedGeminiModels = (): ModelOption[] => {
  try {
    const cached = localStorage.getItem(GEMINI_MODELS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  return DEFAULT_GEMINI_MODELS;
};

export const DEFAULT_OPENROUTER_FREE_MODELS: OpenRouterFreeModel[] = [
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free Models Router (openrouter/free)',
    desc: 'Tự động luân chuyển các mô hình miễn phí nhanh và ổn định nhất trên OpenRouter',
    context_length: 200000,
    tag: 'Khuyên dùng • Auto Router',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA: Nemotron 3.5 Lightning (free)',
    desc: 'Mô hình siêu mạnh từ NVIDIA với 1 triệu token context, phản hồi nhanh như chớp',
    context_length: 1000000,
    tag: '1M Context • Mới nhất',
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google: Gemma 4 31B (free)',
    desc: 'Mô hình nguồn mở thế hệ 4 mới nhất từ Google, năng lực lý luận và chiêm tinh vượt trội',
    context_length: 262144,
    tag: '262k Context • Google',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google: Gemma 4 26B A4B (free)',
    desc: 'Bản tinh chỉnh hiệu năng cao từ Google Gemma 4, cân bằng tốc độ và độ chính xác',
    context_length: 262144,
    tag: '262k Context • Google',
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'NVIDIA: Nemotron 3 Ultra 550B (free)',
    desc: 'Siêu mô hình 550B tham số, xử lý các tầng nghĩa phức tạp của 78 lá bài Tarot và Tử Vi',
    context_length: 1000000,
    tag: '1M Context • Ultra',
  },
  {
    id: 'thinkingmachines/inkling:free',
    name: 'Thinking Machines: Inkling (free)',
    desc: 'Mô hình tư duy chuyên sâu với ngữ cảnh 1 triệu token, diễn giải mạch lạc',
    context_length: 1048576,
    tag: '1M Context • Free',
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    name: 'Dots Studio: Dots3-Note Preview (free)',
    desc: 'Ngữ cảnh cực lớn 512k tokens, hỗ trợ phân tích trải bài chi tiết và đối chiếu quá khứ',
    context_length: 512000,
    tag: '512k Context • Free',
  },
  {
    id: 'z-ai/glm-5.2:free',
    name: 'Z.ai: GLM 5.2 (free)',
    desc: 'Mô hình ngôn ngữ thế hệ mới, văn phong mượt mà tự nhiên bằng tiếng Việt',
    context_length: 32768,
    tag: 'Free • Tiếng Việt tốt',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta: Llama 3.3 70B Instruct (free)',
    desc: 'Mô hình 70 tỷ tham số hàng đầu từ Meta, lý luận sắc bén và cấu trúc quẻ bài mạch lạc',
    context_length: 131072,
    tag: '131k Context • Meta',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek: R1 (free)',
    desc: 'Mô hình suy luận chuyên sâu mã nguồn mở, tư duy từng bước logic',
    context_length: 64000,
    tag: 'Reasoning • Free',
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'LiquidAI: LFM2.5-2.6B (free)',
    desc: 'Mô hình mạng nơ-ron dạng lỏng siêu nhẹ, phản hồi tức thì',
    context_length: 65536,
    tag: 'Siêu tốc độ',
  },
  {
    id: 'openrouter/auto',
    name: 'OpenRouter Auto Router (openrouter/auto)',
    desc: 'Tự động chọn mô hình phù hợp nhất theo thời gian thực',
    tag: 'Auto',
  },
];

export const getCachedOpenRouterFreeModels = (): OpenRouterFreeModel[] => {
  try {
    const cached = localStorage.getItem(OPENROUTER_MODELS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  return DEFAULT_OPENROUTER_FREE_MODELS;
};

// Initialize with cached models if available
const initialGeminiModels = typeof window !== 'undefined'
  ? getCachedGeminiModels()
  : DEFAULT_GEMINI_MODELS;

const initialOpenRouterModels = typeof window !== 'undefined'
  ? getCachedOpenRouterFreeModels()
  : DEFAULT_OPENROUTER_FREE_MODELS;

export const PROVIDER_MODELS: Record<AIProvider, ModelOption[]> = {
  auto: [
    { id: 'auto', name: 'Tự động thông minh', desc: 'Hệ thống tự động chọn mô hình nhanh và ổn định nhất theo tình trạng mạng', tag: 'Mặc định' }
  ],
  gemini: initialGeminiModels,
  openrouter: initialOpenRouterModels.map(m => ({
    id: m.id,
    name: m.name,
    desc: m.desc,
    tag: m.tag,
  })),
};

export const fetchOpenRouterFreeModels = async (apiKey?: string): Promise<OpenRouterFreeModel[]> => {
  const headers: Record<string, string> = {};
  const keyToUse = apiKey || getProviderKey('openrouter');
  if (keyToUse) {
    headers['Authorization'] = `Bearer ${keyToUse}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OpenRouter API trả về HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json || !Array.isArray(json.data)) {
      throw new Error('Dữ liệu từ OpenRouter không đúng định dạng');
    }

    const freeList: OpenRouterFreeModel[] = [];

    // Always keep openrouter/free at index 0
    freeList.push({
      id: 'openrouter/free',
      name: 'OpenRouter Free Models Router (openrouter/free)',
      desc: 'Tự động luân chuyển các mô hình miễn phí nhanh và ổn định nhất trên OpenRouter',
      context_length: 200000,
      tag: 'Khuyên dùng • Auto Router',
    });

    for (const m of json.data) {
      const id = String(m.id || '');
      const lowerId = id.toLowerCase();
      const pricing = m.pricing;
      const isZeroCost = pricing &&
        (parseFloat(pricing.prompt) === 0 || pricing.prompt === '0') &&
        (parseFloat(pricing.completion) === 0 || pricing.completion === '0');

      const isFree = lowerId.endsWith(':free') || lowerId.includes(':free') || isZeroCost;

      if (isFree && id !== 'openrouter/free') {
        const ctxK = m.context_length ? Math.round(m.context_length / 1000) : 0;
        const ctxLabel = ctxK >= 1000 ? `${(ctxK / 1000).toFixed(0)}M` : `${ctxK}k`;
        const rawDesc = m.description || `Mô hình ${m.name || id} hoàn toàn miễn phí trên OpenRouter (${ctxLabel} tokens context)`;
        const cleanDesc = rawDesc.length > 130 ? rawDesc.slice(0, 127) + '...' : rawDesc;

        freeList.push({
          id,
          name: m.name || id,
          desc: cleanDesc,
          context_length: m.context_length,
          tag: ctxK > 0 ? `${ctxLabel} tokens • Free` : 'Free 100%',
          created: m.created,
        });
      }
    }

    // Sort models: router first, then by context length descending
    const sorted = [
      freeList[0],
      ...freeList.slice(1).sort((a, b) => (b.context_length || 0) - (a.context_length || 0)),
    ];

    // Cache locally
    try {
      localStorage.setItem(OPENROUTER_MODELS_CACHE_KEY, JSON.stringify(sorted));
      localStorage.setItem('celestial-openrouter-free-models-updated-at', new Date().toISOString());
    } catch (e) {}

    // Update in-memory PROVIDER_MODELS
    PROVIDER_MODELS.openrouter = sorted.map(m => ({
      id: m.id,
      name: m.name,
      desc: m.desc,
      tag: m.tag,
    }));

    return sorted;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Lỗi khi fetch danh sách OpenRouter models:', err);
    throw err;
  }
};

// Helper to retrieve all active Gemini keys (split by comma, newline, semicolon, or space)
export const getGeminiKeys = (): string[] => {
  const keysSet = new Set<string>();

  // 1. Check custom keys from user settings in localStorage
  try {
    const saved = localStorage.getItem('celestial-settings');
    if (saved) {
      const parsed: AppSettings = JSON.parse(saved);
      if (parsed.customKeys?.gemini) {
        parsed.customKeys.gemini
          .split(/[\n,;\s]+/)
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
          .split(/[\n,;\s]+/)
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
        .split(/[\n,;\s]+/)
        .map(k => k.trim())
        .filter(k => k.length > 5 && k !== 'undefined' && k !== 'null' && k !== 'MY_GEMINI_API_KEY')
        .forEach(k => keysSet.add(k));
    }
  }

  return Array.from(keysSet);
};

// Helper to get key for other providers
export const getProviderKey = (provider: 'openrouter'): string => {
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
  if (provider === 'openrouter') {
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
  const openrouter = getProviderKey('openrouter');

  return {
    gemini: { configured: geminiKeys.length > 0, count: geminiKeys.length },
    openrouter: { configured: !!openrouter },
  };
};

// OpenRouter API caller
const callOpenRouterApi = async (
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
  "gemini-2.5-flash",       // Bậc 1: Flagship mới nhất, phân tích biểu tượng sâu và nhanh
  "gemini-2.5-pro",         // Bậc 2: Bậc thầy suy luận Pro đa tầng
  "gemini-2.0-flash",       // Bậc 3: Tốc độ cao
  "gemini-2.0-flash-lite",  // Bậc 4: Tiết kiệm quota
  "gemini-1.5-flash",       // Bậc 5: Ổn định
  "gemini-1.5-pro",         // Bậc 6: Pro 1.5
  "gemini-flash-latest",    // Bậc 7: Mặc định dự phòng chung
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

// Helper to convert a raw Gemini model into a rich ModelOption
export const formatGeminiModelOption = (id: string, displayName?: string, description?: string, inputLimit?: number): ModelOption => {
  const cleanId = id.replace(/^models\//, '');
  const ver = extractVersion(cleanId);
  const lower = cleanId.toLowerCase();

  let name = displayName || cleanId;
  if (!displayName) {
    if (lower.includes('2.5-flash')) name = 'Gemini 2.5 Flash';
    else if (lower.includes('2.5-pro')) name = 'Gemini 2.5 Pro';
    else if (lower.includes('2.0-flash-lite')) name = 'Gemini 2.0 Flash Lite';
    else if (lower.includes('2.0-flash')) name = 'Gemini 2.0 Flash';
    else if (lower.includes('1.5-flash')) name = 'Gemini 1.5 Flash';
    else if (lower.includes('1.5-pro')) name = 'Gemini 1.5 Pro';
    else {
      // Capitalize words nicely
      name = cleanId.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  let tag = '';
  if (ver >= 2.5 && lower.includes('flash')) tag = 'Mới nhất • Siêu nhanh';
  else if (ver >= 2.5 && lower.includes('pro')) tag = 'Mới nhất • Pro';
  else if (lower.includes('pro')) tag = 'Chuyên sâu • Pro';
  else if (lower.includes('lite')) tag = 'Tiết kiệm';
  else if (lower.includes('flash')) tag = 'Tốc độ cao';
  else if (ver >= 2.0) tag = `Gemini v${ver}`;

  let desc = description || `Mô hình AI đa năng của Google (${cleanId})`;
  if (inputLimit) {
    const limitK = Math.round(inputLimit / 1000);
    const limitLabel = limitK >= 1000 ? `${(limitK / 1000).toFixed(0)}M` : `${limitK}k`;
    desc = `${desc} - Context: ${limitLabel} tokens`;
  }

  return {
    id: cleanId,
    name,
    desc,
    tag: tag || undefined,
  };
};

// Dynamic model fetcher from Google Gemini API (Returns rich ModelOption array)
export const fetchGeminiModelOptions = async (apiKey?: string): Promise<ModelOption[]> => {
  // Extract and sanitize candidate keys
  const candidateKeys: string[] = [];
  if (apiKey) {
    apiKey.split(/[\n,;\s]+/).map(k => k.trim().replace(/^Bearer\s+/i, '').replace(/["']/g, '')).forEach(k => {
      if (k.length > 5 && k !== 'MY_GEMINI_API_KEY' && k !== 'undefined') candidateKeys.push(k);
    });
  }
  
  if (candidateKeys.length === 0) {
    getGeminiKeys().forEach(k => {
      if (k.length > 5 && k !== 'MY_GEMINI_API_KEY') candidateKeys.push(k);
    });
  }

  if (candidateKeys.length === 0) {
    throw new Error('Chưa tìm thấy Gemini API Key. Vui lòng nhập khóa API (bắt đầu bằng AIzaSy...) vào ô bên trên rồi thử lại.');
  }

  let lastError: Error | null = null;

  for (const key of candidateKeys) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        let detailedMsg = '';
        try {
          const errJson = await res.json();
          if (errJson.error?.message) {
            detailedMsg = `: ${errJson.error.message}`;
          }
        } catch {}

        if (res.status === 400) {
          throw new Error(`Google API (Mã lỗi 400 - Khóa API không hợp lệ hoặc sai cấu hình)${detailedMsg}`);
        } else if (res.status === 403) {
          throw new Error(`Google API (Mã lỗi 403 - Quyền truy cập bị từ chối)${detailedMsg}`);
        } else if (res.status === 429) {
          throw new Error(`Google API (Mã lỗi 429 - Hết hạn mức Quota)${detailedMsg}`);
        }
        throw new Error(`Google API trả về mã lỗi HTTP ${res.status}${detailedMsg}`);
      }

      const data = await res.json();
      if (Array.isArray(data.models)) {
        const options: ModelOption[] = [];
        const rawIds: string[] = [];

        for (const m of data.models) {
          const name = (m.name || '').toLowerCase();
          const methods = m.supportedGenerationMethods || [];
          const isGen = methods.includes('generateContent');
          const isGemini = name.includes('gemini');
          const isExcluded = name.includes('embedding') || name.includes('aqa') || name.includes('imagen') || name.includes('computer') || name.includes('whisper');

          if (isGemini && isGen && !isExcluded) {
            const cleanId = m.name.replace(/^models\//, '');
            rawIds.push(cleanId);
            options.push(formatGeminiModelOption(cleanId, m.displayName, m.description, m.inputTokenLimit));
          }
        }

        if (options.length > 0) {
          // Sort with newest version first
          options.sort((a, b) => {
            const verA = extractVersion(a.id);
            const verB = extractVersion(b.id);
            if (verB !== verA) return verB - verA;

            const getTierWeight = (id: string): number => {
              const lower = id.toLowerCase();
              if (lower.includes('pro')) return 4;
              if (lower.includes('flash-lite') || lower.includes('lite')) return 2;
              if (lower.includes('flash')) return 3;
              return 1;
            };
            return getTierWeight(b.id) - getTierWeight(a.id);
          });

          // Update in-memory & persistent cache
          PROVIDER_MODELS.gemini = options;
          try {
            localStorage.setItem(GEMINI_MODELS_CACHE_KEY, JSON.stringify(options));
            localStorage.setItem('celestial-gemini-models-updated-at', new Date().toISOString());
          } catch (e) {}

          const sortedIds = options.map(o => o.id);
          const cacheKey = `gemini_${key.slice(0, 8)}`;
          modelCache[cacheKey] = { models: sortedIds, timestamp: Date.now() };

          console.info(`[Auto-Fetch] Đã cập nhật ${options.length} model Google Gemini mới nhất:`, sortedIds);
          return options;
        }
      }
    } catch (e: any) {
      clearTimeout(timeout);
      lastError = e;
      // Try next key if available
      continue;
    }
  }

  if (lastError) {
    console.warn('[Auto-Fetch] Không thể fetch danh sách model Gemini trực tiếp từ API:', lastError);
    throw lastError;
  }

  return getCachedGeminiModels();
};

// Dynamic model fetcher from Google Gemini API (Returns model IDs array for generation)
export const fetchDynamicGeminiModels = async (apiKey?: string): Promise<string[]> => {
  const key = apiKey || getGeminiKeys()[0];
  if (!key) return GEMINI_DEFAULT_TIERS;

  const cacheKey = `gemini_${key.slice(0, 8)}`;
  const cached = modelCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.models;
  }

  try {
    const options = await fetchGeminiModelOptions(key);
    if (options && options.length > 0) {
      return options.map(o => o.id);
    }
  } catch (e) {
    // Graceful fallback to default tiers
  }

  return GEMINI_DEFAULT_TIERS;
};

// Gemini generation with dynamic auto-fetched descending smart model tiers + multi-key rotation
const callGeminiWithRotation = async (prompt: string, requestedModel?: string): Promise<string> => {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error("MISSING_GEMINI_KEY");
  }

  // Sanitize invalid or old model names
  let cleanRequestedModel = requestedModel;
  if (cleanRequestedModel && (cleanRequestedModel.includes('3.8') || cleanRequestedModel.includes('3.1') || cleanRequestedModel === 'undefined' || cleanRequestedModel === 'null')) {
    cleanRequestedModel = 'gemini-2.5-flash';
  }

  // Auto-fetch latest dynamic models from Google API (using first key) or fallback gracefully
  const dynamicModels = await fetchDynamicGeminiModels(keys[0]);

  // Model hierarchy: If a specific model was requested and is not 'auto', place it first, followed by descending tiers
  const models = cleanRequestedModel && cleanRequestedModel !== 'auto'
    ? [cleanRequestedModel, ...dynamicModels.filter(m => m !== cleanRequestedModel)]
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

        // If model is not found or invalid API model name, skip trying other keys for this model
        if (msg.includes('404') || msg.includes('not found') || msg.includes('not_found') || msg.includes('is not supported')) {
          break;
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
  let aiProviderPriority: AIProvider[] = ['gemini', 'openrouter'];
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

    if (provider === 'openrouter') {
      const key = getProviderKey('openrouter');
      if (!key) throw new Error("Chưa cấu hình OpenRouter API Key");
      const model = (modelToUse && modelToUse !== 'auto') ? modelToUse : 'openrouter/free';
      const res = await callOpenRouterApi(
        'https://openrouter.ai/api/v1/chat/completions',
        key,
        model,
        finalPrompt,
        {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Neko Tarot',
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
  const configuredAny = status.gemini.configured || status.openrouter.configured;

  if (!configuredAny) {
    return `### ⚠️ Chưa tìm thấy khóa API
Ứng dụng cần ít nhất một khóa API để kết nối trí tuệ nhân tạo:
1. **Google Gemini (Miễn phí):** Lấy tại [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. **OpenRouter Free:** Bạn có thể nhập tại biểu tượng **⚙️ Cài đặt** ở góc trên màn hình.`;
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

  const cungSummaryText = (cungList || []).map(c => {
    const chinh = (c.chinhTinh || []).map(s => `${s.name}${s.status ? ` (${s.status})` : ''}${s.tuHoa ? ` [${s.tuHoa}]` : ''}`).join(', ') || 'Vô chính diệu';
    const cat = (c.catTinhList || []).map(s => s.name).join(', ') || 'Không';
    const hung = (c.hungTinhList || []).map(s => s.name).join(', ') || 'Không';
    const tuanTriet = [c.isTuan ? 'Tuần' : '', c.isTriet ? 'Triệt' : ''].filter(Boolean).join('/');
    return `• CUNG ${c.cungChuc.toUpperCase()} (Địa Chi: ${c.chi}, Can: ${c.can}${c.isThan ? ' | CƯ THÂN' : ''}):
  - Chính Tinh: ${chinh}
  - Cát Tinh: ${cat}
  - Sát Tinh / Hung Tinh: ${hung}
  - Tràng Sinh: ${c.vongTrangSinh || 'N/A'} | Tuần/Triệt: ${tuanTriet || 'Không'}
  - Đại Hạn: ${c.daiHan || 0}T | Tiểu Hạn: ${c.tieuHan || 'N/A'}`;
  }).join('\n\n');

  const prompt = `
Bạn là một bậc thầy chuyên gia Tử Vi Đẩu Số truyền thống kết hợp tư duy tâm lý học hiện đại. Nhiệm vụ của bạn là tiếp nhận dữ liệu lá số Tử Vi (gồm 12 cung, các tinh hệ, vòng tràng sinh, tứ hóa, tuần triệt, thân cư, cân lượng) và yêu cầu của đương số để đưa ra bài luận giải sâu sắc, chính xác, mang tính định hướng xây dựng cao nhất.

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

=== CẤU TRÚC LÁ SỐ 12 CUNG & TINH HỆ ===
${cungSummaryText}

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
