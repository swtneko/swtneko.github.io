import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpreadType, ReadingTheme, DrawnCard, TarotCard as TarotCardType, UserInfo, DeckType, ReadingResult, FollowUpMessage } from '../types';
import { tarotCards } from '../data/tarotCards';
import { playingCards } from '../data/playingCards';
import ShuffleDeck from './ShuffleDeck';
import TarotCard from './TarotCard';
import { interpretReading } from '../services/geminiService';
import { Sparkles, ArrowLeft, Send, RefreshCw, BookmarkCheck, Lock, LogIn, Share2, AlertCircle, Settings, FileDown, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { FollowUpSection } from './FollowUpSection';
import { ShareModal } from './ShareModal';
import { LiquidGlassCard } from './LiquidGlassCard';
import { exportReadingToPdf } from '../services/pdfExport';
import { staggerContainer, staggerFast, cascadeItem, cascadeFade } from '../utils/motionVariants';

interface ReadingScreenProps {
  userInfo: UserInfo;
  deckType: DeckType;
  initialReading?: ReadingResult | null;
  onReset: () => void;
}

const loadingMessages = [
  'Đang kết nối năng lượng các lá bài...',
  'Đang lắng nghe thông điệp từ Vũ Trụ...',
  'Đang phân tích ý nghĩa biểu tượng & chiêm tinh...',
  'Đang đúc kết lời khuyên chân thành cho bạn...',
];

const ReadingScreen: React.FC<ReadingScreenProps> = ({ userInfo, deckType, initialReading, onReset }) => {
  const { settings } = useSettings();
  const { saveNewReading, updateFollowUps, currentUser, systemSettings, openAuthModal } = useAuth();

  const [readingId, setReadingId] = useState<string>(initialReading ? initialReading.id : `reading-${Date.now()}`);
  const [step, setStep] = useState<'question' | 'spread' | 'shuffle' | 'result'>(
    initialReading ? 'result' : userInfo.request?.trim() ? 'spread' : 'question'
  );
  const [theme] = useState<ReadingTheme>(initialReading ? initialReading.theme : ReadingTheme.OVERVIEW);
  const [question, setQuestion] = useState(initialReading ? initialReading.question : userInfo.request || '');
  const [spreadType, setSpreadType] = useState<SpreadType>(initialReading ? initialReading.spreadType : SpreadType.ONE_CARD);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>(initialReading ? initialReading.drawnCards : []);
  const [isShuffling, setIsShuffling] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(initialReading?.aiInterpretation || null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpMessage[]>(initialReading?.followUps || []);
  const [isSaved, setIsSaved] = useState(!!initialReading);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdfDirect = async () => {
    if (!drawnCards || drawnCards.length === 0) return;
    try {
      setIsExportingPdf(true);
      await exportReadingToPdf({
        userInfo,
        deckType,
        spreadType,
        question,
        drawnCards,
        aiInterpretation,
        timestamp: initialReading ? initialReading.timestamp : Date.now(),
      });
    } catch (err) {
      console.error('Lỗi khi xuất PDF Tarot:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    if (!isInterpreting) {
      setLoadingStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [isInterpreting]);

  useEffect(() => {
    if (initialReading) {
      setReadingId(initialReading.id);
      setQuestion(initialReading.question);
      setSpreadType(initialReading.spreadType);
      setDrawnCards(initialReading.drawnCards);
      setAiInterpretation(initialReading.aiInterpretation || null);
      setFollowUps(initialReading.followUps || []);
      setStep('result');
      setIsSaved(true);
      if (typeof window !== 'undefined' && !window.location.pathname.includes(initialReading.id)) {
        window.history.replaceState(null, '', `/reading/${initialReading.id}`);
      }
    }
  }, [initialReading]);

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setStep('spread');
    }
  };

  const handleSpreadSelect = (s: SpreadType) => {
    setSpreadType(s);
    setStep('shuffle');
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 3000);
  };

  const handleDraw = () => {
    const count = spreadType === SpreadType.ONE_CARD ? 1 : spreadType === SpreadType.THREE_CARDS ? 3 : 10;
    const deck = deckType === DeckType.TAROT ? tarotCards : playingCards;
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count).map((card, i) => {
      const isReversed = Math.random() > 0.7;
      let positionName = '';
      if (spreadType === SpreadType.THREE_CARDS) {
        positionName = i === 0 ? 'Past' : i === 1 ? 'Present' : 'Future';
      }
      return { card, isReversed, positionName };
    });
    setDrawnCards(selected);
    setStep('result');

    const newId = `reading-${Date.now()}`;
    setReadingId(newId);
    setFollowUps([]);
    
    // Start AI interpretation
    setIsInterpreting(true);
    setApiError(null);
    interpretReading(question, theme, spreadType, selected, deckType, userInfo).then(async (res) => {
      setAiInterpretation(res);
      setIsInterpreting(false);

      // Automatically persist to Firestore and local history
      const record: ReadingResult = {
        id: newId,
        userId: '',
        timestamp: Date.now(),
        question,
        theme,
        spreadType,
        deckType,
        userInfo,
        drawnCards: selected,
        aiInterpretation: res,
        followUps: [],
      };
      await saveNewReading(record);
      setIsSaved(true);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/reading/${newId}`);
      }
    }).catch((err) => {
      console.error(err);
      setApiError(err.message || String(err));
      setIsInterpreting(false);
    });
  };

  const handleReInterpret = () => {
    if (isInterpreting || drawnCards.length === 0) return;
    setIsInterpreting(true);
    setApiError(null);
    interpretReading(question, theme, spreadType, drawnCards, deckType, userInfo).then(async (res) => {
      setAiInterpretation(res);
      setIsInterpreting(false);

      const record: ReadingResult = {
        id: readingId,
        userId: '',
        timestamp: Date.now(),
        question,
        theme,
        spreadType,
        deckType,
        userInfo,
        drawnCards,
        aiInterpretation: res,
        followUps,
      };
      await saveNewReading(record);
    }).catch((err) => {
      console.error(err);
      setApiError(err.message || String(err));
      setIsInterpreting(false);
    });
  };

  const handleAddFollowUp = async (newFollowUp: FollowUpMessage) => {
    const updated = [...followUps, newFollowUp];
    setFollowUps(updated);
    await updateFollowUps(readingId, updated);
  };

  const reset = () => {
    setStep(userInfo.request?.trim() ? 'spread' : 'question');
    setQuestion(userInfo.request || '');
    setDrawnCards([]);
    setAiInterpretation(null);
    setFollowUps([]);
    setIsSaved(false);
    onReset();
  };

  if (!systemSettings.enableGuestReadings && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl text-center space-y-5"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-white">Yêu Cầu Đăng Nhập</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Quản trị viên đã bật chế độ bảo vệ quyền lợi thành viên. Bạn vui lòng đăng nhập tài khoản Google hoặc Email để trải bài và nhận lời giải mã từ vũ trụ.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={openAuthModal}
              className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Bằng Google / Email</span>
            </button>
            <button
              onClick={reset}
              className="w-full py-3 px-6 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs"
            >
              Quay về trang chủ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-10 px-4 max-w-4xl mx-auto flex flex-col items-center ${
      systemSettings.announcementActive && systemSettings.announcement ? 'pt-28 sm:pt-36' : 'pt-20 sm:pt-24'
    }`}>
      <AnimatePresence mode="wait">
        {step === 'question' && (
          <motion.div
            key="question"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={settings.effectsEnabled ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
            className="w-full max-w-lg"
          >
            <LiquidGlassCard
              className="w-full p-6 sm:p-10"
              contentClassName={settings.theme === 'dark' ? 'text-purple-100' : 'text-slate-900'}
            >
              <motion.h2 variants={cascadeItem} className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-slate-900 dark:text-purple-100">
                Bạn đang nghĩ gì?
              </motion.h2>
              <motion.p variants={cascadeItem} className="text-slate-700 dark:text-purple-300 mb-6 text-sm italic font-medium">
                Hãy tập trung tâm trí vào điều bạn muốn hỏi vũ trụ...
              </motion.p>
              <motion.form variants={cascadeItem} onSubmit={handleQuestionSubmit} className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc băn khoăn của bạn tại đây..."
                  rows={4}
                  className={`w-full rounded-2xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none font-medium liquid-glass-input ${
                    settings.theme === 'dark'
                      ? 'text-purple-100 placeholder:text-purple-500/40 focus:border-purple-400'
                      : 'text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-purple-600'
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!question.trim()}
                  className="absolute bottom-4 right-4 p-2.5 rounded-full bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  title="Gửi câu hỏi"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </motion.form>
            </LiquidGlassCard>
          </motion.div>
        )}

        {step === 'spread' && (
          <motion.div
            key="spread"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={settings.effectsEnabled ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
            className="w-full max-w-4xl text-center"
          >
            <motion.button variants={cascadeItem} onClick={() => setStep('question')} className="flex items-center text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-300 mb-6 hover:text-purple-950 dark:hover:text-purple-100 transition-colors mx-auto cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Chỉnh sửa câu hỏi
            </motion.button>
            <motion.h2 variants={cascadeItem} className="text-3xl sm:text-4xl font-serif font-bold mb-8 text-slate-900 dark:text-purple-100">Chọn kiểu trải bài</motion.h2>
            <motion.div variants={staggerFast} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: SpreadType.ONE_CARD, label: 'Một lá bài', desc: 'Lời khuyên nhanh & thông điệp trọng tâm', count: 1 },
                { type: SpreadType.THREE_CARDS, label: 'Ba lá bài', desc: 'Dòng thời gian: Quá khứ, Hiện tại, Tương lai', count: 3 },
                { type: SpreadType.CELTIC_CROSS, label: 'Celtic Cross', desc: 'Bức tranh toàn cảnh & phân tích chuyên sâu', count: 10 },
              ].map((item) => (
                <motion.div
                  key={item.type}
                  variants={cascadeItem}
                  whileHover={{ scale: 1.04, y: -5, transition: { type: 'spring', stiffness: 450, damping: 15 } }}
                  whileTap={{ scale: 0.96 }}
                  className="h-full"
                >
                  <LiquidGlassCard
                    onClick={() => handleSpreadSelect(item.type)}
                    className="p-6 sm:p-8 cursor-pointer h-full group text-left"
                    contentClassName="flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl font-serif font-bold text-purple-800 dark:text-purple-300">{item.count} lá</span>
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-xl font-serif font-bold mb-2 text-slate-900 dark:text-white">{item.label}</h3>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-purple-200 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {step === 'shuffle' && (
          <motion.div
            key="shuffle"
            initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-slate-900 dark:text-purple-100">Các lá bài đang kết nối...</h2>
            <p className="text-slate-700 dark:text-purple-200 mb-12 italic font-semibold">Hãy thả lỏng tâm trí và tập trung vào năng lượng của bạn.</p>
            <ShuffleDeck
              isShuffling={isShuffling}
              count={spreadType === SpreadType.ONE_CARD ? 1 : spreadType === SpreadType.THREE_CARDS ? 3 : 10}
              onDraw={handleDraw}
              deckType={deckType}
            />
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-5xl"
          >
            <motion.div variants={cascadeItem} className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-purple-100">Kết quả trải bài</h2>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                {!isInterpreting && drawnCards.length > 0 && (
                  <>
                    <button
                      onClick={handleExportPdfDirect}
                      disabled={isExportingPdf}
                      className="flex items-center space-x-1.5 text-xs sm:text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                      title="Xuất kết quả quẻ bài và lời giải đoán ra file PDF chuẩn A4"
                    >
                      {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                      <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Xuất PDF (A4)'}</span>
                    </button>

                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center space-x-1.5 text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      title="Tạo ảnh tóm tắt kết quả quẻ bài để chia sẻ mạng xã hội"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Chia sẻ kết quả</span>
                    </button>
                  </>
                )}
                <button onClick={reset} className="text-xs sm:text-sm text-purple-900 dark:text-purple-300 hover:text-purple-950 dark:hover:text-purple-100 uppercase tracking-widest font-bold px-4 py-2 rounded-full border border-purple-300 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                  Trải bài mới
                </button>
              </div>
            </motion.div>

            <motion.div 
              variants={staggerFast}
              className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12"
            >
              {drawnCards.map((drawn, i) => (
                <motion.div 
                  key={i} 
                  variants={cascadeItem}
                  whileHover={{ 
                    y: -12, 
                    scale: 1.05, 
                    transition: { type: 'spring', stiffness: 450, damping: 14 } 
                  }}
                  className="flex flex-col items-center cursor-pointer select-none"
                >
                  {drawn.positionName && (
                    <span className="text-xs text-purple-900 dark:text-purple-300 uppercase tracking-widest mb-3 font-bold">
                      {drawn.positionName === 'Past' ? 'Quá khứ' : drawn.positionName === 'Present' ? 'Hiện tại' : 'Tương lai'}
                    </span>
                  )}
                  <TarotCard
                    card={drawn.card}
                    isReversed={drawn.isReversed}
                    isFlipped={true}
                    deckType={deckType}
                    index={i}
                    className="scale-90 md:scale-100 drop-shadow-xl"
                  />
                  <div className="mt-4 text-center max-w-[220px]">
                    <h4 className="text-base font-serif font-bold text-slate-900 dark:text-purple-100 mb-1">{drawn.card.name}</h4>
                    <p className="text-xs text-purple-950 dark:text-purple-300/90 font-bold italic">
                      {drawn.isReversed ? '⚠️ Chiều Ngược (Reversed)' : '✨ Chiều Xuôi (Upright)'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={cascadeItem}>
              <LiquidGlassCard
                borderRadius="28px"
                blurIntensity="sm"
                shadowIntensity="sm"
                glowIntensity="sm"
                className="w-full rounded-3xl p-6 sm:p-10 md:p-12"
                contentClassName={settings.theme === 'dark' ? 'text-purple-100' : 'text-slate-900'}
              >
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-purple-100">Lời giải từ Vũ trụ</h3>
                  </div>
                  {isSaved && (
                    <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 font-bold flex items-center border border-emerald-500/30">
                      <BookmarkCheck className="w-3.5 h-3.5 mr-1" /> Đã lưu lịch sử
                    </span>
                  )}
                </div>
                {!isInterpreting && aiInterpretation && (
                  <button
                    onClick={handleReInterpret}
                    className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border border-purple-300 hover:border-purple-600 text-purple-900 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors cursor-pointer"
                    title="Yêu cầu AI phân tích lại hoặc thử lại với API dự phòng"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Giải lại bằng AI</span>
                  </button>
                )}
              </div>
              
              <div className="prose prose-purple dark:prose-invert max-w-none">
                {apiError ? (
                  <div className="py-6 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200 text-sm space-y-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-rose-900 dark:text-rose-300 mt-0 mb-1">
                          {apiError.toLowerCase().includes('quota') || apiError.toLowerCase().includes('resource_exhausted') || apiError.toLowerCase().includes('429')
                            ? 'Giới hạn lượt dùng (Hết Quota) Gemini'
                            : 'Không thể tải lời giải từ Vũ trụ'}
                        </h4>
                        <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed m-0">
                          {apiError.toLowerCase().includes('quota') || apiError.toLowerCase().includes('resource_exhausted') || apiError.toLowerCase().includes('429')
                            ? 'Khóa API Gemini dùng chung hiện tại đã hết lượt sử dụng định kỳ. Để tiếp tục trải bài mượt mà không giới hạn, bạn có thể tự cấu hình khóa API riêng hoặc sử dụng mô hình miễn phí từ OpenRouter.'
                            : `Chi tiết kỹ thuật từ hệ thống AI: ${apiError}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={handleReInterpret}
                        className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                        <span>Thử lại bằng AI</span>
                      </button>
                      <div className="text-[11px] text-purple-900/60 dark:text-purple-300/60 font-sans flex items-center">
                        <Settings className="w-3.5 h-3.5 mr-1" />
                        Mẹo: Bấm biểu tượng <strong className="mx-1 text-purple-700 dark:text-purple-400">⚙️ (Cài đặt)</strong> ở góc phải màn hình để cấu hình khóa của riêng bạn!
                      </div>
                    </div>
                  </div>
                ) : isInterpreting ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-6">
                    {/* Ultra-Smooth Mystical Crystal Orb with Orbiting Astrolabe */}
                    <div className="relative flex items-center justify-center my-2">
                      {settings.effectsEnabled && (
                        <motion.div
                          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-full bg-purple-500/30 blur-2xl pointer-events-none"
                        />
                      )}

                      {/* Rotating Dashed Astrolabe Ring */}
                      {settings.effectsEnabled && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                          className="absolute -inset-4 rounded-full border border-dashed border-purple-400/40 pointer-events-none flex items-center justify-center"
                        >
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-amber-300">✦</div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[10px] text-cyan-300">✦</div>
                        </motion.div>
                      )}

                      <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-purple-400/50 bg-gradient-to-tr from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center shadow-2xl shadow-purple-950/80">
                        <Sparkles className={`w-9 h-9 text-amber-300 ${settings.effectsEnabled ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>

                    {/* Smooth Fade Cycling Text Messages */}
                    <div className="space-y-2 max-w-md h-16 flex flex-col justify-center items-center">
                      <h4 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-purple-100">
                        Vũ trụ đang truyền tải thông điệp...
                      </h4>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={loadingStepIndex}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.4 }}
                          className="text-xs sm:text-sm text-purple-800 dark:text-purple-300 font-semibold italic"
                        >
                          {loadingMessages[loadingStepIndex]}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Continuous Smooth Shimmer Progress Bar */}
                    <div className="w-56 sm:w-72 h-2 rounded-full bg-purple-900/30 dark:bg-purple-950/60 overflow-hidden relative border border-purple-500/20 shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 via-amber-300 via-purple-400 to-indigo-600 rounded-full"
                        animate={settings.effectsEnabled ? { x: ['-100%', '100%'] } : { width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`text-sm sm:text-base leading-relaxed markdown-body font-normal ${
                    settings.theme === 'dark' ? 'text-purple-100/90' : 'text-slate-900'
                  }`}>
                    <ReactMarkdown>{aiInterpretation || ''}</ReactMarkdown>
                  </div>
                )}
              </div>
              </LiquidGlassCard>
            </motion.div>

            {/* Follow-up question & clarification card spread section */}
            {!isInterpreting && aiInterpretation && (
              <motion.div variants={cascadeItem}>
                <FollowUpSection
                  originalQuestion={question}
                  theme={theme}
                  spreadType={spreadType}
                  originalCards={drawnCards}
                  originalInterpretation={aiInterpretation}
                  deckType={deckType}
                  userInfo={userInfo}
                  followUps={followUps}
                  onAddFollowUp={handleAddFollowUp}
                />
              </motion.div>
            )}

            {/* Share Result Modal */}
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              question={question}
              userInfo={userInfo}
              drawnCards={drawnCards}
              aiInterpretation={aiInterpretation}
              deckType={deckType}
              spreadType={spreadType}
              timestamp={initialReading ? initialReading.timestamp : Date.now()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadingScreen;
