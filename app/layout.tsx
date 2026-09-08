import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://prashantdubey.work";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Prashant Dubey — full-stack & systems engineer",
    template: "%s — Prashant Dubey",
  },
  description:
    "Prashant Dubey builds graph-structured knowledge systems, terminal-native developer tooling, and software supply-chain security. Final-year B.E., Chandigarh University.",
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
    title: "Prashant Dubey — full-stack & systems engineer",
    description:
      "Graph-structured knowledge systems, terminal-native tooling, and supply-chain security.",
    siteName: "Prashant Dubey",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prashant Dubey — full-stack & systems engineer",
    description:
      "Graph-structured knowledge systems, terminal-native tooling, and supply-chain security.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
