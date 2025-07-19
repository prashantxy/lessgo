"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { RefsType } from "./types";

interface NavbarProps {
  scrollToSection: (ref: React.RefObject<HTMLElement | null>) => void;
  refs: RefsType;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navbar = ({ scrollToSection, refs, isMenuOpen, setIsMenuOpen }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { name: "Home", ref: refs.heroRef },
    { name: "Experience", ref: refs.experienceRef },
    { name: "Projects", ref: refs.projectsRef },
    { name: "Achievements", ref: refs.achievementsRef },
    { name: "Skills", ref: refs.skillsRef },
    { name: "Education", ref: refs.educationRef },
    { name: "YouTube", ref: refs.youtubeRef },
    { name: "Contact", ref: refs.contactRef },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMenuOpen]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <motion.h1
              className="text-2xl font-bold text-gray-900 dark:text-white"
              initial={{ color: "#111827" }}
              animate={{ color: theme === "light" ? "#111827" : "#ffffff" }}
              transition={{ duration: 0.3 }}
            >
              Prashant Dubey
            </motion.h1>
          </div>
          <div className="hidden md:flex space-x-4 items-center">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                className="text-gray-900 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium"
                whileHover={{ scale: 1.1, color: theme === "light" ? "#10b981" : "#34d399" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.ref)}
              >
                {item.name}
              </motion.button>
            ))}
            <motion.button
              className="text-gray-900 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </motion.button>
          </div>
          <div className="md:hidden flex items-center">
            <motion.button
              className="text-gray-900 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </motion.button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-white dark:bg-black bg-opacity-90 dark:bg-opacity-90"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                className="block text-gray-900 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                whileHover={{ scale: 1.05, color: theme === "light" ? "#10b981" : "#34d399" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.ref)}
              >
                {item.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;