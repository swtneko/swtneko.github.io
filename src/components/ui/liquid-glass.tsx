import React, { useRef, useState, useEffect } from 'react';
import { getDisplacementMapForElement } from '../../utils/liquidGlassPhysics';
import { cn } from '../../lib/utils';

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  blurIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  borderRadius?: string;
  className?: string;
  contentClassName?: string;
  refraction?: boolean;
  draggable?: boolean;
}

const shadowStyles: Record<string, string> = {
  none: 'shadow-none',
  xs: 'shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.2)]',
  sm: 'shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.25)]',
  md: 'shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1.5px_1px_rgba(255,255,255,0.3)]',
  lg: 'shadow-[0_16px_40px_rgba(0,0,0,0.2),inset_0_2px_1.5px_rgba(255,255,255,0.4)]',
};

const glowStyles: Record<string, string> = {
  none: '',
  xs: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.08)]',
  sm: 'drop-shadow-[0_0_18px_rgba(255,255,255,0.14)]',
  md: 'drop-shadow-[0_0_28px_rgba(255,255,255,0.22)]',
  lg: 'drop-shadow-[0_0_40px_rgba(255,255,255,0.32)]',
};

const blurStyles: Record<string, string> = {
  none: 'backdrop-blur-none',
  xs: 'backdrop-blur-[2px]',
  sm: 'backdrop-blur-sm',     // 4px - very clear
  md: 'backdrop-blur-md',     // 12px - clean & crisp
  lg: 'backdrop-blur-lg',     // 16px
  xl: 'backdrop-blur-xl',     // 24px
};

const borderStyles: Record<string, string> = {
  none: 'border-0',
  xs: 'border border-white/10 dark:border-white/10',
  sm: 'border border-white/20 dark:border-white/15',
  md: 'border border-white/30 dark:border-white/20',
  lg: 'border-2 border-white/40 dark:border-white/30',
};

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  (
    {
      children,
      shadowIntensity = 'sm',
      glowIntensity = 'none',
      blurIntensity = 'sm',
      borderIntensity = 'sm',
      borderRadius,
      className = '',
      contentClassName = '',
      refraction = true,
      draggable,
      onClick,
      style,
      ...rest
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
    const [displacementMapUrl, setDisplacementMapUrl] = useState<string | null>(null);
    const [filterId, setFilterId] = useState<string>('');

    // Default border radius: if not specified via props and not in className, use 24px (rounded-3xl)
    const hasRoundedInClass = /rounded-(none|sm|md|lg|xl|2xl|3xl|full)/.test(className);
    const effectiveBorderRadius = borderRadius || (!hasRoundedInClass ? '24px' : undefined);

    useEffect(() => {
      if (!refraction) return;

      const element = containerRef.current;
      if (!element) return;

      const updateFilter = () => {
        const rect = element.getBoundingClientRect();
        const width = Math.round(rect.width) || 300;
        const height = Math.round(rect.height) || 200;

        let parsedRadius = 24;
        if (borderRadius) {
          const numeric = parseInt(borderRadius, 10);
          if (!isNaN(numeric)) parsedRadius = numeric;
        } else if (effectiveBorderRadius) {
          const numeric = parseInt(effectiveBorderRadius, 10);
          if (!isNaN(numeric)) parsedRadius = numeric;
        }

        const mapData = getDisplacementMapForElement(width, height, parsedRadius, 0.25);
        setDisplacementMapUrl(mapData.dataUrl);
        setFilterId(`liquid-filter-${Math.round(width)}-${Math.round(height)}-${parsedRadius}`);
      };

      updateFilter();

      const observer = new ResizeObserver(() => {
        updateFilter();
      });
      observer.observe(element);

      return () => observer.disconnect();
    }, [borderRadius, effectiveBorderRadius, refraction]);

    const shadowClass = shadowStyles[shadowIntensity] || shadowStyles.sm;
    const glowClass = glowStyles[glowIntensity] || '';
    const blurClass = blurStyles[blurIntensity] || blurStyles.sm;
    const borderClass = borderStyles[borderIntensity] || borderStyles.sm;

    // Has user supplied their own background in className?
    const hasCustomBg = /(^|\s)bg-/.test(className);

    return (
      <div
        ref={containerRef}
        onClick={onClick}
        draggable={draggable}
        style={{
          borderRadius: effectiveBorderRadius,
          ...style,
        }}
        className={cn(
          'relative isolate overflow-hidden transition-all duration-300',
          !hasRoundedInClass && !borderRadius && 'rounded-3xl',
          blurClass,
          borderClass,
          shadowClass,
          glowClass,
          // Crystal Clear, Completely Non-Milky Glass Background:
          // Light Mode: Subtle 18% translucent white (transparent, crisp)
          // Dark Mode: Ultra-transparent 4% white / subtle black tint
          !hasCustomBg && 'bg-white/20 dark:bg-white/[0.04] text-slate-900 dark:text-white',
          className
        )}
        {...rest}
      >
        {/* SVG Displacement Filter for Realistic Snell's Law Refraction */}
        {refraction && displacementMapUrl && (
          <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
            <defs>
              <filter id={filterId} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
                <feImage href={displacementMapUrl} result="dispMap" preserveAspectRatio="none" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="dispMap"
                  scale="12"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="refracted"
                />
              </filter>
            </defs>
          </svg>
        )}

        {/* Crystal-Clear Specular Edge Highlight (Natural Glass Edge, NOT foggy/milky overlay) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-60"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.02) 25%, transparent 60%)',
          }}
        />

        {/* Ultra-Fine 1px Top Bevel Reflection */}
        <div
          className="absolute inset-x-0 top-0 h-[1px] pointer-events-none opacity-70"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
          }}
        />

        {/* Inner Content */}
        <div className={cn('relative z-10 w-full h-full', contentClassName)}>
          {children}
        </div>
      </div>
    );
  }
);

LiquidGlassCard.displayName = 'LiquidGlassCard';

export default LiquidGlassCard;
