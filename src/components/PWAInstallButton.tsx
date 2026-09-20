import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Download, X, CheckCircle2, Sparkles, Share2, MoreVertical, ExternalLink, Copy, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as standalone installed app, do not display button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCopyLink = () => {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenDirect = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <>
      <button
        id="pwa-install-header-btn"
        onClick={handleInstallClick}
        className="group relative inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.2)] transition-all duration-300 shrink-0 cursor-pointer"
        title="Cài đặt Neko Tarot thành App trên điện thoại"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Smartphone className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
        <span className="whitespace-nowrap font-medium">Cài App</span>
      </button>

      {/* Success Notification using Portal to escape navbar container */}
      {installSuccess && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-16 sm:top-20 right-4 z-[99999] flex items-center gap-2 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-white">Đang cài đặt Neko Tarot!</p>
            <p className="text-emerald-300/80">Biểu tượng ứng dụng sẽ xuất hiện trên màn hình điện thoại của bạn.</p>
          </div>
        </div>,
        document.body
      )}

      {/* Guide Modal using Portal so it's always true viewport center, NEVER clipped */}
      {showGuide && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowGuide(false)}
        >
          <div 
            className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-[#120a24] border border-purple-500/40 p-5 sm:p-6 shadow-2xl shadow-purple-950/80 text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-purple-600 to-purple-900 p-0.5 shadow-lg shadow-purple-950/50 shrink-0">
                  <img src="/pwa-192x192.png" alt="Neko Tarot" className="w-full h-full rounded-[10px] object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Cài Đặt App Neko Tarot
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  </h3>
                  <p className="text-[11px] text-purple-300/80">Trải nghiệm toàn màn hình mượt mà như app gốc</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto py-3 space-y-3.5 text-xs text-slate-300 relative z-10 pr-1">
              
              {/* Iframe Warning for AI Studio Preview */}
              {isInIframe && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-amber-200/95 space-y-2">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
                    <span>⚡ Lưu ý khi xem trong AI Studio:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/80">
                    Trình duyệt Google Chrome chặn quyền cài đặt PWA khi chạy trong khung xem trước (iframe). Để cài app ra màn hình chính điện thoại, bạn hãy mở trực tiếp bằng trình duyệt Chrome bên dưới:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleOpenDirect}
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

              {/* Tab Content: Android */}
              {activeTab === 'android' && (
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5 animate-in fade-in duration-200">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span>Các bước cài đặt trên Chrome / Cốc Cốc (Android):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-200 leading-relaxed text-[11.5px]">
                    <li className="pl-1">
                      Mở trang web bằng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Cốc Cốc</strong>.
                    </li>
                    <li className="pl-1">
                      Nhấn vào biểu tượng <strong className="text-white inline-flex items-center gap-0.5 bg-white/15 px-1.5 py-0.5 rounded border border-white/20"><MoreVertical className="w-3 h-3 inline" /> 3 chấm</strong> ở góc trên bên phải màn hình.
                    </li>
                    <li className="pl-1">
                      Chọn dòng <strong className="text-amber-300">"Cài đặt ứng dụng"</strong> hoặc <strong className="text-amber-300">"Thêm vào Màn hình chính"</strong> (Add to Home screen).
                    </li>
                    <li className="pl-1">
                      Nhấn nút <strong className="text-white">Cài đặt</strong> để xác nhận. Biểu tượng mèo Neko sẽ xuất hiện ngoài màn hình ứng dụng của bạn!
                    </li>
                  </ol>
                </div>
              )}

              {/* Tab Content: iOS */}
              {activeTab === 'ios' && (
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5 animate-in fade-in duration-200">
                  <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <span>Các bước cài đặt trên Safari (iPhone / iPad):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-200 leading-relaxed text-[11.5px]">
                    <li className="pl-1">
                      Mở trang web bằng trình duyệt <strong>Safari</strong> trên iPhone/iPad.
                    </li>
                    <li className="pl-1">
                      Nhấn nút <strong className="text-white inline-flex items-center gap-1 bg-white/15 px-1.5 py-0.5 rounded border border-white/20"><Share2 className="w-3 h-3 inline" /> Chia sẻ (Share)</strong> ở thanh công cụ dưới đáy màn hình.
                    </li>
                    <li className="pl-1">
                      Cuộn xuống chọn dòng <strong className="text-purple-300">"Thêm vào MH chính"</strong> (Add to Home Screen).
                    </li>
                    <li className="pl-1">
                      Nhấn nút <strong className="text-white">Thêm (Add)</strong> ở góc trên bên phải màn hình.
                    </li>
                  </ol>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Toàn màn hình không viền</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Khởi động siêu tốc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lưu đệm chạy mượt mà</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tự cập nhật bản mới</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 shrink-0 relative z-10">
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
