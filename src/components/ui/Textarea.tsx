import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full resize-none rounded-card border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none ring-accent/40 placeholder:text-muted-foreground focus:border-accent focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
