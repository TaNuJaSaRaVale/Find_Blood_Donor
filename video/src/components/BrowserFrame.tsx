import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, fontFamily } from "../lib/theme";

/** Natural heights of the 1440px-wide screenshots in public/screens. */
export const SCREEN_HEIGHTS: Record<string, number> = {
  camps: 984, find: 2292, home: 1543, insights: 1573, notifications: 900,
  passport: 1621, "request-owner": 905, requests: 997, "sos-done": 900, "sos-form": 1442,
};

type Props = {
  screen: keyof typeof SCREEN_HEIGHTS | string;
  url: string;
  width: number;
  height: number;
  /** Scroll the page from the top to `scrollTo` (0-1 of the scrollable height) between these frames. */
  scroll?: [number, number];
  scrollTo?: number;
  style?: React.CSSProperties;
};

/** A browser window mock-up showing a real screenshot of the app, with smooth scrolling. */
export const BrowserFrame: React.FC<Props> = ({ screen, url, width, height, scroll, scrollTo = 1, style }) => {
  const frame = useCurrentFrame();
  const bar = 52;
  const scale = width / 1440;
  const imgH = SCREEN_HEIGHTS[screen] * scale;
  const maxScroll = Math.max(0, imgH - (height - bar));
  const y = scroll
    ? interpolate(frame, scroll, [0, maxScroll * scrollTo], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 0;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          height: bar,
          background: "#f1f1f3",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderBottom: "1px solid #e4e4e7",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
        <div
          style={{
            marginLeft: 16,
            flex: 1,
            height: 32,
            borderRadius: 8,
            background: "#fff",
            border: "1px solid #e4e4e7",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            fontFamily,
            fontSize: 17,
            color: "#52525b",
          }}
        >
          🔒 localhost:5173<span style={{ color: C.redDeep, fontWeight: 600 }}>{url}</span>
        </div>
      </div>
      <div style={{ height: height - bar, overflow: "hidden" }}>
        <Img
          src={staticFile(`screens/${screen}.png`)}
          style={{ width, display: "block", translate: `0px ${-y}px` }}
        />
      </div>
    </div>
  );
};
