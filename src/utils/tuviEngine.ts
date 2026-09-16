import { Solar, Lunar } from 'lunar-javascript';
import { Can, Chi, CungChuc, CungLaSo, LaSoTuViData, NguHanh, SaoTuVi } from '../types';

export const CHI_LIST: Chi[] = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
];

export const CAN_LIST: Can[] = [
  'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu',
  'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý',
];

export interface CanhGioInfo {
  chi: Chi;
  label: string;
  timeRange: string;
  hourIndex: number;
  desc: string;
}

export const CANH_GIO_OPTIONS: CanhGioInfo[] = [
  { chi: 'Tý', label: 'Giờ Tý (23:00 - 00:59)', timeRange: '23:00 - 00:59', hourIndex: 0, desc: 'Đêm khuya, lúc dương khí bắt đầu sinh (Lưu ý: 23h-0h tính sang ngày mới)' },
  { chi: 'Sửu', label: 'Giờ Sửu (01:00 - 02:59)', timeRange: '01:00 - 02:59', hourIndex: 1, desc: 'Gà gáy đầu, trâu nhai lại thức ăn' },
  { chi: 'Dần', label: 'Giờ Dần (03:00 - 04:59)', timeRange: '03:00 - 04:59', hourIndex: 2, desc: 'Rạng đông, cọp rời hang săn mồi' },
  { chi: 'Mão', label: 'Giờ Mão (05:00 - 06:59)', timeRange: '05:00 - 06:59', hourIndex: 3, desc: 'Bình minh, trăng lặn mặt trời ló rạng' },
  { chi: 'Thìn', label: 'Giờ Thìn (07:00 - 08:59)', timeRange: '07:00 - 08:59', hourIndex: 4, desc: 'Sáng sớm, rồng cưỡi mây bay lượn' },
  { chi: 'Tỵ', label: 'Giờ Tỵ (09:00 - 10:59)', timeRange: '09:00 - 10:59', hourIndex: 5, desc: 'Nắng ấm, rắn ẩn mình dưới cỏ' },
  { chi: 'Ngọ', label: 'Giờ Ngọ (11:00 - 12:59)', timeRange: '11:00 - 12:59', hourIndex: 6, desc: 'Đúng trưa, mặt trời đứng bóng cực thịnh' },
  { chi: 'Mùi', label: 'Giờ Mùi (13:00 - 14:59)', timeRange: '13:00 - 14:59', hourIndex: 7, desc: 'Đầu chiều, dê thong dong gặm cỏ' },
  { chi: 'Thân', label: 'Giờ Thân (15:00 - 16:59)', timeRange: '15:00 - 16:59', hourIndex: 8, desc: 'Xế chiều, vượn hót trên non cao' },
  { chi: 'Dậu', label: 'Giờ Dậu (17:00 - 18:59)', timeRange: '17:00 - 18:59', hourIndex: 9, desc: 'Hoàng hôn, gà vào chuồng về tổ' },
  { chi: 'Tuất', label: 'Giờ Tuất (19:00 - 20:59)', timeRange: '19:00 - 20:59', hourIndex: 10, desc: 'Tối muộn, chó canh giữ cổng nhà' },
  { chi: 'Hợi', label: 'Giờ Hợi (21:00 - 22:59)', timeRange: '21:00 - 22:59', hourIndex: 11, desc: 'Đêm đen, lợn ngủ say vạn vật tĩnh mịch' },
];

export const CUNG_CHUC_ORDER: CungChuc[] = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
];

export const CUNG_DESCRIPTIONS: Record<CungChuc, string> = {
  'Mệnh': 'Cung chủ đạo phản ánh tính cách, cốt cách, khí chất, dung mạo, năng khiếu và số phận cơ bản từ tiền vận đến tuổi 30.',
  'Phụ Mẫu': 'Phản ánh phúc ấm của cha mẹ, mối quan hệ và sự dìu dắt từ các bậc sinh thành, trưởng bối.',
  'Phúc Đức': 'Cung tối quan trọng biểu thị nguồn cội phước báu dòng họ, đời sống tinh thần, tuổi thọ và sự may mắn ngầm trong đời.',
  'Điền Trạch': 'Biểu thị cơ ngơi, bất động sản, nhà cửa đất đai, khả năng thừa kế và sự tích lũy của cải vật chất kiên cố.',
  'Quan Lộc': 'Biểu thị con đường học vấn, sự nghiệp, chức vị, quyền uy, đường thăng tiến và môi trường làm việc.',
  'Nô Bộc': 'Biểu thị mối quan hệ với bạn bè, đồng nghiệp, cấp dưới, đối tác và mạng lưới trợ lực xung quanh.',
  'Thiên Di': 'Biểu thị môi trường xã hội bên ngoài, những chuyến đi xa, cơ hội xuất ngoại và vận may khi bước chân ra xã hội.',
  'Tật Ách': 'Biểu thị thể trạng sức khỏe, những tai ách tiềm ẩn, bệnh tật và các yếu tố cần đề phòng về thân thể.',
  'Tài Bạch': 'Biểu thị tiền tài, nguồn thu nhập, khả năng kiếm tiền, giữ tiền và sự phát đạt về phương diện tài chính.',
  'Tử Tức': 'Biểu thị đường con cái, số lượng, đức tính, tương lai thành đạt của hậu duệ và tình cảm gia đình thế hệ sau.',
  'Phu Thê': 'Biểu thị duyên phận hôn nhân, tính cách, ngoại hình và sự hòa hợp với người bạn đời.',
  'Huynh Đệ': 'Biểu thị tình nghĩa anh chị em ruột thịt, bạn bè thâm giao như ruột thịt và sự tương trợ tương thân.',
};

export const NGU_HANH_CHI: Record<Chi, NguHanh> = {
  'Tý': 'Thủy',
  'Sửu': 'Thổ',
  'Dần': 'Mộc',
  'Mão': 'Mộc',
  'Thìn': 'Thổ',
  'Tỵ': 'Hỏa',
  'Ngọ': 'Hỏa',
  'Mùi': 'Thổ',
  'Thân': 'Kim',
  'Dậu': 'Kim',
  'Tuất': 'Thổ',
  'Hợi': 'Thủy',
};

// Bản dịch chữ Hán -> Can Chi tiếng Việt
export const CAN_CN_MAP: Record<string, Can> = {
  '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu',
  '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý',
};

export const CHI_CN_MAP: Record<string, Chi> = {
  '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ',
  '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi',
};

export const JIEQI_CN_MAP: Record<string, string> = {
  '立春': 'Lập Xuân', '雨水': 'Vũ Thủy', '惊蛰': 'Kinh Trập', '春分': 'Xuân Phân',
  '清明': 'Thanh Minh', '谷雨': 'Cốc Vũ', '立夏': 'Lập Hạ', '小满': 'Tiểu Mãn',
  '芒种': 'Mang Chủng', '夏至': 'Hạ Chí', '小暑': 'Tiểu Thử', '大暑': 'Đại Thử',
  '立秋': 'Lập Thu', '处暑': 'Xử Thử', '白露': 'Bạch Lộ', '秋分': 'Thu Phân',
  '寒露': 'Hàn Lộ', '霜降': 'Sương Giáng', '立冬': 'Lập Đông', '小雪': 'Tiểu Tuyết',
  '大雪': 'Đại Tuyết', '冬至': 'Đông Chí', '小寒': 'Tiểu Hàn', '大寒': 'Đại Hàn',
};

export function translateGanZhi(cn: string): string {
  if (!cn || cn.length < 2) return '';
  const can = CAN_CN_MAP[cn[0]] || cn[0];
  const chi = CHI_CN_MAP[cn[1]] || cn[1];
  return `${can} ${chi}`;
}

