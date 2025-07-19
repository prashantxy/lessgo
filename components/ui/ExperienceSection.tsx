"use client";

import { motion } from "framer-motion";
import { ExperienceType } from "./types"; // Make sure this exists and is properly typed
import { useTheme } from "../ThemeContext";

const ExperienceSection = ({ experience }: { experience: ExperienceType[] }) => {
  const { theme } = useTheme();

  const isLight = theme === "light";

  return (
    <section
      className={`min-h-screen py-24 relative z-10 ${
        isLight ? "bg-white text-gray-900" : "bg-black text-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Experience
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2">
          {experience.map((exp, index) => (
            <motion.div
              key={exp.id}
              className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                isLight
                  ? "bg-white/80 border border-emerald-600/20"
                  : "bg-black/80 border border-emerald-400/20"
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                borderColor: isLight
                  ? "rgb(5 150 105 / 0.5)" // emerald-600/50
                  : "rgb(16 185 129 / 0.5)", // emerald-400/50
                scale: 1.02,
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                {exp.icon && typeof exp.icon === "function" ? (
                  exp.icon({
                    className: `w-6 h-6 ${isLight ? "text-emerald-600" : "text-emerald-400"}`,
                  })
                ) : null}
                <h3 className="text-xl font-semibold">{exp.role}</h3>
              </div>

              <p className={isLight ? "text-gray-700" : "text-gray-200"}>{exp.company}</p>
              <p className={`${isLight ? "text-gray-600" : "text-gray-400"} text-sm`}>
                {exp.period} • {exp.location}
              </p>

              <ul className={`list-disc list-inside mt-4 ${isLight ? "text-gray-700" : "text-gray-200"}`}>
                {exp.achievements.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
