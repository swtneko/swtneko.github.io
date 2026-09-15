import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TarotCard as TarotCardType, DeckType } from '../types';
import TarotCard from './TarotCard';
import { useSettings } from '../contexts/SettingsContext';
import { Sparkles, Wand2 } from 'lucide-react';

interface ShuffleDeckProps {
  onDraw: (count: number) => void;
  count: number;
  isShuffling: boolean;
  deckType?: DeckType;
}

const ShuffleDeck: React.FC<ShuffleDeckProps> = ({ onDraw, count, isShuffling, deckType }) => {
  const [cards, setCards] = useState<number[]>(Array.from({ length: 12 }, (_, i) => i));
  const [isDrawing, setIsDrawing] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (isShuffling && settings.effectsEnabled) {
      const interval = setInterval(() => {
        setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
      }, 180);
      return () => clearInterval(interval);
    }
  }, [isShuffling, settings.effectsEnabled]);

  const handleDraw = () => {
    if (isShuffling || isDrawing) return;
    setIsDrawing(true);
    setTimeout(() => {
      onDraw(count);
      setIsDrawing(false);
    }, settings.effectsEnabled ? 900 : 100);
  };

  return (
    <div className="relative h-[420px] w-full flex flex-col items-center justify-center">
      {/* Mystical Energy Circle Aura */}
      {settings.effectsEnabled && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-purple-500/20 bg-purple-600/5 blur-xl animate-pulse pointer-events-none" />
      )}

      {/* Floating Stardust Particles */}
      {settings.effectsEnabled && isShuffling && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-300"
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5],
                x: (Math.random() - 0.5) * 320,
                y: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Card Fan / Cascade */}
      <div className="relative h-72 w-full flex items-center justify-center -mt-8">
        <AnimatePresence>
          {cards.map((id, index) => {
            const total = cards.length;
            const mid = (total - 1) / 2;
            const offset = index - mid;
            
            // Subtle arc layout
            const fanX = offset * 18;
            const fanY = Math.abs(offset) * 4;
            const fanRotate = offset * 3.5;

            return (
              <motion.div
                key={id}
                className="absolute origin-bottom cursor-pointer"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{
                  x: isShuffling
                    ? (Math.random() - 0.5) * 280
                    : isDrawing
                    ? [0, (index - mid) * 40, (index - mid) * 15]
                    : fanX,
                  y: isShuffling
                    ? (Math.random() - 0.5) * 120
                    : isDrawing
                    ? [-20, -50, 0]
                    : fanY,
                  rotate: isShuffling
                    ? (Math.random() - 0.5) * 45
                    : isDrawing
                    ? (index - mid) * 8
                    : fanRotate,
                  scale: isDrawing && index === Math.floor(mid) ? 1.08 : 1,
                  zIndex: index,
                }}
                transition={
                  isDrawing
                    ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
                    : {
                        type: 'spring',
                        stiffness: 170,
                        damping: 18,
                        mass: 0.9,
                      }
                }
              >
                <TarotCard isFlipped={false} className="w-36 h-56 md:w-44 md:h-64 shadow-2xl" deckType={deckType} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center">
        <motion.button
          whileHover={settings.effectsEnabled ? { scale: 1.05 } : {}}
          whileTap={settings.effectsEnabled ? { scale: 0.95 } : {}}
          onClick={handleDraw}
          disabled={isShuffling || isDrawing}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold tracking-widest uppercase shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          {isShuffling ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              Đang xào bài...
            </>
          ) : isDrawing ? (
            <>
              <Wand2 className="w-4 h-4 animate-bounce text-amber-300" />
              Đang thỉnh quẻ...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Rút {count} lá bài
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ShuffleDeck;
