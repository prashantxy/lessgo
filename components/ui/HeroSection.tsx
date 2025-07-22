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
          {/* Right Side: Personal Image */}
          <motion.div
            className="flex justify-center lg:justify-end lg:ml-auto order-first lg:order-last"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="/asset/pro.jpg"
              alt="Prashant Dubey"
              width={450}
              height={450}
              className="rounded-full object-cover w-64 h-64 sm:w-80 sm:h-80 lg:w-[450px] lg:h-[450px] max-w-full"
              priority
            />
          </motion.div>

          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left order-last lg:order-first">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <h1
                className={`text-5xl md:text-7xl font-extralight mb-6 leading-tight tracking-tight text-gray-900 dark:text-white`}
              >
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
        </div>
      </div>
    </section>
  );
};

export default HeroSection;