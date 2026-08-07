#!/usr/bin/env node
/**
 * Capture demo screenshots for ux/chat-call-settings at 390px.
 * Usage: node scripts/capture-demo-screens.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

import { authenticateForDemo } from "./demo-auth.mjs";

const OUT = "docs/demo/ux-chat-call-settings";
const BASE = "http://localhost:3000";

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

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
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(OUT, `${route}-390.png`),
    fullPage: false,
  });
  console.log(`saved ${route}-390.png`);
}

await browser.close();
console.log("done");
