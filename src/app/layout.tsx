import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelLine,
  GeistPixelTriangle,
} from "geist/font/pixel";

import { DesignRoot } from "@/components/design/DesignRoot";
import { DesignScript } from "@/components/design/DesignScript";
import { AppShell } from "@/components/layout/AppShell";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

import "./globals.css";

// Classic's face. Latin-subset only — the deliberate F0 bug Classic keeps.
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

// The Design Lab font axis. Geist Sans/Mono cover the full Czech diacritic set
// (fixes F0 for Hmat body copy); the five Pixel faces share the orb's DNA and
// are display-only by default. Each exposes a `--font-…` CSS variable that the
// `--f-*` stacks in globals.css chain into.
const FONT_VARS = [
  shareTechMono.variable,
  GeistSans.variable,
  GeistMono.variable,
  GeistPixelSquare.variable,
  GeistPixelGrid.variable,
  GeistPixelCircle.variable,
  GeistPixelLine.variable,
  GeistPixelTriangle.variable,
].join(" ");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "Honza",
  description: "Learn Czech with Honza — chat-first practice.",
  applicationName: "Honza",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Honza",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={FONT_VARS}>
      <body className="font-sans">
        {/* First child of <body>: paints the saved design onto <html> before
            any content renders, so a non-Classic design never flashes Classic. */}
        <DesignScript />
        <DesignRoot />
        <AppShell>{children}</AppShell>
        <InstallPrompt />
      </body>
    </html>
  );
}
