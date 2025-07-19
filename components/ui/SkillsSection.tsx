"use client";

import { motion } from "framer-motion";
import { SkillType } from "./types";
import { useTheme } from "../ThemeContext";
import React from "react";

const SkillsSection = ({ skills }: { skills: SkillType[] }) => {
  const { theme } = useTheme();

  return (
    <section
      className={`min-h-screen py-24 relative z-10 ${
        theme === "light" ? "bg-white text-gray-900" : "bg-black text-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Skills
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              className={`p-4 rounded-2xl shadow-lg backdrop-blur-lg text-center ${
                theme === "light"
                  ? "bg-white/80 border border-emerald-600/20"
                  : "bg-black/80 border border-emerald-400/20"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                borderColor:
                  theme === "light"
                    ? "rgb(5 150 105 / 0.5)"
                    : "rgb(16 185 129 / 0.5)",
                scale: 1.02,
              }}
            >
              {typeof skill.icon === "function" && (
                React.createElement(skill.icon, {
                  className: `w-6 h-6 mx-auto mb-2 ${
                    theme === "light"
                      ? "text-emerald-600"
                      : "text-emerald-400"
                  }`
                })
              )}
              <p className="font-semibold">{skill.name}</p>
              <p
                className={`${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                } text-sm`}
              >
                {skill.category}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
