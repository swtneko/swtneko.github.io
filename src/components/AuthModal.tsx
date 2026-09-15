import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { LiquidGlassCard } from './LiquidGlassCard';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail, signInGuest } = useAuth();
  const { settings } = useSettings();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.');
      } else {
        setError(err?.message || 'Đăng nhập Google thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng. Vui lòng đăng nhập.');
      } else if (code === 'auth/invalid-email') {
        setError('Địa chỉ email không hợp lệ.');
      } else {
        setError(err?.message || 'Thao tác thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGuest();
    } catch (err: any) {
      console.error(err);
      setError('Không thể tiếp tục với tư cách Khách.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
      />

      <motion.div
        initial={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md my-8 z-50 flex flex-col rounded-3xl overflow-hidden"
      >
        <LiquidGlassCard
          className="w-full p-6 md:p-8"
          contentClassName={settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}
        >
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-30"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif">
            {mode === 'signin' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-xs opacity-70 mt-1">
            Lưu trữ lịch sử tất cả quẻ bài, đồng bộ đa thiết bị và tiếp tục hỏi sâu
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className={`w-full py-3 px-4 rounded-2xl border font-bold text-sm flex items-center justify-center space-x-3 transition-all shadow-sm mb-4 ${
            settings.theme === 'dark'
              ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
              : 'border-purple-200 bg-purple-50 hover:bg-purple-100/80 text-purple-950'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-3 text-[11px] opacity-50 uppercase tracking-wider">hoặc qua Email</span>
          <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium mb-1 opacity-80 text-purple-950 dark:text-purple-300">Họ và tên hoặc Biệt danh</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-purple-900 dark:text-white" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Long"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 dark:border-white/10 bg-purple-50/20 dark:bg-black/20 focus:outline-none focus:border-purple-500 text-purple-950 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1 opacity-80 text-purple-950 dark:text-purple-300">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-purple-900 dark:text-white" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 dark:border-white/10 bg-purple-50/20 dark:bg-black/20 focus:outline-none focus:border-purple-500 text-purple-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 opacity-80 text-purple-950 dark:text-purple-300">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-purple-900 dark:text-white" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 dark:border-white/10 bg-purple-50/20 dark:bg-black/20 focus:outline-none focus:border-purple-500 text-purple-950 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-purple-600/20 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'signin' ? 'Đăng nhập' : 'Đăng ký tài khoản'}</span>
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-xs opacity-70">
            {mode === 'signin' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>

          <button
            type="button"
            onClick={handleGuestSignIn}
            className="text-[11px] opacity-60 hover:opacity-100 hover:underline block mx-auto pt-1"
          >
            Dùng thử ẩn danh (Khách)
          </button>
        </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};

export default AuthModal;
