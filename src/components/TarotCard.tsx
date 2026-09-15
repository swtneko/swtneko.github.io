import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TarotCard as TarotCardType, DeckType } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { Sparkles } from 'lucide-react';
import { playMysticalChimeSound } from '../utils/audio';

interface TarotCardProps {
  card?: TarotCardType;
  isReversed?: boolean;
  isFlipped: boolean;
  deckType?: DeckType;
  onClick?: () => void;
  className?: string;
  index?: number;
  flipDelay?: number;
}

const TarotCard: React.FC<TarotCardProps> = ({
  card,
  isReversed = false,
  isFlipped,
  deckType = DeckType.TAROT,
  onClick,
  className = '',
  index = 0,
  flipDelay,
}) => {
  const isPlayingCard = deckType === DeckType.PLAYING_CARDS;
  const { settings } = useSettings();
  const [isHovered, setIsHovered] = useState(false);
  const prevFlippedRef = useRef(false);

  // Staggered flip delay based on index or explicit prop
  const calculatedDelay = flipDelay !== undefined ? flipDelay : index * 0.32 + 0.15;

  useEffect(() => {
    if (isFlipped && !prevFlippedRef.current) {
      if (settings.soundEnabled) {
        const delayMs = settings.effectsEnabled ? calculatedDelay * 1000 : 0;
        const timer = setTimeout(() => {
          playMysticalChimeSound();
        }, delayMs);
        prevFlippedRef.current = true;
        return () => clearTimeout(timer);
      }
      prevFlippedRef.current = true;
    } else if (!isFlipped) {
      prevFlippedRef.current = false;
    }
  }, [isFlipped, settings.soundEnabled, settings.effectsEnabled, calculatedDelay]);

  return (
    <motion.div
      className={`relative w-48 h-72 cursor-pointer select-none group ${className}`}
      style={{ perspective: '1400px' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={settings.effectsEnabled ? { y: -10, scale: 1.05 } : {}}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Dynamic 3D Ground Cast Shadow that expands with elevation */}
      {settings.effectsEnabled && (
        <motion.div
          className="absolute -bottom-4 left-4 right-4 h-6 rounded-full pointer-events-none transition-all duration-500"
          animate={{
            scale: isHovered ? 1.15 : 1,
            opacity: isHovered ? 0.75 : 0.45,
            filter: isHovered ? 'blur(16px)' : 'blur(10px)',
          }}
          style={{
            background: isPlayingCard 
              ? 'radial-gradient(ellipse at center, rgba(59,130,246,0.5) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)'
              : 'radial-gradient(ellipse at center, rgba(168,85,247,0.5) 0%, rgba(0,0,0,0.85) 70%, transparent 100%)',
          }}
        />
      )}

      {/* Outer ambient glow halo */}
      {settings.effectsEnabled && (
        <div
          className={`absolute -inset-2 rounded-2xl blur-xl transition-opacity duration-500 pointer-events-none ${
            isFlipped
              ? isPlayingCard
                ? 'bg-blue-500/25 opacity-60 group-hover:opacity-100'
                : 'bg-gradient-to-tr from-amber-500/35 via-purple-500/35 to-pink-500/25 opacity-70 group-hover:opacity-100'
              : 'bg-purple-600/20 opacity-0 group-hover:opacity-80'
          }`}
        />
      )}

      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          duration: settings.effectsEnabled ? 0.85 : 0.01,
          delay: settings.effectsEnabled && isFlipped ? calculatedDelay : 0,
          type: 'spring',
          stiffness: 190,
          damping: 20,
        }}
      >
        {/* Back of the card */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl border-2 flex items-center justify-center p-3.5 overflow-hidden transition-all duration-300 ${
            isPlayingCard
              ? 'border-blue-400/50 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-blue-300'
              : 'border-amber-400/40 bg-gradient-to-br from-[#1b0933] via-[#0f0521] to-[#080214] text-amber-200'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 25px rgba(147, 51, 234, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          }}
        >
          {/* Edge Bevel Highlight */}
          <div className="absolute inset-0 rounded-2xl border border-white/15 pointer-events-none" />

          {/* Sacred geometry cosmic back pattern */}
          <div className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-screen pointer-events-none" />
          
          <div className={`relative z-10 w-full h-full border rounded-xl flex flex-col items-center justify-center p-2 shadow-inner ${
            isPlayingCard ? 'border-blue-400/30' : 'border-amber-400/25'
          }`}>
            {/* Center Sacred Seal */}
            <div className={`w-20 h-20 border border-dashed rounded-full flex items-center justify-center relative ${
              isPlayingCard ? 'border-blue-400/50' : 'border-amber-400/50'
            }`}>
              {settings.effectsEnabled && (
                <div className={`absolute inset-0 rounded-full animate-spin border-t border-r ${
                  isPlayingCard ? 'border-cyan-400' : 'border-amber-300'
                }`} style={{ animationDuration: '12s' }} />
              )}
              <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center shadow-inner ${
                isPlayingCard ? 'border-blue-300 bg-blue-950/60' : 'border-amber-300 bg-purple-950/60'
              }`}>
                <Sparkles className={`w-6 h-6 ${isPlayingCard ? 'text-cyan-300' : 'text-amber-300'} ${settings.effectsEnabled ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            <div className="mt-4 text-[9px] uppercase tracking-[0.25em] font-serif opacity-70">
              {isPlayingCard ? 'BÀI TÂY' : 'TAROT'}
            </div>
          </div>
        </div>

        {/* Front of the card */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl border-2 flex flex-col items-center p-2 overflow-hidden transition-colors duration-300 ${
            isPlayingCard ? 'border-blue-400 bg-white' : 'border-amber-400/50 bg-zinc-950'
          }`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(168, 85, 247, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Edge Bevel Highlight */}
          <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" />

          {card && (
            <>
              <div className="w-full h-full relative overflow-hidden rounded-xl bg-zinc-900 shadow-inner">
                {(() => {
                  let imgSrc = card.image;
                  if (!isPlayingCard) {
                    const style = settings.tarotDeckStyle || 'rider-waite';
                    if (style === 'marseille' && card.imageMarseille) {
                      imgSrc = card.imageMarseille;
                    } else if (style === 'sola-busca' && card.imageSolaBusca) {
                      imgSrc = card.imageSolaBusca;
                    } else if (card.imageKrates) {
                      imgSrc = card.imageKrates;
                    }
                  }

                  return (
                    <img
                      src={imgSrc}
                      alt={card.name}
                      className={`w-full h-full ${isPlayingCard ? 'object-contain p-2' : 'object-cover'} ${isReversed ? 'rotate-180' : ''} transition-transform duration-500`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (card.imageKrates && e.currentTarget.src !== card.imageKrates) {
                          e.currentTarget.src = card.imageKrates;
                        }
                      }}
                    />
                  );
                })()}

                {/* Shimmer light reflection over card front */}
                {settings.effectsEnabled && isHovered && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none transition-opacity duration-300" />
                )}

                {!isPlayingCard && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                )}

                <div className={`absolute bottom-2 left-0 right-0 px-2 text-center ${isPlayingCard ? 'hidden' : ''}`}>
                  <h3 className="text-white font-serif text-xs md:text-sm tracking-wider uppercase drop-shadow-md truncate font-semibold">
                    {card.name}
                  </h3>
                  {isReversed && (
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block drop-shadow-sm">
                      Ngược (Reversed)
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TarotCard;
