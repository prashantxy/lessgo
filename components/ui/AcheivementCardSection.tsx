"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AchievementType } from "./types";
import { useTheme } from "../ThemeContext";

type AchievementCardSectionProps = {
  achievement: AchievementType;
  index: number;
};

const AchievementCardSection = ({ achievement, index }: AchievementCardSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const Icon = achievement.icon; // ✅ Use capitalized variable for JSX
  const gradientColors =
    theme === "light"
      ? achievement.color.replace("400", "600").replace("300", "500")
      : achievement.color;

  return (
    <motion.div
      className={`relative group p-6 border rounded-2xl shadow-lg overflow-hidden cursor-pointer ${
        theme === "light"
          ? "border-emerald-600/20 bg-white/80 backdrop-blur-lg"
          : "border-emerald-400/20 bg-black/80 backdrop-blur-lg"
      }`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Hover gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradientColors} opacity-0`}
        animate={{ opacity: isHovered ? 0.15 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated pulse glow effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${gradientColors} rounded-2xl`}
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Card Content */}
      <div className="relative z-10 text-center">
        {/* Icon with rotation */}
        <motion.div
          className="inline-flex items-center justify-center mb-4"
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className={`p-3 bg-gradient-to-r ${gradientColors} rounded-lg ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Title */}
        <h3 className={`text-lg font-medium mb-2 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
          {achievement.title}
        </h3>

        {/* Value with hover gradient text */}
        <motion.p
          className="text-2xl font-light"
          animate={{
            color: isHovered ? "transparent" : theme === "light" ? "#111827" : "#ffffff",
          }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundImage: isHovered
              ? `linear-gradient(to right, ${gradientColors.split(" ")[1]}, ${gradientColors.split(" ")[3]})`
              : "none",
            backgroundClip: isHovered ? "text" : "unset",
            WebkitBackgroundClip: isHovered ? "text" : "unset",
          }}
        >
          {achievement.value}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AchievementCardSection;
