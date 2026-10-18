import { Composition, Folder } from "remotion";
import { RaktSetuVideo, SCENE_LIST } from "./RaktSetuVideo";
import { FPS, getScene, sceneFrames, TOTAL_FRAMES } from "./lib/timing";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RaktSetu" component={RaktSetuVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    {/* Each scene on its own, handy for previewing or re-rendering one part */}
    <Folder name="Scenes">
      {SCENE_LIST.map(({ id, Component }) => (
        <Composition
          key={id}
          id={`Scene-${id}`}
          component={Component}
          durationInFrames={sceneFrames(getScene(id))}
          fps={FPS}
          width={1920}
          height={1080}
        />
      ))}
    </Folder>
  </>
);
