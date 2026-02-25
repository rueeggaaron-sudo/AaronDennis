import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { blockData, theme, toggleTheme } = useApp();
  const [timeSinceLastBlock, setTimeSinceLastBlock] = useState<string>('');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!blockData) return;

    // Trigger pulse animation on new block
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 2000);

    const updateCounter = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - blockData.timestamp;
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeSinceLastBlock(`${minutes}m ${seconds}s`);
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [blockData?.height]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-sm"
        >
          {theme === 'light' ? <Moon size={18} className="text-zinc-800" /> : <Sun size={18} className="text-amber-400" />}
        </button>
        <div className="hidden sm:flex flex-col ml-3">
          <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase">
            DCA Tracker
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          animate={pulse ? { boxShadow: ['0 0 0px rgba(74, 222, 128, 0)', '0 0 20px rgba(74, 222, 128, 0.4)', '0 0 0px rgba(74, 222, 128, 0)'] } : {}}
          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-1.5 font-mono shadow-2xl flex flex-col items-end min-w-[170px] relative overflow-hidden"
        >
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />

          <div className="flex items-center gap-3 w-full justify-between relative z-10">
            <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Blockzeit</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={blockData?.height}
                initial={{ opacity: 0, filter: 'blur(5px)', y: -10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(5px)', y: 10 }}
                className="text-green-400 font-bold tracking-[0.2em] text-sm drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]"
              >
                {blockData?.height || '-------'}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 w-full justify-between relative z-10">
            <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Alter</span>
            <span className="text-green-400/80 text-[11px] font-medium tracking-wider">
              {timeSinceLastBlock || '--m --s'}
            </span>
          </div>

          <div className="text-[8px] text-zinc-600 mt-1 border-t border-zinc-900 w-full text-right pt-1 font-medium relative z-10">
            {format(new Date(), 'dd.MM.yyyy HH:mm:ss')}
          </div>
        </motion.div>
      </div>
    </header>
  );
};
