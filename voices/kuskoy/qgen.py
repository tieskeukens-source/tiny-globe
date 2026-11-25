# generate all lines for ONE character with a fixed cloned voice
import re, sys, time, json, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
WHO=sys.argv[1]; OUT="voices/kuskoy/voice4"; SRC="voices/kuskoy/script2.md"
REF={"pin":"Did you know there's a village in Turkey where people talk by whistling?",
     "hasan":"Welcome to my village. Here we grow hazelnuts, we drink tea all day, and we whistle to our neighbours.",
     "ayse":"Welcome, welcome! Sit down, I will bring you tea. In our village, everybody knows how to whistle."}
TOUR="An American man in his thirties, skeptical and surprised, expressive and slightly sarcastic, casual tone."
L=[]
for s in open(SRC,encoding="utf8"):
    s=s.strip()
    if s.startswith("---"): break
    if re.match(r"^WHISTLE: ",s): L.append(("whistle","")); continue
    m=re.match(r"^(PIN|HASAN|AYSE|TOURIST): (.+)$",s)
    if m: L.append((m.group(1).lower(),m.group(2).replace("Kuşköy","Kush-koy")))
torch.set_num_threads(4)
if WHO=="tourist":
    m=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",device_map="cpu",dtype=torch.float32)
    torch.manual_seed(5); w,sr=m.generate_voice_design(text="Wait, what? You people really talk by whistling? Come on, that sounds totally crazy to me.",language="English",instruct=TOUR)
    sf.write("/tmp/tref.wav",w[0],sr); del m
    ref,reft="/tmp/tref.wav","Wait, what? You people really talk by whistling? Come on, that sounds totally crazy to me."
else: ref,reft=f"voices/kuskoy/ref/{WHO}.wav",REF[WHO]
b=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base",device_map="cpu",dtype=torch.float32)
p=b.create_voice_clone_prompt(ref_audio=ref,ref_text=reft)
for i,(who,text) in enumerate(L):
    if who!=WHO: continue
    t0=time.time(); cap=int(14*(len(text.split())*0.55+2.5))
    for seed in (1,2,3):
        torch.manual_seed(seed); w,sr=b.generate_voice_clone(text=text,language="English",voice_clone_prompt=p,max_new_tokens=cap)
        d=len(w[0])/sr
        if d < len(text.split())*0.6+2.5: break
    sf.write(f"{OUT}/{i:03d}.wav",w[0],sr); print(i,who,round(time.time()-t0),"s ->",round(d,2),flush=True)
