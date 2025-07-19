"use client";

import { motion } from "framer-motion";
import AchievementCardSection from "./AcheivementCardSection"; // Fixed typo in import
import { AchievementType } from "./types";
import { useTheme } from "../ThemeContext";

type AchievementsSectionProps = {
  achievements: {
    competitiveProgramming: AchievementType[];
    hackathons: AchievementType[];
  };
};

const AchievementsSection = ({ achievements }: AchievementsSectionProps) => {
  const { theme } = useTheme();

  return (
    <section
      className={`min-h-screen py-24 relative z-10 ${
        theme === "light" ? "bg-white" : "bg-black"
      } ${theme === "light" ? "text-gray-900" : "text-white"}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Achievements
        </motion.h2>

        <motion.h3
          className={`text-2xl md:text-3xl font-medium mb-8 ${
            theme === "light" ? "text-emerald-600" : "text-emerald-400"
          }`}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          Competitive Programming
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {achievements.competitiveProgramming.map((achievement, index) => (
            <AchievementCardSection key={achievement.title} achievement={achievement} index={index} />
          ))}
        </div>

        <motion.h3
          className={`text-2xl md:text-3xl font-medium mb-8 ${
            theme === "light" ? "text-emerald-600" : "text-emerald-400"
          }`}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          Hackathons
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.hackathons.map((achievement, index) => (
            <AchievementCardSection key={achievement.title} achievement={achievement} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;