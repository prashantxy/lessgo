"use client";

import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";
import { ProjectType } from "./types";

type ProjectsSectionProps = {
  projects: ProjectType[];
};

const ProjectsSection = ({ projects }: ProjectsSectionProps) => {
  return (
    <section className="min-h-screen py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-6xl font-light text-center mb-20 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Innovative Creations
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;