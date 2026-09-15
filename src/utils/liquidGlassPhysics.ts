/**
 * Physics-based Liquid Glass Refraction Engine
 * Implements Snell's Law of refraction on a Squircle (Superellipse/Rounded-Box)
 * surface Signed Distance Field (SDF) to generate realistic displacement maps for
 * SVG feDisplacementMap.
 * 
 * References:
 * - Snell's Law of Refraction: n1 * sin(θ1) = n2 * sin(θ2)
 * - Fresnel Reflection Equations: F = F0 + (1 - F0) * (1 - cos θ1)^5
 * - Squircle SDF & Meniscus Lens Bevel Profile
 */

interface SquircleOptions {
  width: number;
  height: number;
  borderRadius?: number;
  bevelWidth?: number;
  refractiveIndex?: number; // default: 1.52 (crown glass)
  refractionStrength?: number;
}

// In-memory cache for generated displacement map data URLs to ensure optimal 60fps performance
const displacementMapCache = new Map<string, string>();

/**
 * Computes 2D Signed Distance Function (SDF) and normal for a rounded rectangle / squircle
 */
function sdfRoundedBox(x: number, y: number, w: number, h: number, r: number) {
  const halfW = w / 2;
  const halfH = h / 2;
  const qx = Math.abs(x) - (halfW - r);
  const qy = Math.abs(y) - (halfH - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outDist = Math.sqrt(ax * ax + ay * ay);
  const inDist = Math.min(Math.max(qx, qy), 0);
  const d = outDist + inDist - r;

  let nx = 0;
  let ny = 0;
  if (outDist > 1e-4) {
    nx = (ax / outDist) * Math.sign(x);
    ny = (ay / outDist) * Math.sign(y);
  } else if (qx > qy) {
    nx = Math.sign(x);
    ny = 0;
  } else {
    nx = 0;
    ny = Math.sign(y);
  }

  return { d, nx, ny };
}

/**
 * Generates an SVG-compatible displacement map encoded in RGBA channels:
 * - R: Horizontal displacement (128 = 0 displacement, <128 = shift left, >128 = shift right)
 * - G: Vertical displacement (128 = 0 displacement, <128 = shift up, >128 = shift down)
 * - B: Fresnel specular reflection highlight
 * - A: Boundary antialiased opacity mask
 */
export function getSquircleDisplacementMap({
  width = 256,
  height = 256,
  borderRadius = 32,
  bevelWidth = 24,
  refractiveIndex = 1.52,
  refractionStrength = 1.8,
}: SquircleOptions): string {
  // Normalize key to clamp resolution for performance
  const mapW = Math.min(Math.max(Math.round(width / 2) * 2, 128), 384);
  const mapH = Math.min(Math.max(Math.round(height / 2) * 2, 128), 384);
  const effectiveRadius = Math.min(borderRadius, Math.min(mapW, mapH) / 2);
  const effectiveBevel = Math.min(bevelWidth, effectiveRadius);

  const cacheKey = `${mapW}x${mapH}_r${effectiveRadius}_b${effectiveBevel}_n${refractiveIndex}_s${refractionStrength}`;
  const cached = displacementMapCache.get(cacheKey);
  if (cached) return cached;

  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = mapW;
  canvas.height = mapH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(mapW, mapH);
  const data = imgData.data;

  const n1 = 1.0; // air
  const n2 = refractiveIndex; // glass
  const eta = n1 / n2; // ~0.658

  // Fresnel base reflection for normal incidence
  const f0 = Math.pow((n2 - n1) / (n2 + n1), 2);

  for (let py = 0; py < mapH; py++) {
    const cy = py - mapH / 2;
    for (let px = 0; px < mapW; px++) {
      const cx = px - mapW / 2;
      const pixelIdx = (py * mapW + px) * 4;

      const { d, nx, ny } = sdfRoundedBox(cx, cy, mapW, mapH, effectiveRadius);

      // Outside the squircle
      if (d > 0.5) {
        data[pixelIdx] = 128;     // R
        data[pixelIdx + 1] = 128; // G
        data[pixelIdx + 2] = 0;   // B
        data[pixelIdx + 3] = 0;   // A
        continue;
      }

      // Distance from the boundary inwards
      const s = -d;

      // Inside flat core of the glass slab
      if (s >= effectiveBevel) {
        data[pixelIdx] = 128;     // No displacement
        data[pixelIdx + 1] = 128; // No displacement
        data[pixelIdx + 2] = Math.round(f0 * 255); // Subtle ambient Fresnel
        data[pixelIdx + 3] = 255;
        continue;
      }

      // On the curved meniscus bevel lens:
      // Normalized position across the bevel rim: 0 at the boundary, 1 at flat core
      const u = Math.max(0, Math.min(1, s / effectiveBevel));

      // Squircle lens surface curve: Meniscus curve Z(u) = sqrt(1 - (1 - u)^2)
      const oneMinusU = 1 - u;
      const denom = Math.sqrt(Math.max(1e-4, 1 - oneMinusU * oneMinusU));
      const dzDu = oneMinusU / denom; // slope of the surface

      // 3D outward normal vector N
      // Scale slope inversely with bevel width
      const normalScale = (1.0 / effectiveBevel) * 12.0;
      const Nx = dzDu * normalScale * nx;
      const Ny = dzDu * normalScale * ny;
      const Nz = 1.0;

      const normLen = Math.sqrt(Nx * Nx + Ny * Ny + Nz * Nz);
      const normalX = Nx / normLen;
      const normalY = Ny / normLen;
      const normalZ = Nz / normLen;

      // Incident ray: I = (0, 0, -1)
      // cos(theta1) = -(I · N) = normalZ
      const cosTheta1 = Math.max(0, Math.min(1, normalZ));
      const sin2Theta2 = eta * eta * (1 - cosTheta1 * cosTheta1);

      let Rx = 0;
      let Ry = 0;
      let Rz = -1;

      if (sin2Theta2 <= 1.0) {
        const cosTheta2 = Math.sqrt(Math.max(0, 1.0 - sin2Theta2));
        // Refracted ray R = eta * I + (eta * cosTheta1 - cosTheta2) * N
        const k = eta * cosTheta1 - cosTheta2;
        Rx = k * normalX;
        Ry = k * normalY;
        Rz = -eta + k * normalZ;
      }

      // Apparent background displacement vector
      const absRz = Math.max(Math.abs(Rz), 0.05);
      const dispX = (Rx / absRz) * refractionStrength;
      const dispY = (Ry / absRz) * refractionStrength;

      // Fresnel reflectance (Schlick's approximation)
      const fresnel = f0 + (1 - f0) * Math.pow(1 - cosTheta1, 5);

      // Subpixel antialiasing at the outer border
      const alpha = d < -0.5 ? 1 : Math.max(0, Math.min(1, 0.5 - d));

      // Map displacement to 0..255 (128 is center)
      const rVal = Math.round(128 + Math.max(-127, Math.min(127, dispX * 127)));
      const gVal = Math.round(128 + Math.max(-127, Math.min(127, dispY * 127)));
      const bVal = Math.round(Math.min(255, fresnel * 255 * 1.6));

      data[pixelIdx] = rVal;
      data[pixelIdx + 1] = gVal;
      data[pixelIdx + 2] = bVal;
      data[pixelIdx + 3] = Math.round(alpha * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  displacementMapCache.set(cacheKey, dataUrl);
  return dataUrl;
}

/**
 * Convenient helper for UI components to generate a displacement map
 */
export function getDisplacementMapForElement(
  width: number,
  height: number,
  borderRadius = 24,
  refractionStrength = 1.8
): { dataUrl: string; width: number; height: number } {
  const dataUrl = getSquircleDisplacementMap({
    width,
    height,
    borderRadius,
    bevelWidth: Math.min(24, borderRadius),
    refractionStrength,
  });
  return { dataUrl, width, height };
}
