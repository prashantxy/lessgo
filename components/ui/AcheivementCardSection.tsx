"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AchievementType } from "./types";

type AchievementCardSectionProps = {
  achievement: AchievementType;
  index: number;
};

const AchievementCardSection = ({ achievement, index }: AchievementCardSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group p-6 border border-emerald-500/20 rounded-2xl backdrop-blur-lg shadow-lg overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-0`}
        animate={{ opacity: isHovered ? 0.15 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${achievement.color} rounded-2xl`}
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center">
        <motion.div
          className="inline-flex items-center justify-center mb-4"
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`p-3 bg-gradient-to-r ${achievement.color} rounded-lg text-black`}>
            {achievement.icon}
          </div>
        </motion.div>

        <h3 className="text-lg font-medium mb-2 text-white">{achievement.title}</h3>

        <motion.p
          className="text-2xl font-light"
          animate={{
            color: isHovered ? "transparent" : "white",
          }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundImage: isHovered
              ? `linear-gradient(to right, ${achievement.color.split(" ")[1]}, ${achievement.color.split(" ")[3]})`
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