"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
// Define RefsType locally since './types' is missing
type RefsType = {
  heroRef: React.RefObject<HTMLElement | null>;
  experienceRef: React.RefObject<HTMLElement | null>;
  projectsRef: React.RefObject<HTMLElement | null>;
  achievementsRef: React.RefObject<HTMLElement | null>;
  skillsRef: React.RefObject<HTMLElement | null>;
  educationRef: React.RefObject<HTMLElement | null>;
  youtubeRef: React.RefObject<HTMLElement | null>;
  contactRef: React.RefObject<HTMLElement | null>;
};

type NavbarProps = {
  scrollToSection: (ref: React.RefObject<HTMLElement | null>) => void;
  refs: RefsType;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
};

const Navbar = ({ scrollToSection, refs, isMenuOpen, setIsMenuOpen }: NavbarProps) => {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-emerald-500/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="text-2xl font-light text-emerald-400 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => scrollToSection(refs.heroRef)}
        >
          Prashant Dubey
        </motion.div>

        <div className="hidden md:flex space-x-6">
          {[
            { name: "Home", ref: refs.heroRef },
            { name: "Experience", ref: refs.experienceRef },
            { name: "Projects", ref: refs.projectsRef },
            { name: "Achievements", ref: refs.achievementsRef },
            { name: "Skills", ref: refs.skillsRef },
            { name: "Education", ref: refs.educationRef },
            { name: "YouTube", ref: refs.youtubeRef },
            { name: "Contact", ref: refs.contactRef },
          ].map((item) => (
            <motion.a
              key={item.name}
              href="#"
              className="text-gray-300 hover:text-emerald-400 transition-colors"
              whileHover={{ scale: 1.1 }}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.ref);
              }}
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        <div className="md:hidden">
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6 text-emerald-400" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-black/90 backdrop-blur-md border-t border-emerald-500/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center py-4 space-y-4">
              {[
                { name: "Home", ref: refs.heroRef },
                { name: "Experience", ref: refs.experienceRef },
                { name: "Projects", ref: refs.projectsRef },
                { name: "Achievements", ref: refs.achievementsRef },
                { name: "Skills", ref: refs.skillsRef },
                { name: "Education", ref: refs.educationRef },
                { name: "YouTube", ref: refs.youtubeRef },
                { name: "Contact", ref: refs.contactRef },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-lg"
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.ref);
                  }}
                >
                  {item.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;