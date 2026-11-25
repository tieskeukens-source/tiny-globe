# Generate every line of ONE character with a fixed cloned voice. usage: python tools/voice/qgen.py <ep> <who>
# voices/<ep>/cast.json: {who: {ref: wav path, text: transcript of the ref}}; script: voices/<ep>/script2.md
import re, sys, time, json, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
EP, WHO = sys.argv[1], sys.argv[2]; OUT = f"voices/{EP}/voice"; CAST = json.load(open(f"voices/{EP}/cast.json"))
FIX = CAST.get("_say", {})   # spelling for the TTS, e.g. {"Kuşköy": "Kush-koy"}
L = []
for s in open(f"voices/{EP}/script2.md", encoding="utf8"):
    s = s.strip()
    if s.startswith("---"): break
    if re.match(r"^(WHISTLE|SFX): ", s): L.append(("sfx", "")); continue
    m = re.match(r"^([A-Z]+): (.+)$", s)
    if m and m.group(1).lower() in CAST: t = m.group(2); [t := t.replace(a, b) for a, b in FIX.items()]; L.append((m.group(1).lower(), t))
torch.set_num_threads(4)
import os, shutil, subprocess
C = CAST[WHO]
if not os.path.exists(C["ref"]) and "edge" in C:   # new recurring character: make its reference voice from an edge-tts voice (variant B)
    import asyncio, edge_tts
    os.makedirs(os.path.dirname(C["ref"]), exist_ok=True)
    async def mk():
        for a in range(6):
            try: await edge_tts.Communicate(C["text"], C["edge"]).save("/tmp/ref.mp3"); return
            except Exception as e: print("edge retry", a, e, flush=True); await asyncio.sleep(3 + 3 * a)
        raise SystemExit("edge voice failed")
    asyncio.run(mk())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "/tmp/ref.mp3", "-ar", "24000", "-ac", "1", C["ref"]], check=True)
    shutil.copy(C["ref"], f"{OUT}/ref_{WHO}.wav")
b = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
p = b.create_voice_clone_prompt(ref_audio=CAST[WHO]["ref"], ref_text=CAST[WHO]["text"])
for i, (who, text) in enumerate(L):
    if who != WHO: continue
    t0 = time.time(); cap = int(14 * (len(text.split()) * 0.55 + 2.5))
    for seed in (1, 2, 3):
        torch.manual_seed(seed); w, sr = b.generate_voice_clone(text=text, language="English", voice_clone_prompt=p, max_new_tokens=cap)
        d = len(w[0]) / sr
        if d < len(text.split()) * 0.6 + 2.5: break
    sf.write(f"{OUT}/{i:03d}.wav", w[0], sr); print(i, who, round(time.time() - t0), "s ->", round(d, 2), flush=True)
