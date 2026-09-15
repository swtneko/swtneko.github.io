import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

// ─── Intensity maps ─────────────────────────────────────────────────────────

const BLUR_MAP: Record<string, string> = {
  sm: 'blur(16px)',
  md: 'blur(28px)',
  lg: 'blur(40px)',
  xl: 'blur(56px)',
};

const GLOW_MAP: Record<string, string> = {
  none: 'none',
  xs:   '0 0 8px 0 rgba(168,85,247,0.10)',
  sm:   '0 0 16px 0 rgba(168,85,247,0.18)',
  md:   '0 0 28px 0 rgba(168,85,247,0.28)',
  lg:   '0 0 48px 0 rgba(168,85,247,0.40)',
  xl:   '0 0 72px 0 rgba(168,85,247,0.55)',
  '2xl':'0 0 96px 0 rgba(168,85,247,0.70)',
};

// inner-shadow configs — darker = deeper
const SHADOW_INSET_MAP: Record<string, string> = {
  none: 'none',
  xs:   'inset 0 1px 0 0 rgba(255,255,255,0.30), inset 0 -1px 0 0 rgba(0,0,0,0.10)',
  sm:   'inset 0 1.5px 0 0 rgba(255,255,255,0.45), inset 0 -1px 0 0 rgba(0,0,0,0.18)',
  md:   'inset 0 2px 0 0 rgba(255,255,255,0.55), inset 0 -1.5px 0 0 rgba(0,0,0,0.28)',
  lg:   'inset 0 2px 0 0 rgba(255,255,255,0.65), inset 0 -1.5px 0 0 rgba(0,0,0,0.40)',
  xl:   'inset 0 2.5px 0 0 rgba(255,255,255,0.75), inset 0 -2px 0 0 rgba(0,0,0,0.52)',
  '2xl':'inset 0 3px 0 0 rgba(255,255,255,0.85), inset 0 -2px 0 0 rgba(0,0,0,0.60)',
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type BlurIntensity    = 'sm' | 'md' | 'lg' | 'xl';
export type GlowIntensity    = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ShadowIntensity  = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Variant controls the shape & base styling */
export type GlassVariant = 'bar' | 'pill' | 'card';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;

  variant?: GlassVariant;

  // ui-layouts compatible props
  draggable?: boolean;
  expandable?: boolean;
  width?: string;
  height?: string;
  expandedWidth?: string;
  expandedHeight?: string;
  blurIntensity?: BlurIntensity;
  borderRadius?: string;
  glowIntensity?: GlowIntensity;
  shadowIntensity?: ShadowIntensity;

  onClick?: () => void;
  id?: string;
  style?: React.CSSProperties;
}

// ─── Radius helpers ──────────────────────────────────────────────────────────

