import {Composition} from "remotion";

import {HonzaLaunch} from "./HonzaLaunch";
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from "./timing";

export const RemotionRoot = () => {
  return (
    <Composition
      id="HonzaLaunch"
      component={HonzaLaunch}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
