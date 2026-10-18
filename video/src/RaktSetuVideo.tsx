import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Fragment } from "react";
import { S01Intro } from "./scenes/S01Intro";
import { S02Problem } from "./scenes/S02Problem";
import { S03Architecture } from "./scenes/S03Architecture";
import { S04Find } from "./scenes/S04Find";
import { S05Sos } from "./scenes/S05Sos";
import { S06Passport } from "./scenes/S06Passport";
import { S07Camps } from "./scenes/S07Camps";
import { S08Insights } from "./scenes/S08Insights";
import { S09Database } from "./scenes/S09Database";
import { S10Tips } from "./scenes/S10Tips";
import { S11Outro } from "./scenes/S11Outro";
import { getScene, sceneFrames, TRANSITION_FRAMES } from "./lib/timing";

/** Scene order. Each scene lasts exactly as long as its voiceover (+ a short pause). */
export const SCENE_LIST = [
  { id: "01-intro", name: "Intro", Component: S01Intro },
  { id: "02-problem", name: "Problem", Component: S02Problem },
  { id: "03-architecture", name: "Architecture", Component: S03Architecture },
  { id: "04-find", name: "Find Donors", Component: S04Find },
  { id: "05-sos", name: "SOS", Component: S05Sos },
  { id: "06-passport", name: "Donor Passport", Component: S06Passport },
  { id: "07-camps", name: "Camps", Component: S07Camps },
  { id: "08-insights", name: "Insights", Component: S08Insights },
  { id: "09-database", name: "MongoDB", Component: S09Database },
  { id: "10-tips", name: "Tips", Component: S10Tips },
  { id: "11-outro", name: "Outro", Component: S11Outro },
];

export const RaktSetuVideo: React.FC = () => (
  <TransitionSeries>
    {SCENE_LIST.map(({ id, name, Component }, i) => (
      <Fragment key={id}>
        {i > 0 && (
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />
        )}
        <TransitionSeries.Sequence name={name} durationInFrames={sceneFrames(getScene(id))}>
          <Component />
        </TransitionSeries.Sequence>
      </Fragment>
    ))}
  </TransitionSeries>
);
