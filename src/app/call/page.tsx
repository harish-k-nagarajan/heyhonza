import type { Metadata } from "next";

import CallClient from "./CallClient";

export const metadata: Metadata = {
  title: "Call Honza",
  description: "Talk to Honza out loud in Czech — he listens and speaks back.",
};

export default function CallPage() {
  return <CallClient />;
}
