import asyncio, json, re, edge_tts
from mutagen.mp3 import MP3
OUT="voices/igboshort/voice"
LINES=[]; chap=0
for ln in open("voices/igboshort/script.md",encoding="utf8"):
    if ln.startswith("## ") and re.match(r"## \d",ln): chap=int(ln[3]); continue
    if ln.startswith("---"): break
    m=re.match(r"^(PIN|TAIWO|KEHINDE|MAMA|CHIEF|DOCTOR): (.+)$",ln.strip())
    if m: LINES.append((m.group(1).lower(),m.group(2).replace("…","...").strip(),chap))
VO={"pin":("en-US-AndrewNeural","+4%","+0Hz"),
    "taiwo":("en-NG-AbeoNeural","+0%","+0Hz"),
    "kehinde":("en-NG-AbeoNeural","+0%","+10Hz"),
    "mama":("en-NG-EzinneNeural","+0%","+0Hz"),
    "chief":("en-NG-AbeoNeural","-8%","-18Hz"),
    "doctor":("en-ZA-LukeNeural","+0%","+0Hz")}
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
    out=[]; t=0.25
    for i,(who,text,ch) in enumerate(LINES):
        w=await one(i,who,text); d=MP3(f"{OUT}/{i:03d}.mp3").info.length
        out.append({"i":i,"who":who,"chapter":ch,"text":text,"start":round(t,3),"dur":round(d,3),"words":[[round(t+a,3),round(t+b,3),x] for a,b,x in w]})
        t+=d+(0.22 if i+1<len(LINES) and LINES[i+1][2]!=ch else 0.08)
    json.dump({"total":round(t+0.6,3),"lines":out},open(f"{OUT}/lines.json","w"),indent=1); print("total",t,len(LINES))
asyncio.run(main())
