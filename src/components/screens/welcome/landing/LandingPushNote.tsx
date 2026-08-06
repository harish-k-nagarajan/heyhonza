import { LANDING_PUSH_NOTE } from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingPushNote() {
  return (
    <section className="px-6 md:px-10">
      <div className="rounded-[20px] border border-border bg-[#FFF4EE] p-5">
        <p className={cn(TYPE.label, "text-muted-foreground")}>
          {LANDING_PUSH_NOTE.kicker}
        </p>
        <p className={cn("mt-2 max-w-[52ch]", TYPE.bodySm, "leading-[1.5] text-foreground")}>
          {LANDING_PUSH_NOTE.body}
        </p>
      </div>
    </section>
  );
}
