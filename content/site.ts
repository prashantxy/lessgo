export const profile = {
  name: "Prashant Dubey",
  alias: "keizer",
  shell: "keizer@laboratory",
  role: "full-stack & systems engineer",
  focus: ["graph-structured knowledge systems", "terminal-native tooling", "supply-chain security"],
  location: "India",
  status: "final-year B.E. · Chandigarh University · graduating June 2026",
  email: "pdubey1924@gmail.com",
  resume: "/Prashant-SDE-Resume.pdf",
  links: {
    github: "https://github.com/prashantxy",
    site: "https://prashantdubey.work",
    // TODO(prashant): confirm these two handles and re-add them to <Contact />
    linkedin: "",
    codeforces: "",
  },
};

export const about = [
  "I build systems where the structure is the point — knowledge graphs with tens of thousands of nodes, dependency trees you can trace a compromise through, terminal tools that stay out of the way. Most of my work sits between a database and an interface, making large, tangled data navigable.",
  "Currently a full-stack engineer at Chandigarh University's Lucknow campus, working on CMS architecture and a Neo4j knowledge graph over 20,000+ publications and patents. Before that I shipped a cross-platform desktop product at Notely on Electron and a microservices backend. On the side I write Rust CLIs and read a lot of lockfiles.",
];

export type Work = {
  org: string;
  role: string;
  period: string;
  where: string;
  kind: string;
  points: string[];
};

export const work: Work[] = [
  {
    org: "Chandigarh University, Lucknow",
    role: "Full-Stack Engineer",
    period: "Jan 2026 — present",
    where: "Lucknow, India",
    kind: "Higher-ed platform",
    points: [
      "Designed a Next.js CMS managing 12+ dynamic content sections over a complex relational model.",
      "Built a Neo4j knowledge graph modelling 20,000+ publications, patents and research relationships for discovery and visualisation.",
      "Engineered Canvas-based graph views rendering 3,000+ interconnected nodes.",
      "Added Redis-backed caching across large datasets; deployed cloud-native on AWS with S3 + CloudFront.",
    ],
  },
  {
    org: "Notely",
    role: "Full-Stack Product Engineer",
    period: "Sept 2025 — Nov 2025",
    where: "Remote",
    kind: "Stealth startup",
    points: [
      "Built cross-platform desktop infrastructure on Electron for Windows, macOS and Linux.",
      "Designed a microservices architecture for modular feature development and clean service communication.",
      "Wrote secure IPC and persistent state sync between renderer and background processes.",
      "Implemented collaborative editing with offline-first sync; tuned rendering and startup performance.",
    ],
  },
  {
    org: "Warren AI",
    role: "Full-Stack Developer Intern",
    period: "May 2025 — July 2025",
    where: "Remote",
    kind: "Stealth startup",
    points: [
      "Cut LLM file-upload time ~40% with Node.js worker threads.",
      "Built vector-DB retrieval on Chroma; orchestrated AI workflows with n8n and chunk indexing.",
    ],
  },
  {
    org: "ARL",
    role: "Full-Stack App Developer",
    period: "Oct 2024 — Jan 2025",
    where: "Remote",
    kind: "Logistics startup",
    points: [
      "Redesigned a learning platform's UI; +15% engagement, −20% load time with Tailwind.",
      "Shipped real-time quizzes over WebSockets for 1,000+ concurrent users.",
    ],
  },
];

