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

export const now = [
  "Building a Neo4j knowledge graph over 20,000+ publications and patents at CU Lucknow.",
  "Writing Terrek — a Rust TUI workflow engine — on the side.",
  "Reading a lot of lockfiles for ChainTrace.",
  "Grinding Codeforces back toward Candidate Master.",
];

export const highlights = [
  "final year · Chandigarh University · 2026",
  "5× national & international hackathon winner",
  "Codeforces Expert · max 1628",
  "NASA Space Apps — Mohali chapter winner",
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
  note?: string;
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    n: "01",
    name: "Terrek",
    tag: "Rust CLI / TUI",
    blurb:
      "A terminal-native workflow engine. One pluggable abstraction over OpenAI, Gemini, Claude and Ollama with bring-your-own-key auto-detection, a multi-pane Ratatui interface, and an extensible command system for scripting AI tasks.",
    stack: ["Rust", "Ratatui", "TUI", "AI Systems"],
    year: "2026",
    links: [{ label: "source", href: "https://github.com/prashantxy/Terrek" }],
  },
  {
    n: "02",
    name: "ChainTrace",
    tag: "Supply-chain security",
    blurb:
      "Maps npm and PyPI packages, versions and maintainers into a graph (HydraDB / OpenCypher), then answers the incident question: a package just turned malicious — which of my services are hit, how badly, and through what path. Blast-radius BFS, attack-path search, typosquat detection.",
    stack: ["Bun", "TypeScript", "HydraDB", "OpenCypher", "Next.js"],
    year: "2026",
    links: [
      { label: "dashboard", href: "https://chaintrace-docs-dash.vercel.app/" },
      { label: "source", href: "https://github.com/prashantxy/Hack_HydraDb" },
    ],
  },
  {
    n: "03",
    name: "localhost6767",
    tag: "Desktop-context AI assistant",
    blurb:
      "The backend for a desktop overlay assistant: it watches the active window and clipboard, collects and ranks on-screen context, resolves intent, and answers through OpenAI with a persistent memory layer — streamed over WebSockets.",
    stack: ["Express", "WebSockets", "OpenAI", "Supermemory", "Bun"],
    year: "2025",
    links: [{ label: "source", href: "https://github.com/prashantxy/localhost6767_hack" }],
  },
  {
    n: "04",
    name: "FlowGuard",
    tag: "Real-time crowd-flow CV",
    blurb:
      "Turns CCTV video into crowd-flow intelligence — density, direction, congestion and counter-flow anomalies — to flag crowd-crush conditions before they build, instead of just counting heads. Operator console over a computer-vision pipeline.",
    stack: ["TypeScript", "Computer Vision", "Next.js"],
    year: "2026",
    note: "Desktop view only",
    links: [
      { label: "live", href: "https://crowdflowguard.vercel.app/" },
      { label: "source", href: "https://github.com/prashantxy/PayTM-Hack" },
    ],
  },
  {
    n: "05",
    name: "P2P Video Conferencing",
    tag: "WebRTC / STUN",
    blurb:
      "A video-conferencing app built to learn WebRTC from the wire up: a signaling server, STUN traversal, and direct peer connections carrying the media — no SFU or media server in the path.",
    stack: ["TypeScript", "WebRTC", "STUN", "WebSockets"],
    year: "2025",
    links: [
      { label: "demo", href: "https://webrtc-yitr.onrender.com/" },
      { label: "source", href: "https://github.com/prashantxy/VideoConferencing" },
    ],
  },
  {
    n: "06",
    name: "Vercel-in-a-box",
    tag: "Deploy platform, from scratch",
    blurb:
      "What a deploy platform does under the hood, rebuilt as three services — an upload service, a build/deploy worker, and a request handler that routes each request to the right build — wired with Redis, AWS and S3.",
    stack: ["TypeScript", "Redis", "AWS", "S3"],
    year: "2025",
    links: [{ label: "source", href: "https://github.com/prashantxy/My_Own_VM_Server" }],
  },
  {
    n: "07",
    name: "CollabDrawShare",
    tag: "Real-time shared canvas",
    blurb:
      "A Turborepo monorepo: authenticated real-time drawing over WebSockets with Postgres/Prisma persistence — front end, back end and shared packages in one graph, containerised with Docker.",
    stack: ["TypeScript", "Turborepo", "Canvas", "WebSockets", "Prisma"],
    year: "2025",
    links: [{ label: "source", href: "https://github.com/prashantxy/collabdrawshare" }],
  },
  {
    n: "08",
    name: "Thirteenello",
    tag: "Real-time issue board",
    blurb:
      "A collaborative kanban board where every client stays in sync through a single WebSocket server broadcasting issue moves. Built on Bun, no database — the board state lives in memory.",
    stack: ["Bun", "TypeScript", "WebSockets"],
    year: "2025",
    links: [{ label: "source", href: "https://github.com/prashantxy/Thirteenello" }],
  },
  {
    n: "09",
    name: "NEAW",
    tag: "Decentralized NFT marketplace",
    blurb:
      "A fully on-chain NFT marketplace on Solana with IPFS/Pinata storage, Ceramic profiles and multi-wallet support — minting, listing and trading with no central backend holding the data.",
    stack: ["Next.js", "Solana web3.js", "IPFS", "Ceramic", "Supabase"],
    year: "2025",
    links: [
      { label: "live", href: "https://neaw.vercel.app" },
      { label: "source", href: "https://github.com/prashantxy/NEAW" },
    ],
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
