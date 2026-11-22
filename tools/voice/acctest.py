# Voice/accent test for a new episode: per character variants A (designed), B (clone of an edge-tts voice speaking English),
# C (clone of that edge voice speaking its own language, if ref_native given). usage: python tools/voice/acctest.py <ep>
import asyncio, json, subprocess, sys, torch, soundfile as sf, edge_tts
from qwen_tts import Qwen3TTSModel
EP=sys.argv[1]; O=f"voices/{EP}/acc"; C=json.load(open(f"voices/{EP}/acctest.json")); torch.set_num_threads(4)
async def edge(text,voice,out):
    await edge_tts.Communicate(text,voice).save(out+".mp3")
    subprocess.run(["ffmpeg","-y","-v","error","-i",out+".mp3","-ar","24000","-ac","1",out],check=True)
async def prep():
    for who,c in C.items():
        if "edge" in c:
            await edge(c["ref_en"],c["edge"],f"{O}/ref_{who}_B.wav")
            if "ref_native" in c: await edge(c["ref_native"],c["edge"],f"{O}/ref_{who}_C.wav")
asyncio.run(prep())
vd=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",device_map="cpu",dtype=torch.float32)
for who,c in C.items():
    torch.manual_seed(3); w,sr=vd.generate_voice_design(text=c["ref_en"],language="English",instruct=c["design"]); sf.write(f"{O}/ref_{who}_A.wav",w[0],sr); print("design",who,flush=True)
del vd
b=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base",device_map="cpu",dtype=torch.float32)
for who,c in C.items():
    for v,rt in (("A",c["ref_en"]),("B",c["ref_en"]),("C",c.get("ref_native"))):
        if v=="B" and "edge" not in c: continue
        if v=="C" and not rt: continue
        p=b.create_voice_clone_prompt(ref_audio=f"{O}/ref_{who}_{v}.wav",ref_text=rt)
        for k,t in enumerate(c["test"]):
            cap=int(14*(len(t.split())*0.55+2.5)); torch.manual_seed(1)
            w,sr=b.generate_voice_clone(text=t,language="English",voice_clone_prompt=p,max_new_tokens=cap)
            sf.write(f"{O}/{who}_{v}_{k}.wav",w[0],sr); print(who,v,k,flush=True)
