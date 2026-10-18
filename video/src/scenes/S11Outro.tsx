import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { pop, rise } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "11-outro";

export const S11Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const tagline = cueFrame(ID, 1);
  const drop = cueFrame(ID, 2);

  return (
    <SceneShell id={ID}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, ...pop(frame, 0, 22) }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 38,
              background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
              display: "grid",
              placeItems: "center",
              fontSize: 92,
              boxShadow: `0 30px 80px ${C.red}66`,
            }}
          >
            🩸
          </div>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4 }}>
            Rakt<span style={{ color: C.red }}>Setu</span>
          </div>
        </div>
        <div style={{ fontSize: 54, fontWeight: 600, ...rise(frame, tagline) }}>
          Find a <span style={{ color: C.red }}>compatible</span> donor, near you, in seconds.
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: C.red,
            ...pop(frame, drop, 20),
          }}
        >
          Because every drop counts ❤️
        </div>
        <div style={{ fontSize: 28, color: C.dim, marginTop: 20, ...rise(frame, drop + 30) }}>
          MongoDB · Express.js · React · Node.js · Database Mini Project
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
