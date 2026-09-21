/**
 * Comprehensive Device Hardware & System Capabilities Inspection Utility.
 * Accurately analyzes CPU cores, RAM, GPU graphics adapter (WebGL/WebGL2/WebGPU),
 * screen resolution, display refresh rate (Hz), OS architecture, and battery/power mode.
 */

export interface DeviceHardwareInfo {
  tier: 'high' | 'medium' | 'low';
  isLowEnd: boolean;
  score: number; // 0 - 100
  summary: string;
  recommendation: string;

  // CPU
  cpuCores: number;
  cpuArchitecture: string;

  // RAM & Memory
  memoryGB: number | null;
  memoryLabel: string;
  jsHeapLimitMB: number | null;
  jsHeapUsedMB: number | null;

  // GPU & Graphics
  gpuVendor: string;
  gpuRenderer: string;
  gpuClass: 'dedicated' | 'integrated' | 'mobile_flagship' | 'mobile_mid' | 'software' | 'unknown';
  hasWebGL2: boolean;
  hasWebGPU: boolean;
  maxTextureSize: number;

  // Display & Screen
  screenResolution: string;
  physicalResolution: string;
  devicePixelRatio: number;
  refreshRateHz: number;
  colorGamut: string;

  // OS & Platform
  osName: string;
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  browserEngine: string;

  // Constraints & Preferences
  prefersReducedMotion: boolean;
  saveData: boolean;
  isBatteryLow?: boolean;
}

/**
 * Accurately reads GPU unmasked vendor, renderer, and WebGL limits.
 */
function inspectGpuDetails() {
  let gpuVendor = 'Không xác định';
  let gpuRenderer = 'Chuẩn đồ họa WebGL';
  let hasWebGL2 = false;
  let maxTextureSize = 2048;

  if (typeof window === 'undefined') {
    return { gpuVendor, gpuRenderer, hasWebGL2, maxTextureSize };
  }

  try {
    // Try WebGL2 first
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      hasWebGL2 = true;
      gl = gl2;
    } else {
      gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    }

    if (gl) {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gl.getParameter(gl.VENDOR) || gpuVendor;
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gl.getParameter(gl.RENDERER) || gpuRenderer;
      } else {
        gpuVendor = gl.getParameter(gl.VENDOR) || gpuVendor;
        gpuRenderer = gl.getParameter(gl.RENDERER) || gpuRenderer;
      }
    }
  } catch (err) {
    console.warn('[DeviceBenchmark] Could not inspect GPU:', err);
  }

  return { gpuVendor, gpuRenderer, hasWebGL2, maxTextureSize };
}

/**
 * Classifies the detected GPU into performance categories.
 */
function classifyGpu(renderer: string): 'dedicated' | 'integrated' | 'mobile_flagship' | 'mobile_mid' | 'software' | 'unknown' {
  const r = renderer.toLowerCase();

  // Software or budget fallback
  if (r.includes('swiftshader') || r.includes('llvmpipe') || r.includes('software') || r.includes('mesa') || r.includes('basic render') || r.includes('microsoft basic')) {
    return 'software';
  }

  // Dedicated PC/Mac GPUs
  if (
    r.includes('nvidia') || r.includes('geforce') || r.includes('rtx') || r.includes('gtx') ||
    r.includes('radeon rx') || r.includes('radeon pro') || r.includes('rdna') || r.includes('quadro') ||
    r.includes('apple m1 pro') || r.includes('apple m1 max') || r.includes('apple m1 ultra') ||
    r.includes('apple m2') || r.includes('apple m3') || r.includes('apple m4')
  ) {
    return 'dedicated';
  }

  // Mobile Flagship GPUs
  if (
    r.includes('apple gpu') || r.includes('apple a1') ||
    r.includes('adreno (tm) 7') || r.includes('adreno (tm) 8') || r.includes('adreno 7') || r.includes('adreno 8') ||
    r.includes('immortalis') || r.includes('mali-g71') || r.includes('mali-g72') || r.includes('mali-g77') ||
    r.includes('mali-g78') || r.includes('mali-g710') || r.includes('mali-g715') || r.includes('mali-g720')
  ) {
    return 'mobile_flagship';
  }

  // Mobile Mid/Budget GPUs
  if (
    r.includes('adreno') || r.includes('mali') || r.includes('powervr')
  ) {
    return 'mobile_mid';
  }

  // Integrated Desktop/Laptop GPUs
  if (
    r.includes('intel') || r.includes('iris') || r.includes('uhd') || r.includes('hd graphics') || r.includes('amd radeon(tm) graphics')
  ) {
    return 'integrated';
  }

  return 'unknown';
}

