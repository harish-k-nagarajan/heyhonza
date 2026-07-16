import type { Metadata } from "next";

import { CallScreen } from "@/components/screens/call/CallScreen";

export const metadata: Metadata = {
  title: "Call Honza",
  description: "Talk to Honza out loud in Czech — he listens and speaks back.",
};

export default function CallPage() {
  return <CallScreen />;
}
