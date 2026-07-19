import { HardwareIcon } from "@/components/icons/HardwareIcons";
import {
  LANDING_TOPIC_IDS,
  TOPIC_LANDING_SAMPLES,
} from "@/components/screens/welcome/welcome-content";
import { TOPIC_OPTIONS } from "@/lib/constants";

const TOPIC_ICONS = ["chat", "home", "call", "settings", "send", "mic"] as const;

export function LandingTopics() {
  return (
    <div className="landing-topic-strip">
      {LANDING_TOPIC_IDS.map((id, index) => {
        const option = TOPIC_OPTIONS.find((t) => t.id === id);
        const sample = TOPIC_LANDING_SAMPLES[id];
        const icon = TOPIC_ICONS[index % TOPIC_ICONS.length];

        return (
          <article key={id} className="landing-topic-tile mat-metal rounded-[20px] p-4 text-left">
            <div className="mb-3 flex items-center gap-2 text-accent">
              <HardwareIcon name={icon} size={20} />
              <span className="font-display text-[9px] uppercase tracking-[0.14em]">
                {option?.label ?? id}
              </span>
            </div>
            <p className="font-sans text-[15px] leading-snug text-foreground">{sample}</p>
          </article>
        );
      })}
    </div>
  );
}
