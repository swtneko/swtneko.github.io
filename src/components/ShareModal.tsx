import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { toPng } from 'html-to-image';
import { DrawnCard, UserInfo, DeckType, SpreadType, LaSoTuViData } from '../types';
import { Sparkles, Download, Share2, Copy, Check, X, Image as ImageIcon, MessageCircle, Compass, FileText } from 'lucide-react';
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
  tuViData?: LaSoTuViData | null;
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
  tuViData,
}) => {
  const { settings } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const isTuVi = deckType === DeckType.TU_VI || !!tuViData;

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
    if (!text) return { bodyText: 'Kết quả mang lại năng lượng định hướng và trí tuệ từ Vũ Trụ.', modelCredit: '' };
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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        cacheBust: true,
        pixelRatio: 3, // Ultra High 3K resolution
        fontEmbedCSS: '',
        filter: (node) => {
          if (node && (node as HTMLElement).tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            return false;
          }
          return true;
        },
      });

      const prefix = isTuVi ? 'Tu-Vi-Thien-Khong' : 'Tarot-Thien-Khong';
      const link = document.createElement('a');
      link.download = `${prefix}-${Date.now()}.png`;
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
        fontEmbedCSS: '',
        filter: (node) => {
          if (node && (node as HTMLElement).tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            return false;
          }
          return true;
        },
      });

      const prefix = isTuVi ? 'tu-vi-thien-khong' : 'tarot-thien-khong';
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${prefix}-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: isTuVi ? 'Lá Số Tử Vi Đẩu Số Thiên Không' : 'Kết Quả Trải Bài Tarot Thiên Không',
          text: isTuVi 
            ? `✦ Lá số Tử Vi của ${userInfo.fullName || 'Tín chủ'} tại Thiên Không!`
            : `🌌 Trải bài Tarot cho câu hỏi: "${question}" tại Thiên Không!`,
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

  const handleCopySummaryText = () => {
    let text = '';
    if (isTuVi && tuViData) {
      text = `=== LÁ SỐ TỬ VI ĐẨU SỐ THIÊN KHÔNG ===
✦ Đương số: ${userInfo.fullName || 'Tín chủ'} (${tuViData.chuSo.amDuongNamNu})
✦ Sinh: ${userInfo.birthDate} lúc ${userInfo.birthTime || 'Không rõ'} (Giờ ${tuViData.chuSo.canhGio})
✦ Âm lịch: Ngày ${tuViData.chuSo.lunarDay}/${tuViData.chuSo.lunarMonth}/${tuViData.chuSo.lunarYear}
✦ Bát Tự Can Chi: Năm ${tuViData.chuSo.yearCanChi} • Tháng ${tuViData.chuSo.monthCanChi} • Ngày ${tuViData.chuSo.dayCanChi} • Giờ ${tuViData.chuSo.hourCanChi}
✦ Bản Mệnh: ${tuViData.chuSo.banMenhNapAm}
✦ Cục: ${tuViData.chuSo.cuc}
✦ Thân cư: ${tuViData.chuSo.thanCu} | Cung Mệnh tại: ${tuViData.chuSo.menhCungChi}
✦ Cân Xương Tính Số: ${tuViData.chuSo.canLuongChi || 'Đang cập nhật'}
✦ Năm xem hạn: Năm ${tuViData.chuSo.viewingYear} (${tuViData.chuSo.viewingYearCanChi})

--- TỔNG KẾT LUẬN GIẢI ---
${bodyText}

✦ Xem chi tiết tại: ${window.location.href}`;
    } else {
      const cardsSummary = drawnCards.map(d => `- ${d.card.name} (${d.isReversed ? 'Ngược' : 'Xuôi'})`).join('\n');
      text = `=== KẾT QUẢ TRẢI BÀI THIÊN KHÔNG ===
✦ Khách hàng: ${userInfo.fullName || 'Tín chủ'}
✦ Câu hỏi: ${question || 'Hỏi chung về vận mệnh'}
✦ Ngày xem: ${dateFormatted}

--- CÁC LÁ BÀI ---
${cardsSummary}

--- LUẬN GIẢI ---
${bodyText}

✦ Xem chi tiết tại: ${window.location.href}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
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

  // Find 4 key palaces for Tu Vi summary
  const keyPalaces = isTuVi && tuViData ? [
    tuViData.cungList.find(c => c.cungChuc === 'Mệnh'),
    tuViData.cungList.find(c => c.cungChuc === 'Quan Lộc'),
    tuViData.cungList.find(c => c.cungChuc === 'Tài Bạch'),
    tuViData.cungList.find(c => c.cungChuc === 'Thiên Di'),
  ].filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
        className="relative w-full max-w-[480px] h-full max-h-[90vh] my-auto flex flex-col z-[120]"
      >
        <div className="w-full flex flex-col h-full max-h-[90vh] rounded-3xl overflow-hidden border border-purple-500/30 bg-[#120822] shadow-2xl text-purple-100">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-purple-500/20 bg-purple-950/70 sticky top-0 z-20 shrink-0">
          <div className="flex items-center space-x-2">
            {isTuVi ? <Compass className="w-4 h-4 text-amber-300" /> : <ImageIcon className="w-4 h-4 text-amber-300" />}
            <h3 className="font-serif font-bold text-base text-purple-100">
              {isTuVi ? 'Chia sẻ Lá Số Tử Vi' : 'Chia sẻ kết quả quẻ'}
            </h3>
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
        <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto flex flex-col items-center">
          <p className="text-[11px] text-purple-300 mb-2.5 text-center">
            {isTuVi 
              ? 'Ảnh lá số định dạng HD 3K, đầy đủ Bát Tự, Mệnh Cục và Lời giải đoán!' 
              : 'Hình ảnh hiển thị đầy đủ các lá bài và lời phán từ Vũ Trụ!'}
          </p>

          {/* THE CAPTURABLE CARD IMAGE CANVAS AREA */}
          <div className="w-full flex justify-center">
            <div
              ref={cardRef}
              className="w-full max-w-[430px] p-5 sm:p-6 pb-7 rounded-3xl relative overflow-hidden text-left shadow-2xl bg-gradient-to-b from-[#1c0c38] via-[#0d051e] to-[#17052e] text-purple-100 border border-amber-400/40"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {/* Decorative Cosmic background effects inside card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-purple-600/30 blur-3xl pointer-events-none rounded-full" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />
              <div className="absolute inset-2 border border-amber-300/30 rounded-[1.25rem] pointer-events-none" />

              {/* Brand Top Header */}
              <div className="flex items-center justify-between mb-3.5 relative z-10 border-b border-amber-400/30 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-amber-500/30 border border-amber-300/50 flex items-center justify-center shadow-lg">
                    {isTuVi ? <Compass className="w-4 h-4 text-amber-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm tracking-widest uppercase text-amber-200">
                      {isTuVi ? 'Tử Vi Đẩu Số Thiên Không' : 'Tarot Thiên Không'}
                    </h4>
                    <p className="text-[10px] text-purple-300 font-sans tracking-wide">
                      {isTuVi ? 'Mệnh Bàn & Luận Giải Tinh Hoa' : 'Trí Tuệ Vũ Trụ & Huyền Học'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-block text-[10px] whitespace-nowrap bg-amber-400/20 border border-amber-300/40 text-amber-300 px-2.5 py-0.5 rounded-full font-sans font-bold shadow-sm">
                    {isTuVi 
                      ? `Hạn Năm ${tuViData?.chuSo.viewingYear || new Date().getFullYear()}` 
                      : spreadType === SpreadType.ONE_CARD ? 'Quẻ 1 Lá' : spreadType === SpreadType.THREE_CARDS ? 'Quẻ 3 Lá' : 'Trải Bài'}
                  </span>
                </div>
              </div>

              {/* TU VI MODE: Rich Astrological Info Header */}
              {isTuVi && tuViData ? (
                <div className="mb-3.5 bg-purple-950/60 border border-amber-400/30 rounded-2xl p-3 sm:p-3.5 relative z-10 font-sans space-y-2">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                    <div className="text-xs text-purple-100 font-bold">
                      👤 Đương số: <span className="text-amber-300 uppercase font-serif text-sm ml-1">{userInfo.fullName || 'Tín chủ'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold">
                      {tuViData.chuSo.amDuongNamNu}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-purple-200">
                    <div>
                      <span className="text-purple-400">Sinh: </span>
                      <strong className="text-white">{userInfo.birthDate}</strong>
                    </div>
                    <div>
                      <span className="text-purple-400">Giờ sinh: </span>
                      <strong className="text-amber-200">{tuViData.chuSo.canhGio}</strong>
                      <span className="text-[10px] text-purple-300 ml-1">({tuViData.chuSo.birthTimeStr})</span>
                    </div>
                    <div>
                      <span className="text-purple-400">Âm lịch: </span>
                      <strong className="text-white">{tuViData.chuSo.lunarDay}/{tuViData.chuSo.lunarMonth}/{tuViData.chuSo.lunarYear}</strong>
                    </div>
                    <div>
                      <span className="text-purple-400">Cân Xương: </span>
                      <strong className="text-amber-300">{tuViData.chuSo.canLuongChi || '—'}</strong>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-purple-500/20 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-1 text-purple-200">
                    <div>
                      <span className="text-purple-400">Bát Tự: </span>
                      <span className="text-amber-200 font-semibold">
                        {tuViData.chuSo.yearCanChi} • {tuViData.chuSo.monthCanChi} • {tuViData.chuSo.dayCanChi} • {tuViData.chuSo.hourCanChi}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-purple-500/20 text-[11px] flex flex-wrap items-center justify-between gap-1 text-purple-200">
                    <div>
                      <span className="text-purple-400">Mệnh: </span>
                      <strong className="text-amber-300">{tuViData.chuSo.banMenhNapAm}</strong>
                    </div>
                    <div>
                      <span className="text-purple-400">Cục: </span>
                      <strong className="text-purple-200">{tuViData.chuSo.cuc}</strong>
                    </div>
                    <div>
                      <span className="text-purple-400">Thân cư: </span>
                      <strong className="text-amber-200">{tuViData.chuSo.thanCu}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAROT / PLAYING CARDS MODE: User Info & Question Box */
                <div className="mb-4 bg-purple-950/50 border border-purple-400/30 rounded-2xl p-3 sm:p-3.5 relative z-10 font-sans">
                  <div className="flex items-center justify-between text-xs text-purple-200 mb-1.5 font-bold">
                    <span>👤 Khách hàng: <strong className="text-amber-200">{userInfo.fullName || 'Tín chủ'}</strong></span>
                    <span className="text-[10px] text-purple-300">{dateFormatted}</span>
                  </div>
                  <div className="text-xs text-purple-200 italic font-serif leading-relaxed">
                    ❓ "{question || 'Hỏi về vận mệnh & định hướng cuộc sống'}"
                  </div>
                </div>
              )}

              {/* TU VI: Tam Phương Tứ Chính Summary Grid */}
              {isTuVi && tuViData && keyPalaces.length > 0 ? (
                <div className="mb-3.5 relative z-10 font-sans">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-amber-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Tam Phương Tứ Chính Cốt Lõi
                    </span>
                    <span className="text-[9px] text-purple-300/70 font-normal">Mệnh • Quan • Tài • Di</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {keyPalaces.map((palace, pIdx) => {
                      if (!palace) return null;
                      const mainStars = palace.chinhTinh.map(s => `${s.name}${s.status ? ` (${s.status})` : ''}`).join(', ') || 'Vô Chính Diệu';
                      const isMenh = palace.cungChuc === 'Mệnh';
                      return (
                        <div
                          key={pIdx}
                          className={`p-2 rounded-xl border text-[11px] ${
                            isMenh 
                              ? 'bg-amber-500/10 border-amber-400/40' 
                              : 'bg-black/30 border-purple-500/25'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className={isMenh ? 'text-amber-300' : 'text-purple-200'}>
                              {palace.cungChuc} ({palace.chi})
                            </span>
                            {palace.isTuan && <span className="text-[9px] text-red-300 bg-red-950/60 px-1 rounded">Tuần</span>}
                            {palace.isTriet && <span className="text-[9px] text-blue-300 bg-blue-950/60 px-1 rounded">Triệt</span>}
                          </div>
                          <div className="text-[10px] text-purple-100 line-clamp-2 leading-tight">
                            {mainStars}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !isTuVi && drawnCards.length > 0 ? (
                /* TAROT: Drawn Cards Display */
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
              ) : null}

              {/* Complete AI Cosmic Interpretation Box */}
              <div className="mb-4 bg-gradient-to-b from-purple-900/40 to-indigo-950/60 border border-amber-400/30 rounded-2xl p-3 sm:p-3.5 relative z-10">
                <div className="text-[10px] sm:text-[11px] font-sans uppercase tracking-widest font-bold text-amber-300 mb-1.5 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1.5 text-amber-300" />
                  {isTuVi ? 'Lời Luận Giải Tinh Hoa Từ Thầy Tử Vi AI' : 'Thấu thị từ Vũ Trụ'}
                </div>
                <div className="text-[11px] leading-relaxed text-purple-100 font-serif whitespace-pre-line line-clamp-6">
                  {bodyText}
                </div>
                {modelCredit && (
                  <div className="pt-2 mt-2 border-t border-purple-400/20 text-[10px] text-purple-300/80 font-sans italic">
                    {modelCredit}
                  </div>
                )}
              </div>

              {/* Watermark Footer */}
              <div className="pt-3 border-t border-amber-400/30 flex items-center justify-between text-[10px] font-sans text-purple-200 relative z-10 gap-2">
                <span className="font-medium tracking-wide truncate">
                  {isTuVi ? 'Lập lá số Tử Vi chuẩn xác tại Thiên Không' : 'Trải bài miễn phí tại Tarot Thiên Không'}
                </span>
                <span className="text-amber-300 font-semibold tracking-wider whitespace-nowrap flex-shrink-0">
                  {isTuVi ? '✦ Tử Vi Đẩu Số' : '✦ Thần Số & Tarot'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3 sm:p-4 border-t border-purple-500/20 bg-purple-950/70 flex flex-col gap-2 shrink-0">
          <div className="flex items-center space-x-2 w-full">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Đang tạo...' : downloadSuccess ? 'Đã tải!' : 'Tải ảnh PNG 3K'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ ảnh</span>
            </button>
          </div>

          <div className="flex items-center justify-between space-x-2 w-full pt-1">
            <button
              onClick={handleCopySummaryText}
              className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-2 rounded-lg border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-semibold transition-all cursor-pointer truncate"
              title="Sao chép toàn bộ tóm tắt lá số & lời bình giải"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <FileText className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{copiedSummary ? 'Đã chép tóm tắt' : 'Chép tóm tắt'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-2 rounded-lg border border-purple-400/30 bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-semibold transition-all cursor-pointer truncate"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{copied ? 'Đã chép link' : 'Sao chép link'}</span>
            </button>

            <button
              onClick={shareToFacebook}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
              title="Chia sẻ lên Facebook"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              Đóng
            </button>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
};
