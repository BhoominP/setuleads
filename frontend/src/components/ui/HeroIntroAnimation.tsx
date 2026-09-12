import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import logoStacked from '@/assets/Setuleads.svg';

interface HeroIntroAnimationProps {
  onComplete?: () => void;
}

export function HeroIntroAnimation({ onComplete }: HeroIntroAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Stage 1 -> Stage 2 -> Stage 3 telemetry sequence over 4.5 seconds
    const t1 = setTimeout(() => setStage(2), 1200);
    const t2 = setTimeout(() => setStage(3), 2800);

    // Progress counter animation from 0 to 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    // Total intro display time before smooth fade-out: 4800ms
    const totalTimer = setTimeout(() => {
      handleComplete();
    }, 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(progressInterval);
      clearTimeout(totalTimer);
    };
  }, []);

  const handleComplete = () => {
    setVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-[#080808] text-[#F4F0E8] flex flex-col items-center justify-center p-6 overflow-hidden select-none"
        >
          {/* Film Grain & Blueprint Grid Overlay */}
          <div className="film-grain opacity-10" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          {/* Technical Corner Brackets */}
          <div className="absolute top-8 left-8 font-mono text-[10px] text-[#FF4A00] tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF4A00] animate-ping rounded-full inline-block" />
            SETULEADS ENGINE v2.4 // INITIALIZATION
          </div>
          <div className="absolute top-8 right-8 font-mono text-[10px] text-[#A3A3A3] tracking-widest uppercase">
            SYS.STATUS: OPERATIONAL
          </div>

          <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center">
            {/* Center Orange Telemetry Beam */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '280px', opacity: 1 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="h-[2px] bg-gradient-to-r from-transparent via-[#FF4A00] to-transparent mb-8 shadow-[0_0_20px_#FF4A00]"
            />

            {/* Main Brand Title Reveal */}
            <div className="overflow-hidden mb-4 flex flex-col items-center">
              <motion.img
                src={logoStacked}
                alt="SetuLeads Intelligence Engine"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-28 md:h-36 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,74,0,0.35)]"
              />
            </div>

            {/* Tagline Reveal */}
            <div className="overflow-hidden mb-8">
              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif italic text-xl md:text-2xl text-[#FF4A00]"
              >
                Find businesses worth building for.
              </motion.p>
            </div>

            {/* Telemetry Stage Readout Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="w-full bg-[#101010] border border-[#262626] p-4 font-mono text-xs text-left space-y-2 shadow-2xl relative inspected-panel"
            >
              <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] border-b border-[#262626] pb-2">
                <span>SYSTEM TELEMETRY</span>
                <span className="text-[#FF4A00] font-bold">{progress}%</span>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${stage >= 1 ? 'opacity-100 text-[#00E599]' : 'opacity-30 text-[#A3A3A3]'}`}>
                  <span>{stage >= 1 ? '✓' : '○'}</span>
                  <span>[01/03] MOUNTING GEMINI SEMANTIC INTENSITY LAYER</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${stage >= 2 ? 'opacity-100 text-[#00E599]' : 'opacity-30 text-[#A3A3A3]'}`}>
                  <span>{stage >= 2 ? '✓' : '○'}</span>
                  <span>[02/03] INITIALIZING GEOAPIFY & OVERPASS DISCOVERY</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${stage >= 3 ? 'opacity-100 text-[#FF4A00]' : 'opacity-30 text-[#A3A3A3]'}`}>
                  <span>{stage >= 3 ? '⚡' : '○'}</span>
                  <span>[03/03] WORKSTATION READY — DISCOVERING SMB LEADS</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-[#181818] h-[3px] mt-3 overflow-hidden">
                <motion.div
                  className="bg-[#FF4A00] h-full shadow-[0_0_8px_#FF4A00]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* Interactive Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={handleComplete}
            className="absolute bottom-8 right-8 font-mono text-xs text-[#A3A3A3] hover:text-[#FF4A00] transition-colors flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] bg-[#101010]"
          >
            <span>SKIP INTRO</span>
            <span className="text-[#FF4A00]">→</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

