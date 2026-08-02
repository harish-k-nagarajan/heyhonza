import type { Metadata, Viewport } from "next";
import {
  Doto,
  IBM_Plex_Sans,
  JetBrains_Mono,
  Share_Tech_Mono,
} from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistPixelSquare } from "geist/font/pixel";

import { DesignRoot } from "@/components/design/DesignRoot";
import { DesignScript } from "@/components/design/DesignScript";
import { AppShell } from "@/components/layout/AppShell";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

const doto = Doto({
  subsets: ["latin", "latin-ext"],
  variable: "--font-doto",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const FONT_VARS = [
  shareTechMono.variable,
  GeistSans.variable,
  GeistPixelSquare.variable,
  doto.variable,
  jetbrainsMono.variable,
  ibmPlexSans.variable,
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
    <html lang="en" className={FONT_VARS} suppressHydrationWarning>
      <body className="font-sans">
        <DesignScript />
        <DesignRoot />
        <AppShell>{children}</AppShell>
        <InstallPrompt />
      </body>
    </html>
  );
}
