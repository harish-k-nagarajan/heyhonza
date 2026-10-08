import { GITHUB_REPO } from "@/lib/site-mode";

/**
 * Public star count for the showcase button. A private repo answers 404, and
 * the button then renders with no number. Cached for an hour.
 */
export async function getGithubStarCount(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "honza-showcase",
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
