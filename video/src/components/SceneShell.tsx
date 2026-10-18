import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { rise } from "../lib/anim";
import { C, fontFamily } from "../lib/theme";
import { getScene } from "../lib/timing";
import { Captions } from "./Captions";

type Props = {
  id: string;
  kicker?: string;
  title?: string;
  children: React.ReactNode;
};

/** Common wrapper for every scene: background, optional heading, voiceover audio and captions. */
export const SceneShell: React.FC<Props> = ({ id, kicker, title, children }) => {
  const frame = useCurrentFrame();
  const scene = getScene(id);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily, color: C.text, overflow: "hidden" }}>
      {/* slowly drifting red glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 600px at ${interpolate(frame, [0, 900], [20, 80])}% 0%, rgba(225,29,72,0.28), transparent 70%),
                       radial-gradient(700px 500px at 100% 100%, rgba(139,92,246,0.14), transparent 70%)`,
        }}
      />
      {title && (
        <div style={{ position: "absolute", left: 110, top: 70, ...rise(frame, 4, 24) }}>
          {kicker && (
            <div style={{ color: C.muted, fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
              {kicker}
            </div>
          )}
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1.5, marginTop: 4 }}>{title}</div>
        </div>
      )}
      {children}
      <Captions captions={scene.captions} />
      <Audio src={staticFile(scene.file)} />
    </AbsoluteFill>
  );
};