// 60 Lục thập hoa giáp nạp âm
export const NAP_AM_MAP: Record<string, { napAm: string; element: NguHanh }> = {
  'Giáp Tý': { napAm: 'Hải Trung Kim', element: 'Kim' },
  'Ất Sửu': { napAm: 'Hải Trung Kim', element: 'Kim' },
  'Bính Dần': { napAm: 'Lư Trung Hỏa', element: 'Hỏa' },
  'Đinh Mão': { napAm: 'Lư Trung Hỏa', element: 'Hỏa' },
  'Mậu Thìn': { napAm: 'Đại Lâm Mộc', element: 'Mộc' },
  'Kỷ Tỵ': { napAm: 'Đại Lâm Mộc', element: 'Mộc' },
  'Canh Ngọ': { napAm: 'Lộ Bàng Thổ', element: 'Thổ' },
  'Tân Mùi': { napAm: 'Lộ Bàng Thổ', element: 'Thổ' },
  'Nhâm Thân': { napAm: 'Kiếm Phong Kim', element: 'Kim' },
  'Quý Dậu': { napAm: 'Kiếm Phong Kim', element: 'Kim' },
  'Giáp Tuất': { napAm: 'Sơn Đầu Hỏa', element: 'Hỏa' },
  'Ất Hợi': { napAm: 'Sơn Đầu Hỏa', element: 'Hỏa' },
  'Bính Tý': { napAm: 'Giản Hạ Thủy', element: 'Thủy' },
  'Đinh Sửu': { napAm: 'Giản Hạ Thủy', element: 'Thủy' },
  'Mậu Dần': { napAm: 'Thành Đầu Thổ', element: 'Thổ' },
  'Kỷ Mão': { napAm: 'Thành Đầu Thổ', element: 'Thổ' },
  'Canh Thìn': { napAm: 'Bạch Lạp Kim', element: 'Kim' },
  'Tân Tỵ': { napAm: 'Bạch Lạp Kim', element: 'Kim' },
  'Nhâm Ngọ': { napAm: 'Dương Liễu Mộc', element: 'Mộc' },
  'Quý Mùi': { napAm: 'Dương Liễu Mộc', element: 'Mộc' },
  'Giáp Thân': { napAm: 'Tuyền Trung Thủy', element: 'Thủy' },
  'Ất Dậu': { napAm: 'Tuyền Trung Thủy', element: 'Thủy' },
  'Bính Tuất': { napAm: 'Ốc Thượng Thổ', element: 'Thổ' },
  'Đinh Hợi': { napAm: 'Ốc Thượng Thổ', element: 'Thổ' },
  'Mậu Tý': { napAm: 'Tích Lịch Hỏa', element: 'Hỏa' },
  'Kỷ Sửu': { napAm: 'Tích Lịch Hỏa', element: 'Hỏa' },
  'Canh Dần': { napAm: 'Tùng Bách Mộc', element: 'Mộc' },
  'Tân Mão': { napAm: 'Tùng Bách Mộc', element: 'Mộc' },
  'Nhâm Thìn': { napAm: 'Trường Lưu Thủy', element: 'Thủy' },
  'Quý Tỵ': { napAm: 'Trường Lưu Thủy', element: 'Thủy' },
  'Giáp Ngọ': { napAm: 'Sa Trung Kim', element: 'Kim' },
  'Ất Mùi': { napAm: 'Sa Trung Kim', element: 'Kim' },
  'Bính Thân': { napAm: 'Sơn Hạ Hỏa', element: 'Hỏa' },
  'Đinh Dậu': { napAm: 'Sơn Hạ Hỏa', element: 'Hỏa' },
  'Mậu Tuất': { napAm: 'Bình Địa Mộc', element: 'Mộc' },
  'Kỷ Hợi': { napAm: 'Bình Địa Mộc', element: 'Mộc' },
  'Canh Tý': { napAm: 'Bích Thượng Thổ', element: 'Thổ' },
  'Tân Sửu': { napAm: 'Bích Thượng Thổ', element: 'Thổ' },
  'Nhâm Dần': { napAm: 'Kim Bạch Kim', element: 'Kim' },
  'Quý Mão': { napAm: 'Kim Bạch Kim', element: 'Kim' },
  'Giáp Thìn': { napAm: 'Phúc Đăng Hỏa', element: 'Hỏa' },
  'Ất Tỵ': { napAm: 'Phúc Đăng Hỏa', element: 'Hỏa' },
  'Bính Ngọ': { napAm: 'Thiên Hà Thủy', element: 'Thủy' },
  'Đinh Mùi': { napAm: 'Thiên Hà Thủy', element: 'Thủy' },
  'Mậu Thân': { napAm: 'Đại Trạch Thổ', element: 'Thổ' },
  'Kỷ Dậu': { napAm: 'Đại Trạch Thổ', element: 'Thổ' },
  'Canh Tuất': { napAm: 'Thoa Xuyến Kim', element: 'Kim' },
  'Tân Hợi': { napAm: 'Thoa Xuyến Kim', element: 'Kim' },
  'Nhâm Tý': { napAm: 'Tang Đố Mộc', element: 'Mộc' },
  'Quý Sửu': { napAm: 'Tang Đố Mộc', element: 'Mộc' },
  'Giáp Dần': { napAm: 'Đại Khê Thủy', element: 'Thủy' },
  'Ất Mão': { napAm: 'Đại Khê Thủy', element: 'Thủy' },
  'Bính Thìn': { napAm: 'Sa Trung Thổ', element: 'Thổ' },
  'Đinh Tỵ': { napAm: 'Sa Trung Thổ', element: 'Thổ' },
  'Mậu Ngọ': { napAm: 'Thiên Thượng Hỏa', element: 'Hỏa' },
  'Kỷ Mùi': { napAm: 'Thiên Thượng Hỏa', element: 'Hỏa' },
  'Canh Thân': { napAm: 'Thạch Lựu Mộc', element: 'Mộc' },
  'Tân Dậu': { napAm: 'Thạch Lựu Mộc', element: 'Mộc' },
  'Nhâm Tuất': { napAm: 'Đại Hải Thủy', element: 'Thủy' },
  'Quý Hợi': { napAm: 'Đại Hải Thủy', element: 'Thủy' },
};

// Tra cứu Canh Giờ từ chuỗi thời gian tự nhập (linh hoạt mọi định dạng)
export function parseBirthTime(timeInput: string): { canhGio: CanhGioInfo; formattedTime: string } {
  if (!timeInput || !timeInput.trim()) {
    return { canhGio: CANH_GIO_OPTIONS[6], formattedTime: '12:00' };
  }
  const clean = timeInput.trim().toLowerCase();

  // Kiểm tra nếu người dùng gõ tên chi trực tiếp (vd "giờ dần", "dần", "dan", "ty", "ngo"...)
  const chiNames: Record<string, Chi> = {
    'ty': 'Tý', 'tý': 'Tý', 'suu': 'Sửu', 'sửu': 'Sửu', 'dan': 'Dần', 'dần': 'Dần',
    'mao': 'Mão', 'mão': 'Mão', 'thin': 'Thìn', 'thìn': 'Thìn', 'ty.': 'Tỵ', 'tỵ': 'Tỵ',
    'ngo': 'Ngọ', 'ngọ': 'Ngọ', 'mui': 'Mùi', 'mùi': 'Mùi', 'than': 'Thân', 'thân': 'Thân',
    'dau': 'Dậu', 'dậu': 'Dậu', 'tuat': 'Tuất', 'tuất': 'Tuất', 'hoi': 'Hợi', 'hợi': 'Hợi',
  };
  for (const [key, chi] of Object.entries(chiNames)) {
    if (clean.includes(key)) {
      const opt = CANH_GIO_OPTIONS.find(c => c.chi === chi);
      if (opt) return { canhGio: opt, formattedTime: opt.timeRange.split(' - ')[0] };
    }
  }

  // Regex tìm giờ và phút: vd 14:30, 14h30, 14.30, 3h, 14
  const match = clean.match(/(\d{1,2})(?:[:hH.m\s]+(\d{1,2}))?/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    
    // Nếu có chữ "chiều" / "tối" / "pm" mà giờ < 12
    if ((clean.includes('chiều') || clean.includes('tối') || clean.includes('pm')) && h < 12) {
      h += 12;
    }
    // Nếu có chữ "sáng" / "am" mà h == 12
    if ((clean.includes('sáng') || clean.includes('am')) && h === 12) {
      h = 0;
    }

    const safeH = Math.max(0, Math.min(23, h));
    const safeM = Math.max(0, Math.min(59, m));
    const formatted = `${safeH.toString().padStart(2, '0')}:${safeM.toString().padStart(2, '0')}`;
    const canhGio = getCanhGioFromTime(formatted);
    return { canhGio, formattedTime: formatted };
  }

  return { canhGio: CANH_GIO_OPTIONS[6], formattedTime: '12:00' };
}

// Tra cứu Canh Giờ từ chuỗi thời gian HH:mm
export function getCanhGioFromTime(timeStr: string): CanhGioInfo {
  if (!timeStr) return CANH_GIO_OPTIONS[6]; // default Ngọ
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const hour = isNaN(h) ? 12 : ((h % 24) + 24) % 24;

  if (hour >= 23 || hour < 1) return CANH_GIO_OPTIONS[0]; // Tý
  if (hour >= 1 && hour < 3) return CANH_GIO_OPTIONS[1]; // Sửu
  if (hour >= 3 && hour < 5) return CANH_GIO_OPTIONS[2]; // Dần
  if (hour >= 5 && hour < 7) return CANH_GIO_OPTIONS[3]; // Mão
  if (hour >= 7 && hour < 9) return CANH_GIO_OPTIONS[4]; // Thìn
  if (hour >= 9 && hour < 11) return CANH_GIO_OPTIONS[5]; // Tỵ
  if (hour >= 11 && hour < 13) return CANH_GIO_OPTIONS[6]; // Ngọ
  if (hour >= 13 && hour < 15) return CANH_GIO_OPTIONS[7]; // Mùi
  if (hour >= 15 && hour < 17) return CANH_GIO_OPTIONS[8]; // Thân
  if (hour >= 17 && hour < 19) return CANH_GIO_OPTIONS[9]; // Dậu
  if (hour >= 19 && hour < 21) return CANH_GIO_OPTIONS[10]; // Tuất
  return CANH_GIO_OPTIONS[11]; // Hợi
}

// Bảng Sao Chủ Mệnh theo Chi Năm Sinh
export const CHU_MENH_MAP: Record<Chi, string> = {
  'Tý': 'Tham lang',
  'Sửu': 'Cự môn',
  'Dần': 'Lộc tồn',
  'Mão': 'Văn khúc',
  'Thìn': 'Liêm trinh',
  'Tỵ': 'Vũ khúc',
  'Ngọ': 'Phá quân',
  'Mùi': 'Vũ khúc',
  'Thân': 'Liêm trinh',
  'Dậu': 'Văn khúc',
  'Tuất': 'Lộc tồn',
  'Hợi': 'Cự môn',
};

