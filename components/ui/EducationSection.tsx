"use client";

import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar } from "lucide-react";

const EducationSection = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-6xl font-light mb-12 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Education
        </motion.h2>

        <motion.div
          className="p-8 border border-emerald-500/20 rounded-2xl backdrop-blur-lg shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ borderColor: "rgb(16 185 129 / 0.5)", scale: 1.02 }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4 bg-emerald-500/20 rounded-lg">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          <h3 className="text-2xl font-medium text-emerald-400 mb-2">
            Chandigarh University
          </h3>
          <p className="text-xl text-white mb-2">Bachelor of Engineering</p>
          <div className="flex items-center justify-center space-x-4 text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Mohali, Punjab, India</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Expected June 2026</span>
            </div>
          </div>
          <div className="text-2xl font-light text-teal-400">CGPA: 8.4/10</div>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationSection;