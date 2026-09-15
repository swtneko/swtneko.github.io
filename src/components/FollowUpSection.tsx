import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, Sparkles, Send, Loader2, PlusCircle, HelpCircle, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DrawnCard, FollowUpMessage, ReadingTheme, SpreadType, UserInfo, DeckType, TarotCard as TarotCardType } from '../types';
import TarotCard from './TarotCard';
import { tarotCards } from '../data/tarotCards';
import { playingCards } from '../data/playingCards';
import { interpretFollowUp, interpretFollowUpWithNewCards } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { LiquidGlassCard } from './LiquidGlassCard';

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
}) => {
  const { settings } = useSettings();
  const [questionInput, setQuestionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [cardsToDrawCount, setCardsToDrawCount] = useState<number>(1);
  const [pickedCards, setPickedCards] = useState<DrawnCard[]>([]);
  const [availableCards, setAvailableCards] = useState<TarotCardType[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Filter out already drawn cards across original & follow-ups
  const getUnusedCards = (countToExclude: number): TarotCardType[] => {
    const usedIds = new Set<string>();
    originalCards.forEach((c) => usedIds.add(c.card.id));
    followUps.forEach((fu) => {
      fu.newCards?.forEach((c) => usedIds.add(c.card.id));
    });

    const fullDeck = deckType === DeckType.TAROT ? tarotCards : playingCards;
    const remaining = fullDeck.filter((c) => !usedIds.has(c.id));
    // If remaining is low, use shuffled full deck
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
    const unused = getUnusedCards(count);
    setAvailableCards(unused);
    setPickedCards([]);
    setIsRevealed(false);
    setDrawModalOpen(true);
  };

  // Pick a card from the deck fan
  const handleSelectCard = (card: TarotCardType) => {
    if (pickedCards.length >= cardsToDrawCount) return;

    const isReversed = Math.random() > 0.7;
    const newDrawn: DrawnCard = {
      card,
      isReversed,
      positionName: cardsToDrawCount === 1 ? 'Lời khuyên làm rõ' : `Lá ${pickedCards.length + 1}`,
    };

    const updated = [...pickedCards, newDrawn];
    setPickedCards(updated);

    // If reached count, reveal and start AI interpretation
    if (updated.length === cardsToDrawCount) {
      setIsRevealed(true);
    }
  };

  // Complete the clarification reading
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
    } catch (err: any) {
      console.error('Clarification reading error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-12 space-y-8">
      {/* Existing follow-up conversations */}
      {followUps.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
            <MessageSquarePlus className="w-5 h-5" />
            <h3 className="text-xl font-serif">Hành trình làm rõ & Hỏi sâu ({followUps.length})</h3>
          </div>

          <div className="space-y-6">
            {followUps.map((fu, idx) => (
              <motion.div
                key={fu.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl overflow-hidden shadow-md"
              >
                <LiquidGlassCard
                  className="w-full p-6 md:p-8"
                  contentClassName={settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  {/* Question badge & title */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-600 text-white inline-block">
                        Câu hỏi #{idx + 1}
                      </span>
                      <h4 className="text-lg font-serif text-purple-900 dark:text-purple-200 mt-1">
                        "{fu.question}"
                      </h4>
                    </div>
                    <span className="text-[11px] opacity-50 shrink-0">
                      {new Date(fu.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>

                  {/* Newly drawn clarification cards if any */}
                  {fu.newCards && fu.newCards.length > 0 && (
                    <div className="my-6 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
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
                              <span className="text-[10px] text-purple-700 dark:text-purple-300 opacity-80">
                                {c.isReversed ? 'Ý nghĩa ngược' : 'Ý nghĩa xuôi'}
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
          </div>
        </div>
      )}

      {/* Follow-up Question Composer Box */}
      <div className="rounded-3xl overflow-hidden shadow-md">
        <LiquidGlassCard
          className="w-full p-6 md:p-8"
          contentClassName={settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}
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
                settings.theme === 'dark'
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
                  settings.theme === 'dark'
                    ? 'border-purple-500/30 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300'
                    : 'border-purple-300 hover:border-purple-600 bg-purple-50 hover:bg-purple-100 text-purple-950'
                }`}
                title="Rút 1 lá bài lời khuyên làm rõ cho câu hỏi này"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                Rút 1 lá làm rõ
              </button>
              <button
                type="button"
                disabled={loading || !questionInput.trim()}
                onClick={() => handleOpenClarificationDraw(3)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-purple-500/30 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300'
                    : 'border-purple-300 hover:border-purple-600 bg-purple-50 hover:bg-purple-100 text-purple-950'
                }`}
                title="Rút 3 lá bài chi tiết cho câu hỏi này"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                Trải 3 lá chi tiết
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !questionInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      </div>

      {/* Interactive Clarification Card Drawer Modal */}
      <AnimatePresence>
        {drawModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setDrawModalOpen(false)}
              className="fixed inset-0 liquid-glass-overlay"
            />

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-2xl mx-4 mb-0 sm:mb-4"
            >
              <LiquidGlassCard
                className="w-full rounded-[2rem] overflow-hidden"
                contentClassName={`flex flex-col ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <span className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-purple-600 text-white inline-block">
                      Trải bài tiếp nối
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif mt-3">
                      Chọn {cardsToDrawCount} lá bài cho câu hỏi của bạn
                    </h3>
                    <p className="text-xs opacity-60 mt-1 max-w-sm mx-auto italic">
                      "{questionInput}"
                    </p>
                    <p className="text-xs text-purple-500 dark:text-purple-400 font-semibold mt-2">
                      Đã chọn: {pickedCards.length}/{cardsToDrawCount} lá
                    </p>
                  </div>

                  {/* Revealed cards */}
                  {pickedCards.length > 0 && (
                    <div className="flex justify-center items-end gap-3 py-2 mb-2">
                      {pickedCards.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.5, opacity: 0, y: 30 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                          className="flex flex-col items-center"
                        >
                          <TarotCard
                            card={p.card}
                            isReversed={p.isReversed}
                            isFlipped={true}
                            deckType={deckType}
                            className="w-20 h-32 sm:w-24 sm:h-36 shadow-2xl"
                          />
                          <span className="text-[10px] font-semibold mt-1.5 text-purple-700 dark:text-purple-300 text-center max-w-[80px]">
                            {p.card.name}
                          </span>
                          <span className="text-[9px] opacity-60 dark:text-purple-400">
                            {p.isReversed ? 'Ngược' : 'Xuôi'}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Fan deck — giống ShuffleDeck */}
                  {pickedCards.length < cardsToDrawCount && (
                    <div className="relative h-56 w-full flex items-center justify-center my-2">
                      {settings.effectsEnabled && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-600/10 blur-2xl animate-pulse pointer-events-none" />
                      )}
                      {availableCards.slice(0, 13).map((card, i) => {
                        const total = Math.min(availableCards.length, 13);
                        const mid = (total - 1) / 2;
                        const offset = i - mid;
                        const fanX = offset * 20;
                        const fanY = Math.abs(offset) * 4;
                        const fanRotate = offset * 4;
                        return (
                          <motion.div
                            key={card.id || i}
                            className="absolute origin-bottom cursor-pointer"
                            initial={{ x: fanX, y: fanY, rotate: fanRotate }}
                            animate={{ x: fanX, y: fanY, rotate: fanRotate, zIndex: i }}
                            whileHover={{ y: fanY - 20, scale: 1.1, zIndex: 50, rotate: fanRotate * 0.5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            onClick={() => handleSelectCard(card)}
                          >
                            <TarotCard
                              isFlipped={false}
                              deckType={deckType}
                              className="w-24 h-36 sm:w-28 sm:h-44 shadow-2xl"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Confirm button */}
                  {pickedCards.length === cardsToDrawCount && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="button"
                      disabled={loading}
                      onClick={handleConfirmClarificationReading}
                      className="w-full mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold tracking-widest uppercase text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang giải mã thông điệp...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          Hoàn tất & Luận giải bằng AI
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Cancel */}
                  <div className="mt-3 pt-3 border-t border-purple-500/10 flex justify-center">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setDrawModalOpen(false)}
                      className="text-xs opacity-50 hover:opacity-80 transition-opacity px-4 py-1.5 cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};