"use client";

import { motion } from "framer-motion";
import { ExperienceType } from "./types";

type ExperienceSectionProps = {
  experience: ExperienceType[];
};

const ExperienceSection = ({ experience }: ExperienceSectionProps) => {
  return (
    <section className="min-h-screen py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Experience
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experience.map((exp, index) => (
            <motion.div
              key={exp.id}
              className="p-8 border border-emerald-500/20 rounded-2xl backdrop-blur-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ borderColor: "rgb(16 185 129 / 0.5)", scale: 1.02 }}
            >
              <div className="flex items-center mb-6">
                <div className="p-4 bg-emerald-500/20 rounded-lg mr-4">
                  {exp.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-emerald-400 mb-1">{exp.company}</h3>
                  <p className="text-xl text-white">{exp.role}</p>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                    <span>{exp.period}</span>
                    <span>•</span>
                    <span>{exp.location}</span>
                    <span>•</span>
                    <span>{exp.type}</span>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside text-gray-300 text-base space-y-2">
                {exp.achievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
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