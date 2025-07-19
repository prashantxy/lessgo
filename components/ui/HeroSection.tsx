"use client";

import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { GraduationCap } from "lucide-react";
import { useTheme } from "../ThemeContext";

const HeroSection = () => {
  const { theme } = useTheme();

  return (
    <section className="h-screen flex items-center justify-center relative z-10 pt-20">
      <div className="text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-extralight mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
            Symphony of{" "}
            <span
              className={`block text-transparent bg-clip-text font-medium ${
                theme === "light"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"
                  : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300"
              }`}
            >
              <TypeAnimation
                sequence={[
                  "Code.",
                  2000,
                  "Logic.",
                  2000,
                  "Innovation.",
                  2000,
                  "Creation.",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Crafting the future with algorithms, creativity, and cutting-edge technology.
            A fusion of competitive programming and innovative solutions.
          </p>
          <div className="text-lg text-emerald-500 dark:text-emerald-400 font-mono mb-8 tracking-wide">
            Prashant Dubey • Full-Stack Engineer & Problem Solver
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <GraduationCap className="w-5 h-5" />
            <span>Currently in 4th year</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className={`w-6 h-12 border-2 rounded-full flex justify-center ${
            theme === "light" ? "border-emerald-600" : "border-emerald-400"
          }`}
        >
          <motion.div
            className={`w-1 h-4 rounded-full mt-2 ${
              theme === "light" ? "bg-emerald-600" : "bg-emerald-400"
            }`}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;