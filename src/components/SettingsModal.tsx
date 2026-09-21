import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Moon, Sun, Zap, ZapOff, Volume2, VolumeX, Cpu, Key, ChevronDown, ChevronUp, Check, ExternalLink, ShieldCheck, Lock, Layers, BookOpen, RefreshCw, Loader2, Gauge } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { AIProvider, CustomApiKeys, TarotDeckStyle } from '../types';
import { getProviderStatus, PROVIDER_MODELS } from '../services/geminiService';
import { LiquidGlassCard } from './LiquidGlassCard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPage?: () => void;
  onOpenGuide?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenAdminPage, onOpenGuide }) => {
  const { 
    settings, 
    deviceInfo, 
    isBenchmarking,
    toggleTheme, 
    toggleEffects, 
    toggleSound, 
    setAutoOptimizeHardware, 
    rebenchmarkDevice,
    setAiProvider, 
    setAiModel, 
    setAllowFallback, 
    setCustomKey, 
    setTarotDeckStyle 
  } = useSettings();
  const { isAdmin, activateAdminByPasskey, currentUser, openAuthModal, systemSettings } = useAuth();
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminUnlockError, setAdminUnlockError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [showHardwareDetails, setShowHardwareDetails] = useState(false);
  const [benchmarkFeedback, setBenchmarkFeedback] = useState<string | null>(null);

  // Local state for key inputs
  const [geminiInput, setGeminiInput] = useState(settings.customKeys?.gemini || '');
  const [openrouterInput, setOpenrouterInput] = useState(settings.customKeys?.openrouter || '');

  if (!isOpen) return null;

  const handleRunBenchmark = async () => {
    setBenchmarkFeedback('Đang quét thông số phần cứng (CPU, RAM, GPU, Tần số quét màn hình)...');
    const result = await rebenchmarkDevice();
    const hzText = result.refreshRateHz ? ` • ${result.refreshRateHz}Hz` : '';
    setBenchmarkFeedback(`Đã kiểm tra: ${result.summary} (Điểm phần cứng: ${result.score}/100)${hzText}`);
    setTimeout(() => {
      setBenchmarkFeedback(null);
    }, 4500);
  };

  const handleOpenAdmin = () => {
    onClose();
    if (onOpenAdminPage) {
      onOpenAdminPage();
    }
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = activateAdminByPasskey(adminPasskey);
    if (success) {
      setAdminPasskey('');
      setAdminUnlockError('');
      handleOpenAdmin();
    } else {
      setAdminUnlockError('Mã quản trị không hợp lệ. Vui lòng kiểm tra lại.');
    }
  };

  const status = getProviderStatus();

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomKey('gemini', geminiInput);
    setCustomKey('openrouter', openrouterInput);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const allProviders: { id: AIProvider; label: string; desc: string; badge?: string }[] = [
    {
      id: 'auto',
      label: 'Tự động (Auto Fallback)',
      desc: 'Tự xoay vòng nhiều key Gemini, tự động chuyển sang OpenRouter nếu hết quota',
      badge: 'Khuyên dùng',
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      desc: 'Gemini 2.5 Flash / Pro (Hỗ trợ xoay tua nhiều key)',
      badge: status.gemini.configured ? `${status.gemini.count} key khả dụng` : 'Chưa có key',
    },
    {
      id: 'openrouter',
      label: 'OpenRouter Free',
      desc: 'Router AI miễn phí (openrouter/free) - Kết nối nhanh và hoàn toàn miễn phí',
      badge: status.openrouter.configured ? 'Đã cấu hình' : 'Miễn phí',
    },
  ];

  const providers = allProviders.filter(
    (p) => systemSettings.enabledAiProviders?.[p.id] ?? true
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
      />

      <motion.div
        initial={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg my-8 z-50 flex flex-col rounded-3xl overflow-hidden"
      >
        <LiquidGlassCard
          className="w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
          contentClassName={settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif">Cài đặt hệ thống</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-purple-300 z-30 shrink-0"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        <div className="space-y-6">
          {/* Giao diện & Hiệu ứng */}
          <div className="space-y-4 pb-5 border-b border-gray-100 dark:border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Giao diện & Trải nghiệm
            </h3>

            {/* Chế độ Sáng / Tối */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <span className="font-medium">Chế độ {settings.theme === 'dark' ? 'Tối' : 'Sáng'}</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <motion.div
                  animate={{ x: settings.theme === 'dark' ? 26 : 2 }}
                  transition={settings.effectsEnabled ? undefined : { duration: 0 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Tự động kiểm tra cấu hình thiết bị thực tế */}
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cấu hình phần cứng thiết bị</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        deviceInfo.tier === 'high' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : deviceInfo.tier === 'medium'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {deviceInfo.tier === 'high' ? 'Khỏe (Cao cấp)' : deviceInfo.tier === 'medium' ? 'Cân bằng' : 'Tiết kiệm / Nhẹ'}
                      </span>
                    </div>
                    <span className={`text-[11px] font-medium ${settings.theme === 'dark' ? 'text-purple-300/90' : 'text-slate-600'}`}>
                      {deviceInfo.summary}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoOptimizeHardware(!settings.autoOptimizeHardware)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.autoOptimizeHardware ? 'bg-amber-500' : 'bg-gray-400'}`}
                  title="Bật/tắt tự động tối ưu theo phần cứng máy"
                >
                  <motion.div
                    animate={{ x: settings.autoOptimizeHardware ? 26 : 2 }}
                    transition={settings.effectsEnabled ? undefined : { duration: 0 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Hardware specifications mini summary & action bar */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10 px-0.5 gap-2">
                <button
                  type="button"
                  onClick={() => setShowHardwareDetails(!showHardwareDetails)}
                  className="flex items-center gap-1 text-purple-300 hover:text-purple-100 font-semibold cursor-pointer truncate text-left"
                >
                  <span>{showHardwareDetails ? 'Ẩn thông số chi tiết' : 'Chi tiết CPU, RAM, GPU, Màn hình'}</span>
                  {showHardwareDetails ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                </button>
                <button
                  type="button"
                  disabled={isBenchmarking}
                  onClick={handleRunBenchmark}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer shrink-0 disabled:opacity-50 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all text-[11px]"
                >
                  {isBenchmarking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Đang quét...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Quét lại phần cứng</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Real Hardware Specs Panel */}
              {showHardwareDetails && (
                <div className="mt-2 p-3 rounded-xl bg-black/40 border border-purple-500/30 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-purple-300/70 block text-[10px]">Bộ xử lý (CPU)</span>
                      <span className="font-bold text-white">{deviceInfo.cpuCores} Luồng / Cores</span>
                      <span className="text-[9.5px] text-slate-400 block">{deviceInfo.cpuArchitecture}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-purple-300/70 block text-[10px]">Bộ nhớ RAM (Dung lượng)</span>
                      <span className="font-bold text-white block">
                        {deviceInfo.memoryLabel || `${deviceInfo.memoryGB} GB RAM`}
                      </span>
                      <span className="text-[9.5px] text-slate-400 block">
                        {deviceInfo.memoryGB && deviceInfo.memoryGB >= 8 ? 'Cấu hình cao (Web API chuẩn hóa tối đa 8GB)' : deviceInfo.jsHeapLimitMB ? `Heap: ${deviceInfo.jsHeapLimitMB}MB` : 'Khả dụng chuẩn hệ thống'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 col-span-2">
                      <span className="text-purple-300/70 block text-[10px]">Card đồ họa (GPU Model)</span>
                      <span className="font-bold text-amber-200 block break-words" title={deviceInfo.gpuRenderer}>
                        {deviceInfo.gpuRenderer}
                      </span>
                      <span className="text-[9.5px] text-purple-300/80 block mt-0.5">
                        WebGL2: {deviceInfo.hasWebGL2 ? 'Có hỗ trợ' : 'WebGL1'} • Texture Max: {deviceInfo.maxTextureSize}px
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-purple-300/70 block text-[10px]">Màn hình & Tần số quét</span>
                      <span className="font-bold text-white">{deviceInfo.screenResolution}</span>
                      <span className="text-[9.5px] text-amber-300 block font-semibold">{deviceInfo.refreshRateHz}Hz (DPR: {deviceInfo.devicePixelRatio}x)</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-purple-300/70 block text-[10px]">Hệ điều hành & Môi trường</span>
                      <span className="font-bold text-white truncate block">{deviceInfo.osName}</span>
                      <span className="text-[9.5px] text-slate-400 block">{deviceInfo.browserEngine}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-purple-200/90 pt-1.5 border-t border-white/10 flex items-center justify-between">
                    <span>Điểm đánh giá phần cứng: <strong className="text-amber-300">{deviceInfo.score}/100</strong></span>
                    <span className="text-slate-400 italic">{deviceInfo.recommendation}</span>
                  </div>
                </div>
              )}

              {benchmarkFeedback && (
                <div className="text-[11px] p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{benchmarkFeedback}</span>
                </div>
              )}
            </div>

            {/* Hiệu ứng hình ảnh (Animation thủ công) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {settings.effectsEnabled ? <Zap className="w-5 h-5 text-blue-400" /> : <ZapOff className="w-5 h-5 text-gray-400" />}
                <div className="flex flex-col">
                  <span className={`font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Hiệu ứng hình ảnh (Animation)</span>
                  <span className={`text-[10px] font-medium ${settings.theme === 'dark' ? 'text-purple-300/80' : 'text-slate-500'}`}>
                    {settings.effectsEnabled ? 'Đang bật đầy đủ chuyển động 3D & bụi sao' : 'Đang ở chế độ nhẹ giúp máy mượt mà'}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleEffects}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.effectsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <motion.div
                  animate={{ x: settings.effectsEnabled ? 26 : 2 }}
                  transition={settings.effectsEnabled ? undefined : { duration: 0 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Nút Mở Hướng Dẫn Sử Dụng Toàn Tập */}
            {onOpenGuide && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 hover:text-white transition flex items-center justify-between text-xs font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Cẩm nang Hướng dẫn sử dụng Neko Tarot</span>
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold uppercase">Xem ngay →</span>
                </button>
              </div>
            )}

            {/* Âm thanh huyền bí */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                <div className="flex flex-col">
                  <span className={`font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Âm thanh lật bài</span>
                  <span className={`text-[10px] font-medium ${settings.theme === 'dark' ? 'text-purple-300/80' : 'text-slate-500'}`}>Phát tiếng chuông ngân huyền bí khi lật mở các lá bài Tarot</span>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-amber-500' : 'bg-gray-200'}`}
              >
                <motion.div
                  animate={{ x: settings.soundEnabled ? 26 : 2 }}
                  transition={settings.effectsEnabled ? undefined : { duration: 0 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Chọn Phong cách Bộ bài Tarot (Artwork) */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Bộ ảnh Tarot (Deck Artwork)</span>
                </div>
              </div>
              <p className={`text-[11px] font-medium ${settings.theme === 'dark' ? 'text-purple-200/80' : 'text-slate-600'}`}>
                Tùy chọn phong cách bộ bài Public Domain cổ điển hoặc chuẩn hóa 78 lá:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {[
                  {
                    id: 'rider-waite' as TarotDeckStyle,
                    name: 'Rider-Waite (Chuẩn hóa)',
                    source: 'krates98 & Tarotoo',
                    desc: 'Bộ 78 lá kinh điển, màu sắc nét',
                  },
                  {
                    id: 'marseille' as TarotDeckStyle,
                    name: 'Tarot de Marseille',
                    source: 'mixvlad/TarotCards',
                    desc: 'Bộ bài phong cách Pháp thế kỷ 18',
                  },
                  {
                    id: 'sola-busca' as TarotDeckStyle,
                    name: 'Sola Busca (1491)',
                    source: 'mixvlad/TarotCards',
                    desc: 'Bộ Tarot cổ nhất thế giới',
                  },
                ]
                  .filter((deck) => systemSettings.enabledTarotStyles?.[deck.id] ?? true)
                  .map((deck) => {
                  const active = (settings.tarotDeckStyle || 'rider-waite') === deck.id;
                  return (
                    <button
                      key={deck.id}
                      type="button"
                      onClick={() => setTarotDeckStyle(deck.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        active
                          ? 'border-purple-500 bg-purple-500/15 ring-1 ring-purple-500'
                          : 'border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`font-bold text-xs ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{deck.name}</span>
                        {active && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 font-bold" />}
                      </div>
                      <span className={`text-[10px] font-mono block mb-1 font-semibold ${settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>{deck.source}</span>
                      <p className={`text-[10px] leading-tight font-medium ${settings.theme === 'dark' ? 'text-purple-200/90' : 'text-slate-700'}`}>{deck.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Nhập / Quản lý API Key cá nhân (Dự phòng cho người dùng) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowKeySettings(!showKeySettings)}
              className="w-full flex items-center justify-between text-left py-1 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400"
            >
              <span className="flex items-center">
                <Key className="w-3.5 h-3.5 mr-1.5" /> Quản lý API Keys dự phòng
              </span>
              {showKeySettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <p className="text-xs opacity-70">
              Bạn có thể nhập trực tiếp các API key tại đây để lưu an toàn trên trình duyệt của bạn (không cần redeploy Vercel):
            </p>

            {showKeySettings && (
              <form onSubmit={handleSaveKeys} className="space-y-4 pt-2">
                {/* Gemini Keys */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span>Google Gemini Key(s):</span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-500 hover:underline flex items-center text-[10px]"
                    >
                      Lấy key <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </a>
                  </div>
                  <textarea
                    value={geminiInput}
                    onChange={(e) => setGeminiInput(e.target.value)}
                    placeholder="Điền 1 hoặc nhiều key cách nhau bằng dấu phẩy hoặc xuống dòng..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <span className="text-[10px] text-purple-600 dark:text-purple-300 block">
                    💡 Hỗ trợ nhiều key: nếu 1 key bị limit 429 hoặc quota, hệ thống tự chuyển sang key tiếp theo.
                  </span>
                </div>

                {/* OpenRouter Key */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span>OpenRouter API Key (Dùng Router Free):</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://openrouter.ai/openrouter/free"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline flex items-center text-[10px]"
                      >
                        Router Free <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-500 hover:underline flex items-center text-[10px]"
                      >
                        Lấy key <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={openrouterInput}
                    onChange={(e) => setOpenrouterInput(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <span className="text-[10px] text-purple-600 dark:text-purple-300 block">
                    ✨ Tự động kết nối qua <strong>openrouter/free</strong> hoàn toàn miễn phí.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center shadow-md shadow-purple-600/20"
                  >
                    Lưu các khóa API
                  </button>

                  {savedNotice && (
                    <span className="text-xs text-green-500 flex items-center font-medium animate-fade-in">
                      <Check className="w-3.5 h-3.5 mr-1" /> Đã lưu thành công!
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Admin Management Access */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
            {isAdmin ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-amber-500 dark:text-amber-300">
                      Quyền Quản Trị Hệ Thống (Admin)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] opacity-70 mt-0.5">
                    Quản lý API toàn web, phân quyền tính năng & cấu hình Vercel
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdmin}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-all flex items-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Mở Bảng Admin
                </button>
              </div>
             ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdminUnlock(!showAdminUnlock)}
                  className="w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-semibold opacity-85 hover:opacity-100"
                >
                  <span className="flex items-center">
                    <Lock className="w-3.5 h-3.5 mr-2 text-amber-500" />
                    Khu vực Quản Trị Viên (Admin Access)
                  </span>
                  {showAdminUnlock ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdminUnlock && (
                  <div className={`p-3.5 mt-2 rounded-2xl border space-y-3 text-xs ${
                    settings.theme === 'dark'
                      ? 'bg-black/20 border-white/10'
                      : 'bg-purple-50/50 border-purple-100'
                  }`}>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-purple-200/80' : 'text-slate-600 font-medium'}`}>
                      Đăng nhập bằng tài khoản Google <strong>nekyohotaru@gmail.com</strong> hoặc nhập mã quản trị để truy cập:
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openAuthModal();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          settings.theme === 'dark'
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                        }`}
                      >
                        Đăng nhập Google
                      </button>
                    </div>

                    <form onSubmit={handleAdminUnlock} className={`space-y-2 pt-1.5 border-t ${settings.theme === 'dark' ? 'border-white/5' : 'border-purple-100'}`}>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={adminPasskey}
                          onChange={(e) => setAdminPasskey(e.target.value)}
                          placeholder="Nhập mã quản trị (Passkey)..."
                          className={`flex-1 text-xs p-2 rounded-lg border focus:outline-none focus:border-amber-500 font-mono ${
                            settings.theme === 'dark'
                              ? 'border-white/10 bg-black/40 text-white'
                              : 'border-purple-200 bg-white text-slate-900 shadow-inner'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors shadow-sm"
                        >
                          Xác thực
                        </button>
                      </div>
                      {adminUnlockError && (
                        <p className="text-red-400 text-[10px] font-medium">{adminUnlockError}</p>
                      )}
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5 text-center flex items-center justify-center gap-2 text-[11px] opacity-40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mọi khóa API đều được mã hóa cục bộ trên trình duyệt</span>
        </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
