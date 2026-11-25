# THE BLOCK sound: lo-fi boom-bap (90 bpm, Am7-Dm7-G7-Cmaj7 keys, vinyl crackle), voices on the retimed starts,
# record scratch + beat drop for the punchline beat, pops on panel cuts, phone buzz, fly buzz.
# usage: python3 tools/episode/mix_block.py <voice_dir> <timeline.json> <out.mp3> <drop_line> <back_line>
import json, sys, subprocess, wave, numpy as np
from scipy.signal import butter, lfilter
vd, tlp, outp, drop, back = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
SR = 48000; TL = json.load(open(tlp)); L = TL['lines']; N = int(TL['total'] * SR); rng = np.random.default_rng(4)
def rd(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, dtype=np.float32).copy()
def put(arr, t, s, g=1.0):
    i = int(t * SR)
    if 0 <= i < N: arr[i:i + len(s)] += g * s[:N - i]
X = lambda d: np.arange(int(d * SR)) / SR
voice = np.zeros(N)
for l in L: put(voice, l['start'], rd(f"{vd}/{l['i']:03d}.wav"))
voice /= np.abs(voice).max() / 0.9
def kick():
    x = X(0.35); return np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-x * 30)) / SR) * np.exp(-x * 9)
def snare():
    x = X(0.22); b, a = butter(2, [1500 / (SR / 2), 7000 / (SR / 2)], 'band'); return (lfilter(b, a, rng.normal(0, 1, len(x))) * 0.7 + 0.4 * np.sin(2 * np.pi * 190 * x)) * np.exp(-x * 18)
def hat(o=False):
    x = X(0.2 if o else 0.05); b, a = butter(2, 7000 / (SR / 2), 'high'); return lfilter(b, a, rng.normal(0, 1, len(x))) * np.exp(-x * (18 if o else 70)) * 0.35
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def keys(ch, d):
    x = X(d); s = sum(np.sin(2 * np.pi * mf(m) * x) + 0.25 * np.sin(4 * np.pi * mf(m) * x) for m in ch)
    return s * np.minimum(1, x / 0.01) * np.exp(-x * 1.1) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * x)) / len(ch)
def bass(m, d):
    x = X(d); return (np.sin(2 * np.pi * mf(m) * x) + 0.2 * np.sin(4 * np.pi * mf(m) * x)) * np.minimum(1, x / 0.005) * np.exp(-x * 2.5)
beat = np.zeros(N); bpm = 90; st = 60 / bpm / 4   # 16th
CH = [[57, 60, 64, 67], [50, 57, 60, 65], [55, 59, 62, 65], [48, 55, 59, 64]]
kpat = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]; spat = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1]
t = 0; k = 0
while t < TL['total']:
    bar = k // 16; ch = CH[bar % 4]; sw = 0.018 if k % 2 else 0
    if kpat[k % 16]: put(beat, t, kick(), 0.9)
    if spat[k % 16]: put(beat, t, snare(), 0.55 if k % 16 != 15 else 0.25)
    if k % 2 == 0: put(beat, t + sw, hat(k % 8 == 6), 0.5)
    if k % 16 == 0: put(beat, t, keys(ch, st * 16), 0.32); put(beat, t, bass(ch[0] - 12, st * 7), 0.5)
    if k % 16 == 10: put(beat, t, bass(ch[0] - 12, st * 5), 0.4)
    t += st; k += 1
b, a = butter(2, 5500 / (SR / 2), 'low'); beat = lfilter(b, a, beat)
beat += rng.normal(0, 1, N) * (rng.random(N) < 0.0006) * 0.25   # vinyl crackle
# beat drop between the record scratch and the reaction
d0 = L[drop]['start'] - 0.35; d1 = L[back]['start']
gate = np.ones(N); i0, i1 = int(d0 * SR), int(d1 * SR); gate[i0:i1] = 0.0
gate = np.convolve(gate, np.ones(1200) / 1200, 'same')
sfx = np.zeros(N)
def scratch():
    x = X(0.35); f = 600 + 500 * np.sin(2 * np.pi * 7 * x); b, a = butter(2, [300 / (SR / 2), 3000 / (SR / 2)], 'band')
    return lfilter(b, a, rng.normal(0, 1, len(x))) * np.abs(np.sin(2 * np.pi * 7 * x)) * np.exp(-x * 4) + 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 6)
def pop(f0=700):
    x = X(0.09); return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * np.exp(-x * 60))) / SR) * np.exp(-x * 40)
def buzz(d, f):
    x = X(d); return np.sign(np.sin(2 * np.pi * f * x)) * (np.sin(2 * np.pi * 9 * x) > 0) * 0.25
put(sfx, d0, scratch(), 0.6)
for l in L: put(sfx, l['start'] - 0.1, pop(600 + 40 * l['i']), 0.18)
for l in L:
    if l['i'] == 5: put(sfx, l['words'][8][0] if len(l['words']) > 8 else l['start'] + 2, buzz(1.0, 180), 0.25)
    if l['i'] == 7: put(sfx, l['start'] + 0.6, buzz(1.6, 230) * np.sin(np.pi * X(1.6) / 1.6), 0.12)
ve = np.convolve(np.abs(voice), np.ones(4800) / 4800, 'same'); duck = 1 - 0.55 * np.clip(ve / 0.06, 0, 1)
mix = np.tanh((voice + beat * 0.42 * gate * duck + sfx) * 1.05)
w = wave.open('/tmp/bmix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767 * 0.9).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/bmix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True); print('ok', outp)
