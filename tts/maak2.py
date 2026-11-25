import soundfile as sf, numpy as np, json
from kokoro import KPipeline
text = open('tts/proef.txt').read().strip()
VARS = [('michael_traag', 'am_michael', 0.9), ('michael_onyx', 'am_michael,am_onyx', 0.92),
        ('fenrir', 'am_fenrir', 0.92), ('lewis_uk', 'bm_lewis', 0.92)]
for name, voice, speed in VARS:
    p = KPipeline(lang_code='b' if voice.startswith('b') else 'a')
    v = p.load_voice(voice) if ',' in voice else voice
    audio, words, off = [], [], 0.0
    for r in p(text, voice=v, speed=speed):
        a = r.audio.numpy()
        for t in (r.tokens or []):
            if t.start_ts is not None and t.end_ts is not None:
                words.append([t.text, round(off + t.start_ts, 3), round(off + t.end_ts, 3)])
        audio.append(a); off += len(a) / 24000
    sf.write(f'tts/v2_kokoro_{name}.wav', np.concatenate(audio), 24000)
    json.dump(words, open(f'tts/v2_kokoro_{name}.json', 'w'))
    print(name, round(off, 1))
