import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { SignInScreen } from "./SignInScreen";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const params = await searchParams;

  if (configured) {
    const user = await getCurrentUser();
    if (user) redirect(ROUTES.chat);
  }

  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : ROUTES.chat;

  return (
    <SignInScreen configured={configured} next={next} initialError={params.error} />
  );
}
