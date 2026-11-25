import asyncio, json, sys, edge_tts, subprocess, os
from mutagen.mp3 import MP3
LINES = [
 ("host","In this town, one step can change your country."),
 ("host","Netherlands."),
 ("host","Belgium."),
 ("host","Netherlands!"),
 ("host","This is Baarle. Twenty-two tiny pieces of Belgium, scattered inside the Netherlands."),
 ("host","So... which country do you live in?"),
 ("local","Depends. Where is my front door?"),
 ("host","Your... front door?"),
 ("local","The door decides. Some people even moved their door, to pay less tax."),
 ("host","You can change country... with a door?!"),
]
VO = {"host":("en-US-AndrewNeural","+4%","+0Hz"), "local":("nl-BE-ArnaudNeural","+0%","+0Hz")}
GAP = {1:0.10,2:0.10,3:0.10}  # snappy steps
async def one(i, who, text):
    v, rate, pitch = VO[who]
    for attempt in range(8):
        try:
            c = edge_tts.Communicate(text, v, rate=rate, pitch=pitch, boundary="WordBoundary")
            words=[]; 
            with open(f"voices/baarle/voice/{i:02d}.mp3","wb") as f:
                async for ch in c.stream():
                    if ch["type"]=="audio": f.write(ch["data"])
                    elif ch["type"]=="WordBoundary": words.append((ch["offset"]/1e7,(ch["offset"]+ch["duration"])/1e7,ch["text"]))
            return words
        except Exception as e:
            print("retry",i,e); await asyncio.sleep(2+attempt*2)
async def main():
    out=[]; t=0.25
    for i,(who,text) in enumerate(LINES):
        w = await one(i,who,text)
        d = MP3(f"voices/baarle/voice/{i:02d}.mp3").info.length
        out.append({"i":i,"who":who,"text":text,"start":round(t,3),"dur":round(d,3),"words":[[round(t+a,3),round(t+b,3),x] for a,b,x in w]})
        t += d + GAP.get(i+1, 0.18)
    json.dump({"total":round(t+0.6,3),"lines":out},open("voices/baarle/voice/lines.json","w"),indent=1)
    print("total",t)
asyncio.run(main())
