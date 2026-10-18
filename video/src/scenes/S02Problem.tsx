import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { pop, rise, slideIn } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "02-problem";

const MESSAGES = [
  { me: true, text: "🚨 URGENT: B+ blood needed at Civil Hospital. Please forward 🙏", cue: 2 },
  { me: false, text: "I'm A+ … sorry 😔", cue: 3 },
  { me: false, text: "I'm B+ but I'm in Pune now", cue: 4 },
  { me: false, text: "I donated 3 weeks ago, can't 😞", cue: 5 },
];

const PROBLEMS = [
  { icon: "❌", title: "Blood group doesn't match", cue: 3, color: C.red },
  { icon: "📍", title: "Lives too far away", cue: 4, color: C.amber },
  { icon: "⏳", title: "Donated recently - not eligible", cue: 5, color: C.violet },
];

export const S02Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const lost = cueFrame(ID, 6);

  return (
    <SceneShell id={ID} kicker="The problem" title="Finding blood today is chaos">
      {/* phone with WhatsApp-style chat */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 230,
          width: 560,
          height: 660,
          borderRadius: 48,
          background: "#0b141a",
          border: "10px solid #2a2a2e",
          padding: "70px 22px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          ...slideIn(frame, cueFrame(ID, 1), -80),
        }}
      >
        <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", fontSize: 24, color: "#8696a0" }}>
          👨‍👩‍👧 Family group · 247 members
        </div>
        <div style={{ alignSelf: "center", fontSize: 22, color: "#8696a0", ...rise(frame, cueFrame(ID, 1), 10) }}>
          🏥 Doctor: “Arrange 2 units of B+ urgently”
        </div>
        {MESSAGES.map((m) => (
          <div
            key={m.text}
            style={{
              alignSelf: m.me ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.me ? "#005c4b" : "#202c33",
              color: "#e9edef",
              fontSize: 27,
              lineHeight: 1.35,
              padding: "14px 18px",
              borderRadius: 16,
              ...pop(frame, cueFrame(ID, m.cue, 0.3)),
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* problem cards */}
      <div style={{ position: "absolute", left: 800, top: 260, display: "flex", flexDirection: "column", gap: 28 }}>
        {PROBLEMS.map((p) => (
          <div
            key={p.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              width: 960,
              padding: "26px 34px",
              borderRadius: 22,
              background: `${p.color}1f`,
              border: `2px solid ${p.color}`,
              fontSize: 44,
              fontWeight: 700,
              ...slideIn(frame, cueFrame(ID, p.cue), 100),
            }}
          >
            <span style={{ fontSize: 56 }}>{p.icon}</span>
            {p.title}
          </div>
        ))}
        <div
          style={{
            marginTop: 20,
            fontSize: 64,
            fontWeight: 800,
            color: C.red,
            ...pop(frame, lost),
          }}
        >
          ⌛ Precious hours lost
          <div style={{ color: C.dim, fontSize: 36, fontWeight: 500, marginTop: 6 }}>
            {Math.floor(interpolate(frame, [lost, lost + 40], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} hours and counting…
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
