"""
Generates the voiceover with Microsoft Edge neural TTS (free, no API key).

    pip install edge-tts
    python voiceover/generate.py            # run from the video/ folder

Writes public/voiceover/<scene>.mp3 + .srt (captions), then src/voiceover.json
with each scene's duration so the video timeline matches the audio exactly.
"""
import asyncio
import json
import re
import subprocess
from pathlib import Path

import edge_tts

VOICE = "en-IN-PrabhatNeural"  # Indian English male. Female: en-IN-NeerjaNeural
RATE = "+4%"

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "voiceover"


def srt_time(t: str) -> float:
    h, m, rest = t.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def parse_srt(text: str):
    cues = []
    for block in text.strip().split("\n\n"):
        lines = block.strip().splitlines()
        if len(lines) >= 3:
            start, end = [srt_time(x.strip()) for x in lines[1].split("-->")]
            cues.append({"start": start, "end": end, "text": " ".join(lines[2:])})
    return cues


def duration(path: Path) -> float:
    out = subprocess.run(
        ["npx", "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    return float(re.findall(r"[\d.]+", out)[-1])


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    scenes = json.loads((ROOT / "voiceover" / "scenes.json").read_text())
    result = []
    for scene in scenes:
        mp3 = OUT / f"{scene['id']}.mp3"
        communicate = edge_tts.Communicate(scene["text"], VOICE, rate=RATE)
        submaker = edge_tts.SubMaker()
        with mp3.open("wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                    submaker.feed(chunk)
        captions = parse_srt(submaker.get_srt())
        secs = duration(mp3)
        result.append({"id": scene["id"], "file": f"voiceover/{scene['id']}.mp3", "seconds": round(secs, 3), "captions": captions})
        print(f"✓ {scene['id']}: {secs:.1f}s, {len(captions)} captions")

    (ROOT / "src" / "voiceover.json").write_text(json.dumps(result, indent=2))
    print(f"Total: {sum(s['seconds'] for s in result):.1f}s")


asyncio.run(main())
