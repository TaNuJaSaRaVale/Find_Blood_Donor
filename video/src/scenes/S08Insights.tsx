import { useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { SceneShell } from "../components/SceneShell";
import { Drop } from "../components/ui";
import { pop, rise, slideIn } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "08-insights";

const RADAR = [
  { g: "O−", level: "Critical", color: "#ef4444" },
  { g: "AB−", level: "Low", color: "#f97316" },
  { g: "B−", level: "Watch", color: "#eab308" },
  { g: "B+", level: "Healthy", color: C.green },
];

export const S08Insights: React.FC = () => {
  const frame = useCurrentFrame();
  const charts = cueFrame(ID, 1);
  const radar = cueFrame(ID, 2);

  return (
    <SceneShell id={ID} kicker="Feature 5" title="Insights & Shortage Radar">
      <BrowserFrame
        screen="insights"
        url="/insights"
        width={1000}
        height={680}
        scroll={[charts, radar + 60]}
        scrollTo={0.85}
        style={{ position: "absolute", left: 110, top: 210, ...slideIn(frame, 8, -100) }}
      />
      <div style={{ position: "absolute", left: 1170, top: 220, width: 640 }}>
        <div style={{ fontSize: 34, fontWeight: 800, ...rise(frame, radar) }}>📡 Demand vs eligible supply</div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 8, ...rise(frame, radar + 15) }}>per blood group, per city</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 30 }}>
          {RADAR.map((r, i) => (
            <div
              key={r.g}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 22px",
                borderRadius: 20,
                border: `3px solid ${r.color}`,
                background: `${r.color}1f`,
                ...pop(frame, radar + 60 + i * 25),
              }}
            >
              <Drop label={r.g} size={66} />
              <div style={{ fontSize: 30, fontWeight: 800, color: r.color }}>{r.level}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 30, lineHeight: 1.5, ...rise(frame, radar + 200) }}>
          Built with <span style={{ color: "#22c55e", fontFamily: "monospace" }}>$facet</span>,{" "}
          <span style={{ color: "#22c55e", fontFamily: "monospace" }}>$group</span> and{" "}
          <span style={{ color: "#22c55e", fontFamily: "monospace" }}>$dateToString</span>
        </div>
      </div>
    </SceneShell>
  );
};
