"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
 Code2, Database, Cloud, Cpu, Globe, Zap,
 Trophy, Award, Star, Target, Github, Linkedin,
 Mail, ExternalLink, Calendar, MapPin, GraduationCap,
 Briefcase, Coffee, Rocket, BookOpen, Brain, Palette,
 Youtube, Menu, X
} from "lucide-react";
import { TypeAnimation } from 'react-type-animation';

const Portfolio = () => {
 const [loading, setLoading] = useState(true);
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);
 const heroRef = useRef<HTMLElement>(null);
 const experienceRef = useRef<HTMLElement>(null);
 const projectsRef = useRef<HTMLElement>(null);
 const achievementsRef = useRef<HTMLElement>(null);
 const skillsRef = useRef<HTMLElement>(null);
 const educationRef = useRef<HTMLElement>(null);
 const youtubeRef = useRef<HTMLElement>(null);
 const contactRef = useRef<HTMLElement>(null);

 const { scrollYProgress } = useScroll({
 target: containerRef,
 offset: ["start start", "end end"],
 });

 useEffect(() => {
 const timer = setTimeout(() => {
 setLoading(false);
 }, 2500); // Slightly increased for enhanced loader
 return () => clearTimeout(timer);
 }, []);

 const projects = [
 {
 id: 1,
 title: "NEAW Demo",
 subtitle: "Decentralized NFT Marketplace",
 description: "Architected a fully decentralized NFT marketplace using IPFS for data persistence and Solana for low-cost transactions. Reduced fees by 70% and onboarded 200+ creators in the first month.",
 tech: ["Next.js", "Supabase", "Solana", "IPFS", "Tailwind CSS"],
 metrics: "200+ creators, 1K+ transactions",
 year: "Aug-Sep 2024",
 status: "Live",
 icon: <Globe className="w-6 h-6" />,
 link: "https://neaw.vercel.app/",
 },
 {
 id: 2,
 title: "Eco-Verse",
 subtitle: "AI-Powered Sustainability Tracker",
 description: "Developed an AI-driven dashboard analyzing 500+ eco-initiatives. Integrated blockchain rewards, increasing community engagement by 20%. Deployed with Next.js and ML pipelines.",
 tech: ["Next.js", "ML", "Blockchain", "Smart Contracts"],
 metrics: "1,000+ verified activities",
 year: "Oct 2024",
 status: "Live",
 icon: <Zap className="w-6 h-6" />,
 link: "https://eco-versee.vercel.app/",
 },
 {
 id: 3,
 title: "AI-Talker",
 subtitle: "Conversational AI Interface",
 description: "Built an AI-powered text-to-speech platform with Gemini AI and Arweave for permanent storage. Improved user retention by 20% with seamless UX and scalable architecture.",
 tech: ["Next.js", "Gemini AI", "Arweave", "Text-to-Speech"],
 metrics: "20% retention boost",
 year: "Aug-Sep 2024",
 status: "Live",
 icon: <Cpu className="w-6 h-6" />,
 link: "https://ai-talker.vercel.app/",
 },
 {
 id: 4,
 title: "EduType.us",
 subtitle: "AI-Driven Educational Platform",
 description: "Designed an AI-powered typing tutor for personalized learning. Integrated real-time analytics and gamified progress tracking, achieving 30% faster typing skill acquisition for users.",
 tech: ["React", "Node.js", "MongoDB", "TensorFlow", "Tailwind CSS"],
 metrics: "50+ active users",
 year: "Nov 2024 - Jan 2025",
 status: "Beta",
 icon: <BookOpen className="w-6 h-6" />,
 link: "https://edutype.us/",
 },
 {
 id: 5,
 title: "DynamicPOS",
 subtitle: "Point of Sale System",
 description: "Developed a modern POS system with real-time inventory tracking and payment integration. Improved transaction processing speed by 40% for small businesses.",
 tech: ["React", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
 metrics: "10+ businesses onboarded",
 year: "Jan-Feb 2025",
 status: "Live",
 icon: <Palette className="w-6 h-6" />,
 link: "https://dynamicpos.vercel.app/",
 },
 {
 id: 6,
 title: "Drone Tech App",
 subtitle: "Drone Control & Analytics Platform",
 description: "Built a web-based platform for real-time drone control and data analytics. Integrated IoT protocols and AWS for scalable data processing, serving 50+ drone operators.",
 tech: ["React", "AWS", "Node.js", "IoT", "MongoDB"],
 metrics: "5+ operators",
 year: "Mar-Apr 2025",
 status: "Live",
 icon: <Rocket className="w-6 h-6" />,
 link: "https://drone-tech-app.vercel.app/",
 },
 ];

 const experience = [
 {
 id: 1,
 company: "Warren AI",
 role: "Full-Stack Developer Intern",
 period: "May 2025 – July 2025",
 location: "Remote",
 type: "Stealth Start-up",
 achievements: [
 "Optimized file uploads to LLMs by 40% using Node.js worker threads.",
 "Built vector database solutions with Chroma, improving efficiency by 30%.",
 "Orchestrated AI-driven workflows with n8n, boosting throughput by 25%.",
 "Integrated chunk indexing for scalable pipelines across teams.",
 ],
 icon: <Briefcase className="w-6 h-6" />,
 },
 {
 id: 2,
 company: "ARL",
 role: "Full-stack App developer",
 period: "oct 2024 – jan 2025",
 location: "Remote",
 type: "logistic Startup",
 achievements: [
 "Redesigned UI/UX for learning platform, increasing user engagement by 15%.",
 "Implemented responsive designs with Tailwind CSS, reducing load times by 20%.",
 "Integrated real-time quiz features with WebSocket, serving 1,000+ concurrent users.",
 ],
 icon: <Coffee className="w-6 h-6" />,
 },
 ];

 const achievements = {
 competitiveProgramming: [
 {
 title: "Codeforces Expert",
 value: "max(1628)",
 icon: <Code2 className="w-8 h-8" />,
 color: "from-blue-400 to-cyan-300",
 },
 {
 title: "CodeChef 4★",
 value: "max(1860)",
 icon: <Star className="w-8 h-8" />,
 color: "from-yellow-400 to-orange-300",
 },
 ],
 hackathons: [
 {
 title: "NASA Space Apps",
 value: "Winner",
 icon: <Rocket className="w-8 h-8" />,
 color: "from-purple-400 to-pink-300",
 },
 {
 title: "National Hackathons",
 value: "5x 1st Place",
 icon: <Trophy className="w-8 h-8" />,
 color: "from-emerald-400 to-teal-300",
 },
 {
 title: "Cryptic Hunt",
 value: "National Winner",
 icon: <Target className="w-8 h-8" />,
 color: "from-red-400 to-rose-300",
 },
 {
 title: "Code for Earth",
 value: "1st Place",
 icon: <Award className="w-8 h-8" />,
 color: "from-green-400 to-emerald-300",
 },
 ],
 };

 const skills = [
 { name: "Python", icon: <Code2 className="w-6 h-6" />, category: "Languages" },
 { name: "JavaScript", icon: <Code2 className="w-6 h-6" />, category: "Languages" },
 { name: "TypeScript", icon: <Code2 className="w-6 h-6" />, category: "Languages" },
 { name: "Rust", icon: <Code2 className="w-6 h-6" />, category: "Languages" },
 { name: "C++", icon: <Code2 className="w-6 h-6" />, category: "Languages" },
 { name: "React", icon: <Globe className="w-6 h-6" />, category: "Frontend" },
 { name: "Next.js", icon: <Globe className="w-6 h-6" />, category: "Frontend" },
 { name: "Vue.js", icon: <Globe className="w-6 h-6" />, category: "Frontend" },
 { name: "Expo", icon: <Globe className="w-6 h-6" />, category: "Frontend" },
 { name: "Expo Router", icon: <Globe className="w-6 h-6" />, category: "Frontend" },
 { name: "Node.js", icon: <Cpu className="w-6 h-6" />, category: "Backend" },
 { name: "Express", icon: <Cpu className="w-6 h-6" />, category: "Backend" },
 { name: "MongoDB", icon: <Database className="w-6 h-6" />, category: "Database" },
 { name: "PostgreSQL", icon: <Database className="w-6 h-6" />, category: "Database" },
 { name: "MySQL", icon: <Database className="w-6 h-6" />, category: "Database" },
 { name: "Firebase", icon: <Database className="w-6 h-6" />, category: "Database" },
 { name: "AWS", icon: <Cloud className="w-6 h-6" />, category: "Cloud" },
 { name: "Docker", icon: <Cloud className="w-6 h-6" />, category: "DevOps" },
 { name: "Kubernetes", icon: <Cloud className="w-6 h-6" />, category: "DevOps" },
 { name: "IPFS", icon: <Cloud className="w-6 h-6" />, category: "Decentralized" },
 { name: "Solana", icon: <Cloud className="w-6 h-6" />, category: "Decentralized" },
 { name: "TensorFlow", icon: <Brain className="w-6 h-6" />, category: "AI/ML" },
 { name: "PyTorch", icon: <Brain className="w-6 h-6" />, category: "AI/ML" },
 ];

 const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
 ref.current?.scrollIntoView({ behavior: "smooth" });
 setIsMenuOpen(false);
 };

 if (loading) {
 return <Loader />;
 }

 return (
 <div ref={containerRef} className="bg-black text-white overflow-hidden relative">
{/* Navbar */}
<Navbar
  scrollToSection={scrollToSection}
  refs={{
    heroRef: heroRef as React.RefObject<HTMLElement>,
    experienceRef: experienceRef as React.RefObject<HTMLElement>,
    projectsRef: projectsRef as React.RefObject<HTMLElement>,
    achievementsRef: achievementsRef as React.RefObject<HTMLElement>,
    skillsRef: skillsRef as React.RefObject<HTMLElement>,
    educationRef: educationRef as React.RefObject<HTMLElement>,
    youtubeRef: youtubeRef as React.RefObject<HTMLElement>,
    contactRef: contactRef as React.RefObject<HTMLElement>,
  }}
  isMenuOpen={isMenuOpen}
  setIsMenuOpen={setIsMenuOpen}
/>
 <ParticleBackground scrollYProgress={scrollYProgress} />

 {/* Hero Section */}
 <section ref={heroRef}>
 <HeroSection />
 </section>

 {/* Experience Section */}
 <section ref={experienceRef}>
 <ExperienceSection experience={experience} />
 </section>

 {/* Projects Section */}
 <section ref={projectsRef}>
 <ProjectsSection projects={projects} />
 </section>

 {/* Achievements Section */}
 <section ref={achievementsRef}>
 <AchievementsSection achievements={achievements} />
 </section>

 {/* Skills Section */}
 <section ref={skillsRef}>
 <SkillsSection skills={skills} />
 </section>

 {/* Education Section */}
 <section ref={educationRef}>
 <EducationSection />
 </section>

 {/* YouTube Section */}
 <section ref={youtubeRef}>
 <YouTubeSection />
 </section>

 {/* Contact Section */}
 <section ref={contactRef}>
 <ContactSection />
 </section>
 </div>
 );
};

