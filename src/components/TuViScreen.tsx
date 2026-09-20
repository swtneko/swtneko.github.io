import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { UserInfo, ReadingResult, DeckType, ReadingTheme, SpreadType, FollowUpMessage, LaSoTuViData } from '../types';
import { buildLaSoTuVi, parseBirthTime } from '../utils/tuviEngine';
import { interpretTuViReading, interpretTuViFollowUp } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { TuViChart } from './TuViChart';
import { ShareModal } from './ShareModal';
import { LiquidGlassCard } from './LiquidGlassCard';
import { exportReadingToPdf } from '../services/pdfExport';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  ArrowLeft,
  Compass,
  Calendar,
  Clock,
  User,
  MessageSquare,
  BookmarkCheck,
  Share2,
  RefreshCw,
  Send,
  Lock,
  ChevronRight,
  AlertCircle,
  Shield,
  HelpCircle,
  Copy,
  Check,
  Target,
  MapPin,
  CheckSquare,
  Square,
  Flame,
  Info,
  FileDown,
  Loader2,
} from 'lucide-react';

interface TuViScreenProps {
  initialUserInfo?: UserInfo | null;
  initialReading?: ReadingResult | null;
  onBack: () => void;
}

const tuViLoadingMessages = [
  'Đang quy đổi Dương lịch sang Thiên Can Địa Chi & Tiết Khí Âm Lịch...',
  'Đang định vị 12 Cung Địa Bàn, an Mệnh, Thân và xác định Cục số...',
  'Đang an vị 14 Chính Tinh (Tử Vi, Thiên Phủ, Thất Sát, Thái Dương...)...',
  'Đang an định Tứ Hóa, Lục Sát Tinh, Vòng Tràng Sinh, Tuần/Triệt...',
  'Đang tính toán Cân Lượng Chỉ và cấu trúc Thiên Bàn chuẩn hóa...',
  'Bậc Thầy Tử Vi đang thẩm định dữ liệu lá số và trước tác bài luận giải chuyên sâu...',
];

const TU_VI_TOPICS = [
  { id: 'Tổng quan vận mệnh', label: 'Tổng quan vận mệnh', icon: '🔮' },
  { id: 'Tính cách', label: 'Tính cách & Tư chất', icon: '🧠' },
  { id: 'Học tập / công việc', label: 'Học tập / Công việc', icon: '💼' },
  { id: 'Tài chính', label: 'Tài chính & Tiền của', icon: '💰' },
  { id: 'Tình cảm', label: 'Tình cảm & Hôn nhân', icon: '❤️' },
  { id: 'Gia đình', label: 'Gia đình & Lục thân', icon: '🏡' },
  { id: 'Bạn bè / các mối quan hệ', label: 'Bạn bè & Quan hệ', icon: '🤝' },
  { id: 'Sức khỏe', label: 'Sức khỏe (tham khảo)', icon: '🌿' },
  { id: 'Vận hạn theo từng năm', label: 'Vận hạn từng năm', icon: '📅' },
  { id: 'Đại vận / tiểu vận', label: 'Đại vận & Tiểu vận', icon: '⏳' },
];

const getYearCanChiPreview = (year: number): string => {
  const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
  const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
  if (!year || year < 1800 || year > 2200) return '';
  const can = CAN[year % 10];
  const chi = CHI[year % 12];
  return `Năm ${can} ${chi}`;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 24 },
  },
};

