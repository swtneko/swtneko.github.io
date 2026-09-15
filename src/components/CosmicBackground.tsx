import React, { useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  maxOpacity: number;
  tailLength: number;
  active: boolean;
}

interface StardustMote {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
  color: string;
}

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();
  const settingsRef = useRef(settings);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number; colorType: number; pulseSpeed: number }[] = [];
    let stardustMotes: StardustMote[] = [];
    let shootingStars: ShootingStar[] = [];
    let lastShootingStarTime = Date.now();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
      initStardust();
      initShootingStars();
    };

    const initStars = () => {
      stars = [];
      const starCount = Math.max(120, Math.floor((canvas.width * canvas.height) / 2200));
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.8,
          speed: Math.random() * 0.03 + 0.01,
          opacity: Math.random() * 0.8 + 0.2,
          colorType: Math.floor(Math.random() * 4), // 0: purple, 1: gold, 2: cyan/starlight, 3: rose
          pulseSpeed: Math.random() * 0.03 + 0.015,
        });
      }
    };

    const initStardust = () => {
      stardustMotes = [];
      const moteCount = Math.min(36, Math.floor(canvas.width / 40));
      const colors = ['#c084fc', '#facc15', '#67e8f9', '#f472b6', '#a78bfa'];
      for (let i = 0; i < moteCount; i++) {
        stardustMotes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1.2,
          speedY: -(Math.random() * 0.4 + 0.15), // Gently drift upwards
          speedX: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const initShootingStars = () => {
      shootingStars = [];
      for (let i = 0; i < 3; i++) {
        shootingStars.push({
          x: 0,
          y: 0,
          length: 0,
          speed: 0,
          angle: 0,
          opacity: 0,
          maxOpacity: 0.85,
          tailLength: 140,
          active: false,
        });
      }
    };

    const spawnShootingStar = () => {
      const inactive = shootingStars.find(s => !s.active);
      if (!inactive) return;
      
      inactive.x = Math.random() * canvas.width * 0.85;
      inactive.y = Math.random() * canvas.height * 0.4;
      inactive.speed = Math.random() * 12 + 14;
      inactive.angle = (Math.PI / 4) + (Math.random() * 0.25 - 0.12); // ~45 deg downward
      inactive.length = Math.random() * 90 + 120;
      inactive.opacity = 1;
      inactive.maxOpacity = Math.random() * 0.4 + 0.6;
      inactive.active = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      const isLight = settingsRef.current.theme === 'light';
      const effectsOn = settingsRef.current.effectsEnabled;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.35, 0,
        canvas.width / 2, canvas.height * 0.5, Math.max(canvas.width, canvas.height)
      );

      if (isLight) {
        gradient.addColorStop(0, '#fdfaf5'); // Warm ivory center
        gradient.addColorStop(0.4, '#f7f2fe'); // Soft celestial lilac
        gradient.addColorStop(0.8, '#ece3fa'); // Gentle lavender mist
        gradient.addColorStop(1, '#e3d6f8'); // Violet starlight
      } else {
        gradient.addColorStop(0, '#1a0d2e'); // Deep nebula purple
        gradient.addColorStop(0.5, '#0d061a'); // Dark obsidian violet
        gradient.addColorStop(1, '#05020a'); // Space black
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!effectsOn) {
        // Render static stars once with subtle opacity when effects are off
        stars.slice(0, Math.min(stars.length, 60)).forEach((star) => {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? 'rgba(147, 51, 234, 0.25)' : 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        });
        return;
      }

      // Dynamic pulsating nebulae
      const now = Date.now();
      const pulseTime = now * 0.0008;

      // Floating Nebula 1 (Top right - Royal Violet / Orchid)
      const glow1 = ctx.createRadialGradient(
        canvas.width * 0.75 + Math.sin(pulseTime) * 35, 
        canvas.height * 0.25 + Math.cos(pulseTime) * 25, 
        0,
        canvas.width * 0.75, 
        canvas.height * 0.25, 
        canvas.width * 0.5
      );
      if (isLight) {
        glow1.addColorStop(0, 'rgba(217, 70, 239, 0.09)');
        glow1.addColorStop(1, 'rgba(217, 70, 239, 0)');
      } else {
        glow1.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
        glow1.addColorStop(1, 'rgba(168, 85, 247, 0)');
      }
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating Nebula 2 (Bottom left - Celestial Indigo / Cyan)
      const glow2 = ctx.createRadialGradient(
        canvas.width * 0.25 + Math.cos(pulseTime * 0.7) * 30, 
        canvas.height * 0.75 + Math.sin(pulseTime * 0.7) * 25, 
        0,
        canvas.width * 0.25, 
        canvas.height * 0.75, 
        canvas.width * 0.45
      );
      if (isLight) {
        glow2.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
        glow2.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else {
        glow2.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
        glow2.addColorStop(1, 'rgba(99, 102, 241, 0)');
      }
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating Nebula 3 (Center top - Golden Solar Flare)
      const glow3 = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(pulseTime * 0.5) * 40,
        canvas.height * 0.1,
        0,
        canvas.width * 0.5,
        canvas.height * 0.1,
        canvas.width * 0.35
      );
      if (isLight) {
        glow3.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
        glow3.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        glow3.addColorStop(0, 'rgba(251, 191, 36, 0.09)');
        glow3.addColorStop(1, 'rgba(251, 191, 36, 0)');
      }
      ctx.fillStyle = glow3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Interactive Mouse Aura Glow
      if (mouseRef.current.active) {
        const mouseGlow = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 160
        );
        if (isLight) {
          mouseGlow.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
          mouseGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else {
          mouseGlow.addColorStop(0, 'rgba(192, 132, 252, 0.16)');
          mouseGlow.addColorStop(1, 'rgba(192, 132, 252, 0)');
        }
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Constellation lines between nearby prominent stars
      const prominent = stars.filter(s => s.size > 1.6).slice(0, 20);
      for (let i = 0; i < prominent.length; i++) {
        for (let j = i + 1; j < prominent.length; j++) {
          const dx = prominent[i].x - prominent[j].x;
          const dy = prominent[i].y - prominent[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(prominent[i].x, prominent[i].y);
            ctx.lineTo(prominent[j].x, prominent[j].y);
            const lineAlpha = (1 - dist / 150) * 0.14;
            ctx.strokeStyle = isLight 
              ? `rgba(147, 51, 234, ${lineAlpha})` 
              : `rgba(216, 180, 254, ${lineAlpha * 1.6})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw floating stardust motes (magical embers rising upwards)
      stardustMotes.forEach((mote) => {
        mote.pulse += mote.pulseSpeed;
        mote.y += mote.speedY;
        mote.x += Math.sin(mote.pulse) * 0.4 + mote.speedX;

        if (mote.y < -10) {
          mote.y = canvas.height + 10;
          mote.x = Math.random() * canvas.width;
        }

        const currentOpacity = Math.max(0.1, (Math.sin(mote.pulse) * 0.3 + 0.7) * (isLight ? mote.opacity * 0.5 : mote.opacity));

        // Outer mote aura
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = currentOpacity * 0.3;
        ctx.fill();

        // Core mote particle
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw glittering stars with occasional starburst cross flare
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        if (isLight) {
          if (star.colorType === 0) {
            ctx.fillStyle = `rgba(124, 58, 237, ${star.opacity * 0.55})`; // Violet
          } else if (star.colorType === 1) {
            ctx.fillStyle = `rgba(217, 119, 6, ${star.opacity * 0.5})`; // Amber
          } else if (star.colorType === 2) {
            ctx.fillStyle = `rgba(79, 70, 229, ${star.opacity * 0.45})`; // Indigo
          } else {
            ctx.fillStyle = `rgba(219, 39, 119, ${star.opacity * 0.45})`; // Rose
          }
        } else {
          if (star.colorType === 0) {
            ctx.fillStyle = `rgba(192, 132, 252, ${star.opacity * 0.95})`; // Lavender
          } else if (star.colorType === 1) {
            ctx.fillStyle = `rgba(251, 191, 36, ${star.opacity * 0.95})`; // Amber
          } else if (star.colorType === 2) {
            ctx.fillStyle = `rgba(165, 243, 252, ${star.opacity})`; // Cyan diamond
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          }
        }
        ctx.fill();

        // Starburst cross flare on bright large stars
        if (star.size > 1.8 && star.opacity > 0.6) {
          const flareLen = star.size * 3.2;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.strokeStyle = isLight ? `rgba(147, 51, 234, ${star.opacity * 0.25})` : `rgba(255, 255, 255, ${star.opacity * 0.4})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }

        // Animate star twinkle
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0.15) {
          star.speed = -star.speed;
        }
      });

      // Shooting stars logic
      if (now - lastShootingStarTime > 2200 && Math.random() < 0.05) {
        spawnShootingStar();
        lastShootingStarTime = now;
      }

      shootingStars.forEach((s) => {
        if (!s.active) return;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const cometGrad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        if (isLight) {
          cometGrad.addColorStop(0, `rgba(147, 51, 234, ${s.opacity * 0.85})`);
          cometGrad.addColorStop(0.3, `rgba(217, 119, 6, ${s.opacity * 0.55})`);
          cometGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        } else {
          cometGrad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
          cometGrad.addColorStop(0.2, `rgba(251, 191, 36, ${s.opacity * 0.95})`);
          cometGrad.addColorStop(0.5, `rgba(192, 132, 252, ${s.opacity * 0.65})`);
          cometGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bright star head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(147, 51, 234, 0.95)' : '#ffffff';
        ctx.fill();

        // Move
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.014;

        if (s.opacity <= 0 || s.x > canvas.width || s.y > canvas.height) {
          s.active = false;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
};

export default CosmicBackground;