// Navbar Component
const Navbar = ({
 scrollToSection,
 refs,
 isMenuOpen,
 setIsMenuOpen,
}: {
 scrollToSection: (ref: React.RefObject<HTMLElement>) => void;
 refs: {
 heroRef: React.RefObject<HTMLElement>;
 experienceRef: React.RefObject<HTMLElement>;
 projectsRef: React.RefObject<HTMLElement>;
 achievementsRef: React.RefObject<HTMLElement>;
 skillsRef: React.RefObject<HTMLElement>;
 educationRef: React.RefObject<HTMLElement>;
 youtubeRef: React.RefObject<HTMLElement>;
 contactRef: React.RefObject<HTMLElement>;
 };
 isMenuOpen: boolean;
 setIsMenuOpen: (open: boolean) => void;
}) => {
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

// Loader Component
const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20); // 100 * 20ms = 2000ms = 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            className="w-40 h-40 border-4 border-emerald-400 rounded-full relative"
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-4 border-4 border-teal-400 rounded-full"
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-8 border-2 border-cyan-300 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ y: [-15, 15, -15], rotate: [0, 360, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Code2 className="w-16 h-16 text-emerald-400" />
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-6xl font-light mb-4 tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Symphony of Code
          </span>
        </motion.h1>

        <motion.div
          className="text-cyan-200 text-lg font-mono mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Loading... {progress}%
        </motion.div>

        <motion.div
          className="flex space-x-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-teal-400 rounded-full"
              animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};


