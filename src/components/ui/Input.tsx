import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-card border border-border bg-muted px-3 text-sm text-foreground outline-none ring-accent/40 placeholder:text-muted-foreground focus:border-accent focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
