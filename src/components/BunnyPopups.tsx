import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ENCOURAGING_MESSAGES } from '../lib/constants';
import { BowIcon } from './icons/BowIcon';
import { HandDrawnBunnyIcon } from './icons/HandDrawnBunnyIcon';

export default function BunnyPopups() {
  const [message, setMessage] = useState<string | null>(null);
  const [showBunny, setShowBunny] = useState(false);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      const randomMsg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
      setMessage(randomMsg);
      setTimeout(() => setMessage(null), 5000); // Hide after 5s
    }, 25000); // Show every 25s

    const bunnyInterval = setInterval(() => {
      setShowBunny(true);
      setTimeout(() => setShowBunny(false), 8000); // Animation takes some time
    }, 45000); // Bunny jumps every 45s

    return () => {
      clearInterval(messageInterval);
      clearInterval(bunnyInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Encouraging Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white dark:bg-pink-600 p-6 rounded-[32px] shadow-2xl border-4 border-pink-200 dark:border-pink-400 flex items-center space-x-4 max-w-sm w-full"
          >
            <div className="bg-pink-100 p-2 rounded-full">
              <BowIcon size={24} className="text-pink-500" />
            </div>
            <p className="text-sm font-black text-pink-600 dark:text-white leading-tight">
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jumping Bunny */}
      <AnimatePresence>
        {showBunny && (
          <motion.div
            initial={{ x: '-100%', y: '80%' }}
            animate={{ 
              x: '110%',
              y: ['80%', '60%', '80%', '60%', '80%', '60%', '80%'] 
            }}
            transition={{ 
              x: { duration: 8, ease: "linear" },
              y: { duration: 1.3, repeat: 5, ease: "easeInOut" }
            }}
            className="absolute"
          >
            <div className="relative">
               <HandDrawnBunnyIcon className="w-24 h-24 text-pink-700" />
               <BowIcon size={20} className="absolute top-2 left-6 text-pink-400 rotate-[-15deg]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
