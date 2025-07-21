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

  // Define theme styles in a structured manner
  const themeStyles = {
    background: theme === "light" ? "bg-white" : "bg-black",
    textColor: theme === "light" ? "text-gray-900" : "text-white",
    titleColor: theme === "light" ? "text-emerald-600" : "text-emerald-400",
  };

  return (
    <section
      className={`min-h-screen py-24 relative z-10 ${themeStyles.background} ${themeStyles.textColor}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Title Section */}
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Achievements
        </motion.h2>

        {/* Two-Column Grid for CP and Hackathons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Competitive Programming Section */}
          <div>
            <motion.h3
              className={`text-2xl md:text-3xl font-medium mb-8 ${themeStyles.titleColor}`}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Competitive Programming
            </motion.h3>
            <div className="space-y-6">
              {achievements.competitiveProgramming.map((achievement, index) => (
                <AchievementCardSection
                  key={achievement.title}
                  achievement={achievement}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Hackathons Section */}
          <div>
            <motion.h3
              className={`text-2xl md:text-3xl font-medium mb-8 ${themeStyles.titleColor}`}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Hackathons
            </motion.h3>
            <div className="space-y-6">
              {achievements.hackathons.map((achievement, index) => (
                <AchievementCardSection
                  key={achievement.title}
                  achievement={achievement}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;