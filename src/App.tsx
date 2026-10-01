import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CosmicBackground from './components/CosmicBackground';
import HomeScreen from './components/HomeScreen';
import ReadingScreen from './components/ReadingScreen';
import { TuViScreen } from './components/TuViScreen';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import { UserGuideModal } from './components/UserGuideModal';
import { AdminPage } from './components/AdminPage';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { LiquidGlassCard } from './components/LiquidGlassCard';
import { SidebarDrawer } from './components/SidebarDrawer';
import { PWAFloatingBubble } from './components/PWAFloatingBubble';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sparkles, Settings, History, LogIn, LogOut, User as UserIcon, ShieldCheck, Bell, Lock, BookOpen, AlertCircle, Loader2, Zap, ZapOff, Menu } from 'lucide-react';
import { DeckType, UserInfo, ReadingResult } from './types';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getReadingById } from './services/firebase';

function AppContent() {
  const [view, setView] = useState<'home' | 'reading' | 'tuvi' | 'admin'>('home');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [deckType, setDeckType] = useState<DeckType>(DeckType.TAROT);
  const [homeStep, setHomeStep] = useState<'welcome' | 'form'>('welcome');
  const [homeDeckType, setHomeDeckType] = useState<DeckType>(DeckType.TAROT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<ReadingResult | null>(null);
  const [isLoadingDirectReading, setIsLoadingDirectReading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [animationToast, setAnimationToast] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { settings, toggleEffects } = useSettings();
  const { currentUser, openAuthModal, logout, readings, isAdmin, systemSettings } = useAuth();

  // URL Navigation helper
  const navigateTo = useCallback((path: string, replace = false) => {
    if (typeof window === 'undefined') return;
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
  }, []);

  // Parse path and query parameters
  const syncRouteFromLocation = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const params = new URLSearchParams(window.location.search);
    const qReadingId = params.get('id') || params.get('readingId');

    // 1. Admin route
    if (pathname === '/admin') {
      setView('admin');
      setIsGuideOpen(false);
      setIsHistoryOpen(false);
      return;
    }

    // 2. Guide route
    if (pathname === '/huong-dan' || pathname === '/guide') {
      setIsGuideOpen(true);
      return;
    }

    // 3. History route
    if (pathname === '/lich-su' || pathname === '/history') {
      setIsHistoryOpen(true);
      return;
    }

    // 4. Tu Vi route: /tuvi or /tu-vi
    if (pathname === '/tuvi' || pathname === '/tu-vi') {
      setView('tuvi');
      setDeckType(DeckType.TU_VI);
      setSelectedReading(null);
      return;
    }

    // 5. Bai Tay (Playing Cards 52 cards) route
    if (pathname === '/bai-tay' || pathname === '/baitay' || pathname === '/playing-cards') {
      if (!selectedReading) {
        setView('home');
        setHomeDeckType(DeckType.PLAYING_CARDS);
        setHomeStep('form');
        setDeckType(DeckType.PLAYING_CARDS);
      }
      return;
    }

    // 6. Tarot route
    if (pathname === '/tarot') {
      if (!selectedReading) {
        setView('home');
        setHomeDeckType(DeckType.TAROT);
        setHomeStep('form');
        setDeckType(DeckType.TAROT);
      }
      return;
    }

    // 7. Direct Reading link: /reading/:id or /ket-qua/:id or ?id=...
    const readingMatch = pathname.match(/^\/(?:reading|ket-qua)\/([^/]+)/);
    const targetReadingId = readingMatch ? decodeURIComponent(readingMatch[1]) : qReadingId;

    if (targetReadingId) {
      if (selectedReading && selectedReading.id === targetReadingId) {
        // Already loaded
        setView(selectedReading.deckType === DeckType.TU_VI ? 'tuvi' : 'reading');
        return;
      }

      setIsLoadingDirectReading(true);
      setRouteError(null);
      try {
        const found = await getReadingById(targetReadingId, currentUser?.uid);
        if (found) {
          setSelectedReading(found);
          setUserInfo(found.userInfo);
          setDeckType(found.deckType);
          setView(found.deckType === DeckType.TU_VI ? 'tuvi' : 'reading');
        } else {
          setRouteError(`Không tìm thấy kết quả quẻ bói "${targetReadingId}". Có thể liên kết không chính xác hoặc đã hết hạn.`);
          setTimeout(() => setRouteError(null), 5000);
          navigateTo('/', true);
          setView('home');
          setHomeStep('welcome');
          setSelectedReading(null);
        }
      } catch (err) {
        console.error('Error fetching reading by link:', err);
        setRouteError('Có lỗi khi tải kết quả quẻ bói từ liên kết này.');
        navigateTo('/', true);
        setView('home');
        setHomeStep('welcome');
      } finally {
        setIsLoadingDirectReading(false);
      }
      return;
    }

    // 8. Default root
    if (pathname === '/' || pathname === '') {
      setView('home');
      setHomeStep('welcome');
      setSelectedReading(null);
    }
  }, [currentUser, navigateTo, selectedReading]);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    syncRouteFromLocation();
    const handlePopState = () => {
      syncRouteFromLocation();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncRouteFromLocation]);

  const handleStart = (info: UserInfo, type: DeckType) => {
    if (!systemSettings.enableGuestReadings && !currentUser) {
      openAuthModal();
      return;
    }
    setSelectedReading(null);
    setUserInfo(info);
    setDeckType(type);
    if (type === DeckType.TU_VI) {
      navigateTo('/tuvi');
      setView('tuvi');
    } else if (type === DeckType.PLAYING_CARDS) {
      navigateTo('/bai-tay');
      setView('reading');
    } else {
      navigateTo('/tarot');
      setView('reading');
    }
  };

  const handleStartTuVi = (info?: UserInfo) => {
    if (!systemSettings.enableGuestReadings && !currentUser) {
      openAuthModal();
      return;
    }
    setSelectedReading(null);
    if (info) setUserInfo(info);
    setDeckType(DeckType.TU_VI);
    navigateTo('/tuvi');
    setView('tuvi');
  };

  const handleNavigateDeck = (type: DeckType) => {
    setHomeDeckType(type);
    setHomeStep('form');
    setDeckType(type);
    if (type === DeckType.PLAYING_CARDS) {
      navigateTo('/bai-tay');
    } else if (type === DeckType.TAROT) {
      navigateTo('/tarot');
    }
  };

  const handleBackToWelcome = () => {
    setHomeStep('welcome');
    navigateTo('/');
  };

  const handleSelectHistoricalReading = (reading: ReadingResult) => {
    setSelectedReading(reading);
    setUserInfo(reading.userInfo);
    setDeckType(reading.deckType);
    navigateTo(`/reading/${reading.id}`);
    if (reading.deckType === DeckType.TU_VI) {
      setView('tuvi');
    } else {
      setView('reading');
    }
  };

  const handleNavigateHome = () => {
    setSelectedReading(null);
    setUserInfo(null);
    setHomeStep('welcome');
    navigateTo('/');
    setView('home');
  };

  const handleOpenAdmin = () => {
    navigateTo('/admin');
    setView('admin');
  };

  const handleOpenGuide = () => {
    navigateTo('/huong-dan');
    setIsGuideOpen(true);
  };

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    // If currently on guide URL, return to current view's URL
    if (window.location.pathname.includes('huong-dan') || window.location.pathname.includes('guide')) {
      if (view === 'admin') navigateTo('/admin', true);
      else if (view === 'tuvi') navigateTo('/tuvi', true);
      else if (view === 'reading') {
        if (selectedReading) navigateTo(`/reading/${selectedReading.id}`, true);
        else navigateTo('/tarot', true);
      } else {
        navigateTo('/', true);
      }
    }
  };

  const handleOpenHistory = () => {
    navigateTo('/lich-su');
    setIsHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
    if (window.location.pathname.includes('lich-su') || window.location.pathname.includes('history')) {
      if (view === 'admin') navigateTo('/admin', true);
      else if (view === 'tuvi') navigateTo('/tuvi', true);
      else if (view === 'reading') {
        if (selectedReading) navigateTo(`/reading/${selectedReading.id}`, true);
        else navigateTo('/tarot', true);
      } else {
        navigateTo('/', true);
      }
    }
  };

  return (
    <div className={`relative min-h-screen selection:bg-purple-500/30 transition-colors duration-300 ${
      settings.effectsEnabled 
        ? 'bg-transparent' 
        : (settings.theme === 'dark' ? 'bg-[#05020a]' : 'bg-gradient-to-b from-[#faf5ff] via-[#fdfbf7] to-[#f5f3ff]')
    } ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {settings.effectsEnabled && <CosmicBackground />}
      
      {/* Route Error Notification Toast */}
      <AnimatePresence>
        {routeError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-900/90 text-white border border-rose-500/50 shadow-xl flex items-center gap-2 text-xs backdrop-blur-md max-w-md w-11/12"
          >
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="flex-1">{routeError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation Toggle Quick Toast Notification */}
      <AnimatePresence>
        {animationToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md max-w-sm w-11/12 justify-center transition-all ${
              settings.effectsEnabled
                ? 'bg-purple-900/95 text-amber-200 border-amber-400/50 shadow-purple-950/60'
                : 'bg-slate-900/95 text-slate-200 border-slate-700/70 shadow-black/60'
            }`}
          >
            {settings.effectsEnabled ? (
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            ) : (
              <ZapOff className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span>{animationToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading direct reading overlay */}
      {isLoadingDirectReading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="p-5 rounded-3xl bg-[#120a24]/90 border border-purple-500/40 text-center space-y-3 shadow-2xl">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm">Đang tải kết quả quẻ bói...</h3>
              <p className="text-xs text-purple-200/70">Đang đồng bộ dữ liệu quẻ bài từ Vũ Trụ</p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Top Header (Liquid Glass Floating Bar) */}
      {view !== 'admin' && (
        <header className="fixed top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 z-40 max-w-7xl mx-auto pointer-events-none">
          <div className="pointer-events-auto space-y-2">
            {/* Cosmic Announcement Banner (Configured by Admin) */}
            {systemSettings.announcementActive && systemSettings.announcement && (
              <AnnouncementBanner text={systemSettings.announcement} />
            )}

            {/* Liquid Glass Navbar */}
            <LiquidGlassCard
              borderRadius="9999px"
              blurIntensity="lg"
              borderIntensity="sm"
              shadowIntensity="md"
              glowIntensity="sm"
              className={`liquid-glass-card transition-all duration-300 w-full ${
                settings.theme === 'dark' ? 'text-white' : 'text-purple-950 shadow-purple-900/10'
              }`}
              contentClassName="px-3 sm:px-5 py-2 flex justify-between items-center w-full min-w-0"
            >
              {/* Brand Logo */}
              <div 
                className="flex items-center cursor-pointer group shrink-0 relative z-10"
                onClick={handleNavigateHome}
                title="Về trang chủ Neko Tarot (/)"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] p-0.5 ${
                  settings.theme === 'dark' 
                    ? 'border-white/30 bg-purple-500/20 group-hover:bg-purple-500/30 group-hover:border-purple-300 ring-1 ring-purple-500/30' 
                    : 'border-purple-300/80 bg-purple-100/60 group-hover:bg-purple-200/80 group-hover:border-purple-400 ring-1 ring-purple-300/40'
                }`}>
                  <img
                    src="/pwa-192x192.png"
                    alt="Neko Tarot"
                    className="w-full h-full object-contain rounded-full select-none"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('pwa-512x512.png')) {
                        target.src = '/pwa-512x512.png';
                      }
                    }}
                  />
                </div>
                <span className={`ml-2 sm:ml-2.5 text-sm sm:text-base font-serif tracking-wider uppercase whitespace-nowrap transition-colors font-extrabold ${
                  settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'
                }`}>
                  Neko Tarot
                </span>
              </div>

              {/* Desktop Full Menu (visible on min-width 1024px) */}
              <div className="hidden lg:flex items-center space-x-1.5 sm:space-x-2 shrink-0 relative z-10">
                {/* User Guide Button */}
                <motion.div
                  whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                  whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                  onClick={handleOpenGuide}
                  className="shrink-0 cursor-pointer"
                  title="Cẩm nang hướng dẫn sử dụng toàn tập (/huong-dan)"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="xs"
                    shadowIntensity="xs"
                    contentClassName={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold ${
                      settings.theme === 'dark' ? 'text-amber-300' : 'text-amber-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Hướng Dẫn</span>
                  </LiquidGlassCard>
                </motion.div>

                {/* Admin Dashboard Button */}
                {isAdmin && (
                  <motion.div
                    whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                    whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                    onClick={handleOpenAdmin}
                    className="shrink-0 cursor-pointer"
                    title="Mở Trang Quản Trị Hệ Thống (/admin)"
                  >
                    <LiquidGlassCard
                      borderRadius="9999px"
                      blurIntensity="md"
                      borderIntensity="xs"
                      shadowIntensity="xs"
                      contentClassName={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold ${
                        settings.theme === 'dark' ? 'text-amber-300' : 'text-amber-800'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Quản Trị</span>
                    </LiquidGlassCard>
                  </motion.div>
                )}

                {/* History Button */}
                <motion.div
                  whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                  whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                  onClick={handleOpenHistory}
                  className="shrink-0 cursor-pointer"
                  title="Xem lịch sử các quẻ bài đã hỏi (/lich-su)"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="xs"
                    shadowIntensity="xs"
                    contentClassName={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold ${
                      settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Lịch sử</span>
                    {readings.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-purple-600/90 text-white text-[10px] font-bold shrink-0 shadow-sm">
                        {readings.length}
                      </span>
                    )}
                  </LiquidGlassCard>
                </motion.div>

                {/* User / Login Button */}
                {currentUser ? (
                  <div className="flex items-center space-x-1 shrink-0">
                    <LiquidGlassCard
                      borderRadius="9999px"
                      blurIntensity="md"
                      borderIntensity="xs"
                      shadowIntensity="xs"
                      contentClassName={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold ${
                        settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'
                      }`}
                      title={currentUser.displayName || currentUser.email || 'Tài khoản'}
                    >
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          className="w-4 h-4 rounded-full object-cover shrink-0 border border-white/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      )}
                      <span className="max-w-[100px] truncate font-semibold">
                        {currentUser.displayName || 'Tài khoản'}
                      </span>
                    </LiquidGlassCard>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={logout}
                      className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    whileTap={{ scale: 0.94 }}
                    onClick={openAuthModal}
                    className="shrink-0 cursor-pointer"
                    title="Đăng nhập để lưu lịch sử đám mây"
                  >
                    <LiquidGlassCard
                      borderRadius="9999px"
                      blurIntensity="md"
                      borderIntensity="xs"
                      shadowIntensity="sm"
                      className="cursor-pointer bg-purple-600/80 hover:bg-purple-600 text-white"
                      contentClassName="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      <LogIn className="w-3.5 h-3.5 shrink-0" />
                      <span>Đăng nhập</span>
                    </LiquidGlassCard>
                  </motion.div>
                )}

                {/* Effect Switch Button */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const nextVal = !settings.effectsEnabled;
                    toggleEffects();
                    setAnimationToast(nextVal ? 'Đã bật hiệu ứng vũ trụ ✨' : 'Đã tắt animation (Tối ưu mượt)');
                    setTimeout(() => setAnimationToast(null), 2500);
                  }}
                  className="shrink-0 cursor-pointer"
                  title="Bật/Tắt hiệu ứng chuyển động"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="xs"
                    shadowIntensity="xs"
                    contentClassName={`p-2 flex items-center justify-center ${
                      settings.effectsEnabled ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {settings.effectsEnabled ? (
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    ) : (
                      <ZapOff className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </LiquidGlassCard>
                </motion.div>

                {/* Settings Modal Button */}
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSettingsOpen(true)}
                  className="shrink-0 cursor-pointer"
                  title="Cài đặt hệ thống"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="xs"
                    shadowIntensity="xs"
                    contentClassName="p-2 flex items-center justify-center text-purple-300"
                  >
                    <Settings className="w-4 h-4" />
                  </LiquidGlassCard>
                </motion.div>

                {/* Sidebar Menu Trigger Button for Desktop */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(true)}
                  className="shrink-0 cursor-pointer"
                  title="Mở Bảng Điều Hướng Sidebar"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="xs"
                    shadowIntensity="sm"
                    className="bg-purple-600/30 hover:bg-purple-600/50 border-purple-400/50 text-white"
                    contentClassName="p-2 flex items-center justify-center text-amber-300"
                  >
                    <Menu className="w-4 h-4" />
                  </LiquidGlassCard>
                </motion.div>
              </div>

              {/* Mobile / Tablet Compact Right Action Controls (< 1024px) */}
              <div className="flex lg:hidden items-center space-x-1.5 shrink-0 relative z-10">
                {/* History Quick Badge */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOpenHistory}
                  className="shrink-0 cursor-pointer"
                  title="Xem lịch sử quẻ bói"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="xs"
                    shadowIntensity="xs"
                    contentClassName="p-2 flex items-center justify-center relative text-purple-300"
                  >
                    <History className="w-4 h-4 text-purple-400" />
                    {readings.length > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[9px] font-bold shadow-md">
                        {readings.length}
                      </span>
                    )}
                  </LiquidGlassCard>
                </motion.div>

                {/* User Avatar / Login Quick Icon */}
                {currentUser ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(true)}
                    className="shrink-0 cursor-pointer"
                    title={currentUser.displayName || 'Tài khoản'}
                  >
                    <div className="w-8 h-8 rounded-full border border-purple-400/50 p-0.5 bg-purple-600/30 overflow-hidden shrink-0">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-300">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    onClick={openAuthModal}
                    className="shrink-0 cursor-pointer"
                    title="Đăng nhập"
                  >
                    <LiquidGlassCard
                      borderRadius="9999px"
                      blurIntensity="md"
                      borderIntensity="xs"
                      shadowIntensity="xs"
                      className="bg-purple-600/80 text-white"
                      contentClassName="p-2 flex items-center justify-center"
                    >
                      <LogIn className="w-4 h-4 text-white" />
                    </LiquidGlassCard>
                  </motion.div>
                )}

                {/* Primary Mobile Menu Sidebar Button (Hamburger Drawer) */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-full bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/60 text-amber-300 shadow-lg shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center relative group"
                  title="Mở Menu Sidebar Navigation"
                >
                  <Menu className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                </motion.button>
              </div>
            </LiquidGlassCard>
          </div>
        </header>
      )}

      <main className="relative min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              className="liquid-glass-card-wrapper w-full"
            >
              <HomeScreen 
                onStart={handleStart} 
                onStartTuVi={handleStartTuVi}
                initialDeckType={homeDeckType}
                initialStep={homeStep}
                onNavigateDeck={handleNavigateDeck}
                onBackToWelcome={handleBackToWelcome}
              />
            </motion.div>
          )}

          {view === 'reading' && (userInfo || selectedReading) && (
            <motion.div
              key={selectedReading ? selectedReading.id : 'reading'}
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              className="liquid-glass-card-wrapper w-full"
            >
              <ReadingScreen 
                userInfo={userInfo || selectedReading!.userInfo} 
                deckType={deckType}
                initialReading={selectedReading}
                onReset={handleNavigateHome}
              />
            </motion.div>
          )}

          {view === 'tuvi' && (
            <motion.div
              key={selectedReading ? selectedReading.id : 'tuvi'}
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              className="liquid-glass-card-wrapper w-full"
            >
              <TuViScreen
                initialUserInfo={userInfo}
                initialReading={selectedReading}
                onBack={handleNavigateHome}
              />
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              className="liquid-glass-card-wrapper w-full"
            >
              <AdminPage onBack={handleNavigateHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
        onNavigateTarot={() => {
          handleStart({ fullName: currentUser?.displayName || 'Tín chủ', request: '' }, DeckType.TAROT);
        }}
        onNavigateTuVi={() => {
          handleStartTuVi({ fullName: currentUser?.displayName || 'Tín chủ', request: '' });
        }}
      />

      {/* Responsive Mobile Navigation Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigateHome={handleNavigateHome}
        onOpenGuide={handleOpenGuide}
        onOpenHistory={handleOpenHistory}
        onOpenAdmin={handleOpenAdmin}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToast={(msg) => {
          setAnimationToast(msg);
          setTimeout(() => setAnimationToast(null), 2500);
        }}
        readingsCount={readings.length}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={handleCloseHistory}
        onSelectReading={handleSelectHistoricalReading}
      />

      {/* Auth Modal */}
      <AuthModal />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onOpenAdminPage={handleOpenAdmin}
            onOpenGuide={handleOpenGuide}
          />
        )}
      </AnimatePresence>

      {/* Floating PWA Install Bubble / Popup */}
      <PWAFloatingBubble />

      {/* Connectivity status indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SettingsProvider>
  );
}
