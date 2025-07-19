"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { ProjectType } from "./types";
import { useTheme } from "../ThemeContext";

const ProjectsSection = ({ projects }: { projects: ProjectType[] }) => {
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
          Projects
        </motion.h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                theme === "light" ? "bg-white/80 border border-emerald-600/20" : "bg-black/80 border border-emerald-400/20"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                borderColor: theme === "light" ? "rgb(5 150 105 / 0.5)" : "rgb(16 185 129 / 0.5)",
                scale: 1.02,
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <project.icon
                  className={`w-6 h-6 ${theme === "light" ? "text-emerald-600" : "text-emerald-400"}`}
                />
                <h3 className="text-xl font-semibold">{project.title}</h3>
              </div>
              <p className={`${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
                {project.description}
              </p>
              <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} text-sm mt-2`}>
                {project.tech.join(", ")}
              </p>
              <a
                href={project.link}
                className={`mt-4 inline-flex items-center ${
                  theme === "light" ? "text-emerald-600 hover:text-emerald-700" : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                View Project <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;