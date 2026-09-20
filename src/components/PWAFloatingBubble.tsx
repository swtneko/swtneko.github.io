import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  X, 
  Sparkles, 
  Share2, 
  MoreVertical, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAFloatingBubble: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Check session storage to remember temporary dismissal
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('neko_pwa_bubble_dismissed');
      if (dismissed === 'true') {
        setIsMinimized(true);
      }
    } catch {}
  }, []);

  // NEVER show if already installed and running as standalone app
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isInstallable && !isInIframe) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
        return;
      }
    }
    setActiveTab(isIOS ? 'ios' : 'android');
    setShowGuide(true);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
    try {
      sessionStorage.setItem('neko_pwa_bubble_dismissed', 'true');
    } catch {}
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      {/* Floating Bubble on Screen */}
      <aside
        id="pwa-floating-container"
        aria-label="Cài đặt ứng dụng Neko Tarot"
        className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          {isMinimized ? (
            /* Minimized circular floating bubble */
            <motion.button
              key="minimized-bubble"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleInstallClick}
              id="pwa-bubble-minimized-btn"
              className="relative flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-[#160a2c]/95 border border-amber-400/50 shadow-[0_8px_25px_rgba(245,158,11,0.35)] backdrop-blur-xl text-amber-200 cursor-pointer group"
              title="Cài đặt App Neko Tarot"
            >
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 p-0.5 shadow-md">
                <img src="/pwa-192x192.png" alt="Neko" className="w-full h-full rounded-full object-cover" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              </div>
              <span className="text-xs font-semibold tracking-tight text-white group-hover:text-amber-300 transition">
                Cài App
              </span>
            </motion.button>
          ) : (
            /* Expanded floating card / bubble */
            <motion.div
              key="expanded-card"
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              id="pwa-floating-card"
              className="relative flex items-center gap-3 p-3 rounded-2xl bg-[#140b2a]/95 border border-purple-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-2xl text-slate-100"
            >
              {/* Close / minimize button */}
              <button
                type="button"
                onClick={handleDismiss}
                id="pwa-bubble-close-btn"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#20113d] border border-white/20 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-900 transition shadow-md cursor-pointer z-10"
                title="Thu nhỏ"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* App Icon */}
              <div 
                onClick={handleInstallClick}
                className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-950 p-0.5 shrink-0 shadow-lg shadow-purple-950/60 cursor-pointer group"
              >
                <img src="/pwa-192x192.png" alt="Neko Tarot" className="w-full h-full rounded-[10px] object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>

              {/* Information */}
              <div 
                onClick={handleInstallClick} 
                className="flex-1 min-w-0 pr-1 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">Cài Neko Tarot</h4>
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                </div>
                <p className="text-[10.5px] text-purple-200/70 truncate leading-snug">
                  Dùng toàn màn hình, mượt mà
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleInstallClick}
                id="pwa-bubble-install-action-btn"
                className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 text-black font-bold text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài App</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Success Notification */}
      {installSuccess && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-16 right-4 z-[99999] flex items-center gap-2 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-white">Đang cài đặt Neko Tarot!</p>
            <p className="text-emerald-300/80">Biểu tượng ứng dụng đã được đưa ra màn hình của bạn.</p>
          </div>
        </div>,
        document.body
      )}

      {/* Full Guide Modal using Portal */}
      {showGuide && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowGuide(false)}
        >
          <div 
            className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-[#120a24] border border-purple-500/40 p-5 sm:p-6 shadow-2xl shadow-purple-950/80 text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-purple-600 to-purple-900 p-0.5 shadow-lg shrink-0">
                  <img src="/pwa-192x192.png" alt="Neko Tarot" className="w-full h-full rounded-[10px] object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Cài Đặt App Neko Tarot
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  </h3>
                  <p className="text-[11px] text-purple-300/80">Trải nghiệm toàn màn hình như ứng dụng gốc</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto py-3 space-y-3.5 text-xs text-slate-300">
              {isInIframe && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-amber-200/95 space-y-2">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
                    <span>⚡ Lưu ý khi xem trong AI Studio:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/80">
                    Trình duyệt Google Chrome chặn cài app tự động khi chạy bên trong khung xem trước. Hãy mở trang web trực tiếp ngoài Chrome bằng nút bên dưới:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-[11px] hover:bg-amber-400 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Mở trong tab Chrome mới
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white font-medium text-[11px] hover:bg-white/15 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Đã sao chép link' : 'Sao chép link web'}
                    </button>
                  </div>
                </div>
              )}

              {/* OS Tabs */}
              <div className="flex rounded-xl bg-white/[0.06] p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'android'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Điện thoại Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>iPhone / iPad</span>
                </button>
              </div>

              {/* Android steps */}
              {activeTab === 'android' && (
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span>Các bước cài đặt trên Android:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-200 text-[11.5px] leading-relaxed">
                    <li className="pl-1">Mở trang web bằng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Cốc Cốc</strong>.</li>
                    <li className="pl-1">Nhấn vào biểu tượng <strong className="text-white inline-flex items-center gap-0.5 bg-white/15 px-1.5 py-0.5 rounded border border-white/20"><MoreVertical className="w-3 h-3 inline" /> 3 chấm</strong> ở góc trên bên phải màn hình.</li>
                    <li className="pl-1">Chọn dòng <strong className="text-amber-300">"Cài đặt ứng dụng"</strong> hoặc <strong className="text-amber-300">"Thêm vào Màn hình chính"</strong>.</li>
                    <li className="pl-1">Nhấn nút <strong>Cài đặt</strong> để hoàn tất.</li>
                  </ol>
                </div>
              )}

              {/* iOS steps */}
              {activeTab === 'ios' && (
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5">
                  <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <span>Các bước cài đặt trên Safari:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-200 text-[11.5px] leading-relaxed">
                    <li className="pl-1">Mở bằng trình duyệt <strong>Safari</strong> trên iPhone/iPad.</li>
                    <li className="pl-1">Nhấn nút <strong className="text-white inline-flex items-center gap-1 bg-white/15 px-1.5 py-0.5 rounded border border-white/20"><Share2 className="w-3 h-3 inline" /> Chia sẻ</strong> ở thanh dưới.</li>
                    <li className="pl-1">Cuộn xuống chọn dòng <strong className="text-purple-300">"Thêm vào MH chính"</strong>.</li>
                    <li className="pl-1">Nhấn nút <strong>Thêm</strong> ở góc trên bên phải.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 shrink-0">
              {isInstallable && !isInIframe && (
                <button
                  onClick={async () => {
                    setShowGuide(false);
                    await install();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 shadow-lg shadow-amber-500/25 transition active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Cài Đặt Ngay
                </button>
              )}
              <button
                onClick={() => setShowGuide(false)}
                className={`py-2.5 px-4 rounded-xl font-medium text-xs text-slate-200 bg-white/10 hover:bg-white/15 transition cursor-pointer ${
                  !isInstallable || isInIframe ? 'w-full' : ''
                }`}
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
