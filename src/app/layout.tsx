import type { Metadata, Viewport } from "next";
import { Doto, Inter } from "next/font/google";
import { cookies } from "next/headers";

import { DesignRoot } from "@/components/design/DesignRoot";
import { DesignScript } from "@/components/design/DesignScript";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { LocaleScript } from "@/components/i18n/LocaleScript";
import { AppShell } from "@/components/layout/AppShell";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { parseUiLocale, UI_LOCALE_COOKIE } from "@/lib/i18n/locale-cookie";

import "./globals.css";

const doto = Doto({
  subsets: ["latin", "latin-ext"],
  variable: "--font-doto",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const FONT_VARS = [doto.variable, inter.variable].join(" ");

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = parseUiLocale(cookieStore.get(UI_LOCALE_COOKIE)?.value);

  return (
    <html lang={locale} className={FONT_VARS} suppressHydrationWarning>
      <body className="font-sans">
        <DesignScript />
        <LocaleScript />
        <DesignRoot />
        <LocaleProvider locale={locale}>
          <AppShell>{children}</AppShell>
          <InstallPrompt />
        </LocaleProvider>
      </body>
    </html>
  );
}
