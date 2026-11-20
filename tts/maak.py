import sys, soundfile as sf, numpy as np, json
from kokoro import KPipeline
text = open('tts/proef.txt').read().strip()
pipe = KPipeline(lang_code='a')
for voice in ['am_michael', 'am_adam', 'af_heart', 'bm_george']:
    lang = 'b' if voice.startswith('b') else 'a'
    p = KPipeline(lang_code=lang) if lang != 'a' else pipe
    audio, words = [], []
    off = 0.0
    for r in p(text, voice=voice, speed=0.95):
        a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.array(r.audio)
        for t in (r.tokens or []):
            if t.start_ts is not None and t.end_ts is not None:
                words.append([t.text, round(off + t.start_ts, 3), round(off + t.end_ts, 3)])
        audio.append(a); off += len(a) / 24000
    sf.write(f'tts/kokoro_{voice}.wav', np.concatenate(audio), 24000)
    json.dump(words, open(f'tts/kokoro_{voice}.json', 'w'))
    print(voice, round(off, 1), 'sec', len(words), 'woorden')
