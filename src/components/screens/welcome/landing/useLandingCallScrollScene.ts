"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

function wrapStreamWords(container: HTMLElement) {
  if (container.dataset.streamWrapped === "true") return;
  const text = container.textContent?.trim() ?? "";
  const words = text.split(/\s+/).filter(Boolean);
  container.textContent = "";
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "t-stream-w";
    span.textContent = word;
    container.appendChild(span);
    if (i < words.length - 1) {
      container.appendChild(document.createTextNode(" "));
    }
  });
  container.dataset.streamWrapped = "true";
}

function applyCallProgress(
  p: number,
  stagger: HTMLElement | null,
  streamSpans: HTMLElement[],
  orb: HTMLElement | null,
  hangup: HTMLElement | null,
) {
  if (stagger) {
    stagger.classList.toggle("is-shown", p > 0.12);
  }

  if (orb) {
    const scale = 1 + Math.sin(p * Math.PI) * 0.04;
    orb.style.transform = `scale(${scale})`;
  }

  const streamStart = 0.28;
  const streamEnd = 0.88;
  const streamT =
    p < streamStart
      ? 0
      : Math.min(1, (p - streamStart) / (streamEnd - streamStart));
  const visibleCount = Math.floor(streamT * streamSpans.length);
  streamSpans.forEach((span, i) => {
    span.classList.toggle("is-in", i < visibleCount);
  });

  if (hangup) {
    const hangT = Math.min(1, Math.max(0, (p - 0.72) / 0.2));
    hangup.style.transform = `scale(${0.92 + hangT * 0.08})`;
    hangup.style.opacity = String(0.35 + hangT * 0.65);
  }
}

export function useLandingCallScrollScene(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const frame = section.querySelector<HTMLElement>("[data-landing-call-frame]");
      const stagger = section.querySelector<HTMLElement>(".t-stagger");
      const stream = section.querySelector<HTMLElement>(".t-stream");
      const orb = section.querySelector<HTMLElement>("[data-landing-call-orb]");
      const hangup = section.querySelector<HTMLElement>("[data-landing-call-hangup]");

      if (!frame) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        if (!enabled) {
          if (stream) wrapStreamWords(stream);
          const streamSpans = stream
            ? Array.from(stream.querySelectorAll<HTMLElement>(".t-stream-w"))
            : [];
          streamSpans.forEach((span) => span.classList.add("is-in"));
          applyCallProgress(1, stagger, streamSpans, orb, hangup);
          return () => undefined;
        }

        if (stream) wrapStreamWords(stream);
        const streamSpans = stream
          ? Array.from(stream.querySelectorAll<HTMLElement>(".t-stream-w"))
          : [];

        const proxy = { p: 0 };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: "top 78%",
            end: "bottom 55%",
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        tl.to(proxy, {
          p: 1,
          duration: 1,
          ease: "none",
          onUpdate() {
            applyCallProgress(proxy.p, stagger, streamSpans, orb, hangup);
          },
        });

        return () => {
          if (stagger) stagger.classList.remove("is-shown");
          if (orb) orb.style.transform = "";
          if (hangup) {
            hangup.style.transform = "";
            hangup.style.opacity = "";
          }
          streamSpans.forEach((span) => span.classList.remove("is-in"));
        };
      });

      mm.add("(max-width: 767px)", () => {
        if (stagger) stagger.classList.add("is-shown");
        if (stream) {
          wrapStreamWords(stream);
          stream.querySelectorAll(".t-stream-w").forEach((span) => {
            span.classList.add("is-in");
          });
        }
        if (hangup) {
          hangup.style.opacity = "1";
          hangup.style.transform = "scale(1)";
        }
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
