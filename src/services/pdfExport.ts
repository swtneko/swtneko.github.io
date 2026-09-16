import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DeckType, SpreadType, UserInfo, DrawnCard, LaSoTuViData } from '../types';

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

// Convert markdown to clean HTML tags with luxury celestial styling for PDF
function formatMarkdownForPdf(md: string): string {
  if (!md) return '<p>Không có nội dung luận giải.</p>';

  // Remove trailing credits if duplicated
  const clean = md.trim();

  const lines = clean.split('\n');
  const htmlParts: string[] = [];
  let inList = false;
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      if (inNumberedList) {
        htmlParts.push('</ol>');
        inNumberedList = false;
      }
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
      htmlParts.push(`<h3 style="font-size: 15px; font-weight: bold; color: #f59e0b; margin-top: 18px; margin-bottom: 8px; border-left: 3px solid #f59e0b; padding-left: 10px; font-family: 'Lora', Georgia, serif;">${text}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(3);
      htmlParts.push(`<h2 style="font-size: 17px; font-weight: bold; color: #fbbf24; margin-top: 22px; margin-bottom: 10px; border-bottom: 1px solid rgba(245, 158, 11, 0.4); padding-bottom: 6px; font-family: 'Lora', Georgia, serif;">${text}</h2>`);
    } else if (line.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(2);
      htmlParts.push(`<h1 style="font-size: 20px; font-weight: bold; color: #fef08a; margin-top: 24px; margin-bottom: 12px; font-family: 'Lora', Georgia, serif; text-align: center;">${text}</h1>`);
    } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      if (!inList) {
        htmlParts.push('<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">');
        inList = true;
      }
      const text = line.replace(/^[-*•]\s+/, '');
      htmlParts.push(`<li style="margin-bottom: 6px; font-size: 13px; line-height: 1.6; color: #f3e8ff;">${text}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (!inNumberedList) {
        htmlParts.push('<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal;">');
        inNumberedList = true;
      }
      const text = line.replace(/^\d+\.\s+/, '');
      htmlParts.push(`<li style="margin-bottom: 6px; font-size: 13px; line-height: 1.6; color: #f3e8ff;">${text}</li>`);
    } else if (line.startsWith('> ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      const text = line.substring(2);
      htmlParts.push(`<blockquote style="margin: 12px 0; padding: 10px 14px; background: rgba(88, 28, 135, 0.4); border-left: 4px solid #f59e0b; border-radius: 6px; font-style: italic; font-size: 13px; color: #fef08a; line-height: 1.6;">${text}</blockquote>`);
    } else {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (inNumberedList) { htmlParts.push('</ol>'); inNumberedList = false; }
      htmlParts.push(`<p style="margin-bottom: 10px; font-size: 13.5px; line-height: 1.65; color: #f5f3ff; text-align: justify;">${line}</p>`);
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

  // Pre-fetch cards base64 images for reliable offline/instant canvas rendering
  const processedCards = await Promise.all(
    drawnCards.map(async (dc) => {
      const base64Img = await urlToBase64Safe(dc.card.image);
      return {
        ...dc,
        loadedImage: base64Img,
      };
    })
  );

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
  container.style.padding = '36px 40px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';

  // Build Tarot cards section HTML
  let cardsHtml = '';
  if (!isTuVi && processedCards.length > 0) {
    const cardGridClass = processedCards.length === 1 
      ? 'grid-template-columns: 1fr;' 
      : processedCards.length === 3 
        ? 'grid-template-columns: repeat(3, 1fr);' 
        : 'grid-template-columns: repeat(5, 1fr);';

    cardsHtml = `
      <div style="margin: 20px 0; background: #1b0c38; border: 1.5px solid #f59e0b; border-radius: 14px; padding: 18px 20px;">
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
    `;
  }

  // Build Tu Vi palaces summary HTML
  let tuViHtml = '';
  if (isTuVi && tuViData) {
    const keyPalaces = [
      tuViData.cungList.find(c => c.cungChuc === 'Mệnh'),
      tuViData.cungList.find(c => c.cungChuc === 'Quan Lộc'),
      tuViData.cungList.find(c => c.cungChuc === 'Tài Bạch'),
      tuViData.cungList.find(c => c.cungChuc === 'Thiên Di'),
    ].filter(Boolean);

    tuViHtml = `
      <div style="margin: 18px 0; background: rgba(35, 12, 68, 0.7); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 18px 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(168, 85, 247, 0.3); padding-bottom: 10px; margin-bottom: 12px;">
          <div style="font-size: 14px; font-weight: bold; color: #fef08a;">
            👤 Đương số: <span style="color: #f59e0b; text-transform: uppercase;">${userInfo.fullName || 'Tín chủ'}</span>
          </div>
          <div style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde68a; font-size: 11px; font-weight: bold; padding: 2px 10px; border-radius: 20px; font-family: sans-serif;">
            ${tuViData.chuSo.amDuongNamNu} • Năm xem: ${tuViData.chuSo.viewingYear} (${tuViData.chuSo.viewingYearCanChi})
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: sans-serif; font-size: 12px; margin-bottom: 12px;">
          <div><span style="color: #c084fc;">Dương lịch:</span> <strong style="color: #ffffff;">${userInfo.birthDate}</strong> lúc <strong>${userInfo.birthTime || 'Không rõ'}</strong></div>
          <div><span style="color: #c084fc;">Âm lịch:</span> <strong style="color: #fde68a;">Ngày ${tuViData.chuSo.lunarDay}/${tuViData.chuSo.lunarMonth}/${tuViData.chuSo.lunarYear} (${tuViData.chuSo.canhGio})</strong></div>
          <div><span style="color: #c084fc;">Bát Tự Can Chi:</span> <strong style="color: #fde68a;">${tuViData.chuSo.yearCanChi} • ${tuViData.chuSo.monthCanChi} • ${tuViData.chuSo.dayCanChi} • ${tuViData.chuSo.hourCanChi}</strong></div>
          <div><span style="color: #c084fc;">Cân Xương Tính Số:</span> <strong style="color: #f59e0b;">${tuViData.chuSo.canLuongChi || '—'}</strong></div>
          <div><span style="color: #c084fc;">Bản Mệnh:</span> <strong style="color: #fde68a;">${tuViData.chuSo.banMenhNapAm}</strong></div>
          <div><span style="color: #c084fc;">Cục & Thân:</span> <strong style="color: #ffffff;">${tuViData.chuSo.cuc} | ${tuViData.chuSo.thanCu}</strong></div>
        </div>

        <div style="border-top: 1px solid rgba(168, 85, 247, 0.3); padding-top: 12px;">
          <div style="font-size: 11px; font-family: sans-serif; font-weight: bold; color: #f59e0b; text-transform: uppercase; margin-bottom: 8px;">
            TAM PHƯƠNG TỨ CHÍNH CỐT LÕI (MỆNH - QUAN - TÀI - DI)
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${keyPalaces.map(p => {
              if (!p) return '';
              const stars = p.chinhTinh.map(s => `${s.name}${s.status ? ` (${s.status})` : ''}`).join(', ') || 'Vô Chính Diệu';
              return `
                <div style="background: rgba(15, 5, 30, 0.6); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 8px 10px;">
                  <div style="font-weight: bold; font-size: 12px; color: ${p.cungChuc === 'Mệnh' ? '#f59e0b' : '#c084fc'}; margin-bottom: 4px;">
                    Cung ${p.cungChuc} (${p.chi}) ${p.isTuan ? '<span style="color: #f87171; font-size: 10px;">[Tuần]</span>' : ''} ${p.isTriet ? '<span style="color: #60a5fa; font-size: 10px;">[Triệt]</span>' : ''}
                  </div>
                  <div style="font-size: 11px; color: #e9d5ff;">${stars}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Interpretation formatted HTML
  const formattedBody = formatMarkdownForPdf(aiInterpretation || '');

  container.innerHTML = `
    <!-- Luxury Header -->
    <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 20px; font-weight: bold; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase;">
          ✦ THIÊN KHÔNG ✦
        </div>
        <div style="font-size: 12px; color: #d8b4fe; font-family: sans-serif; letter-spacing: 1px; margin-top: 2px;">
          ${isTuVi ? 'TỬ VI ĐẨU SỐ & MỆNH BÀN TOÀN THƯ' : 'HUYỀN HỌC & TRÍ TUỆ VŨ TRỤ'}
        </div>
      </div>
      <div style="text-align: right; font-family: sans-serif; font-size: 11px; color: #c084fc;">
        <div>Ngày lập: <strong style="color: #ffffff;">${dateFormatted}</strong></div>
        <div style="color: #fde68a; font-weight: 600; margin-top: 2px;">
          ${isTuVi ? `Lá số năm ${tuViData?.chuSo.viewingYear || new Date().getFullYear()}` : spreadType === SpreadType.ONE_CARD ? 'Quẻ 1 Lá' : spreadType === SpreadType.THREE_CARDS ? 'Quẻ 3 Lá' : 'Trải Bài'}
        </div>
      </div>
    </div>

    <!-- Question / Header Banner -->
    <div style="background: rgba(88, 28, 135, 0.35); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 12px 18px; margin-bottom: 18px; font-size: 13px;">
      <div style="color: #fde68a; font-weight: bold; margin-bottom: 4px;">
        👤 Đương số / Khách hàng: <span style="color: #ffffff;">${userInfo.fullName || 'Tín chủ'}</span>
      </div>
      ${question ? `
        <div style="color: #e9d5ff; font-style: italic;">
          ❓ Băn khoăn / Câu hỏi: "${question}"
        </div>
      ` : ''}
    </div>

    <!-- Astrological / Tarot Cards Section -->
    ${isTuVi ? tuViHtml : cardsHtml}

    <!-- Complete AI Interpretation Document Section -->
    <div style="margin-top: 24px; background: rgba(20, 8, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 24px 28px;">
      <div style="font-size: 14px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 10px; margin-bottom: 16px; font-family: sans-serif;">
        ✦ TOÀN VĂN LUẬN GIẢI CHI TIẾT ✦
      </div>
      <div style="font-family: 'Lora', Georgia, serif;">
        ${formattedBody}
      </div>
    </div>

    <!-- Professional Footer Watermark -->
    <div style="margin-top: 30px; border-top: 1px solid rgba(245, 158, 11, 0.4); padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 10.5px; color: #c084fc;">
      <div>Thiên Không Huyền Học & Tử Vi &bull; https://thienkhong.app</div>
      <div style="color: #f59e0b; font-weight: bold;">✦ TRÍ TUỆ TÂM LINH & ĐỊNH HƯỚNG VẬN MỆNH ✦</div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Settle layout and paint
    await new Promise((resolve) => setTimeout(resolve, 120));

    // Render the container to high-res PNG image
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
    const margin = 8;
    const printWidth = pageWidth - margin * 2; // 194mm
    const printHeight = pageHeight - margin * 2; // 281mm

    const pxToMm = printWidth / img.width;
    const totalPdfHeight = img.height * pxToMm;

    if (totalPdfHeight <= printHeight) {
      // Fits in single page
      pdf.addImage(dataUrl, 'PNG', margin, margin, printWidth, totalPdfHeight, undefined, 'FAST');
    } else {
      // Slice cleanly across multiple A4 pages without blank pages or overflow
      const pageHeightPx = Math.floor(printHeight / pxToMm);
      let currentY = 0;
      let pageIndex = 0;

      while (currentY < img.height) {
        const sliceHeightPx = Math.min(pageHeightPx, img.height - currentY);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = sliceHeightPx;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Draw dark background to prevent any white flashes
          ctx.fillStyle = '#0f0521';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the sliced section of the main image
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

          const sliceDataUrl = canvas.toDataURL('image/png', 0.95);
          const sliceHeightMm = sliceHeightPx * pxToMm;

          if (pageIndex > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            sliceDataUrl,
            'PNG',
            margin,
            margin,
            printWidth,
            sliceHeightMm,
            undefined,
            'FAST'
          );
        }

        currentY += sliceHeightPx;
        pageIndex++;
      }
    }

    const sanitizedName = (userInfo.fullName || 'Thien-Khong')
      .trim()
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .replace(/\s+/g, '-');
    const filePrefix = isTuVi ? 'LaSo-TuVi' : 'Que-Tarot';
    const fileName = `${filePrefix}-${sanitizedName}-${Date.now()}.pdf`;

    pdf.save(fileName);
  } finally {
    // Remove temporary container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
