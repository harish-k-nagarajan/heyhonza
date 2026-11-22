import type {HonzaOrbState} from "@/components/honza/theme";
import {
  HmatChatComposerRow,
  HmatChatThread,
  HmatHonzaBubble,
  HmatPresenceRecess,
  HmatScreenTitle,
  HmatStatusChip,
  HmatUserBubble,
} from "@/components/screens/hmat/HmatUi";
import {chatChip, chatTitle, resolveChatStatus} from "@/lib/i18n/locales";
import {getStrings} from "@/lib/i18n/locales";
import {CREAM_CANVAS} from "@/components/honza/theme";

import {COPY} from "./copy";
import {FilmEnter} from "./FilmEnter";
import {BEATS, PHONE_H, PHONE_W} from "./timing";

const cs = getStrings("cs");

export function FilmChat({
  frame,
  mood,
  draft,
  openerOnly = false,
  appearAt = 0,
}: {
  frame: number;
  mood: HonzaOrbState;
  draft: string;
  /** He already wrote. The thread is that one Czech message. */
  openerOnly?: boolean;
  appearAt?: number;
}) {
  const loading = mood === "thinking";
  const phase = resolveChatStatus({
    lastError: null,
    loading,
    showStartGate: false,
    heroMode: false,
    mood,
    llmReady: true,
    providersLoaded: true,
  });
  const showHonza = openerOnly || frame >= BEATS.honzaOpen;
  const showUser = !openerOnly && frame >= BEATS.userBubble;
  const showFix = !openerOnly && frame >= BEATS.fix;
  const honzaText = openerOnly ? COPY.checkIn : COPY.honzaOpen;
  const honzaAt = openerOnly ? appearAt : BEATS.honzaOpen;

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{width: PHONE_W, height: PHONE_H, backgroundColor: CREAM_CANVAS}}
    >
      <div className="mat-bg" aria-hidden />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 pb-5 pt-5">
        <div className="flex shrink-0 flex-col gap-3">
          <HmatPresenceRecess
            orbState={mood}
            loading={loading}
            size={120}
            breathe={false}
            attentive={frame >= BEATS.typeStart && frame < BEATS.send}
          />
          <div className="flex flex-col items-center gap-1.5">
            <HmatScreenTitle>{chatTitle(phase, cs.chat)}</HmatScreenTitle>
            <HmatStatusChip
              label={chatChip(phase, cs.chat)}
              sizerLabel={chatChip(phase, cs.chat)}
              shimmer={loading}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <HmatChatThread watchKey={`${showHonza}-${showUser}-${showFix}`}>
            {showHonza ? (
              <FilmEnter appearAt={honzaAt} fromY={8}>
                <HmatHonzaBubble>{honzaText}</HmatHonzaBubble>
              </FilmEnter>
            ) : null}
            {showUser ? (
              <FilmEnter appearAt={BEATS.userBubble} fromY={8} align="end">
                <HmatUserBubble>{COPY.userSlip}</HmatUserBubble>
              </FilmEnter>
            ) : null}
            {showFix ? (
              <FilmEnter appearAt={BEATS.fix} fromY={8}>
                <HmatHonzaBubble>{COPY.honzaFix}</HmatHonzaBubble>
              </FilmEnter>
            ) : null}
          </HmatChatThread>
        </div>

        <div className="h-[52px] shrink-0">
          <HmatChatComposerRow
            value={draft}
            onChange={() => undefined}
            onSend={() => undefined}
            onEndChat={() => undefined}
            placeholder={COPY.composerPlaceholder}
            sendLabel={COPY.sendLabel}
            endLabel={COPY.endLabel}
          />
        </div>
      </div>
    </div>
  );
}
