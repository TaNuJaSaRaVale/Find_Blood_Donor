import { useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Code } from "../components/ui";
import { pop, rise } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "09-database";

const FEATURES = [
  {
    cue: 1,
    icon: "🌍",
    title: "2dsphere index",
    sub: "location search",
    code: `{ location: "2dsphere" }
$geoNear · $near`,
    color: C.blue,
  },
  {
    cue: 2,
    icon: "⏱️",
    title: "TTL index",
    sub: "self-cleaning data",
    code: `{ expiresAt: 1 },
{ expireAfterSeconds: 0 }`,
    color: C.amber,
  },
  {
    cue: 3,
    icon: "📦",
    title: "Embedded arrays",
    sub: "donor responses",
    code: `responses: [
  { donor, status: "pledged" }
]`,
    color: C.violet,
  },
  {
    cue: 4,
    icon: "📊",
    title: "Aggregation",
    sub: "live statistics",
    code: `$facet · $group
$dateToString · $sort`,
    color: "#22c55e",
  },
];

export const S09Database: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell id={ID} kicker="Under the hood" title="The real power of MongoDB 🍃">
      <div style={{ position: "absolute", left: 110, right: 110, top: 240, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {FEATURES.map((f) => {
          const start = cueFrame(ID, f.cue);
          return (
            <div
              key={f.title}
              style={{
                padding: "26px 30px",
                borderRadius: 24,
                background: `${f.color}14`,
                border: `3px solid ${f.color}`,
                display: "flex",
                gap: 26,
                alignItems: "center",
                ...pop(frame, start),
              }}
            >
              <div style={{ fontSize: 80 }}>{f.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 40, fontWeight: 800 }}>{f.title}</div>
                <div style={{ fontSize: 26, color: C.dim, marginBottom: 14 }}>{f.sub}</div>
                <Code style={{ fontSize: 23, padding: "12px 18px", ...rise(frame, start + 20, 12) }}>{f.code}</Code>
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};
