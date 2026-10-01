import React, { useState } from 'react';
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
  ZapOff, 
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

export interface AppSidebarProps {
  currentView: 'home' | 'reading' | 'tuvi' | 'admin';
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onNavigateHome: () => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  readingsCount: number;
  onToast: (msg: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive: boolean;
  badge?: number;
  isAdminOnly?: boolean;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 24,
  mass: 0.75,
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  isMobileOpen,
  onMobileClose,
  onNavigateHome,
  onOpenGuide,
  onOpenHistory,
  onOpenAdmin,
  onOpenSettings,
  readingsCount,
  onToast,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { settings, toggleEffects, toggleTheme } = useSettings();
  const { currentUser, openAuthModal, logout, isAdmin } = useAuth();
  const isDark = settings.theme === 'dark';

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Trang Chủ',
      desc: 'Bói bài & Chiêm tinh',
      icon: Home,
      action: onNavigateHome,
      isActive: currentView === 'home',
    },
    {
      id: 'history',
      label: 'Lịch Sử Quẻ',
      desc: 'Các quẻ bài đã gieo',
      icon: History,
      action: onOpenHistory,
      badge: readingsCount > 0 ? readingsCount : undefined,
      isActive: false,
    },
    {
      id: 'guide',
      label: 'Cẩm Nang',
      desc: 'Hướng dẫn luận giải',
      icon: BookOpen,
      action: onOpenGuide,
      isActive: false,
    },
    {
      id: 'settings',
      label: 'Cài Đặt AI',
      desc: 'Mô hình & Quản lý API',
      icon: Settings,
      action: onOpenSettings,
      isActive: false,
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Quản Trị',
      desc: 'Bảng điều khiển hệ thống',
      icon: ShieldCheck,
      action: onOpenAdmin,
      isActive: currentView === 'admin',
      isAdminOnly: true,
    });
  }

  // Sidebar navigation content used by both Desktop and Mobile
  const renderNavLinks = (isCompact = false, onSelect?: () => void) => (
    <nav className="space-y-1.5 w-full">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const active = item.isActive;

        return (
          <motion.button
            key={item.id}
            layout
            transition={springTransition}
            whileHover={settings.effectsEnabled ? { x: isCompact ? 0 : 3, scale: 1.02 } : {}}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              item.action();
              if (onSelect) onSelect();
            }}
            title={item.label}
            className={`w-full group relative flex items-center rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
              isCompact ? 'justify-center p-2.5 h-11' : 'px-3.5 py-2.5 justify-between min-h-[46px]'
            } ${
              active
                ? isDark
                  ? 'bg-gradient-to-r from-purple-600/35 via-indigo-600/25 to-purple-600/15 border border-purple-400/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-purple-100/90 border border-purple-300 text-purple-950 font-bold shadow-sm'
                : isDark
                ? 'text-purple-200/80 hover:text-white hover:bg-white/5 border border-transparent'
                : 'text-slate-700 hover:text-purple-950 hover:bg-purple-50/80 border border-transparent'
            }`}
          >
            {/* Active glowing indicator pill */}
            {active && (
              <motion.div
                layoutId="activeSidebarIndicator"
                transition={springTransition}
                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-amber-300 to-purple-400"
              />
            )}

            <motion.div layout="position" transition={springTransition} className={`flex items-center ${isCompact ? 'justify-center' : 'space-x-3 min-w-0'}`}>
              <motion.div
                layout="position"
                transition={springTransition}
                className={`p-1.5 rounded-xl transition-all duration-200 shrink-0 ${
                  active
                    ? isDark
                      ? 'bg-purple-500/30 text-amber-300 shadow-sm'
                      : 'bg-purple-200 text-purple-900'
                    : isDark
                    ? 'bg-white/5 text-purple-300 group-hover:bg-purple-600/25 group-hover:text-amber-300'
                    : 'bg-purple-100/70 text-purple-700 group-hover:bg-purple-200 group-hover:text-purple-900'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              </motion.div>

              <AnimatePresence initial={false}>
                {!isCompact && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -8, width: 0 }}
                    transition={springTransition}
                    className="text-left min-w-0 truncate overflow-hidden whitespace-nowrap"
                  >
                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.isAdminOnly && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] truncate ${isDark ? 'text-purple-300/60' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right badge or chevron */}
            <AnimatePresence initial={false}>
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={springTransition}
                  className="flex items-center gap-1.5 shrink-0 ml-1"
                >
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold shadow-sm shadow-purple-900/50">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 ${
                    active ? 'text-amber-300' : isDark ? 'text-purple-400/40 group-hover:text-purple-300' : 'text-slate-400'
                  }`} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for compact desktop mode */}
            {isCompact && item.badge !== undefined && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[9px] font-bold shadow-sm">
                {item.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );

  // Quick settings switches (Effects & Theme)
  const renderQuickToggles = (isCompact = false) => {
    if (isCompact) {
      return (
        <div className="flex flex-col items-center space-y-2 pt-2 border-t border-white/10 w-full">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const next = !settings.effectsEnabled;
              toggleEffects();
              onToast(next ? 'Đã bật hiệu ứng vũ trụ ✨' : 'Đã tắt hiệu ứng (Mượt nhẹ)');
            }}
            title={settings.effectsEnabled ? 'Hiệu ứng: Đang Bật' : 'Hiệu ứng: Đang Tắt'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              settings.effectsEnabled
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            {settings.effectsEnabled ? <Sparkles className="w-4 h-4 animate-pulse" /> : <ZapOff className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            title={isDark ? 'Giao diện: Tối (Bấm đổi Sáng)' : 'Giao diện: Sáng (Bấm đổi Tối)'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-purple-950/60 border-purple-500/30 text-purple-300'
                : 'bg-amber-100 border-amber-300 text-amber-800'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </motion.button>
        </div>
      );
    }

    return (
      <div className={`p-3 rounded-2xl border space-y-2.5 transition-colors ${
        isDark ? 'bg-black/40 border-white/10' : 'bg-purple-50/70 border-purple-200/70'
      }`}>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2">
            {settings.effectsEnabled ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <ZapOff className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={`font-semibold ${isDark ? 'text-purple-200' : 'text-slate-700'}`}>
              Hiệu ứng vũ trụ
            </span>
          </div>
          <button
            onClick={() => {
              const next = !settings.effectsEnabled;
              toggleEffects();
              onToast(next ? 'Đã bật hiệu ứng vũ trụ ✨' : 'Đã tắt hiệu ứng (Mượt nhẹ)');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              settings.effectsEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-white/10 text-gray-400 border border-white/10'
            }`}
          >
            {settings.effectsEnabled ? 'BẬT ✨' : 'TẮT ⚡'}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
          <div className="flex items-center space-x-2">
            {isDark ? <Moon className="w-3.5 h-3.5 text-purple-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className={`font-semibold ${isDark ? 'text-purple-200' : 'text-slate-700'}`}>
              Giao diện
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
              isDark
                ? 'bg-purple-900/30 text-purple-200 border-purple-500/30 hover:bg-purple-900/50'
                : 'bg-white text-purple-900 border-purple-200 shadow-sm hover:bg-purple-50'
            }`}
          >
            {isDark ? 'Tối 🌙' : 'Sáng ☀️'}
          </button>
        </div>
      </div>
    );
  };

  // User profile / login card
  const renderUserCard = (isCompact = false, onSelect?: () => void) => {
    if (isCompact) {
      return (
        <div className="pt-2 border-t border-white/10 flex justify-center w-full">
          {currentUser ? (
            <div className="relative group cursor-pointer" onClick={() => currentUser && logout()} title={`${currentUser.displayName || 'Tài khoản'} (Bấm để đăng xuất)`}>
              <div className="w-9 h-9 rounded-full border border-purple-400/50 p-0.5 bg-purple-600/30 overflow-hidden flex items-center justify-center">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4 text-purple-300" />
                )}
              </div>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                openAuthModal();
                if (onSelect) onSelect();
              }}
              title="Đăng nhập tài khoản"
              className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer shadow-md"
            >
              <LogIn className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      );
    }

    return (
      <div className={`p-3 rounded-2xl border transition-colors ${
        isDark ? 'bg-purple-950/30 border-white/10' : 'bg-purple-50/80 border-purple-200/80'
      }`}>
        {currentUser ? (
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full border border-amber-400/50 p-0.5 bg-purple-600/30 overflow-hidden shrink-0 shadow-sm">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4 text-purple-300 mx-auto mt-2" />
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="truncate">{currentUser.displayName || 'Thành viên'}</span>
                  {currentUser.isAdmin && (
                    <span className="text-[9px] px-1 rounded font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      Admin
                    </span>
                  )}
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-purple-300/70' : 'text-slate-500'}`}>
                  {currentUser.email || 'Đã xác thực'}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 border border-red-500/25 transition-all text-xs font-semibold shrink-0 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Khách vãng lai
              </div>
              <div className={`text-[10px] truncate ${isDark ? 'text-purple-300/70' : 'text-slate-500'}`}>
                Đăng nhập lưu lịch sử
              </div>
            </div>

            <button
              onClick={() => {
                openAuthModal();
                if (onSelect) onSelect();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP PERMANENT SIDEBAR (Visible on screens >= 1024px) */}
      {/* ============================================================ */}
      <motion.aside
        layout
        transition={springTransition}
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-40 flex-col justify-between select-none border-r ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isDark
            ? 'bg-[#0b0518]/90 text-white border-purple-500/20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl'
            : 'bg-white/92 text-slate-800 border-purple-200/60 shadow-[4px_0_24px_rgba(147,51,234,0.06)] backdrop-blur-2xl'
        }`}
      >
        {/* Brand Header & Collapse Toggle */}
        <motion.div
          layout="position"
          transition={springTransition}
          className={`p-4 border-b flex items-center justify-between relative transition-colors ${
            isDark ? 'border-white/10 bg-gradient-to-b from-purple-950/40 to-transparent' : 'border-purple-100 bg-purple-50/40'
          }`}
        >
          <div
            className={`flex items-center space-x-3 cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
            onClick={onNavigateHome}
            title="Trang chủ Neko Tarot"
          >
            <motion.div
              layout="position"
              transition={springTransition}
              className="w-9 h-9 rounded-full border border-purple-400/40 p-0.5 bg-purple-500/20 shadow-md flex items-center justify-center shrink-0"
            >
              <img
                src="/pwa-192x192.png"
                alt="Neko Tarot"
                className="w-full h-full object-contain rounded-full"
              />
            </motion.div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={springTransition}
                  className="min-w-0 overflow-hidden whitespace-nowrap"
                >
                  <h2 className="font-serif text-sm font-bold text-amber-300 tracking-wider flex items-center gap-1.5 uppercase leading-tight">
                    <span>Neko Tarot</span>
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                  </h2>
                  <p className={`text-[10px] truncate ${isDark ? 'text-purple-300/80' : 'text-purple-700/80'}`}>
                    Chiêm tinh & Trí tuệ AI
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleCollapse}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-purple-300 hover:text-white'
                    : 'bg-purple-100/60 hover:bg-purple-200 border-purple-200 text-purple-800'
                }`}
                title="Thu nhỏ Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation list */}
        <motion.div
          layout="position"
          transition={springTransition}
          className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar"
        >
          {renderNavLinks(isCollapsed)}
        </motion.div>

        {/* Quick Toggles & User Banner */}
        <motion.div
          layout="position"
          transition={springTransition}
          className={`p-3 space-y-3 border-t transition-colors ${
            isDark ? 'border-white/10 bg-black/20' : 'border-purple-100 bg-purple-50/30'
          }`}
        >
          {renderQuickToggles(isCollapsed)}
          {renderUserCard(isCollapsed)}

          {/* Expand button when collapsed */}
          <AnimatePresence initial={false}>
            {isCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleCollapse}
                className={`w-full py-1.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-purple-300 hover:text-white'
                    : 'bg-purple-100/60 hover:bg-purple-200 border-purple-200 text-purple-800'
                }`}
                title="Mở rộng Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.aside>

      {/* ============================================================ */}
      {/* 2. MOBILE SLIDE-OUT DRAWER (< 1024px)                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md cursor-pointer lg:hidden"
            />

            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className={`fixed top-0 left-0 bottom-0 z-50 w-[84vw] max-w-xs flex flex-col justify-between shadow-2xl border-r overflow-y-auto select-none lg:hidden ${
                isDark
                  ? 'bg-[#0c051a]/95 text-white border-purple-500/30 shadow-purple-950/80 backdrop-blur-2xl'
                  : 'bg-white/95 text-slate-800 border-purple-200/80 shadow-black/30 backdrop-blur-2xl'
              }`}
            >
              {/* Mobile Drawer Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'border-white/10 bg-purple-950/40' : 'border-purple-100 bg-purple-50'
              }`}>
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => {
                    onNavigateHome();
                    onMobileClose();
                  }}
                >
                  <div className="w-9 h-9 rounded-full border border-purple-400/50 p-0.5 bg-purple-500/20 shadow-md flex items-center justify-center shrink-0">
                    <img
                      src="/pwa-192x192.png"
                      alt="Neko Tarot"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="font-serif text-sm font-bold text-amber-300 tracking-wider flex items-center gap-1.5 uppercase">
                      <span>Neko Tarot</span>
                      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    </h2>
                    <p className={`text-[10px] ${isDark ? 'text-purple-300/80' : 'text-purple-700/80'}`}>
                      Chiêm tinh & Trí tuệ AI
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onMobileClose}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 border-white/10 text-gray-300 hover:text-white'
                      : 'bg-purple-100 hover:bg-purple-200 border-purple-200 text-purple-900'
                  }`}
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Mobile Nav links */}
              <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
                {renderNavLinks(false, onMobileClose)}
              </div>

              {/* Mobile Quick Toggles & User card */}
              <div className={`p-3.5 space-y-3 border-t ${
                isDark ? 'border-white/10 bg-black/40' : 'border-purple-100 bg-purple-50/60'
              }`}>
                {renderQuickToggles(false)}
                {renderUserCard(false, onMobileClose)}

                <div className={`text-center text-[10px] pt-1 ${
                  isDark ? 'text-purple-300/50' : 'text-slate-400'
                }`}>
                  ✨ Neko Tarot • Các vì sao dẫn lối ✨
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppSidebar;
