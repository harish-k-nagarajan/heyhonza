import {Audio} from "@remotion/media";
import {interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

import {CLAMP} from "./scene";
import {BEATS} from "./timing";

/** Quiet warm bed, plus one soft notification. The picture still reads with both muted. */
export function FilmSound() {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const bed = interpolate(frame, [0, 45, durationInFrames - 50, durationInFrames - 6], [0, 0.4, 0.4, 0], CLAMP);

  return (
    <>
      <Audio src={staticFile("audio/bed.wav")} volume={bed} />
      <Sequence from={BEATS.bannerAt}>
        <Audio src={staticFile("audio/notify.wav")} volume={0.48} />
      </Sequence>
    </>
  );
}
