import { JSX, ReactNode } from "react";
import { ElementType } from "react";
import { RefObject, SVGProps, ComponentType } from "react";

// Reusable icon type
export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type ExperienceType = {
  id: number;
  company: string;
  role: string;
  period: string;
  location: string;
  type: string;
  achievements: string[];
  icon?: (props: { className?: string }) => JSX.Element;
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
  icon: ElementType<SVGProps<SVGSVGElement>>;
  link: string;
};

export type AchievementType = {
  title: string;
  value: string;
  icon: IconType;
  color: string;
};

export type SkillType = {
  name: string;
  icon: ReactNode;
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