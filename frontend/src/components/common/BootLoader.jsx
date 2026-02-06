import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BootLoader({ onComplete }) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);

  const fullText = "INITIALIZING NEXUS PROTOCOL...";
  const subText = "ESTABLISHING SECURE CONNECTION_";

  useEffect(() => {
    // Phase 0: Typewriter
    if (phase === 0) {
      if (text.length < fullText.length) {
        const timeout = setTimeout(() => {
          setText(fullText.slice(0, text.length + 1));
        }, 30); // fast typing
        return () => clearTimeout(timeout);
      } else {
        setTimeout(() => setPhase(1), 500);
      }
    }
    
    // Phase 1: Subtext and loading bar
    if (phase === 1) {
      setTimeout(() => setPhase(2), 1500);
    }

    // Phase 2: Fade out
    if (phase === 2) {
      setTimeout(() => onComplete(), 500);
    }
  }, [phase, text]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-[#00ED64] font-mono"
    >
      <div className="w-96 space-y-8">
        <h1 className="text-2xl font-bold tracking-widest text-center min-h-[40px]">
          {text} {phase === 0 && <span className="animate-pulse">_</span>}
        </h1>
        
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 mt-4"
          >
            <div className="text-xs text-green-400/80 text-center tracking-widest">{subText}</div>
            <div className="h-1 w-full bg-green-900 rounded overflow-hidden">
               <motion.div 
                 className="h-full bg-[#00ED64] shadow-[0_0_10px_#00ED64]"
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 1.2, ease: "circOut" }}
               />
            </div>
            <div className="flex justify-between text-[10px] text-green-500 uppercase font-semibold">
               <span>Mem: 64TB</span>
               <span>Sys: OK</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-10 text-xs text-green-800 animate-pulse">
        NEXUS SYSTEM v2.0
      </div>
    </motion.div>
  );
}
