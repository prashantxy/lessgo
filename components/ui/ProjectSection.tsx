"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Slider from "react-slick";
import { ProjectType } from "./types";
import { useTheme } from "../ThemeContext";

// Custom arrow components to filter out invalid props and apply theme-based styling
const PrevArrow = ({
  className,
  style,
  onClick,
  theme,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  theme: "light" | "dark";
}) => (
  <button
    className={`${className || ""} slick-prev flex items-center justify-center w-10 h-10 rounded-full z-10 ${
      theme === "light"
        ? "bg-gray-800/50 text-black hover:bg-gray-800/80"
        : "bg-gray-200/50 text-emerald-400 hover:bg-gray-200/80"
    }`}
    style={{ ...style, left: "10px" }}
    onClick={onClick}
    aria-label="Previous project"
  >
    ←
  </button>
);

const NextArrow = ({
  className,
  style,
  onClick,
  theme,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  theme: "light" | "dark";
}) => (
  <button
    className={`${className || ""} slick-next flex items-center justify-center w-10 h-10 rounded-full z-10 ${
      theme === "light"
        ? "bg-gray-800/50 text-black hover:bg-gray-800/80"
        : "bg-gray-200/50 text-emerald-400 hover:bg-gray-200/80"
    }`}
    style={{ ...style, right: "10px" }}
    onClick={onClick}
    aria-label="Next project"
  >
    →
  </button>
);

// Carousel settings for react-slick
const carouselSettings = (theme: "light" | "dark") => ({
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  autoplay: false,
  prevArrow: <PrevArrow theme={theme} />,
  nextArrow: <NextArrow theme={theme} />,
});

const ProjectsSection = ({ projects }: { projects: ProjectType[] }) => {
  const { theme } = useTheme();
  const [showAll, setShowAll] = useState(false);

  // Log projects to debug if they are being passed
  useEffect(() => {
    console.log("Projects:", projects);
  }, [projects]);

  // Toggle to show all projects or top 3 on desktop
  const displayedProjects = showAll ? projects : projects.slice(0, 3);

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

        {/* Mobile View: Carousel with all projects */}
        <div className="block md:hidden">
          {projects.length === 0 ? (
            <p className="text-center text-red-500">
              No projects available. Please check the projects data.
            </p>
          ) : (
            <Slider {...carouselSettings(theme)}>
              {projects.map((project) => (
                <div key={project.id} className="p-4">
                  <motion.div
                    className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
                      theme === "light"
                        ? "bg-white/80 border border-emerald-600/20"
                        : "bg-black/80 border border-emerald-400/20"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <project.icon
                        className={`w-6 h-6 ${
                          theme === "light" ? "text-emerald-600" : "text-emerald-400"
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <p
                          className={`text-sm ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {project.subtitle}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      }`}
                    >
                      {project.description}
                    </p>
                    <p
                      className={`${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      } text-sm mt-2`}
                    >
                      <strong>Tech:</strong> {project.tech.join(", ")}
                    </p>
                    {project.metrics && (
                      <p
                        className={`${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        } text-sm mt-1`}
                      >
                        <strong>Metrics:</strong> {project.metrics}
                      </p>
                    )}
                    {project.year && (
                      <p
                        className={`${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        } text-sm mt-1`}
                      >
                        <strong>Year:</strong> {project.year}
                      </p>
                    )}
                    {project.status && (
                      <p
                        className={`${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        } text-sm mt-1`}
                      >
                        <strong>Status:</strong> {project.status}
                      </p>
                    )}
                    <a
                      href={project.link}
                      className={`mt-4 inline-flex items-center ${
                        theme === "light"
                          ? "text-emerald-600 hover:text-emerald-700"
                          : "text-emerald-400 hover:text-emerald-300"
                      }`}
                      aria-label={`View ${project.title} project`}
                    >
                      View Project <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                    </a>
                  </motion.div>
                </div>
              ))}
            </Slider>
          )}
        </div>

        {/* Desktop View: Grid with top 3 projects and View More */}
        <div className="hidden md:grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <p className="text-center text-red-500 col-span-3">
              No projects available. Please check the projects data.
            </p>
          ) : (
            displayedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${
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
                <div className="flex items-center space-x-3 mb-4">
                  <project.icon
                    className={`w-6 h-6 ${
                      theme === "light" ? "text-emerald-600" : "text-emerald-400"
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {project.subtitle}
                    </p>
                  </div>
                </div>
                <p
                  className={`${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  {project.description}
                </p>
                <p
                  className={`${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  } text-sm mt-2`}
                >
                  <strong>Tech:</strong> {project.tech.join(", ")}
                </p>
                {project.metrics && (
                  <p
                    className={`${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    } text-sm mt-1`}
                  >
                    <strong>Metrics:</strong> {project.metrics}
                  </p>
                )}
                {project.year && (
                  <p
                    className={`${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    } text-sm mt-1`}
                  >
                    <strong>Year:</strong> {project.year}
                  </p>
                )}
                {project.status && (
                  <p
                    className={`${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    } text-sm mt-1`}
                  >
                    <strong>Status:</strong> {project.status}
                  </p>
                )}
                <a
                  href={project.link}
                  className={`mt-4 inline-flex items-center ${
                    theme === "light"
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-emerald-400 hover:text-emerald-300"
                  }`}
                  aria-label={`View ${project.title} project`}
                >
                  View Project <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                </a>
              </motion.div>
            ))
          )}
        </div>

        {/* View More Button for Desktop */}
        {projects.length > 3 && !showAll && (
          <div className="hidden md:flex justify-center mt-8">
            <motion.button
              onClick={() => setShowAll(true)}
              className={`px-6 py-3 rounded-full font-semibold text-lg transition-colors ${
                theme === "light"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-emerald-400 text-black hover:bg-emerald-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View more projects"
            >
              View More
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;