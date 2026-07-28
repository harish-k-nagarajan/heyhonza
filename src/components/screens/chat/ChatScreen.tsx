"use client";

import { TabScreenTransition } from "@/components/layout/TabScreenTransition";
import { useChatScreen } from "@/hooks/useChatScreen";

import { ClassicChat } from "./ClassicChat";
import { HmatChat } from "./HmatChat";

/**
 * Chat selector. Behaviour from `useChatScreen`; picks presentation by design
 * family.
 */
export function ChatScreen() {
  const screen = useChatScreen();
  const body =
    screen.family === "hmat" ? (
      <HmatChat screen={screen} />
    ) : (
      <ClassicChat screen={screen} />
    );

  return <TabScreenTransition>{body}</TabScreenTransition>;
}
