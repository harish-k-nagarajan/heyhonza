import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (typeof params.next === "string") qs.set("next", params.next);
  if (typeof params.error === "string") qs.set("error", params.error);
  const suffix = qs.size ? `?${qs.toString()}` : "";
  redirect(`/login${suffix}`);
}
