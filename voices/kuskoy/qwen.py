import json, re, time, sys, torch, soundfile as sf, subprocess
from qwen_tts import Qwen3TTSModel
OUT="voices/kuskoy/voice3"; SRC="voices/kuskoy/script2.md"
ONLY=int(sys.argv[1]) if len(sys.argv)>1 else 999
D={"pin":"A young male YouTube storyteller, bright and warm, genuinely amazed, smiling while he talks, lively pitch changes and natural pauses, conversational, not robotic.",
   "hasan":"An old Turkish village man in his sixties speaking English with a strong, thick Turkish accent. Warm, slightly raspy, cheerful and proud, relaxed village pace.",
   "ayse":"A Turkish woman in her forties speaking English with a clear Turkish accent. Confident, witty and a little teasing, expressive and friendly.",
   "tourist":"An American man in his thirties, skeptical and surprised, expressive and slightly sarcastic, casual tone."}
L=[];chap=0
for s in open(SRC,encoding="utf8"):
    s=s.strip()
    if re.match(r"## \d",s): chap=int(s[3]); continue
    if s.startswith("---"): break
    m=re.match(r"^WHISTLE: ([\d.]+)$",s)
    if m: L.append(("whistle",float(m.group(1)),chap)); continue
    m=re.match(r"^(PIN|HASAN|AYSE|TOURIST): (.+)$",s)
    if m: L.append((m.group(1).lower(),m.group(2).replace("Kuşköy","Kush-koy"),chap))
torch.set_num_threads(4)
m=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",device_map="cpu",dtype=torch.float32)
n=0
for i,(who,text,ch) in enumerate(L):
    if who=="whistle": continue
    if n>=ONLY: break
    t0=time.time()
    torch.manual_seed(7)
    w,sr=m.generate_voice_design(text=text,language="English",instruct=D[who])
    sf.write(f"{OUT}/{i:03d}.wav",w[0],sr); n+=1
    print(i,who,round(time.time()-t0,1),"s for",round(len(w[0])/sr,2),"s audio",flush=True)
