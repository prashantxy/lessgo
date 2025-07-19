"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, MotionValue } from "framer-motion";
import {
  Code2, Database, Cloud, Cpu, Globe, Zap,
  Trophy, Award, Star, Target, Github, Linkedin,
  Mail, ExternalLink, Calendar, MapPin, GraduationCap,
  Briefcase, Coffee, Rocket, BookOpen, Brain, Palette,
} from "lucide-react";
import Navbar from "../components/ui/navbar";
import Loader from "../components/ui/loader";
import ParticleBackground from "../components/ui/ParticleBackground";
import HeroSection from "../components/ui/HeroSection";
import ExperienceSection from "../components/ui/ExperienceSection";
import ProjectsSection from "../components/ui/ProjectSection";
import AchievementsSection from "../components/ui/AcheivementsSection";
import SkillsSection from "../components/ui/SkillsSection";
import EducationSection from "../components/ui/EducationSection";
import YouTubeSection from "../components/ui/YoutubeSection";
import ContactSection from "../components/ui/ContactSection";
import { ThemeProvider } from "../components/ThemeContext";
import { ExperienceType, ProjectType, AchievementType, SkillType, RefsType } from "../components/ui/types";

export default function Home() {
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

  const [scrollYProgress, setScrollYProgress] = useState<MotionValue<number> | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
      });
      setScrollYProgress(scrollYProgress);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const projects: ProjectType[] = [
    {
      id: 1,
      title: "NEAW Demo",
      subtitle: "Decentralized NFT Marketplace",
      description: "Architected a fully decentralized NFT marketplace using IPFS for data persistence and Solana for low-cost transactions. Reduced fees by 70% and onboarded 200+ creators in the first month.",
      tech: ["Next.js", "Supabase", "Solana", "IPFS", "Tailwind CSS"],
      metrics: "200+ creators, 1K+ transactions",
      year: "Aug-Sep 2024",
      status: "Live",
      icon: Globe,
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
      icon: Zap,
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
      icon: Cpu,
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
      icon: BookOpen,
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
      icon: Palette,
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
      icon: Rocket,
      link: "https://drone-tech-app.vercel.app/",
    },
  ];

  const experience: ExperienceType[] = [
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
      icon: (props) => <Briefcase {...props} />,
    },
    {
      id: 2,
      company: "ARL",
      role: "Full-stack App developer",
      period: "Oct 2024 – Jan 2025",
      location: "Remote",
      type: "Logistic Startup",
      achievements: [
        "Redesigned UI/UX for learning platform, increasing user engagement by 15%.",
        "Implemented responsive designs with Tailwind CSS, reducing load times by 20%.",
        "Integrated real-time quiz features with WebSocket, serving 1,000+ concurrent users.",
      ],
      icon: (props) => <Coffee {...props} />,
    },
  ];

  const achievements: { competitiveProgramming: AchievementType[]; hackathons: AchievementType[] } = {
    competitiveProgramming: [
      {
        title: "Codeforces Expert",
        value: "max(1628)",
        icon: Code2,
        color: "from-blue-400 to-cyan-300",
      },
      {
        title: "CodeChef 4★",
        value: "max(1860)",
        icon: Star,
        color: "from-yellow-400 to-orange-300",
      },
    ],
    hackathons: [
      {
        title: "NASA Space Apps",
        value: "Winner",
        icon: Rocket,
        color: "from-purple-400 to-pink-300",
      },
      {
        title: "National Hackathons",
        value: "5x 1st Place",
        icon: Trophy,
        color: "from-emerald-400 to-teal-300",
      },
      {
        title: "Cryptic Hunt",
        value: "National Winner",
        icon: Target,
        color: "from-red-400 to-rose-300",
      },
      {
        title: "Code for Earth",
        value: "1st Place",
        icon: Award,
        color: "from-green-400 to-emerald-300",
      },
    ],
  };

  const skills: SkillType[] = [
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

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const refs: RefsType = {
    heroRef,
    experienceRef,
    projectsRef,
    achievementsRef,
    skillsRef,
    educationRef,
    youtubeRef,
    contactRef,
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <ThemeProvider>
      <div ref={containerRef} className="bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden relative">
        <Navbar
          scrollToSection={scrollToSection}
          refs={refs}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        {scrollYProgress && typeof scrollYProgress.get === "function" && (
          <ParticleBackground scrollYProgress={scrollYProgress} />
        )}
        <section ref={heroRef}>
          <HeroSection />
        </section>
        <section ref={experienceRef}>
          <ExperienceSection experience={experience} />
        </section>
        <section ref={projectsRef}>
          <ProjectsSection projects={projects} />
        </section>
        <section ref={achievementsRef}>
          <AchievementsSection achievements={achievements} />
        </section>
        <section ref={skillsRef}>
          <SkillsSection skills={skills} />
        </section>
        <section ref={educationRef}>
          <EducationSection />
        </section>
        <section ref={youtubeRef}>
          <YouTubeSection />
        </section>
        <section ref={contactRef}>
          <ContactSection />
        </section>
      </div>
    </ThemeProvider>
  );
}