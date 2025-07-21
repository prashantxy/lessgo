import { Code2, Star, Rocket, Trophy, Target, Award } from "lucide-react";
import { AchievementType } from "../components/ui/types";

export const achievements: { competitiveProgramming: AchievementType[]; hackathons: AchievementType[] } = {
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