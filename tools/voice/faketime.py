# Placeholder timeline (0.4 s per word) so the world can be built before the voices exist. usage: python tools/voice/faketime.py <ep> <out.json>
import re, sys, json
EP, OUT = sys.argv[1], sys.argv[2]; L = []; chap = 0
for s in open(f"voices/{EP}/script2.md", encoding="utf8"):
    s = s.strip()
    if re.match(r"## \d", s): chap = int(s[3]); continue
    if s.startswith("---"): break
    m = re.match(r"^([A-Z]+): (.+)$", s)
    if m: L.append((m.group(1).lower(), m.group(2), chap))
out = []; t = 0.9
for i, (who, x, ch) in enumerate(L):
    ws = x.split(); W = []; a = t
    for w in ws: W.append([round(a, 3), round(a + 0.34, 3), w]); a += 0.4
    out.append({"i": i, "who": who, "chapter": ch, "text": x, "start": round(t, 3), "dur": round(a - t, 3), "words": W})
    t = a + (0.22 if i + 1 < len(L) and L[i + 1][2] != ch else 0.06)
json.dump({"total": round(t + 0.6, 3), "lines": out}, open(OUT, "w"), indent=1, ensure_ascii=False); print("total", round(t, 1))
