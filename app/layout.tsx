import type { Metadata, Viewport } from "next";
import { EB_Garamond, IM_Fell_English } from "next/font/google";
import { SITE, profile } from "@/content/site";
import "./globals.css";

/* The book is a 17th-century binding, so the page is set like one: Fell's
   English for display, Garamond for reading. next/font writes its own
   variables (--font-fell, --font-garamond); globals.css wraps them in the
   --font-hand / --font-sans every rule uses, with fallbacks. They must not
   share a name — a custom property defined as var() of itself on the same
   element is a cycle, computes to nothing, and every rule falls through to
   the system sans. */
const hand = IM_Fell_English({
  variable: "--font-fell",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Prashant Dubey — the field notebook",
    template: "%s — Prashant Dubey",
  },
  description:
    "The working notebook of Prashant Dubey — full-stack & systems engineer. Graph-structured knowledge systems, terminal-native tooling, and software supply-chain security.",
  keywords: [
    "Prashant Dubey",
    "Keizer",
    "full-stack engineer",
    "systems engineer",
    "graph databases",
    "Rust",
    "Neo4j",
    "supply chain security",
  ],
  authors: [{ name: "Prashant Dubey" }],
  openGraph: {
    type: "website",
    url: SITE,
    locale: "en_US",
    title: "Prashant Dubey — the field notebook",
    description:
      "Graph-structured knowledge systems, terminal-native tooling, and supply-chain security.",
    siteName: "Prashant Dubey",
  },
  twitter: {
    card: "summary_large_image",
    /* TODO(prashant): add `creator: "@yourhandle"` once the X handle is confirmed —
       it is what puts your name on the card byline. */
    title: "Prashant Dubey — the field notebook",
    description:
      "Graph-structured knowledge systems, terminal-native tooling, and supply-chain security.",
  },
  icons: { icon: "/favicon.ico" },
  /* Canonicals, and the feed as a real <link rel="alternate"> so readers
     discover it from the page rather than from a URL someone guessed. */
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Prashant Dubey — the field notebook" }],
    },
  },
  creator: profile.name,
  publisher: profile.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

/* the browser chrome takes the desk's colour rather than a default white bar */
export const viewport: Viewport = {
  themeColor: "#0b0906",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hand.variable} ${sans.variable}`}>
      <body className="ruled">{children}</body>
    </html>
  );
}
