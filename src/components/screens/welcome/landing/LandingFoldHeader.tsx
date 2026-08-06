import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingFoldHeader({
  num,
  kicker,
  title,
  lead,
  className,
}: {
  num: string;
  kicker: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <p className={cn(TYPE.label, "text-muted-foreground")}>
        {num} · {kicker}
      </p>
      <h2 className={cn(TYPE.display, "max-w-[28ch] text-foreground md:text-[24px]")}>
        {title}
      </h2>
      {lead ? (
        <p className={cn("max-w-[32ch]", TYPE.subtitle, "md:text-[14px]")}>{lead}</p>
      ) : null}
    </header>
  );
}