// Bảng Sao Chủ Thân theo Chi Năm Sinh
export const CHU_THAN_MAP: Record<Chi, string> = {
  'Tý': 'Hỏa tinh',
  'Sửu': 'Thiên tướng',
  'Dần': 'Thiên lương',
  'Mão': 'Thiên đồng',
  'Thìn': 'Văn xương',
  'Tỵ': 'Thiên cơ',
  'Ngọ': 'Hỏa tinh',
  'Mùi': 'Thiên tướng',
  'Thân': 'Thiên lương',
  'Dậu': 'Thiên đồng',
  'Tuất': 'Văn xương',
  'Hợi': 'Thiên cơ',
};

// Cung Thân cư theo Giờ Sinh
export const THAN_CU_MAP: Record<Chi, string> = {
  'Tý': 'Mệnh',
  'Ngọ': 'Mệnh',
  'Sửu': 'Phúc đức',
  'Mùi': 'Phúc đức',
  'Dần': 'Quan lộc',
  'Thân': 'Quan lộc',
  'Mão': 'Thiên di',
  'Dậu': 'Thiên di',
  'Thìn': 'Tài bạch',
  'Tuất': 'Tài bạch',
  'Tỵ': 'Phu thê',
  'Hợi': 'Phu thê',
};

// Cân Lượng Chỉ (Cân xương tính số - Phép Viên Thiên Cang)
const CAN_LUONG_YEAR: Record<string, number> = {
  'Giáp Tý': 1.2, 'Ất Sửu': 0.9, 'Bính Dần': 0.6, 'Đinh Mão': 0.7, 'Mậu Thìn': 1.2, 'Kỷ Tỵ': 0.5,
  'Canh Ngọ': 0.9, 'Tân Mùi': 0.8, 'Nhâm Thân': 0.7, 'Quý Dậu': 0.8, 'Giáp Tuất': 1.5, 'Ất Hợi': 0.9,
  'Bính Tý': 1.6, 'Đinh Sửu': 0.8, 'Mậu Dần': 0.8, 'Kỷ Mão': 1.9, 'Canh Thìn': 1.2, 'Tân Tỵ': 0.6,
  'Nhâm Ngọ': 0.8, 'Quý Mùi': 0.7, 'Giáp Thân': 0.5, 'Ất Dậu': 1.5, 'Bính Tuất': 0.6, 'Đinh Hợi': 1.6,
  'Mậu Tý': 1.5, 'Kỷ Sửu': 0.7, 'Canh Dần': 0.9, 'Tân Mão': 1.2, 'Nhâm Thìn': 1.0, 'Quý Tỵ': 0.7,
  'Giáp Ngọ': 1.5, 'Ất Mùi': 0.6, 'Bính Thân': 0.5, 'Đinh Dậu': 1.4, 'Mậu Tuất': 1.9, 'Kỷ Hợi': 0.9,
  'Canh Tý': 0.7, 'Tân Sửu': 0.7, 'Nhâm Dần': 1.2, 'Quý Mão': 1.2, 'Giáp Thìn': 0.8, 'Ất Tỵ': 0.7,
  'Bính Ngọ': 1.3, 'Đinh Mùi': 0.5, 'Mậu Thân': 1.4, 'Kỷ Dậu': 0.5, 'Canh Tuất': 0.9, 'Tân Hợi': 1.7,
  'Nhâm Tý': 0.5, 'Quý Sửu': 0.5, 'Giáp Dần': 1.2, 'Ất Mão': 0.8, 'Bính Thìn': 0.8, 'Đinh Tỵ': 1.6,
  'Mậu Ngọ': 1.9, 'Kỷ Mùi': 0.6, 'Canh Thân': 0.8, 'Tân Dậu': 1.6, 'Nhâm Tuất': 1.0, 'Quý Hợi': 0.7,
};

const CAN_LUONG_MONTH: Record<number, number> = {
  1: 0.6, 2: 0.7, 3: 1.8, 4: 0.9, 5: 0.5, 6: 1.6,
  7: 0.9, 8: 1.5, 9: 1.8, 10: 0.8, 11: 0.9, 12: 0.5,
};

const CAN_LUONG_DAY: Record<number, number> = {
  1: 0.5, 2: 1.0, 3: 0.8, 4: 1.5, 5: 1.6, 6: 1.5, 7: 0.8, 8: 1.6, 9: 0.8, 10: 1.6,
  11: 0.9, 12: 1.7, 13: 0.8, 14: 1.7, 15: 1.0, 16: 0.8, 17: 0.9, 18: 1.8, 19: 0.5, 20: 1.5,
  21: 1.0, 22: 0.9, 23: 0.8, 24: 0.9, 25: 1.5, 26: 1.8, 27: 0.7, 28: 0.8, 29: 1.6, 30: 0.6,
};

const CAN_LUONG_HOUR: Record<number, number> = {
  0: 1.6, // Tý
  1: 0.6, // Sửu
  2: 0.7, // Dần
  3: 1.0, // Mão
  4: 0.9, // Thìn
  5: 1.6, // Tỵ
  6: 1.0, // Ngọ
  7: 0.8, // Mùi
  8: 0.8, // Thân
  9: 0.9, // Dậu
  10: 0.6, // Tuất
  11: 0.6, // Hợi
};

export function calculateCanLuong(yearCanChi: string, lMonth: number, lDay: number, hourIndex: number): string {
  const y = CAN_LUONG_YEAR[yearCanChi] || 1.0;
  const m = CAN_LUONG_MONTH[lMonth] || 1.0;
  const d = CAN_LUONG_DAY[lDay] || 1.0;
  const h = CAN_LUONG_HOUR[hourIndex] || 1.0;
  const total = Math.round((y + m + d + h) * 10);
  const luong = Math.floor(total / 10);
  const chi = total % 10;
  return `${luong} lượng ${chi} chỉ`;
}

// Tuần Không (Tuần Trung Không Vong) theo Tuần Giáp của năm sinh
export function getTuanKhong(yearCan: Can, yearChi: Chi): Chi[] {
  const canIdx = CAN_LIST.indexOf(yearCan);
  const chiIdx = CHI_LIST.indexOf(yearChi);
  const giapChiIdx = (chiIdx - canIdx + 12) % 12;
  // 2 chi trước Giáp chi là Tuần Không
  const t1 = CHI_LIST[(giapChiIdx - 2 + 12) % 12];
  const t2 = CHI_LIST[(giapChiIdx - 1 + 12) % 12];
  return [t1, t2];
}

// Triệt Không (Triệt Lộ Không Vong) theo Can năm sinh
export function getTrietKhong(yearCan: Can): Chi[] {
  switch (yearCan) {
    case 'Giáp':
    case 'Kỷ':
      return ['Thân', 'Dậu'];
    case 'Ất':
    case 'Canh':
      return ['Ngọ', 'Mùi'];
    case 'Bính':
    case 'Tân':
      return ['Thìn', 'Tỵ'];
    case 'Đinh':
    case 'Nhâm':
      return ['Dần', 'Mão'];
    case 'Mậu':
    case 'Quý':
      return ['Tý', 'Sửu'];
  }
}

// Ngũ thử độn: Tính Can của giờ Tý dựa vào Can của ngày
export function getCanOfHour(dayCan: Can, hourChiIndex: number): Can {
  const startCanMap: Record<Can, Can> = {
    'Giáp': 'Giáp',
    'Kỷ': 'Giáp',
    'Ất': 'Bính',
    'Canh': 'Bính',
    'Bính': 'Mậu',
    'Tân': 'Mậu',
    'Đinh': 'Canh',
    'Nhâm': 'Canh',
    'Mậu': 'Nhâm',
    'Quý': 'Nhâm',
  };
  const startCan = startCanMap[dayCan] || 'Giáp';
  const startIndex = CAN_LIST.indexOf(startCan);
  return CAN_LIST[(startIndex + hourChiIndex) % 10];
}

// Ngũ hổ độn: Tính Can của Cung Dần (tháng 1) dựa vào Can của Năm
export function getCanOfDanFromYearCan(yearCan: Can): Can {
  const map: Record<Can, Can> = {
    'Giáp': 'Bính',
    'Kỷ': 'Bính',
    'Ất': 'Mậu',
    'Canh': 'Mậu',
    'Bính': 'Canh',
    'Tân': 'Canh',
    'Đinh': 'Nhâm',
    'Nhâm': 'Nhâm',
    'Mậu': 'Giáp',
    'Quý': 'Giáp',
  };
  return map[yearCan] || 'Bính';
}

// Phân định Cục số: Thủy Nhị Cục (2), Mộc Tam Cục (3), Kim Tứ Cục (4), Thổ Ngũ Cục (5), Hỏa Lục Cục (6)
export function getCuc(yearCan: Can, menhChi: Chi): { cuc: string; cucNumber: number; element: NguHanh } {
  const danCan = getCanOfDanFromYearCan(yearCan);
  const danCanIndex = CAN_LIST.indexOf(danCan);
  const danChiIndex = 2; // Dần = 2
  const menhChiIndex = CHI_LIST.indexOf(menhChi);
  
  // Đi thuận từ Dần đến Mệnh Cung
  const diff = (menhChiIndex - danChiIndex + 12) % 12;
  const menhCan = CAN_LIST[(danCanIndex + diff) % 10];
  const canChiKey = `${menhCan} ${menhChi}`;
  const napAmInfo = NAP_AM_MAP[canChiKey] || { element: 'Thủy' as NguHanh };

  switch (napAmInfo.element) {
    case 'Thủy': return { cuc: 'Thủy Nhị Cục', cucNumber: 2, element: 'Thủy' };
    case 'Mộc': return { cuc: 'Mộc Tam Cục', cucNumber: 3, element: 'Mộc' };
    case 'Kim': return { cuc: 'Kim Tứ Cục', cucNumber: 4, element: 'Kim' };
    case 'Thổ': return { cuc: 'Thổ Ngũ Cục', cucNumber: 5, element: 'Thổ' };
    case 'Hỏa': return { cuc: 'Hỏa Lục Cục', cucNumber: 6, element: 'Hỏa' };
  }
}

