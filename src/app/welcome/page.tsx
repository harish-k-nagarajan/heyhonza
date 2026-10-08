import type { Metadata } from "next";

import { WelcomeScreen } from "@/components/screens/welcome/WelcomeScreen";
import { getGithubStarCount } from "@/lib/server/github-stars";
import { isShowcaseMode } from "@/lib/site-mode";

export const metadata: Metadata = {
  title: "Honza · learn Czech by texting a friend",
  description:
    "Honza is a Czech tutor who opens the conversation. Short daily chats in real Czech, gently corrected.",
};

/**
 * The front door (BUILD_SPEC Phase 9): what a stranger sees before signing in.
 * Middleware sends signed-out visitors here from `/`, and bounces signed-in
 * users back to Home, so this page is only ever a first impression. Presentation
 * follows the active design family (`WelcomeScreen`).
 */
export default async function WelcomePage() {
  const githubStars = isShowcaseMode() ? await getGithubStarCount() : null;
  return <WelcomeScreen githubStars={githubStars} />;
}
