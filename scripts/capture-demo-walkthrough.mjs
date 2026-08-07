#!/usr/bin/env node
/**
 * Record a short walkthrough: Chat → Call → Settings at 390px.
 * Usage: node scripts/capture-demo-walkthrough.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

import { authenticateForDemo } from "./demo-auth.mjs";

const OUT = "docs/demo/ux-chat-call-settings";
const BASE = "http://localhost:3000";

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
});
const page = await context.newPage();

const authed = await authenticateForDemo(page);
if (!authed) {
  console.warn("Supabase not configured — seeding localStorage only (may redirect to login)");
  await page.goto(`${BASE}/onboarding`);
  await page.evaluate(() => {
    localStorage.setItem(
      "honza-settings",
      JSON.stringify({
        state: {
          onboardingComplete: true,
          level: "A2",
          model: "openai/gpt-4o-mini",
          topics: ["daily", "food"],
          contextChunks: [],
          lastSynced: 0,
        },
        version: 0,
      }),
    );
  });
}

for (const route of ["chat", "call", "settings"]) {
  await page.goto(`${BASE}/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
}

await context.close();
await browser.close();

const videos = fs.readdirSync(OUT).filter((f) => f.endsWith(".webm") && f !== "walkthrough.webm");
if (videos.length > 0) {
  const src = path.join(OUT, videos[0]);
  const dest = path.join(OUT, "walkthrough.webm");
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  fs.renameSync(src, dest);
  console.log(`saved ${dest}`);
} else {
  console.log("no video recorded");
}
