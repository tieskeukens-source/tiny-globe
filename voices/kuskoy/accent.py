# Accent test: 3 ways to get a Turkish accent, each cloned (=same voice every line)
import asyncio, subprocess, torch, soundfile as sf, edge_tts
from qwen_tts import Qwen3TTSModel
O="voices/kuskoy/acc"; torch.set_num_threads(4)
EN_H="Welcome to my village. Here we grow hazelnuts, we drink tea all day, and we whistle to our neighbours."
EN_A="Welcome, welcome! Sit down, I will bring you tea. In our village, everybody knows how to whistle."
TR_H="Köyümüze hoş geldiniz. Burada fındık yetiştiriyoruz, bütün gün çay içiyoruz ve komşularımıza ıslıkla sesleniyoruz."
TR_A="Hoş geldiniz, hoş geldiniz! Oturun, size çay getireyim. Bizim köyde herkes ıslık çalmayı bilir."
DES={"hasan":"An old Turkish village man, about 65, who learned English late in life. Very heavy Turkish accent: rolled R sounds, Turkish vowels, syllable-timed rhythm, non-native stress. Warm, raspy, cheerful.",
     "ayse":"A Turkish woman, about 45, from a Black Sea village, speaking English as a second language with a heavy Turkish accent: rolled R, Turkish vowels, non-native rhythm. Confident, witty, teasing."}
TEST={"hasan":["A shout gets lost in the valley. A whistle carries more than half a mile.","She says you talk too much."],
      "ayse":["Any word. Even your name.","Yes. That is why young people stopped whistling."]}
async def edge(text,voice,out):
    await edge_tts.Communicate(text,voice).save(out+".mp3")
    subprocess.run(["ffmpeg","-y","-v","error","-i",out+".mp3","-ar","24000","-ac","1",out],check=True)
async def prep():
    await edge(EN_H,"tr-TR-AhmetNeural",f"{O}/ref_hasan_B.wav"); await edge(TR_H,"tr-TR-AhmetNeural",f"{O}/ref_hasan_C.wav")
    await edge(EN_A,"tr-TR-EmelNeural",f"{O}/ref_ayse_B.wav"); await edge(TR_A,"tr-TR-EmelNeural",f"{O}/ref_ayse_C.wav")
asyncio.run(prep())
vd=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",device_map="cpu",dtype=torch.float32)
for who,en in (("hasan",EN_H),("ayse",EN_A)):
    torch.manual_seed(3); w,sr=vd.generate_voice_design(text=en,language="English",instruct=DES[who]); sf.write(f"{O}/ref_{who}_A.wav",w[0],sr)
del vd
b=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base",device_map="cpu",dtype=torch.float32)
REFT={"hasan":{"A":EN_H,"B":EN_H,"C":TR_H},"ayse":{"A":EN_A,"B":EN_A,"C":TR_A}}
for who in TEST:
    for v in "ABC":
        p=b.create_voice_clone_prompt(ref_audio=f"{O}/ref_{who}_{v}.wav",ref_text=REFT[who][v])
        for k,t in enumerate(TEST[who]):
            torch.manual_seed(1); w,sr=b.generate_voice_clone(text=t,language="English",voice_clone_prompt=p)
            sf.write(f"{O}/{who}_{v}_{k}.wav",w[0],sr); print(who,v,k,flush=True)
p=b.create_voice_clone_prompt(ref_audio="voices/kuskoy/ref/pin.wav",ref_text="Did you know there's a village in Turkey where people talk by whistling?")
for k,t in enumerate(["That whistle just said: Hasan, come for tea!","The village is called Kush-koy. It means bird village."]):
    torch.manual_seed(1); w,sr=b.generate_voice_clone(text=t,language="English",voice_clone_prompt=p); sf.write(f"{O}/pin_{k}.wav",w[0],sr); print("pin",k,flush=True)
