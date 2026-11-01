/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://www.remotion.dev/docs/config
 */

import path from "path";
import {Config} from "@remotion/cli/config";
import {enableTailwind} from "@remotion/tailwind";

/** Config may execute from a compiled path; cwd is the Remotion project. */
const filmRoot = process.cwd();
const honzaRoot = path.resolve(filmRoot, "../..");
const honzaSrc = path.join(honzaRoot, "src");
const shims = path.join(filmRoot, "src/shims");

const extraAlias: Record<string, string> = {
  "@": honzaSrc,
  "@/": honzaSrc + "/",
  "next/image": path.join(shims, "next-image.tsx"),
  "next/link": path.join(shims, "next-link.tsx"),
  "next/navigation": path.join(shims, "next-navigation.ts"),
  "next/headers": path.join(shims, "next-headers.ts"),
};

function applyHonzaResolve<T extends {resolve?: {alias?: unknown; modules?: string[]}}>(
  currentConfiguration: T,
): T {
  const withTw = enableTailwind(currentConfiguration, {
    configLocation: path.join(filmRoot, "tailwind.config.js"),
  }) as T;
  withTw.resolve = withTw.resolve ?? {};
  const existing = withTw.resolve.alias;
  if (Array.isArray(existing)) {
    const names = new Set(Object.keys(extraAlias));
    withTw.resolve.alias = [
      ...Object.entries(extraAlias).map(([name, alias]) => ({name, alias})),
      ...existing.filter((entry: {name?: string}) => !names.has(String(entry.name))),
    ];
  } else {
    withTw.resolve.alias = {
      ...(typeof existing === "object" && existing ? existing : {}),
      ...extraAlias,
    };
  }
  withTw.resolve.modules = [
    path.join(filmRoot, "node_modules"),
    path.join(honzaRoot, "node_modules"),
    "node_modules",
  ];
  return withTw;
}

Config.setRspack(false);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.setPublicDir(path.join(filmRoot, "public"));

Config.overrideWebpackConfig((currentConfiguration) => applyHonzaResolve(currentConfiguration));
Config.overrideBundlerConfig((currentConfiguration) => applyHonzaResolve(currentConfiguration));
