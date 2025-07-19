import { RefObject } from "react";

export type ExperienceType = {
  id: number;
  company: string;
  role: string;
  period: string;
  location: string;
  type: string;
  achievements: string[];
  icon: React.ReactNode;
};

export type ProjectType = {
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

export type AchievementType = {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
};

export type SkillType = {
  name: string;
  icon: React.ReactNode;
  category: string;
};

export type RefsType = {
  heroRef: RefObject<HTMLElement | null>;
  experienceRef: RefObject<HTMLElement | null>;
  projectsRef: RefObject<HTMLElement | null>;
  achievementsRef: RefObject<HTMLElement | null>;
  skillsRef: RefObject<HTMLElement | null>;
  educationRef: RefObject<HTMLElement | null>;
  youtubeRef: RefObject<HTMLElement | null>;
  contactRef: RefObject<HTMLElement | null>;
};