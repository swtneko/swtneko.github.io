import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { DrawnCard, UserInfo, DeckType, SpreadType } from '../types';
import { Sparkles, Download, Share2, Copy, Check, X, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { LiquidGlassCard } from './LiquidGlassCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  userInfo: UserInfo;
  drawnCards: DrawnCard[];
  aiInterpretation: string | null;
  deckType: DeckType;
  spreadType: SpreadType;
  timestamp?: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  question,
  userInfo,
  drawnCards,
  aiInterpretation,
  deckType,
  spreadType,
  timestamp = Date.now(),
}) => {
  const { settings } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const dateFormatted = new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Extract clean structured summary text without cutting off mid-sentence
  const parseAIInterpretation = (text: string | null) => {
    if (!text) return { bodyText: 'Quẻ bài mang lại năng lượng định hướng và trí tuệ từ Vũ Trụ.', modelCredit: '' };
    let body = text
      .replace(/#{1,6}\s?/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    let modelCredit = '';
    const creditMatch = body.match(/(✨?\s*Diễn giải bởi\s+.*)/i);
    if (creditMatch) {
      modelCredit = creditMatch[1].trim();
      body = body.replace(creditMatch[0], '').trim();
    }

    return { bodyText: body, modelCredit };
  };

  const { bodyText, modelCredit } = parseAIInterpretation(aiInterpretation);

  const getTruncatedText = (text: string, maxLen = 420) => {
    if (text.length <= maxLen) return text;
    const truncated = text.substring(0, maxLen);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '... (Xem luận giải đầy đủ tại Tarot Thiên Không)';
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        cacheBust: true,
        pixelRatio: 3, // Ultra High 3K resolution for ultra crisp text & images
        fontEmbedCSS: '', // Avoid reading external Google Fonts CORS stylesheets
        filter: (node) => {
          if (node && (node as HTMLElement).tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `Tarot-Thien-Khong-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        cacheBust: true,
        pixelRatio: 3,
        fontEmbedCSS: '', // Avoid reading external Google Fonts CORS stylesheets
        filter: (node) => {
          if (node && (node as HTMLElement).tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            return false;
          }
          return true;
        },
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `tarot-thien-khong-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Kết Quả Trải Bài Tarot Thiên Không',
          text: `🌌 Trải bài Tarot cho câu hỏi: "${question}" tại Thiên Không!`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Share failed:', err);
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        className="relative w-full max-w-[460px] h-full max-h-[90vh] my-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl z-[120]"
      >
        <LiquidGlassCard
          className="w-full flex flex-col h-full max-h-[90vh]"
          contentClassName={`flex flex-col h-full max-h-full ${settings.theme === 'dark' ? 'text-purple-100' : 'text-slate-900'}`}
        >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-purple-500/20 bg-purple-950/60 sticky top-0 z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-amber-300" />
            <h3 className="font-serif font-bold text-base text-purple-100">Chia sẻ quẻ bài</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Đóng"
          >
            <X className="w-4 h-4 text-amber-300" />
          </button>
        </div>

        {/* Scrollable Container containing Card Preview */}
        <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto flex flex-col items-center">
          <p className="text-[11px] text-purple-300 mb-3 text-center">
            Hình ảnh hiển thị đầy đủ các lá bài và lời phán từ Vũ Trụ!
          </p>

          {/* THE CAPTURABLE CARD IMAGE CANVAS AREA */}
          <div className="w-full flex justify-center">
            <div
              ref={cardRef}
              className="w-full max-w-[420px] p-5 sm:p-7 pb-8 rounded-3xl relative overflow-hidden text-left shadow-2xl bg-gradient-to-b from-[#1c0c38] via-[#0d051e] to-[#17052e] text-purple-100 border border-amber-400/40"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {/* Decorative Cosmic background effects inside card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-purple-600/30 blur-3xl pointer-events-none rounded-full" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />
              <div className="absolute inset-2 border border-amber-300/30 rounded-[1.25rem] pointer-events-none" />

              {/* Brand Top Header */}
              <div className="flex items-center justify-between mb-4 relative z-10 border-b border-amber-400/30 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-amber-500/30 border border-amber-300/50 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm tracking-widest uppercase text-amber-200">
                      Tarot Thiên Không
                    </h4>
                    <p className="text-[10px] text-purple-300 font-sans tracking-wide">
                      Trí Tuệ Vũ Trụ & Huyền Học
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-block text-[10px] whitespace-nowrap bg-amber-400/20 border border-amber-300/40 text-amber-300 px-2.5 py-0.5 rounded-full font-sans font-bold shadow-sm">
                    {spreadType === SpreadType.ONE_CARD ? 'Quẻ 1 Lá' : spreadType === SpreadType.THREE_CARDS ? 'Quẻ 3 Lá' : 'Trải Bài Chi Tiết'}
                  </span>
                </div>
              </div>

              {/* User Info & Question Box */}
              <div className="mb-4 bg-purple-950/50 border border-purple-400/30 rounded-2xl p-3 sm:p-3.5 relative z-10 font-sans">
                <div className="flex items-center justify-between text-xs text-purple-200 mb-1.5 font-bold">
                  <span>👤 Khách hàng: <strong className="text-amber-200">{userInfo.fullName || 'Tín chủ'}</strong></span>
                  <span className="text-[10px] text-purple-300">{dateFormatted}</span>
                </div>
                <div className="text-xs text-purple-200 italic font-serif leading-relaxed">
                  ❓ "{question || 'Hỏi về vận mệnh & định hướng cuộc sống'}"
                </div>
              </div>

              {/* ALL Drawn Cards Display (Grid layout dynamically adapted to number of cards) */}
              <div className="mb-5 relative z-10">
                <div className="text-[10px] uppercase tracking-widest font-sans font-bold text-amber-300 mb-2.5 text-center flex items-center justify-center space-x-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Các lá bài đã rút ({drawnCards.length} lá)</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className={`grid gap-2.5 justify-items-center ${
                  drawnCards.length === 1 
                    ? 'grid-cols-1' 
                    : drawnCards.length === 3 
                    ? 'grid-cols-3' 
                    : drawnCards.length <= 5 
                    ? 'grid-cols-5' 
                    : 'grid-cols-5'
                }`}>
                  {drawnCards.map((drawn, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center w-full">
                      <div className={`rounded-xl overflow-hidden border border-amber-300/50 shadow-xl relative bg-purple-950/80 transition-transform ${
                        drawnCards.length === 1 ? 'w-24 h-40 sm:w-28 sm:h-48' : drawnCards.length === 3 ? 'w-18 h-28 sm:w-22 sm:h-36' : 'w-12 h-18 sm:w-14 sm:h-22'
                      }`}>
                        <img
                          src={drawn.card.image}
                          alt={drawn.card.name}
                          className={`w-full h-full object-cover ${
                            drawn.isReversed ? 'rotate-180' : ''
                          }`}
                          crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      </div>
                      <span className="font-serif font-bold text-[10px] text-purple-100 mt-1 leading-tight text-center">
                        {drawn.card.name}
                      </span>
                      <span className="text-[9px] font-sans text-amber-300 font-semibold mt-0.5">
                        {drawn.isReversed ? 'Chiều Ngược' : 'Chiều Xuôi'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete AI Cosmic Interpretation Box */}
              <div className="mb-5 bg-gradient-to-b from-purple-900/40 to-indigo-950/60 border border-amber-400/30 rounded-2xl p-3.5 sm:p-4 relative z-10">
                <div className="text-[10px] sm:text-[11px] font-sans uppercase tracking-widest font-bold text-amber-300 mb-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1.5 text-amber-300" /> Thấu thị từ Vũ Trụ
                </div>
                <div className="text-[11px] sm:text-xs leading-relaxed text-purple-100 font-serif whitespace-pre-line mb-2">
                  {bodyText}
                </div>
                {modelCredit && (
                  <div className="pt-2 border-t border-purple-400/20 text-[10px] text-purple-300/80 font-sans italic">
                    {modelCredit}
                  </div>
                )}
              </div>

              {/* Watermark Footer */}
              <div className="pt-3.5 border-t border-amber-400/30 flex items-center justify-between text-[10px] sm:text-[11px] font-sans text-purple-200 relative z-10 gap-2">
                <span className="font-medium tracking-wide truncate">Trải bài miễn phí tại Tarot Thiên Không</span>
                <span className="text-amber-300 font-semibold tracking-wider whitespace-nowrap flex-shrink-0">✦ Thần Số & Tarot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3 sm:p-4 border-t border-purple-500/20 bg-purple-950/60 flex flex-col gap-2">
          <div className="flex items-center space-x-2 w-full">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Đang tạo...' : downloadSuccess ? 'Đã tải!' : 'Tải ảnh PNG HD'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ ngay</span>
            </button>
          </div>

          <div className="flex items-center justify-between space-x-2 w-full pt-1">
            <button
              onClick={shareToFacebook}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-purple-400/30 bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép link'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};
