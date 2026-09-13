import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingFoldHeader({
  kicker,
  title,
  titleLine2,
  lead,
  className,
}: {
  kicker: string;
  title: string;
  titleLine2?: string;
  lead?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <p className={cn(TYPE.label, "text-[#6B625C]")}>{kicker}</p>
      <h2 className={cn(TYPE.display, "max-w-[24ch] text-balance text-foreground md:text-[24px]")}>
        {title}
        {titleLine2 ? (
          <>
            <br />
            {titleLine2}
          </>
        ) : null}
      </h2>
      {lead ? (
        <p
          className={cn(
            "max-w-[42ch] text-pretty text-[#4A443F]",
            TYPE.subtitle,
            "md:max-w-[46ch] md:text-[14px]",
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
