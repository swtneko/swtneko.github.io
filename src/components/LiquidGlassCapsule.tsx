import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

interface LiquidGlassCapsuleProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'bar' | 'pill' | 'card';
  onClick?: () => void;
}

/**
 * iOS 26 Liquid Glass Capsule — production quality.
 *
 * The key insight: backdrop-filter ONLY works when there is painted content
 * in the stacking context behind the element. We ensure this by:
 *   1. isolation: isolate (via liquid-glass-base)
 *   2. A painted pseudo-background that always renders (not just in preview)
 *   3. -webkit-backdrop-filter always set alongside backdrop-filter
 */
export const LiquidGlassCapsule: React.FC<LiquidGlassCapsuleProps> = ({
  children,
  className = '',
  contentClassName = '',
  variant = 'bar',
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const { settings } = useSettings();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  // --- Fallback styles (effects disabled or no glass support) ---
  const getFallbackClass = () => {
    const isDark = settings.theme === 'dark';
    switch (variant) {
      case 'pill':
        return isDark
          ? 'rounded-full border border-purple-500/50 bg-purple-950/80 text-white shadow-md'
          : 'rounded-full border border-purple-300 bg-purple-50 text-purple-950 shadow-md';
      case 'card':
        return isDark
          ? 'rounded-[2.5rem] border border-purple-500/30 bg-[#120822]/95 text-purple-100 shadow-2xl'
          : 'rounded-[2.5rem] border border-purple-200 bg-white/95 text-slate-900 shadow-2xl';
      case 'bar':
      default:
        return isDark
          ? 'rounded-2xl sm:rounded-full border border-purple-500/30 bg-[#120822]/95 text-purple-100 shadow-xl'
          : 'rounded-2xl sm:rounded-full border border-purple-200 bg-white/95 text-slate-900 shadow-lg';
    }
  };

  // --- iOS 26 Liquid Glass classes ---
  const getGlassClass = () => {
    switch (variant) {
      case 'pill':   return 'liquid-glass-pill rounded-full';
      case 'card':   return 'liquid-glass-card rounded-[2.5rem]';
      case 'bar':
      default:       return 'liquid-glass-bar rounded-2xl sm:rounded-full';
    }
  };

  const useGlass = settings.effectsEnabled;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={useGlass ? handleMouseMove : undefined}
      onMouseEnter={useGlass ? () => setIsHovered(true) : undefined}
      onMouseLeave={useGlass ? () => setIsHovered(false) : undefined}
      className={`relative overflow-hidden transition-all duration-300 ${
        useGlass ? getGlassClass() : getFallbackClass()
      } ${className}`}
    >
      {/* ── iOS 26 Glass Layers (only when effects enabled) ── */}
      {useGlass && (
        <>
          {/* 
            Dynamic spotlight — tracks mouse for iOS-style specular response.
            Uses radial-gradient that simulates the curved lens refraction.
          */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
            style={{
              background: `radial-gradient(
                ellipse 60% 50% at ${mousePos.x}% ${mousePos.y}%,
                rgba(255, 255, 255, 0.18) 0%,
                rgba(168, 85, 247, 0.08) 50%,
                transparent 100%
              )`,
              transition: 'background 0.08s ease-out',
            }}
          />

          {/* Top specular bevel — the signature iOS glass edge */}
          <div
            className="pointer-events-none absolute top-0 inset-x-0 z-10"
            style={{
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.75) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.75) 70%, transparent 95%)',
            }}
          />

          {/* Bottom edge shadow line */}
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 z-10"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 10%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25) 70%, transparent 90%)',
            }}
          />

          {/* Left edge subtle highlight */}
          <div
            className="pointer-events-none absolute left-0 inset-y-0 z-10"
            style={{
              width: '1px',
              background: 'linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.15) 70%, transparent 95%)',
            }}
          />

          {/* Hover shimmer sweep — iOS-style shine */}
          {isHovered && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '200%', opacity: [0, 0.4, 0] }}
              transition={{
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1],
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
              className="pointer-events-none absolute inset-0 w-1/3 -skew-x-12 z-10"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
              }}
            />
          )}
        </>
      )}

      {/* Content — always on top */}
      <div className={`relative z-20 w-full ${contentClassName}`}>{children}</div>
    </div>
  );
};

export default LiquidGlassCapsule;
