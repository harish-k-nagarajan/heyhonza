import { cn } from "@/lib/cn";

/**
 * DESIGN.md section label: monospace, uppercase, muted, `//` prefixed as if a
 * code comment, letter-spacing 0.25em. The `//` is written as a JSX expression
 * ({"// …"}) so ESLint's react/jsx-no-comment-textnodes doesn't read it as a
 * comment (see MEMORY.md).
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
      className={cn(
        "font-sans text-[11px] uppercase leading-none tracking-[0.25em] text-muted-foreground",
        className,
      )}
    >
      {"// "}
      {children}
    </Tag>
  );
}
