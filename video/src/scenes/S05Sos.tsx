import { interpolate, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { SceneShell } from "../components/SceneShell";
import { pop, rise } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "05-sos";

const STEPS = [
  { n: 1, text: "Post SOS", icon: "🚨", cue: 0 },
  { n: 2, text: "Donors alerted", icon: "📣", cue: 1 },
  { n: 3, text: "Pledge → number revealed", icon: "🔒", cue: 2 },
  { n: 4, text: "Confirm → fulfilled", icon: "✅", cue: 4 },
];

const fade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a - 10, a, b - 10, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const S05Sos: React.FC = () => {
  const frame = useCurrentFrame();
  const alert = cueFrame(ID, 1);
  const privacy = cueFrame(ID, 2);
  const end = 99999;

  return (
    <SceneShell id={ID} kicker="Feature 2" title="One-tap Emergency SOS">
      {/* step tracker */}
      <div style={{ position: "absolute", left: 110, top: 220, width: 470, display: "flex", flexDirection: "column", gap: 22 }}>
        {STEPS.map((s) => {
          const start = cueFrame(ID, s.cue, s.cue === 0 ? 0.5 : 0);
          const next = STEPS.find((x) => x.n === s.n + 1);
          const active = frame >= start && (!next || frame < cueFrame(ID, next.cue));
          return (
            <div
              key={s.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "22px 26px",
                borderRadius: 20,
                background: active ? `${C.red}33` : C.card,
                border: `2px solid ${active ? C.red : C.cardBorder}`,
                fontSize: 32,
                fontWeight: 700,
                ...rise(frame, start, 20),
              }}
            >
              <span style={{ fontSize: 44 }}>{s.icon}</span>
              <span style={{ color: C.muted }}>{s.n}.</span> {s.text}
            </div>
          );
        })}
        <div
          style={{
            marginTop: 10,
            padding: "18px 24px",
            borderRadius: 18,
            border: `2px dashed ${C.amber}`,
            color: C.amber,
            fontSize: 28,
            fontWeight: 600,
            ...pop(frame, alert + 60),
          }}
        >
          📡 Compatible + eligible donors within 25 km
        </div>
      </div>

      {/* screens that change with the story */}
      <div style={{ position: "absolute", left: 640, top: 210 }}>
        <div style={{ position: "absolute", opacity: fade(frame, 0, alert) }}>
          <BrowserFrame screen="sos-form" url="/requests/new?sos=1" width={1170} height={680} scroll={[60, alert - 30]} scrollTo={0.75} />
        </div>
        <div style={{ position: "absolute", opacity: fade(frame, alert, privacy) }}>
          <BrowserFrame screen="sos-done" url="/requests/new?sos=1" width={1170} height={680} />
        </div>
        <div style={{ position: "absolute", opacity: fade(frame, privacy, end) }}>
          <BrowserFrame screen="request-owner" url="/requests/…" width={1170} height={680} />
          {/* highlight the revealed phone number and the confirm button */}
          <div
            style={{
              position: "absolute",
              left: 1170 * (618 / 1440) - 10,
              top: 52 + (1170 / 1440) * 630 - 10,
              width: (1170 / 1440) * 136 + 20,
              height: (1170 / 1440) * 36 + 20,
              border: `4px solid ${C.amber}`,
              borderRadius: 14,
              ...pop(frame, cueFrame(ID, 3, 1)),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: (1170 / 1440) * 178 - 10,
              top: 52 + (1170 / 1440) * 683 - 10,
              width: (1170 / 1440) * 142 + 20,
              height: (1170 / 1440) * 36 + 20,
              border: `4px solid ${C.green}`,
              borderRadius: 14,
              ...pop(frame, cueFrame(ID, 4, 1)),
            }}
          />
        </div>
      </div>
    </SceneShell>
  );
};
