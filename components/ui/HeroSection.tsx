"use client";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { GraduationCap } from "lucide-react";
import { useTheme } from "../ThemeContext";
import Image from "next/image";

const HeroSection = () => {
  const { theme } = useTheme();
  const interactivity = true; // Set to false to disable interactions

  // Iframe URL (confirmed public)
  const iframeUrl = "https://my.spline.design/genkubgreetingrobot-VWhhsWaP3gF2ktauW3kjRoKd/";

  return (
    <section className="min-h-screen flex items-center justify-center relative z-10 pt-20 overflow-hidden">
      {/* Spline 3D Robot Background with Theme-Aware Overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          loading="lazy"
          className={interactivity ? "" : "pointer-events-none"}
          title="Greeting Robot 3D Scene"
        />
        {/* Enhanced overlay to hide watermark (bottom-right corner) */}
        <div
          className={`absolute z-10 ${
            theme === "light"
              ? "bg-gray-100"
              : "bg-gradient-to-tl from-black via-black/95 to-transparent"
          } ${
            "w-1/2 h-1/4 sm:w-1/3 sm:h-1/5 md:w-1/3 md:h-1/6 lg:w-1/3 lg:h-1/5"
          } bottom-0 right-0 md:bottom-2 md:right-2`}
        />
        {/* Theme-aware subtle background overlay */}
        <div
          className={`absolute inset-0 ${
            theme === "light"
              ? "bg-gradient-to-b from-transparent to-gray-100/15"
              : "bg-gradient-to-b from-transparent to-black/40"
          }`}
        />
      </div>

      {/* Foreground Content */}
      <div className="max-w-6xl mx-auto px-6 relative z-20"> {/* Increased z-index to 20 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Right Side: Personal Image */}
          <motion.div
            className="flex justify-center lg:justify-end lg:ml-auto order-first lg:order-last"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="/assets/pro.jpg"
              alt="Prashant Dubey"
              width={450}
              height={450}
              className="rounded-full object-cover w-64 h-64 sm:w-80 sm:h-80 lg:w-[450px] lg:h-[450px] max-w-full"
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
                  aria-live="polite"
                >
                  <TypeAnimation
                    sequence={[
                      "Full-Stack Developer.",
                      2000,
                      "Web3 Developer.",
                      2000,
                      "AI Enthusiast.",
                      2000,
                      "Problem Solver.",
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