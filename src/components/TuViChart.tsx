import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LaSoTuViData, CungLaSo, Chi } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { LiquidGlassCard } from './LiquidGlassCard';
import {
  Sparkles,
  Compass,
  User,
  Calendar,
  Shield,
  Info,
  X,
  Copy,
  Check,
  Code2,
  Download,
  Flame,
  Star,
  Award,
  Clock,
  MapPin,
  Scale,
} from 'lucide-react';

interface TuViChartProps {
  laSo: LaSoTuViData;
}

// Traditional 4x4 Grid layout coordinates:
// Row 0: Tỵ (0,0), Ngọ (0,1), Mùi (0,2), Thân (0,3)
// Row 1: Thìn (1,0) -- [THIÊN BÀN 2x2] -- Dậu (1,3)
// Row 2: Mão (2,0)  -- [THIÊN BÀN 2x2] -- Tuất (2,3)
// Row 3: Dần (3,0), Sửu (3,1), Tý (3,2), Hợi (3,3)

const GRID_COORDINATES: Record<Chi, { row: number; col: number }> = {
  'Tỵ': { row: 0, col: 0 },
  'Ngọ': { row: 0, col: 1 },
  'Mùi': { row: 0, col: 2 },
  'Thân': { row: 0, col: 3 },
  'Dậu': { row: 1, col: 3 },
  'Tuất': { row: 2, col: 3 },
  'Hợi': { row: 3, col: 3 },
  'Tý': { row: 3, col: 2 },
  'Sửu': { row: 3, col: 1 },
  'Dần': { row: 3, col: 0 },
  'Mão': { row: 2, col: 0 },
  'Thìn': { row: 1, col: 0 },
};

