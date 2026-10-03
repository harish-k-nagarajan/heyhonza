import { type ReactNode } from "react";

import { HmatSettingsIconWrap } from "@/components/screens/settings/HmatSettingsUi";

/** Black provider marks at the existing 16px glyph size. Shared by settings and onboarding. */

const MARK_SIZE = 16;

export function ProviderMarkSlot({ children }: { children: ReactNode }) {
  return (
    <HmatSettingsIconWrap className="border border-[#E8E2DC] bg-white">
      {children}
    </HmatSettingsIconWrap>
  );
}

export function OpenRouterMark() {
  return (
    <svg
      width={MARK_SIZE}
      height={MARK_SIZE}
      viewBox="0 0 401.4 293.7"
      fill="none"
      aria-hidden
    >
      <path
        fill="#000"
        d="M303.9475,17.19926c42.79734,0,77.48933,34.69327,77.48933,77.48933s-34.69199,77.48933-77.48933,77.48933l76.86166,76.86244c9.76367,9.76313,2.84903,26.45667-10.95697,26.45667h-220.88335c-71.32686,0-129.14889-57.82202-129.14889-129.14889S77.64197,17.19926,148.96884,17.19926h154.97866ZM148.96884,68.85881c-42.79607,0-77.48933,34.69327-77.48933,77.48933s34.69327,77.48933,77.48933,77.48933,77.48933-34.69327,77.48933-77.48933-34.69327-77.48933-77.48933-77.48933Z"
      />
    </svg>
  );
}

export function ElevenLabsMark() {
  return (
    <svg
      width={MARK_SIZE}
      height={MARK_SIZE}
      viewBox="0 0 180 292"
      fill="none"
      aria-hidden
    >
      <rect width="60" height="292" fill="#000" />
      <rect x="120" width="60" height="292" fill="#000" />
    </svg>
  );
}
