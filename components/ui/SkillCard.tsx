"use client";

import { motion } from "framer-motion";
import { SkillType } from "./types";

type SkillCardProps = {
  skill: SkillType;
  index: number;
};

const SkillCard = ({ skill, index }: SkillCardProps) => {
  return (
    <motion.div
      className="group p-4 border border-gray-700 rounded-lg backdrop-blur-lg hover:border-emerald-500/40 transition-colors relative overflow-hidden shadow-md"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 flex items-center space-x-3">
        <motion.div
          className="text-emerald-400"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
         {skill.icon}
        </motion.div>
        <span className="text-gray-300 font-mono text-sm">{skill.name}</span>
      </div>
    </motion.div>
  );
};

export default SkillCard;