export const TuViScreen: React.FC<TuViScreenProps> = ({ initialUserInfo, initialReading, onBack }) => {
  const { settings } = useSettings();
  const { saveNewReading, updateFollowUps, currentUser, systemSettings, openAuthModal } = useAuth();

  const [step, setStep] = useState<'form' | 'loading' | 'result'>(initialReading ? 'result' : 'form');
  const [readingId, setReadingId] = useState<string>(initialReading ? initialReading.id : `tuvi-${Date.now()}`);

  const [fullName, setFullName] = useState(initialReading?.userInfo?.fullName || initialUserInfo?.fullName || '');
  const [gender, setGender] = useState(initialReading?.userInfo?.gender || initialUserInfo?.gender || 'Nam');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthDate, setBirthDate] = useState(initialReading?.userInfo?.birthDate || initialUserInfo?.birthDate || '');
  const [birthTime, setBirthTime] = useState(initialReading?.userInfo?.birthTime || initialUserInfo?.birthTime || '14:30');
  const [noiSinh, setNoiSinh] = useState('Việt Nam');
  const [viewingYear, setViewingYear] = useState<number>(2026);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Tổng quan vận mệnh',
    'Học tập / công việc',
    'Tài chính',
    'Tình cảm',
    'Vận hạn theo từng năm',
  ]);
  const [question, setQuestion] = useState(initialReading?.question || initialUserInfo?.request || '');

  const [laSoData, setLaSoData] = useState<LaSoTuViData | null>(initialReading?.tuViData || null);
  const [interpretation, setInterpretation] = useState<string | null>(initialReading?.aiInterpretation || null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(!!initialReading);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopiedInterpretation, setIsCopiedInterpretation] = useState(false);

  // Follow-up state
  const [followUps, setFollowUps] = useState<FollowUpMessage[]>(initialReading?.followUps || []);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Live parsed time preview
  const parsedTimePreview = parseBirthTime(birthTime);

  useEffect(() => {
    if (initialReading) {
      setReadingId(initialReading.id);
      setFullName(initialReading.userInfo?.fullName || '');
      setGender(initialReading.userInfo?.gender || 'Nam');
      setBirthDate(initialReading.userInfo?.birthDate || '');
      setBirthTime(initialReading.userInfo?.birthTime || '14:30');
      setQuestion(initialReading.question || '');
      setInterpretation(initialReading.aiInterpretation || '');
      setFollowUps(initialReading.followUps || []);
      if (initialReading.tuViData) {
        setLaSoData(initialReading.tuViData);
      }
      setStep('result');
      setIsSaved(true);
      if (typeof window !== 'undefined' && !window.location.pathname.includes(initialReading.id)) {
        window.history.replaceState(null, '', `/reading/${initialReading.id}`);
      }
    }
  }, [initialReading]);

  const handleExportPdfDirect = async () => {
    if (!laSoData) return;
    try {
      setIsExportingPdf(true);
      await exportReadingToPdf({
        userInfo: {
          fullName: laSoData.chuSo.fullName || fullName,
          gender: laSoData.chuSo.amDuongNamNu,
          birthDate: laSoData.chuSo.solarDate || birthDate,
          birthTime: laSoData.chuSo.birthTimeStr || birthTime,
        },
        deckType: DeckType.TU_VI,
        question: question || 'Luận giải toàn diện Lá số Tử Vi Đẩu Số',
        aiInterpretation: interpretation,
        tuViData: laSoData,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Lỗi xuất PDF tử vi:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    if (initialReading) {
      setStep('result');
      setReadingId(initialReading.id);
      setFullName(initialReading.userInfo?.fullName || '');
      setGender(initialReading.userInfo?.gender || 'Nam');
      setBirthDate(initialReading.userInfo?.birthDate || '');
      setBirthTime(initialReading.userInfo?.birthTime || '14:30');
      setQuestion(initialReading.question || '');
      setInterpretation(initialReading.aiInterpretation || null);
      setFollowUps(initialReading.followUps || []);
      setIsSaved(true);

      if (initialReading.tuViData) {
        setLaSoData(initialReading.tuViData);
      } else if (initialReading.userInfo?.birthDate) {
        try {
          const chart = buildLaSoTuVi({
            fullName: initialReading.userInfo.fullName || 'Tín chủ',
            gender: (initialReading.userInfo.gender as any) || 'Nam',
            birthDate: initialReading.userInfo.birthDate,
            birthTime: initialReading.userInfo.birthTime || '14:30',
            calendarType: 'solar',
            isLeapMonth: false,
            noiSinh: 'Việt Nam',
            viewingYear: 2026,
            selectedTopics: ['Tổng quan vận mệnh'],
          });
          setLaSoData(chart);
        } catch (e) {
          console.warn('Fallback chart build error:', e);
        }
      }
    }
  }, [initialReading]);

  useEffect(() => {
    if (step !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % tuViLoadingMessages.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [step]);

  const handleBirthDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 5) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setBirthDate(formatted);
  };

  const handleBirthTimeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    setBirthTime(formatted);
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicName)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((t) => t !== topicName);
      } else {
        return [...prev, topicName];
      }
    });
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === TU_VI_TOPICS.length) {
      setSelectedTopics(['Tổng quan vận mệnh']);
    } else {
      setSelectedTopics(TU_VI_TOPICS.map((t) => t.id));
    }
  };

  const handleGenerateLaSo = async () => {
    if (!fullName.trim() || birthDate.length < 8) return;
    if (!systemSettings.enableGuestReadings && !currentUser) {
      openAuthModal();
      return;
    }

    setStep('loading');
    setApiError(null);

    try {
      // 1. Calculate the authentic chart with all free-text fields
      const chart = buildLaSoTuVi({
        fullName: fullName.trim(),
        gender,
        calendarType,
        isLeapMonth,
        birthDate,
        birthTime: birthTime.trim() || '12:00',
        noiSinh: noiSinh.trim() || 'Việt Nam',
        viewingYear: Number(viewingYear) || 2026,
        selectedFocus: selectedTopics.join(', '),
        selectedTopics,
        question: question.trim(),
      });
      setLaSoData(chart);

      // 2. Request AI Master Interpretation following the detailed prompt
      const aiResponse = await interpretTuViReading(chart, question.trim());
      setInterpretation(aiResponse);

      // 3. Prepare ReadingResult with fresh unique ID
      const newReadingId = `tuvi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setReadingId(newReadingId);

      const resultObj: ReadingResult = {
        id: newReadingId,
        userId: currentUser?.uid || 'guest',
        timestamp: Date.now(),
        question: question.trim() || `Lá số Tử Vi: ${fullName.trim()} (${chart.chuSo.banMenhNapAm} - Cục ${chart.chuSo.cuc})`,
        theme: ReadingTheme.OVERVIEW,
        spreadType: SpreadType.CELTIC_CROSS,
        deckType: DeckType.TU_VI,
        userInfo: {
          fullName: fullName.trim(),
          gender,
          birthDate,
          birthTime: birthTime.trim(),
          request: question.trim(),
        },
        drawnCards: [],
        aiInterpretation: aiResponse,
        followUps: [],
        tuViData: chart,
      };

      // Auto-save to history (local storage for guest, firestore for authenticated users)
      try {
        await saveNewReading(resultObj);
        setIsSaved(true);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/reading/${newReadingId}`);
        }
      } catch (err) {
        console.warn('Could not auto save reading:', err);
      }

      setStep('result');
    } catch (err: any) {
      console.error('Error generating Tu Vi reading:', err);
      setApiError(err?.message || 'Có lỗi xảy ra khi luận giải lá số');
      setStep('result');
    }
  };

  const handleSaveToHistory = async () => {
    if (isSaved || !laSoData || !interpretation) return;

    try {
      const resultObj: ReadingResult = {
        id: readingId,
        userId: currentUser?.uid || 'guest',
        timestamp: Date.now(),
        question: question.trim() || `Lá số Tử Vi: ${fullName.trim()} (${laSoData.chuSo.banMenhNapAm} - Cục ${laSoData.chuSo.cuc})`,
        theme: ReadingTheme.OVERVIEW,
        spreadType: SpreadType.CELTIC_CROSS,
        deckType: DeckType.TU_VI,
        userInfo: {
          fullName,
          gender,
          birthDate,
          birthTime,
          request: question.trim(),
        },
        drawnCards: [],
        aiInterpretation: interpretation,
        followUps,
        tuViData: laSoData,
      };

      await saveNewReading(resultObj);
      setIsSaved(true);
    } catch (e) {
      console.error('Error saving reading:', e);
    }
  };

  const handleCopyInterpretation = () => {
    if (!interpretation) return;
    navigator.clipboard.writeText(interpretation);
    setIsCopiedInterpretation(true);
    setTimeout(() => setIsCopiedInterpretation(false), 2000);
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || isAnsweringFollowUp || !laSoData || !interpretation) return;

    const q = followUpQuestion.trim();
    setFollowUpQuestion('');
    setIsAnsweringFollowUp(true);

    try {
      const ans = await interpretTuViFollowUp(laSoData, interpretation, q);
      const newMsg: FollowUpMessage = {
        id: `fu-${Date.now()}`,
        question: q,
        answer: ans,
        timestamp: Date.now(),
      };
      const nextList = [...followUps, newMsg];
      setFollowUps(nextList);

      if (isSaved) {
        await updateFollowUps(readingId, nextList);
      }
    } catch (err) {
      console.error('Follow-up error:', err);
    } finally {
      setIsAnsweringFollowUp(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 px-3 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
      {/* Top Navigation Bar with Motion */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex items-center justify-between mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-950/40 text-purple-200 hover:text-white hover:bg-purple-900/40 text-sm font-semibold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.span
            whileHover={{ scale: 1.03 }}
            className="px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold text-xs uppercase tracking-widest hidden sm:flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Bói Tử Vi Đẩu Số
          </motion.span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* STEP 1: INPUT FORM */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full max-w-3xl"
          >
            <LiquidGlassCard className="p-6 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
              {/* Background aura light */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8 relative z-10"
              >
                <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-600/20 border border-amber-400/30 text-amber-300 mb-3 shadow-xl shadow-amber-400/10">
                  <Compass className="w-9 h-9 animate-spin-slow" />
                </div>
                <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Lập Lá Số Tử Vi Đẩu Số Chuẩn Xác
                </h2>
                <p className={`text-xs sm:text-sm mt-2 max-w-lg mx-auto ${settings.theme === 'dark' ? 'text-purple-300/80' : 'text-purple-900/80'}`}>
                  Hỗ trợ nhập tự do giờ sinh, nơi sinh, năm xem hạn. Tự động tính Âm Dương, Can Chi, Tiết Khí, Cục số, 14 Chính Tinh & Tuần/Triệt.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 text-left relative z-10"
              >
                {/* 1. THÔNG TIN CƠ BẢN: Họ tên & Giới tính & Nơi sinh */}
                <motion.div variants={itemVariants} className="space-y-4 p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-purple-200/60 dark:border-purple-500/20 backdrop-blur-md">
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 1. Thông tin cơ bản của đương số
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Họ tên */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={`text-xs font-semibold flex items-center gap-1.5 ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                        <User className="w-3.5 h-3.5 text-purple-400" /> Họ và tên
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className={`w-full rounded-2xl px-4 py-3 font-medium transition-all outline-none border backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/50 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/70 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>

                    {/* Giới tính */}
                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                        Giới tính
                      </label>
                      <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border backdrop-blur-md ${
                        settings.theme === 'dark'
                          ? 'bg-white/[0.05] border-purple-500/20'
                          : 'bg-white/50 border-purple-200'
                      }`}>
                        {['Nam', 'Nữ'].map((g) => (
                          <motion.button
                            key={g}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setGender(g)}
                            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              gender === g
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                                : settings.theme === 'dark'
                                ? 'text-purple-300/70 hover:text-white hover:bg-white/5'
                                : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-100/50'
                            }`}
                          >
                            {g}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nơi sinh (Tự do nhập tỉnh/thành phố, quốc gia) */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold flex items-center justify-between ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" /> Nơi sinh (Tỉnh / Thành phố, Quốc gia)
                      </span>
                      <span className="text-[11px] opacity-60">Tự do nhập</span>
                    </label>
                    <input
                      type="text"
                      value={noiSinh}
                      onChange={(e) => setNoiSinh(e.target.value)}
                      placeholder="Ví dụ: Hà Nội, Việt Nam hoặc TP. Hồ Chí Minh..."
                      className={`w-full rounded-2xl px-4 py-3 font-medium transition-all outline-none border text-sm backdrop-blur-md ${
                        settings.theme === 'dark'
                          ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                          : 'bg-white/50 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/70 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                      }`}
                    />
                  </div>
                </motion.div>

                {/* 2. NGÀY & GIỜ SINH: Dương/Âm lịch, Giờ sinh tự do */}
                <motion.div variants={itemVariants} className="space-y-4 p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-purple-200/60 dark:border-purple-500/20 backdrop-blur-md">
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 2. Ngày sinh & Giờ sinh (Tự do nhập)
                  </div>

                  {/* Lịch & Ngày sinh */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className={`text-xs font-semibold ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                        Loại lịch nhập vào
                      </label>
                      <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border backdrop-blur-md ${
                        settings.theme === 'dark'
                          ? 'bg-white/[0.05] border-purple-500/20'
                          : 'bg-white/50 border-purple-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setCalendarType('solar')}
                          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            calendarType === 'solar'
                              ? 'bg-amber-500 text-black shadow-md font-bold'
                              : settings.theme === 'dark'
                              ? 'text-purple-300/70 hover:text-white hover:bg-white/5'
                              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-100/50'
                          }`}
                        >
                          Dương lịch
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalendarType('lunar')}
                          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            calendarType === 'lunar'
                              ? 'bg-amber-500 text-black shadow-md font-bold'
                              : settings.theme === 'dark'
                              ? 'text-purple-300/70 hover:text-white hover:bg-white/5'
                              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-100/50'
                          }`}
                        >
                          Âm lịch
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold flex items-center justify-between ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          Ngày sinh ({calendarType === 'solar' ? 'Dương lịch' : 'Âm lịch'})
                        </span>
                        <span className="text-[11px] opacity-60">dd/mm/yyyy</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={birthDate}
                        onChange={(e) => handleBirthDateChange(e.target.value)}
                        placeholder="dd/mm/yyyy (vd: 15/09/1998)"
                        className={`w-full rounded-2xl px-4 py-3 font-medium transition-all outline-none border font-mono text-sm backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/50 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/70 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-semibold flex items-center gap-1.5 ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          Giờ sinh
                        </label>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                          {parsedTimePreview.canhGio.label}
                        </span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={birthTime}
                        onChange={(e) => handleBirthTimeChange(e.target.value)}
                        placeholder="hh:mm (vd: 14:30 hoặc 08:15)"
                        className={`w-full rounded-2xl px-4 py-3 font-medium transition-all outline-none border font-mono text-sm backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/50 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/70 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>

                  {calendarType === 'lunar' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="checkbox"
                        id="leapMonthCheck"
                        checked={isLeapMonth}
                        onChange={(e) => setIsLeapMonth(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-black/50 border-purple-500/40 cursor-pointer"
                      />
                      <label htmlFor="leapMonthCheck" className={`text-xs cursor-pointer ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                        Sinh vào tháng nhuận của năm âm lịch
                      </label>
                    </motion.div>
                  )}
                </motion.div>

                {/* 3. NỘI DUNG MUỐN XEM & NĂM XEM HẠN */}
                <motion.div variants={itemVariants} className="space-y-4 p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-purple-200/60 dark:border-purple-500/20 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> 3. Nội dung muốn xem & Năm xem hạn
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAllTopics}
                      className="text-[11px] text-purple-600 dark:text-purple-300 hover:text-amber-500 dark:hover:text-amber-300 underline transition-colors cursor-pointer"
                    >
                      {selectedTopics.length === TU_VI_TOPICS.length ? 'Bỏ chọn bớt' : 'Chọn tất cả'}
                    </button>
                  </div>

                  {/* Multi-selection topic chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TU_VI_TOPICS.map((topic) => {
                      const isSelected = selectedTopics.includes(topic.id);
                      return (
                        <motion.button
                          key={topic.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleTopic(topic.id)}
                          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-left transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-400/20 border-amber-400 text-amber-900 dark:text-amber-200 shadow-md shadow-amber-400/10'
                              : 'bg-white/40 dark:bg-purple-950/40 border-purple-200/50 dark:border-white/10 text-purple-900/80 dark:text-purple-300/80 hover:bg-white/60 dark:hover:bg-purple-900/40 hover:text-purple-950 dark:hover:text-white'
                          }`}
                        >
                          <span className="text-sm shrink-0">{topic.icon}</span>
                          <span className="truncate flex-1">{topic.label}</span>
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 opacity-40 shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* NĂM XEM HẠN TỰ DO NHẬP - KHÔNG BẮT BUỘC SELECT */}
                  <div className="pt-2 border-t border-purple-200/40 dark:border-white/10 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className={`text-xs font-semibold flex items-center gap-1.5 ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        Năm xem hạn (Tự do nhập năm: 2025, 2026, 2027...)
                      </label>
                      <motion.span
                        key={viewingYear}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-400/20 border border-cyan-400/40 text-cyan-700 dark:text-cyan-200"
                      >
                        {getYearCanChiPreview(Number(viewingYear))}
                      </motion.span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={1920}
                        max={2100}
                        value={viewingYear}
                        onChange={(e) => setViewingYear(parseInt(e.target.value, 10) || 2026)}
                        placeholder="Nhập năm xem hạn (vd: 2026)"
                        className={`w-full rounded-2xl px-4 py-2.5 font-medium transition-all outline-none border font-mono text-sm backdrop-blur-md ${
                          settings.theme === 'dark'
                            ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                            : 'bg-white/50 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/70 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                      <div className="flex items-center gap-1.5">
                        {[2025, 2026, 2027, 2028].map((yr) => (
                          <motion.button
                            key={yr}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewingYear(yr)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                              viewingYear === yr
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-800 dark:text-cyan-200'
                                : 'bg-white/40 dark:bg-purple-950/30 border-purple-200/40 dark:border-white/10 text-purple-900 dark:text-purple-300 hover:text-purple-950 dark:hover:text-white'
                            }`}
                          >
                            {yr}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CÂU HỎI THẮC MẮC CỤ THỂ */}
                  <div className="pt-2 border-t border-purple-200/40 dark:border-white/10 space-y-1.5">
                    <label className={`text-xs font-semibold flex items-center gap-1.5 ${settings.theme === 'dark' ? 'text-purple-200' : 'text-slate-700'}`}>
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      Câu hỏi / Thắc mắc cụ thể muốn AI luận giải chi tiết
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ví dụ: Năm nay tôi định đổi việc hoặc đầu tư bất động sản vào tháng mấy thì thuận lợi? Cung Phu thê của tôi cần lưu ý điều gì?..."
                      rows={3}
                      className={`w-full rounded-2xl px-4 py-3 font-medium transition-all outline-none border resize-none text-sm backdrop-blur-md ${
                        settings.theme === 'dark'
                          ? 'bg-white/[0.05] border-purple-500/30 hover:border-purple-400/50 focus:border-purple-400 focus:bg-white/[0.09] focus:ring-2 focus:ring-purple-500/30 text-white placeholder:text-purple-300/40'
                          : 'bg-white/50 border-purple-200/90 hover:border-purple-300 focus:border-purple-600 focus:bg-white/70 focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400 shadow-sm'
                      }`}
                    />
                  </div>
                </motion.div>

                {/* Submit button with bounce & shine */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!fullName.trim() || birthDate.length < 8) return;
                    handleGenerateLaSo();
                  }}
                  className={`mt-2 ${(!fullName.trim() || birthDate.length < 8) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                >
                  <LiquidGlassCard
                    borderRadius="16px"
                    blurIntensity="md"
                    borderIntensity="sm"
                    shadowIntensity="xl"
                    glowIntensity="md"
                    className="bg-gradient-to-r from-amber-600/80 via-purple-600/80 to-amber-700/80 text-white shadow-2xl shadow-purple-900/40 cursor-pointer"
                    contentClassName="py-4 px-6 font-bold uppercase tracking-widest text-sm sm:text-base flex items-center justify-center gap-2 text-white"
                  >
                    <Compass className="w-5 h-5 animate-spin-slow text-amber-200" />
                    <span>Lập Lá Số & Khởi Chiếu AI Luận Giải</span>
                    <ChevronRight className="w-5 h-5" />
                  </LiquidGlassCard>
                </motion.div>
              </motion.div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* STEP 2: LOADING SCREEN WITH ANIMATION */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center justify-center my-16 text-center max-w-md mx-auto"
          >
            <div className="relative w-44 h-44 flex items-center justify-center mb-8">
              {/* Spinning Bagua Outer Aura */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-purple-400/40 animate-spin-reverse" />
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin-slow" />
              
              {/* Glowing Pulse center */}
              <div className="w-24 h-24 rounded-full bg-purple-950/90 border-2 border-amber-400 flex items-center justify-center shadow-2xl shadow-purple-600/60 relative">
                <Compass className="w-12 h-12 text-amber-300 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              </div>
            </div>

            <motion.h3
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-serif font-bold text-white mb-2"
            >
              Khởi Chiếu Thiên Bàn Tử Vi
            </motion.h3>

            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-amber-300/90 font-medium min-h-[44px] px-4 leading-relaxed"
              >
                {tuViLoadingMessages[loadingStepIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Stepped Progress Dots */}
            <div className="flex items-center gap-2 mt-4">
              {tuViLoadingMessages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === loadingStepIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: RESULT SCREEN WITH FULL ANIMATION */}
        {step === 'result' && laSoData && (
          <motion.div
            key="result"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-8"
          >
            {/* Action Bar */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">
                    Lá Số Tử Vi: {laSoData.chuSo.fullName}
                  </h3>
                  <div className="text-xs text-purple-200/80">
                    {laSoData.chuSo.amDuongNamNu} • Mệnh {laSoData.chuSo.banMenhNapAm} • {laSoData.chuSo.cuc}
                    {laSoData.chuSo.canLuongChi && ` • ${laSoData.chuSo.canLuongChi}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportPdfDirect}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Xuất lá số thành file PDF chuyên nghiệp để lưu trữ hoặc in ấn"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Xuất PDF Lá Số'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveToHistory}
                  disabled={isSaved}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {isSaved ? 'Đã lưu lá số' : 'Lưu lá số'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Chia sẻ
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('form')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-purple-500/30 text-purple-200 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Lập lá số khác
                </motion.button>
              </div>
            </motion.div>

            {/* Visual Interactive 12 Palaces Chart (TracuuTuVi style) */}
            <motion.div variants={itemVariants}>
              <TuViChart
                laSo={laSoData}
                onExportPdf={handleExportPdfDirect}
                isExportingPdf={isExportingPdf}
              />
            </motion.div>

            {/* AI Master Detailed Interpretation (5 sections) */}
            <motion.div variants={itemVariants}>
              <LiquidGlassCard className="p-6 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-purple-600/30 text-amber-300 border border-amber-400/40">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                        Luận Giải Chi Tiết Từ Bậc Thầy Tử Vi
                      </h3>
                      <div className="text-xs text-purple-300/80">
                        Bản Mệnh & Cục • Tam Cung Then Chốt • Vận Hạn Năm {laSoData.chuSo.viewingYear} • Đức Năng Thắng Số
                      </div>
                    </div>
                  </div>

                  {interpretation && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyInterpretation}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-400/30 text-purple-200 text-xs font-semibold cursor-pointer transition-all"
                    >
                      {isCopiedInterpretation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedInterpretation ? 'Đã sao chép' : 'Sao chép bài giải'}</span>
                    </motion.button>
                  )}
                </div>

                {apiError ? (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Không thể lấy luận giải AI:</div>
                      <div>{apiError}</div>
                    </div>
                  </div>
                ) : interpretation ? (
                  <div className="prose prose-invert prose-purple max-w-none text-left text-purple-100 text-sm sm:text-base leading-relaxed space-y-4">
                    <ReactMarkdown>{interpretation}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-10 text-purple-300/70">
                    Đang tải luận giải...
                  </div>
                )}
              </LiquidGlassCard>
            </motion.div>

            {/* Follow-Up Questions Section */}
            <motion.div variants={itemVariants}>
              <LiquidGlassCard className="p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <HelpCircle className="w-5 h-5 text-amber-300" />
                  <h4 className="text-lg font-bold font-serif text-white">
                    Thỉnh Giáo Tiếp Nối Với Bậc Thầy Tử Vi
                  </h4>
                </div>
                <p className="text-xs text-purple-300/80 mb-6 text-left">
                  Bạn có thắc mắc cụ thể về cung nào trong lá số, thời điểm khởi sự làm ăn, hôn nhân hay cách hóa giải sao xấu? Hãy gửi câu hỏi tại đây để được chỉ dẫn.
                </p>

                {/* History of follow ups */}
                {followUps.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {followUps.map((fu) => (
                      <motion.div
                        key={fu.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/20 text-left space-y-2"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <MessageSquare className="w-3.5 h-3.5" /> Câu hỏi: {fu.question}
                        </div>
                        <div className="prose prose-invert prose-purple max-w-none text-xs sm:text-sm text-purple-100 leading-relaxed pt-2 border-t border-white/10">
                          <ReactMarkdown>{fu.answer}</ReactMarkdown>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendFollowUp} className="flex gap-2">
                  <input
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="Hỏi thêm về lá số của bạn (vd: Cung Quan Lộc của tôi năm nay có gì đột phá?)..."
                    disabled={isAnsweringFollowUp}
                    className="flex-1 rounded-2xl px-4 py-3 bg-black/40 border border-purple-500/30 text-white placeholder:text-purple-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!followUpQuestion.trim() || isAnsweringFollowUp}
                    className="px-5 py-3 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 text-xs sm:text-sm shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isAnsweringFollowUp ? (
                      <Compass className="w-4 h-4 animate-spin-slow" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Gửi hỏi
                  </motion.button>
                </form>
              </LiquidGlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {laSoData && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          question={question || `Lá số Tử Vi Đẩu Số (${laSoData.chuSo.banMenhNapAm} - Cục ${laSoData.chuSo.cuc})`}
          userInfo={{
            fullName,
            gender,
            birthDate,
            birthTime,
          }}
          drawnCards={[]}
          aiInterpretation={interpretation}
          deckType={DeckType.TU_VI}
          spreadType={SpreadType.CELTIC_CROSS}
          timestamp={Date.now()}
          tuViData={laSoData}
        />
      )}
    </div>
  );
};

export default TuViScreen;
