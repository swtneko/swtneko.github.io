import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Trash2, Calendar, MessageSquare, ChevronRight, Sparkles, BookOpen, Search, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { ReadingResult, ReadingTheme, DeckType } from '../types';
import { ShareModal } from './ShareModal';
import { LiquidGlassCard } from './LiquidGlassCard';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReading: (reading: ReadingResult) => void;
}

const themeLabels: Record<ReadingTheme, string> = {
  [ReadingTheme.LOVE]: 'Tình duyên',
  [ReadingTheme.STUDY]: 'Học tập',
  [ReadingTheme.CAREER]: 'Sự nghiệp',
  [ReadingTheme.OVERVIEW]: 'Tổng quan',
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSelectReading }) => {
  const { readings, deleteReading, currentUser, openAuthModal } = useAuth();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sharingReading, setSharingReading] = useState<ReadingResult | null>(null);

  if (!isOpen) return null;

  const filteredReadings = readings.filter((r) => {
    const q = r.question?.toLowerCase() || '';
    const name = r.userInfo?.fullName?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return q.includes(term) || name.includes(term);
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa quẻ bài này khỏi lịch sử?')) {
      setDeletingId(id);
      try {
        await deleteReading(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={settings.effectsEnabled ? { opacity: 0 } : { opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
      />

      <motion.div
        initial={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={settings.effectsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl h-full max-h-[85vh] my-8 z-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
      >
        <LiquidGlassCard
          className="w-full h-full flex flex-col max-h-[85vh] p-6 md:p-8"
          contentClassName={`flex flex-col h-full max-h-full ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
        >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif">Lịch sử trải bài</h2>
              <p className="text-xs opacity-60">
                {currentUser
                  ? `Đang lưu cho: ${currentUser.displayName || currentUser.email || 'Khách'}`
                  : 'Lưu tạm trên trình duyệt • Đăng nhập để đồng bộ đám mây'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-purple-300 z-30 shrink-0"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!currentUser && (
          <div className="mb-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
            <span className="text-purple-700 dark:text-purple-300">
              💡 Đăng nhập để không bị mất lịch sử khi đổi trình duyệt hoặc xóa cache.
            </span>
            <button
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs ml-2 shrink-0"
            >
              Đăng nhập
            </button>
          </div>
        )}

        {/* Search */}
        {readings.length > 0 && (
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* List of readings */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {readings.length === 0 ? (
            <div className="text-center py-16 opacity-50 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-sm">Chưa có quẻ bài nào trong lịch sử.</p>
              <p className="text-xs">Hãy thực hiện trải bài đầu tiên của bạn để xem tại đây!</p>
            </div>
          ) : filteredReadings.length === 0 ? (
            <div className="text-center py-10 opacity-50 text-xs">
              Không tìm thấy câu hỏi phù hợp với "{searchTerm}"
            </div>
          ) : (
            filteredReadings.map((reading) => {
              const dateStr = new Date(reading.timestamp).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });

              return (
                <div
                  key={reading.id}
                  onClick={() => {
                    onSelectReading(reading);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    settings.theme === 'dark'
                      ? 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                      : 'border-purple-100 bg-purple-50/50 hover:border-purple-300 hover:bg-purple-100/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                        {themeLabels[reading.theme] || 'Quẻ'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-medium">
                        {reading.deckType === DeckType.PLAYING_CARDS ? 'Bài Tây (52 lá)' : 'Bài Tarot'}
                      </span>
                      <span className="text-[10px] opacity-60 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {dateStr}
                      </span>
                      {reading.followUps && reading.followUps.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium flex items-center">
                          <MessageSquare className="w-2.5 h-2.5 mr-1" />
                          {reading.followUps.length} câu hỏi sâu
                        </span>
                      )}
                    </div>

                    <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100 line-clamp-1">
                      "{reading.question}"
                    </h4>

                    {/* Cards preview thumbnails */}
                    <div className="flex items-center gap-1 pt-1">
                      {reading.drawnCards.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md border border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-300 font-mono truncate max-w-[140px]"
                        >
                          {c.card.name} {c.isReversed ? '(Ngược)' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingReading(reading);
                      }}
                      className="p-2 rounded-xl text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="Chia sẻ quẻ bài này"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === reading.id}
                      onClick={(e) => handleDelete(e, reading.id)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Xóa quẻ này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-xl text-purple-600 dark:text-purple-400 flex items-center text-xs font-medium">
                      <span>Xem lại</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Share Modal */}
      {sharingReading && (
        <ShareModal
          isOpen={!!sharingReading}
          onClose={() => setSharingReading(null)}
          question={sharingReading.question}
          userInfo={sharingReading.userInfo}
          drawnCards={sharingReading.drawnCards}
          aiInterpretation={sharingReading.aiInterpretation}
          deckType={sharingReading.deckType}
          spreadType={sharingReading.spreadType}
          timestamp={sharingReading.timestamp}
        />
      )}
    </div>
  );
};

export default HistoryModal;