// Bảng miếu hãm chuẩn xác cho 14 chính tinh trên 12 địa chi
export const STAR_STATUS: Record<string, Record<Chi, 'Miếu' | 'Vượng' | 'Đắc' | 'Bình' | 'Hãm'>> = {
  'Tử Vi': {
    'Tý': 'Bình', 'Sửu': 'Đắc', 'Dần': 'Miếu', 'Mão': 'Vượng', 'Thìn': 'Đắc', 'Tỵ': 'Vượng',
    'Ngọ': 'Miếu', 'Mùi': 'Đắc', 'Thân': 'Miếu', 'Dậu': 'Vượng', 'Tuất': 'Đắc', 'Hợi': 'Bình',
  },
  'Thiên Cơ': {
    'Tý': 'Đắc', 'Sửu': 'Hãm', 'Dần': 'Vượng', 'Mão': 'Miếu', 'Thìn': 'Đắc', 'Tỵ': 'Bình',
    'Ngọ': 'Miếu', 'Mùi': 'Hãm', 'Thân': 'Vượng', 'Dậu': 'Miếu', 'Tuất': 'Đắc', 'Hợi': 'Bình',
  },
  'Thái Dương': {
    'Tý': 'Hãm', 'Sửu': 'Hãm', 'Dần': 'Vượng', 'Mão': 'Miếu', 'Thìn': 'Vượng', 'Tỵ': 'Miếu',
    'Ngọ': 'Miếu', 'Mùi': 'Đắc', 'Thân': 'Đắc', 'Dậu': 'Hãm', 'Tuất': 'Hãm', 'Hợi': 'Hãm',
  },
  'Vũ Khúc': {
    'Tý': 'Vượng', 'Sửu': 'Miếu', 'Dần': 'Đắc', 'Mão': 'Đắc', 'Thìn': 'Miếu', 'Tỵ': 'Bình',
    'Ngọ': 'Vượng', 'Mùi': 'Miếu', 'Thân': 'Đắc', 'Dậu': 'Đắc', 'Tuất': 'Miếu', 'Hợi': 'Bình',
  },
  'Thiên Đồng': {
    'Tý': 'Vượng', 'Sửu': 'Hãm', 'Dần': 'Đắc', 'Mão': 'Đắc', 'Thìn': 'Hãm', 'Tỵ': 'Bình',
    'Ngọ': 'Hãm', 'Mùi': 'Hãm', 'Thân': 'Vượng', 'Dậu': 'Hãm', 'Tuất': 'Hãm', 'Hợi': 'Miếu',
  },
  'Liêm Trinh': {
    'Tý': 'Bình', 'Sửu': 'Đắc', 'Dần': 'Vượng', 'Mão': 'Hãm', 'Thìn': 'Miếu', 'Tỵ': 'Hãm',
    'Ngọ': 'Vượng', 'Mùi': 'Đắc', 'Thân': 'Vượng', 'Dậu': 'Hãm', 'Tuất': 'Miếu', 'Hợi': 'Hãm',
  },
  'Thiên Phủ': {
    'Tý': 'Miếu', 'Sửu': 'Miếu', 'Dần': 'Miếu', 'Mão': 'Đắc', 'Thìn': 'Miếu', 'Tỵ': 'Đắc',
    'Ngọ': 'Vượng', 'Mùi': 'Miếu', 'Thân': 'Miếu', 'Dậu': 'Đắc', 'Tuất': 'Miếu', 'Hợi': 'Đắc',
  },
  'Thái Âm': {
    'Tý': 'Miếu', 'Sửu': 'Đắc', 'Dần': 'Hãm', 'Mão': 'Hãm', 'Thìn': 'Hãm', 'Tỵ': 'Hãm',
    'Ngọ': 'Hãm', 'Mùi': 'Đắc', 'Thân': 'Đắc', 'Dậu': 'Vượng', 'Tuất': 'Vượng', 'Hợi': 'Miếu',
  },
  'Tham Lang': {
    'Tý': 'Bình', 'Sửu': 'Miếu', 'Dần': 'Hãm', 'Mão': 'Bình', 'Thìn': 'Miếu', 'Tỵ': 'Hãm',
    'Ngọ': 'Bình', 'Mùi': 'Miếu', 'Thân': 'Hãm', 'Dậu': 'Bình', 'Tuất': 'Miếu', 'Hợi': 'Hãm',
  },
  'Cự Môn': {
    'Tý': 'Vượng', 'Sửu': 'Hãm', 'Dần': 'Vượng', 'Mão': 'Miếu', 'Thìn': 'Hãm', 'Tỵ': 'Hãm',
    'Ngọ': 'Vượng', 'Mùi': 'Hãm', 'Thân': 'Đắc', 'Dậu': 'Miếu', 'Tuất': 'Hãm', 'Hợi': 'Vượng',
  },
  'Thiên Tướng': {
    'Tý': 'Vượng', 'Sửu': 'Đắc', 'Dần': 'Miếu', 'Mão': 'Hãm', 'Thìn': 'Vượng', 'Tỵ': 'Đắc',
    'Ngọ': 'Vượng', 'Mùi': 'Đắc', 'Thân': 'Miếu', 'Dậu': 'Hãm', 'Tuất': 'Vượng', 'Hợi': 'Đắc',
  },
  'Thiên Lương': {
    'Tý': 'Miếu', 'Sửu': 'Vượng', 'Dần': 'Miếu', 'Mão': 'Miếu', 'Thìn': 'Vượng', 'Tỵ': 'Hãm',
    'Ngọ': 'Miếu', 'Mùi': 'Vượng', 'Thân': 'Hãm', 'Dậu': 'Đắc', 'Tuất': 'Miếu', 'Hợi': 'Hãm',
  },
  'Thất Sát': {
    'Tý': 'Miếu', 'Sửu': 'Đắc', 'Dần': 'Miếu', 'Mão': 'Hãm', 'Thìn': 'Đắc', 'Tỵ': 'Bình',
    'Ngọ': 'Miếu', 'Mùi': 'Đắc', 'Thân': 'Miếu', 'Dậu': 'Hãm', 'Tuất': 'Đắc', 'Hợi': 'Bình',
  },
  'Phá Quân': {
    'Tý': 'Miếu', 'Sửu': 'Vượng', 'Dần': 'Hãm', 'Mão': 'Hãm', 'Thìn': 'Vượng', 'Tỵ': 'Đắc',
    'Ngọ': 'Miếu', 'Mùi': 'Vượng', 'Thân': 'Hãm', 'Dậu': 'Hãm', 'Tuất': 'Vượng', 'Hợi': 'Đắc',
  },
};

// Vị trí sao Tử Vi dựa vào Cục số và ngày sinh âm lịch
export function findTuViPosition(cucNumber: number, lunarDay: number): Chi {
  const danIndex = 2; // Dần = index 2
  let targetIndex = 2;

  if (lunarDay % cucNumber === 0) {
    const x = lunarDay / cucNumber;
    targetIndex = (danIndex + x - 1 + 12) % 12;
  } else {
    // Tìm k nhỏ nhất để (lunarDay + k) % cucNumber === 0
    let k = 1;
    while ((lunarDay + k) % cucNumber !== 0) {
      k++;
    }
    const x = (lunarDay + k) / cucNumber;
    if (k % 2 === 0) {
      // k chẵn: đi thuận
      targetIndex = (danIndex + x - 1 + k + 12) % 12;
    } else {
      // k lẻ: đi nghịch
      targetIndex = (danIndex + x - 1 - k + 120) % 12;
    }
  }

  return CHI_LIST[targetIndex];
}

// Bảng an Tứ Hóa theo Can năm sinh
export const TU_HOA_MAP: Record<Can, { loc: string; quyen: string; khoa: string; ky: string }> = {
  'Giáp': { loc: 'Liêm Trinh', quyen: 'Phá Quân', khoa: 'Vũ Khúc', ky: 'Thái Dương' },
  'Ất': { loc: 'Thiên Cơ', quyen: 'Thiên Lương', khoa: 'Tử Vi', ky: 'Thái Âm' },
  'Bính': { loc: 'Thiên Đồng', quyen: 'Thiên Cơ', khoa: 'Văn Xương', ky: 'Liêm Trinh' },
  'Đinh': { loc: 'Thái Âm', quyen: 'Thiên Đồng', khoa: 'Thiên Cơ', ky: 'Cự Môn' },
  'Mậu': { loc: 'Tham Lang', quyen: 'Thái Âm', khoa: 'Hữu Bật', ky: 'Thiên Cơ' },
  'Kỷ': { loc: 'Vũ Khúc', quyen: 'Tham Lang', khoa: 'Thiên Lương', ky: 'Văn Khúc' },
  'Canh': { loc: 'Thái Dương', quyen: 'Vũ Khúc', khoa: 'Thái Âm', ky: 'Thiên Đồng' },
  'Tân': { loc: 'Cự Môn', quyen: 'Thái Dương', khoa: 'Văn Khúc', ky: 'Văn Xương' },
  'Nhâm': { loc: 'Thiên Lương', quyen: 'Tử Vi', khoa: 'Tả Phù', ky: 'Vũ Khúc' },
  'Quý': { loc: 'Phá Quân', quyen: 'Cự Môn', khoa: 'Thái Âm', ky: 'Tham Lang' },
};

