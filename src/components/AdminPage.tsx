import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ArrowLeft,
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
  Eye,
  EyeOff,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  Settings as SettingsIcon,
  Shield,
  Layers,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Trash2,
  Search,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AIProvider, DeckType, TarotDeckStyle, AuthUser } from '../types';
import { PROVIDER_MODELS, fetchOpenRouterFreeModels, getCachedOpenRouterFreeModels, OpenRouterFreeModel } from '../services/geminiService';
import { getAllUsers, deleteUserAccount, updateUserAIModel } from '../services/firebase';
import { AnnouncementBanner } from './AnnouncementBanner';
import { LiquidGlassCard } from './LiquidGlassCard';
import firebaseConfigJson from '../../firebase-applet-config.json';

interface UserRowProps {
  user: AuthUser;
  isSuper: boolean;
  isSelf: boolean;
  onDelete: () => Promise<void>;
  confirmDelete: boolean;
  setConfirmDelete: (val: boolean) => void;
  isDeleting: boolean;
  onUpdateModel: (provider: string, model: string) => Promise<void>;
  updateSuccess: boolean;
  openrouterModels: OpenRouterFreeModel[];
}

const isSuperAdminEmail = (email: string | null): boolean => {
  if (!email) return false;
  const superAdmins = ['nekyohotaru@gmail.com', 'admin@celestial.com'];
  return superAdmins.includes(email.toLowerCase());
};

