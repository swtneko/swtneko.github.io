import React, { useRef, useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface AnnouncementBannerProps {
  text: string;
  className?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [duration, setDuration] = useState(25);
  const { settings } = useSettings();

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = measureRef.current.scrollWidth;
        const overflows = textWidth > containerWidth - 36;
        setIsOverflowing(overflows);

        if (overflows) {
          const singleCycleWidth = textWidth + 80;
          const calculatedDuration = Math.max(16, Math.round(singleCycleWidth / 45));
          setDuration(calculatedDuration);
        }
      }
    };

    checkOverflow();
    const timer = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  if (!text) return null;

  const isDark = settings.theme === 'dark';
  const containerStyle = !settings.effectsEnabled
    ? `border shadow-md ${isDark ? 'bg-[#180c2e] text-amber-200 border-purple-500/50' : 'bg-purple-50 text-purple-900 border-purple-300'}`
    : `lg-surface rounded-2xl ${isDark ? 'text-purple-100' : 'text-purple-900'}`;

  return (
    <div
      className={`${containerStyle} text-xs py-1.5 px-3 rounded-2xl mb-2 flex items-center overflow-hidden select-none relative group h-9 shadow-lg ${className}`}
    >
      {/* Icon badge on the left */}
      <div className={`flex items-center justify-center shrink-0 z-20 w-6 h-6 rounded-full mr-2 border ${
        isDark ? 'bg-purple-950/90 border-purple-600/40 text-amber-300' : 'bg-white/90 border-purple-200 text-purple-700 shadow-sm'
      }`}>
        <Bell className="w-3 h-3 animate-pulse shrink-0" />
      </div>

      {/* Hidden element for measuring exact raw text width */}
      <span
        ref={measureRef}
        className="invisible absolute pointer-events-none opacity-0 whitespace-nowrap font-medium tracking-wide text-xs"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Content Container */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative flex items-center h-full ${
          isOverflowing ? 'justify-start' : 'justify-center'
        }`}
      >
        {isOverflowing ? (
          <div
            className="animate-marquee flex items-center shrink-0 w-max cursor-default"
            style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
            title={text}
          >
            <div className="flex items-center shrink-0">
              <span className="font-medium tracking-wide px-6">{text}</span>
              <span className="text-amber-400 text-[11px] select-none">✦</span>
            </div>
            <div className="flex items-center shrink-0" aria-hidden="true">
              <span className="font-medium tracking-wide px-6">{text}</span>
              <span className="text-amber-400 text-[11px] select-none">✦</span>
            </div>
          </div>
        ) : (
          <span className="font-medium tracking-wide text-center truncate px-2">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
