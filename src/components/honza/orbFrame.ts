/** Frame around the face — border dots live in this margin inside the recess well. */
export const ORB_FRAME_SCALE = 1.14;

export function orbFrameSize(orbPx: number): number {
  return Math.round(orbPx * ORB_FRAME_SCALE);
}

export const CLASSIC_ORB_PX = { hero: 200, avatar: 64 } as const;
