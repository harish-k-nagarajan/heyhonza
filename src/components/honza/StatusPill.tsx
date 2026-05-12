import { cn } from "@/lib/cn";

export type HonzaStatus = "idle" | "thinking" | "waiting";

const copy: Record<HonzaStatus, string> = {
  idle: "Ready",
  thinking: "Thinking…",
  waiting: "Waiting for you",
};

export function StatusPill({
  status,
  className,
}: {
  status: HonzaStatus;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {copy[status]}
    </div>
  );
}
