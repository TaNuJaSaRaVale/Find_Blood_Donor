import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { rise } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "10-tips";

const TIPS = [
  { icon: "📍", text: "Keep your profile & location updated", cue: 0, at: 2 },
  { icon: "⏸️", text: "Switch off availability when travelling or unwell", cue: 1 },
  { icon: "🚨", text: "Use SOS only for real emergencies", cue: 2 },
  { icon: "💬", text: "Share requests on WhatsApp", cue: 3 },
  { icon: "✅", text: "Always confirm donations - keeps passports accurate", cue: 4 },
];

export const S10Tips: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell id={ID} kicker="Pro tips" title="Use RaktSetu effectively">
      <div style={{ position: "absolute", left: 110, top: 240, display: "flex", flexDirection: "column", gap: 22 }}>
        {TIPS.map((t, i) => {
          const start = cueFrame(ID, t.cue, t.at ?? 0);
          const check = interpolate(frame, [start + 25, start + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 26, ...rise(frame, start, 30) }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  border: `3px solid ${C.green}`,
                  background: `rgba(16,185,129,${0.25 * check})`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 40,
                  color: C.green,
                  fontWeight: 800,
                }}
              >
                <span style={{ opacity: check, scale: String(check) }}>✓</span>
              </div>
              <div style={{ fontSize: 56 }}>{t.icon}</div>
              <div style={{ fontSize: 46, fontWeight: 700 }}>{t.text}</div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};
