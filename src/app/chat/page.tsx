import { ChatScreen } from "@/components/screens/chat/ChatScreen";

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; checkin?: string }>;
}) {
  const params = await searchParams;
  const session = params.session?.trim() ?? "";
  const openingNotification = SESSION_ID.test(session) || params.checkin === "1";
  return <ChatScreen openingNotification={openingNotification} />;
}
