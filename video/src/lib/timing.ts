import voiceover from "../voiceover.json";

export const FPS = 30;
/** Silence kept after each scene's narration before the next scene starts. */
export const PAD_FRAMES = 24;
/** Length of the cross-fade between scenes (overlaps the PAD, so voices never overlap). */
export const TRANSITION_FRAMES = 15;

export type Caption = { start: number; end: number; text: string };
export type SceneVoice = { id: string; file: string; seconds: number; captions: Caption[] };

export const SCENES = voiceover as SceneVoice[];

export const sceneFrames = (scene: SceneVoice) => Math.ceil(scene.seconds * FPS) + PAD_FRAMES;

export const TOTAL_FRAMES =
  SCENES.reduce((sum, s) => sum + sceneFrames(s), 0) - (SCENES.length - 1) * TRANSITION_FRAMES;

export const getScene = (id: string) => {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene ${id}`);
  return scene;
};

/** Frame at which caption `index` of a scene starts - used to sync visuals with the voice. */
export const cueFrame = (id: string, index: number, offsetSeconds = 0) =>
  Math.round((getScene(id).captions[index].start + offsetSeconds) * FPS);
