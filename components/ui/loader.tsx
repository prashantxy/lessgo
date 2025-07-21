"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loader = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowLoader(false);
            if (onComplete) onComplete(); // Optional callback
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40); // Slightly faster for smoother progress
    return () => clearInterval(interval);
  }, [onComplete]);

  // Dynamic radius and positioning based on screen size
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  const radius = isSmallScreen ? 120 : 150; // Reduced from 200 to 150 for large screens
  const height = isSmallScreen ? 240 : 300; // Adjusted height for large screens
  const angle = (progress / 100) * 360; // Full 360-degree rotation
  const rad = (angle * Math.PI) / 180;
  const cx = 200, cy = isSmallScreen ? height / 2 : height;
  const dotX = cx + radius * Math.cos(rad - Math.PI);
  const dotY = cy + radius * Math.sin(rad - Math.PI);
  const circumference = 2 * Math.PI * radius;

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* SVG Container with Dynamic Height */}
            <div className="w-[400px] h-[400px] sm:h-[240px] md:w-[300px] md:h-[300px] flex items-center justify-center">
              <svg
                width={isSmallScreen ? "400" : "300"} // Reduced width for large screens
                height={height}
                viewBox={`0 0 ${isSmallScreen ? 400 : 300} ${height}`}
                className="transform rotate-90 origin-center"
              >
                {/* Gradient Background Arc */}
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#00ffff", stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: "#00b7eb", stopOpacity: 0.5 }} />
                  </linearGradient>
                  <linearGradient id="completeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#00ff00", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#00cc00", stopOpacity: 0.7 }} />
                  </linearGradient>
                </defs>
                {/* Full Circle Arc with Completion Effect */}
                <path
                  d={`M${cx},${cy - radius} A${radius},${radius} 0 1 1 ${cx},${cy - radius}`} // Full circle path
                  fill="none"
                  stroke={progress === 100 ? "url(#completeGradient)" : "url(#arcGradient)"}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={progress === 100 ? 0 : circumference - (progress * circumference) / 100}
                  className="drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] transition-all duration-500"
                />
                {/* Animated Dot with Glow */}
                <motion.circle
                  cx={dotX}
                  cy={dotY}
                  r="8"
                  fill="#00ffff"
                  className="drop-shadow-[0_0_15px_rgba(0,255,255,0.9)]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.6, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </div>

            {/* Central Number */}
            <motion.h1
              className="absolute text-center font-bold"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "clamp(2rem, 10vw, 10rem)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {progress}%
            </motion.h1>

            {/* LOADING TEXT */}
            <motion.div
              className="absolute bottom-10 text-white tracking-widest text-xs sm:text-sm md:text-base font-bold"
              style={{ fontFamily: "Orbitron, sans-serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              LOADING
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="w-full max-w-md mt-8 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${progress}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;