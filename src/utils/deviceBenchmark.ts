/**
 * Device hardware benchmarking and capability detection utility.
 * Safely inspects available browser APIs (CPU cores, RAM, WebGL GPU renderer, motion preference)
 * to determine whether the device is lower-end (yếu/tiết kiệm pin) or high-end (khỏe).
 */

export interface DeviceHardwareInfo {
  tier: 'high' | 'medium' | 'low';
  isLowEnd: boolean;
  cpuCores: number;
  memoryGB: number | null;
  gpuRenderer: string;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
  score: number; // 0 - 100
  summary: string;
}

export function detectDeviceHardware(): DeviceHardwareInfo {
  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      isLowEnd: false,
      cpuCores: 8,
      memoryGB: 8,
      gpuRenderer: 'Server/Standard',
      isMobile: false,
      prefersReducedMotion: false,
      saveData: false,
      score: 85,
      summary: 'Thiết bị tiêu chuẩn',
    };
  }

  // 1. CPU Cores
  const cpuCores = navigator.hardwareConcurrency || 4;

  // 2. RAM (Chromium devices support navigator.deviceMemory in GB)
  const memoryGB = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null;

  // 3. User Agent Mobile check
  const ua = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // 4. Reduced Motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 5. Network Data Saver
  const connection = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const saveData = connection?.saveData === true || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';

  // 6. WebGL GPU renderer inspection
  let gpuRenderer = 'Không xác định';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gl.getParameter(gl.RENDERER) || 'Chuẩn WebGL';
      } else {
        gpuRenderer = gl.getParameter(gl.RENDERER) || 'Chuẩn WebGL';
      }
    }
  } catch {
    gpuRenderer = 'WebGL không khả dụng';
  }

  // 7. Calculate Hardware Score (0 - 100)
  let score = 50;

  // CPU scoring
  if (cpuCores >= 8) score += 20;
  else if (cpuCores >= 6) score += 10;
  else if (cpuCores <= 2) score -= 25;
  else if (cpuCores <= 4) score -= 10;

  // RAM scoring
  if (memoryGB !== null) {
    if (memoryGB >= 8) score += 25;
    else if (memoryGB >= 6) score += 15;
    else if (memoryGB >= 4) score += 5;
    else if (memoryGB <= 2) score -= 30;
    else if (memoryGB <= 3) score -= 15;
  } else {
    // If iOS (which hides deviceMemory), check screen resolution & cores
    if (/iPhone|iPad/i.test(ua)) {
      // Modern iOS devices are typically very performant unless battery saver
      score += 15;
    }
  }

  // GPU keyword inspection
  const gpuLower = gpuRenderer.toLowerCase();
  const lowGpuKeywords = [
    'swiftshader', 'llvmpipe', 'software', 'mesa', 'basic render',
    'mali-4', 'mali-t', 'mali-g31', 'mali-g51', 'mali-g52',
    'adreno 3', 'adreno 504', 'adreno 505', 'adreno 506', 'adreno (tm) 3',
    'powervr ge', 'powervr sgx', 'powervr rogue', 'intel hd graphics 3000',
    'intel hd graphics 4000', 'intel hd graphics 2000'
  ];
  const highGpuKeywords = [
    'apple', 'adreno 6', 'adreno 7', 'adreno 8', 'adreno (tm) 6', 'adreno (tm) 7',
    'geforce', 'nvidia', 'radeon', 'rtx', 'gtx', 'immortalis', 'mali-g7'
  ];

  if (lowGpuKeywords.some(kw => gpuLower.includes(kw))) {
    score -= 25;
  } else if (highGpuKeywords.some(kw => gpuLower.includes(kw))) {
    score += 15;
  }

  if (saveData) score -= 20;
  if (prefersReducedMotion) score -= 30;

  // Final tier categorization
  const isLowEnd = score < 50 || prefersReducedMotion || saveData;
  let tier: 'high' | 'medium' | 'low' = 'medium';
  if (score >= 65 && !isLowEnd) {
    tier = 'high';
  } else if (score < 45 || isLowEnd) {
    tier = 'low';
  }

  // Human-readable summary
  let summary = '';
  if (tier === 'high') {
    summary = `Cấu hình mạnh (${cpuCores} nhân CPU${memoryGB ? `, ~${memoryGB}GB RAM` : ''}) • Mượt mà 60fps`;
  } else if (tier === 'medium') {
    summary = `Cấu hình cân bằng (${cpuCores} nhân CPU${memoryGB ? `, ~${memoryGB}GB RAM` : ''}) • Hoạt động tốt`;
  } else {
    summary = `Cấu hình phổ thông / Tiết kiệm pin (${cpuCores} nhân CPU${memoryGB ? `, ~${memoryGB}GB RAM` : ''}) • Tối ưu nhẹ`;
  }

  return {
    tier,
    isLowEnd,
    cpuCores,
    memoryGB,
    gpuRenderer,
    isMobile,
    prefersReducedMotion,
    saveData,
    score: Math.max(0, Math.min(100, score)),
    summary,
  };
}
