import React, { useRef, useState, useEffect, useId } from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import { getSquircleDisplacementMap } from '../utils/liquidGlassPhysics';

interface LiquidGlassCapsuleProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'bar' | 'pill' | 'card';
  onClick?: () => void;
  borderRadius?: number;
}

export const LiquidGlassCapsule: React.FC<LiquidGlassCapsuleProps> = ({
  children,
  className = '',
  contentClassName = '',
  variant = 'bar',
  onClick,
  borderRadius,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [dispMapUrl, setDispMapUrl] = useState<string>('');
  const { settings } = useSettings();
  const reactId = useId().replace(/:/g, '-');
  const filterId = `capsule-physics-${reactId}`;

  const defaultRadius = variant === 'pill' ? 9999 : variant === 'card' ? 36 : 24;
  const effectiveRadius = borderRadius ?? defaultRadius;

  useEffect(() => {
    if (!settings.effectsEnabled) return;
    const el = containerRef.current;
    if (!el) return;

    const updateMap = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(Math.round(rect.width), 80);
      const h = Math.max(Math.round(rect.height), 40);

      const url = getSquircleDisplacementMap({
        width: w,
        height: h,
        borderRadius: effectiveRadius,
        bevelWidth: Math.min(18, Math.round(h / 2)),
        refractiveIndex: 1.52,
        refractionStrength: 1.4,
      });
      setDispMapUrl(url);
    };

    updateMap();
    const ro = new ResizeObserver(() => updateMap());
    ro.observe(el);
    return () => ro.disconnect();
  }, [effectiveRadius, settings.effectsEnabled]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const isDark = settings.theme === 'dark';

  const getVariantClasses = () => {
    if (!settings.effectsEnabled) {
      switch (variant) {
        case 'pill':
          return `rounded-full border shadow-md font-semibold transition-all ${
            isDark
              ? 'bg-purple-950 text-white border-purple-500/50 hover:bg-purple-900'
              : 'bg-purple-900 text-white border-purple-700 hover:bg-purple-800'
          }`;
        case 'card':
          return `rounded-[2.25rem] border shadow-2xl ${
            isDark
              ? 'bg-[#120822] text-purple-100 border-purple-500/30'
              : 'bg-white text-slate-900 border-purple-300 shadow-purple-950/10'
          }`;
        case 'bar':
        default:
          return `rounded-2xl sm:rounded-full border shadow-md ${
            isDark
              ? 'bg-[#140a28] text-purple-100 border-purple-500/30'
              : 'bg-white text-slate-900 border-purple-300 shadow-purple-950/10'
          }`;
      }
    }

    // Real Physics Liquid Glass Classes
    switch (variant) {
      case 'pill':
        return isDark
          ? 'liquid-glass-pill-dark rounded-full border border-white/20'
          : 'liquid-glass-pill-light rounded-full border border-white/60';
      case 'card':
        return isDark
          ? 'liquid-glass-card-physics-dark rounded-[2.25rem] border border-white/20'
          : 'liquid-glass-card-physics-light rounded-[2.25rem] border border-white/60';
      case 'bar':
      default:
        return isDark
          ? 'liquid-glass-bar-dark rounded-2xl sm:rounded-full border border-white/20'
          : 'liquid-glass-bar-light rounded-2xl sm:rounded-full border border-white/60';
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-all duration-300 isolate ${getVariantClasses()} ${className}`}
    >
      {/* Real Physics SVG Filter */}
      {settings.effectsEnabled && dispMapUrl && (
        <svg className="pointer-events-none absolute w-0 h-0 overflow-hidden opacity-0" aria-hidden="true">
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feImage href={dispMapUrl} result="capsuleDisp" preserveAspectRatio="none" />
              <feDisplacementMap in="SourceGraphic" in2="capsuleDisp" scale={16} xChannelSelector="R" yChannelSelector="G" result="refracted" />
            </filter>
          </defs>
        </svg>
      )}

      {/* Live Physical Snell Refraction Backdrop */}
      {settings.effectsEnabled && (
        <>
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] -z-10"
            style={{
              backdropFilter: dispMapUrl ? `url(#${filterId}) blur(20px) saturate(190%)` : 'blur(20px) saturate(190%)',
              WebkitBackdropFilter: 'blur(20px) saturate(190%)',
            }}
          />

          {/* Meniscus Lens Rim Highlight */}
          <div
            className={`pointer-events-none absolute inset-0 rounded-[inherit] z-10 ${
              isDark
                ? 'shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.4),inset_0_-1px_1px_0_rgba(0,0,0,0.5)]'
                : 'shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_0_rgba(168,85,247,0.12)]'
            }`}
          />

          {/* Interactive Fresnel Sheen */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 opacity-35 group-hover:opacity-100 z-10"
            style={{
              background: `radial-gradient(350px circle at ${mousePos.x}% ${mousePos.y}%, ${
                isDark
                  ? 'rgba(255, 255, 255, 0.18), rgba(168, 85, 247, 0.08) 40%, transparent 80%'
                  : 'rgba(255, 255, 255, 0.45), rgba(168, 85, 247, 0.06) 45%, transparent 80%'
              })`,
            }}
          />
        </>
      )}

      {/* Content wrapper */}
      <div className={`relative z-20 ${contentClassName}`}>{children}</div>
    </div>
  );
};

export default LiquidGlassCapsule;
