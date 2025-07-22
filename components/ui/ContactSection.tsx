"use client";

import { motion } from "framer-motion";
import { Mail, Github, Twitter, Youtube } from "lucide-react"; // Replaced Linkedin with Twitter
import { useTheme } from "../ThemeContext";

const ContactSection = () => {
  const { theme } = useTheme();

  return (
    <section
      className={`min-h-screen flex items-center justify-center relative z-10 ${
        theme === "light" ? "bg-white" : "bg-black"
      } ${theme === "light" ? "text-gray-900" : "text-white"}`}
    >
      <div className="text-center max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className={`text-5xl md:text-7xl font-light mb-8 tracking-wide ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Let's Build
            <span
              className={`block text-transparent bg-clip-text ${
                theme === "light"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"
                  : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300"
              }`}
            >
              The Future
            </span>
          </h2>
          <p
            className={`text-xl leading-relaxed font-light ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            } mb-12`}
          >
            Passionate about turning ideas into reality. Let's collaborate to create
            innovative solutions that resonate globally.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <motion.a
              href="mailto:pdubey1924@gmail.com"
              className={`flex items-center space-x-2 ${
                theme === "light"
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-emerald-400 hover:text-emerald-300"
              } transition-colors`}
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Mail className="w-5 h-5" />
              <span>pdubey1924@gmail.com</span>
            </motion.a>
            <motion.a
              href="https://github.com/prashantxy"
              className={`flex items-center space-x-2 ${
                theme === "light"
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-emerald-400 hover:text-emerald-300"
              } transition-colors`}
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </motion.a>
            <motion.a
              href="https://x.com/pdubey1924" // Updated to X profile
              className={`flex items-center space-x-2 ${
                theme === "light"
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-emerald-400 hover:text-emerald-300"
              } transition-colors`}
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Twitter className="w-5 h-5" /> {/* Using Twitter icon for X */}
              <span>X</span> {/* Updated label to X */}
            </motion.a>
            <motion.a
              href="https://www.youtube.com/@prashantdubey1924"
              className={`flex items-center space-x-2 ${
                theme === "light"
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-emerald-400 hover:text-emerald-300"
              } transition-colors`}
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <Youtube className="w-5 h-5" />
              <span>YouTube</span>
            </motion.a>
          </div>

          <motion.div
            className={`flex justify-center space-x-8 text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
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