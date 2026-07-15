import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // shadow-black/40 here was a dark-mode leftover: a 40%-black drop
        // shadow reads as grime on the cream canvas. DESIGN.md defines a card
        // as white + 16px radius + a 7%-black hairline border, so the shadow
        // should barely register.
        "rounded-card border border-border bg-card p-4 text-card-foreground shadow-sm shadow-black/[0.04]",
        className,
      )}
      {...props}
    />
  );
}
