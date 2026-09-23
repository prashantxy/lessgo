/**
 * The cabinet of likenesses — the photo wall at /gallery, and the prints hung
 * on the study wall in the 3D scene.
 *
 * Every picture here is tied to something of Prashant's: a place in the
 * story, or the work itself. Each carries `links` back to that work (a repo, a
 * post, the résumé) and a `credit` for where the image came from. Photographs
 * of places are openly licensed from Wikimedia Commons and must keep their
 * attribution; the project images are from Prashant's own repositories.
 *
 * To add one: drop the source into assets/gallery/, run
 * `node scripts/make-gallery.mjs`, and add an entry here with the dimensions
 * it prints. `id` is the file's base name.
 */

export type GalleryLink = { label: string; href: string };

export type GalleryItem = {
  id: string;
  /** the brass plate under the frame */
  title: string;
  /** a short line under the title: where, when */
  place: string;
  year: string;
  /** what this has to do with him — shown when the print is opened */
  story: string;
  links: GalleryLink[];
  credit: { by: string; license: string; href: string };
  /** of the baked `<id>.webp` */
  width: number;
  height: number;
  /** how big it hangs on the wall: the salon hang mixes sizes */
  hang: "grand" | "wide" | "tall" | "small";
  /** which of these also hang on the study wall in the 3D scene */
  onWall?: "left" | "right-high" | "right-low";
};

export const gallery: GalleryItem[] = [
  {
    id: "lucknow-rumi-darwaza",
    title: "The Rumi Darwaza, Lucknow",
    place: "Lucknow · albumen print",
    year: "c. 1860s",
    story:
      "Lucknow is where the work is now: full-stack engineering at Chandigarh University's Lucknow campus since January 2026 — a Next.js CMS and a Neo4j knowledge graph over 20,000+ publications and patents.",
    links: [
      { label: "modelling 20k publications in Neo4j", href: "/writing/modelling-20k-publications-in-neo4j" },
      { label: "rendering 3,000 nodes on a canvas", href: "/writing/rendering-3000-nodes-on-a-canvas" },
    ],
    credit: {
      by: "Unknown photographer, via The Metropolitan Museum of Art",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:-Rumi_Darwaza,_Lucknow,_India-_MET_DP72038.jpg",
    },
    width: 1600,
    height: 1176,
    hang: "grand",
    onWall: "right-high",
  },
  {
    id: "terrek",
    title: "Terrek, drawn out",
    place: "Rust · Ratatui · the workshop",
    year: "2026",
    story:
      "The working diagram for Terrek, a terminal-native workflow engine: one pluggable abstraction over OpenAI, Gemini, Claude and Ollama, with bring-your-own-key detection and a multi-pane TUI.",
    links: [
      { label: "prashantxy/Terrek", href: "https://github.com/prashantxy/Terrek" },
      { label: "one TUI, four model providers", href: "/writing/one-tui-four-model-providers" },
    ],
    credit: { by: "Prashant Dubey", license: "from the Terrek repository", href: "https://github.com/prashantxy/Terrek" },
    width: 1028,
    height: 1600,
    hang: "tall",
  },
  {
    id: "chaintrace",
    title: "The blast radius",
    place: "ChainTrace · supply-chain security",
    year: "2026",
    story:
      "ChainTrace maps npm and PyPI packages, versions and maintainers into a graph, then answers the incident question: a package just turned malicious — which services are hit, how badly, and through what path.",
    links: [
      { label: "prashantxy/Hack_HydraDb", href: "https://github.com/prashantxy/Hack_HydraDb" },
      { label: "the dashboard", href: "https://chaintrace-docs-dash.vercel.app/" },
      { label: "the blast radius of a compromised package", href: "/writing/blast-radius-of-a-compromised-package" },
    ],
    credit: { by: "Prashant Dubey", license: "from the ChainTrace repository", href: "https://github.com/prashantxy/Hack_HydraDb" },
    width: 760,
    height: 760,
    hang: "small",
    onWall: "right-low",
  },
  {
    id: "space-apps-ship",
    title: "A ship for Space Apps",
    place: "NASA Space Apps Challenge · Mohali chapter",
    year: "2024",
    story:
      "Artwork from the Space Apps 2024 build. The Mohali chapter of the NASA Space Apps Challenge was one of five hackathon wins.",
    links: [{ label: "prashantxy/Nasa-space-app-2024", href: "https://github.com/prashantxy/Nasa-space-app-2024" }],
    credit: {
      by: "Prashant Dubey & team",
      license: "from the Space Apps repository",
      href: "https://github.com/prashantxy/Nasa-space-app-2024",
    },
    width: 1024,
    height: 1024,
    hang: "small",
  },
  {
    id: "dtu-gate",
    title: "The gate at DTU",
    place: "Delhi Technological University",
    year: "Cryptic Hunt",
    story: "Delhi Technological University, home of the Cryptic Hunt — won, and counted among the five hackathon wins.",
    links: [{ label: "prashantxy/cryptic-hunt", href: "https://github.com/prashantxy/cryptic-hunt" }],
    credit: {
      by: "Maskaravivek",
      license: "CC BY 3.0",
      href: "https://commons.wikimedia.org/wiki/File:Entrance_Gate_of_Delhi_Technological_University.jpeg",
    },
    width: 1600,
    height: 1200,
    hang: "wide",
  },
  {
    id: "space-apps-earth",
    title: "The whole Earth",
    place: "NASA Space Apps Challenge",
    year: "2024",
    story:
      "The globe from the same Space Apps build — the project that took the Mohali chapter.",
    links: [{ label: "prashantxy/Nasa-space-app-2024", href: "https://github.com/prashantxy/Nasa-space-app-2024" }],
    credit: {
      by: "Prashant Dubey & team",
      license: "from the Space Apps repository",
      href: "https://github.com/prashantxy/Nasa-space-app-2024",
    },
    width: 1150,
    height: 1137,
    hang: "small",
  },
];