function defaultRadius(variant: GlassVariant): string {
  switch (variant) {
    case 'pill': return '9999px';
    case 'bar':  return '9999px';
    case 'card': return '28px';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  contentClassName = '',
  variant = 'card',
  draggable = false,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = 'lg',
  borderRadius,
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  onClick,
  id,
  style,
}) => {
  const { settings } = useSettings();
  const isDark = settings.theme === 'dark';
  const useGlass = settings.effectsEnabled;

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // ── Draggable spring physics ──────────────────────────────────────────────
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 28 });
  const springY = useSpring(y, { stiffness: 400, damping: 28 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  }, []);

  const handleClick = () => {
    if (expandable) setIsExpanded(p => !p);
    onClick?.();
  };

  // ── Derived geometry ──────────────────────────────────────────────────────
  const radius = borderRadius ?? defaultRadius(variant);

  const blur  = BLUR_MAP[blurIntensity]  ?? BLUR_MAP.lg;
  const glow  = GLOW_MAP[glowIntensity]  ?? GLOW_MAP.sm;
  const inset = SHADOW_INSET_MAP[shadowIntensity] ?? SHADOW_INSET_MAP.md;

  // outer drop shadow (variant-dependent) + glow
  const dropShadow = isDark
    ? `0 12px 40px -8px rgba(0,0,0,0.70)`
    : `0 8px 32px -4px rgba(88,28,135,0.22)`;

  const outerShadow = [
    inset,
    dropShadow,
    glow !== 'none' ? glow : '',
  ].filter(Boolean).join(', ');

  // backdrop
  const backdropFilter = useGlass
    ? `${blur} saturate(190%) brightness(${isDark ? 1.08 : 1.06})`
    : 'none';

  // tint background
  const bgColor = useGlass
    ? isDark
      ? 'rgba(16, 6, 36, 0.82)'
      : 'rgba(255, 255, 255, 0.68)'
    : isDark
      ? 'rgba(18, 8, 40, 0.96)'
      : 'rgba(255, 255, 255, 0.96)';

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.18)'
    : 'rgba(255, 255, 255, 0.80)';

  // ── Animated size ─────────────────────────────────────────────────────────
  const currentWidth  = expandable ? (isExpanded ? (expandedWidth  ?? width ?? 'auto') : (width ?? 'auto'))  : (width ?? 'auto');
  const currentHeight = expandable ? (isExpanded ? (expandedHeight ?? height ?? 'auto') : (height ?? 'auto')) : (height ?? 'auto');

  // ── Inner lens spotlight ──────────────────────────────────────────────────
  const spotlight = useGlass
    ? `radial-gradient(
        ellipse 70% 55% at ${mousePos.x}% ${mousePos.y}%,
        ${isDark
          ? 'rgba(255,255,255,0.13) 0%, rgba(168,85,247,0.06) 50%, transparent 100%'
          : 'rgba(255,255,255,0.55) 0%, rgba(168,85,247,0.05) 50%, transparent 100%'
        }
      )`
    : 'none';

  // ── Iridescent sheen ──────────────────────────────────────────────────────
  const sheen = useGlass
    ? 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, transparent 45%, rgba(99,102,241,0.08) 100%)'
    : 'none';

  // ─────────────────────────────────────────────────────────────────────────
  // Fallback (no effects)
  // ─────────────────────────────────────────────────────────────────────────
  if (!useGlass) {
    return (
      <div
        id={id}
        ref={containerRef}
        onClick={handleClick}
        className={`relative overflow-hidden transition-all duration-300 ${className}`}
        style={{
          borderRadius: radius,
          background: bgColor,
          border: `1px solid ${isDark ? 'rgba(168,85,247,0.25)' : 'rgba(124,58,237,0.18)'}`,
          boxShadow: outerShadow,
          width: currentWidth,
          height: currentHeight,
          ...style,
        }}
      >
        <div className={`relative z-10 w-full h-full ${contentClassName}`}>{children}</div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Full Glass
  // ─────────────────────────────────────────────────────────────────────────
  const glassStyle: React.CSSProperties = {
    position: 'relative',
    isolation: 'isolate' as const,
    overflow: 'hidden',
    borderRadius: radius,
    background: bgColor,
    backgroundClip: 'padding-box',
    WebkitBackdropFilter: backdropFilter,
    backdropFilter: backdropFilter,
    border: `1px solid ${borderColor}`,
    boxShadow: outerShadow,
    width: currentWidth,
    height: currentHeight,
    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
    cursor: expandable ? 'pointer' : onClick ? 'pointer' : 'default',
    ...style,
  };

  const inner = (
    <motion.div
      id={id}
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`transition-all duration-300 ${className}`}
      style={glassStyle}
      animate={{ width: currentWidth, height: currentHeight }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      whileHover={!draggable ? { scale: variant === 'pill' ? 1.02 : 1.005, y: variant === 'pill' ? -1 : 0 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {/* ── Lens spotlight (mouse-tracked) ── */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: spotlight, borderRadius: 'inherit', transition: 'background 0.08s ease-out' }}
      />

      {/* ── Top specular bevel ── */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 z-10"
        style={{
          height: '2px',
          borderRadius: 'inherit',
          background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.65) 25%, rgba(255,255,255,0.90) 50%, rgba(255,255,255,0.65) 75%, transparent 95%)',
        }}
      />

      {/* ── Left edge bevel ── */}
      <div
        className="pointer-events-none absolute left-0 inset-y-0 z-10"
        style={{
          width: '1.5px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.18) 55%, transparent 100%)',
        }}
      />

      {/* ── Bottom shadow line ── */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 z-10"
        style={{
          height: '1.5px',
          background: 'linear-gradient(90deg, transparent 10%, rgba(0,0,0,0.28) 30%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.28) 70%, transparent 90%)',
        }}
      />

      {/* ── Iridescent sheen layer ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-40"
        style={{ background: sheen, borderRadius: 'inherit' }}
      />

      {/* ── Hover shimmer sweep ── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="shimmer"
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '220%', opacity: [0, 0.32, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 2.0 }}
            className="pointer-events-none absolute inset-0 w-2/5 -skew-x-12 z-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className={`relative z-20 w-full h-full ${contentClassName}`}>{children}</div>
    </motion.div>
  );

  // ── Wrap in draggable if needed ──────────────────────────────────────────
  if (draggable) {
    return (
      <motion.div
        drag
        dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
        dragElastic={0.18}
        dragTransition={{ bounceStiffness: 380, bounceDamping: 28 }}
        style={{ x: springX, y: springY, display: 'inline-block' }}
        whileDrag={{ scale: 1.03, zIndex: 50 }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
};

// ─── Aliases matching old API ────────────────────────────────────────────────

/** Drop-in replacement for <LiquidGlassCard> */
export const LiquidGlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  id?: string;
  blurIntensity?: BlurIntensity;
  glowIntensity?: GlowIntensity;
  shadowIntensity?: ShadowIntensity;
  borderRadius?: string;
}> = (props) => (
  <LiquidGlass variant="card" shadowIntensity="lg" glowIntensity="xs" {...props} />
);

/** Drop-in replacement for <LiquidGlassCapsule variant="bar|pill|card"> */
export const LiquidGlassCapsule: React.FC<{
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: GlassVariant;
  onClick?: () => void;
}> = ({ variant = 'bar', ...props }) => (
  <LiquidGlass
    variant={variant}
    blurIntensity={variant === 'card' ? 'xl' : variant === 'bar' ? 'lg' : 'md'}
    glowIntensity={variant === 'pill' ? 'none' : 'xs'}
    shadowIntensity={variant === 'card' ? 'xl' : 'md'}
    {...props}
  />
);

export default LiquidGlass;
