import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(TYPE.label, "text-muted-foreground", className)}
      {...props}
    />
  );
}