export type Project = {
  n: string;
  name: string;
  tag: string;
  blurb: string;
  stack: string[];
  year: string;
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    n: "01",
    name: "Terrek",
    tag: "Rust CLI / TUI",
    blurb:
      "A terminal-native workflow engine. Pluggable abstraction over OpenAI, Gemini, Claude and Ollama, with BYOK key management and automatic provider detection — all inside one TUI.",
    stack: ["Rust", "TUI", "AI Systems", "CLI"],
    year: "2026",
    links: [{ label: "source", href: "https://github.com/prashantxy/Terrek" }],
  },
  {
    n: "02",
    name: "ChainTrace",
    tag: "Supply-chain security",
    blurb:
      "A graph platform modelling npm and PyPI packages, versions and dependencies in HydraDB / OpenCypher. Blast-radius analysis, attack-path and typosquat detection across transitive chains.",
    stack: ["Bun", "TypeScript", "HydraDB", "OpenCypher", "Next.js"],
    year: "2026",
    links: [
      { label: "dashboard", href: "https://chaintrace-docs-dash.vercel.app/" },
      { label: "source", href: "https://github.com/prashantxy/Hack_HydraDb" },
    ],
  },
  {
    n: "03",
    name: "Vercel-in-a-box",
    tag: "Systems design",
    blurb:
      "A from-scratch build of what a deploy platform does under the hood: upload queue, build workers, object storage and a request router, wired with Cloudflare Workers, S3 and Redis.",
    stack: ["TypeScript", "Cloudflare Workers", "AWS S3", "Redis"],
    year: "2025",
    links: [{ label: "source", href: "https://github.com/prashantxy/My_Own_VM_Server" }],
  },
  {
    n: "04",
    name: "CollabDrawShare",
    tag: "Real-time canvas",
    blurb:
      "A shared drawing surface with auth, live cursors and persistence, built as a Turborepo monorepo over WebSockets — front end, back end and shared packages in one graph.",
    stack: ["TypeScript", "Turborepo", "Canvas", "WebSockets", "Next.js"],
    year: "2025",
    links: [{ label: "source", href: "https://github.com/prashantxy" }],
  },
  {
    n: "05",
    name: "Eco-Verse",
    tag: "AI dashboard",
    blurb:
      "An analytics dashboard over 500+ sustainability initiatives with on-chain rewards and ML pipelines feeding verified-activity scoring.",
    stack: ["Next.js", "ML", "Smart Contracts"],
    year: "2024",
    links: [{ label: "live", href: "https://eco-versee.vercel.app/" }],
  },
  {
    n: "06",
    name: "NASA Space Apps",
    tag: "Winner · Mohali Chapter",
    blurb:
      "A dashboard for exploring NASA mission data with real-time updates and visualisations. Won the Mohali chapter of the global NASA Space Apps Challenge.",
    stack: ["React", "Node.js", "MongoDB", "Firebase"],
    year: "2024",
    links: [{ label: "live", href: "https://nasa-space-app-2024-ten.vercel.app/" }],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C++", "Rust", "Python", "TypeScript", "JavaScript", "Go"] },
  {
    group: "Frameworks",
    items: ["React", "Next.js", "Express", "Prisma", "Tailwind", "Three.js", "Electron", "GSAP"],
  },
  {
    group: "Data & graph",
    items: ["PostgreSQL", "Neo4j", "Redis", "MongoDB", "ChromaDB", "NeonDB", "OpenCypher"],
  },
  {
    group: "Backend & systems",
    items: ["Node.js", "gRPC", "WebSockets", "WebRTC", "Microservices", "Event-driven", "RPC"],
  },
  { group: "AI", items: ["OpenAI API", "RAG", "Agent orchestration", "Semantic search", "Fine-tuning"] },
  {
    group: "Cloud & ops",
    items: ["AWS", "Docker", "Kubernetes", "CloudFront", "S3", "GitHub Actions", "Nginx", "Cloudflare"],
  },
];

export const achievements: { label: string; value: string }[] = [
  { label: "Algorithmic problems solved", value: "1,000+" },
  { label: "Codeforces", value: "Expert · max 1628" },
  { label: "CodeChef", value: "4★ · max 1860" },
  { label: "Hackathons won", value: "5 · national & international" },
  { label: "NASA Space Apps Challenge", value: "Winner · Mohali Chapter" },
  { label: "DTU Cryptic Hunt", value: "Winner" },
];