// Lộc Tồn theo Can Năm
export const LOC_TON_MAP: Record<Can, Chi> = {
  'Giáp': 'Dần', 'Ất': 'Mão', 'Bính': 'Tỵ', 'Đinh': 'Ngọ', 'Mậu': 'Tỵ',
  'Kỷ': 'Ngọ', 'Canh': 'Thân', 'Tân': 'Dậu', 'Nhâm': 'Hợi', 'Quý': 'Tý',
};

// Thiên Khôi, Thiên Việt theo Can Năm
export const KHOI_VIET_MAP: Record<Can, { khoi: Chi; viet: Chi }> = {
  'Giáp': { khoi: 'Sửu', viet: 'Mùi' },
  'Mậu': { khoi: 'Sửu', viet: 'Mùi' },
  'Canh': { khoi: 'Sửu', viet: 'Mùi' },
  'Ất': { khoi: 'Tý', viet: 'Thân' },
  'Kỷ': { khoi: 'Tý', viet: 'Thân' },
  'Bính': { khoi: 'Hợi', viet: 'Dậu' },
  'Đinh': { khoi: 'Hợi', viet: 'Dậu' },
  'Nhâm': { khoi: 'Mão', viet: 'Tỵ' },
  'Quý': { khoi: 'Mão', viet: 'Tỵ' },
  'Tân': { khoi: 'Ngọ', viet: 'Dần' },
};

// 12 sao trong Vòng Tràng Sinh
export const VONG_TRANG_SINH_STARS = [
  'Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan',
  'Đế Vượng', 'Suy', 'Bệnh', 'Tử',
  'Mộ', 'Tuyệt', 'Thai', 'Dưỡng',
];

// Điểm khởi đầu Tràng Sinh theo Cục
export const TRANG_SINH_START_MAP: Record<string, Chi> = {
  'Thủy Nhị Cục': 'Thân',
  'Mộc Tam Cục': 'Hợi',
  'Kim Tứ Cục': 'Tỵ',
  'Thổ Ngũ Cục': 'Thân',
  'Hỏa Lục Cục': 'Dần',
};

export interface BuildLaSoParams {
  fullName: string;
  gender: string; // 'Nam' | 'Nữ'
  calendarType?: 'solar' | 'lunar'; // 'solar' = Dương lịch, 'lunar' = Âm lịch
  birthDate: string; // dd/mm/yyyy
  birthTime?: string; // Tự do: '14:30', '14h30', '3:30', 'giờ Thìn'...
  noiSinh?: string; // Tỉnh / thành phố, quốc gia
  canhGioChi?: Chi;
  isLeapMonth?: boolean; // Tháng nhuận nếu chọn Âm lịch
  viewingYear?: number; // Tự do nhập năm xem hạn (vd 2026, 2027...)
  selectedFocus?: string;
  selectedTopics?: string[];
  question?: string;
}

/**
 * Hàm xây dựng lá số Tử Vi hoàn chỉnh, chuẩn xác theo thuật toán cổ truyền
 * kết hợp thư viện thiên văn lunar-javascript, chuẩn hóa tương thích trang tracuutuvi.com.
 */
