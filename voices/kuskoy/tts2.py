import asyncio, json, re, edge_tts
from mutagen.mp3 import MP3
OUT="voices/kuskoy/voice2"; SRC="voices/kuskoy/script2.md"
L=[]; chap=0
for ln in open(SRC,encoding="utf8"):
    s=ln.strip()
    if re.match(r"## \d",s): chap=int(s[3]); continue
    if s.startswith("---"): break
    m=re.match(r"^WHISTLE: ([\d.]+)$",s)
    if m: L.append(("whistle",float(m.group(1)),chap)); continue
    m=re.match(r"^(PIN|HASAN|AYSE|TOURIST): (.+)$",s)
    if m: L.append((m.group(1).lower(),m.group(2),chap))
VO={"pin":("en-US-AndrewNeural","+14%","+0Hz"),
    "hasan":("tr-TR-AhmetNeural","-4%","-6Hz"),
    "ayse":("tr-TR-EmelNeural","+0%","+0Hz"),
    "tourist":("en-US-GuyNeural","+10%","+0Hz")}
async def one(i,who,text):
    v,r,p=VO[who]
    for a in range(8):
        try:
            c=edge_tts.Communicate(text,v,rate=r,pitch=p,boundary="WordBoundary"); w=[]
            with open(f"{OUT}/{i:03d}.mp3","wb") as f:
                async for ch in c.stream():
                    if ch["type"]=="audio": f.write(ch["data"])
                    elif ch["type"]=="WordBoundary": w.append((ch["offset"]/1e7,(ch["offset"]+ch["duration"])/1e7,ch["text"]))
            return w
        except Exception as e:
            print("retry",i,e); await asyncio.sleep(2+a*2)
async def main():
    out=[]; t=0.9  # room for flag title card
    for i,(who,text,ch) in enumerate(L):
        if who=="whistle":
            out.append({"i":i,"who":"whistle","chapter":ch,"text":"(whistle)","start":round(t,3),"dur":text,"words":[]}); t+=text+0.1; continue
        w=await one(i,who,text); d=MP3(f"{OUT}/{i:03d}.mp3").info.length
        out.append({"i":i,"who":who,"chapter":ch,"text":text,"start":round(t,3),"dur":round(d,3),"words":[[round(t+a,3),round(t+b,3),x] for a,b,x in w]})
        t+=d+(0.22 if i+1<len(L) and L[i+1][2]!=ch else 0.08)
    json.dump({"total":round(t+0.6,3),"lines":out},open(f"{OUT}/lines.json","w"),indent=1); print("total",t,len(L))
asyncio.run(main())
