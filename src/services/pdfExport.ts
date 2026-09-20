import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DeckType, SpreadType, UserInfo, DrawnCard, LaSoTuViData, CungLaSo } from '../types';

export interface ExportPdfParams {
  userInfo: UserInfo;
  deckType: DeckType;
  spreadType?: SpreadType;
  question?: string;
  drawnCards?: DrawnCard[];
  aiInterpretation: string | null;
  tuViData?: LaSoTuViData | null;
  timestamp?: number;
}

// Classical 4x4 Grid Coordinates for 12 Palaces
const TU_VI_GRID_COORDINATES: Record<string, { row: number; col: number }> = {
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

/**
 * Render single palace cell for the 4x4 PDF grid
 */
function renderTuViPalaceCellHtml(cung: CungLaSo, isMenh: boolean): string {
  const coords = TU_VI_GRID_COORDINATES[cung.chi] || { row: 0, col: 0 };
  const r = coords.row + 1;
  const c = coords.col + 1;

  // Render Chinh Tinh list
  const chinhTinhList = cung.chinhTinh || [];
  let chinhTinhHtml = '';
  if (chinhTinhList.length === 0) {
    chinhTinhHtml = '<div style="color: #94a3b8; font-style: italic; font-size: 8.5px; padding: 2px 0;">Vô Chính Diệu</div>';
  } else {
    chinhTinhHtml = chinhTinhList.map((s) => {
      let statusColor = '#c084fc';
      let abbr = '';
      if (s.status === 'Miếu') { statusColor = '#ef4444'; abbr = '(M)'; }
      else if (s.status === 'Vượng') { statusColor = '#f59e0b'; abbr = '(V)'; }
      else if (s.status === 'Đắc') { statusColor = '#10b981'; abbr = '(Đ)'; }
      else if (s.status === 'Bình') { statusColor = '#06b6d4'; abbr = '(B)'; }
      else if (s.status === 'Hãm') { statusColor = '#94a3b8'; abbr = '(H)'; }

      let tuHoaBadge = '';
      if (s.tuHoa === 'Hóa Lộc') tuHoaBadge = '<span style="background: #10b981; color: #ffffff; font-size: 7px; font-weight: bold; padding: 0 2px; border-radius: 2px; margin-left: 2px;">[Lộc]</span>';
      else if (s.tuHoa === 'Hóa Quyền') tuHoaBadge = '<span style="background: #ef4444; color: #ffffff; font-size: 7px; font-weight: bold; padding: 0 2px; border-radius: 2px; margin-left: 2px;">[Quyền]</span>';
      else if (s.tuHoa === 'Hóa Khoa') tuHoaBadge = '<span style="background: #0284c7; color: #ffffff; font-size: 7px; font-weight: bold; padding: 0 2px; border-radius: 2px; margin-left: 2px;">[Khoa]</span>';
      else if (s.tuHoa === 'Hóa Kỵ') tuHoaBadge = '<span style="background: #7c3aed; color: #ffffff; font-size: 7px; font-weight: bold; padding: 0 2px; border-radius: 2px; margin-left: 2px;">[Kỵ]</span>';

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 9.5px; font-weight: bold; line-height: 1.3;">
          <span style="color: ${statusColor};">${s.name}</span>
          <span style="white-space: nowrap;">
            <span style="color: ${statusColor}; font-size: 8px; margin-left: 2px;">${abbr}</span>
            ${tuHoaBadge}
          </span>
        </div>
      `;
    }).join('');
  }

  // Cat Tinh (left column)
  const catList = cung.catTinhList || [];
  const catTinhHtml = catList.slice(0, 9).map((s) => {
    let extra = '';
    if (s.tuHoa) {
      const color = s.tuHoa === 'Hóa Lộc' ? '#10b981' : s.tuHoa === 'Hóa Quyền' ? '#ef4444' : s.tuHoa === 'Hóa Khoa' ? '#0284c7' : '#7c3aed';
      const short = s.tuHoa.replace('Hóa ', '');
      extra += `<span style="background: ${color}; color: #fff; font-size: 6px; padding: 0 1.5px; border-radius: 2px; margin-left: 1px;">${short}</span>`;
    }
    if (s.status) {
      const abbr = s.status === 'Miếu' ? '(M)' : s.status === 'Vượng' ? '(V)' : s.status === 'Đắc' ? '(Đ)' : s.status === 'Bình' ? '(B)' : '(H)';
      const sColor = s.status === 'Miếu' ? '#ef4444' : s.status === 'Vượng' ? '#f59e0b' : s.status === 'Đắc' ? '#34d399' : '#94a3b8';
      extra += `<span style="color: ${sColor}; font-size: 6.5px; margin-left: 1px;">${abbr}</span>`;
    }
    return `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 7.2px; color: #34d399; line-height: 1.2;">• ${s.name}${extra}</div>`;
  }).join('');

  // Hung Tinh & Sao Luu (right column)
  const hungList = cung.hungTinhList || [];
  const hungTinhHtml = hungList.slice(0, 9).map((s) => {
    const isLuu = s.isLuu || s.name.startsWith('L.');
    const color = isLuu ? '#f472b6' : '#f87171';
    let extra = '';
    if (s.tuHoa) {
      const hColor = s.tuHoa === 'Hóa Kỵ' ? '#7c3aed' : '#ef4444';
      const short = s.tuHoa.replace('Hóa ', '');
      extra += `<span style="background: ${hColor}; color: #fff; font-size: 6px; padding: 0 1.5px; border-radius: 2px; margin-left: 1px;">${short}</span>`;
    }
    if (s.status) {
      const abbr = s.status === 'Miếu' ? '(M)' : s.status === 'Vượng' ? '(V)' : s.status === 'Đắc' ? '(Đ)' : s.status === 'Bình' ? '(B)' : '(H)';
      const sColor = s.status === 'Miếu' ? '#ef4444' : s.status === 'Vượng' ? '#f59e0b' : s.status === 'Đắc' ? '#34d399' : '#94a3b8';
      extra += `<span style="color: ${sColor}; font-size: 6.5px; margin-left: 1px;">${abbr}</span>`;
    }
    return `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 7.2px; color: ${color}; line-height: 1.2;">${s.name}${extra} •</div>`;
  }).join('');

  // Badges: Tuan & Triet
  let tuanTrietBadges = '';
  if (cung.isTuan) {
    tuanTrietBadges += '<span style="background: #f59e0b; color: #000000; font-size: 7px; font-weight: 900; padding: 1px 3px; border-radius: 2px; margin-left: 2px;">TUẦN</span>';
  }
  if (cung.isTriet) {
    tuanTrietBadges += '<span style="background: #dc2626; color: #ffffff; font-size: 7px; font-weight: 900; padding: 1px 3px; border-radius: 2px; margin-left: 2px;">TRIỆT</span>';
  }

  const isHighlighted = isMenh || cung.cungChuc === 'Mệnh' || cung.cungChuc === 'Quan Lộc' || cung.cungChuc === 'Tài Bạch';
  const borderColor = isMenh || cung.cungChuc === 'Mệnh' ? '#f59e0b' : isHighlighted ? 'rgba(245, 158, 11, 0.5)' : 'rgba(168, 85, 247, 0.35)';
  const bgColor = isMenh || cung.cungChuc === 'Mệnh' ? 'rgba(45, 15, 75, 0.95)' : 'rgba(23, 9, 48, 0.95)';

  return `
    <div style="grid-row: ${r} / span 1; grid-column: ${c} / span 1; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 6px; padding: 5px 6px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Header: Cung Chuc, Than, Vong Trang Sinh, Can Chi -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(245, 158, 11, 0.35); padding-bottom: 2px; margin-bottom: 2px;">
          <div style="display: flex; align-items: center; gap: 2px;">
            <span style="font-weight: 800; font-size: 10px; text-transform: uppercase; color: ${cung.cungChuc === 'Mệnh' ? '#fde68a' : '#ffffff'}; font-family: 'Lora', Georgia, serif;">
              ${cung.cungChuc}
            </span>
            ${cung.isThan ? '<span style="background: #dc2626; color: #ffffff; font-size: 6.5px; font-weight: 900; padding: 0.5px 2px; border-radius: 2px;">THÂN</span>' : ''}
            ${cung.vongTrangSinh ? `<span style="background: rgba(245, 158, 11, 0.15); color: #fde68a; font-size: 6.8px; padding: 0.5px 2px; border-radius: 2px;">${cung.vongTrangSinh}</span>` : ''}
          </div>
          <div style="display: flex; align-items: center;">
            ${tuanTrietBadges}
            <span style="font-size: 8.5px; font-weight: 700; color: #c084fc; margin-left: 3px;">${cung.canChiShort || (cung.can + '.' + cung.chi)}</span>
          </div>
        </div>

        <!-- Chinh Tinh Section -->
        <div style="margin: 2px 0 2px 0; border-bottom: 1px dashed rgba(168, 85, 247, 0.25); padding-bottom: 2px;">
          ${chinhTinhHtml}
        </div>
      </div>

      <!-- Phu Tinh Section (2 columns) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; font-size: 7.2px; flex: 1; margin: 1px 0; overflow: hidden;">
        <div style="border-right: 1px solid rgba(255,255,255,0.06); padding-right: 1px;">
          ${catTinhHtml}
        </div>
        <div style="text-align: right; padding-left: 1px;">
          ${hungTinhHtml}
        </div>
      </div>

      <!-- Footer: Nguyet Han, Tieu Han, Dai Han -->
      <div style="border-top: 1px solid rgba(245, 158, 11, 0.3); padding-top: 2px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; line-height: 1;">
        <span style="color: #a855f7; font-size: 7.5px;">${cung.nguyetHan ? 'T.' + cung.nguyetHan : ''}</span>
        <span style="color: #38bdf8; font-weight: bold; font-size: 8px;">${cung.tieuHan || ''}</span>
        <span style="color: #fbbf24; font-weight: 800; font-size: 10.5px;">${cung.daiHan}</span>
      </div>
    </div>
  `;
}

/**
 * Render Central Thien Ban for 4x4 Grid in PDF
 */
function renderTuViThienBanHtml(tuViData: LaSoTuViData, userInfo: UserInfo): string {
  const cs = tuViData.chuSo;
  return `
    <div style="grid-row: 2 / span 2; grid-column: 2 / span 2; background: #1c0a36; border: 1.5px solid #f59e0b; border-radius: 8px; padding: 10px 12px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: inset 0 0 15px rgba(0,0,0,0.6);">
      <!-- Title & Person Name -->
      <div style="text-align: center; border-bottom: 1.5px solid rgba(245, 158, 11, 0.45); padding-bottom: 6px;">
        <div style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: #f59e0b; text-transform: uppercase;">
          ✦ LÁ SỐ TỬ VI ĐẨU SỐ ✦
        </div>
        <div style="font-size: 16px; font-weight: 800; font-family: 'Lora', Georgia, serif; color: #ffffff; text-transform: uppercase; margin: 3px 0 2px 0; letter-spacing: 1px;">
          ${cs.fullName || userInfo.fullName || 'ĐƯƠNG SỐ'}
        </div>
        <div style="font-size: 10px; color: #fde68a; font-weight: 700;">
          ${cs.amDuongNamNu} • Nơi sinh: ${cs.noiSinh || 'Việt Nam'}
        </div>
      </div>

      <!-- Specs 2 Columns -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9px; margin: 6px 0; line-height: 1.5;">
        <div>
          <div><span style="color: #c084fc;">Dương lịch:</span> <strong style="color: #ffffff;">${cs.solarDate || userInfo.birthDate}</strong></div>
          <div><span style="color: #c084fc;">Giờ sinh:</span> <strong style="color: #ffffff;">${userInfo.birthTime || cs.birthTimeStr || 'Không rõ'}</strong> (${cs.canhGio})</div>
          <div><span style="color: #c084fc;">Âm lịch:</span> <strong style="color: #fde68a;">Ngày ${cs.lunarDay}/${cs.lunarMonth}/${cs.lunarYear}</strong></div>
          <div><span style="color: #c084fc;">Tiết khí:</span> <strong style="color: #ffffff;">${cs.tietKhi || '—'}</strong></div>
          <div style="margin-top: 3px;"><span style="color: #c084fc;">Tứ Trụ Bát Tự:</span></div>
          <div style="font-weight: 700; color: #fde68a; font-size: 8.8px; padding-left: 4px;">
            ${cs.yearCanChi} • ${cs.monthCanChi} • ${cs.dayCanChi} • ${cs.hourCanChi}
          </div>
        </div>

        <div>
          <div><span style="color: #c084fc;">Bản Mệnh:</span> <strong style="color: #fde68a;">${cs.banMenhNapAm}</strong></div>
          <div><span style="color: #c084fc;">Cục số:</span> <strong style="color: #ffffff;">${cs.cuc}</strong></div>
          <div><span style="color: #c084fc;">Mệnh - Cục:</span> <strong style="color: #38bdf8;">${cs.tuongQuanMenhCuc || 'Tương hòa'}</strong></div>
          <div><span style="color: #c084fc;">Thân cư:</span> <strong style="color: #f87171;">${cs.thanCu || ('Thân cư ' + cs.thanCungChi)}</strong></div>
          <div><span style="color: #c084fc;">Lai Nhân:</span> <strong style="color: #fde68a;">${cs.cungLaiNhan || 'Cung Nô bộc'}</strong></div>
          <div><span style="color: #c084fc;">Chủ Mệnh / Thân:</span> <strong style="color: #ffffff;">${cs.chuMenh} / ${cs.chuThan}</strong></div>
          <div><span style="color: #c084fc;">Lượng chỉ:</span> <strong style="color: #f59e0b;">${cs.canLuongChi || '—'}</strong></div>
        </div>
      </div>

      <!-- Bottom: Tuần / Triệt & Năm xem hạn -->
      <div style="border-top: 1px solid rgba(245, 158, 11, 0.35); padding-top: 5px; font-size: 8.8px; display: flex; justify-content: space-between; align-items: center; color: #e2e8f0;">
        <div>
          <span style="color: #f59e0b; font-weight: bold;">Tuần:</span> ${cs.tuanKhong?.join(', ') || '—'}
          <span style="color: #ef4444; font-weight: bold; margin-left: 6px;">Triệt:</span> ${cs.trietKhong?.join(', ') || '—'}
        </div>
        <div style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; border-radius: 10px; padding: 1.5px 8px; color: #fde68a; font-weight: bold;">
          Năm xem: ${cs.viewingYear} (${cs.viewingYearCanChi})
        </div>
      </div>
    </div>
  `;
}

/**
 * Render complete 4x4 Grid for PDF Page 1
 */
function renderTuViChartGridHtml(tuViData: LaSoTuViData, userInfo: UserInfo): string {
  const menhChi = tuViData.chuSo.menhCungChi;
  const palacesHtml = tuViData.cungList.map((cung) => {
    return renderTuViPalaceCellHtml(cung, cung.chi === menhChi);
  }).join('');

  const thienBanHtml = renderTuViThienBanHtml(tuViData, userInfo);

  return `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); gap: 3px; width: 738px; height: 790px; margin: 0 auto; box-sizing: border-box;">
      ${palacesHtml}
      ${thienBanHtml}
    </div>
  `;
}

/**
 * Render Core Palaces (Mệnh, Quan, Tài, Di) analysis section for Page 2
 */
function renderTuViCorePalacesAnalysisHtml(tuViData: LaSoTuViData): string {
  const keyPalaces = [
    tuViData.cungList.find((c) => c.cungChuc === 'Mệnh'),
    tuViData.cungList.find((c) => c.cungChuc === 'Quan Lộc'),
    tuViData.cungList.find((c) => c.cungChuc === 'Tài Bạch'),
    tuViData.cungList.find((c) => c.cungChuc === 'Thiên Di'),
  ].filter(Boolean) as CungLaSo[];

  return `
    <div class="pdf-card-block" style="margin-bottom: 20px; background: rgba(35, 12, 68, 0.85); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 14px; padding: 16px 20px;">
      <div style="font-size: 13px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 8px; margin-bottom: 12px; font-family: sans-serif;">
        ✦ TAM PHƯƠNG TỨ CHÍNH CỐT LÕI (MỆNH - QUAN - TÀI - DI) ✦
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        ${keyPalaces.map((p) => {
          const stars = p.chinhTinh.map((s) => `${s.name}${s.status ? ` (${s.status})` : ''}`).join(', ') || 'Vô Chính Diệu';
          const cat = p.catTinhList.map((s) => s.name).slice(0, 5).join(', ') || '—';
          const hung = p.hungTinhList.map((s) => s.name).slice(0, 5).join(', ') || '—';
          return `
            <div style="background: rgba(15, 5, 30, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: bold; font-size: 12px; color: ${p.cungChuc === 'Mệnh' ? '#f59e0b' : '#c084fc'};">
                  Cung ${p.cungChuc} (Chi: ${p.chi})
                </span>
                <span style="font-size: 10px; color: #cbd5e1;">Đại hạn: <strong>${p.daiHan} tuổi</strong></span>
              </div>
              <div style="font-size: 11px; color: #e9d5ff; margin-bottom: 3px;">
                <span style="color: #fbbf24;">Chính tinh:</span> <strong>${stars}</strong>
              </div>
              <div style="font-size: 9.5px; color: #34d399; margin-bottom: 2px;">
                Cát tinh: ${cat}
              </div>
              <div style="font-size: 9.5px; color: #f87171;">
                Hung & Sát tinh: ${hung}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render comprehensive 12-palaces reference table for Page 2
 */
function renderTuVi12PalacesSummaryTableHtml(tuViData: LaSoTuViData): string {
  return `
    <div class="pdf-card-block" style="margin-top: 20px; background: rgba(25, 9, 52, 0.85); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 14px; padding: 16px 20px;">
      <div style="font-size: 13px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 8px; margin-bottom: 12px; font-family: sans-serif;">
        ✦ BẢNG KÊ TRA CỨU TOÀN BỘ 12 CUNG CHỨC ✦
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: left; font-family: sans-serif;">
        <thead>
          <tr style="border-bottom: 1.5px solid #f59e0b; color: #fde68a; font-weight: bold;">
            <th style="padding: 6px 4px;">Cung Chức</th>
            <th style="padding: 6px 4px;">Can Chi</th>
            <th style="padding: 6px 4px;">Chính Tinh (Miếu/Vượng/Hãm)</th>
            <th style="padding: 6px 4px;">Cát Tinh Hội Chiếu</th>
            <th style="padding: 6px 4px;">Hung/Sát Tinh</th>
            <th style="padding: 6px 4px; text-align: right;">Đại Hạn</th>
          </tr>
        </thead>
        <tbody>
          ${tuViData.cungList.map((c, i) => {
            const rowBg = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent';
            const chinh = c.chinhTinh.map((s) => `${s.name}${s.status ? `(${s.status.charAt(0)})` : ''}`).join(', ') || 'Vô Chính Diệu';
            const cat = c.catTinhList.map((s) => s.name).slice(0, 4).join(', ') || '—';
            const hung = c.hungTinhList.map((s) => s.name).slice(0, 4).join(', ') || '—';
            const thanBadge = c.isThan ? '<span style="background: #dc2626; color: #fff; font-size: 7px; font-weight: bold; padding: 0 2px; border-radius: 2px; margin-left: 2px;">THÂN</span>' : '';
            return `
              <tr style="background: ${rowBg}; border-bottom: 1px solid rgba(168, 85, 247, 0.15);">
                <td style="padding: 5px 4px; font-weight: bold; color: ${c.cungChuc === 'Mệnh' ? '#f59e0b' : '#ffffff'};">
                  ${c.cungChuc} ${thanBadge}
                </td>
                <td style="padding: 5px 4px; color: #c084fc;">${c.can} ${c.chi}</td>
                <td style="padding: 5px 4px; color: #fde68a; font-weight: 600;">${chinh}</td>
                <td style="padding: 5px 4px; color: #34d399;">${cat}</td>
                <td style="padding: 5px 4px; color: #f87171;">${hung}</td>
                <td style="padding: 5px 4px; text-align: right; font-weight: bold; color: #fbbf24;">${c.daiHan}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Convert markdown to clean HTML tags with luxury celestial styling for PDF
function formatMarkdownForPdf(md: string): string {
  if (!md) return '<p class="pdf-block" style="color: #f5f3ff;">Không có nội dung luận giải.</p>';

  const clean = md.trim();
  const lines = clean.split('\n');
  const htmlParts: string[] = [];
  let inList = false;
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      continue;
    }

    // Replace bold and italics
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fde68a; font-weight: 700;">$1</strong>');
    line = line.replace(/__(.*?)__/g, '<strong style="color: #fde68a; font-weight: 700;">$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em style="color: #e9d5ff;">$1</em>');

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(4);
      htmlParts.push(`<h3 class="pdf-block" style="font-size: 14px; font-weight: bold; color: #f59e0b; margin-top: 16px; margin-bottom: 6px; border-left: 3px solid #f59e0b; padding-left: 8px; font-family: 'Lora', Georgia, serif; line-height: 1.4;">${text}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(3);
      htmlParts.push(`<h2 class="pdf-block" style="font-size: 16px; font-weight: bold; color: #fbbf24; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid rgba(245, 158, 11, 0.4); padding-bottom: 4px; font-family: 'Lora', Georgia, serif; line-height: 1.4;">${text}</h2>`);
    } else if (line.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(2);
      htmlParts.push(`<h1 class="pdf-block" style="font-size: 18px; font-weight: bold; color: #fef08a; margin-top: 22px; margin-bottom: 10px; font-family: 'Lora', Georgia, serif; text-align: center; line-height: 1.4;">${text}</h1>`);
    } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      if (!inList) {
        htmlParts.push('<ul class="pdf-block" style="margin: 6px 0; padding-left: 18px; list-style-type: disc;">');
        inList = true;
      }
      const text = line.replace(/^[-*•]\s+/, '');
      htmlParts.push(`<li class="pdf-block" style="margin-bottom: 5px; font-size: 12.5px; line-height: 1.6; color: #f3e8ff;">${text}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (!inNumberedList) {
        htmlParts.push('<ol class="pdf-block" style="margin: 6px 0; padding-left: 18px; list-style-type: decimal;">');
        inNumberedList = true;
      }
      const text = line.replace(/^\d+\.\s+/, '');
      htmlParts.push(`<li class="pdf-block" style="margin-bottom: 5px; font-size: 12.5px; line-height: 1.6; color: #f3e8ff;">${text}</li>`);
    } else if (line.startsWith('> ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(2);
      htmlParts.push(`<blockquote class="pdf-block" style="margin: 10px 0; padding: 8px 12px; background: rgba(88, 28, 135, 0.4); border-left: 3px solid #f59e0b; border-radius: 6px; font-style: italic; font-size: 12.5px; color: #fef08a; line-height: 1.55;">${text}</blockquote>`);
    } else {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      htmlParts.push(`<p class="pdf-block" style="margin-bottom: 8px; font-size: 13px; line-height: 1.6; color: #f5f3ff; text-align: justify;">${line}</p>`);
    }
  }

  if (inList) htmlParts.push('</ul>');
  if (inNumberedList) htmlParts.push('</ol>');

  return htmlParts.join('\n');
}

// Helper to convert image URL to base64 data URL to avoid CORS/blank image issues during PDF render
async function urlToBase64Safe(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return url;
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/**
 * Generate and download a high-precision multi-page PDF for Tarot / Tử Vi reading
 */
export async function exportReadingToPdf(params: ExportPdfParams): Promise<void> {
  const {
    userInfo,
    deckType,
    spreadType = SpreadType.ONE_CARD,
    question = '',
    drawnCards = [],
    aiInterpretation,
    tuViData,
    timestamp = Date.now(),
  } = params;

  const isTuVi = deckType === DeckType.TU_VI || !!tuViData;

  const dateFormatted = new Date(timestamp).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Pre-fetch Tarot cards base64 images if applicable
  const processedCards = !isTuVi
    ? await Promise.all(
        drawnCards.map(async (dc) => {
          const base64Img = await urlToBase64Safe(dc.card.image);
          return {
            ...dc,
            loadedImage: base64Img,
          };
        })
      )
    : [];

  // Create temporary container positioned in DOM but behind viewport
  const container = document.createElement('div');
  container.id = 'pdf-export-render-container';
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px'; // 210mm at standard 96 DPI
  container.style.backgroundColor = '#0f0521';
  container.style.color = '#f8fafc';
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Lora', serif";
  container.style.padding = isTuVi ? '22px 28px' : '36px 40px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';

  if (isTuVi && tuViData) {
    // ---------------------------------------------------------
    // TU VI PROFESSIONAL PDF (PAGE 1: COMPLETE CHART, PAGE 2+: INTERPRETATION)
    // ---------------------------------------------------------
    const gridHtml = renderTuViChartGridHtml(tuViData, userInfo);
    const corePalacesHtml = renderTuViCorePalacesAnalysisHtml(tuViData);
    const summaryTableHtml = renderTuVi12PalacesSummaryTableHtml(tuViData);
    const formattedInterpretation = formatMarkdownForPdf(aiInterpretation || '');

    container.innerHTML = `
      <!-- ================= PAGE 1 ================= -->
      <div class="pdf-page-1-wrapper" style="box-sizing: border-box; width: 100%; display: flex; flex-direction: column; justify-content: space-between;">
        <!-- Luxury Tu Vi Header -->
        <div class="pdf-card-block" style="border-bottom: 2px solid #f59e0b; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 17px; font-weight: 900; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase;">
              ✦ TỬ VI ĐẨU SỐ • MỆNH BÀN TOÀN THƯ ✦
            </div>
            <div style="font-size: 10.5px; color: #d8b4fe; font-family: sans-serif; letter-spacing: 0.5px; margin-top: 1px;">
              Đương số: <strong style="color: #ffffff; text-transform: uppercase;">${tuViData.chuSo.fullName}</strong> • Năm sinh: <strong style="color: #fde68a;">${tuViData.chuSo.yearCanChi}</strong> (${tuViData.chuSo.amDuongNamNu})
            </div>
          </div>
          <div style="text-align: right; font-family: sans-serif; font-size: 10px; color: #c084fc; white-space: nowrap;">
            <div>Ngày lập: <strong style="color: #ffffff;">${dateFormatted}</strong></div>
            <div style="color: #fde68a; font-weight: 700; margin-top: 1px;">
              Năm xem hạn: ${tuViData.chuSo.viewingYear} (${tuViData.chuSo.viewingYearCanChi})
            </div>
          </div>
        </div>

        <!-- 4x4 Grid of 12 Palaces & Center Board -->
        <div class="pdf-card-block" style="margin-bottom: 8px;">
          ${gridHtml}
        </div>

        <!-- Page 1 Footer Note -->
        <div class="pdf-card-block" style="border-top: 1px solid rgba(245, 158, 11, 0.4); padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 8.5px; color: #c084fc;">
          <div>
            Chú giải: <span style="color: #ef4444; font-weight: bold;">(M) Miếu</span> • <span style="color: #f59e0b; font-weight: bold;">(V) Vượng</span> • <span style="color: #10b981; font-weight: bold;">(Đ) Đắc</span> • <span style="color: #94a3b8;">(H) Hãm</span> • <span style="color: #34d399;">Cát tinh</span> • <span style="color: #f87171;">Hung tinh</span>
          </div>
          <div style="color: #f59e0b; font-weight: bold;">✦ Trang 1 • Bàn Cờ Thập Nhị Cung Tử Vi Đẩu Số ✦</div>
        </div>
      </div>

      <!-- Explicit Slicing Separator for Page 2 -->
      <div class="pdf-card-block pdf-page-break" style="height: 12px; margin: 24px 0 16px 0; border-bottom: 2px dashed rgba(245, 158, 11, 0.4); display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #f59e0b; font-family: sans-serif;">
        <span>✦ BẮT ĐẦU TRANG 2 ✦</span>
        <span>PHÂN TÍCH CHI TIẾT & BẢNG KÊ 12 CUNG</span>
      </div>

      <!-- ================= PAGE 2+: DETAILS & INTERPRETATION ================= -->
      <div class="pdf-page-2-wrapper" style="box-sizing: border-box; width: 100%;">
        <!-- Page 2 Header -->
        <div class="pdf-card-block" style="border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 16px; font-weight: bold; color: #f59e0b; letter-spacing: 1.5px; text-transform: uppercase;">
              ✦ PHÂN TÍCH TỬ VI & BẢNG KÊ CHI TIẾT ✦
            </div>
            <div style="font-size: 11px; color: #d8b4fe; font-family: sans-serif; margin-top: 2px;">
              Mệnh: <strong style="color: #fde68a;">${tuViData.chuSo.banMenhNapAm}</strong> • Cục: <strong style="color: #ffffff;">${tuViData.chuSo.cuc}</strong> • Thân cư: <strong style="color: #f87171;">${tuViData.chuSo.thanCu}</strong>
            </div>
          </div>
          <div style="text-align: right; font-family: sans-serif; font-size: 10px; color: #c084fc;">
            <div>Đương số: <strong style="color: #ffffff;">${tuViData.chuSo.fullName}</strong></div>
            <div style="color: #fde68a; font-weight: bold; margin-top: 1px;">Lá Số Toàn Thư</div>
          </div>
        </div>

        <!-- Core Palaces Overview -->
        ${corePalacesHtml}

        <!-- AI Master Detailed Interpretation Section -->
        <div class="pdf-card-block" style="margin-top: 18px; background: rgba(20, 8, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 14px; padding: 20px 24px;">
          <div class="pdf-block" style="font-size: 13px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 8px; margin-bottom: 14px; font-family: sans-serif;">
            ✦ TOÀN VĂN LUẬN GIẢI TỬ VI ĐẨU SỐ ✦
          </div>
          <div style="font-family: 'Lora', Georgia, serif;">
            ${formattedInterpretation}
          </div>
        </div>

        <!-- Comprehensive 12 Palaces Table -->
        ${summaryTableHtml}

        <!-- Final Page Footer Watermark -->
        <div class="pdf-card-block" style="margin-top: 26px; border-top: 1px solid rgba(245, 158, 11, 0.4); padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 9.5px; color: #c084fc;">
          <div>Neko Tarot • Tử Vi Đẩu Số Cổ Học • https://nekotarot.vercel.app</div>
          <div style="color: #f59e0b; font-weight: bold;">✦ ĐỨC NĂNG THẮNG SỐ • TẬN NHÂN LỰC TRI THIÊN MỆNH ✦</div>
        </div>
      </div>
    `;
  } else {
    // ---------------------------------------------------------
    // TAROT READING PDF
    // ---------------------------------------------------------
    const cardGridClass = processedCards.length === 1 
      ? 'grid-template-columns: 1fr;' 
      : processedCards.length === 3 
        ? 'grid-template-columns: repeat(3, 1fr);' 
        : 'grid-template-columns: repeat(5, 1fr);';

    const cardsHtml = processedCards.length > 0 ? `
      <div class="pdf-card-block" style="margin: 20px 0; background: #1b0c38; border: 1.5px solid #f59e0b; border-radius: 14px; padding: 18px 20px;">
        <div style="text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 14px;">
          ✦ CÁC LÁ BÀI ĐÃ RÚT (${processedCards.length} LÁ) ✦
        </div>
        <div style="display: grid; ${cardGridClass} gap: 14px; justify-items: center; align-items: start;">
          ${processedCards.map((dc) => `
            <div style="text-align: center; width: 100%; max-width: 140px;">
              <div style="width: 100px; height: 160px; border-radius: 8px; overflow: hidden; border: 2px solid #fbbf24; margin: 0 auto 8px; background: #2a1154; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
                <img src="${dc.loadedImage}" style="width: 100%; height: 100%; object-fit: cover; display: block; ${dc.isReversed ? 'transform: rotate(180deg);' : ''}" />
              </div>
              <div style="font-size: 12px; font-weight: bold; color: #fde68a;">${dc.card.name}</div>
              <div style="font-size: 10px; font-weight: 700; color: ${dc.isReversed ? '#f87171' : '#4ade80'}; margin-top: 3px;">
                ${dc.isReversed ? '▼ Chiều Ngược' : '▲ Chiều Xuôi'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const formattedBody = formatMarkdownForPdf(aiInterpretation || '');

    container.innerHTML = `
      <!-- Luxury Header -->
      <div class="pdf-card-block" style="border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 20px; font-weight: bold; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase;">
            ✦ NEKO TAROT ✦
          </div>
          <div style="font-size: 12px; color: #d8b4fe; font-family: sans-serif; letter-spacing: 1px; margin-top: 2px;">
            HUYỀN HỌC & TRÍ TUỆ VŨ TRỤ
          </div>
        </div>
        <div style="text-align: right; font-family: sans-serif; font-size: 11px; color: #c084fc; white-space: nowrap;">
          <div>Ngày lập: <strong style="color: #ffffff;">${dateFormatted}</strong></div>
          <div style="color: #fde68a; font-weight: 600; margin-top: 2px;">
            ${spreadType === SpreadType.ONE_CARD ? 'Quẻ 1 Lá' : spreadType === SpreadType.THREE_CARDS ? 'Quẻ 3 Lá' : 'Trải Bài'}
          </div>
        </div>
      </div>

      <!-- Question / Header Banner -->
      <div class="pdf-card-block" style="background: rgba(88, 28, 135, 0.35); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 12px 18px; margin-bottom: 18px; font-size: 13px;">
        <div style="color: #fde68a; font-weight: bold; margin-bottom: 4px; white-space: nowrap;">
          👤 Đương số / Khách hàng: <span style="color: #ffffff; font-weight: 700; white-space: nowrap;">${userInfo.fullName || 'Tín chủ'}</span>
        </div>
        ${question ? `
          <div style="color: #e9d5ff; font-style: italic; line-height: 1.5;">
            ❓ Băn khoăn / Câu hỏi: "${question}"
          </div>
        ` : ''}
      </div>

      <!-- Cards Section -->
      ${cardsHtml}

      <!-- Complete AI Interpretation Document Section -->
      <div class="pdf-card-block" style="margin-top: 24px; background: rgba(20, 8, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 24px 28px;">
        <div class="pdf-block" style="font-size: 14px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 10px; margin-bottom: 16px; font-family: sans-serif;">
          ✦ TOÀN VĂN LUẬN GIẢI CHI TIẾT ✦
        </div>
        <div style="font-family: 'Lora', Georgia, serif;">
          ${formattedBody}
        </div>
      </div>

      <!-- Professional Footer Watermark -->
      <div class="pdf-card-block" style="margin-top: 30px; border-top: 1px solid rgba(245, 158, 11, 0.4); padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 10.5px; color: #c084fc;">
        <div>Neko Tarot • Huyền Học & Tử Vi • https://nekotarot.vercel.app</div>
        <div style="color: #f59e0b; font-weight: bold;">✦ TRÍ TUỆ TÂM LINH & ĐỊNH HƯỚNG VẬN MỆNH ✦</div>
      </div>
    `;
  }

  document.body.appendChild(container);

  try {
    // Settle layout and paint
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Calculate safe breakpoints across DOM blocks
    const domBreakpoints: number[] = [];
    const containerTop = container.offsetTop;
    const blockElements = container.querySelectorAll<HTMLElement>(
      'h1, h2, h3, p, li, blockquote, .pdf-card-block, .pdf-block, ul, ol'
    );

    blockElements.forEach((el) => {
      const topRel = el.offsetTop - containerTop;
      const bottomRel = topRel + el.offsetHeight;
      if (topRel > 10) {
        domBreakpoints.push(topRel - 6);
      }
      if (bottomRel > 10) {
        domBreakpoints.push(bottomRel + 6);
      }
    });

    // Render container to high-res PNG image
    const dataUrl = await toPng(container, {
      quality: 1,
      pixelRatio: 2, // High resolution (1588px width)
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      filter: (node) => {
        if (node && (node as HTMLElement).tagName === 'LINK') {
          return false;
        }
        return true;
      },
    });

    // Create Image to compute pixel dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
      img.src = dataUrl;
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const a4AspectRatio = pageHeight / pageWidth; // 297 / 210 ≈ 1.4142857

    // Exact height of one A4 page in canvas image pixels
    const fullPageHeightPx = Math.round(img.width * a4AspectRatio);
    const scaleFactor = img.width / container.offsetWidth;

    // Convert DOM breakpoint coordinates into image pixel coordinates
    const imageBreakpoints = domBreakpoints
      .map((bp) => bp * scaleFactor)
      .sort((a, b) => a - b);

    let currentY = 0;
    let pageIndex = 0;

    while (currentY < img.height) {
      const remainingHeight = img.height - currentY;
      let sliceHeightPx: number;

      if (remainingHeight <= fullPageHeightPx) {
        // Last page: render remaining height
        sliceHeightPx = remainingHeight;
      } else {
        // Multi-page: find optimal break point between 60% and 95% of full page height
        const targetMaxY = currentY + fullPageHeightPx;
        const minSafeY = currentY + fullPageHeightPx * 0.60;

        // Candidate break points that do not cut across elements
        const validBreaks = imageBreakpoints.filter(
          (bp) => bp >= minSafeY && bp <= targetMaxY - 25 * scaleFactor
        );

        if (validBreaks.length > 0) {
          // Take highest safe breakpoint before page overflow
          const chosenBreakY = validBreaks[validBreaks.length - 1];
          sliceHeightPx = Math.round(chosenBreakY - currentY);
        } else {
          // Fallback if no specific element break found
          sliceHeightPx = fullPageHeightPx;
        }
      }

      // Create an exact A4-proportioned canvas (fills 100% full bleed with dark celestial theme)
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = img.width;
      pageCanvas.height = fullPageHeightPx;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        // Fill canvas with solid celestial dark background (ZERO white borders)
        ctx.fillStyle = '#0f0521';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw sliced section of main image
        ctx.drawImage(
          img,
          0,
          currentY,
          img.width,
          sliceHeightPx,
          0,
          0,
          img.width,
          sliceHeightPx
        );

        const pageDataUrl = pageCanvas.toDataURL('image/png', 0.96);

        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Fill PDF background and place full-bleed image with margin 0
        pdf.setFillColor(15, 5, 33);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.addImage(pageDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }

      currentY += sliceHeightPx;
      pageIndex++;
    }

    const sanitizedName = (userInfo.fullName || 'DuongSo')
      .trim()
      .replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s_-]/g, '')
      .replace(/\s+/g, '-');
    const filePrefix = isTuVi ? 'LaSo-TuVi' : 'Que-Tarot';
    const yearSuffix = tuViData?.chuSo.viewingYear || new Date().getFullYear();
    const fileName = `${filePrefix}-${sanitizedName}-${yearSuffix}.pdf`;

    pdf.save(fileName);
  } finally {
    // Remove temporary container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
