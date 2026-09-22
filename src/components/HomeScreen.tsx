import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Sparkles, Moon, Star, Sun, User, Calendar, MessageSquare, ChevronRight, Lock, Clock, Compass } from 'lucide-react';
import { DeckType, UserInfo } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { LiquidGlassCard } from './LiquidGlassCard';

interface HomeScreenProps {
  onStart: (userInfo: UserInfo, deckType: DeckType) => void;
  onStartTuVi: (userInfo?: UserInfo) => void;
  initialDeckType?: DeckType;
  initialStep?: 'welcome' | 'form';
  onNavigateDeck?: (type: DeckType) => void;
  onBackToWelcome?: () => void;
}

const formContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 26,
    },
  },
};

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStart, 
  onStartTuVi,
  initialDeckType = DeckType.TAROT,
  initialStep = 'welcome',
  onNavigateDeck,
  onBackToWelcome,
}) => {
  const [step, setStep] = useState<'welcome' | 'form'>(initialStep);
  const [deckType, setDeckType] = useState<DeckType>(initialDeckType);

  React.useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    }
  }, [initialStep]);

  React.useEffect(() => {
    if (initialDeckType) {
      setDeckType(initialDeckType);
    }
  }, [initialDeckType]);

  const { settings } = useSettings();
  const { currentUser, systemSettings, openAuthModal } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    gender: 'Nam',
    birthDate: '',
    birthYear: '',
    birthTime: '',
    request: '',
  });

  const requiresAuth = !systemSettings.enableGuestReadings && !currentUser;

  const handleChooseDeck = (type: DeckType) => {
    if (requiresAuth) {
      openAuthModal();
      return;
    }
    setDeckType(type);
    setStep('form');
    onNavigateDeck?.(type);
  };

  const handleBack = () => {
    setStep('welcome');
    onBackToWelcome?.();
  };

  const handleBirthDateChange = (raw: string) => {
    // Keep only numbers, max 8 digits for ddmmyyyy
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 5) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    let year = '';
    if (digits.length === 8) {
      year = digits.slice(4, 8);
    }

    setUserInfo(prev => ({
      ...prev,
      birthDate: formatted,
      birthYear: year || prev.birthYear || '',
    }));
  };

  const handleBirthTimeChange = (raw: string) => {
    // Keep only numbers, max 4 digits for 24h format (HH:mm)
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    setUserInfo(prev => ({ ...prev, birthTime: formatted }));
  };

  const isBirthValid = Boolean(
    (userInfo.birthDate && userInfo.birthDate.length === 10) || 
    (userInfo.birthYear && userInfo.birthYear.length === 4)
  );

  const handleStart = () => {
    if (requiresAuth) {
      openAuthModal();
      return;
    }
    if (userInfo.fullName.trim() && isBirthValid) {
      onStart(userInfo, deckType);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 pb-20 text-center ${
      systemSettings.announcementActive && systemSettings.announcement ? 'pt-32 sm:pt-36' : 'pt-24 sm:pt-28'
    }`}>
      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={settings.effectsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={settings.effectsEnabled ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            className="flex flex-col items-center w-full max-w-2xl mx-auto"
          >
            {/* Celestial Orbit & Mystic Emblem Frame - Dedicated clearance box */}
            <motion.div
              initial={settings.effectsEnabled ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2 sm:my-4 shrink-0"
            >
              {/* Outer Breathing Nebula Aura */}
              {settings.effectsEnabled && (
                <div className={`absolute -inset-6 blur-3xl rounded-full animate-pulse transition-all pointer-events-none ${
                  settings.theme === 'dark' ? 'bg-purple-600/30' : 'bg-purple-400/35'
                }`} />
              )}

              {/* Celestial Orbit Ring 1 (Astrolabe with all 12 Zodiac Glyphs directly riding on the ring) */}
              {settings.effectsEnabled && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-dashed border-purple-400/40 pointer-events-none"
                >
                  {/* All 12 Zodiac Signs mathematically placed at 30° increments around the ring perimeter */}
                  {[
                    { symbol: '♈', name: 'Bạch Dương', color: 'text-amber-300 border-amber-400/30' },
                    { symbol: '♉', name: 'Kim Ngưu', color: 'text-emerald-300 border-emerald-400/30' },
                    { symbol: '♊', name: 'Song Tử', color: 'text-cyan-300 border-cyan-400/30' },
                    { symbol: '♋', name: 'Cự Giải', color: 'text-purple-300 border-purple-400/30' },
                    { symbol: '♌', name: 'Sư Tử', color: 'text-amber-300 border-amber-400/30' },
                    { symbol: '♍', name: 'Xử Nữ', color: 'text-emerald-300 border-emerald-400/30' },
                    { symbol: '♎', name: 'Thiên Bình', color: 'text-cyan-300 border-cyan-400/30' },
                    { symbol: '♏', name: 'Bọ Cạp', color: 'text-pink-300 border-pink-400/30' },
                    { symbol: '♐', name: 'Nhân Mã', color: 'text-amber-300 border-amber-400/30' },
                    { symbol: '♑', name: 'Ma Kết', color: 'text-emerald-300 border-emerald-400/30' },
                    { symbol: '♒', name: 'Bảo Bình', color: 'text-cyan-300 border-cyan-400/30' },
                    { symbol: '♓', name: 'Song Ngư', color: 'text-purple-300 border-purple-400/30' },
                  ].map((zodiac, zIdx) => {
                    // Position at angle = zIdx * 30 deg, starting from top (-90 deg)
                    const angleRad = (zIdx * 30 - 90) * (Math.PI / 180);
                    const leftPercent = 50 + 50 * Math.cos(angleRad);
                    const topPercent = 50 + 50 * Math.sin(angleRad);

                    return (
                      <div
                        key={zIdx}
                        style={{
                          left: `${leftPercent}%`,
                          top: `${topPercent}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        className={`absolute text-[11px] sm:text-xs font-serif ${zodiac.color} drop-shadow-md select-none bg-purple-950/80 dark:bg-black/90 px-1 py-0.5 rounded-full border shadow-sm`}
                        title={zodiac.name}
                      >
                        {zodiac.symbol}
                      </div>
                    );
                  })}
                  
                  {/* Orbiting Golden Planet Bead riding on the perimeter */}
                  <div className="absolute -top-1.5 left-1/4 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg shadow-amber-400/90 border border-amber-100" />
                  
                  {/* Orbiting Cyan Starlight Bead riding on the perimeter */}
                  <div className="absolute -bottom-1.5 right-1/4 translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-300 shadow-lg shadow-cyan-400/90 border border-cyan-100" />
                </motion.div>
              )}

              {/* Celestial Orbit Ring 2 (Inner Counter-Rotating Orbit) */}
              {settings.effectsEnabled && (
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-44 h-44 sm:w-50 sm:h-50 rounded-full border border-purple-400/30 pointer-events-none"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-serif text-amber-200 select-none bg-purple-950/70 dark:bg-black/80 px-1 rounded-full border border-amber-300/20">♌</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[11px] font-serif text-purple-200 select-none bg-purple-950/70 dark:bg-black/80 px-1 rounded-full border border-purple-300/20">♒</div>
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-tr from-purple-500 to-fuchsia-300 shadow-lg shadow-purple-400/80 border border-purple-200" />
                  <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-200 shadow-lg shadow-emerald-400/80 border border-emerald-200" />
                </motion.div>
              )}

              {/* Central Mystic Emblem with Official Neko Tarot Logo */}
              <motion.div
                whileHover={settings.effectsEnabled ? { scale: 1.08, rotate: 2 } : { scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`relative z-10 w-28 h-28 sm:w-34 sm:h-34 rounded-full p-2 border-2 flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer group ${
                  settings.theme === 'dark' 
                    ? 'border-purple-400/50 bg-purple-950/70 shadow-purple-900/60 ring-2 ring-purple-400/20' 
                    : 'border-purple-300 bg-white/95 shadow-purple-500/30 ring-2 ring-purple-200/50'
                }`}
                title="Neko Tarot - Vũ trụ & Chiêm tinh"
              >
                {/* Glowing Aura backdrop */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-purple-600/30 via-amber-400/20 to-indigo-600/30 blur-sm group-hover:blur-md transition-all pointer-events-none" />
                
                {/* Logo Image */}
                <img
                  src="/pwa-192x192.png"
                  alt="Neko Tarot Logo"
                  className={`relative z-10 w-full h-full object-contain rounded-full select-none transition-transform duration-300 ${
                    settings.effectsEnabled ? 'group-hover:scale-105' : ''
                  }`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('pwa-512x512.png')) {
                      target.src = '/pwa-512x512.png';
                    }
                  }}
                />
              </motion.div>

              {/* Orbiting Stars on Diagonal */}
              <motion.div
                animate={settings.effectsEnabled ? { rotate: 360 } : {}}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-3 -right-3 z-20"
              >
                <Star className="w-7 h-7 text-amber-400 fill-amber-400/40 drop-shadow-md" />
              </motion.div>
              <motion.div
                animate={settings.effectsEnabled ? { rotate: -360 } : {}}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-3 -left-3 z-20"
              >
                <Star className="w-7 h-7 text-purple-500 fill-purple-500/30 drop-shadow-md" />
              </motion.div>
            </motion.div>

            {/* Tiêu đề Neko Tarot - Đảm bảo khoảng đệm để không bị cắt đuôi chữ g và hiệu ứng nảy chuẩn iOS 26 */}
            <motion.h1
              initial={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 16 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 26, stiffness: 300 }}
              className={`text-4xl sm:text-5xl md:text-7xl font-serif mt-4 mb-2 tracking-normal leading-[1.25] sm:leading-[1.3] pb-3 md:pb-4 px-2 inline-block bg-clip-text text-transparent transition-all duration-300 font-bold select-none ${
                settings.theme === 'dark' 
                  ? 'bg-gradient-to-b from-white via-purple-100 to-purple-400' 
                  : 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-800 drop-shadow-sm'
              }`}
            >
              Neko Tarot
            </motion.h1>

            <motion.p
              initial={settings.effectsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-base md:text-lg mb-10 max-w-lg font-medium tracking-wide italic transition-colors duration-300 leading-relaxed px-4 ${
                settings.theme === 'dark' ? 'text-purple-200/80' : 'text-slate-800 font-semibold'
              }`}
            >
              &ldquo;Các vì sao dẫn lối, nhưng không trói buộc. Hãy tìm kiếm trí tuệ của vũ trụ bên trong chính bạn.&rdquo;
            </motion.p>

            {requiresAuth && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border text-xs shadow-lg backdrop-blur-md ${
                  settings.theme === 'dark'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-amber-500/5'
                    : 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-500/10'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Chế độ thành viên: Cần đăng nhập để trải bài & xem quẻ</span>
                <button
                  onClick={openAuthModal}
                  className="ml-2 px-3 py-1 rounded-full bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                >
                  Đăng nhập
                </button>
              </motion.div>
            )}

            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto px-4 justify-center items-center"
            >
              {(systemSettings.enabledDeckTypes?.[DeckType.TAROT] ?? true) && (
                <motion.div
                  variants={formItemVariants}
                  whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 15 } }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChooseDeck(DeckType.TAROT)}
                  className="cursor-pointer"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="sm"
                    shadowIntensity="lg"
                    glowIntensity="md"
                    className="bg-gradient-to-r from-purple-600/70 via-indigo-600/60 to-purple-700/70 text-white ring-1 ring-white/30 cursor-pointer shadow-purple-900/30"
                    contentClassName="px-7 sm:px-9 py-3.5 sm:py-4 font-bold tracking-wider uppercase flex items-center justify-center text-xs sm:text-sm text-white"
                  >
                    {requiresAuth ? <Lock className="mr-2 w-4 h-4 text-amber-300" /> : null}
                    Bói Bài Tarot <Sparkles className="ml-2 w-4 h-4 text-amber-300 animate-pulse" />
                  </LiquidGlassCard>
                </motion.div>
              )}

              {(systemSettings.enabledDeckTypes?.[DeckType.PLAYING_CARDS] ?? true) && (
                <motion.div
                  variants={formItemVariants}
                  whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 15 } }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChooseDeck(DeckType.PLAYING_CARDS)}
                  className="cursor-pointer"
                >
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="md"
                    borderIntensity="sm"
                    shadowIntensity="lg"
                    glowIntensity="md"
                    className="bg-gradient-to-r from-blue-600/70 via-indigo-600/60 to-cyan-700/70 text-white ring-1 ring-white/30 cursor-pointer shadow-blue-900/30"
                    contentClassName="px-7 sm:px-9 py-3.5 sm:py-4 font-bold tracking-wider uppercase flex items-center justify-center text-xs sm:text-sm text-white"
                  >
                    {requiresAuth ? <Lock className="mr-2 w-4 h-4 text-amber-300" /> : null}
                    Bói Bài Tây <Star className="ml-2 w-4 h-4 text-amber-300" />
                  </LiquidGlassCard>
                </motion.div>
              )}

              {/* Bói Tử Vi Button */}
              <motion.div
                variants={formItemVariants}
                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 15 } }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (requiresAuth) {
                    openAuthModal();
                    return;
                  }
                  onStartTuVi(userInfo);
                }}
                className="cursor-pointer"
              >
                <LiquidGlassCard
                  borderRadius="9999px"
                  blurIntensity="md"
                  borderIntensity="sm"
                  shadowIntensity="lg"
                  glowIntensity="md"
                  className="bg-gradient-to-r from-amber-600/70 via-red-600/60 to-purple-700/70 text-white ring-1 ring-amber-300/40 cursor-pointer shadow-amber-900/30"
                  contentClassName="px-7 sm:px-9 py-3.5 sm:py-4 font-bold tracking-wider uppercase flex items-center justify-center text-xs sm:text-sm text-white"
                >
                  {requiresAuth ? <Lock className="mr-2 w-4 h-4 text-amber-300" /> : null}
                  Bói Tử Vi <Compass className="ml-2 w-4 h-4 text-amber-200 animate-spin-slow" />
                </LiquidGlassCard>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -18 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-xl"
          >
            <LiquidGlassCard
              blurIntensity="xl"
              borderIntensity="sm"
              shadowIntensity="xl"
              className="w-full p-6 sm:p-9 rounded-3xl relative overflow-hidden transition-all duration-300 shadow-2xl"
            >
              {/* Subtle ambient lighting inside card */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

              <motion.div
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10"
              >
                {/* Header */}
                <motion.div variants={formItemVariants} className="flex items-center justify-between mb-7">
                  <div className="text-left">
                    <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${
                      settings.theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      Thông tin của bạn
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1 ${
                      settings.theme === 'dark' ? 'text-purple-300/80' : 'text-purple-900/80'
                    }`}>
                      Kết nối năng lượng cá nhân với quẻ bài huyền bí
                    </p>
                  </div>
                  <LiquidGlassCard
                    borderRadius="9999px"
                    blurIntensity="sm"
                    borderIntensity="xs"
                    shadowIntensity="xs"
                    contentClassName={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-bold shrink-0 flex items-center gap-1.5 ${
                      settings.theme === 'dark'
                        ? 'text-purple-200'
                        : 'text-purple-900'
                    }`}
                  >
                    {deckType === DeckType.TAROT ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bài Tarot</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bài Tây</span>
                      </>
                    )}
                  </LiquidGlassCard>
                </motion.div>

                {/* Form fields */}
                <div className="space-y-4 text-left">
                  {/* Row 1: Full name & Gender */}
                  <motion.div variants={formItemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={`text-xs uppercase tracking-wider flex items-center font-bold ${
                        settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'
                      }`}>
                        <User className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Họ và tên
                      </label>
                      <input
                        type="text"
                        value={userInfo.fullName}
                        onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                        placeholder="Nhập họ tên của bạn..."
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all outline-none border backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/40 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/60 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider flex items-center font-bold ${
                        settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'
                      }`}>
                        Giới tính
                      </label>
                      <div className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border backdrop-blur-md ${
                        settings.theme === 'dark'
                          ? 'bg-white/[0.05] border-purple-500/30'
                          : 'bg-white/40 border-purple-200'
                      }`}>
                        {['Nam', 'Nữ', 'Khác'].map((g) => {
                          const isSelected = (userInfo.gender || 'Nam') === g;
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setUserInfo({ ...userInfo, gender: g })}
                              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                                  : settings.theme === 'dark'
                                  ? 'text-purple-300/70 hover:text-white hover:bg-white/10'
                                  : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-100/60'
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Row 2: Birth date & Birth time */}
                  <motion.div variants={formItemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider flex items-center justify-between font-bold ${
                        settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" /> Ngày tháng năm sinh
                        </span>
                        <span className="text-[11px] font-normal opacity-60">dd/mm/yyyy</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={userInfo.birthDate || ''}
                        onChange={(e) => handleBirthDateChange(e.target.value)}
                        placeholder="dd/mm/yyyy (vd: 15/09/1998)"
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all outline-none border font-mono backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/40 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/60 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs uppercase tracking-wider flex items-center justify-between font-bold ${
                        settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" /> Giờ sinh 24h
                        </span>
                        <span className="text-[11px] font-normal opacity-60">Tùy chọn</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={userInfo.birthTime || ''}
                        onChange={(e) => handleBirthTimeChange(e.target.value)}
                        placeholder="hh:mm (vd: 14:30 hoặc 08:15)"
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all outline-none border font-mono backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/40 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/60 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* Row 3: Question / Need */}
                  <motion.div variants={formItemVariants} className="space-y-1.5">
                    <label className={`text-xs uppercase tracking-wider flex items-center justify-between font-bold ${
                      settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Nhu cầu / Câu hỏi
                      </span>
                      <span className="text-[11px] font-normal opacity-60">Tùy chọn</span>
                    </label>
                    <textarea
                      value={userInfo.request}
                      onChange={(e) => setUserInfo({ ...userInfo, request: e.target.value })}
                      placeholder="Bạn muốn vũ trụ giải đáp điều gì? (vd: Định hướng công việc sắp tới, tình cảm...)"
                      rows={3}
                      className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all outline-none border resize-none backdrop-blur-md ${
                        settings.theme === 'dark'
                          ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/40 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/60 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                      }`}
                    />
                  </motion.div>

                  {/* Row 4: Action buttons */}
                  <motion.div variants={formItemVariants} className="pt-2 flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02, x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBack}
                      className="flex-1 cursor-pointer"
                    >
                      <LiquidGlassCard
                        borderRadius="16px"
                        blurIntensity="md"
                        borderIntensity="xs"
                        shadowIntensity="xs"
                        className="cursor-pointer"
                        contentClassName={`py-3.5 text-center font-semibold text-sm ${
                          settings.theme === 'dark' ? 'text-purple-200' : 'text-purple-900'
                        }`}
                      >
                        Quay lại
                      </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!userInfo.fullName.trim() || !isBirthValid) return;
                        handleStart();
                      }}
                      className={`flex-[2] ${(!userInfo.fullName.trim() || !isBirthValid) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                    >
                      <LiquidGlassCard
                        borderRadius="16px"
                        blurIntensity="md"
                        borderIntensity="sm"
                        shadowIntensity="md"
                        className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-xl shadow-purple-900/20 cursor-pointer"
                        contentClassName="py-3.5 px-6 font-bold flex items-center justify-center gap-2 text-sm sm:text-base text-white"
                      >
                        {requiresAuth ? (
                          <>
                            <Lock className="w-4 h-4 text-amber-300" />
                            <span>Đăng nhập để xem bài</span>
                          </>
                        ) : (
                          <>
                            <span>Bắt đầu xem bài</span>
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </LiquidGlassCard>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 2 }}
        className={`mt-12 text-xs tracking-[0.3em] uppercase font-bold transition-colors duration-300 ${
          settings.theme === 'dark' ? 'text-purple-400/40' : 'text-purple-900/40'
        }`}
      >
        Chạm để khám phá điều chưa biết
      </motion.div>
    </div>
  );
};

export default HomeScreen;