const UserRow: React.FC<UserRowProps> = ({
  user,
  isSuper,
  isSelf,
  onDelete,
  confirmDelete,
  setConfirmDelete,
  isDeleting,
  onUpdateModel,
  updateSuccess,
  openrouterModels,
}) => {
  const [selectedProvider, setSelectedProvider] = useState(user.assignedProvider || 'openrouter');
  const [selectedModel, setSelectedModel] = useState(user.assignedModel || 'auto');

  // Available models mapping based on provider
  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case 'openrouter':
        return [
          { id: 'auto', label: 'Tự động (Theo Admin hoặc openrouter/free)' },
          ...openrouterModels.map(m => ({
            id: m.id,
            label: `${m.name} (${m.tag || 'Free'})`,
          })),
        ];
      case 'gemini':
        return [
          { id: 'auto', label: 'Mặc định (Gemini 2.5 Flash)' },
          { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
          { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Tư duy)' },
        ];
      default:
        return [{ id: 'auto', label: 'Tự động' }];
    }
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{user.displayName || 'Người tìm kiếm'}</span>
              {isSuper && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                  Super Admin
                </span>
              )}
              {isSelf && (
                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                  Bạn
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400 font-mono select-all">{user.email || 'Ẩn danh / Không email'}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4 text-gray-400 font-mono text-[11px]">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Chưa cập nhật'}
      </td>

      <td className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
          <select
            value={selectedProvider}
            onChange={(e) => {
              const newProv = e.target.value;
              setSelectedProvider(newProv);
              setSelectedModel('auto');
            }}
            className="text-[11px] p-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500 shrink-0"
          >
            <option value="auto">Tự động (Theo Admin)</option>
            <option value="openrouter">OpenRouter Free (Mặc định)</option>
            <option value="gemini">Google Gemini</option>
          </select>

          {selectedProvider !== 'auto' && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-[11px] p-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500 max-w-[220px] truncate"
              title={selectedModel}
            >
              {getModelsForProvider(selectedProvider).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          )}

          {(selectedProvider !== (user.assignedProvider || 'auto') || selectedModel !== (user.assignedModel || 'auto')) && (
            <button
              onClick={() => onUpdateModel(selectedProvider, selectedModel)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </button>
          )}

          {updateSuccess && (
            <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 shrink-0 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Đã lưu!</span>
            </span>
          )}
        </div>
      </td>

      <td className="p-4 text-center">
        {confirmDelete ? (
          <div className="flex items-center justify-center space-x-1.5">
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isDeleting ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span>Có, xóa!</span>
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white text-[10px] font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isSuper || isSelf}
            className={`p-2 rounded-xl transition-all ${
              isSuper || isSelf
                ? 'text-gray-600 cursor-not-allowed opacity-40'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 cursor-pointer'
            }`}
            title={isSuper ? "Không thể xóa Super Admin" : isSelf ? "Bạn không thể tự xóa chính mình" : "Xóa tài khoản này"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
};

interface AdminPageProps {
  onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const {
    currentUser,
    systemSettings,
    updateSystemSettings,
    readings,
    isAdmin,
    openAuthModal,
    activateAdminByPasskey,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'ai' | 'features' | 'datasets' | 'announcement' | 'vercel' | 'security' | 'users'>('ai');
  const [copiedKey, setCopiedKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User management states
  const [usersList, setUsersList] = useState<AuthUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userDeleteConfirmId, setUserDeleteConfirmId] = useState<string | null>(null);
  const [userModelUpdateSuccess, setUserModelUpdateSuccess] = useState<string | null>(null);

  // Fetch users when on 'users' tab
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await getAllUsers();
      setUsersList(list);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  // Security barrier passkey state
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

  // Show/hide API key toggles
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenrouter, setShowOpenrouter] = useState(false);

  // Form states for System Settings
  const [geminiKey, setGeminiKey] = useState(systemSettings.systemApiKeys?.gemini || '');
  const [openrouterKey, setOpenrouterKey] = useState(systemSettings.systemApiKeys?.openrouter || '');
  const [globalProvider, setGlobalProvider] = useState<AIProvider>(systemSettings.globalAiProvider || 'openrouter');
  const [globalModel, setGlobalModel] = useState<string>(systemSettings.globalAiModel || 'openrouter/free');
  const [allowFallback, setAllowFallback] = useState<boolean>(systemSettings.allowFallback ?? true);
  const [systemPrompt, setSystemPrompt] = useState(systemSettings.customSystemPrompt || '');
  const [aiProviderPriority, setAiProviderPriority] = useState<AIProvider[]>(
    systemSettings.aiProviderPriority && systemSettings.aiProviderPriority.length > 0
      ? systemSettings.aiProviderPriority.filter(p => p === 'gemini' || p === 'openrouter')
      : ['openrouter', 'gemini']
  );

  // OpenRouter Free Models state & fetching
  const [openrouterFreeModels, setOpenrouterFreeModels] = useState<OpenRouterFreeModel[]>(() => {
    return getCachedOpenRouterFreeModels();
  });
  const [isFetchingOpenRouter, setIsFetchingOpenRouter] = useState(false);
  const [openrouterFetchMsg, setOpenrouterFetchMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openrouterSearchQuery, setOpenrouterSearchQuery] = useState('');
  const [openrouterLastUpdated, setOpenrouterLastUpdated] = useState<string | null>(() => {
    return localStorage.getItem('celestial-openrouter-free-models-updated-at');
  });

  const handleFetchOpenRouter = async () => {
    setIsFetchingOpenRouter(true);
    setOpenrouterFetchMsg(null);
    try {
      const models = await fetchOpenRouterFreeModels(openrouterKey.trim());
      setOpenrouterFreeModels(models);
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setOpenrouterLastUpdated(nowStr);
      setOpenrouterFetchMsg({
        type: 'success',
        text: `Đã cập nhật thành công ${models.length} mô hình Free mới nhất từ OpenRouter API!`,
      });
      setTimeout(() => setOpenrouterFetchMsg(null), 6000);
    } catch (err: any) {
      setOpenrouterFetchMsg({
        type: 'error',
        text: err?.message || 'Không thể tải danh sách model từ OpenRouter. Vui lòng kiểm tra kết nối mạng hoặc thử lại.',
      });
    } finally {
      setIsFetchingOpenRouter(false);
    }
  };

  const filteredOpenrouterModels = openrouterFreeModels.filter((m) => {
    if (!openrouterSearchQuery.trim()) return true;
    const q = openrouterSearchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.desc && m.desc.toLowerCase().includes(q)) ||
      (m.tag && m.tag.toLowerCase().includes(q))
    );
  });

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
    setAiProviderPriority(
      systemSettings.aiProviderPriority && systemSettings.aiProviderPriority.length > 0
        ? systemSettings.aiProviderPriority.filter(p => p === 'gemini' || p === 'openrouter')
        : ['openrouter', 'gemini']
    );
    setAllowFallback(systemSettings.allowFallback ?? true);
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

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newPriority = [...aiProviderPriority];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPriority.length) return;
    const temp = newPriority[index];
    newPriority[index] = newPriority[targetIndex];
    newPriority[targetIndex] = temp;
    setAiProviderPriority(newPriority);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSystemSettings({
        globalAiProvider: globalProvider,
        globalAiModel: globalModel,
        aiProviderPriority: aiProviderPriority,
        allowFallback: allowFallback,
        customSystemPrompt: systemPrompt,
        systemApiKeys: {
          gemini: geminiKey.trim(),
          openrouter: openrouterKey.trim(),
        },
        enabledAiProviders,
        enabledDeckTypes,
        enabledTarotStyles,
        announcement: announcement.trim(),
        announcementActive: announcementActive,
        enableGuestReadings: enableGuestReadings,
        enableClarificationCards: enableClarificationCards,
        enableCosmicEffects: enableCosmicEffects,
        maxGuestReadingsPerDay: maxGuestReadings,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Lỗi khi lưu cài đặt:', err);
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
    setTimeout(() => setCopiedKey(false), 2500);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a14] text-gray-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Cosmic backdrop effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-lg bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Admin Access Only
            </span>
          </div>

          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-600/20 to-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Quyền Truy Cập Bị Giới Hạn</h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Trang Quản Trị Hệ Thống chứa các khóa API và cấu hình bảo mật. Vui lòng đăng nhập với tài khoản Quản Trị Viên (<strong>nekyohotaru@gmail.com</strong>) hoặc nhập mã quản trị để tiếp tục.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="button"
              onClick={openAuthModal}
              className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Đăng nhập Google (nekyohotaru@gmail.com)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-zinc-900 px-3 text-[11px] text-gray-500 uppercase font-mono">hoặc nhập mã quản trị</span>
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
                  placeholder="Nhập mã bí mật quản trị (Passkey)..."
                  className="w-full text-xs p-3.5 rounded-2xl border border-white/10 bg-black/50 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                {passkeyError && (
                  <p className="text-red-400 text-[11px] mt-1.5 font-medium">{passkeyError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mở Khóa Quản Trị Hệ Thống</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 pb-24">
      {/* Top Header Banner for Admin */}
      <div className="border-b border-white/10 bg-zinc-900/90 backdrop-blur-xl sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-purple-300 hover:text-white transition-all shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại trang chủ</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-wide flex items-center space-x-1.5">
                  <span>Trung Tâm Quản Trị Hệ Thống</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold uppercase">
                    Admin Panel
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 hidden sm:block">
                  Cấu hình AI, bảo mật quyền xem bài, thông báo và đồng bộ đám mây
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Lưu Cài Đặt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save success toast alert */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/15 border-t border-b border-emerald-500/30 text-emerald-300 text-xs py-2 px-4 text-center font-medium flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Đã lưu toàn bộ cấu hình hệ thống thành công lên Cloud Firestore!</span>
          </motion.div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* KPI / Status Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: AI Provider */}
          <LiquidGlassCard className="p-4" contentClassName="text-white">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center font-medium">
                <Cpu className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Động cơ AI chính
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="mt-2 text-base font-bold text-white capitalize">
              {globalProvider === 'auto' ? 'Tự động xoay tua' : globalProvider}
            </div>
            <div className="text-[11px] text-purple-300/70 mt-0.5 truncate">
              {geminiKey ? 'Đã nạp Gemini Key' : 'Sử dụng hệ thống dự phòng'}
            </div>
          </LiquidGlassCard>

          {/* Card 2: Guest Mode */}
          <LiquidGlassCard className="p-4" contentClassName="text-white">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center font-medium">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Chế độ khách
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                enableGuestReadings ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {enableGuestReadings ? 'Tự do' : 'Đã khóa'}
              </span>
            </div>
            <div className="mt-2 text-base font-bold text-white">
              {enableGuestReadings ? 'Khách được xem' : 'Bắt buộc đăng nhập'}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {enableGuestReadings ? 'Không giới hạn truy cập' : 'Bảo vệ quyền lợi thành viên'}
            </div>
          </LiquidGlassCard>

          {/* Card 3: Announcement */}
          <LiquidGlassCard className="p-4" contentClassName="text-white">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center font-medium">
                <Bell className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Thông báo banner
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                announcementActive ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700/40 text-gray-400'
              }`}>
                {announcementActive ? 'Đang phát' : 'Đang tắt'}
              </span>
            </div>
            <div className="mt-2 text-base font-bold text-white truncate">
              {announcementActive && announcement ? announcement : 'Chưa bật thông báo'}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 truncate">
              Ghim nổi bật trên đầu trang
            </div>
          </LiquidGlassCard>

          {/* Card 4: Database & Total Readings */}
          <LiquidGlassCard className="p-4" contentClassName="text-white">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center font-medium">
                <Database className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Cơ sở dữ liệu
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>
            <div className="mt-2 text-base font-bold text-white">
              {readings.length} Quẻ bài đã lưu
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5 font-mono truncate">
              celestial-tarot-cb063
            </div>
          </LiquidGlassCard>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ai', label: 'Trí Tuệ Nhân Tạo & API', icon: Sparkles },
            { id: 'features', label: 'Chức Năng & Quyền Hạn', icon: Sliders },
            { id: 'datasets', label: 'Bộ Dữ Liệu & Ảnh Bài Tarot', icon: Layers },
            { id: 'announcement', label: 'Thông Báo Web (Banner)', icon: Bell },
            { id: 'vercel', label: 'Đồng Bộ Vercel & Firebase', icon: Cloud },
            { id: 'security', label: 'Quản Trị Viên & Bảo Mật', icon: ShieldCheck },
            { id: 'users', label: 'Quản Lý Thành Viên', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: AI & API KEYS */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Info notice */}
            <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 rounded-3xl p-5 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Khóa API Toàn Hệ Thống</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Các khóa API thiết lập ở đây được lưu trực tiếp vào cơ sở dữ liệu đám mây Firebase. Khi người dùng hoặc khách truy cập vào trang web của bạn (kể cả trên Vercel), hệ thống sẽ dùng các khóa này để luận giải bài Tarot một cách mượt mà và tự động xoay tua khi có key bị giới hạn hạn mức (Rate Limit).
                </p>
              </div>
            </div>

            {/* Provider Grid Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-purple-400" />
                Lựa chọn Nhà Cung Cấp AI mặc định cho người dùng:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'auto',
                    title: 'Tự động thông minh (Khuyên dùng)',
                    desc: 'Tự động chọn Gemini, xoay tua nhiều key và fallback sang OpenRouter Free khi nghẽn mạng',
                    badge: 'Tối ưu nhất',
                  },
                  {
                    id: 'gemini',
                    title: 'Google Gemini',
                    desc: 'Gemini 2.5 Flash / Pro - Ngôn từ huyền bí sâu sắc, thấu suốt vũ trụ',
                    badge: 'Chất lượng cao',
                  },
                  {
                    id: 'openrouter',
                    title: 'OpenRouter Free (Mặc định toàn trang)',
                    desc: 'Cổng đa mô hình AI miễn phí 100% - Tùy chọn model mới nhất từ danh sách API bên dưới',
                    badge: 'Mặc định',
                  },
                ].map((p) => {
                  const isSelected = globalProvider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const newProvider = p.id as AIProvider;
                        setGlobalProvider(newProvider);
                        const defaultModels = PROVIDER_MODELS[newProvider];
                        if (defaultModels && defaultModels.length > 0) {
                          setGlobalModel(defaultModels[0].id);
                        } else {
                          setGlobalModel('auto');
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                          : 'bg-zinc-900/60 border-white/10 text-gray-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-white">{p.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSelected ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-gray-400'
                          }`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{p.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-3 flex items-center text-[10px] font-bold text-purple-400">
                          <Check className="w-3 h-3 mr-1" /> Đang được kích hoạt
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* KHÁM PHÁ & CHỌN MÔ HÌNH OPENROUTER FREE MỚI NHẤT */}
              <div className="p-6 rounded-3xl bg-zinc-900/70 border border-purple-500/30 space-y-5 shadow-xl relative overflow-hidden mt-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                        <Cpu className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <span>Mô Hình OpenRouter Free Mặc Định Cho Tất Cả Mọi Người</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {openrouterFreeModels.length} Model Khả Dụng
                          </span>
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          OpenRouter cung cấp rất nhiều model miễn phí 100% (NVIDIA Nemotron 1M context, Google Gemma 4, Llama 3.3, GLM, Inkling...). Bấm nút bên phải để fetch danh sách mới nhất từ API và chọn model bạn muốn.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fetch Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleFetchOpenRouter}
                      disabled={isFetchingOpenRouter}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingOpenRouter ? 'animate-spin' : ''}`} />
                      <span>{isFetchingOpenRouter ? 'Đang fetch từ API...' : 'Fetch Model Free Mới Nhất'}</span>
                    </button>
                  </div>
                </div>

                {/* Fetch Alert notification */}
                {openrouterFetchMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                      openrouterFetchMsg.type === 'success'
                        ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/50 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {openrouterFetchMsg.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="flex-1">{openrouterFetchMsg.text}</span>
                    <button
                      type="button"
                      onClick={() => setOpenrouterFetchMsg(null)}
                      className="text-gray-400 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* Current Selected Model Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Model OpenRouter Đang Chọn Cho Toàn Hệ Thống:
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-white font-mono bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                        {globalModel || 'openrouter/free'}
                      </span>
                      {globalModel === 'openrouter/free' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                          Auto Router
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                          Cố định model này
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {globalModel !== 'openrouter/free' && (
                      <button
                        type="button"
                        onClick={() => setGlobalModel('openrouter/free')}
                        className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 transition-all cursor-pointer font-medium"
                      >
                        Đặt về Auto Router (Mặc định)
                      </button>
                    )}
                    {openrouterLastUpdated && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        Cập nhật: {openrouterLastUpdated}
                      </span>
                    )}
                  </div>
                </div>

                {/* Search & Fast Dropdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={openrouterSearchQuery}
                      onChange={(e) => setOpenrouterSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm model free (vd: nemotron, gemma, llama, deepseek, 1m, glm...)"
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="sm:w-72">
                    <select
                      value={globalModel}
                      onChange={(e) => setGlobalModel(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500 truncate"
                    >
                      {openrouterFreeModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.tag || 'Free'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visual Grid of Models */}
                <div className="max-h-96 overflow-y-auto pr-1 space-y-2.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredOpenrouterModels.map((m) => {
                      const isSelected = globalModel === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setGlobalModel(m.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/50'
                              : 'bg-black/40 border-white/10 text-gray-300 hover:border-purple-500/40 hover:bg-black/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-bold text-xs text-white leading-tight">
                                {m.name}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 font-mono ${
                                isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-300'
                              }`}>
                                {m.tag || 'Free 100%'}
                              </span>
                            </div>
                            <div className="text-[10px] text-purple-400 font-mono truncate mb-1">
                              {m.id}
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                              {m.desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5">
                            {m.context_length ? (
                              <span className="text-[10px] text-gray-400 font-mono">
                                Context: {m.context_length >= 1000000 ? `${(m.context_length / 1000000).toFixed(1)}M tokens` : `${Math.round(m.context_length / 1000)}k tokens`}
                              </span>
                            ) : <span />}
                            <span className={`text-[10px] font-bold flex items-center gap-1 ${
                              isSelected ? 'text-purple-400' : 'text-gray-500'
                            }`}>
                              {isSelected ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Đang chọn model này
                                </>
                              ) : (
                                'Nhấn để chọn'
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredOpenrouterModels.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-xs">
                      Không tìm thấy mô hình nào phù hợp với từ khóa "{openrouterSearchQuery}".
                    </div>
                  )}
                </div>
              </div>

              {/* Smart Auto-Descending Model Hierarchy */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-purple-500/20 space-y-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Cơ Chế Bậc Thang Tự Động (Auto-Descending Hierarchy)
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Hệ thống tự động dùng mô hình mới nhất, nếu hết quota sẽ tự động trượt xuống bậc thấp nhì, thấp ba, rồi mới chuyển nhà cung cấp:
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full self-start flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Tự động tối ưu 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { tier: 'Bậc 1 (Ưu tiên cao nhất)', name: 'Gemini 3.8 Flash / 3.1 Pro', desc: 'Mới nhất Google - Phân tích Tarot sâu sắc, trí tuệ đỉnh cao', tag: 'Khởi đầu' },
                    { tier: 'Bậc 2 (Hạ cấp tự động)', name: 'Gemini 2.5 Pro', desc: 'Sử dụng khi tất cả key của Bậc 1 chạm ngưỡng Quota', tag: 'Dự phòng 1' },
                    { tier: 'Bậc 3 (Hạ cấp tiếp)', name: 'Gemini 2.5 Flash', desc: 'Cân bằng tốc độ cao, giữ mạch kết nối người dùng', tag: 'Dự phòng 2' },
                    { tier: 'Bậc 4 (Cứu cánh Quota)', name: 'Gemini 3.1 Flash-Lite', desc: 'Siêu nhẹ, phản hồi tức thì, tối ưu hóa quota triệt để', tag: 'Dự phòng 3' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-white/10 bg-black/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">{step.tier}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">{step.tag}</span>
                        </div>
                        <h5 className="font-bold text-xs text-white mb-0.5">{step.name}</h5>
                        <p className="text-[10px] text-gray-400 leading-tight">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-Fallback Toggle */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-semibold text-white flex items-center">
                      Tự động chuyển sang nhà cung cấp dự phòng khi hết sạch các bậc (Auto-Fallback)
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Khi tất cả các bậc của Gemini đều cạn quota, hệ thống sẽ tự động chuyển sang OpenRouter Free để không bao giờ bị gián đoạn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowFallback(!allowFallback)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      allowFallback ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        allowFallback ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* THỨ TỰ ƯU TIÊN AI & TỰ ĐỘNG XOAY TUA (FALLBACK CHAIN) */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-purple-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center">
                      <ListOrdered className="w-4 h-4 mr-2 text-amber-400" />
                      Thứ Tự Ưu Tiên AI Mặc Định & Dự Phòng (AI Priority & Fallback Sequence)
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sắp xếp thứ tự các dịch vụ AI sẽ được gọi khi giải bài. Khi người dùng bấm trải bài, hệ thống sẽ ưu tiên dùng AI ở vị trí số 1. Nếu vị trí số 1 hết hạn mức hoặc lỗi mạng, hệ thống tự động trượt xuống vị trí tiếp theo.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {aiProviderPriority.map((providerId, index) => {
                    const isTop = index === 0;
                    const isBottom = index === aiProviderPriority.length - 1;
                    const isEnabled = enabledAiProviders[providerId] ?? true;

                    const providerInfo: Record<AIProvider, { name: string; tag: string; desc: string }> = {
                      auto: { name: 'Tự động', tag: 'Auto', desc: 'Tự động xoay tua' },
                      gemini: { name: 'Google Gemini', tag: 'Gemini 2.5 Flash / Pro', desc: 'Siêu nhanh, thông minh, phân tích sâu sắc' },
                      openrouter: { name: 'OpenRouter Router', tag: 'openrouter/free', desc: 'Cổng đa mô hình AI miễn phí' },
                    };

                    const info = providerInfo[providerId] || { name: providerId, tag: 'AI', desc: '' };

                    return (
                      <motion.div
                        key={providerId}
                        layout
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isTop
                            ? 'bg-gradient-to-r from-amber-500/15 via-purple-900/20 to-purple-900/10 border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                            : isEnabled
                            ? 'bg-black/40 border-white/10 hover:border-purple-500/30'
                            : 'bg-black/20 border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Priority Number Badge */}
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isTop
                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            #{index + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white truncate">{info.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                                {info.tag}
                              </span>
                              {isTop && (
                                <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                                  Ưu Tiên Số 1
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{info.desc}</p>
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => movePriority(index, 'up')}
                            disabled={isTop}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isTop
                                ? 'border-white/5 text-gray-600 cursor-not-allowed opacity-30'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hover:border-purple-400'
                            }`}
                            title="Tăng mức độ ưu tiên (Chuyển lên trên)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePriority(index, 'down')}
                            disabled={isBottom}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isBottom
                                ? 'border-white/5 text-gray-600 cursor-not-allowed opacity-30'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hover:border-purple-400'
                            }`}
                            title="Giảm mức độ ưu tiên (Chuyển xuống dưới)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* BẬT / TẮT NHÀ CUNG CẤP AI KHẢ DỤNG CHO TOÀN BỘ NGƯỜI DÙNG */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-purple-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center">
                      <Sliders className="w-4 h-4 mr-2 text-purple-400" />
                      Bật / Tắt Nhà Cung Cấp AI Khả Dụng (AI Providers Control)
                    </h3>
                    <p className="text-xs text-gray-400">
                      Chủ động tắt các nhà cung cấp AI khi hết hạn ngạch hoặc bạn không muốn người dùng lựa chọn trong mục Cài đặt.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'auto' as AIProvider, name: 'Tự động (Auto)', desc: 'Tự xoay tua nhiều key & fallback' },
                    { id: 'gemini' as AIProvider, name: 'Google Gemini', desc: 'Gemini 2.5 Flash / Pro' },
                    { id: 'openrouter' as AIProvider, name: 'OpenRouter Free', desc: 'openrouter/free & auto' },
                  ].map((p) => {
                    const isEnabled = enabledAiProviders[p.id] ?? true;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isEnabled
                            ? 'bg-purple-950/20 border-purple-500/40 text-white'
                            : 'bg-black/40 border-white/5 text-gray-500 opacity-70'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              isEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isEnabled ? 'Đang Bật' : 'Đã Tắt'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{p.desc}</p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              setEnabledAiProviders(prev => ({
                                ...prev,
                                [p.id]: e.target.checked,
                              }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inputs for API Keys */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center">
                <Key className="w-4 h-4 mr-2 text-amber-400" />
                Danh Sách Khóa API Dự Phòng:
              </h3>

              {/* Gemini */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                    Google Gemini API Key(s):
                  </span>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center text-[11px]"
                  >
                    Lấy key miễn phí từ Google AI Studio <ExternalLink className="w-2.5 h-2.5 ml-1" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy... (Có thể dán nhiều key cách nhau bởi dấu phẩy để tự động xoay tua)"
                    className="w-full text-xs p-3.5 pr-10 rounded-2xl border border-white/10 bg-black/50 focus:outline-none focus:border-purple-500 font-mono text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  💡 Có thể dán 2 đến 3 API keys cách nhau bằng dấu phẩy. Khi key đầu tiên bị hết hạn ngạch (429 Rate Limit), hệ thống sẽ lập tức chuyển sang key tiếp theo mà không làm gián đoạn người dùng.
                </p>
              </div>

              {/* OpenRouter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center">
                    <Cpu className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                    OpenRouter API Key (Router Free):
                  </span>
                  <div className="flex items-center space-x-2">
                    <a href="https://openrouter.ai/openrouter/free" target="_blank" rel="noreferrer" className="text-purple-300 hover:underline text-[11px] flex items-center">
                      Router Free <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline text-[11px] flex items-center">
                      Lấy key <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showOpenrouter ? 'text' : 'password'}
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full text-xs p-3.5 pr-10 rounded-2xl border border-white/10 bg-black/50 focus:outline-none focus:border-purple-500 font-mono text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenrouter(!showOpenrouter)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showOpenrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-purple-300/80">
                  ✨ Tự động kết nối qua <strong>openrouter/free</strong> miễn phí mà không cần cấu hình danh sách model phức tạp.
                </p>
              </div>

              {/* Custom System Prompt */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-white flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Chỉ Dẫn Vũ Trụ Cho AI (Custom System Prompt) - Tùy chỉnh phong cách phán:
                </label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Ví dụ: Bạn là nhà bói toán Tarot thông thái, đọc bài bằng giọng văn truyền cảm, nhân từ, luôn hướng người hỏi tới sự tự chữa lành, can đảm và đưa ra các lời khuyên thực tế..."
                  className="w-full text-xs p-3.5 rounded-2xl border border-white/10 bg-black/50 focus:outline-none focus:border-purple-500 text-white resize-none leading-relaxed"
                />
                <p className="text-[11px] text-gray-400">
                  Để trống nếu bạn muốn sử dụng bộ chỉ dẫn chiêm tinh học chuẩn mực mặc định của Neko Tarot.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEB FEATURES & ACCESS CONTROL */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Feature 1: Require login */}
              <div className={`p-6 rounded-3xl border transition-all ${
                enableGuestReadings
                  ? 'bg-zinc-900/60 border-white/10'
                  : 'bg-amber-950/20 border-amber-500/50 shadow-xl shadow-amber-500/10'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 pr-4">
                    <div className="flex items-center space-x-2">
                      <Lock className={`w-5 h-5 ${enableGuestReadings ? 'text-gray-400' : 'text-amber-400'}`} />
                      <h4 className="text-sm font-bold text-white">
                        {enableGuestReadings ? 'Cho phép khách trải bài' : '🔒 Bắt buộc đăng nhập mới được xem bài'}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {enableGuestReadings
                        ? 'Khách vãng lai chưa có tài khoản vẫn có thể chọn lá bài và xem giải mã tự do.'
                        : 'Bảo vệ quyền lợi thành viên: Khi khách bấm vào "Bói Bài", hệ thống sẽ yêu cầu đăng nhập bằng Google hoặc Email để tiếp tục.'}
                    </p>
                    <div className="pt-2">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        enableGuestReadings
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {enableGuestReadings ? '🟢 Trạng thái: Tự do cho mọi người' : '🔒 Trạng thái: Khóa khách (Cần đăng nhập)'}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={enableGuestReadings}
                      onChange={(e) => setEnableGuestReadings(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {/* Feature 2: Clarification Cards */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-start justify-between">
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">Rút Lá Bài Làm Rõ</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Cho phép người xem rút thêm 1 lá bài bổ sung khi đặt câu hỏi chuyên sâu với AI sau khi trải bài chính.
                  </p>
                  <div className="pt-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      enableClarificationCards
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {enableClarificationCards ? 'Bật tính năng' : 'Tắt tính năng'}
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={enableClarificationCards}
                    onChange={(e) => setEnableClarificationCards(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Feature 3: Cosmic Effects */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-start justify-between">
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Hiệu Ứng Vũ Trụ Mặc Định</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Kích hoạt nền bầu trời sao lấp lánh, vệt sáng sao chổi huyền ảo và chuông thiền vũ trụ khi mở ứng dụng.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={enableCosmicEffects}
                    onChange={(e) => setEnableCosmicEffects(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Feature 4: Daily guest limit */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-start justify-between">
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Giới Hạn Quẻ Bài Khách</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Giới hạn số lượt xem bài trong 1 ngày đối với khách vãng lai nhằm ngăn chặn tool spam làm cạn kiệt API.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxGuestReadings}
                    onChange={(e) => setMaxGuestReadings(Number(e.target.value))}
                    className="w-20 text-center text-sm p-2 rounded-xl border border-white/10 bg-black/60 text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-xs text-gray-400">lượt/ngày</span>
                </div>
              </div>

              {/* Feature 5: QUẢN LÝ BẬT / TẮT BỘ BÀI (DECK TYPES) */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-purple-500/20 space-y-4">
                <div className="space-y-1 border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-purple-400" />
                    Bật / Tắt Các Bộ Bài Trải Nghiệm (Decks Control)
                  </h4>
                  <p className="text-xs text-gray-400">
                    Bật hoặc ẩn nút bấm lựa chọn bộ bài ngay trên màn hình chính của ứng dụng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bói Bài Tarot */}
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    (enabledDeckTypes[DeckType.TAROT] ?? true)
                      ? 'bg-purple-950/20 border-purple-500/40 text-white'
                      : 'bg-black/40 border-white/5 text-gray-500 opacity-70'
                  }`}>
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">Bói Bài Tarot (78 Lá)</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          (enabledDeckTypes[DeckType.TAROT] ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {(enabledDeckTypes[DeckType.TAROT] ?? true) ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Trải bài Tarot 1 lá, 3 lá (Quá khứ - Hiện tại - Tương lai) và 10 lá Celtic Cross.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={enabledDeckTypes[DeckType.TAROT] ?? true}
                        onChange={(e) => {
                          setEnabledDeckTypes(prev => ({
                            ...prev,
                            [DeckType.TAROT]: e.target.checked,
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Bói Bài Tây */}
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    (enabledDeckTypes[DeckType.PLAYING_CARDS] ?? true)
                      ? 'bg-purple-950/20 border-purple-500/40 text-white'
                      : 'bg-black/40 border-white/5 text-gray-500 opacity-70'
                  }`}>
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">Bói Bài Tây / Tú Lơ Khơ (52 Lá)</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          (enabledDeckTypes[DeckType.PLAYING_CARDS] ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {(enabledDeckTypes[DeckType.PLAYING_CARDS] ?? true) ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Luận giải vận mệnh, tài lộc, tình duyên theo chất Cơ - Rô - Chuồn - Bích & quẻ 32 lá.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={enabledDeckTypes[DeckType.PLAYING_CARDS] ?? true}
                        onChange={(e) => {
                          setEnabledDeckTypes(prev => ({
                            ...prev,
                            [DeckType.PLAYING_CARDS]: e.target.checked,
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Feature 6: QUẢN LÝ BẬT / TẮT BỘ ẢNH NGHỆ THUẬT TAROT */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-purple-500/20 space-y-4">
                <div className="space-y-1 border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                    Bật / Tắt Phong Cách Artwork Bộ Bài Tarot (Tarot Styles)
                  </h4>
                  <p className="text-xs text-gray-400">
                    Chọn các bộ tranh Tarot Public Domain cho phép người dùng lựa chọn trong mục Cài Đặt.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'rider-waite' as TarotDeckStyle,
                      name: 'Rider-Waite 1909',
                      source: 'krates98 & Tarotoo',
                      desc: 'Bộ 78 lá kinh điển, màu sắc nét',
                    },
                    {
                      id: 'marseille' as TarotDeckStyle,
                      name: 'Tarot de Marseille',
                      source: 'mixvlad/TarotCards',
                      desc: 'Phong cách Pháp thế kỷ 18',
                    },
                    {
                      id: 'sola-busca' as TarotDeckStyle,
                      name: 'Sola Busca (1491)',
                      source: 'mixvlad/TarotCards',
                      desc: 'Bộ Tarot cổ nhất thế giới',
                    },
                  ].map((deck) => {
                    const isStyleEnabled = enabledTarotStyles[deck.id] ?? true;
                    return (
                      <div
                        key={deck.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isStyleEnabled
                            ? 'bg-purple-950/20 border-purple-500/40 text-white'
                            : 'bg-black/40 border-white/5 text-gray-500 opacity-70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{deck.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              isStyleEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isStyleEnabled ? 'Bật' : 'Tắt'}
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-400 font-mono block mb-1">{deck.source}</span>
                          <p className="text-[10px] text-gray-400 leading-relaxed mb-3">{deck.desc}</p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-white/5">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isStyleEnabled}
                              onChange={(e) => {
                                setEnabledTarotStyles(prev => ({
                                  ...prev,
                                  [deck.id]: e.target.checked,
                                }));
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATASETS & TAROT ARTWORKS */}
        {activeTab === 'datasets' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">3 Nguồn Dữ Liệu & Ảnh Bài Tarot Đã Tích Hợp</h3>
                  <p className="text-xs text-gray-400">Toàn bộ 78 lá bài đã được đồng bộ hóa dữ liệu ý nghĩa chuyên sâu và nguồn ảnh phân giải cao</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Source 1: Tarotoo */}
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">Tarotoo-com/tarotoo-tarot-dataset</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Hoạt động</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Dataset 78 lá bài đầy đủ nguyên tố (Element), cung hoàng đạo (Zodiac), hành tinh (Planet), từ khóa xuôi/ngược, trả lời Có/Không và luận giải Tình yêu/Sự nghiệp/Tâm linh.
                  </p>
                  <div className="text-[11px] text-purple-400/80 font-mono">
                    ✓ Đã nhúng vào prompt AI & UI chi tiết
                  </div>
                  <a
                    href="https://github.com/Tarotoo-com/tarotoo-tarot-dataset"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 hover:underline pt-1"
                  >
                    Xem Repository <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                {/* Source 2: krates98 */}
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">krates98/tarotcardapi</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Hoạt động</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Bộ 78 ảnh Rider-Waite chuẩn hóa file JPEG sắc nét, tải trực tiếp qua CDN GitHub Raw siêu tốc độ với tỷ lệ hoàn hảo cho mobile & desktop.
                  </p>
                  <div className="text-[11px] text-purple-400/80 font-mono">
                    ✓ Đã map 78/78 lá chuẩn xác
                  </div>
                  <a
                    href="https://github.com/krates98/tarotcardapi"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 hover:underline pt-1"
                  >
                    Xem Repository <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                {/* Source 3: mixvlad */}
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">mixvlad/TarotCards</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Hoạt động</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Tổng hợp các bộ bài Public Domain cổ điển: Tarot de Marseille (bản chuẩn Pháp 720px) và Sola Busca (bộ bài cổ nhất thế giới từ năm 1491).
                  </p>
                  <div className="text-[11px] text-purple-400/80 font-mono">
                    ✓ Đã bổ sung tùy chọn phong cách bài
                  </div>
                  <a
                    href="https://github.com/mixvlad/TarotCards"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 hover:underline pt-1"
                  >
                    Xem Repository <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ANNOUNCEMENT BANNER */}
        {activeTab === 'announcement' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Thanh Thông Báo Đỉnh Trang (Cosmic Banner)</h3>
                    <p className="text-xs text-gray-400">Thông báo này sẽ xuất hiện cố định liền mạch ở trên cùng của trang web</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Nội dung thông điệp:</label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Ví dụ: ✨ Chúc bạn một ngày thanh thản và đón nhận những thông điệp tích cực từ các vì sao."
                  className="w-full text-xs p-3.5 rounded-2xl border border-white/10 bg-black/60 focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              {/* Live Preview of Banner */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-gray-400 flex items-center">
                  <Eye className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                  Xem trước thời gian thực (1 dòng cuộn marquee khi dài):
                </div>
                <div className="rounded-2xl bg-black/80 border border-white/10 overflow-hidden shadow-inner">
                  {announcementActive && announcement ? (
                    <AnnouncementBanner text={announcement} />
                  ) : (
                    <div className="py-3 text-center text-xs text-gray-500 italic">
                      (Thông báo hiện đang tắt - gạt công tắc ở trên để bật)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VERCEL DEPLOYMENT & FIREBASE */}
        {activeTab === 'vercel' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Cloud className="w-4 h-4 mr-2 text-purple-400" />
                    Biến Môi Trường Triển Khai Vercel (Environment Variables)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Dán toàn bộ các biến này vào <strong>Vercel &gt; Settings &gt; Environment Variables</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyVercelEnvs}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Đã sao chép!' : 'Sao chép tất cả biến'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-black/70 border border-white/10 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed">
                  {vercelEnvSnippet}
                </pre>
              </div>

              {/* Authorized domains note */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center font-bold text-amber-300 space-x-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Cách thêm tên miền Vercel vào Firebase để Google Login hoạt động:</span>
                </div>
                <p className="leading-relaxed">
                  1. Vào <a href="https://console.firebase.google.com/project/celestial-tarot-cb063/authentication/settings" target="_blank" rel="noreferrer" className="underline font-bold text-white">Firebase Console &gt; Authentication &gt; Settings</a>.<br />
                  2. Chọn mục <strong>Authorized domains</strong> &gt; Bấm <strong>Add domain</strong>.<br />
                  3. Dán tên miền Vercel của bạn (ví dụ: <code>nekotarot.vercel.app</code>) vào và bấm <strong>Add</strong> là hoàn tất!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN ACCOUNTS & SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Shield className="w-4 h-4 mr-2 text-amber-400" />
                Danh Sách Quản Trị Viên Được Cấp Quyền (Super Admins)
              </h3>

              <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>nekyohotaru@gmail.com</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      Chủ Sở Hữu (Owner)
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Có toàn quyền điều khiển hệ thống, cấu hình API và quản lý cơ sở dữ liệu
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>Tài khoản hiện tại của bạn:</span>
                <span className="text-white font-mono font-semibold">
                  {currentUser?.email || (currentUser?.isAnonymous ? 'Khách (Đã kích hoạt Admin)' : 'Chưa đăng nhập')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-400" />
                    Quản Lý Thành Viên Hệ Thống
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Kiểm tra thông tin, chỉ định mô hình AI riêng biệt và quản lý vòng đời tài khoản người dùng
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="text-xs pl-9 pr-4 py-2 w-full sm:w-60 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={fetchUsers}
                    disabled={usersLoading}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Tải lại danh sách"
                  >
                    <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Users Table / Grid */}
              {usersLoading ? (
                <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                  <span>Đang tải danh sách thành viên...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Thành viên</th>
                        <th className="p-4">Ngày tham gia</th>
                        <th className="p-4">Mô hình AI chỉ định</th>
                        <th className="p-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {usersList
                        .filter(u => {
                          const query = userSearchQuery.trim().toLowerCase();
                          if (!query) return true;
                          return (
                            (u.displayName || '').toLowerCase().includes(query) ||
                            (u.email || '').toLowerCase().includes(query) ||
                            u.uid.toLowerCase().includes(query)
                          );
                        })
                        .map((user) => {
                          const isSuper = isSuperAdminEmail(user.email);
                          const isSelf = user.uid === currentUser?.uid;
                          
                          return (
                            <UserRow 
                              key={user.uid} 
                              user={user} 
                              isSuper={isSuper} 
                              isSelf={isSelf} 
                              onDelete={async () => {
                                setDeletingUserId(user.uid);
                                try {
                                  await deleteUserAccount(user.uid);
                                  await fetchUsers();
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setDeletingUserId(null);
                                  setUserDeleteConfirmId(null);
                                }
                              }}
                              confirmDelete={userDeleteConfirmId === user.uid}
                              setConfirmDelete={(val) => setUserDeleteConfirmId(val ? user.uid : null)}
                              isDeleting={deletingUserId === user.uid}
                              onUpdateModel={async (provider, model) => {
                                try {
                                  await updateUserAIModel(user.uid, provider, model);
                                  setUserModelUpdateSuccess(user.uid);
                                  setTimeout(() => setUserModelUpdateSuccess(null), 3000);
                                  if (isSelf) {
                                    const cachedStr = localStorage.getItem('celestial-synced-user');
                                    if (cachedStr) {
                                      const cached = JSON.parse(cachedStr);
                                      cached.assignedProvider = provider;
                                      cached.assignedModel = model;
                                      localStorage.setItem('celestial-synced-user', JSON.stringify(cached));
                                    }
                                  }
                                  fetchUsers();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              updateSuccess={userModelUpdateSuccess === user.uid}
                              openrouterModels={openrouterFreeModels}
                            />
                          );
                        })}
                      {usersList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            Chưa có người dùng nào đăng ký hoặc đồng bộ.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between shadow-xl">
          <div className="text-xs text-gray-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center">
                <Check className="w-4 h-4 mr-1.5" />
                Đã đồng bộ cài đặt lên Cloud Firestore!
              </span>
            ) : (
              <span>Thay đổi sẽ có hiệu lực ngay lập tức cho toàn bộ người dùng sau khi lưu.</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Lưu Cài Đặt Hệ Thống
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
