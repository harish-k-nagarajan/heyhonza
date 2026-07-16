"use client";

import { useChatScreen } from "@/hooks/useChatScreen";

import { ClassicChat } from "./ClassicChat";

/**
 * Chat selector. Behaviour from `useChatScreen`; picks presentation by design
 * family. Phase 4 adds the Hmat branch.
 */
export function ChatScreen() {
  const screen = useChatScreen();
  return <ClassicChat screen={screen} />;
}