/**
 * Detects Operating System name and architecture.
 */
function detectOs(): { osName: string; isMobile: boolean; isTablet: boolean; isTouch: boolean; browserEngine: string; cpuArchitecture: string } {
  if (typeof window === 'undefined') {
    return {
      osName: 'Server / Node.js',
      isMobile: false,
      isTablet: false,
      isTouch: false,
      browserEngine: 'V8',
      cpuArchitecture: 'x86_64',
    };
  }

  const ua = navigator.userAgent || '';
  const isTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;

  let isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  let isTablet = /iPad|Tablet|PlayBook/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isTablet) isMobile = false;

  let osName = 'Hệ điều hành khác';
  if (/Windows NT 10.0/i.test(ua)) osName = 'Windows 10 / 11 (64-bit)';
  else if (/Windows NT 6.3/i.test(ua)) osName = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) osName = 'Windows 7';
  else if (/iPhone/i.test(ua)) osName = 'Apple iOS (iPhone)';
  else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) osName = 'Apple iPadOS';
  else if (/Mac OS X/i.test(ua)) osName = 'Apple macOS';
  else if (/Android/i.test(ua)) osName = 'Google Android';
  else if (/Linux/i.test(ua)) osName = 'GNU/Linux';

  let browserEngine = 'Chromium / Blink';
  if (ua.includes('Firefox/')) browserEngine = 'Gecko (Firefox)';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browserEngine = 'WebKit (Safari)';
  else if (ua.includes('Edg/')) browserEngine = 'Blink (Microsoft Edge)';

  const is64Bit = ua.includes('x86_64') || ua.includes('Win64') || ua.includes('x64') || ua.includes('WOW64') || ua.includes('Macintosh') || ua.includes('aarch64') || ua.includes('arm64');
  const cpuArchitecture = is64Bit ? '64-bit (x64 / ARM64)' : '32-bit (x86 / ARM)';

  return {
    osName,
    isMobile,
    isTablet,
    isTouch,
    browserEngine,
    cpuArchitecture,
  };
}

/**
 * Estimates screen refresh rate (Hz) using precision performance timestamp deltas.
 */
export async function measureDisplayRefreshRate(): Promise<number> {
  if (typeof window === 'undefined' || !window.requestAnimationFrame) {
    return 60;
  }

  return new Promise<number>((resolve) => {
    let frameCount = 0;
    let startTime = 0;
    const sampleDuration = 200; // ms

    function checkFrame(timestamp: number) {
      if (!startTime) {
        startTime = timestamp;
      }
      frameCount++;
      const elapsed = timestamp - startTime;

      if (elapsed < sampleDuration) {
        requestAnimationFrame(checkFrame);
      } else {
        const measuredRate = (frameCount / (elapsed / 1000));
        // Match standard display refresh frequencies
        if (measuredRate > 200) resolve(240);
        else if (measuredRate > 130) resolve(144);
        else if (measuredRate > 105) resolve(120);
        else if (measuredRate > 80) resolve(90);
        else if (measuredRate > 70) resolve(75);
        else if (measuredRate > 45) resolve(60);
        else resolve(30);
      }
    }

    requestAnimationFrame(checkFrame);
  });
}

/**
 * Inspects all genuine device hardware components.
 */
