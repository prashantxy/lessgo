import type { Metadata } from "next";
import { EB_Garamond, IM_Fell_English } from "next/font/google";
import "./globals.css";

/* The book is a 17th-century binding, so the page is set like one: Fell's
   English for display, Garamond for reading. The CSS variables keep their old
   names so every existing rule inherits the new voice. */
const hand = IM_Fell_English({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = EB_Garamond({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://prashantdubey.work";

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
    title: "Prashant Dubey — the field notebook",
    description:
      "Graph-structured knowledge systems, terminal-native tooling, and supply-chain security.",
    siteName: "Prashant Dubey",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prashant Dubey — the field notebook",
    description:
      "Graph-structured knowledge systems, terminal-native tooling, and supply-chain security.",
  },
  icons: { icon: "/favicon.ico" },
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
