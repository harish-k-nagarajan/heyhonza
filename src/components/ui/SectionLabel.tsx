import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

/**
 * Section label: Doto display, uppercase, muted, `//` prefixed as if a
 * code comment. The `//` is written as a JSX expression ({"// …"}) so
 * ESLint's react/jsx-no-comment-textnodes doesn't read it as a comment
 * (see MEMORY.md).
 */
export function SectionLabel({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  return (
    <Tag
      className={cn(TYPE.label, "leading-none text-muted-foreground", className)}
    >
      {"// "}
      {children}
    </Tag>
  );
}
