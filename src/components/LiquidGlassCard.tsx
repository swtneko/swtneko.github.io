import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  id?: string;
}

/**
 * iOS 26 Liquid Glass Card — for large surfaces (modals, panels, results).
 * 
 * Critical fix for Vercel deploy: backdrop-filter requires a painted
 * background layer behind the element. CosmicBackground (canvas) already
 * provides this. For non-effects mode, we use solid fallback backgrounds.
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  contentClassName = '',
  onClick,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const [isHovered, setIsHovered] = useState(false);
  const { settings } = useSettings();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  const isDark = settings.theme === 'dark';
  const useGlass = settings.effectsEnabled;

  return (
    <div
      id={id}
      ref={containerRef}
      onClick={onClick}
      onMouseMove={useGlass ? handleMouseMove : undefined}
      onMouseEnter={useGlass ? () => setIsHovered(true) : undefined}
      onMouseLeave={useGlass ? () => setIsHovered(false) : undefined}
      className={`relative transition-all duration-300 ${
        useGlass
          ? 'liquid-glass-card'
          : isDark
            ? 'bg-[#120822]/95 text-white border border-purple-500/20 shadow-2xl'
            : 'bg-white/95 text-slate-900 border border-purple-200 shadow-2xl'
      } ${className}`}
      style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
    >
      {useGlass && (
        <>
          {/* Dynamic lens highlight — follows mouse */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
            style={{
              background: `radial-gradient(
                ellipse 70% 60% at ${mousePos.x}% ${mousePos.y}%,
                ${isDark
                  ? 'rgba(255,255,255,0.12) 0%, rgba(168,85,247,0.06) 50%, transparent 100%'
                  : 'rgba(255,255,255,0.5) 0%, rgba(168,85,247,0.04) 50%, transparent 100%'
                }
              )`,
              transition: 'background 0.1s ease-out',
            }}
          />

          {/* Top specular bevel — iOS 26 signature */}
          <div
            className="pointer-events-none absolute top-0 inset-x-0 z-10"
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.6) 25%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.6) 75%, transparent 95%)',
            }}
          />

          {/* Left edge subtle specular */}
          <div
            className="pointer-events-none absolute left-0 inset-y-0 z-10"
            style={{
              width: '1.5px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 60%, transparent 100%)',
            }}
          />

          {/* Bottom shadow line */}
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 z-10"
            style={{
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent 10%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.3) 70%, transparent 90%)',
            }}
          />

          {/* Iridescent tint layer — subtle purple/blue sheen */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-[5] opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, transparent 50%, rgba(99,102,241,0.1) 100%)',
            }}
          />

          {/* Hover shimmer */}
          {isHovered && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.3, 0] }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1],
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="pointer-events-none absolute inset-0 w-2/5 -skew-x-12 z-10"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
            />
          )}
        </>
      )}

      {/* Content */}
      <div className={`relative z-20 w-full h-full ${contentClassName}`}>{children}</div>
    </div>
  );
};

export default LiquidGlassCard;
