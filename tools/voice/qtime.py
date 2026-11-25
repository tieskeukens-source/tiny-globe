# Build voices/<ep>/voice/lines.json (timeline) with whisper word timings. usage: python tools/voice/qtime.py <ep>
import re, sys, json, soundfile as sf, numpy as np
from faster_whisper import WhisperModel
EP = sys.argv[1]; OUT = f"voices/{EP}/voice"; CAST = json.load(open(f"voices/{EP}/cast.json"))
L = []; chap = 0
for s in open(f"voices/{EP}/script2.md", encoding="utf8"):
    s = s.strip()
    if re.match(r"## \d", s): chap = int(s[3]); continue
    if s.startswith("---"): break
    m = re.match(r"^(WHISTLE|SFX): ([\d.]+)", s)
    if m: L.append(("whistle" if m.group(1) == "WHISTLE" else "sfx", float(m.group(2)), chap)); continue
    m = re.match(r"^([A-Z]+): (.+)$", s)
    if m and m.group(1).lower() in CAST: L.append((m.group(1).lower(), m.group(2), chap))
wm = WhisperModel("small.en", device="cpu", compute_type="int8")
out = []; t = 0.9
for i, (who, x, ch) in enumerate(L):
    if who in ("whistle", "sfx"):
        out.append({"i": i, "who": who, "chapter": ch, "text": f"({who})", "start": round(t, 3), "dur": x, "words": []}); t += x + 0.1; continue
    a, sr = sf.read(f"{OUT}/{i:03d}.wav"); d = len(a) / sr
    a16 = a if a.ndim == 1 else a.mean(1); a16 = np.interp(np.arange(0, len(a16), sr / 16000), np.arange(len(a16)), a16).astype(np.float32)
    segs, _ = wm.transcribe(a16, word_timestamps=True, language="en")
    W = [[round(t + w.start, 3), round(t + w.end, 3), w.word.strip()] for s in segs for w in s.words]
    out.append({"i": i, "who": who, "chapter": ch, "text": x, "start": round(t, 3), "dur": round(d, 3), "words": W, "heard": " ".join(w[2] for w in W)})
    t += d + (0.22 if i + 1 < len(L) and L[i + 1][2] != ch else 0.06)
json.dump({"total": round(t + 0.6, 3), "lines": out}, open(f"{OUT}/lines.json", "w"), indent=1, ensure_ascii=False); print("total", t)