// Particle Background Component
const ParticleBackground = ({ scrollYProgress }: { scrollYProgress: any }) => {
 const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
 const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.1, 0.05]);

 return (
 <motion.div
 className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
 style={{ y, opacity }}
 >
 <canvas
 className="w-full h-full"
 ref={(canvas) => {
 if (!canvas) return;
 const ctx = canvas.getContext("2d");
 if (!ctx) return;

 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;

 const particles: Array<{ x: number; y: number; size: number; speedX: number; speedY: number }> = [];
 const particleCount = 100;

 for (let i = 0; i < particleCount; i++) {
 particles.push({
 x: Math.random() * canvas.width,
 y: Math.random() * canvas.height,
 size: Math.random() * 5 + 1,
 speedX: Math.random() * 0.5 - 0.25,
 speedY: Math.random() * 0.5 - 0.25,
 });
 }

 const animate = () => {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 ctx.fillStyle = "rgba(16, 185, 129, 0.3)";

 particles.forEach((particle) => {
 particle.x += particle.speedX;
 particle.y += particle.speedY;

 if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
 if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

 ctx.beginPath();
 ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
 ctx.fill();
 });

 requestAnimationFrame(animate);
 };

 animate();
 }}
 />
 </motion.div>
 );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="h-screen flex items-center justify-center relative z-10 pt-20">
      <div className="text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <h1 className="text-7xl font-extralight mb-6 leading-tight tracking-tight">
            Symphony of{' '}
            <span className="block text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text font-medium">
              <TypeAnimation
                sequence={[
                  'Code.', 2000,
                  'Logic.', 2000,
                  'Innovation.', 2000,
                  'Creation.', 2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </span>
          </h1>

          <p className="text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Crafting the future with algorithms, creativity, and cutting-edge technology.
            A fusion of competitive programming and innovative solutions.
          </p>
          <div className="text-lg text-emerald-400 font-mono mb-8 tracking-wide">
            Prashant Dubey • Full-Stack Engineer & Problem Solver
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <GraduationCap className="w-5 h-5" />
            <span>Chandigarh University • CGPA: 8.4/10</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-12 border-2 border-emerald-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-4 bg-emerald-400 rounded-full mt-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};
// Experience Section
type ExperienceType = {
 id: number;
 company: string;
 role: string;
 period: string;
 location: string;
 type: string;
 achievements: string[];
 icon: React.ReactNode;
};

const ExperienceSection = ({ experience }: { experience: ExperienceType[] }) => {
 return (
 <section className="min-h-screen py-24 relative z-10">
 <div className="max-w-6xl mx-auto px-6">
 <motion.h2
 className="text-6xl font-light text-center mb-20 tracking-wide"
 initial={{ opacity: 0, y: -50 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 >
 Professional Journey
 </motion.h2>

 {experience.map((exp, index) => (
 <motion.div
 key={exp.id}
 className="mb-12 p-8 border border-emerald-500/20 rounded-2xl backdrop-blur-lg shadow-lg"
 initial={{ opacity: 0, y: 50 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, delay: index * 0.2 }}
 whileHover={{ borderColor: "rgb(16 185 129 / 0.5)", scale: 1.02 }}
 >
 <div className="flex items-start space-x-4 mb-6">
 <motion.div
 className="p-3 bg-emerald-500/20 rounded-lg"
 whileHover={{ rotate: 360 }}
 transition={{ duration: 0.5 }}
 >
 {exp.icon}
 </motion.div>
 <div className="flex-1">
 <h3 className="text-2xl font-medium text-emerald-400">{exp.company}</h3>
 <h4 className="text-xl text-white mb-2">{exp.role}</h4>
 <div className="flex items-center space-x-4 text-gray-400">
 <div className="flex items-center space-x-1">
 <Calendar className="w-4 h-4" />
 <span>{exp.period}</span>
 </div>
 <div className="flex items-center space-x-1">
 <MapPin className="w-4 h-4" />
 <span>{exp.location}</span>
 </div>
 <span className="px-2 py-1 text-xs bg-emerald-500/20 rounded-full">
 {exp.type}
 </span>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 {exp.achievements.map((achievement, i) => (
 <motion.div
 key={i}
 className="flex items-start space-x-3"
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5, delay: i * 0.1 }}
 >
 <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
 <p className="text-gray-300 leading-relaxed">{achievement}</p>
 </motion.div>
 ))}
 </div>
 </motion.div>
 ))}
 </div>
 </section>
 );
};

// Projects Section
type ProjectType = {
 id: number;
 title: string;
 subtitle: string;
 description: string;
 tech: string[];
 metrics: string;
 year: string;
 status: string;
 icon: React.ReactNode;
 link: string;
};

const ProjectsSection = ({ projects }: { projects: ProjectType[] }) => {
 return (
 <section className="min-h-screen py-24 relative z-10">
 <div className="max-w-6xl mx-auto px-6">
 <motion.h2
 className="text-6xl font-light text-center mb-20 tracking-wide"
 initial={{ opacity: 0, y: -50 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 >
 Innovative Creations
 </motion.h2>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {projects.map((project, index) => (
 <ProjectCard key={project.id} project={project} index={index} />
 ))}
 </div>
 </div>
 </section>
 );
};

// Project Card Component
const ProjectCard = ({
 project,
 index,
}: {
 project: ProjectType;
 index: number;
}) => {
 const ref = useRef<HTMLDivElement>(null);
 const isInView = useInView(ref, { once: false, amount: 0.3 });
 const [isHovered, setIsHovered] = useState(false);

 return (
 <motion.div
 ref={ref}
 className="group relative p-6 border border-emerald-500/20 rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg"
 initial={{ opacity: 0, y: 50 }}
 animate={isInView ? { opacity: 1, y: 0 } : {}}
 transition={{ duration: 0.8, delay: index * 0.1 }}
 whileHover={{ scale: 1.03, borderColor: "rgb(16 185 129 / 0.5)" }}
 onHoverStart={() => setIsHovered(true)}
 onHoverEnd={() => setIsHovered(false)}
 >
 <motion.div
 className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0"
 animate={{ opacity: isHovered ? 0.3 : 0 }}
 transition={{ duration: 0.3 }}
 />

 <div className="relative z-10">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center space-x-3">
 <motion.div
 className="p-2 bg-emerald-500/20 rounded-lg"
 whileHover={{ rotate: 360 }}
 transition={{ duration: 0.5 }}
 >
 {project.icon}
 </motion.div>
 <div>
 <h3 className="text-xl font-medium text-white">{project.title}</h3>
 <p className="text-gray-400 text-sm">{project.subtitle}</p>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
 {project.status}
 </span>
 <motion.a
 href={project.link}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center space-x-1 text-emerald-400 hover:text-white transition-colors"
 whileHover={{ scale: 1.1 }}
 >
 <ExternalLink className="w-4 h-4" />
 <span className="text-sm">Visit</span>
 </motion.a>
 </div>
 </div>

 <p className="text-gray-300 mb-4 leading-relaxed text-sm">{project.description}</p>

 <div className="flex flex-wrap gap-2 mb-4">
 {project.tech.map((tech) => (
 <motion.span
 key={tech}
 className="px-3 py-1 text-xs border border-emerald-500/30 rounded-full text-emerald-300"
 whileHover={{ scale: 1.1, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
 transition={{ duration: 0.2 }}
 >
 {tech}
 </motion.span>
 ))}
 </div>

 <div className="flex items-center justify-between text-sm">
 <span className="text-teal-400 font-mono">{project.metrics}</span>
 <span className="text-gray-500">{project.year}</span>
 </div>
 </div>
 </motion.div>
 );
};

// Achievements Section
type AchievementType = {
 title: string;
 value: string;
 icon: React.ReactNode;
 color: string;
};

const AchievementsSection = ({ achievements }: { achievements: { competitiveProgramming: AchievementType[]; hackathons: AchievementType[] } }) => {
 return (
 <section className="min-h-screen py-24 relative z-10">
 <div className="max-w-6xl mx-auto px-6">
 <motion.h2
 className="text-6xl font-light text-center mb-20 tracking-wide"
 initial={{ opacity: 0, y: -50 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 >
 Achievements
 </motion.h2>

 {/* Competitive Programming */}
 <motion.h3
 className="text-3xl font-medium mb-8 text-emerald-400"
 initial={{ opacity: 0, x: -50 }}
 whileInView={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6 }}
 >
 Competitive Programming
 </motion.h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
 {achievements.competitiveProgramming.map((achievement, index) => (
 <AchievementCard key={index} achievement={achievement} index={index} />
 ))}
 </div>

 {/* Hackathons */}
 <motion.h3
 className="text-3xl font-medium mb-8 text-emerald-400"
 initial={{ opacity: 0, x: -50 }}
 whileInView={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6 }}
 >
 Hackathons
 </motion.h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {achievements.hackathons.map((achievement, index) => (
 <AchievementCard key={index} achievement={achievement} index={index} />
 ))}
 </div>
 </div>
 </section>
 );
};

// Achievement Card
const AchievementCard = ({
 achievement,
 index,
}: {
 achievement: AchievementType;
 index: number;
}) => {
 const [isHovered, setIsHovered] = useState(false);

 return (
 <motion.div
 className="relative group p-6 border border-emerald-500/20 rounded-2xl backdrop-blur-lg shadow-lg overflow-hidden cursor-pointer"
 initial={{ opacity: 0, y: 50 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: index * 0.1 }}
 whileHover={{ scale: 1.05 }}
 onHoverStart={() => setIsHovered(true)}
 onHoverEnd={() => setIsHovered(false)}
 >
 <motion.div
 className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-0`}
 animate={{ opacity: isHovered ? 0.15 : 0, scale: isHovered ? 1 : 0.8 }}
 transition={{ duration: 0.3 }}
 />

 <AnimatePresence>
 {isHovered && (
 <motion.div
 className={`absolute inset-0 bg-gradient-to-r ${achievement.color} rounded-2xl`}
 initial={{ scale: 0, opacity: 0.3 }}
 animate={{ scale: 1.2, opacity: 0 }}
 exit={{ scale: 1.4, opacity: 0 }}
 transition={{ duration: 0.6 }}
 />
 )}
 </AnimatePresence>

 <div className="relative z-10 text-center">
 <motion.div
 className="inline-flex items-center justify-center mb-4"
 animate={{ rotate: isHovered ? 360 : 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className={`p-3 bg-gradient-to-r ${achievement.color} rounded-lg text-black`}>
 {achievement.icon}
 </div>
 </motion.div>

 <h3 className="text-lg font-medium mb-2 text-white">{achievement.title}</h3>

 <motion.p
 className="text-2xl font-light"
 animate={{
 backgroundImage: isHovered
 ? `linear-gradient(to right, ${achievement.color.split(" ")[1]}, ${achievement.color.split(" ")[3]})`
 : "none",
 backgroundClip: isHovered ? "text" : "unset",
 WebkitBackgroundClip: isHovered ? "text" : "unset",
 color: isHovered ? "transparent" : "white",
 }}
 transition={{ duration: 0.3 }}
 >
 {achievement.value}
 </motion.p>
 </div>
 </motion.div>
 );
};

// Skills Section
type SkillType = {
 name: string;
 icon: React.ReactNode;
 category: string;
};

const SkillsSection = ({ skills }: { skills: SkillType[] }) => {
 const categories = [...new Set(skills.map((skill) => skill.category))];

 return (
 <section className="min-h-screen py-24 relative z-10">
 <div className="max-w-6xl mx-auto px-6">
 <motion.h2
 className="text-6xl font-light text-center mb-20 tracking-wide"
 initial={{ opacity: 0, y: -50 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 >
 Technical Arsenal
 </motion.h2>

 {categories.map((category, categoryIndex) => (
 <div key={category} className="mb-12">
 <motion.h3
 className="text-3xl font-medium mb-6 text-emerald-400"
 initial={{ opacity: 0, x: -50 }}
 whileInView={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
 >
 {category}
 </motion.h3>

 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
 {skills
 .filter((skill) => skill.category === category)
 .map((skill, index) => (
 <SkillCard key={skill.name} skill={skill} index={index} />
 ))}
 </div>
 </div>
 ))}
 </div>
 </section>
 );
};

// Skill Card Component
const SkillCard = ({ skill, index }: { skill: SkillType; index: number }) => {
 return (
 <motion.div
 className="group p-4 border border-gray-700 rounded-lg backdrop-blur-lg hover:border-emerald-500/40 transition-colors relative overflow-hidden shadow-md"
 initial={{ opacity: 0, scale: 0.8 }}
 whileInView={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, delay: index * 0.05 }}
 whileHover={{ scale: 1.05 }}
 >
 <motion.div
 className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100"
 transition={{ duration: 0.3 }}
 />

 <div className="relative z-10 flex items-center space-x-3">
 <motion.div
 className="text-emerald-400"
 whileHover={{ rotate: 360 }}
 transition={{ duration: 0.5 }}
 >
 {skill.icon}
 </motion.div>
 <span className="text-gray-300 font-mono text-sm">{skill.name}</span>
 </div>
 </motion.div>
 );
};

// Education Section
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

// YouTube Section
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

// Contact Section
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
 href="https://linkedin.com/in/prashant-dubey"
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

export default Portfolio;