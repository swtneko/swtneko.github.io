import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  X,
  Key,
  Sliders,
  Bell,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Sparkles,
  Users,
  Database,
  Lock,
  RefreshCw,
  Info,
  Layers,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProviderStatus, fetchOpenRouterFreeModels, getCachedOpenRouterFreeModels, OpenRouterFreeModel, fetchGeminiModelOptions, getCachedGeminiModels, ModelOption } from '../services/geminiService';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { AIProvider, DeckType, TarotDeckStyle } from '../types';
import { LiquidGlassCard } from './LiquidGlassCard';

export const AdminModal: React.FC = () => {
  const {
    isAdmin,
    isAdminModalOpen,
    closeAdminModal,
    openAuthModal,
    currentUser,
    systemSettings,
    updateSystemSettings,
    activateAdminByPasskey,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'ai' | 'features' | 'vercel' | 'admins'>('ai');
  const [copiedKey, setCopiedKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth unlock state
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

  // Form states for System Settings
  const [geminiKey, setGeminiKey] = useState(systemSettings.systemApiKeys?.gemini || '');
  const [openrouterKey, setOpenrouterKey] = useState(systemSettings.systemApiKeys?.openrouter || '');
  const [globalProvider, setGlobalProvider] = useState<AIProvider>(systemSettings.globalAiProvider || 'openrouter');
  const [globalModel, setGlobalModel] = useState<string>(systemSettings.globalAiModel || 'openrouter/free');
  const [systemPrompt, setSystemPrompt] = useState(systemSettings.customSystemPrompt || '');

  // OpenRouter Free Models state
  const [openrouterFreeModels, setOpenrouterFreeModels] = useState<OpenRouterFreeModel[]>(() => getCachedOpenRouterFreeModels());
  const [isFetchingOpenRouter, setIsFetchingOpenRouter] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);

  // Gemini Dynamic Models state
  const [geminiModels, setGeminiModels] = useState<ModelOption[]>(() => getCachedGeminiModels());
  const [isFetchingGemini, setIsFetchingGemini] = useState(false);
  const [geminiFetchMsg, setGeminiFetchMsg] = useState<string | null>(null);

  const handleFetchOpenRouter = async () => {
    setIsFetchingOpenRouter(true);
    setFetchMsg(null);
    try {
      const models = await fetchOpenRouterFreeModels(openrouterKey.trim());
      setOpenrouterFreeModels(models);
      setFetchMsg(`Đã cập nhật ${models.length} model Free từ OpenRouter!`);
      setTimeout(() => setFetchMsg(null), 4000);
    } catch (err: any) {
      setFetchMsg('Không thể tải từ OpenRouter. Vui lòng thử lại sau.');
      setTimeout(() => setFetchMsg(null), 4000);
    } finally {
      setIsFetchingOpenRouter(false);
    }
  };

  const handleFetchGemini = async () => {
    setIsFetchingGemini(true);
    setGeminiFetchMsg(null);
    try {
      const trimmed = geminiKey.trim();
      if (!trimmed) {
        setGeminiFetchMsg('Vui lòng nhập Gemini API Key vào ô cấu hình ở trên trước khi quét.');
        setTimeout(() => setGeminiFetchMsg(null), 4000);
        return;
      }
      const models = await fetchGeminiModelOptions(trimmed);
      setGeminiModels(models);
      setGeminiFetchMsg(`Đã tự động fetch và cập nhật ${models.length} model mới nhất từ Google Gemini!`);
      setTimeout(() => setGeminiFetchMsg(null), 4000);
    } catch (err: any) {
      setGeminiFetchMsg(err?.message || 'Không thể kết nối đến Google API. Kiểm tra lại API key.');
      setTimeout(() => setGeminiFetchMsg(null), 5000);
    } finally {
      setIsFetchingGemini(false);
    }
  };

  const [announcement, setAnnouncement] = useState(systemSettings.announcement || '');
  const [announcementActive, setAnnouncementActive] = useState(systemSettings.announcementActive || false);
  const [enableGuestReadings, setEnableGuestReadings] = useState(systemSettings.enableGuestReadings ?? true);
  const [enableClarificationCards, setEnableClarificationCards] = useState(systemSettings.enableClarificationCards ?? true);
  const [enableCosmicEffects, setEnableCosmicEffects] = useState(systemSettings.enableCosmicEffects ?? true);
  const [maxGuestReadings, setMaxGuestReadings] = useState(systemSettings.maxGuestReadingsPerDay ?? 15);

  const [enabledAiProviders, setEnabledAiProviders] = useState<Partial<Record<AIProvider, boolean>>>(
    systemSettings.enabledAiProviders || {
      auto: true,
      gemini: true,
      openrouter: true,
    }
  );

  const [enabledDeckTypes, setEnabledDeckTypes] = useState<Partial<Record<DeckType, boolean>>>(
    systemSettings.enabledDeckTypes || {
      [DeckType.TAROT]: true,
      [DeckType.PLAYING_CARDS]: true,
    }
  );

  const [enabledTarotStyles, setEnabledTarotStyles] = useState<Partial<Record<TarotDeckStyle, boolean>>>(
    systemSettings.enabledTarotStyles || {
      'rider-waite': true,
      'marseille': true,
      'sola-busca': true,
    }
  );

  // Sync state when systemSettings updates from cloud
  useEffect(() => {
    setGeminiKey(systemSettings.systemApiKeys?.gemini || '');
    setOpenrouterKey(systemSettings.systemApiKeys?.openrouter || '');
    setGlobalProvider(systemSettings.globalAiProvider || 'openrouter');
    setGlobalModel(systemSettings.globalAiModel || 'openrouter/free');
    setSystemPrompt(systemSettings.customSystemPrompt || '');
    setAnnouncement(systemSettings.announcement || '');
    setAnnouncementActive(systemSettings.announcementActive || false);
    setEnableGuestReadings(systemSettings.enableGuestReadings ?? true);
    setEnableClarificationCards(systemSettings.enableClarificationCards ?? true);
    setEnableCosmicEffects(systemSettings.enableCosmicEffects ?? true);
    setMaxGuestReadings(systemSettings.maxGuestReadingsPerDay ?? 15);
    setEnabledAiProviders(
      systemSettings.enabledAiProviders || {
        auto: true,
        gemini: true,
        openrouter: true,
      }
    );
    setEnabledDeckTypes(
      systemSettings.enabledDeckTypes || {
        [DeckType.TAROT]: true,
        [DeckType.PLAYING_CARDS]: true,
      }
    );
    setEnabledTarotStyles(
      systemSettings.enabledTarotStyles || {
        'rider-waite': true,
        'marseille': true,
        'sola-busca': true,
      }
    );
  }, [systemSettings]);

  if (!isAdminModalOpen) return null;

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSystemSettings({
        systemApiKeys: {
          gemini: geminiKey.trim(),
          openrouter: openrouterKey.trim(),
        },
        globalAiProvider: globalProvider,
        globalAiModel: globalModel,
        customSystemPrompt: systemPrompt.trim(),
        enabledAiProviders,
        enabledDeckTypes,
        enabledTarotStyles,
        announcement: announcement.trim(),
        announcementActive,
        enableGuestReadings,
        enableClarificationCards,
        enableCosmicEffects,
        maxGuestReadingsPerDay: Number(maxGuestReadings),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save admin settings', e);
    } finally {
      setIsSaving(false);
    }
  };

  const vercelEnvSnippet = `VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_DATABASE_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`;

  const copyVercelEnvs = () => {
    navigator.clipboard.writeText(vercelEnvSnippet);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-[2px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md my-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        >
          <LiquidGlassCard
            className="w-full p-6 sm:p-7"
            contentClassName="text-gray-100"
          >
            <button
              onClick={closeAdminModal}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-30"
            >
              <X className="w-5 h-5" />
            </button>

          <div className="text-center space-y-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-600/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-white">Xác Thực Quyền Quản Trị</h3>
              <p className="text-xs text-gray-400 mt-1">
                Khu vực quản trị chỉ dành riêng cho Quản Trị Viên (nekyohotaru). Vui lòng đăng nhập tài khoản hoặc nhập mã bí mật để tiếp tục.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={() => {
                closeAdminModal();
                openAuthModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-purple-600/20"
            >
              <Users className="w-4 h-4" />
              <span>Đăng nhập Google (nekyohotaru@gmail.com)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#11111d] px-3 text-[11px] text-gray-500 uppercase font-mono">hoặc mã quản trị</span>
              <div className="border-t border-white/10 w-full" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const success = activateAdminByPasskey(passkeyInput);
                if (!success) {
                  setPasskeyError('Mã quản trị không hợp lệ. Vui lòng kiểm tra lại.');
                } else {
                  setPasskeyError('');
                }
              }}
              className="space-y-3"
            >
              <div>
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Nhập mã quản trị (Passkey)..."
                  className="w-full text-xs p-3 rounded-xl border border-white/10 bg-black/50 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                {passkeyError && (
                  <p className="text-red-400 text-[11px] mt-1.5 font-medium">{passkeyError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mở Khóa Bảng Điều Khiển</span>
              </button>
            </form>
          </div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl h-full max-h-[90vh] my-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl z-50"
      >
        <LiquidGlassCard
          className="w-full h-full flex flex-col max-h-[90vh]"
          contentClassName="text-gray-100 flex flex-col h-full max-h-full"
        >
          {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-[#18152e] to-purple-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Trung Tâm Quản Trị Hệ Thống
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Quản lý các khóa API, tính năng ứng dụng & hướng dẫn cấu hình Vercel
              </p>
            </div>
          </div>

          <button
            onClick={closeAdminModal}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/30 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Quản Lý API & Trí Tuệ Nhân Tạo</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chức Năng & Thông Báo Web</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Triển Khai Vercel & Firebase (Miễn Phí)</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'admins'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tài Khoản Quản Trị</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-300">
          {/* TAB 1: AI & API KEYS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-4 flex items-start space-x-3">
                <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-200/90 leading-relaxed">
                  Các khóa API được thiết lập ở đây sẽ được lưu trữ đồng bộ vào hệ thống. Mọi người dùng truy cập vào trang web của bạn đều có thể tận hưởng trải bài Tarot AI mà không bắt buộc phải tự cấu hình API cá nhân.
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Nhà cung cấp AI mặc định toàn trang
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'auto', label: 'Tự động', sub: 'Xoay tua key & fallback khi lỗi' },
                    { id: 'gemini', label: 'Google Gemini', sub: 'Gemini 2.5 Flash / Pro' },
                    { id: 'openrouter', label: 'OpenRouter Free (Mặc định)', sub: 'openrouter/free (Router AI miễn phí 100%)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setGlobalProvider(p.id as AIProvider)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        globalProvider === p.id
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-xs">{p.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Gemini Model Selection (Dynamic & Latest-First) */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-xs text-white">Mô hình Google Gemini (Tự Động Quét & Ưu Tiên Mới Nhất)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchGemini}
                    disabled={isFetchingGemini}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingGemini ? 'animate-spin' : ''}`} />
                    <span>{isFetchingGemini ? 'Đang quét Google API...' : 'Quét Model Mới từ Google'}</span>
                  </button>
                </div>

                {geminiFetchMsg && (
                  <div className="text-[11px] text-blue-300 font-medium animate-pulse">
                    {geminiFetchMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <select
                    value={globalProvider === 'gemini' ? globalModel : 'auto'}
                    onChange={(e) => {
                      if (globalProvider === 'gemini') {
                        setGlobalModel(e.target.value);
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="auto">✨ Tự động ưu tiên bản mới nhất (Latest-First: 2.5 Flash / Pro)</option>
                    {geminiModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tag || 'Google AI'})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Mô hình mặc định: <strong className="text-blue-300 font-mono">Gemini 2.5 Flash / Pro</strong></span>
                    <span>{geminiModels.length} mô hình Google</span>
                  </div>
                </div>
              </div>

              {/* OpenRouter Model Selection (Dynamic Free Models) */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-xs text-white">Mô hình OpenRouter Free Cho Toàn Bộ Người Dùng</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchOpenRouter}
                    disabled={isFetchingOpenRouter}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingOpenRouter ? 'animate-spin' : ''}`} />
                    <span>{isFetchingOpenRouter ? 'Đang fetch...' : 'Fetch Model Free Mới Nhất'}</span>
                  </button>
                </div>

                {fetchMsg && (
                  <div className="text-[11px] text-emerald-400 font-medium animate-pulse">
                    {fetchMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <select
                    value={globalModel}
                    onChange={(e) => setGlobalModel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    {openrouterFreeModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tag || 'Free'})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Đang chọn: <strong className="text-purple-300 font-mono">{globalModel || 'openrouter/free'}</strong></span>
                    <span>{openrouterFreeModels.length} mô hình free khả dụng</span>
                  </div>
                </div>
              </div>

              {/* Bật / Tắt Nhà Cung Cấp AI Khả Dụng */}
              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-xs text-white">Bật / Tắt Nhà Cung Cấp AI Khả Dụng</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'auto' as AIProvider, label: 'Tự động' },
                    { id: 'gemini' as AIProvider, label: 'Gemini' },
                    { id: 'openrouter' as AIProvider, label: 'OpenRouter' },
                  ].map((p) => {
                    const isEnabled = enabledAiProviders[p.id] ?? true;
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isEnabled ? 'bg-purple-950/30 border-purple-500/40 text-white' : 'bg-black/30 border-white/5 text-gray-500'
                        }`}
                      >
                        <span className="text-xs font-medium">{p.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              setEnabledAiProviders((prev) => ({
                                ...prev,
                                [p.id]: e.target.checked,
                              }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API Keys Inputs */}
              <div className="space-y-4 pt-2">
                {/* Gemini */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                      Google Gemini API Key(s):
                    </span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center text-[11px]"
                    >
                      Lấy key miễn phí <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy... (Hỗ trợ nhập nhiều key cách nhau bằng dấu phẩy để xoay tua)"
                    className="w-full text-xs p-3 rounded-xl border border-white/10 bg-black/40 focus:outline-none focus:border-purple-500 font-mono text-white"
                  />
                  <p className="text-[10px] text-gray-400">
                    Mẹo: Bạn có thể dán 2-3 keys cách nhau bằng dấu phẩy để phòng khi một key bị hết hạn mức (rate limit).
                  </p>
                </div>

                {/* OpenRouter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center">
                      <Cpu className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                      OpenRouter API Key (Router Free):
                    </span>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://openrouter.ai/openrouter/free"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 hover:underline flex items-center text-[11px]"
                      >
                        Router Free <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline flex items-center text-[11px]"
                      >
                        Lấy key <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full text-xs p-3 rounded-xl border border-white/10 bg-black/40 focus:outline-none focus:border-purple-500 font-mono text-white"
                  />
                  <p className="text-[10px] text-purple-300/80">
                    ✨ Tự động kết nối qua <strong>openrouter/free</strong> miễn phí mà không cần chọn riêng từng model.
                  </p>
                </div>

                {/* Custom System Prompt */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-white block">
                    Lời chỉ dẫn AI (Custom System Prompt) - Tùy chọn:
                  </label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Ví dụ: Diễn giải bài với giọng văn trầm ấm, thấu hiểu, đưa ra các lời khuyên thực tế và tích cực..."
                    className="w-full text-xs p-3 rounded-xl border border-white/10 bg-black/40 focus:outline-none focus:border-purple-500 text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEB FEATURES & ANNOUNCEMENTS */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Banner Announcement */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs text-white">
                      Thanh thông báo nổi bật (Cosmic Announcement)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Nhập thông điệp hiển thị ở đầu trang web..."
                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-black/40 focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guest Readings */}
                <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  enableGuestReadings 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                }`}>
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">
                        {enableGuestReadings ? 'Cho phép khách đọc bài' : '🔒 Bắt buộc đăng nhập mới được xem'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enableGuestReadings 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {enableGuestReadings ? '🟢 Tự do' : '🔒 Khóa khách'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 leading-tight">
                      {enableGuestReadings 
                        ? 'Khách vãng lai không cần đăng nhập vẫn trải bài và xem giải mã được'
                        : 'Bắt buộc khách phải đăng nhập tài khoản Google/Email mới được bấm xem bài'}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableGuestReadings}
                      onChange={(e) => setEnableGuestReadings(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Clarification Cards */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">Rút lá bài làm rõ</div>
                    <div className="text-[11px] text-gray-400">Cho phép người dùng rút thêm lá bài khi hỏi sâu</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableClarificationCards}
                      onChange={(e) => setEnableClarificationCards(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Cosmic Effects */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">Hiệu ứng vũ trụ & âm thanh</div>
                    <div className="text-[11px] text-gray-400">Bụi sao lấp lánh và âm thanh huyền bí mặc định</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableCosmicEffects}
                      onChange={(e) => setEnableCosmicEffects(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Guest limit */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">Giới hạn trải bài khách / ngày</div>
                    <div className="text-[11px] text-gray-400">Tránh spam API từ khách vãng lai</div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxGuestReadings}
                    onChange={(e) => setMaxGuestReadings(Number(e.target.value))}
                    className="w-16 text-center text-xs p-1.5 rounded-lg border border-white/10 bg-black/40 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Quản lý Bật / Tắt Bộ Bài */}
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 space-y-3 sm:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-xs text-white">Bật / Tắt Bộ Bài (Decks Control)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      (enabledDeckTypes[DeckType.TAROT] ?? true) ? 'bg-purple-950/30 border-purple-500/40 text-white' : 'bg-black/30 border-white/5 text-gray-500'
                    }`}>
                      <div>
                        <div className="text-xs font-medium">Bói Bài Tarot (78 Lá)</div>
                        <div className="text-[10px] opacity-70">Trải bài Tarot 1 lá, 3 lá, Celtic Cross</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2 shrink-0">
                        <input
                          type="checkbox"
                          checked={enabledDeckTypes[DeckType.TAROT] ?? true}
                          onChange={(e) => {
                            setEnabledDeckTypes((prev) => ({
                              ...prev,
                              [DeckType.TAROT]: e.target.checked,
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      (enabledDeckTypes[DeckType.PLAYING_CARDS] ?? true) ? 'bg-purple-950/30 border-purple-500/40 text-white' : 'bg-black/30 border-white/5 text-gray-500'
                    }`}>
                      <div>
                        <div className="text-xs font-medium">Bói Bài Tây (52 Lá)</div>
                        <div className="text-[10px] opacity-70">Luận giải Cơ - Rô - Chuồn - Bích</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2 shrink-0">
                        <input
                          type="checkbox"
                          checked={enabledDeckTypes[DeckType.PLAYING_CARDS] ?? true}
                          onChange={(e) => {
                            setEnabledDeckTypes((prev) => ({
                              ...prev,
                              [DeckType.PLAYING_CARDS]: e.target.checked,
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quản lý Phong Cách Artwork Tarot */}
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 space-y-3 sm:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-xs text-white">Bật / Tắt Phong Cách Artwork Tarot (Styles Control)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'rider-waite' as TarotDeckStyle, name: 'Rider-Waite 1909', source: '78 lá chuẩn hóa' },
                      { id: 'marseille' as TarotDeckStyle, name: 'Marseille', source: 'Thế kỷ 18' },
                      { id: 'sola-busca' as TarotDeckStyle, name: 'Sola Busca (1491)', source: 'Cổ nhất thế giới' },
                    ].map((deck) => {
                      const isStyleEnabled = enabledTarotStyles[deck.id] ?? true;
                      return (
                        <div
                          key={deck.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isStyleEnabled ? 'bg-purple-950/30 border-purple-500/40 text-white' : 'bg-black/30 border-white/5 text-gray-500'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-medium">{deck.name}</div>
                            <div className="text-[10px] opacity-70">{deck.source}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-2 shrink-0">
                            <input
                              type="checkbox"
                              checked={isStyleEnabled}
                              onChange={(e) => {
                                setEnabledTarotStyles((prev) => ({
                                  ...prev,
                                  [deck.id]: e.target.checked,
                                }));
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL DEPLOYMENT & FIREBASE FREE EXPLANATION */}
          {activeTab === 'vercel' && (
            <div className="space-y-5">
              {/* Question 1: Is Firebase Free? */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
                  <Database className="w-4 h-4" />
                  <span>Giải đáp: Firebase có miễn phí khi deploy lên Vercel không?</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  <strong>HOÀN TOÀN MIỄN PHÍ 100%!</strong> Firebase cung cấp gói vĩnh viễn <strong>Spark Plan</strong> (Free):
                </p>
                <ul className="text-[11px] text-emerald-300/80 space-y-1 list-disc list-inside">
                  <li><strong>Firebase Auth:</strong> Miễn phí không giới hạn đăng nhập bằng Google, Email/Password.</li>
                  <li><strong>Cloud Firestore:</strong> Miễn phí 50,000 lượt đọc và 20,000 lượt ghi mỗi ngày.</li>
                  <li><strong>Lưu trữ dữ liệu:</strong> 1 GiB lưu trữ cloud miễn phí (đủ lưu hàng triệu lần trải bài).</li>
                </ul>
              </div>

              {/* Question 2: Does Database change when deploying to Vercel? */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs">
                  <Cloud className="w-4 h-4" />
                  <span>Database có thay đổi gì khi deploy lên Vercel không?</span>
                </div>
                <p className="text-xs text-blue-200/90 leading-relaxed">
                  <strong>KHÔNG THAY ĐỔI GÌ CẢ!</strong> Vercel chỉ đóng vai trò là máy chủ phân phối giao diện web (Frontend Hosting). Toàn bộ tài khoản người dùng, lịch sử trải bài và câu hỏi thêm đều tiếp tục được lưu trực tiếp trên Google Firebase Cloud Database mà không bị mất đi.
                </p>
              </div>

              {/* Step by step guide to setup Vercel */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-300 font-semibold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Các bước cài đặt khi deploy trên Vercel:</span>
                  </div>
                  <button
                    onClick={copyVercelEnvs}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition-colors"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Đã sao chép!' : 'Sao chép biến môi trường'}</span>
                  </button>
                </div>

                <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Đăng nhập vào <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">Vercel.com</a> và Import repository dự án của bạn.
                  </li>
                  <li>
                    Tại mục <strong>Environment Variables</strong> trong cài đặt dự án Vercel, dán các biến sau:
                  </li>
                </ol>

                <div className="relative">
                  <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-purple-200 overflow-x-auto">
                    {vercelEnvSnippet}
                  </pre>
                </div>

                <div className="pt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <strong>⚠️ Lưu ý quan trọng về Google Login:</strong> Sau khi Vercel cấp cho bạn tên miền (ví dụ: <code>nekotarot.vercel.app</code>), bạn chỉ cần vào <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-semibold">Firebase Console</a> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong> và thêm tên miền Vercel của bạn vào danh sách để đăng nhập Google hoạt động chuẩn xác!
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN ACCOUNTS */}
          {activeTab === 'admins' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-semibold text-white flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" />
                  Danh sách Quản Trị Viên (Super Admins)
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-white flex items-center">
                        nekyohotaru@gmail.com
                        <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                          Chủ sở hữu (Owner)
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Toàn quyền truy cập bảng điều khiển quản trị và cấu hình hệ thống
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 pt-2 border-t border-white/5">
                  Tài khoản hiện tại của bạn:{' '}
                  <span className="text-white font-mono">
                    {currentUser?.email || (currentUser?.isAnonymous ? 'Khách (Đã mở khóa Admin)' : 'Chưa đăng nhập')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {saveSuccess && (
              <span className="text-emerald-400 flex items-center font-medium animate-fade-in">
                <Check className="w-4 h-4 mr-1.5" />
                Đã lưu cài đặt hệ thống thành công!
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={closeAdminModal}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu Cài Đặt Hệ Thống'
              )}
            </button>
          </div>
        </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};
