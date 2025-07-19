"use client";

import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar } from "lucide-react";
import { useTheme } from "../ThemeContext";

const EducationSection = () => {
  const { theme } = useTheme();

  return (
    <section
      className={`py-24 relative z-10 ${
        theme === "light" ? "bg-white" : "bg-black"
      } ${theme === "light" ? "text-gray-900" : "text-white"}`}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-light mb-12 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Education
        </motion.h2>

        <motion.div
          className={`p-8 border rounded-2xl backdrop-blur-lg shadow-lg ${
            theme === "light" ? "border-emerald-600/20 bg-white/80" : "border-emerald-400/20 bg-black/80"
          }`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{
            borderColor: theme === "light" ? "rgb(5 150 105 / 0.5)" : "rgb(16 185 129 / 0.5)",
            scale: 1.02,
          }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`p-4 rounded-lg ${
                theme === "light" ? "bg-emerald-600/20" : "bg-emerald-400/20"
              }`}
            >
              <GraduationCap
                className={`w-8 h-8 ${theme === "light" ? "text-emerald-600" : "text-emerald-400"}`}
              />
            </div>
          </motion.div>

          <h3
            className={`text-2xl font-medium mb-2 ${
              theme === "light" ? "text-emerald-600" : "text-emerald-400"
            }`}
          >
            Chandigarh University
          </h3>
          <p className="text-xl mb-2">Bachelor of Engineering</p>
          <div
            className={`flex items-center justify-center space-x-4 ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            } mb-4`}
          >
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Mohali, Punjab, India</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Expected June 2026</span>
            </div>
          </div>
          <div
            className={`text-2xl font-light ${
              theme === "light" ? "text-teal-600" : "text-teal-400"
            }`}
          >
            CGPA: 8.4/10
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationSection;