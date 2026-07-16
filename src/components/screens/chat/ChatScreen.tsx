"use client";

import { useChatScreen } from "@/hooks/useChatScreen";

import { ClassicChat } from "./ClassicChat";
import { HmatChat } from "./HmatChat";

/**
 * Chat selector. Behaviour from `useChatScreen`; picks presentation by design
 * family.
 */
export function ChatScreen() {
  const screen = useChatScreen();
  if (screen.family === "hmat") return <HmatChat screen={screen} />;
  return <ClassicChat screen={screen} />;
}
