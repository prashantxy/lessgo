"use client";

import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { GraduationCap } from "lucide-react";
import { useTheme } from "../ThemeContext";
import Image from "next/image";

const HeroSection = () => {
  const { theme } = useTheme();

  return (
    <section className="min-h-screen flex items-center justify-center relative z-10 pt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-extralight mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
                Hey, I'm{" "}
                <span
                  className={`inline text-transparent bg-clip-text font-medium ${
                    theme === "light"
                      ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"
                      : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300"
                  }`}
                >
                  Prashant Dubey
                </span>
                , a{" "}
                <span
                  className={`inline text-transparent bg-clip-text font-medium ${
                    theme === "light"
                      ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"
                      : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300"
                  }`}
                >
                  <TypeAnimation
                    sequence={[
                      "Full-Stack Developer.",
                      2000,
                      "Web3 Developer.",
                      2000,
                      "AI Enthusiast.",
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </span>
              </h1>

              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                <GraduationCap className="w-5 h-5" />
                <span>Currently in 4th year</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Personal Image */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="/lessgo/asset/profile.png" 
              alt="Prashant Dubey"
              width={400}
              height={400}
              className="rounded-full object-cover"
              priority
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
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
      </div>
    </section>
  );
};

export default HeroSection;