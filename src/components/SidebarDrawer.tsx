import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Home, 
  BookOpen, 
  History, 
  Settings, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Zap, 
  ZapOff, 
  Layers, 
  Compass, 
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { DeckType } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateTarot: () => void;
  onNavigateBaiTay: () => void;
  onNavigateTuVi: () => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  onToast: (msg: string) => void;
  readingsCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateHome,
  onNavigateTarot,
  onNavigateBaiTay,
  onNavigateTuVi,
  onOpenGuide,
  onOpenHistory,
  onOpenAdmin,
  onOpenSettings,
  onToast,
  readingsCount,
}) => {
  const { settings, toggleEffects, toggleTheme } = useSettings();
  const { currentUser, openAuthModal, logout, isAdmin } = useAuth();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const isDark = settings.theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Sidebar Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`fixed top-0 right-0 bottom-0 z-50 w-[88vw] max-w-sm flex flex-col justify-between shadow-2xl border-l overflow-y-auto select-none ${
              isDark 
                ? 'bg-[#0f0720]/95 text-white border-purple-500/30 shadow-purple-950/80' 
                : 'bg-slate-900/95 text-purple-100 border-purple-300/30 shadow-black/80'
            }`}
          >
            {/* Top Cosmic Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/50">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleAction(onNavigateHome)}>
                <div className="w-10 h-10 rounded-full border border-purple-400/50 p-0.5 bg-purple-500/20 shadow-md flex items-center justify-center shrink-0">
                  <img
                    src="/pwa-192x192.png"
                    alt="Neko Tarot"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-base font-bold text-amber-200 tracking-wider flex items-center gap-1.5 uppercase">
                    <span>Neko Tarot</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </h2>
                  <p className="text-[10px] text-purple-300/80">Trí tuệ & Diễn giải bài AI</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Đóng menu"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* User Account Banner */}
            <div className="p-4 border-b border-white/10 bg-purple-950/30">
              {currentUser ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-amber-400/50 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                        <span>{currentUser.displayName || 'Thành viên'}</span>
                        {currentUser.isAdmin && (
                          <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-extrabold uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-purple-300/70 truncate">{currentUser.email || 'Đã xác thực'}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 transition-all text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Thoát</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Khách vãng lai</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        Chưa lưu cloud
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-300/70">Đăng nhập để đồng bộ lịch sử quẻ bói</div>
                  </div>

                  <button
                    onClick={() => handleAction(openAuthModal)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng nhập</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu List */}
            <div className="flex-1 p-4 space-y-5 overflow-y-auto">
              {/* 1. Màn Trải Bài */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80 px-2 flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-amber-400" />
                  Chế Độ Trải Bài & Bói Toán
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAction(onNavigateHome)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                        <Home className="w-4 h-4" />
                      </span>
                      <span>Trang Chủ Bói Bài</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleAction(onNavigateTarot)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                        🎴
                      </span>
                      <span>Bói Bài Tarot chuẩn 78 lá</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleAction(onNavigateBaiTay)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform">
                        🃏
                      </span>
                      <span>Bói Bài Tây 52 lá</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleAction(onNavigateTuVi)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                        📜
                      </span>
                      <span>Lập Lá Số Tử Vi Trọn Đời</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>

              {/* 2. Tiện Ích & Công Cụ */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300/80 px-2 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Tiện Ích & Lịch Sử
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAction(onOpenHistory)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                        <History className="w-4 h-4" />
                      </span>
                      <span>Lịch Sử Quẻ Bói</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {readingsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-sm">
                          {readingsCount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleAction(onOpenGuide)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <span>Cẩm Nang Hướng Dẫn</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleAction(onOpenSettings)}
                    className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-400/50 text-left transition-all flex items-center justify-between text-xs font-semibold text-white group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
                        <Settings className="w-4 h-4" />
                      </span>
                      <span>Cài Đặt AI & Mô Hình</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleAction(onOpenAdmin)}
                      className="w-full p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all flex items-center justify-between text-xs font-bold text-amber-200 group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <span>Bảng Quản Trị Hệ Thống</span>
                      </div>
                      <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-extrabold uppercase">
                        Admin
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Settings Toggles */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300/80 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Tùy Chỉnh Nhanh Giao Diện
                </div>

                {/* Effect Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {settings.effectsEnabled ? (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ZapOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-200">Hiệu ứng vũ trụ</span>
                  </div>

                  <button
                    onClick={() => {
                      const next = !settings.effectsEnabled;
                      toggleEffects();
                      onToast(next ? 'Đã bật hiệu ứng vũ trụ ✨' : 'Đã tắt hiệu ứng (Mượt nhẹ)');
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      settings.effectsEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/10 text-gray-400 border border-white/10'
                    }`}
                  >
                    {settings.effectsEnabled ? 'ĐANG BẬT ✨' : 'ĐANG TẮT ⚡'}
                  </button>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div className="flex items-center space-x-2">
                    {isDark ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span className="font-medium text-gray-200">Giao diện (Theme)</span>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 hover:bg-white/20 text-purple-200 border border-white/10 transition-all cursor-pointer"
                  >
                    {isDark ? 'Tối (Dark) 🌙' : 'Sáng (Light) ☀️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="p-4 border-t border-white/10 text-center text-[10px] text-purple-300/50 space-y-1 bg-black/40">
              <div>✨ Neko Tarot • Các vì sao dẫn lối ✨</div>
              <div className="text-[9px] text-gray-500 font-mono">v1.2.0 • AI Studio Celestial</div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
