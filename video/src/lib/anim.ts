import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

/** Fade + rise in, starting at `start` (frames). */
export const rise = (frame: number, start: number, distance = 40, duration = 18) => ({
  opacity: interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: out }),
  translate: interpolate(frame, [start, start + duration], [`0px ${distance}px`, "0px 0px"], { ...clamp, easing: out }),
});

/** Pop in with a springy scale. */
export const pop = (frame: number, start: number, duration = 16) => ({
  opacity: interpolate(frame, [start, start + 8], [0, 1], clamp),
  scale: interpolate(frame, [start, start + duration], [0.6, 1], { ...clamp, easing: Easing.spring({ damping: 12 }) }),
});

/** Slide in from the side. */
export const slideIn = (frame: number, start: number, from = 80, duration = 20) => ({
  opacity: interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: out }),
  translate: interpolate(frame, [start, start + duration], [`${from}px 0px`, "0px 0px"], { ...clamp, easing: out }),
});

export const progress = (frame: number, start: number, end: number, easing = out) =>
  interpolate(frame, [start, end], [0, 1], { ...clamp, easing });
