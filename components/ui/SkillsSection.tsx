"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { SkillType } from "./types";
import { useTheme } from "../ThemeContext";
import React from "react";

const SkillsSection = ({ skills }: { skills: SkillType[] }) => {
  const { theme } = useTheme();
  const controlsTop = useAnimation();
  const controlsBottom = useAnimation();
  const containerRefTop = useRef<HTMLDivElement>(null);
  const containerRefBottom = useRef<HTMLDivElement>(null);

  // Duplicate skills for seamless looping
  const duplicatedSkillsTop = [...skills, ...skills]; // Top row: starts with first skill
  const duplicatedSkillsBottom = [...skills].reverse().concat([...skills].reverse()); // Bottom row: starts with last skill

  // Animation settings
  const animationDuration = skills.length * 2; // 2 seconds per skill
  const carouselWidth = skills.length * 200; // Approximate width per skill card (adjust as needed)

  useEffect(() => {
    // Start top row animation (left to right, starting with first skill)
    controlsTop.start({
      x: carouselWidth, // Move left to right
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: animationDuration,
          ease: "linear",
        },
      },
    });

    // Start bottom row animation (right to left, starting with last skill)
    controlsBottom.start({
      x: -carouselWidth, // Move right to left
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: animationDuration,
          ease: "linear",
        },
      },
    });
  }, [controlsTop, controlsBottom, carouselWidth, animationDuration]);

  // Handle hover events for top row
  const handleHoverStartTop = () => {
    controlsTop.stop();
  };

  const handleHoverEndTop = () => {
    controlsTop.start({
      x: carouselWidth,
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: animationDuration,
          ease: "linear",
        },
      },
    });
  };

  // Handle hover events for bottom row
  const handleHoverStartBottom = () => {
    controlsBottom.stop();
  };

  const handleHoverEndBottom = () => {
    controlsBottom.start({
      x: -carouselWidth,
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: animationDuration,
          ease: "linear",
        },
      },
    });
  };

  return (
    <section
      className={`min-h-[50vh] py-12 relative z-10 ${
        theme === "light" ? "bg-white text-gray-900" : "bg-black text-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-6xl font-light text-center mb-12 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Skills
        </motion.h2>
        <div className="space-y-8">
          {/* Top Row: Left to Right (starts with first skill) */}
          <div className="overflow-hidden">
            <motion.div
              ref={containerRefTop}
              className="flex flex-nowrap"
              animate={controlsTop}
              style={{ width: `${carouselWidth * 2}px` }}
              onHoverStart={handleHoverStartTop}
              onHoverEnd={handleHoverEndTop}
            >
              {duplicatedSkillsTop.map((skill, index) => (
                <motion.div
                  key={`top-${skill.name}-${index}`}
                  className={`flex-shrink-0 p-4 rounded-2xl shadow-lg backdrop-blur-lg text-center mx-2 w-[180px] ${
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
                        theme === "light" ? "text-emerald-600" : "text-emerald-400"
                      }`,
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
            </motion.div>
          </div>
          {/* Bottom Row: Right to Left (starts with last skill) */}
          <div className="overflow-hidden">
            <motion.div
              ref={containerRefBottom}
              className="flex flex-nowrap"
              animate={controlsBottom}
              style={{ width: `${carouselWidth * 2}px` }}
              onHoverStart={handleHoverStartBottom}
              onHoverEnd={handleHoverEndBottom}
            >
              {duplicatedSkillsBottom.map((skill, index) => (
                <motion.div
                  key={`bottom-${skill.name}-${index}`}
                  className={`flex-shrink-0 p-4 rounded-2xl shadow-lg backdrop-blur-lg text-center mx-2 w-[180px] ${
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
                        theme === "light" ? "text-emerald-600" : "text-emerald-400"
                      }`,
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;