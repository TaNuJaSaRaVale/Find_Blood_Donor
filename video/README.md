# 🎬 video/: RaktSetu explainer video

A ~4-minute explainer video made **with code** using [Remotion](https://remotion.dev) (React → MP4),
narrated in **Indian English** by a free Microsoft Edge neural voice (`en-IN-PrabhatNeural`).

Output: `out/RaktSetu-Explainer.mp4` (1920×1080, 30 fps). Not committed to git; render it yourself (below).

## Scenes
| # | Scene | Shows |
|---|---|---|
| 1 | Intro | "Every 2 seconds…" stat → RaktSetu logo reveal |
| 2 | Problem | WhatsApp chaos: wrong group, too far, recently donated |
| 3 | Architecture | User → React → REST API → Node/Express → MongoDB, 5 collections |
| 4 | Find Donors | Real screenshot + compatibility chips + `$geoNear` match score |
| 5 | SOS | SOS form → donors alerted → phone revealed after pledge → confirm |
| 6 | Donor Passport | Eligibility countdown ring, levels, badges, Bombay blood group |
| 7 | Camps | Atomic seat booking (`findOneAndUpdate` + `$expr`) |
| 8 | Insights | Charts + Shortage Radar |
| 9 | MongoDB | 2dsphere, TTL, embedded arrays, aggregation |
| 10 | Tips | How to use the app effectively |
| 11 | Outro | Tagline |

## Commands
```bash
npm install
npm run dev                         # Remotion Studio preview at http://localhost:3000
npx remotion render RaktSetu out/RaktSetu-Explainer.mp4   # render the MP4
npx remotion render Scene-04-find out/find.mp4            # render one scene only
```
On Linux, if Remotion cannot download its own browser, add `--browser-executable=/usr/bin/google-chrome`.

## Change the narration
1. Edit the text in `voiceover/scenes.json`. Words are spelled the way they should be **spoken**, e.g. "Rakt Setu", "S O S".
2. Regenerate audio + captions (free, needs internet):
   ```bash
   pip install edge-tts
   python voiceover/generate.py
   ```
   This writes `public/voiceover/*.mp3` and `src/voiceover.json` (durations + captions). The video timeline adapts automatically.
3. To use a female voice, set `VOICE = "en-IN-NeerjaNeural"` in `voiceover/generate.py`.

## Folder map
| Path | Purpose |
|---|---|
| `src/Root.tsx` | Registers the full video (`RaktSetu`) and each scene separately (`Scene-…`) |
| `src/RaktSetuVideo.tsx` | Scene order + fade transitions |
| `src/scenes/` | One file per scene |
| `src/components/` | `SceneShell` (background, title, audio, captions), `BrowserFrame` (scrolling screenshot), `Captions`, small UI pieces |
| `src/lib/` | Theme colours & fonts, timing (scene lengths from the voiceover), animation helpers |
| `src/voiceover.json` | Generated: audio durations and caption timings |
| `public/screens/` | Real screenshots of the app (1440 px wide) |
| `public/voiceover/` | Generated narration MP3 files |
| `voiceover/` | Narration script + generator script |
