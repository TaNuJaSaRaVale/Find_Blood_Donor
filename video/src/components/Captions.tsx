import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../lib/theme";
import type { Caption } from "../lib/timing";

// The narration spells some words phonetically so the voice pronounces them well;
// on screen we show the proper spelling.
const DISPLAY: [RegExp, string][] = [
  [/Rakt Setu/g, "RaktSetu"],
  [/S O S/g, "SOS"],
  [/T T L/g, "TTL"],
  [/Two D sphere/g, "2dsphere"],
  [/geo near/g, "$geoNear"],
  [/date to string/g, "$dateToString"],
  [/Node JS/g, "Node.js"],
  [/twenty five kilometres/g, "25 km"],
];
const pretty = (t: string) => DISPLAY.reduce((s, [re, rep]) => s.replace(re, rep), t);

export const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const current = captions.find((c) => t >= c.start && t < c.end + 0.15);
  if (!current) return null;

  const startFrame = current.start * fps;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 36,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1760,
          padding: "12px 30px",
          borderRadius: 18,
          background: "rgba(10,3,5,0.78)",
          border: `1px solid ${C.cardBorder}`,
          color: C.text,
          fontFamily,
          fontSize: 33,
          fontWeight: 500,
          lineHeight: 1.35,
          textAlign: "center",
          opacity: interpolate(frame, [startFrame, startFrame + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {pretty(current.text)}
      </div>
    </div>
  );
};
