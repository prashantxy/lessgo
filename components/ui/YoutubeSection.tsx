"use client";

import { motion } from "framer-motion";
import { Youtube } from "lucide-react";

const YouTubeSection = () => {
  return (
    <section className="min-h-screen py-24 relative z-10 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-6xl font-light mb-12 tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          My YouTube Journey
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
              <Youtube className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          <h3 className="text-2xl font-medium text-emerald-400 mb-2">
            Prashant Dubey
          </h3>
          <p className="text-xl text-gray-200 mb-6 leading-relaxed">
            Dive into my YouTube channel where I share in-depth explanations of my projects, coding tutorials, and insights from my competitive programming and hackathon experiences. Subscribe to stay updated on my latest tech adventures!
          </p>
          <motion.a
            href="https://www.youtube.com/@prashantdubey1924"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/40 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Youtube className="w-5 h-5" />
            <span>Visit My Channel</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default YouTubeSection;