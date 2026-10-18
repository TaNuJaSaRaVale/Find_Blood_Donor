import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { pop, rise } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "01-intro";

export const S01Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const luck = cueFrame(ID, 1);
  const meet = cueFrame(ID, 2);
  const bridge = cueFrame(ID, 3);

  const statOut = interpolate(frame, [meet - 12, meet], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const heartbeat = 1 + 0.06 * Math.max(0, Math.sin((frame / 30) * Math.PI * 1.6)) ** 6;

  return (
    <SceneShell id={ID}>
      {/* Part 1: the statistic */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: statOut, flexDirection: "column", gap: 24 }}>
        <div style={{ ...pop(frame, 0, 20) }}>
          <div style={{ fontSize: 170, scale: String(heartbeat) }}>🩸</div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2, ...rise(frame, 8) }}>
          Every <span style={{ color: C.red }}>2 seconds</span>
        </div>
        <div style={{ fontSize: 48, color: C.dim, ...rise(frame, 20) }}>someone in India needs blood.</div>
        <div
          style={{
            marginTop: 30,
            fontSize: 40,
            padding: "14px 34px",
            borderRadius: 999,
            border: `2px dashed ${C.amber}`,
            color: C.amber,
            ...rise(frame, luck),
          }}
        >
          🎲 Right donor + right time = still a matter of luck
        </div>
      </AbsoluteFill>

      {/* Part 2: logo reveal */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36, ...pop(frame, meet, 22) }}>
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 44,
              background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
              display: "grid",
              placeItems: "center",
              fontSize: 110,
              boxShadow: `0 30px 80px ${C.red}66`,
              rotate: `${interpolate(frame, [meet, meet + 25], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) })}deg`,
            }}
          >
            🩸
          </div>
          <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -5 }}>
            Rakt<span style={{ color: C.red }}>Setu</span>
          </div>
        </div>
        <div style={{ fontSize: 50, color: C.dim, ...rise(frame, bridge) }}>
          A bridge of blood between <b style={{ color: C.text }}>donors</b> and <b style={{ color: C.text }}>patients</b>
        </div>
        <div style={{ display: "flex", gap: 18, ...rise(frame, bridge + 20) }}>
          {["MongoDB", "Express", "React", "Node.js"].map((t, i) => (
            <div
              key={t}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                background: C.card,
                border: `1px solid ${C.cardBorder}`,
                fontSize: 28,
                fontWeight: 600,
                ...rise(frame, bridge + 20 + i * 5, 20),
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
