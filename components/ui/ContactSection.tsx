"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Youtube } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative z-10">
      <div className="text-center max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-7xl font-light mb-8 tracking-wide">
            Let's Build
            <span className="block text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text">
              The Future
            </span>
          </h2>
          <p className="text-xl text-gray-200 mb-12 leading-relaxed font-light">
            Passionate about turning ideas into reality. Let's collaborate to create
            innovative solutions that resonate globally.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <motion.a
              href="mailto:pdubey1924@gmail.com"
              className="flex items-center space-x-2 text-emerald-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Mail className="w-5 h-5" />
              <span>pdubey1924@gmail.com</span>
            </motion.a>
            <motion.a
              href="https://github.com/prashantxy"
              className="flex items-center space-x-2 text-emerald-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/prashantxy"
              className="flex items-center space-x-2 text-emerald-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
            </motion.a>
            <motion.a
              href="https://www.youtube.com/@prashantdubey1924"
              className="flex items-center space-x-2 text-emerald-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Youtube className="w-5 h-5" />
              <span>YouTube</span>
            </motion.a>
          </div>

          <motion.div
            className="flex justify-center space-x-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span>Available for opportunities</span>
            <span>•</span>
            <span>Open to collaboration</span>
            <span>•</span>
            <span>Freelance Ready</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;