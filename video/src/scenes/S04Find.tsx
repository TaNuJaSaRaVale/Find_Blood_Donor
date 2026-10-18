import { interpolate, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { SceneShell } from "../components/SceneShell";
import { Card, Drop } from "../components/ui";
import { pop, progress, rise, slideIn } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "04-find";
const COMPATIBLE = ["A+", "A−", "O+", "O−"];
const SCORE = [
  { label: "Distance", pts: 50, color: C.blue },
  { label: "Reliability", pts: 30, color: C.amber },
  { label: "Exact group", pts: 20, color: C.red },
];

export const S04Find: React.FC = () => {
  const frame = useCurrentFrame();
  const unique = cueFrame(ID, 2);
  const groups = cueFrame(ID, 4);
  const pipeline = cueFrame(ID, 6);

  return (
    <SceneShell id={ID} kicker="Feature 1" title="Find Donors">
      <BrowserFrame
        screen="find"
        url="/find"
        width={1000}
        height={680}
        scroll={[cueFrame(ID, 6, 1), cueFrame(ID, 6, 12)]}
        scrollTo={0.55}
        style={{ position: "absolute", left: 110, top: 210, ...slideIn(frame, 10, -100) }}
      />

      <div style={{ position: "absolute", left: 1170, top: 200, width: 640, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.amber, ...pop(frame, unique) }}>⭐ UNIQUE: compatibility-aware search</div>

        <Card style={{ ...rise(frame, cueFrame(ID, 3)) }}>
          <div style={{ fontSize: 28, color: C.dim }}>Patient needs</div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 14 }}>
            <Drop label="A+" size={92} />
            <div style={{ fontSize: 50 }}>⟵</div>
            <div style={{ display: "flex", gap: 12 }}>
              {COMPATIBLE.map((g, i) => (
                <Drop
                  key={g}
                  label={g}
                  size={74}
                  color={g === "A+" ? C.red : C.amber}
                  style={{ ...pop(frame, groups + 20 + i * 18) }}
                />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 26, color: C.dim, marginTop: 16, ...rise(frame, cueFrame(ID, 5), 10) }}>
            Other apps: <s>1 group</s> → RaktSetu: <b style={{ color: C.amber }}>4 groups = up to 4× donors</b>
          </div>
        </Card>

        <Card style={{ ...rise(frame, pipeline) }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            One <span style={{ color: "#22c55e", fontFamily: "monospace" }}>$geoNear</span> pipeline
          </div>
          {["📍 Nearby donors (2dsphere)", "✅ Eligible today only", "🏆 Ranked by Match Score"].map((s, i) => (
            <div key={s} style={{ fontSize: 28, marginTop: 12, ...slideIn(frame, pipeline + 45 + i * 75, 40) }}>
              {s}
            </div>
          ))}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {SCORE.map((s, i) => {
              const start = pipeline + 300 + i * 30;
              return (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, opacity: progress(frame, start, start + 10) }}>
                  <div style={{ width: 170, fontSize: 24, color: C.dim }}>{s.label}</div>
                  <div
                    style={{
                      height: 26,
                      borderRadius: 13,
                      background: s.color,
                      width: interpolate(progress(frame, start, start + 25), [0, 1], [0, s.pts * 6.5]),
                    }}
                  />
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{s.pts}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </SceneShell>
  );
};
