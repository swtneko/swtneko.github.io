import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, Sparkles, Send, Loader2, PlusCircle, HelpCircle, Layers, CheckCircle2, RefreshCw, X, RotateCcw, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DrawnCard, FollowUpMessage, ReadingTheme, SpreadType, UserInfo, DeckType, TarotCard as TarotCardType } from '../types';
import TarotCard from './TarotCard';
import ShuffleDeck from './ShuffleDeck';
import { tarotCards } from '../data/tarotCards';
import { playingCards } from '../data/playingCards';
import { interpretFollowUp, interpretFollowUpWithNewCards } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { LiquidGlassCard } from './LiquidGlassCard';
import { staggerContainer, staggerFast, cascadeItem, cascadeFade } from '../utils/motionVariants';

interface FollowUpSectionProps {
  originalQuestion: string;
  theme: ReadingTheme;
  spreadType: SpreadType;
  originalCards: DrawnCard[];
  originalInterpretation: string;
  deckType: DeckType;
  userInfo: UserInfo;
  followUps: FollowUpMessage[];
  onAddFollowUp: (followUp: FollowUpMessage) => void;
  isOwner?: boolean;
  onStartNewReading?: () => void;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  originalQuestion,
  theme,
  spreadType,
  originalCards,
  originalInterpretation,
  deckType,
  userInfo,
  followUps,
  onAddFollowUp,
  isOwner = true,
  onStartNewReading,
}) => {
  const { settings } = useSettings();
  const [questionInput, setQuestionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [cardsToDrawCount, setCardsToDrawCount] = useState<number>(1);
  const [pickedCards, setPickedCards] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Filter out already drawn cards across original reading & previous follow-ups
  const getUnusedCards = (countToExclude: number): TarotCardType[] => {
    const usedIds = new Set<string>();
    originalCards.forEach((c) => usedIds.add(c.card.id));
    followUps.forEach((fu) => {
      fu.newCards?.forEach((c) => usedIds.add(c.card.id));
    });

    const fullDeck = deckType === DeckType.TAROT ? tarotCards : playingCards;
    const remaining = fullDeck.filter((c) => !usedIds.has(c.id));
    return (remaining.length >= countToExclude ? remaining : fullDeck).sort(() => Math.random() - 0.5);
  };

  // Direct AI follow-up without drawing new cards
  const handleDirectFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = questionInput.trim();
    if (!q || loading) return;

    setLoading(true);
    try {
      const answer = await interpretFollowUp(
        originalQuestion,
        theme,
        originalCards,
        originalInterpretation,
        q,
        deckType,
        userInfo
      );

      const newFollowUp: FollowUpMessage = {
        id: `fu-${Date.now()}`,
        question: q,
        answer,
        timestamp: Date.now(),
      };

      onAddFollowUp(newFollowUp);
      setQuestionInput('');
    } catch (err: any) {
      console.error('Follow-up interpretation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open the clarification draw modal
  const handleOpenClarificationDraw = (count: number = 1) => {
    if (!questionInput.trim()) {
      alert('Vui lòng nhập câu hỏi tiếp nối trước khi rút bài làm rõ.');
      return;
    }
    setCardsToDrawCount(count);
    setPickedCards([]);
    setIsRevealed(false);
    setIsShuffling(true);
    setDrawModalOpen(true);
    setTimeout(() => {
      setIsShuffling(false);
    }, 1000);
  };

  // Perform card draw using the exact ShuffleDeck flow from the main reading
  const handleDeckDraw = (count: number) => {
    const unused = getUnusedCards(count);
    const selected = unused.slice(0, count).map((card, idx) => ({
      card,
      isReversed: Math.random() > 0.65,
      positionName: count === 1 ? 'Lời khuyên làm rõ' : `Lá ${idx + 1}`,
    }));
    setPickedCards(selected);
    setIsRevealed(true);
  };

  // Reset to draw again
  const handleRedraw = () => {
    setPickedCards([]);
    setIsRevealed(false);
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 800);
  };

  // Complete the clarification reading and start AI interpretation
  const handleConfirmClarificationReading = async () => {
    if (pickedCards.length === 0 || loading) return;

    setLoading(true);
    const q = questionInput.trim();
    setDrawModalOpen(false);

    try {
      const answer = await interpretFollowUpWithNewCards(
        originalQuestion,
        theme,
        originalCards,
        originalInterpretation,
        q,
        pickedCards,
        deckType,
        userInfo
      );

      const newFollowUp: FollowUpMessage = {
        id: `fu-${Date.now()}`,
        question: q,
        answer,
        timestamp: Date.now(),
        newCards: pickedCards,
      };

      onAddFollowUp(newFollowUp);
      setQuestionInput('');
      setPickedCards([]);
      setIsRevealed(false);
    } catch (err: any) {
      console.error('Clarification reading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDark = settings.theme === 'dark';

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="w-full mt-12 space-y-8"
    >
      {/* Existing follow-up conversations */}
      {followUps.length > 0 && (
        <div className="space-y-6">
          <motion.div variants={cascadeItem} className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
            <MessageSquarePlus className="w-5 h-5" />
            <h3 className="text-xl font-serif">Hành trình làm rõ & Hỏi sâu ({followUps.length})</h3>
          </motion.div>

          <motion.div variants={staggerFast} className="space-y-6">
            {followUps.map((fu, idx) => (
              <motion.div
                key={fu.id}
                variants={cascadeItem}
                className="w-full"
              >
                <LiquidGlassCard
                  className="w-full p-6 md:p-8"
                  contentClassName={isDark ? 'text-white' : 'text-slate-900'}
                >
                  {/* Question badge & title */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-600 text-white inline-block">
                        Câu hỏi #{idx + 1}
                      </span>
                      <h4 className="text-lg font-serif text-purple-900 dark:text-purple-200 mt-1 font-bold">
                        "{fu.question}"
                      </h4>
                    </div>
                    <span className="text-[11px] opacity-60 shrink-0 font-mono">
                      {new Date(fu.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>

                  {/* Newly drawn clarification cards if any */}
                  {fu.newCards && fu.newCards.length > 0 && (
                    <div className="my-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Lá bài trải thêm cho câu hỏi này:
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-6 py-2">
                        {fu.newCards.map((c, cIdx) => (
                          <div key={cIdx} className="flex flex-col items-center">
                            <TarotCard
                              card={c.card}
                              isReversed={c.isReversed}
                              isFlipped={true}
                              deckType={deckType}
                              className="scale-75 md:scale-90"
                            />
                            <div className="mt-2 text-center max-w-[160px]">
                              <p className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                                {c.card.name}
                              </p>
                              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                                {c.isReversed ? '⚠️ Ý nghĩa ngược' : '✨ Ý nghĩa xuôi'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI response content */}
                  <div className="prose prose-purple dark:prose-invert max-w-none text-sm md:text-base leading-relaxed markdown-body">
                    <ReactMarkdown>{fu.answer}</ReactMarkdown>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Follow-up Question Composer Box or Read-Only Viewer Notice */}
      <motion.div variants={cascadeItem}>
        {!isOwner ? (
          <LiquidGlassCard
            className="w-full p-6 md:p-8"
            contentClassName={isDark ? 'text-white' : 'text-slate-900'}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-purple-100">
                    Chế độ người xem (Chỉ đọc)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/85 mt-1 max-w-lg leading-relaxed">
                    Chỉ người tạo quẻ bói mới có quyền đặt câu hỏi tiếp nối với AI. Bạn có thể đọc toàn bộ kết quả, các câu hỏi làm rõ hiện có, hoặc tự trải quẻ bài riêng cho bản thân!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onStartNewReading) {
                    onStartNewReading();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-600/30 shrink-0 cursor-pointer transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Trải quẻ của riêng bạn</span>
              </button>
            </div>
          </LiquidGlassCard>
        ) : (
          <LiquidGlassCard
            className="w-full p-6 md:p-8"
            contentClassName={isDark ? 'text-white' : 'text-slate-900'}
          >
            <div className="flex items-center space-x-2.5 mb-2 text-slate-900 dark:text-purple-300">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl sm:text-2xl font-serif font-bold">Đặt câu hỏi tiếp nối</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-purple-200 mb-4 font-medium">
              Bạn có thể hỏi sâu thêm về các lá bài đã xuất hiện, hoặc rút thêm lá bài mới để vũ trụ làm rõ hơn câu trả lời!
            </p>

            <form onSubmit={handleDirectFollowUp} className="space-y-4">
              <div className="relative">
                <textarea
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  disabled={loading}
                  placeholder="Nhập điều bạn muốn hỏi thêm (ví dụ: 'Lời khuyên cụ thể cho tuần tới là gì?', 'Có tín hiệu nào cần đặc biệt lưu tâm?')..."
                  className={`w-full h-24 p-4 text-sm rounded-2xl transition-all resize-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium liquid-glass-input ${
                    isDark
                      ? 'text-purple-100 placeholder:text-purple-400/50 focus:border-purple-300'
                      : 'text-slate-900 placeholder:text-slate-500 focus:border-purple-600'
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-800 dark:text-purple-300 font-bold">Rút bài mới:</span>
                  <button
                    type="button"
                    disabled={loading || !questionInput.trim()}
                    onClick={() => handleOpenClarificationDraw(1)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                      isDark
                        ? 'liquid-glass-btn-subtle text-purple-200'
                        : 'border-purple-300 hover:border-purple-600 bg-purple-50 hover:bg-purple-100 text-purple-950'
                    }`}
                    title="Rút 1 lá bài lời khuyên làm rõ cho câu hỏi này"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                    Rút 1 lá làm rõ
                  </button>
                  <button
                    type="button"
                    disabled={loading || !questionInput.trim()}
                    onClick={() => handleOpenClarificationDraw(3)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                      isDark
                        ? 'liquid-glass-btn-subtle text-purple-200'
                        : 'border-purple-300 hover:border-purple-600 bg-purple-50 hover:bg-purple-100 text-purple-950'
                    }`}
                    title="Rút 3 lá bài chi tiết cho câu hỏi này"
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                    Trải 3 lá chi tiết
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !questionInput.trim()}
                  className="px-5 py-2.5 rounded-xl liquid-glass-btn-action text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Vũ trụ đang kết nối...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Hỏi sâu AI (Giải trực tiếp)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </LiquidGlassCard>
        )}
      </motion.div>

      {/* Interactive Clarification Card Drawer Modal - Powered by LiquidGlassCard & ShuffleDeck */}
      <AnimatePresence>
        {drawModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setDrawModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl my-8 z-50 flex flex-col rounded-3xl overflow-hidden"
            >
              <LiquidGlassCard
                className="w-full p-6 sm:p-8 flex flex-col items-center"
                contentClassName={isDark ? 'text-white' : 'text-slate-900'}
              >
                {/* Header with Close Button */}
                <div className="w-full flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-purple-600 text-white">
                    Trải bài tiếp nối
                  </span>
                  <button
                    onClick={() => !loading && setDrawModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-purple-300"
                    title="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-purple-100">
                    {isRevealed
                      ? `Thông điệp ${cardsToDrawCount} lá bài đã được chọn`
                      : 'Các lá bài đang kết nối...'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200 mt-1 italic max-w-md mx-auto">
                    "{questionInput}"
                  </p>
                </div>

                {/* ShuffleDeck View: The exact same experience as the main reading screen */}
                {!isRevealed ? (
                  <div className="w-full flex flex-col items-center">
                    <p className="text-xs text-slate-600 dark:text-purple-300 mb-4 font-semibold italic text-center">
                      Hãy thả lỏng tâm trí và tập trung vào năng lượng của bạn.
                    </p>
                    <ShuffleDeck
                      isShuffling={isShuffling}
                      count={cardsToDrawCount}
                      onDraw={handleDeckDraw}
                      deckType={deckType}
                    />
                  </div>
                ) : (
                  /* Revealed Cards Display */
                  <div className="w-full flex flex-col items-center space-y-6">
                    <div className="flex flex-wrap justify-center items-center gap-6 py-4">
                      {pickedCards.map((drawn, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: idx * 0.15, type: 'spring', damping: 18 }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-[11px] uppercase tracking-widest text-purple-700 dark:text-purple-300 font-bold mb-2">
                            {drawn.positionName}
                          </span>
                          <TarotCard
                            card={drawn.card}
                            isReversed={drawn.isReversed}
                            isFlipped={true}
                            deckType={deckType}
                            className="scale-90 sm:scale-100 shadow-2xl"
                          />
                          <div className="mt-3 text-center max-w-[180px]">
                            <h4 className="text-sm font-serif font-bold text-slate-900 dark:text-purple-100">
                              {drawn.card.name}
                            </h4>
                            <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                              {drawn.isReversed ? '⚠️ Chiều Ngược (Reversed)' : '✨ Chiều Xuôi (Upright)'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-purple-500/15">
                      <button
                        type="button"
                        onClick={handleRedraw}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-full border border-purple-300 dark:border-purple-500/40 text-xs font-bold text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Xào lại & Chọn lại</span>
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleConfirmClarificationReading}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                            <span>Đang giải mã thông điệp...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Tiến hành luận giải bằng AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </LiquidGlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FollowUpSection;
