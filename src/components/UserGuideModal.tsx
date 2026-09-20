import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  BookOpen, 
  Compass, 
  Layers, 
  Bot, 
  Share2, 
  Smartphone, 
  Cpu, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  Shield,
  Heart,
  Briefcase,
  Coins,
  Flame,
  Star,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTarot?: () => void;
  onNavigateTuVi?: () => void;
}

type GuideTab = 'overview' | 'tarot' | 'playingCards' | 'tuvi' | 'aiChat' | 'hardware' | 'sharingPwa';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTarot,
  onNavigateTuVi,
}) => {
  const { settings, deviceInfo } = useSettings();
  const [activeTab, setActiveTab] = useState<GuideTab>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyCurrentLink = () => {
    try {
      navigator.clipboard.writeText(window.location.origin + '/huong-dan');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const tabs: { id: GuideTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Tổng Quan', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'tarot', label: 'Bói Tarot', icon: <Layers className="w-4 h-4" /> },
    { id: 'playingCards', label: 'Bài Tây 52 Lá', icon: <Compass className="w-4 h-4" /> },
    { id: 'tuvi', label: 'Lá Số Tử Vi', icon: <Star className="w-4 h-4" /> },
    { id: 'aiChat', label: 'Hỏi Sâu AI', icon: <Bot className="w-4 h-4" /> },
    { id: 'hardware', label: 'Đo Cấu Hình Máy', icon: <Cpu className="w-4 h-4" /> },
    { id: 'sharingPwa', label: 'Link & Cài App', icon: <Smartphone className="w-4 h-4" /> },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#120a24]/95 border border-purple-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.25)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-[#180d30] to-purple-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-600/30 border border-amber-400/30 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Cẩm Nang Hướng Dẫn Sử Dụng Neko Tarot
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold uppercase">
                  Toàn tập
                </span>
              </h2>
              <p className="text-[11px] text-purple-200/70">
                Tất cả tính năng, mẹo đặt câu hỏi, cách xem lá số & chia sẻ quẻ bói
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCurrentLink}
              title="Sao chép link hướng dẫn"
              className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1.5 px-4 py-2.5 bg-black/30 border-b border-white/5 scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-purple-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-purple-500/20">
          
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-purple-950/30 to-indigo-950/40 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                  <Sparkles className="w-4 h-4" />
                  <span>Chào mừng bạn đến với Neko Tarot & Tử Vi Vũ Trụ</span>
                </div>
                <p className="text-purple-100/90 leading-relaxed text-xs sm:text-[13px]">
                  Neko Tarot là không gian chiêm nghiệm huyền học kết hợp giữa nghệ thuật bói toán phương Đông & phương Tây với trí tuệ nhân tạo (AI) hiện đại. Ứng dụng giúp bạn soi sáng nội tâm, giải mã các băn khoăn về tình duyên, công danh sự nghiệp, tài lộc và vận mệnh cuộc đời.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold mb-2">
                    🃏
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Bói Bài Tarot</h4>
                  <p className="text-[11.5px] text-slate-300 leading-normal">
                    Bộ 78 lá cổ điển Rider-Waite & Tarot de Marseille giúp soi rọi tình cảm, công việc và lời khuyên hành động.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold mb-2">
                    🎴
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Bài Tây 52 Lá</h4>
                  <p className="text-[11.5px] text-slate-300 leading-normal">
                    Giải mã 4 chất Cơ - Rô - Chuồn - Bích, dự đoán vận may tài lộc, các mối quan hệ xã hội và biến cố sắp tới.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold mb-2">
                    🌌
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Tử Vi Đẩu Số</h4>
                  <p className="text-[11.5px] text-slate-300 leading-normal">
                    Quy đổi ngày sinh Âm - Dương, lập bàn 12 Cung chức, an Mệnh - Thân và luận giải vận hạn từng năm trọn đời.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Quy tắc tâm thái trước khi xem bói
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li><strong>Tâm tịnh, ý niệm rõ ràng:</strong> Hít thở sâu 3 nhịp trước khi rút bài. Tránh bốc bài khi đang quá bức xúc hoặc hoảng loạn.</li>
                  <li><strong>Không hỏi thử bài lặp lại:</strong> Không nên hỏi cùng 1 câu hỏi nhiều lần liên tục trong 1 ngày, sẽ làm nhiễu loạn năng lượng trực giác.</li>
                  <li><strong>Lá bài là người định hướng, bạn là người làm chủ:</strong> Mọi quẻ bói đều mang tính chất tham vấn năng lượng và tiềm năng; tương lai nằm trong tay lựa chọn và hành động của chính bạn.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: BÓI BÀI TAROT */}
          {activeTab === 'tarot' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Các Kiểu Trải Bài Tarot (Spread Types)
                </h3>
                <p className="text-xs text-slate-300">
                  Tùy theo mức độ phức tạp của thắc mắc, bạn có thể chọn trải bài phù hợp:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase">
                    1 Lá Bài
                  </span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Thông Điệp Nhanh / Có - Không</h4>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    Thích hợp hỏi nhanh thông điệp trong ngày, hướng giải quyết tức thì, hoặc câu trả lời xu hướng Có / Không.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                    3 Lá Bài
                  </span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Quá Khứ - Hiện Tại - Tương Lai</h4>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    Diễn tiến câu chuyện theo thời gian, hoặc theo mô hình <em>Thực trạng - Thách thức - Lời khuyên vàng</em>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                    10 Lá Bài
                  </span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Celtic Cross (Thập Tự Celtic)</h4>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    Trải bài toàn diện bậc nhất: Tâm thế tiềm thức, tác động ngoại cảnh, hy vọng, nỗi sợ và kết cục tiềm năng.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                  Cách đặt câu hỏi chuẩn xác cho bài Tarot:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                    <span className="font-bold block mb-1">✅ Nên hỏi (Mở & Chủ động):</span>
                    <ul className="list-disc list-inside space-y-1 text-[11.5px]">
                      <li>"Tôi cần chú ý điều gì trong công việc sắp tới?"</li>
                      <li>"Làm thế nào để cải thiện mối quan hệ này?"</li>
                      <li>"Năng lượng tuần này của tôi đang tập trung vào đâu?"</li>
                    </ul>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
                    <span className="font-bold block mb-1">❌ Nên tránh (Bó buộc hoặc tiêu cực):</span>
                    <ul className="list-disc list-inside space-y-1 text-[11.5px]">
                      <li>"Bao giờ tôi trúng số độc đắc?"</li>
                      <li>"Họ có đang ghét tôi không?" (Thay bằng: "Mối quan hệ này có điểm vướng mắc nào?")</li>
                    </ul>
                  </div>
                </div>
              </div>

              {onNavigateTarot && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTarot();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <span>Mở Ngay Trải Bài Tarot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BÀI TÂY 52 LÁ */}
          {activeTab === 'playingCards' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Cẩm Nang Bói Bài Tây 52 Quân Truyền Thống
                </h3>
                <p className="text-xs text-slate-300">
                  Khác với Tarot đào sâu tâm lý, bài Tây tập trung mạnh vào các sự việc đời thường, biến cố công việc và tài vận:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold text-sm">
                    <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                    <span>Chất Cơ (Hearts) - Tình Cảm & Hôn Nhân</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">
                    Đại diện cho tình yêu, gia đình, người thương, sự hòa hợp trong các mối quan hệ và sự bình an tâm hồn.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Chất Rô (Diamonds) - Tiền Bạc & Kinh Doanh</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">
                    Đại diện cho dòng tiền, hợp đồng, đầu tư tài chính, của cải vật chất và những chuyến đi xa liên quan đến công việc.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Chất Chuồn / Tép (Clubs) - Sự Nghiệp & Tri Thức</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">
                    Đại diện cho học vấn, thi cử, danh vọng, cơ hội thăng tiến và sự nâng đỡ của quý nhân bè bạn.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-600/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold text-sm">
                    <Flame className="w-4 h-4 text-slate-400" />
                    <span>Chất Bích (Spades) - Thử Thách & Biến Chuyển</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px]">
                    Đại diện cho những trở ngại, thị phi, sự trì hoãn hoặc bài học cuộc đời đòi hỏi sự kiên nhẫn vượt qua.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                  Quy luật quân Hoàng Gia (J, Q, K, Át):
                </h4>
                <p className="text-[11.5px] text-slate-300 leading-relaxed">
                  Quân <strong>Át (A)</strong> tượng trưng cho sự khởi đầu, cơ hội vàng hoặc tin tức quan trọng. Quân <strong>J (Bồi)</strong> đại diện cho người trẻ hoặc tin tức mang đến. Quân <strong>Q (Đầm)</strong> đại diện cho người phụ nữ ảnh hưởng đến bạn. Quân <strong>K (Già)</strong> đại diện cho người đàn ông quyền uy hoặc cấp trên.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: LÁ SỐ TỬ VI */}
          {activeTab === 'tuvi' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Hướng Dẫn Tra Cứu & Luận Giải Tử Vi Đẩu Số
                </h3>
                <p className="text-xs text-slate-300">
                  Hệ thống tự động quy đổi Dương lịch sang Thiên Can, Địa Chi, Tiết Khí và an 12 Cung địa bàn:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 space-y-2">
                <h4 className="font-bold text-white text-xs sm:text-sm">Các bước để có lá số chuẩn xác nhất:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li><strong>Họ và tên:</strong> Nhập họ tên thật để đồng bộ định danh phong thủy.</li>
                  <li><strong>Giới tính:</strong> Quyết định chiều an sao (Nam Dương / Nữ Âm đi thuận, ngược lại đi nghịch).</li>
                  <li><strong>Ngày tháng năm sinh:</strong> Có thể nhập Dương lịch hoặc Âm lịch (hệ thống tự đối chiếu).</li>
                  <li><strong>Giờ sinh:</strong> Rất quan trọng để định vị Cung Mệnh và Cung Thân chính xác.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm">Ý nghĩa Cung Mệnh và Cung Thân:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="font-bold text-purple-300 block mb-1">🏛️ Cung Mệnh (Tiên Thiên)</span>
                    <p className="text-[11.5px] text-slate-300">
                      Quy định tính cách gốc rễ, tài năng bẩm sinh, ngoại hình và vận mệnh giai đoạn thiếu niên (dưới 30 tuổi).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="font-bold text-indigo-300 block mb-1">🌟 Cung Thân (Hậu Thiên)</span>
                    <p className="text-[11.5px] text-slate-300">
                      Chi phối giai đoạn trung niên và hậu vận (sau 30 tuổi), thể hiện xu hướng hành động và đích đến cuộc đời.
                    </p>
                  </div>
                </div>
              </div>

              {onNavigateTuVi && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTuVi();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-amber-500/25 cursor-pointer"
                  >
                    <span>Lập Lá Số Tử Vi Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HỎI SÂU AI */}
          {activeTab === 'aiChat' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  Tính Năng Hỏi Đáp Chuyên Sâu (AI Follow-up Chat)
                </h3>
                <p className="text-xs text-slate-300">
                  Sau khi nhận lời luận giải ban đầu, bạn hoàn toàn có thể trò chuyện tiếp nối cùng AI Tarot Reader:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Hỏi sâu vào từng lá bài cụ thể</h4>
                    <p className="text-slate-300 text-[11.5px]">
                      Ví dụ: <em>"Lá bài The Tower ở vị trí thách thức mang ý nghĩa gì cụ thể trong mối quan hệ này?"</em>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Rút thêm lá bài bổ trợ (Clarification Card)</h4>
                    <p className="text-slate-300 text-[11.5px]">
                      Khi một khía cạnh chưa rõ ràng, bạn có thể yêu cầu: <em>"Hãy rút thêm cho tôi 1 lá để làm rõ lời khuyên công việc."</em>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Lưu giữ toàn bộ hội thoại</h4>
                    <p className="text-slate-300 text-[11.5px]">
                      Mọi câu hỏi và câu trả lời tiếp nối đều được tự động lưu vào Lịch sử quẻ bói của bạn và đồng bộ lên đám mây khi đã đăng nhập.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ĐO CẤU HÌNH MÁY & HIỆU NĂNG */}
          {activeTab === 'hardware' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Cơ Chế Tự Động Đo Cấu Hình Thiết Bị (Hardware Detection)
                </h3>
                <p className="text-xs text-slate-300">
                  Neko Tarot tích hợp thuật toán tự động nhận diện phần cứng điện thoại để cân chỉnh animation mượt mà nhất:
                </p>
              </div>

              {/* Real-time Hardware Card of Current User */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 via-purple-900/40 to-[#1b0d38] border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300">Cấu hình máy của bạn hiện tại:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    deviceInfo.tier === 'high' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : deviceInfo.tier === 'medium'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {deviceInfo.tier === 'high' ? '🟢 Máy Khỏe / Mượt' : deviceInfo.tier === 'medium' ? '🔵 Cấu Hình Cân Bằng' : '🟡 Tiết Kiệm Pin / Máy Yếu'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-purple-300 block">Số nhân CPU</span>
                    <span className="font-bold text-white">{deviceInfo.cpuCores} Cores</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-purple-300 block">Bộ nhớ RAM</span>
                    <span className="font-bold text-white">{deviceInfo.memoryGB ? `~${deviceInfo.memoryGB} GB` : 'Tiêu chuẩn'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 col-span-2">
                    <span className="text-[10px] text-purple-300 block">Chip Đồ Họa (GPU)</span>
                    <span className="font-bold text-white text-[11px] truncate block" title={deviceInfo.gpuRenderer}>
                      {deviceInfo.gpuRenderer}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-purple-200/90 pt-1 border-t border-white/10">
                  Trạng thái hiệu ứng: <strong>{settings.effectsEnabled ? 'Bật đầy đủ (Hiệu ứng lung linh)' : 'Chế độ nhẹ (Tối ưu pin & chống giật lag)'}</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-amber-300 text-xs sm:text-sm">Cách thức hoạt động thông minh:</h4>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>Đối với máy cấu hình khỏe (CPU ≥ 6 nhân, RAM ≥ 4GB, GPU Adreno 6xx/Apple GPU):</strong> Bật đầy đủ hiệu ứng tráo bài, xoay 3D, bụi sao vũ trụ lấp lánh ở tần số quét 60FPS.</li>
                  <li><strong>Đối với máy phổ thông / máy cũ:</strong> Tự động giảm bớt các hiệu ứng đổ bóng mờ (heavy blur) và hạt bụi nền để máy không bị nóng, không hao pin và thao tác luôn nhạy bén.</li>
                  <li><strong>Tùy biến tự do:</strong> Bạn luôn có thể tự bật/tắt thủ công trong mục <strong>Cài đặt (⚙️)</strong> bất kỳ lúc nào.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: ĐƯỜNG LINK TRUY CẬP VÀ CÀI APP */}
          {activeTab === 'sharingPwa' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  Hệ Thống Đường Dẫn Riêng Biệt (URL Direct Links)
                </h3>
                <p className="text-xs text-slate-300">
                  Tất cả các chức năng và quẻ bói đều có đường link riêng biệt để bạn chia sẻ hoặc lưu bookmark:
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/</span>
                    <span className="text-slate-300 ml-2">Trang chủ Neko Tarot</span>
                  </div>
                  <span className="text-[10px] text-purple-300">Màn hình chính</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/tarot</span>
                    <span className="text-slate-300 ml-2">Bói bài Tarot</span>
                  </div>
                  <span className="text-[10px] text-purple-300">Tarot Deck</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/bai-tay</span>
                    <span className="text-slate-300 ml-2">Bói bài Tây 52 lá</span>
                  </div>
                  <span className="text-[10px] text-purple-300">52 Lá Bài</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/tuvi</span>
                    <span className="text-slate-300 ml-2">Lập lá số Tử Vi Đẩu Số</span>
                  </div>
                  <span className="text-[10px] text-purple-300">Lá số</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/reading/:id</span>
                    <span className="text-slate-300 ml-2">Link trực tiếp tới quẻ bói đã lưu</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Chia sẻ bạn bè</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/admin</span>
                    <span className="text-slate-300 ml-2">Trang quản trị hệ thống</span>
                  </div>
                  <span className="text-[10px] text-amber-400">Dành cho Admin</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-300 font-bold">/huong-dan</span>
                    <span className="text-slate-300 ml-2">Cẩm nang hướng dẫn toàn tập</span>
                  </div>
                  <span className="text-[10px] text-blue-300">Trang này</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs sm:text-sm">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Cách cài Neko Tarot thành App trên điện thoại:</span>
                </div>
                <p className="text-[11.5px] text-slate-200 leading-relaxed">
                  Nhấn vào bong bóng <strong>"Cài App"</strong> ở góc dưới màn hình. 
                  Trên <strong>Android</strong>: Chọn "Thêm vào Màn hình chính" từ menu 3 chấm của Chrome. 
                  Trên <strong>iPhone (iOS)</strong>: Nhấn nút "Chia sẻ" ở Safari rồi chọn "Thêm vào MH chính". 
                  Sau khi cài, ứng dụng sẽ chạy toàn màn hình không có thanh địa chỉ trình duyệt, mượt như ứng dụng tải từ App Store!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-[#0e071e] shrink-0">
          <span className="text-[11px] text-purple-300/70">
            Neko Tarot v2.5 • Dẫn lối bởi Vũ Trụ & Trí Tuệ Nhân Tạo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            Đóng Hướng Dẫn
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
