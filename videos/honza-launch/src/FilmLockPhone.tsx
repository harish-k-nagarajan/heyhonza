import {Img, staticFile} from "remotion";

import {COPY} from "./copy";
import {interFamily} from "./fonts";
import {notifySpring} from "./scene";

const PHONE_W = 320;

/**
 * Lock-screen chrome matched to `LandingIphoneNotificationPreview`.
 * Wallpaper is painted inside the clipped screen (the film image shim
 * used to lay a wash under the bezel). The banner is frame-driven —
 * `.t-toast` is forced visible in `film-globals.css`.
 */
export function FilmLockPhone({frame, appearAt}: {frame: number; appearAt: number}) {
  const open = notifySpring(frame, appearAt);

  return (
    <div className="relative shrink-0 select-none" style={{width: PHONE_W}}>
      <span className="absolute -left-[2px] top-[16.5%] z-10 h-[3%] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
      <span className="absolute -left-[2px] top-[21.5%] z-10 h-[6%] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
      <span className="absolute -left-[2px] top-[28.5%] z-10 h-[6%] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
      <span className="absolute -right-[2px] top-[25%] z-10 h-[9.5%] w-[3px] rounded-r-[1.5px] bg-[#3d3d40]" />

      <div
        className="relative bg-[#1c1c1e] p-[3px]"
        style={{
          borderRadius: 42,
          boxShadow:
            "inset 0 0 0 1px #4a4a4c, inset 0 1px 0 rgba(255,255,255,0.22), 0 24px 48px rgba(28,24,20,0.22), 0 8px 16px rgba(28,24,20,0.12)",
        }}
      >
        <div
          className="relative w-full bg-black"
          style={{
            aspectRatio: "473 / 1024",
            borderRadius: 39,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 39,
              overflow: "hidden",
              background: "linear-gradient(180deg, #172033 0%, #31445f 36%, #e7d0b4 64%, #f7f1ea 100%)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                bottom: "22%",
                width: 150,
                height: 150,
                marginLeft: -75,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #ffe7c4 0%, #f0c48a 42%, rgba(240,196,138,0) 70%)",
              }}
            />
            <svg
              width="100%"
              height="100%"
              style={{position: "absolute", inset: 0, opacity: 0.18}}
              aria-hidden
            >
              {Array.from({length: 9}).map((_, row) =>
                Array.from({length: 6}).map((__, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={28 + col * 52}
                    cy={180 + row * 52}
                    r={1.4}
                    fill="#fff"
                  />
                )),
              )}
            </svg>
          </div>

          <div
            className="absolute left-1/2 top-[2.2%] z-30 flex h-[5%] w-[36%] max-h-[22px] min-h-[16px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[6%]"
          >
            <span className="block h-[6px] w-[6px] rounded-full bg-[#0d1a2e] shadow-[inset_0_0_0_1px_rgba(80,100,160,0.35)]" />
          </div>

          <div
            className="absolute inset-x-0 top-[14%] z-10 text-center text-white"
            style={{fontFamily: interFamily}}
          >
            <p style={{fontSize: 64, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1}}>7:41</p>
            <p style={{marginTop: 6, fontSize: 15, fontWeight: 500, opacity: 0.86}}>pátek</p>
          </div>

          <div
            className="absolute inset-x-[10px] z-20"
            style={{
              bottom: "13.6%",
              opacity: open.opacity,
              translate: open.translate,
              scale: open.scale,
            }}
          >
            <div
              className="landing-ios-ui rounded-[18px] bg-[rgba(72,72,74,0.78)] px-[9px] py-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.42),inset_0_0.5px_0_rgba(255,255,255,0.34)] ring-1 ring-inset ring-white/25"
              style={{backdropFilter: "blur(28px) saturate(190%) brightness(1.1)"}}
            >
              <div className="flex items-start gap-[8px]">
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-[7px] shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  <Img
                    src={staticFile("apple-touch-icon.png")}
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
                <div className="min-w-0 flex-1 pt-[1px]">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold leading-none tracking-[0.01em] text-white">
                      {COPY.notifyApp}
                    </p>
                    <span className="shrink-0 text-[12px] font-normal leading-none text-white/70">
                      {COPY.notifyTime}
                    </span>
                  </div>
                  <p className="mt-[4px] text-[14px] font-normal leading-[1.3] tracking-[-0.01em] text-white">
                    {COPY.notifyMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
