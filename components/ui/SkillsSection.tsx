"use client";

import { motion } from "framer-motion";
import SkillCard from "./SkillCard";
import { SkillType } from "./types";

type SkillsSectionProps = {
  skills: SkillType[];
};

const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const categories = [...new Set(skills.map((skill) => skill.category))];

  return (
    <section className="min-h-screen py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Technical Arsenal
        </motion.h2>

        {categories.map((category, categoryIndex) => (
          <div key={category} className="mb-12">
            <motion.h3
              className="text-3xl font-medium mb-6 text-emerald-400"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              {category}
            </motion.h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill, index) => (
                  <SkillCard key={skill.name} skill={skill} index={index} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;