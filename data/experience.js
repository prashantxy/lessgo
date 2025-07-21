import { Briefcase, Coffee } from "lucide-react";
import { ExperienceType } from "../components/ui/types";

export const experience = [
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
    icon: (props) => <Briefcase className={props.className} />,
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
    icon: (props) => <Coffee className={props.className} />,
  },
];