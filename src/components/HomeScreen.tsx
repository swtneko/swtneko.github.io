import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, Star, Sun, User, Calendar, MessageSquare, ChevronRight, Lock, Clock } from 'lucide-react';
import { DeckType, UserInfo } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { LiquidGlassCapsule } from './LiquidGlassCapsule';

interface HomeScreenProps {
  onStart: (userInfo: UserInfo, deckType: DeckType) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [deckType, setDeckType] = useState<DeckType>(DeckType.TAROT);
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

              {/* Central Mystic Emblem */}
              <div className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 border-2 rounded-full flex items-center justify-center transition-colors duration-300 shadow-2xl ${
                settings.theme === 'dark' 
                  ? 'border-purple-400/40 bg-purple-950/40 shadow-purple-900/40' 
                  : 'border-purple-300 bg-white/95 shadow-purple-500/20'
              }`}>
                {settings.theme === 'dark' ? (
                  <Moon className={`w-14 h-14 text-purple-200 ${settings.effectsEnabled ? 'animate-bounce' : ''}`} />
                ) : (
                  <Sparkles className={`w-14 h-14 text-purple-600 ${settings.effectsEnabled ? 'animate-pulse' : ''}`} />
                )}
              </div>

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

            {/* Tiêu đề Tarot Thiên Không - Lùi xuống dưới một cách tự nhiên */}
            <motion.h1
              initial={settings.effectsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={`text-4xl sm:text-5xl md:text-7xl font-serif mt-4 mb-4 tracking-tight bg-clip-text text-transparent transition-all duration-300 font-bold ${
                settings.theme === 'dark' 
                  ? 'bg-gradient-to-b from-white via-purple-200 to-purple-400' 
                  : 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-800 drop-shadow-sm'
              }`}
            >
              Tarot Thiên Không
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
              initial={settings.effectsEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 justify-center"
            >
              {(systemSettings.enabledDeckTypes?.[DeckType.TAROT] ?? true) && (
                <motion.button
                  whileHover={settings.effectsEnabled ? { scale: 1.03 } : {}}
                  whileTap={settings.effectsEnabled ? { scale: 0.97 } : {}}
                  onClick={() => handleChooseDeck(DeckType.TAROT)}
                  className={`px-8 sm:px-12 py-4 rounded-full font-bold tracking-widest uppercase transition-all flex items-center justify-center cursor-pointer text-sm sm:text-base shadow-xl ${
                    !settings.effectsEnabled
                      ? (settings.theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 border border-purple-500 text-white'
                          : 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white border border-purple-800 shadow-2xl shadow-purple-950/40 hover:from-purple-900 hover:to-indigo-900')
                      : `liquid-glass-pill border border-purple-300/40 shadow-purple-500/20 ${settings.theme === 'dark' ? 'text-white' : 'text-purple-950'}`
                  }`}
                >
                  {requiresAuth ? <Lock className="mr-2 w-4 h-4 text-amber-300" /> : null}
                  Bói Bài Tarot <Sparkles className="ml-2 w-5 h-5 text-amber-300" />
                </motion.button>
              )}

              {(systemSettings.enabledDeckTypes?.[DeckType.PLAYING_CARDS] ?? true) && (
                <motion.button
                  whileHover={settings.effectsEnabled ? { scale: 1.03 } : {}}
                  whileTap={settings.effectsEnabled ? { scale: 0.97 } : {}}
                  onClick={() => handleChooseDeck(DeckType.PLAYING_CARDS)}
                  className={`px-8 sm:px-12 py-4 rounded-full font-bold tracking-widest uppercase transition-all flex items-center justify-center cursor-pointer text-sm sm:text-base shadow-xl ${
                    !settings.effectsEnabled
                      ? (settings.theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 border border-purple-500 text-white'
                          : 'bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white border border-purple-800 shadow-2xl shadow-purple-950/40 hover:from-purple-800 hover:to-indigo-800')
                      : `liquid-glass-pill border border-white/30 shadow-indigo-500/20 ${settings.theme === 'dark' ? 'text-white' : 'text-purple-950'}`
                  }`}
                >
                  {requiresAuth ? <Lock className="mr-2 w-4 h-4 text-amber-300" /> : null}
                  Bói Bài Tây <Star className="ml-2 w-5 h-5 text-amber-300" />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg"
          >
            <LiquidGlassCapsule
              variant="card"
              className={`w-full transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'text-purple-100' 
                  : 'text-purple-950 shadow-purple-900/10'
              }`}
              contentClassName="p-6 sm:p-10"
            >
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl sm:text-3xl font-serif font-bold transition-colors duration-300 ${
                settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'
              }`}>
                Thông tin của bạn
              </h2>
              <div className={`px-3.5 py-1 rounded-full border text-[11px] uppercase tracking-widest font-bold transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' 
                  : 'bg-purple-100 border-purple-200 text-purple-900'
              }`}>
                {deckType === DeckType.TAROT ? 'Bài Tarot' : 'Bài Tây'}
              </div>
            </div>

            <div className="space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={`text-xs uppercase tracking-[0.15em] ml-1 flex items-center font-bold transition-colors duration-300 ${
                    settings.theme === 'dark' ? 'text-purple-300/70' : 'text-purple-900'
                  }`}>
                    <User className="w-3.5 h-3.5 mr-2 text-purple-500" /> Họ và tên
                  </label>
                  <input
                    type="text"
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                    placeholder="Nhập họ tên của bạn..."
                    className={`w-full rounded-2xl px-4 sm:px-5 py-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium liquid-glass-input ${
                      settings.theme === 'dark'
                        ? 'text-purple-100 placeholder:text-purple-400/50 focus:border-purple-300'
                        : 'text-slate-900 placeholder:text-slate-500 focus:border-purple-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs uppercase tracking-[0.15em] ml-1 flex items-center font-bold transition-colors duration-300 ${
                    settings.theme === 'dark' ? 'text-purple-300/70' : 'text-purple-900'
                  }`}>
                    Giới tính
                  </label>
                  <div className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border ${
                    settings.theme === 'dark'
                      ? 'bg-black/40 border-purple-500/20'
                      : 'bg-purple-50/40 border-purple-300 shadow-inner'
                  }`}>
                    {['Nam', 'Nữ', 'Khác'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setUserInfo({ ...userInfo, gender: g })}
                        className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          (userInfo.gender || 'Nam') === g
                            ? 'bg-purple-600 text-white shadow-md'
                            : settings.theme === 'dark'
                            ? 'text-purple-300/70 hover:text-purple-100 hover:bg-white/5'
                            : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-100/50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs uppercase tracking-[0.15em] ml-1 flex items-center font-bold transition-colors duration-300 ${
                    settings.theme === 'dark' ? 'text-purple-300/70' : 'text-purple-900'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 mr-2 text-purple-500" /> Ngày tháng năm sinh
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={userInfo.birthDate || ''}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    placeholder="dd/mm/yyyy (vd: 15/09/1998)"
                    className={`w-full rounded-2xl px-4 sm:px-5 py-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium liquid-glass-input ${
                      settings.theme === 'dark'
                        ? 'text-purple-100 placeholder:text-purple-400/50 focus:border-purple-300'
                        : 'text-slate-900 placeholder:text-slate-500 focus:border-purple-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs uppercase tracking-[0.15em] ml-1 flex items-center font-bold transition-colors duration-300 ${
                    settings.theme === 'dark' ? 'text-purple-300/70' : 'text-purple-900'
                  }`}>
                    <Clock className="w-3.5 h-3.5 mr-2 text-purple-500" /> Giờ sinh 24h (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={userInfo.birthTime || ''}
                    onChange={(e) => handleBirthTimeChange(e.target.value)}
                    placeholder="hh:mm (vd: 14:30 hoặc 08:15)"
                    className={`w-full rounded-2xl px-4 sm:px-5 py-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium liquid-glass-input ${
                      settings.theme === 'dark'
                        ? 'text-purple-100 placeholder:text-purple-400/50 focus:border-purple-300'
                        : 'text-slate-900 placeholder:text-slate-500 focus:border-purple-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs uppercase tracking-[0.15em] ml-1 flex items-center font-bold transition-colors duration-300 ${
                  settings.theme === 'dark' ? 'text-purple-300/70' : 'text-purple-900'
                }`}>
                  <MessageSquare className="w-3.5 h-3.5 mr-2 text-purple-500" /> Nhu cầu / Câu hỏi (Tùy chọn)
                </label>
                <textarea
                  value={userInfo.request}
                  onChange={(e) => setUserInfo({ ...userInfo, request: e.target.value })}
                  placeholder="Bạn muốn vũ trụ giải đáp điều gì?..."
                  rows={3}
                  className={`w-full rounded-2xl px-4 sm:px-5 py-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none font-medium liquid-glass-input ${
                    settings.theme === 'dark'
                      ? 'text-purple-100 placeholder:text-purple-400/50 focus:border-purple-300'
                      : 'text-slate-900 placeholder:text-slate-500 focus:border-purple-600'
                  }`}
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  onClick={() => setStep('welcome')}
                  className={`flex-1 py-3.5 rounded-2xl border font-medium transition-all cursor-pointer text-sm ${
                    settings.theme === 'dark'
                      ? 'border-purple-500/20 text-purple-300 hover:bg-white/5'
                      : 'border-purple-200 text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  Quay lại
                </button>
                <button
                  onClick={handleStart}
                  disabled={!userInfo.fullName.trim() || !isBirthValid}
                  className={`flex-[2] border font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center shadow-md cursor-pointer text-sm sm:text-base ${
                    !settings.effectsEnabled
                      ? (settings.theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white shadow-purple-500/20')
                      : `liquid-glass-pill border-white/40 shadow-purple-500/20 ${settings.theme === 'dark' ? 'text-white' : 'text-purple-950'}`
                  } disabled:opacity-45 disabled:cursor-not-allowed`}
                >
                  {requiresAuth ? (
                    <>
                      <Lock className="mr-2 w-4 h-4 text-amber-300" />
                      Đăng nhập để xem bài
                    </>
                  ) : (
                    <>
                      Bắt đầu xem bài <ChevronRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
            </LiquidGlassCapsule>
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
