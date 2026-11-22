# build lines.json (timeline) + word timings with faster-whisper
import re, json, soundfile as sf
from faster_whisper import WhisperModel
OUT="voices/kuskoy/voice4"; SRC="voices/kuskoy/script2.md"
L=[];chap=0
for s in open(SRC,encoding="utf8"):
    s=s.strip()
    if re.match(r"## \d",s): chap=int(s[3]); continue
    if s.startswith("---"): break
    m=re.match(r"^WHISTLE: ([\d.]+)$",s)
    if m: L.append(("whistle",float(m.group(1)),chap)); continue
    m=re.match(r"^(PIN|HASAN|AYSE|TOURIST): (.+)$",s)
    if m: L.append((m.group(1).lower(),m.group(2),chap))
wm=WhisperModel("small.en",device="cpu",compute_type="int8")
out=[];t=0.9
for i,(who,x,ch) in enumerate(L):
    if who=="whistle":
        out.append({"i":i,"who":"whistle","chapter":ch,"text":"(whistle)","start":round(t,3),"dur":x,"words":[]}); t+=x+0.1; continue
    f=f"{OUT}/{i:03d}.wav"; a,sr=sf.read(f); d=len(a)/sr
    segs,_=wm.transcribe(f,word_timestamps=True,language="en")
    W=[[round(t+w.start,3),round(t+w.end,3),w.word.strip()] for s in segs for w in s.words]
    out.append({"i":i,"who":who,"chapter":ch,"text":x,"start":round(t,3),"dur":round(d,3),"words":W,"heard":" ".join(w[2] for w in W)})
    t+=d+(0.22 if i+1<len(L) and L[i+1][2]!=ch else 0.06)
json.dump({"total":round(t+0.6,3),"lines":out},open(f"{OUT}/lines.json","w"),indent=1); print("total",t)
