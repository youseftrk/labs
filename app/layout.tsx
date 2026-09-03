import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { AppearanceSync } from "@/components/AppearanceSync";
import { CoolerScrollbar } from "@/components/CoolerScrollbar/Scrollbar";
import { DiaAurora } from "@/components/DiaAurora";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APPEARANCE_BOOT } from "@/lib/appearance";
import "./globals.css";

const matter = localFont({
  src: [
    {
      path: "../fonts/Matter-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Matter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-matter",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yousef Turk",
  description:
    "Grade 12 in Abu Dhabi. AI for science, and startups.",
  openGraph: {
    title: "Yousef Turk",
    description:
      "Grade 12 in Abu Dhabi. AI for science, and startups.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT }} />
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.classList.add("js")',
          }}
        />
      </head>
      <body className={`${matter.variable} ${geistMono.variable}`}>
        <a href="#content" className="skip">
          Skip to content
        </a>
        <ThemeToggle />
        <AppearanceSync />
        <SmoothScroll />
        <CoolerScrollbar />
        <DiaAurora />
        <div id="content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