export function buildLaSoTuVi(params: BuildLaSoParams): LaSoTuViData {
  const {
    fullName,
    gender = 'Nam',
    calendarType = 'solar',
    birthDate,
    birthTime = '12:00',
    noiSinh = 'Việt Nam',
    isLeapMonth = false,
    viewingYear = 2026,
    selectedFocus = 'Tổng quan',
    selectedTopics = ['Tổng quan vận mệnh'],
  } = params;

  // 1. Phân tích chuỗi ngày/tháng/năm
  const dateClean = birthDate.replace(/\D/g, '');
  let d = 15, m = 9, y = 1998;
  if (dateClean.length >= 8) {
    d = parseInt(dateClean.slice(0, 2), 10);
    m = parseInt(dateClean.slice(2, 4), 10);
    y = parseInt(dateClean.slice(4, 8), 10);
  } else if (dateClean.length === 4) {
    y = parseInt(dateClean, 10);
  }

  // 2. Chuyển đổi qua lại Dương lịch <-> Âm lịch bằng lunar-javascript
  let solarObj: any;
  let lunarObj: any;

  if (calendarType === 'lunar') {
    try {
      const targetMonth = isLeapMonth ? -Math.abs(m) : Math.abs(m);
      lunarObj = Lunar.fromYmd(y, targetMonth, Math.max(1, Math.min(30, d)));
      solarObj = lunarObj.getSolar();
    } catch (err) {
      lunarObj = Lunar.fromYmd(y, Math.abs(m), 15);
      solarObj = lunarObj.getSolar();
    }
  } else {
    try {
      solarObj = Solar.fromYmd(y, Math.max(1, Math.min(12, m)), Math.max(1, Math.min(31, d)));
      lunarObj = solarObj.getLunar();
    } catch (err) {
      solarObj = Solar.fromYmd(1998, 9, 15);
      lunarObj = solarObj.getLunar();
    }
  }

  const sYear = solarObj.getYear();
  const sMonth = solarObj.getMonth();
  const sDay = solarObj.getDay();

  const lYear = lunarObj.getYear();
  const lMonth = Math.abs(lunarObj.getMonth());
  const lDay = lunarObj.getDay();
  const actualIsLeap = lunarObj.getMonth() < 0 || Boolean(isLeapMonth && calendarType === 'lunar');

  // Tiết khí tại thời điểm sinh
  let tietKhiName = 'Bạch Lộ';
  try {
    const prevJq = lunarObj.getPrevJieQi(true);
    if (prevJq) {
      tietKhiName = JIEQI_CN_MAP[prevJq.getName()] || prevJq.getName();
    }
  } catch (e) {
    tietKhiName = 'Bạch Lộ';
  }

  // 3. Can Chi của Năm, Tháng, Ngày
  const yearCanChi = translateGanZhi(lunarObj.getYearInGanZhi()) || 'Mậu Dần';
  const monthCanChi = translateGanZhi(lunarObj.getMonthInGanZhi()) || 'Tân Dậu';
  const dayCanChi = translateGanZhi(lunarObj.getDayInGanZhi()) || 'Ất Sửu';

  const yearCan = yearCanChi.split(' ')[0] as Can;
  const yearChi = yearCanChi.split(' ')[1] as Chi;
  const dayCan = (dayCanChi.split(' ')[0] || 'Giáp') as Can;

  // 4. Xác định Canh Giờ và Giờ Can Chi (tự do phân tích chuỗi giờ nhập)
  let parsedTime = parseBirthTime(birthTime);
  let canhGio = params.canhGioChi
    ? (CANH_GIO_OPTIONS.find(c => c.chi === params.canhGioChi) || parsedTime.canhGio)
    : parsedTime.canhGio;
  const hourCan = getCanOfHour(dayCan, canhGio.hourIndex);
  const hourCanChi = `${hourCan} ${canhGio.chi}`;

  // 5. Xác định Âm Dương Nam Nữ
  const isDuongCan = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(yearCan);
  const isNam = gender.trim().toLowerCase() === 'nam';
  const amDuongNamNu = isNam 
    ? (isDuongCan ? 'Dương Nam' : 'Âm Nam') 
    : (isDuongCan ? 'Dương Nữ' : 'Âm Nữ');
  // Chiều Đại Hạn: Dương Nam / Âm Nữ đi THUẬN; Âm Nam / Dương Nữ đi NGHỊCH
  const isDaiHanThuan = (isNam && isDuongCan) || (!isNam && !isDuongCan);

  // 6. Bản Mệnh Lục Thập Hoa Giáp
  const napAmObj = NAP_AM_MAP[yearCanChi] || { napAm: 'Hải Trung Kim', element: 'Kim' as NguHanh };
  const banMenhNapAm = napAmObj.napAm;
  const banMenhElement = napAmObj.element;

  // 7. An Cung MỆNH và Cung THÂN
  const monthTargetIndex = (2 + (lMonth - 1)) % 12;
  const menhIndex = (monthTargetIndex - canhGio.hourIndex + 120) % 12;
  const menhChi = CHI_LIST[menhIndex];
  const thanIndex = (monthTargetIndex + canhGio.hourIndex) % 12;
  const thanChi = CHI_LIST[thanIndex];

  // 8. Xác định Cục số
  const cucInfo = getCuc(yearCan, menhChi);

  // 9. Tương quan Ngũ Hành giữa Cục và Bản Mệnh
  let tuongQuanMenhCuc = '';
  if (banMenhElement === cucInfo.element) {
    tuongQuanMenhCuc = 'Mệnh Cục Đồng Hành (Tâm tính hòa hợp với hoàn cảnh, dễ dàng thích ứng với môi trường xung quanh, đường đời thuận hòa).';
  } else if (
    (cucInfo.element === 'Thủy' && banMenhElement === 'Mộc') ||
    (cucInfo.element === 'Mộc' && banMenhElement === 'Hỏa') ||
    (cucInfo.element === 'Hỏa' && banMenhElement === 'Thổ') ||
    (cucInfo.element === 'Thổ' && banMenhElement === 'Kim') ||
    (cucInfo.element === 'Kim' && banMenhElement === 'Thủy')
  ) {
    tuongQuanMenhCuc = 'Cục Sinh Mệnh (Được hoàn cảnh trợ duyên, thường gặp quý nhân phò trợ, khó khăn tự tiêu tan, mưu cầu việc lớn có đất dụng võ).';
  } else if (
    (banMenhElement === 'Thủy' && cucInfo.element === 'Mộc') ||
    (banMenhElement === 'Mộc' && cucInfo.element === 'Hỏa') ||
    (banMenhElement === 'Hỏa' && cucInfo.element === 'Thổ') ||
    (banMenhElement === 'Thổ' && cucInfo.element === 'Kim') ||
    (banMenhElement === 'Kim' && cucInfo.element === 'Thủy')
  ) {
    tuongQuanMenhCuc = 'Mệnh Sinh Cục (Tâm tính nhân hậu, hay hi sinh cống hiến cho gia đình và xã hội, phải hao tâm tốn sức mới tạo lập được sự nghiệp).';
  } else if (
    (banMenhElement === 'Thủy' && cucInfo.element === 'Hỏa') ||
    (banMenhElement === 'Hỏa' && cucInfo.element === 'Kim') ||
    (banMenhElement === 'Kim' && cucInfo.element === 'Mộc') ||
    (banMenhElement === 'Mộc' && cucInfo.element === 'Thổ') ||
    (banMenhElement === 'Thổ' && cucInfo.element === 'Thủy')
  ) {
    tuongQuanMenhCuc = 'Mệnh Khắc Cục (Ý chí kiên định, bản lĩnh vượt khó, dám nghĩ dám làm để khuất phục hoàn cảnh và gặt hái thành công).';
  } else {
    tuongQuanMenhCuc = 'Cục Khắc Mệnh (Thường gặp trở lực từ môi trường bên ngoài, cuộc sống cần tôi luyện nghị lực thép và tu dưỡng tâm tính mới đắc thành).';
  }

  // 10. Các chỉ số quan trọng (Chủ Mệnh, Chủ Thân, Cân Lượng, Thân Cư, Tuần/Triệt)
  const chuMenh = CHU_MENH_MAP[yearChi] || 'Tham lang';
  const chuThan = CHU_THAN_MAP[yearChi] || 'Hỏa tinh';
  const canLuongChi = calculateCanLuong(yearCanChi, lMonth, lDay, canhGio.hourIndex);
  const thanCu = THAN_CU_MAP[canhGio.chi] || 'Quan lộc';
  const tuanKhong = getTuanKhong(yearCan, yearChi);
  const trietKhong = getTrietKhong(yearCan);

  // 11. Xác định vị trí sao Tử Vi và 14 Chính Tinh
  const tuViChi = findTuViPosition(cucInfo.cucNumber, lDay);
  const tuViIndex = CHI_LIST.indexOf(tuViChi);

  const starsByChi: Record<Chi, SaoTuVi[]> = {
    'Tý': [], 'Sửu': [], 'Dần': [], 'Mão': [], 'Thìn': [], 'Tỵ': [],
    'Ngọ': [], 'Mùi': [], 'Thân': [], 'Dậu': [], 'Tuất': [], 'Hợi': [],
  };

  const addChinhTinh = (name: string, chiIndex: number, element: NguHanh) => {
    const c = CHI_LIST[(chiIndex + 120) % 12];
    const status = STAR_STATUS[name]?.[c] || 'Đắc';
    starsByChi[c].push({
      name,
      type: 'chinh-tinh',
      status,
      element,
    });
  };

  // Chòm sao Tử Vi (đi nghịch từ Tử Vi):
  addChinhTinh('Tử Vi', tuViIndex, 'Thổ');
  addChinhTinh('Thiên Cơ', tuViIndex - 1, 'Mộc');
  addChinhTinh('Thái Dương', tuViIndex - 3, 'Hỏa');
  addChinhTinh('Vũ Khúc', tuViIndex - 4, 'Kim');
  addChinhTinh('Thiên Đồng', tuViIndex - 5, 'Thủy');
  addChinhTinh('Liêm Trinh', tuViIndex - 8, 'Hỏa');

  // Chòm sao Thiên Phủ (đối xứng qua trục Dần - Thân):
  const thienPhuIndex = (10 - tuViIndex + 120) % 12;
  addChinhTinh('Thiên Phủ', thienPhuIndex, 'Thổ');
  addChinhTinh('Thái Âm', thienPhuIndex + 1, 'Thủy');
  addChinhTinh('Tham Lang', thienPhuIndex + 2, 'Thủy');
  addChinhTinh('Cự Môn', thienPhuIndex + 3, 'Thủy');
  addChinhTinh('Thiên Tướng', thienPhuIndex + 4, 'Thủy');
  addChinhTinh('Thiên Lương', thienPhuIndex + 5, 'Mộc');
  addChinhTinh('Thất Sát', thienPhuIndex + 6, 'Kim');
  addChinhTinh('Phá Quân', thienPhuIndex + 10, 'Thủy');

  // 12. An Tứ Hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ)
  const tuHoa = TU_HOA_MAP[yearCan] || TU_HOA_MAP['Giáp'];
  const hoaStars = [
    { star: tuHoa.loc, hoaName: 'Hóa Lộc' as const, element: 'Mộc' as NguHanh },
    { star: tuHoa.quyen, hoaName: 'Hóa Quyền' as const, element: 'Mộc' as NguHanh },
    { star: tuHoa.khoa, hoaName: 'Hóa Khoa' as const, element: 'Thủy' as NguHanh },
    { star: tuHoa.ky, hoaName: 'Hóa Kỵ' as const, element: 'Thủy' as NguHanh },
  ];

  hoaStars.forEach(({ star, hoaName, element }) => {
    for (const chi of CHI_LIST) {
      const foundMain = starsByChi[chi].find(s => s.name === star);
      if (foundMain) {
        foundMain.tuHoa = hoaName;
        starsByChi[chi].push({
          name: hoaName,
          type: 'hoa-tinh',
          element,
          tuHoa: hoaName,
          meaning: `Hóa khí cát hung cho sao ${star}`,
        });
        break;
      }
    }
  });

  // 13. An Lục Sát Tinh
  // Lộc Tồn, Kình Dương, Đà La
  const locTonChi = LOC_TON_MAP[yearCan] || 'Dần';
  const locTonIndex = CHI_LIST.indexOf(locTonChi);
  starsByChi[locTonChi].push({ name: 'Lộc Tồn', type: 'cat-tinh', element: 'Thổ', status: 'Miếu', meaning: 'Phú quý, tài lộc dồi dào, giải trừ hung họa' });
  const kinhDuongChi = CHI_LIST[(locTonIndex + 1) % 12];
  starsByChi[kinhDuongChi].push({ name: 'Kình Dương', type: 'hung-tinh', element: 'Kim', status: 'Hãm', meaning: 'Cương nghị, uy quyền nhưng dễ va chạm thương tật' });
  const daLaChi = CHI_LIST[(locTonIndex - 1 + 12) % 12];
  starsByChi[daLaChi].push({ name: 'Đà La', type: 'hung-tinh', element: 'Kim', status: 'Hãm', meaning: 'Trầm ngâm, kiên nhẫn, đề phòng tiểu nhân ám hại' });

  // Địa Không, Địa Kiếp (theo Giờ sinh)
  const diaKiepIndex = (11 + canhGio.hourIndex) % 12; // Khởi Hợi đi thuận
  starsByChi[CHI_LIST[diaKiepIndex]].push({ name: 'Địa Kiếp', type: 'hung-tinh', element: 'Hỏa', status: 'Hãm', meaning: 'Sát tinh bùng nổ, táo bạo, thăng trầm bất ngờ' });
  const diaKhongIndex = (11 - canhGio.hourIndex + 120) % 12; // Khởi Hợi đi nghịch
  starsByChi[CHI_LIST[diaKhongIndex]].push({ name: 'Địa Không', type: 'hung-tinh', element: 'Hỏa', status: 'Hãm', meaning: 'Tư duy phá cách, trực giác nhạy bén, hư hao tiền bạc' });

  // Hỏa Tinh & Linh Tinh (theo Chi Năm và Giờ Sinh)
  const yearChiIndex = CHI_LIST.indexOf(yearChi);
  let hoaTinhStart = 1; // Sửu
  let linhTinhStart = 3; // Mão

  if ([2, 6, 10].includes(yearChiIndex)) {
    hoaTinhStart = 1; linhTinhStart = 3;
  } else if ([8, 0, 4].includes(yearChiIndex)) {
    hoaTinhStart = 2; linhTinhStart = 10;
  } else if ([5, 9, 1].includes(yearChiIndex)) {
    hoaTinhStart = 3; linhTinhStart = 10;
  } else {
    hoaTinhStart = 9; linhTinhStart = 10;
  }

  const hoaTinhIndex = (hoaTinhStart + canhGio.hourIndex) % 12;
  starsByChi[CHI_LIST[hoaTinhIndex]].push({ name: 'Hỏa Tinh', type: 'hung-tinh', element: 'Hỏa', status: 'Hãm', meaning: 'Tính tình nóng nảy, đột phát, sức chiến đấu cao' });

  const linhTinhIndex = (linhTinhStart + canhGio.hourIndex) % 12;
  starsByChi[CHI_LIST[linhTinhIndex]].push({ name: 'Linh Tinh', type: 'hung-tinh', element: 'Hỏa', status: 'Hãm', meaning: 'Âm hỏa, nhạy cảm, sâu sắc, mưu lược' });

  // 14. An Cát Tinh
  // Tả Phù, Hữu Bật (theo Tháng sinh)
  const taPhuIndex = (4 + (lMonth - 1)) % 12;
  starsByChi[CHI_LIST[taPhuIndex]].push({ name: 'Tả Phù', type: 'cat-tinh', element: 'Thổ', status: 'Vượng', meaning: 'Cát tinh phò tá đắc lực, bạn bè đồng nghiệp trung kiên' });
  const huuBatIndex = (10 - (lMonth - 1) + 120) % 12;
  starsByChi[CHI_LIST[huuBatIndex]].push({ name: 'Hữu Bật', type: 'cat-tinh', element: 'Thổ', status: 'Vượng', meaning: 'Cát tinh trợ giúp vạn sự, mưu lược toàn tài' });

  // Văn Xương, Văn Khúc (theo Giờ sinh)
  const vanXuongIndex = (10 - canhGio.hourIndex + 120) % 12;
  starsByChi[CHI_LIST[vanXuongIndex]].push({ name: 'Văn Xương', type: 'cat-tinh', element: 'Kim', status: 'Miếu', meaning: 'Học vấn uyên bác, thi cử đỗ đạt, tài hoa xuất chúng' });
  const vanKhucIndex = (4 + canhGio.hourIndex) % 12;
  starsByChi[CHI_LIST[vanKhucIndex]].push({ name: 'Văn Khúc', type: 'cat-tinh', element: 'Thủy', status: 'Miếu', meaning: 'Khéo léo nghệ thuật, ăn nói lưu loát, năng khiếu thi ca' });

  // Thiên Khôi, Thiên Việt (theo Can Năm)
  const khoiViet = KHOI_VIET_MAP[yearCan] || { khoi: 'Sửu' as Chi, viet: 'Mùi' as Chi };
  starsByChi[khoiViet.khoi].push({ name: 'Thiên Khôi', type: 'cat-tinh', element: 'Hỏa', status: 'Miếu', meaning: 'Đệ nhất quý nhân, đứng đầu tập thể, gặp dữ hóa lành' });
  starsByChi[khoiViet.viet].push({ name: 'Thiên Việt', type: 'cat-tinh', element: 'Hỏa', status: 'Miếu', meaning: 'Quý nhân phò trợ âm thầm, cơ hội bất ngờ xuất hiện' });

  // Thiên Mã (theo Chi Năm)
  let thienMaChi: Chi = 'Dần';
  if ([2, 6, 10].includes(yearChiIndex)) thienMaChi = 'Thân';
  else if ([8, 0, 4].includes(yearChiIndex)) thienMaChi = 'Dần';
  else if ([5, 9, 1].includes(yearChiIndex)) thienMaChi = 'Hợi';
  else thienMaChi = 'Tỵ';
  starsByChi[thienMaChi].push({ name: 'Thiên Mã', type: 'cat-tinh', element: 'Hỏa', status: 'Vượng', meaning: 'Năng động, dịch chuyển, phát triển phương xa, xe cộ' });

  // Đào Hoa (theo Chi Năm)
  let daoHoaChi: Chi = 'Mão';
  if ([2, 6, 10].includes(yearChiIndex)) daoHoaChi = 'Mão';
  else if ([8, 0, 4].includes(yearChiIndex)) daoHoaChi = 'Dậu';
  else if ([5, 9, 1].includes(yearChiIndex)) daoHoaChi = 'Ngọ';
  else daoHoaChi = 'Tý';
  starsByChi[daoHoaChi].push({ name: 'Đào Hoa', type: 'cat-tinh', element: 'Mộc', status: 'Vượng', meaning: 'Duyên dáng, thu hút người khác phái, nghệ thuật' });

  // Hồng Loan & Thiên Hỷ (theo Chi Năm)
  const hongLoanIndex = (3 - yearChiIndex + 120) % 12;
  const thienHyIndex = (hongLoanIndex + 6) % 12;
  starsByChi[CHI_LIST[hongLoanIndex]].push({ name: 'Hồng Loan', type: 'cat-tinh', element: 'Thủy', status: 'Vượng', meaning: 'Hỷ tín, lương duyên, niềm vui bất ngờ' });
  starsByChi[CHI_LIST[thienHyIndex]].push({ name: 'Thiên Hỷ', type: 'cat-tinh', element: 'Thủy', status: 'Vượng', meaning: 'Vui vẻ, sinh nở, may mắn hội tụ' });

  // Long Trì, Phượng Các, Giải Thần
  const longTriIndex = (4 + yearChiIndex) % 12;
  const phuongCacIndex = (10 - yearChiIndex + 120) % 12;
  starsByChi[CHI_LIST[longTriIndex]].push({ name: 'Long Trì', type: 'cat-tinh', element: 'Thủy', status: 'Vượng', meaning: 'Thanh cao, gia đạo hưng thịnh' });
  starsByChi[CHI_LIST[phuongCacIndex]].push({ name: 'Phượng Các', type: 'cat-tinh', element: 'Thổ', status: 'Vượng', meaning: 'Thông minh, thanh lịch, bằng cấp' });
  starsByChi[CHI_LIST[phuongCacIndex]].push({ name: 'Giải Thần', type: 'cat-tinh', element: 'Mộc', status: 'Vượng', meaning: 'Giải trừ tai ương, phúc khí' });

  // Thiên Khốc & Thiên Hư (theo Chi năm)
  const thienKhocIndex = (6 - yearChiIndex + 120) % 12;
  const thienHuIndex = (6 + yearChiIndex) % 12;
  starsByChi[CHI_LIST[thienKhocIndex]].push({ name: 'Thiên Khốc', type: 'hung-tinh', element: 'Thủy', status: 'Hãm', meaning: 'Ưu tư, dễ xúc động, ưu sầu' });
  starsByChi[CHI_LIST[thienHuIndex]].push({ name: 'Thiên Hư', type: 'hung-tinh', element: 'Thủy', status: 'Hãm', meaning: 'Hư hao, bất an, hao tổn' });

  // Vòng Thái Tuế (12 sao)
  const THAI_TUE_STARS = [
    { name: 'Thái Tuế', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Thiếu Dương', type: 'cat-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Tang Môn', type: 'hung-tinh' as const, element: 'Mộc' as NguHanh },
    { name: 'Thiếu Âm', type: 'cat-tinh' as const, element: 'Thủy' as NguHanh },
    { name: 'Quan Phù', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Tử Phù', type: 'hung-tinh' as const, element: 'Kim' as NguHanh },
    { name: 'Tuế Phá', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Long Đức', type: 'cat-tinh' as const, element: 'Thủy' as NguHanh },
    { name: 'Bạch Hổ', type: 'hung-tinh' as const, element: 'Kim' as NguHanh },
    { name: 'Phúc Đức', type: 'cat-tinh' as const, element: 'Thổ' as NguHanh },
    { name: 'Điếu Khách', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Trực Phù', type: 'hung-tinh' as const, element: 'Kim' as NguHanh },
  ];
  THAI_TUE_STARS.forEach((s, idx) => {
    const c = CHI_LIST[(yearChiIndex + idx) % 12];
    starsByChi[c].push({ name: s.name, type: s.type, element: s.element });
  });

  // Vòng Bác Sĩ (theo Lộc Tồn)
  const BAC_SI_STARS = [
    { name: 'Bác Sĩ', type: 'cat-tinh' as const, element: 'Thủy' as NguHanh },
    { name: 'Lực Sĩ', type: 'cat-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Thanh Long', type: 'cat-tinh' as const, element: 'Thủy' as NguHanh },
    { name: 'Tiểu Hao', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Tướng Quân', type: 'cat-tinh' as const, element: 'Mộc' as NguHanh },
    { name: 'Tấu Thư', type: 'cat-tinh' as const, element: 'Kim' as NguHanh },
    { name: 'Phi Liêm', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Hỷ Thần', type: 'cat-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Bệnh Phù', type: 'hung-tinh' as const, element: 'Thổ' as NguHanh },
    { name: 'Đại Hao', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Phục Binh', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
    { name: 'Quan Phủ', type: 'hung-tinh' as const, element: 'Hỏa' as NguHanh },
  ];
  BAC_SI_STARS.forEach((s, idx) => {
    const chiIdx = isDaiHanThuan
      ? (locTonIndex + idx) % 12
      : (locTonIndex - idx + 120) % 12;
    starsByChi[CHI_LIST[chiIdx]].push({ name: s.name, type: s.type, element: s.element });
  });

  // Quốc Ấn, Đường Phù (theo Can năm)
  const quocAnIndex = (locTonIndex + 8) % 12;
  const duongPhuIndex = (locTonIndex + 5) % 12;
  starsByChi[CHI_LIST[quocAnIndex]].push({ name: 'Quốc Ấn', type: 'cat-tinh', element: 'Thổ' });
  starsByChi[CHI_LIST[duongPhuIndex]].push({ name: 'Đường Phù', type: 'cat-tinh', element: 'Mộc' });

  // Sao Lưu Niên của năm xem hạn (viewingYear)
  let viewingYearCanChi = 'Bính Ngọ';
  try {
    const dummyLunar = Lunar.fromYmd(viewingYear, 1, 1);
    viewingYearCanChi = translateGanZhi(dummyLunar.getYearInGanZhi()) || 'Bính Ngọ';
  } catch (e) {
    viewingYearCanChi = 'Bính Ngọ';
  }
  const [viewCanStr, viewChiStr] = viewingYearCanChi.split(' ');
  const viewCan = (viewCanStr || 'Bính') as Can;
  const viewChi = (viewChiStr || 'Ngọ') as Chi;
  const viewChiIndex = CHI_LIST.indexOf(viewChi);
  const viewLocTonChi = LOC_TON_MAP[viewCan] || 'Tỵ';
  const viewLocTonIndex = CHI_LIST.indexOf(viewLocTonChi);

  // Lưu Thái Tuế
  starsByChi[viewChi].push({ name: 'L.Thái tuế', type: 'luu-tinh', isLuu: true, element: 'Hỏa' });
  // Lưu Lộc Tồn, Kình Dương, Đà La
  starsByChi[viewLocTonChi].push({ name: 'L.Lộc tồn', type: 'luu-tinh', isLuu: true, element: 'Thổ' });
  starsByChi[CHI_LIST[(viewLocTonIndex + 1) % 12]].push({ name: 'L.Kình dương', type: 'luu-tinh', isLuu: true, element: 'Kim' });
  starsByChi[CHI_LIST[(viewLocTonIndex - 1 + 12) % 12]].push({ name: 'L.Đà la', type: 'luu-tinh', isLuu: true, element: 'Kim' });
  // Lưu Tang Môn, Bạch Hổ
  starsByChi[CHI_LIST[(viewChiIndex + 2) % 12]].push({ name: 'L.Tang môn', type: 'luu-tinh', isLuu: true, element: 'Mộc' });
  starsByChi[CHI_LIST[(viewChiIndex + 8) % 12]].push({ name: 'L.Bạch hổ', type: 'luu-tinh', isLuu: true, element: 'Kim' });

  // 15. An Vòng Tràng Sinh
  const trangSinhStartChi = TRANG_SINH_START_MAP[cucInfo.cuc] || 'Thân';
  const trangSinhStartIndex = CHI_LIST.indexOf(trangSinhStartChi);
  const vongTrangSinhByChi: Record<Chi, string> = {
    'Tý': '', 'Sửu': '', 'Dần': '', 'Mão': '', 'Thìn': '', 'Tỵ': '',
    'Ngọ': '', 'Mùi': '', 'Thân': '', 'Dậu': '', 'Tuất': '', 'Hợi': '',
  };

  VONG_TRANG_SINH_STARS.forEach((starName, idx) => {
    let chiIdx = 0;
    if (isDaiHanThuan) {
      chiIdx = (trangSinhStartIndex + idx) % 12;
    } else {
      chiIdx = (trangSinhStartIndex - idx + 120) % 12;
    }
    const c = CHI_LIST[chiIdx];
    vongTrangSinhByChi[c] = starName;
  });

  // 16. Xây dựng danh sách 12 Cung Lá số Tử Vi
  const danCan = getCanOfDanFromYearCan(yearCan);
  const danCanIndex = CAN_LIST.indexOf(danCan);

  // Khởi cung Tiểu Hạn theo Chi Năm sinh
  let tieuHanStart = 4;
  if ([2, 6, 10].includes(yearChiIndex)) tieuHanStart = 4;
  else if ([8, 0, 4].includes(yearChiIndex)) tieuHanStart = 10;
  else if ([5, 9, 1].includes(yearChiIndex)) tieuHanStart = 7;
  else tieuHanStart = 1;

  const age = Math.max(1, viewingYear - lYear + 1);
  const tieuHanCurrentIndex = isNam
    ? (tieuHanStart + (age - 1)) % 12
    : (tieuHanStart - (age - 1) + 120) % 12;
  const tieuHanChi = CHI_LIST[tieuHanCurrentIndex];

  // Tính Nguyệt hạn: Khởi từ cung Tiểu Hạn đếm nghịch đến tháng sinh, rồi thuận đến giờ sinh khởi Tháng 1
  const monthBackIndex = (tieuHanCurrentIndex - (lMonth - 1) + 120) % 12;
  const nguyetHanThang1Index = (monthBackIndex + canhGio.hourIndex) % 12;

  let cungLaiNhanName = 'Nô bộc';

  const cungList: CungLaSo[] = CHI_LIST.map((chi, chiIndex) => {
    const cungChucIndex = (menhIndex - chiIndex + 120) % 12;
    const cungChuc = CUNG_CHUC_ORDER[cungChucIndex];
    const isThan = chi === thanChi;

    const diffFromDan = (chiIndex - 2 + 12) % 12;
    const can = CAN_LIST[(danCanIndex + diffFromDan) % 10];

    // Cung Lai Nhân: Cung có Thiên Can trùng với Can Năm Sinh
    if (can === yearCan) {
      cungLaiNhanName = `Cung ${cungChuc}`;
    }

    // Can Chi viết tắt: ví dụ K.Tỵ, C.Ngọ, T.Mùi, N.Thân, Q.Dậu, G.Tuất, Ấ.Hợi, B.Tý, Đ.Sửu...
    const canChiShort = `${can.slice(0, 1)}.${chi}`;
    const amDuongSign: '+' | '-' = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(can) ? '+' : '-';

    // Đại hạn khởi từ cung Mệnh:
    let stepsFromMenh = 0;
    if (isDaiHanThuan) {
      stepsFromMenh = (chiIndex - menhIndex + 12) % 12;
    } else {
      stepsFromMenh = (menhIndex - chiIndex + 12) % 12;
    }
    const daiHan = cucInfo.cucNumber + stepsFromMenh * 10;

    const starsInCung = starsByChi[chi];
    const chinhTinh = starsInCung.filter(s => s.type === 'chinh-tinh');
    const phuTinh = starsInCung.filter(s => s.type !== 'chinh-tinh');

    // Tách 2 cột Cát Tinh và Hung Tinh (kèm Lưu tinh)
    const catTinhList = phuTinh.filter(s => s.type === 'cat-tinh' || s.tuHoa === 'Hóa Lộc' || s.tuHoa === 'Hóa Quyền' || s.tuHoa === 'Hóa Khoa' || (s.isLuu && (s.name.includes('Lộc') || s.name.includes('Mã'))));
    const hungTinhList = phuTinh.filter(s => !catTinhList.includes(s));

    // Tam Hợp và Xung Chiếu
    const tamHop: Chi[] = [
      CHI_LIST[(chiIndex + 4) % 12],
      CHI_LIST[(chiIndex + 8) % 12],
    ];
    const xungChieu: Chi = CHI_LIST[(chiIndex + 6) % 12];

    // Nguyệt hạn tháng (1-12)
    const nguyetHan = ((chiIndex - nguyetHanThang1Index + 12) % 12) + 1;

    // Tuần Không & Triệt Không
    const isTuan = tuanKhong.includes(chi);
    const isTriet = trietKhong.includes(chi);

    return {
      chi,
      can,
      canChiShort,
      amDuongSign,
      cungChuc,
      isThan,
      daiHan,
      tieuHan: chi === tieuHanChi ? `Năm ${viewingYear} (${age}t)` : undefined,
      vongTrangSinh: vongTrangSinhByChi[chi],
      nguyetHan,
      chinhTinh,
      phuTinh,
      catTinhList,
      hungTinhList,
      nguHanhCung: NGU_HANH_CHI[chi],
      isTuan,
      isTriet,
      tamHop,
      xungChieu,
      yNghia: CUNG_DESCRIPTIONS[cungChuc],
    };
  });

  return {
    chuSo: {
      fullName: fullName.trim() || 'Đương Số',
      gender: isNam ? 'Nam' : 'Nữ',
      amDuongNamNu,
      solarDate: `${sDay.toString().padStart(2, '0')}/${sMonth.toString().padStart(2, '0')}/${sYear}`,
      lunarDateStr: `Ngày ${lDay} tháng ${lMonth} năm ${yearCanChi}${actualIsLeap ? ' (Nhuận)' : ''}`,
      lunarDay: lDay,
      lunarMonth: lMonth,
      lunarYear: lYear,
      isLeapMonth: actualIsLeap,
      calendarType,
      tietKhi: tietKhiName,
      noiSinh,
      selectedFocus,
      selectedTopics,
      canhGio: canhGio.label,
      canhGioTime: canhGio.timeRange,
      birthTimeStr: parsedTime.formattedTime,
      yearCanChi,
      monthCanChi,
      dayCanChi,
      hourCanChi,
      banMenhNapAm,
      banMenhElement,
      cuc: cucInfo.cuc,
      cucNumber: cucInfo.cucNumber,
      menhCungChi: menhChi,
      thanCungChi: thanChi,
      chuMenh,
      chuThan,
      canLuongChi,
      cungLaiNhan: cungLaiNhanName,
      thanCu,
      tuanKhong,
      trietKhong,
      tuongQuanMenhCuc,
      viewingYear,
      viewingYearCanChi,
    },
    cungList,
  };
}

/**
 * Xuất cấu trúc JSON lá số chuẩn để hiển thị, lưu trữ hoặc sao chép
 */
export function exportLaSoAsJson(laSo: LaSoTuViData): string {
  return JSON.stringify(laSo, null, 2);
}
