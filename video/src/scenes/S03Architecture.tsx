import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { pop, rise } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "03-architecture";

const LAYERS = [
  { icon: "🧑", name: "User", sub: "Browser / phone", color: C.blue, at: 0.8 },
  { icon: "⚛️", name: "React", sub: "Vite · Leaflet · Chart.js", color: "#61dafb", cue: 1, at: 0.4 },
  { icon: "🔌", name: "REST API", sub: "JSON · JWT auth", color: C.amber, cue: 1, at: 2.0 },
  { icon: "🟩", name: "Node + Express", sub: "Routes → Controllers", color: C.green, cue: 1, at: 3.6 },
  { icon: "🍃", name: "MongoDB", sub: "via Mongoose", color: "#22c55e", cue: 2, at: 0.3 },
];

const COLLECTIONS = ["users", "bloodrequests", "donations", "camps", "notifications"];

export const S03Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const collectionsStart = cueFrame(ID, 2, 3.2);

  return (
    <SceneShell id={ID} kicker="The solution" title="A full-stack MERN application">
      <div style={{ position: "absolute", left: 110, right: 110, top: 300, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {LAYERS.map((l, i) => {
          const start = cueFrame(ID, l.cue ?? 0, l.at);
          return (
            <div key={l.name} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div
                  style={{
                    width: 70,
                    height: 6,
                    borderRadius: 3,
                    marginRight: 16,
                    background: `linear-gradient(90deg, ${LAYERS[i - 1].color}, ${l.color})`,
                    scale: `${interpolate(frame, [start - 10, start], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 1`,
                    transformOrigin: "left",
                  }}
                />
              )}
              <div
                style={{
                  width: 270,
                  padding: "30px 18px",
                  borderRadius: 26,
                  textAlign: "center",
                  background: `${l.color}1a`,
                  border: `3px solid ${l.color}`,
                  ...pop(frame, start),
                }}
              >
                <div style={{ fontSize: 70 }}>{l.icon}</div>
                <div style={{ fontSize: 38, fontWeight: 800, marginTop: 8 }}>{l.name}</div>
                <div style={{ fontSize: 22, color: C.dim, marginTop: 6 }}>{l.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center" }}>
        <div style={{ fontSize: 32, color: C.muted, fontWeight: 700, letterSpacing: 3, ...rise(frame, collectionsStart - 15) }}>
          5 COLLECTIONS
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 22 }}>
          {COLLECTIONS.map((c, i) => (
            <div
              key={c}
              style={{
                fontFamily: "monospace",
                fontSize: 32,
                fontWeight: 700,
                padding: "14px 26px",
                borderRadius: 14,
                background: "rgba(34,197,94,0.14)",
                border: "2px solid #22c55e",
                ...pop(frame, collectionsStart + i * 14),
              }}
            >
              🍃 {c}
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};
