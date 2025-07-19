"use client";

import { motion, useInView } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useRef, useState } from "react";
import { ProjectType } from "./types";

type ProjectCardProps = {
  project: ProjectType;
  index: number;
};

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="group relative p-6 border border-emerald-500/20 rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, borderColor: "rgb(16 185 129 / 0.5)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0"
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="p-3 bg-emerald-500/20 rounded-lg"
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {<project.icon className="w-5 h-5" />}

          </motion.div>
          <motion.a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300"
            whileHover={{ scale: 1.1 }}
          >
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </div>
        <h3 className="text-xl font-medium text-emerald-400 mb-1">{project.title}</h3>
        <p className="text-base text-gray-400 mb-2">{project.subtitle}</p>
        <p className="text-gray-300 mb-4 leading-relaxed text-sm">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech.map((tech) => (
            <motion.span
              key={tech}
              className="px-3 py-1 text-xs border border-emerald-500/30 rounded-full text-emerald-300"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
              transition={{ duration: 0.2 }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-teal-400 font-mono">{project.metrics}</span>
          <span className="text-gray-500">{project.year}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;