import { redirect } from "next/navigation";

import { AuthScreen } from "@/components/screens/auth/AuthScreen";
import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage({
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
    <AuthScreen
      mode="login"
      configured={configured}
      next={next}
      initialError={params.error}
    />
  );
}