export const TuViChart: React.FC<TuViChartProps> = ({ laSo }) => {
  const { settings } = useSettings();
  const [selectedCung, setSelectedCung] = useState<CungLaSo | null>(
    laSo.cungList.find(c => c.cungChuc === 'Mệnh') || null
  );
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Miếu': return 'text-red-400 font-extrabold';
      case 'Vượng': return 'text-amber-400 font-bold';
      case 'Đắc': return 'text-emerald-400 font-semibold';
      case 'Bình': return 'text-cyan-300';
      case 'Hãm': return 'text-slate-400 italic';
      default: return 'text-purple-300';
    }
  };

  const getStatusAbbr = (status?: string) => {
    switch (status) {
      case 'Miếu': return '(M)';
      case 'Vượng': return '(V)';
      case 'Đắc': return '(Đ)';
      case 'Bình': return '(B)';
      case 'Hãm': return '(H)';
      default: return '';
    }
  };

  const getStarColor = (star: { element?: string; type?: string; isLuu?: boolean }) => {
    if (star.isLuu) return 'text-pink-300';
    switch (star.element) {
      case 'Kim': return 'text-amber-200';
      case 'Mộc': return 'text-emerald-300';
      case 'Thủy': return 'text-cyan-300';
      case 'Hỏa': return 'text-rose-400';
      case 'Thổ': return 'text-yellow-300';
      default: return 'text-purple-200';
    }
  };

  const getElementBadgeColor = (elem: string) => {
    switch (elem) {
      case 'Kim': return 'bg-amber-400/20 text-amber-200 border-amber-400/30';
      case 'Mộc': return 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30';
      case 'Thủy': return 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30';
      case 'Hỏa': return 'bg-rose-400/20 text-rose-200 border-rose-400/30';
      case 'Thổ': return 'bg-yellow-600/20 text-yellow-200 border-yellow-600/30';
      default: return 'bg-purple-400/20 text-purple-200 border-purple-400/30';
    }
  };

  const getTuHoaBadge = (hoaName?: string) => {
    switch (hoaName) {
      case 'Hóa Lộc': return 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200';
      case 'Hóa Quyền': return 'bg-red-500/25 border-red-400/50 text-red-200';
      case 'Hóa Khoa': return 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200';
      case 'Hóa Kỵ': return 'bg-violet-600/35 border-violet-400/50 text-violet-200';
      default: return 'bg-purple-500/20 text-purple-200';
    }
  };

  const jsonContent = JSON.stringify(laSo, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LaSoTuVi_${laSo.chuSo.fullName.replace(/\s+/g, '_')}_${laSo.chuSo.lunarYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full space-y-6"
    >
      {/* Visual Chart Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 px-2"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/25 text-amber-300 shadow-sm">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-serif font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Lá Số Tử Vi Đẩu Số 12 Cung (Chuẩn Phong Cách Tra Cứu Tử Vi)
            </h3>
            <p className={`text-xs ${settings.theme === 'dark' ? 'text-purple-300/70' : 'text-purple-900/70'}`}>
              Bố cục bàn cờ 12 Cung Địa Bàn, 2 cột Cát/Hung tinh, Tuần/Triệt & Thiên Bàn phân định rõ ràng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-400/30 bg-purple-900/40 text-purple-200 hover:text-white hover:bg-purple-800/50 text-xs font-semibold cursor-pointer shadow-sm transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Xuất JSON Chuẩn</span>
          </motion.button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Miếu
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Vượng
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Đắc
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-slate-500/30 bg-slate-500/10 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Hãm
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid 4x4 for Desktop / Tablet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:grid grid-cols-4 grid-rows-4 gap-2 w-full aspect-[4/3.8] max-w-5xl mx-auto p-2.5 rounded-3xl border border-purple-500/30 bg-black/40 backdrop-blur-md shadow-2xl relative"
      >
        {/* Render 12 Palaces (Cung) */}
        {laSo.cungList.map((cung, index) => {
          const coords = GRID_COORDINATES[cung.chi];
          const isSelected = selectedCung?.chi === cung.chi;
          const isMenh = cung.cungChuc === 'Mệnh';
          const isThan = cung.isThan;
          const isTamHop = selectedCung?.tamHop?.includes(cung.chi);
          const isXungChieu = selectedCung?.xungChieu === cung.chi;

          return (
            <motion.div
              key={cung.chi}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, type: 'spring', stiffness: 350, damping: 22 }}
              style={{
                gridRowStart: coords.row + 1,
                gridColumnStart: coords.col + 1,
              }}
              whileHover={{ scale: 1.025, zIndex: 20, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCung(cung)}
              className={`relative rounded-2xl p-2 flex flex-col justify-between transition-all cursor-pointer select-none overflow-hidden ${
                isSelected
                  ? 'bg-purple-900/80 border-2 border-amber-400 shadow-xl shadow-amber-400/25 z-10 ring-2 ring-amber-400/30'
                  : isMenh
                  ? 'bg-purple-950/60 border border-amber-400/70 shadow-md ring-1 ring-amber-400/20'
                  : isTamHop
                  ? 'bg-purple-950/40 border border-emerald-400/50 shadow-sm'
                  : isXungChieu
                  ? 'bg-purple-950/40 border border-cyan-400/50 shadow-sm'
                  : 'bg-purple-950/30 hover:bg-purple-900/40 border border-white/10'
              }`}
            >
              {/* Tuần / Triệt floating badges */}
              <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                {cung.isTuan && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/90 text-black font-extrabold shadow-sm">
                    TUẦN
                  </span>
                )}
                {cung.isTriet && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-rose-600/90 text-white font-extrabold shadow-sm">
                    TRIỆT
                  </span>
                )}
              </div>

              {/* Header: Cung Chức + Can Chi Cung + Vòng Tràng Sinh */}
              <div className="flex items-center justify-between border-b border-white/10 pb-1 pr-12">
                <div className="flex items-center gap-1 truncate">
                  <span className={`text-xs font-bold font-serif uppercase tracking-tight ${isMenh ? 'text-amber-300 font-extrabold' : 'text-purple-100'}`}>
                    {cung.cungChuc}
                  </span>
                  {isThan && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500 text-white font-black tracking-widest">
                      THÂN
                    </span>
                  )}
                  {cung.vongTrangSinh && (
                    <span className="text-[8px] px-1 rounded bg-amber-400/15 text-amber-300/90 font-medium truncate">
                      {cung.vongTrangSinh}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-purple-300/90 shrink-0">
                  <span className="font-semibold">{cung.canChiShort || `${cung.can.slice(0, 1)}.${cung.chi}`}</span>
                </div>
              </div>

              {/* Center: Chính Tinh Tọa Thủ (To đậm, có Miếu Hãm) */}
              <div className="my-1 py-0.5 border-b border-white/5 space-y-0.5">
                {cung.chinhTinh.length > 0 ? (
                  cung.chinhTinh.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] leading-tight">
                      <div className="flex items-center gap-1 truncate">
                        <span className={`font-bold ${getStarColor(s)} truncate`}>{s.name}</span>
                        {s.tuHoa && (
                          <span className={`text-[8px] px-1 rounded font-extrabold border ${getTuHoaBadge(s.tuHoa)}`}>
                            {s.tuHoa.replace('Hóa ', '')}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] ${getStatusColor(s.status)} shrink-0 ml-1`}>
                        {getStatusAbbr(s.status) || s.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-purple-400/50 italic py-0.5 text-center">Vô Chính Diệu</div>
                )}
              </div>

              {/* 2-Column Auxiliary Stars: Left = Cát tinh, Right = Hung tinh (Like tracuutuvi.com) */}
              <div className="grid grid-cols-2 gap-1 text-[9px] leading-tight overflow-hidden flex-1 py-1">
                {/* Left: Cát tinh */}
                <div className="space-y-0.5 text-left border-r border-white/5 pr-0.5">
                  {(cung.catTinhList || cung.phuTinh.filter(p => p.type === 'cat-tinh')).slice(0, 5).map((p, idx) => (
                    <div key={idx} className="truncate text-emerald-300/90 font-medium">
                      {p.name} {p.status ? getStatusAbbr(p.status) : ''}
                    </div>
                  ))}
                  {((cung.catTinhList || []).length > 5) && (
                    <div className="text-[8px] text-emerald-400/50">...</div>
                  )}
                </div>

                {/* Right: Hung tinh & Lưu tinh */}
                <div className="space-y-0.5 text-right pl-0.5">
                  {(cung.hungTinhList || cung.phuTinh.filter(p => p.type !== 'cat-tinh')).slice(0, 5).map((p, idx) => (
                    <div key={idx} className={`truncate font-medium ${p.isLuu ? 'text-pink-300' : 'text-rose-300/90'}`}>
                      {p.name} {p.status ? getStatusAbbr(p.status) : ''}
                    </div>
                  ))}
                  {((cung.hungTinhList || []).length > 5) && (
                    <div className="text-[8px] text-rose-400/50">...</div>
                  )}
                </div>
              </div>

              {/* Footer: Nguyệt hạn, Tiểu hạn, Đại hạn */}
              <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[9px] text-purple-200/80">
                <span className="text-[8px] text-purple-300/70 font-mono">
                  {cung.nguyetHan ? `T.${cung.nguyetHan}` : ''}
                </span>
                <span className="truncate text-[8px] text-cyan-300 font-bold px-1">
                  {cung.tieuHan || ''}
                </span>
                <span className="text-amber-300 font-bold text-[9px]">
                  {cung.daiHan}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Center: THIÊN BÀN (2x2 span in middle: Row 1-2, Col 1-2) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            gridRow: '2 / span 2',
            gridColumn: '2 / span 2',
          }}
          className="rounded-2xl p-3 sm:p-4 flex flex-col justify-between bg-purple-950/90 border border-purple-400/40 shadow-inner text-left backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle Yin-Yang Watermark in Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Compass className="w-56 h-56 text-white" />
          </div>

          <div className="relative z-10 flex items-start justify-between border-b border-purple-500/20 pb-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> THIÊN BÀN TỬ VI
              </div>
              <h4 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide mt-0.5">
                {laSo.chuSo.fullName}
              </h4>
              <div className="text-[10px] text-purple-300/80 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple-400" />
                <span>{laSo.chuSo.noiSinh || 'Việt Nam'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-400/30 text-purple-200">
                {laSo.chuSo.amDuongNamNu}
              </span>
              <div className="text-[10px] text-amber-300 mt-1 font-bold">
                Năm xem: {laSo.chuSo.viewingYear} ({laSo.chuSo.viewingYearCanChi})
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] my-auto py-1.5 leading-tight">
            <div>
              <span className="text-purple-300/60 block text-[9px]">Dương lịch:</span>
              <span className="text-white font-medium">{laSo.chuSo.solarDate}</span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Âm lịch & Tiết khí:</span>
              <span className="text-amber-200 font-medium truncate block">
                {laSo.chuSo.lunarDateStr}
              </span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Giờ sinh & Canh giờ:</span>
              <span className="text-white font-medium">{laSo.chuSo.hourCanChi} ({laSo.chuSo.canhGioTime})</span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Bản Mệnh Nạp Âm:</span>
              <span className="text-emerald-300 font-bold">{laSo.chuSo.banMenhNapAm}</span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Cục số:</span>
              <span className="text-cyan-300 font-bold">{laSo.chuSo.cuc} ({laSo.chuSo.cucNumber})</span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Chủ Mệnh / Chủ Thân:</span>
              <span className="text-purple-200 font-semibold">{laSo.chuSo.chuMenh} / {laSo.chuSo.chuThan}</span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Cân Lượng Chỉ:</span>
              <span className="text-amber-300 font-bold">
                {laSo.chuSo.canLuongChi || 'Đang tính'}
              </span>
            </div>
            <div>
              <span className="text-purple-300/60 block text-[9px]">Thân Cư / Lai Nhân:</span>
              <span className="text-purple-200 font-semibold">Cư {laSo.chuSo.thanCu} &bull; {laSo.chuSo.cungLaiNhan}</span>
            </div>
          </div>

          <div className="relative z-10 pt-1.5 border-t border-purple-500/20 text-[10px] text-purple-200/80 italic leading-snug">
            {laSo.chuSo.tuongQuanMenhCuc}
          </div>
        </motion.div>
      </motion.div>

      {/* Responsive View for Mobile / Tablet */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Center Thiên Bàn Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LiquidGlassCard className="p-4 rounded-2xl border border-purple-500/30">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> THIÊN BÀN TỬ VI
                </div>
                <h4 className="text-base font-bold font-serif text-white mt-0.5">
                  {laSo.chuSo.fullName} ({laSo.chuSo.amDuongNamNu})
                </h4>
                <div className="text-[10px] text-purple-300/70">{laSo.chuSo.noiSinh || 'Việt Nam'}</div>
              </div>
              <div className="text-right text-[10px] text-amber-300 font-bold">
                Năm {laSo.chuSo.viewingYear} ({laSo.chuSo.viewingYearCanChi})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2.5">
              <div>
                <span className="text-purple-300/60 block text-[10px]">Bản Mệnh:</span>
                <span className="text-emerald-300 font-bold">{laSo.chuSo.banMenhNapAm}</span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px]">Cục số:</span>
                <span className="text-cyan-300 font-bold">{laSo.chuSo.cuc}</span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px]">Cân Lượng:</span>
                <span className="text-amber-300 font-bold">
                  {laSo.chuSo.canLuongChi || ''}
                </span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px]">Thân Cư:</span>
                <span className="text-purple-200 font-bold">{laSo.chuSo.thanCu}</span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px]">Âm lịch & Tiết khí:</span>
                <span className="text-amber-200 font-medium text-[11px] truncate block">{laSo.chuSo.lunarDateStr}</span>
              </div>
              <div>
                <span className="text-purple-300/60 block text-[10px]">Giờ sinh:</span>
                <span className="text-white font-medium text-[11px]">{laSo.chuSo.hourCanChi}</span>
              </div>
            </div>

            <div className="text-[10px] text-purple-200/80 italic pt-2 border-t border-white/10">
              {laSo.chuSo.tuongQuanMenhCuc}
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* 12 Cung Horizontal Tab Pill selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {laSo.cungList.map((cung) => {
            const isSelected = selectedCung?.chi === cung.chi;
            const isMenh = cung.cungChuc === 'Mệnh';
            return (
              <motion.button
                key={cung.chi}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCung(cung)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30 font-bold'
                    : isMenh
                    ? 'bg-purple-800/80 border border-amber-400/50 text-amber-200'
                    : 'bg-purple-950/40 border border-white/10 text-purple-200'
                }`}
              >
                <span>{cung.cungChuc}</span>
                <span className="text-[10px] opacity-70">({cung.chi})</span>
                {cung.isThan && <span className="text-[8px] bg-rose-500 text-white px-1 rounded font-bold">THÂN</span>}
                {cung.isTuan && <span className="text-[8px] bg-amber-500 text-black px-1 rounded font-bold">TUẦN</span>}
                {cung.isTriet && <span className="text-[8px] bg-rose-600 text-white px-1 rounded font-bold">TRIỆT</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detailed Palace Inspector Modal / Card */}
      <AnimatePresence mode="wait">
        {selectedCung && (
          <motion.div
            key={selectedCung.chi}
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full"
          >
            <LiquidGlassCard className="p-5 sm:p-7 rounded-3xl border border-purple-500/30 shadow-2xl relative">
              <div className="flex items-start justify-between border-b border-purple-500/20 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs">
                      Cung {selectedCung.cungChuc} tại {selectedCung.chi}
                    </span>
                    {selectedCung.isThan && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                        CUNG THÂN (Hậu Vận)
                      </span>
                    )}
                    {selectedCung.isTuan && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[10px]">
                        TUẦN KHÔNG
                      </span>
                    )}
                    {selectedCung.isTriet && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px]">
                        TRIỆT KHÔNG
                      </span>
                    )}
                    {selectedCung.vongTrangSinh && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-medium">
                        Vòng Tràng Sinh: {selectedCung.vongTrangSinh}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${getElementBadgeColor(selectedCung.nguHanhCung)}`}>
                      Hành {selectedCung.nguHanhCung} ({selectedCung.amDuongSign})
                    </span>
                  </div>
                  <h4 className="text-xl font-bold font-serif text-white mt-2">
                    Đại Hạn: {selectedCung.daiHan} tuổi &bull; Cung Vị: {selectedCung.can} {selectedCung.chi}
                    {selectedCung.tieuHan && ` &bull; Tiểu hạn: ${selectedCung.tieuHan}`}
                    {selectedCung.nguyetHan && ` &bull; Lưu Nguyệt: Tháng ${selectedCung.nguyetHan}`}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedCung(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Palace Meaning */}
              <p className="text-sm text-purple-200/90 leading-relaxed mt-3 mb-5 italic bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                &ldquo;{selectedCung.yNghia}&rdquo;
              </p>

              {/* Tam Phương Tứ Chính Schema */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3.5 rounded-2xl bg-black/20 border border-purple-500/20 text-xs">
                <div>
                  <span className="text-purple-300/70 font-semibold block mb-1">
                    Tam Hợp Hội Chiếu:
                  </span>
                  <div className="flex gap-2">
                    {selectedCung.tamHop?.map((chi) => {
                      const c = laSo.cungList.find(item => item.chi === chi);
                      return (
                        <span key={chi} className="px-2 py-1 rounded-lg bg-purple-950/50 border border-purple-400/20 text-purple-200 font-medium">
                          {c?.cungChuc} ({chi})
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-purple-300/70 font-semibold block mb-1">
                    Chính Chiếu (Xung Chiếu):
                  </span>
                  <div>
                    {selectedCung.xungChieu && (
                      <span className="px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 font-medium">
                        {laSo.cungList.find(item => item.chi === selectedCung.xungChieu)?.cungChuc} ({selectedCung.xungChieu})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Stars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <h5 className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Chính Tinh Tọa Thủ
                  </h5>
                  {selectedCung.chinhTinh.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCung.chinhTinh.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{s.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${getElementBadgeColor(s.element)}`}>
                              {s.element}
                            </span>
                            {s.tuHoa && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getTuHoaBadge(s.tuHoa)}`}>
                                {s.tuHoa}
                              </span>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusColor(s.status)} bg-black/40 border border-white/10`}>
                            {s.status || 'Đắc'} địa
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-white/5 text-xs text-purple-300/70 italic">
                      Cung Vô Chính Diệu (mượn xung lực từ cung xung chiếu và tam hợp).
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-xs uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Phụ Tinh & Cát / Hung Tinh
                  </h5>
                  {selectedCung.phuTinh.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedCung.phuTinh.map((p, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                            p.type === 'hoa-tinh'
                              ? getTuHoaBadge(p.tuHoa)
                              : p.isLuu
                              ? 'bg-pink-500/15 border-pink-500/30 text-pink-200'
                              : p.type === 'hung-tinh'
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                          }`}
                        >
                          <span className="font-semibold">{p.name}</span>
                          {p.meaning && <span className="text-[10px] opacity-70">({p.meaning})</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-white/5 text-xs text-purple-300/70 italic">
                      Không có phụ tinh trọng yếu tọa thủ.
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JSON Schema Viewer Modal */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-950 border border-purple-500/40 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-purple-950/40">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-300" />
                  <h3 className="text-base font-bold text-white font-serif">
                    Cấu Trúc JSON Lá Số Tử Vi Chuẩn
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-all"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownloadJson}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-all cursor-pointer"
                    title="Tải tệp .json"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <button
                    onClick={() => setIsJsonModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* JSON Pre block */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-black/60 font-mono text-xs text-purple-200">
                <pre className="whitespace-pre-wrap leading-relaxed">{jsonContent}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TuViChart;
