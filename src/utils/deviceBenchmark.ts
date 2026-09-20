/**
 * Device hardware benchmarking and capability detection utility.
 * Safely inspects available browser APIs (CPU cores, RAM, WebGL GPU renderer, motion preference)
 * and runs real-time canvas animation stress tests to measure actual rendering FPS.
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
  measuredFps?: number;
  summary: string;
}

export function detectDeviceHardware(measuredFps?: number): DeviceHardwareInfo {
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
      measuredFps: 60,
      summary: 'Thiết bị tiêu chuẩn (60 FPS)',
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
    'geforce', 'nvidia', 'radeon', 'rtx', 'gtx', 'immortalis', 'mali-g7', 'mali-g6'
  ];

  if (lowGpuKeywords.some(kw => gpuLower.includes(kw))) {
    score -= 25;
  } else if (highGpuKeywords.some(kw => gpuLower.includes(kw))) {
    score += 15;
  }

  if (saveData) score -= 20;
  if (prefersReducedMotion) score -= 30;

  // Factor in real measured FPS if available
  if (typeof measuredFps === 'number') {
    if (measuredFps >= 55) {
      score = Math.max(score, 75);
    } else if (measuredFps >= 45) {
      score = Math.max(score, 60);
    } else if (measuredFps < 30) {
      score = Math.min(score, 35);
    }
  }

  // Final tier categorization
  const isLowEnd = score < 45 || prefersReducedMotion || saveData || (typeof measuredFps === 'number' && measuredFps < 30);
  let tier: 'high' | 'medium' | 'low' = 'medium';
  if (score >= 60 && !isLowEnd) {
    tier = 'high';
  } else if (score < 45 || isLowEnd) {
    tier = 'low';
  }

  // Human-readable summary
  const fpsText = measuredFps ? ` • ${Math.round(measuredFps)} FPS` : '';
  let summary = '';
  if (tier === 'high') {
    summary = `Cấu hình mạnh (${cpuCores} nhân CPU${memoryGB ? `, ~${memoryGB}GB RAM` : ''})${fpsText} • Hiệu ứng mượt mà`;
  } else if (tier === 'medium') {
    summary = `Cấu hình cân bằng (${cpuCores} nhân CPU${memoryGB ? `, ~${memoryGB}GB RAM` : ''})${fpsText} • Hoạt động tốt`;
  } else {
    summary = `Cấu hình phổ thông / Tiết kiệm pin (${cpuCores} nhân CPU${memoryGB ? `, ~${memoryGB}GB RAM` : ''})${fpsText} • Đã tối ưu nhẹ`;
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
    measuredFps,
    score: Math.max(0, Math.min(100, score)),
    summary,
  };
}

/**
 * Executes a real live canvas animation stress test for ~350ms to measure actual rendering FPS.
 */
export async function runLiveBenchmark(): Promise<DeviceHardwareInfo> {
  if (typeof window === 'undefined') {
    return detectDeviceHardware();
  }

  return new Promise<DeviceHardwareInfo>((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(detectDeviceHardware());
        return;
      }

      const numParticles = 300;
      const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string }[] = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * 300,
          y: Math.random() * 300,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          r: Math.random() * 3 + 1,
          color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 150 + 100)}, 255, 0.8)`,
        });
      }

      let frameCount = 0;
      const startTime = performance.now();
      const testDurationMs = 350;

      function renderFrame() {
        const now = performance.now();
        const elapsed = now - startTime;

        if (!ctx) {
          resolve(detectDeviceHardware());
          return;
        }

        ctx.clearRect(0, 0, 300, 300);

        // Draw and update particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > 300) p.vx *= -1;
          if (p.y < 0 || p.y > 300) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Interconnecting particle lines
          for (let j = i + 1; j < Math.min(i + 4, particles.length); j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40) {
              ctx.strokeStyle = `rgba(168, 85, 247, ${1 - dist / 40})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        frameCount++;

        if (elapsed < testDurationMs) {
          requestAnimationFrame(renderFrame);
        } else {
          const measuredFps = Math.min(60, Math.round((frameCount / (elapsed / 1000))));
          const result = detectDeviceHardware(measuredFps);
          resolve(result);
        }
      }

      requestAnimationFrame(renderFrame);
    } catch {
      resolve(detectDeviceHardware());
    }
  });
}

