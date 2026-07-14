/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  // New service worker activates immediately (paired with clientsClaim by next-pwa).
  skipWaiting: true,
  // PWA/service worker is disabled in dev (next-pwa plugin behavior).
  disable: process.env.NODE_ENV === "development",
  // App Router emits manifests Workbox shouldn't precache (they 404 / churn).
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  // Warm the cache as the user navigates the App Router client-side.
  cacheOnFrontEndNav: true,
  // Refresh once connectivity returns so users don't sit on a stale offline view.
  reloadOnOnline: true,
  // `/` is auth-gated and can 307 → /signin; don't special-case-cache a redirecting start URL.
  dynamicStartUrl: false,
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
