import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-4 text-card-foreground shadow-sm shadow-black/40",
        className,
      )}
      {...props}
    />
  );
}
