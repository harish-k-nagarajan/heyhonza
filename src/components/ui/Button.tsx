import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-card px-4 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";
  const styles = {
    primary:
      "bg-accent text-accent-foreground shadow-sm shadow-black/10",
    secondary:
      "border border-border bg-muted text-foreground hover:bg-muted/80",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  }[variant];
  return <button className={cn(base, styles, className)} {...props} />;
}
