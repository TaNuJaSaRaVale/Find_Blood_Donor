import { interpolate, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { SceneShell } from "../components/SceneShell";
import { Card, Drop } from "../components/ui";
import { pop, progress, rise, slideIn } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "06-passport";
const LEVELS = ["Bronze", "Silver", "Gold", "Platinum"];
const LEVEL_COLORS = ["#cd7f32", "#cbd5e1", "#facc15", "#a5f3fc"];

export const S06Passport: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = cueFrame(ID, 1);
  const gaps = cueFrame(ID, 2);
  const badges = cueFrame(ID, 3);
  const bombay = cueFrame(ID, 4);

  // countdown ring: 90 days → 0
  const ringP = progress(frame, ring + 10, gaps + 60);
  const days = Math.round(interpolate(ringP, [0, 1], [90, 0]));
  const r = 92;
  const circ = 2 * Math.PI * r;

  return (
    <SceneShell id={ID} kicker="Feature 3" title="The Donor Passport">
      <BrowserFrame
        screen="passport"
        url="/passport"
        width={960}
        height={680}
        scroll={[badges, bombay]}
        scrollTo={0.6}
        style={{ position: "absolute", left: 110, top: 210, ...slideIn(frame, 8, -100) }}
      />

      <div style={{ position: "absolute", left: 1130, top: 200, width: 680, display: "flex", flexDirection: "column", gap: 24 }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 30, ...rise(frame, ring) }}>
          <div style={{ position: "relative", width: 210, height: 210 }}>
            <svg width={210} height={210} viewBox="0 0 210 210">
              <circle cx={105} cy={105} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={16} />
              <circle
                cx={105}
                cy={105}
                r={r}
                fill="none"
                stroke={days === 0 ? C.green : C.amber}
                strokeWidth={16}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - ringP)}
                transform="rotate(-90 105 105)"
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 64, fontWeight: 800 }}>{days === 0 ? "✓" : days}</div>
                <div style={{ fontSize: 20, color: C.dim }}>{days === 0 ? "Ready!" : "days to go"}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.6 }}>
            <div style={{ ...rise(frame, gaps, 16) }}>👨 Men: <b>90 days</b></div>
            <div style={{ ...rise(frame, gaps + 40, 16) }}>👩 Women: <b>120 days</b></div>
            <div style={{ fontSize: 22, color: C.dim, ...rise(frame, gaps + 80, 16) }}>NBTC India guidelines</div>
          </div>
        </Card>

        <Card style={{ ...rise(frame, badges) }}>
          <div style={{ display: "flex", gap: 14 }}>
            {LEVELS.map((l, i) => (
              <div
                key={l}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "12px 4px",
                  borderRadius: 14,
                  border: `2px solid ${LEVEL_COLORS[i]}`,
                  color: LEVEL_COLORS[i],
                  fontWeight: 800,
                  fontSize: 24,
                  ...pop(frame, badges + 30 + i * 15),
                }}
              >
                🏅 {l}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 46, marginTop: 18, ...rise(frame, badges + 100, 16) }}>
            🩸 💪 🦸 👑 ⚡ 🌍 💎
            <span style={{ fontSize: 28, alignSelf: "center", color: C.dim }}>❤️ lives saved = units × 3</span>
          </div>
        </Card>

        <Card accent={C.violet} style={{ display: "flex", alignItems: "center", gap: 24, ...pop(frame, bombay) }}>
          <Drop label={"Bombay\n(hh)"} size={100} color={C.violet} />
          <div style={{ fontSize: 28, lineHeight: 1.4 }}>
            <b>Rare Bombay blood group</b>
            <div style={{ color: C.dim, fontSize: 24 }}>≈ 1 in 10,000 Indians · hh donors matched only to hh patients</div>
          </div>
        </Card>
      </div>
    </SceneShell>
  );
};