export function detectDeviceHardware(customRefreshRate?: number): DeviceHardwareInfo {
  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      isLowEnd: false,
      score: 85,
      summary: 'Máy trạm tiêu chuẩn (8 Cores CPU, 8GB RAM, Đồ họa tăng tốc)',
      recommendation: 'Bật đầy đủ hiệu ứng Liquid Glass và hiệu năng cao nhất',
      cpuCores: 8,
      cpuArchitecture: '64-bit',
      memoryGB: 8,
      memoryLabel: '≥ 8 GB RAM (8GB - 12GB - 16GB+)',
      jsHeapLimitMB: 4096,
      jsHeapUsedMB: 256,
      gpuVendor: 'Google / Cloud',
      gpuRenderer: 'Dedicated GPU Adapter',
      gpuClass: 'dedicated',
      hasWebGL2: true,
      hasWebGPU: false,
      maxTextureSize: 8192,
      screenResolution: '1920 x 1080',
      physicalResolution: '1920 x 1080',
      devicePixelRatio: 1,
      refreshRateHz: 60,
      colorGamut: 'sRGB',
      osName: 'Linux 64-bit',
      isMobile: false,
      isTablet: false,
      isTouch: false,
      browserEngine: 'V8 / Blink',
      prefersReducedMotion: false,
      saveData: false,
    };
  }

  // 1. CPU
  const cpuCores = navigator.hardwareConcurrency || 4;

  // 2. RAM & Chromium Memory API
  const rawMemoryGB = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null;
  let memoryGB = rawMemoryGB;
  let memoryLabel = 'Tiêu chuẩn';

  if (rawMemoryGB !== null) {
    if (rawMemoryGB >= 8) {
      memoryLabel = '≥ 8 GB RAM (8GB - 12GB - 16GB+)';
    } else {
      memoryLabel = `${rawMemoryGB} GB RAM`;
    }
  } else {
    // iOS or browsers hiding deviceMemory for anti-fingerprinting
    if (/iPhone|iPad/i.test(navigator.userAgent)) {
      memoryLabel = 'Apple Unified Memory (iOS / iPadOS)';
    } else {
      memoryLabel = 'Khả dụng chuẩn hệ thống';
    }
  }

  let jsHeapLimitMB: number | null = null;
  let jsHeapUsedMB: number | null = null;
  const perfMemory = (performance as unknown as { memory?: { jsHeapSizeLimit: number; usedJSHeapSize: number } }).memory;
  if (perfMemory) {
    jsHeapLimitMB = Math.round(perfMemory.jsHeapSizeLimit / (1024 * 1024));
    jsHeapUsedMB = Math.round(perfMemory.usedJSHeapSize / (1024 * 1024));
  }

  // 3. GPU
  const { gpuVendor, gpuRenderer, hasWebGL2, maxTextureSize } = inspectGpuDetails();
  const gpuClass = classifyGpu(gpuRenderer);
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

  // 4. OS & Environment
  const { osName, isMobile, isTablet, isTouch, browserEngine, cpuArchitecture } = detectOs();

  // 5. Display & Screen
  const dpr = window.devicePixelRatio || 1;
  const screenWidth = window.screen?.width || window.innerWidth || 1280;
  const screenHeight = window.screen?.height || window.innerHeight || 720;
  const screenResolution = `${screenWidth} x ${screenHeight}`;
  const physicalResolution = `${Math.round(screenWidth * dpr)} x ${Math.round(screenHeight * dpr)}`;

  let colorGamut = 'sRGB';
  if (window.matchMedia && window.matchMedia('(color-gamut: p3)').matches) {
    colorGamut = 'Display P3 (Dải màu rộng)';
  }

  const refreshRateHz = customRefreshRate || 60;

  // 6. Preferences & Constraints
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const connection = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const saveData = connection?.saveData === true || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';

  // 7. Calculate Comprehensive Hardware Capability Score (0 - 100)
  let score = 50;

  // CPU Scoring (Max +25, Min -25)
  if (cpuCores >= 12) score += 25;
  else if (cpuCores >= 8) score += 20;
  else if (cpuCores >= 6) score += 12;
  else if (cpuCores >= 4) score += 0;
  else if (cpuCores === 2) score -= 20;
  else if (cpuCores <= 1) score -= 30;

  // RAM Scoring (Max +25, Min -25)
  if (memoryGB !== null) {
    if (memoryGB >= 16) score += 25;
    else if (memoryGB >= 8) score += 20;
    else if (memoryGB >= 6) score += 10;
    else if (memoryGB >= 4) score += 0;
    else if (memoryGB <= 2) score -= 25;
  } else {
    // If iOS (which hides deviceMemory for privacy), estimate based on CPU cores & screen
    if (/iPhone|iPad/i.test(navigator.userAgent)) {
      score += cpuCores >= 6 ? 15 : 5;
    }
  }

  // GPU Class Scoring (Max +30, Min -30)
  if (gpuClass === 'dedicated') {
    score += 30;
  } else if (gpuClass === 'mobile_flagship') {
    score += 25;
  } else if (gpuClass === 'integrated') {
    score += 8;
  } else if (gpuClass === 'mobile_mid') {
    score -= 8;
  } else if (gpuClass === 'software') {
    score -= 30;
  }

  // WebGL2 & Texture Limits
  if (hasWebGL2) score += 5;
  if (maxTextureSize >= 8192) score += 5;
  else if (maxTextureSize <= 2048) score -= 15;

  // Display Refresh Rate
  if (refreshRateHz >= 120) score += 8;
  else if (refreshRateHz >= 90) score += 4;
  else if (refreshRateHz <= 30) score -= 15;

  // System constraints
  if (saveData) score -= 20;
  if (prefersReducedMotion) score -= 25;

  // Normalization
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 8. Tier Categorization
  // A device is low-end if: score < 45, or <= 2 CPU cores, or <= 2GB RAM, or software GPU, or user prefers reduced motion
  const isLowEnd = score < 48 || cpuCores <= 2 || (memoryGB !== null && memoryGB <= 2) || gpuClass === 'software' || prefersReducedMotion || saveData;
  
  let tier: 'high' | 'medium' | 'low' = 'medium';
  if (score >= 68 && !isLowEnd) {
    tier = 'high';
  } else if (isLowEnd || score < 48) {
    tier = 'low';
  }

  // 9. Informative Summaries & Recommendations
  let summary = '';
  let recommendation = '';

  const ramStr = memoryGB ? `, RAM ${memoryGB}GB` : '';
  const hzStr = refreshRateHz ? ` @ ${refreshRateHz}Hz` : '';

  if (tier === 'high') {
    summary = `Cấu hình Mạnh • ${cpuCores} Cores CPU${ramStr}${hzStr}`;
    recommendation = 'Hỗ trợ đồ họa khúc xạ Liquid Glass, hiệu ứng 3D và hạt vũ trụ 60-120 FPS';
  } else if (tier === 'medium') {
    summary = `Cấu hình Cân Bằng • ${cpuCores} Cores CPU${ramStr}${hzStr}`;
    recommendation = 'Hoạt động ổn định với hiệu ứng chuẩn, phản hồi mượt mà';
  } else {
    summary = `Cấu hình Tiết Kiệm / Nhẹ • ${cpuCores} Cores CPU${ramStr}${hzStr}`;
    recommendation = 'Tự động kích hoạt Chế độ Siêu Nhẹ (tắt Liquid Glass) để máy mát và mượt mà tuyệt đối';
  }

  return {
    tier,
    isLowEnd,
    score,
    summary,
    recommendation,
    cpuCores,
    cpuArchitecture,
    memoryGB,
    memoryLabel,
    jsHeapLimitMB,
    jsHeapUsedMB,
    gpuVendor,
    gpuRenderer,
    gpuClass,
    hasWebGL2,
    hasWebGPU,
    maxTextureSize,
    screenResolution,
    physicalResolution,
    devicePixelRatio: dpr,
    refreshRateHz,
    colorGamut,
    osName,
    isMobile,
    isTablet,
    isTouch,
    browserEngine,
    prefersReducedMotion,
    saveData,
  };
}

/**
 * Runs a thorough system hardware scan (measures real display Hz and re-evaluates all hardware components).
 */
export async function runHardwareInspection(): Promise<DeviceHardwareInfo> {
  if (typeof window === 'undefined') {
    return detectDeviceHardware();
  }

  // Measure display refresh rate accurately
  const refreshRate = await measureDisplayRefreshRate();
  return detectDeviceHardware(refreshRate);
}
