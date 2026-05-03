import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Scientist — From question to insight in seconds",
  description:
    "An AI research partner that turns raw data and a question into hypotheses, charts, and conclusions in seconds. Built with Groq, Next.js, and the scientific method.",
  applicationName: "AI Scientist",
  keywords: [
    "AI Scientist",
    "data analysis",
    "Groq",
    "LLM",
    "research",
    "hypothesis",
    "Next.js",
  ],
  authors: [{ name: "AI Scientist" }],
  openGraph: {
    title: "AI Scientist",
    description:
      "From question to insight in seconds. Hypotheses, charts, conclusions — autonomously.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
