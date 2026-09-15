import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CosmicBackground from './components/CosmicBackground';
import HomeScreen from './components/HomeScreen';
import ReadingScreen from './components/ReadingScreen';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import { AdminPage } from './components/AdminPage';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { LiquidGlassCapsule } from './components/LiquidGlassCapsule';
import { LiquidGlassFilter } from './components/LiquidGlassFilter';
import { Sparkles, Settings, History, LogIn, LogOut, User as UserIcon, ShieldCheck, Bell, Lock } from 'lucide-react';
import { DeckType, UserInfo, ReadingResult } from './types';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [view, setView] = useState<'home' | 'reading' | 'admin'>('home');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [deckType, setDeckType] = useState<DeckType>(DeckType.TAROT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<ReadingResult | null>(null);

  const { settings } = useSettings();
  const { currentUser, openAuthModal, logout, readings, isAdmin, openAdminModal, systemSettings } = useAuth();

  const handleStart = (info: UserInfo, type: DeckType) => {
    if (!systemSettings.enableGuestReadings && !currentUser) {
      openAuthModal();
      return;
    }
    setSelectedReading(null);
    setUserInfo(info);
    setDeckType(type);
    setView('reading');
  };

  const handleSelectHistoricalReading = (reading: ReadingResult) => {
    setSelectedReading(reading);
    setUserInfo(reading.userInfo);
    setDeckType(reading.deckType);
    setView('reading');
  };

  return (
    <div className={`relative min-h-screen selection:bg-purple-500/30 transition-colors duration-300 ${
      settings.theme === 'dark' ? 'bg-[#05020a] text-white' : 'bg-[#faf5ff] text-slate-900'
    }`}>
      <LiquidGlassFilter />
      {/* CosmicBackground always rendered — backdrop-filter needs painted content behind glass elements */}
      <CosmicBackground />
      
      {/* Fixed Top Header (Liquid Glass Floating Capsule) */}
      {view !== 'admin' && (
        <header className="fixed top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 z-40 max-w-7xl mx-auto pointer-events-none">
          <div className="pointer-events-auto">
            {/* Cosmic Announcement Banner (Configured by Admin) */}
            {systemSettings.announcementActive && systemSettings.announcement && (
              <AnnouncementBanner text={systemSettings.announcement} />
            )}

            {/* Liquid Glass Navbar */}
            <LiquidGlassCapsule
              variant="bar"
              className={`transition-all duration-300 ${
                settings.theme === 'dark' ? 'text-white' : 'text-purple-950 shadow-purple-900/10'
              }`}
              contentClassName="px-3 sm:px-6 py-2 sm:py-2.5 flex justify-between items-center w-full min-w-0"
            >
              {/* Glossy Sheen Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-80" />

              {/* Brand */}
              <div 
                className="flex items-center cursor-pointer group shrink-0 mr-1 sm:mr-3 relative z-10"
                onClick={() => {
                  setSelectedReading(null);
                  setView('home');
                }}
                title="Về trang chủ Thiên Không"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ${
                  settings.theme === 'dark' 
                    ? 'border-white/30 bg-purple-500/20 group-hover:bg-purple-500/30 group-hover:border-purple-300' 
                    : 'border-purple-300/80 bg-purple-100/60 group-hover:bg-purple-200/80 group-hover:border-purple-400'
                }`}>
                  <Sparkles className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${settings.theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`} />
                </div>
                <span className={`hidden min-[480px]:inline ml-2.5 text-base sm:text-lg font-serif tracking-wider uppercase whitespace-nowrap transition-colors font-extrabold ${
                  settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'
                }`}>
                  Thiên Không
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 relative z-10">
                {/* Admin Dashboard Button (Only for admin) */}
                {isAdmin && (
                  <motion.button
                    whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                    whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                    onClick={() => setView('admin')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 cursor-pointer transition-all ${
                      !settings.effectsEnabled
                        ? (settings.theme === 'dark'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-sm shadow-amber-100/50')
                        : `liquid-glass-pill ${settings.theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`
                    }`}
                    title="Mở Trang Quản Trị Hệ Thống"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                    <span className="hidden sm:inline">Quản Trị</span>
                  </motion.button>
                )}

                {/* History Button */}
                <motion.button
                  whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                  whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                  onClick={() => setIsHistoryOpen(true)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 cursor-pointer transition-all ${
                    !settings.effectsEnabled
                      ? (settings.theme === 'dark'
                          ? 'bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-100'
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 shadow-sm shadow-purple-100/50')
                      : `liquid-glass-pill ${settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'}`
                  }`}
                  title="Xem lịch sử các quẻ bài đã hỏi"
                >
                  <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="hidden md:inline">Lịch sử</span>
                  {readings.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-600/90 text-white text-[10px] font-bold shrink-0 shadow-sm">
                      {readings.length}
                    </span>
                  )}
                </motion.button>

                {/* User / Login Button */}
                {currentUser ? (
                  <div className="flex items-center space-x-1 shrink-0">
                    <div
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                        !settings.effectsEnabled
                          ? (settings.theme === 'dark'
                              ? 'bg-purple-950/60 border border-purple-500/30 text-purple-100'
                              : 'bg-purple-100 text-purple-950 border border-purple-300 shadow-sm')
                          : `liquid-glass-pill ${settings.theme === 'dark' ? 'text-purple-100' : 'text-purple-950'}`
                      }`}
                      title={currentUser.displayName || currentUser.email || 'Tài khoản'}
                    >
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover shrink-0 border border-white/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      )}
                      <span className="hidden sm:inline max-w-[80px] md:max-w-[120px] truncate font-semibold">
                        {currentUser.displayName || 'Tài khoản'}
                      </span>
                      {currentUser.isAdmin && (
                        <span className="hidden md:inline text-[9px] bg-amber-400/20 text-amber-800 border border-amber-400/30 px-1.5 py-0.2 rounded font-bold uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                      whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                      onClick={logout}
                      className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                    whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                    onClick={openAuthModal}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 cursor-pointer transition-all ${
                      !settings.effectsEnabled
                        ? (settings.theme === 'dark'
                            ? 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-500 shadow-md'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200')
                        : `liquid-glass-pill ${settings.theme === 'dark' ? 'text-white bg-purple-600/80 hover:bg-purple-600' : 'text-purple-950 bg-purple-100/60 hover:bg-purple-200/80'}`
                    }`}
                    title="Đăng nhập để lưu lịch sử đám mây"
                  >
                    <LogIn className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden xs:inline">Đăng nhập</span>
                  </motion.button>
                )}

                {/* Settings Button */}
                <motion.button 
                  whileTap={settings.effectsEnabled ? { scale: 0.88, rotate: -1.5, transition: { type: "spring", stiffness: 450, damping: 10 } } : { scale: 0.94 }}
                  whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
                  onClick={() => setIsSettingsOpen(true)}
                  className={`p-2 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                    !settings.effectsEnabled
                      ? (settings.theme === 'dark'
                          ? 'bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 hover:text-white'
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 shadow-sm shadow-purple-100/50')
                      : `liquid-glass-pill ${settings.theme === 'dark' ? 'text-purple-200 hover:text-white' : 'text-purple-900 hover:text-purple-950'}`
                  }`}
                  title="Cài đặt hệ thống & API"
                >
                  <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-600 dark:text-purple-300" />
                </motion.button>
              </div>
            </LiquidGlassCapsule>
          </div>
        </header>
      )}

      <main className="relative">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
            >
              <HomeScreen onStart={handleStart} />
            </motion.div>
          )}

          {view === 'reading' && (userInfo || selectedReading) && (
            <motion.div
              key={selectedReading ? selectedReading.id : 'reading'}
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
            >
              <ReadingScreen 
                userInfo={userInfo || selectedReading!.userInfo} 
                deckType={deckType}
                initialReading={selectedReading}
                onReset={() => {
                  setSelectedReading(null);
                  setView('home');
                }}
              />
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
            >
              <AdminPage onBack={() => setView('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
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
            onOpenAdminPage={() => {
              setIsSettingsOpen(false);
              setView('admin');
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      {view !== 'admin' && (
        <footer className={`relative z-10 py-10 text-center text-[10px] uppercase tracking-[0.4em] transition-colors flex flex-col items-center justify-center gap-1.5 ${settings.theme === 'dark' ? 'text-purple-400/40' : 'text-purple-900/50 font-medium'}`}>
          <div>&copy; 2026 Celestial Tarot &bull; Dẫn lối bởi Vũ trụ</div>
        </footer>
      )}
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
