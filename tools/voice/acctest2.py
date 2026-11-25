# Accent test v2: several designed voices per character (VoiceDesign), each cloned with Base and used on the test lines.
# voices/<ep>/acctest2.json: {who: {ref: text, designs: [instruct,...], test: [lines]}}  -> voices/<ep>/acc2/<who>_<d>_<k>.wav
import json, sys, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
EP = sys.argv[1]; O = f"voices/{EP}/acc2"; C = json.load(open(f"voices/{EP}/acctest2.json")); torch.set_num_threads(4)
vd = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
for who, c in C.items():
    for d, ins in enumerate(c["designs"]):
        torch.manual_seed(11 + d); w, sr = vd.generate_voice_design(text=c["ref"], language="English", instruct=ins)
        sf.write(f"{O}/ref_{who}_{d}.wav", w[0], sr); print("design", who, d, flush=True)
del vd
b = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
for who, c in C.items():
    for d in range(len(c["designs"])):
        p = b.create_voice_clone_prompt(ref_audio=f"{O}/ref_{who}_{d}.wav", ref_text=c["ref"])
        for k, t in enumerate(c["test"]):
            torch.manual_seed(1); w, sr = b.generate_voice_clone(text=t, language="English", voice_clone_prompt=p, max_new_tokens=int(14 * (len(t.split()) * 0.55 + 2.5)))
            sf.write(f"{O}/{who}_{d}_{k}.wav", w[0], sr); print(who, d, k, flush=True)
