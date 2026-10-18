import { useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { SceneShell } from "../components/SceneShell";
import { Code } from "../components/ui";
import { pop, rise, slideIn } from "../lib/anim";
import { C } from "../lib/theme";
import { cueFrame } from "../lib/timing";

const ID = "07-camps";

export const S07Camps: React.FC = () => {
  const frame = useCurrentFrame();
  const notify = cueFrame(ID, 1);
  const atomic = cueFrame(ID, 2);

  return (
    <SceneShell id={ID} kicker="Feature 4" title="Donation camps">
      <BrowserFrame
        screen="camps"
        url="/camps"
        width={960}
        height={660}
        scroll={[atomic, atomic + 200]}
        style={{ position: "absolute", left: 110, top: 220, ...slideIn(frame, 8, -100) }}
      />
      <div style={{ position: "absolute", left: 1130, top: 220, width: 690, display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            padding: "20px 26px",
            borderRadius: 20,
            background: `${C.violet}26`,
            border: `2px solid ${C.violet}`,
            ...pop(frame, notify),
          }}
        >
          📣 Donors within 20 km notified
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.amber, ...rise(frame, atomic) }}>⚛️ Atomic seat booking</div>
        <Code style={{ fontSize: 23, ...rise(frame, atomic + 20) }}>
          {`camps.findOneAndUpdate(
  { _id, participants: { $ne: me },
    $expr: { $lt: ["$registeredCount",
                   "$capacity"] } },
  { $push: { participants: me },
    $inc:  { registeredCount: 1 } }
)`}
        </Code>
        <div style={{ display: "flex", gap: 16, fontSize: 28, ...rise(frame, atomic + 150) }}>
          <div style={{ padding: "12px 20px", borderRadius: 14, background: `${C.green}26`, border: `2px solid ${C.green}` }}>👆 Click A → ✅ booked</div>
          <div style={{ padding: "12px 20px", borderRadius: 14, background: `${C.red}26`, border: `2px solid ${C.red}` }}>👆 Click B → ❌ full</div>
        </div>
      </div>
    </SceneShell>
  );
};
