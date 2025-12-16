import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Code, Sparkles, Trophy, X } from 'lucide-react';

export function Footer() {
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const handleLogoClick = () => {
    const newClicks = easterEggClicks + 1;
    setEasterEggClicks(newClicks);

    if (newClicks >= 7) {
      setShowEasterEgg(true);
      setEasterEggClicks(0);
    }
  };

  return (
    <>
      <footer className="relative mt-16 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/5 via-transparent to-blue-900/5 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Wheels of Fortune 2.0
              </span>
            </motion.div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Code className="w-4 h-4" />
              <span>Designed & Developed with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span>by</span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Abhishekh Dey
              </span>
            </div>

            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowEasterEgg(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.5, rotate: 10, y: 50 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border-2 border-cyan-500/50 shadow-2xl max-w-lg w-full p-8 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>

              <button
                onClick={() => setShowEasterEgg(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-center mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                    You found the Easter Egg!
                  </span>
                </h2>

                <p className="text-gray-300 text-center mb-6 leading-relaxed">
                  Congratulations on discovering this hidden gem! You're as lucky as the winners in this draw.
                  May fortune always favor you!
                </p>

                <div className="p-4 bg-gray-800/50 rounded-xl border border-cyan-500/30 mb-6">
                  <p className="text-cyan-400 text-center text-sm font-medium">
                    "The only way to do great work is to love what you do."
                  </p>
                  <p className="text-gray-500 text-center text-xs mt-2">- Steve Jobs</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Special thanks to you for exploring!</span>
                </div>

                <motion.div
                  className="absolute -top-10 -left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1.5, 1, 1.5],
                    opacity: [0.6, 0.3, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
