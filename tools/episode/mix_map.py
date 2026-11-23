# Tiny Globe MAP format sound: bright ukulele-style plucks + bass + claps (F major, 118 bpm), a whoosh as the globe
# opener flies into the map, a cascade of little pops while the map paints (burgers popping up west to east),
# ticks on cuts, pops on captions, thumps on kicks, the groove drops out for the closing question (clock ticks).
# usage: python3 tools/episode/mix_map.py <voice_dir> <timeline.json> <events.json> <out.mp3>
import json, sys, subprocess, wave, numpy as np
from scipy.signal import butter, lfilter
vd, tlp, evp, outp = sys.argv[1:5]
SR = 48000
TL = json.load(open(tlp)); ev = json.load(open(evp)); N = int((ev['total'] + 0.3) * SR)
rng = np.random.default_rng(9)
def rd(path):
    o = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(o, dtype=np.float32).copy()
voice = np.zeros(N)
for l in TL['lines']:
    a = rd(f"{vd}/{l['i']:03d}.wav"); i = int(l['start'] * SR); voice[i:i + len(a)] += a[:N - i]
voice /= max(1e-6, np.abs(voice).max()) / 0.9
def put(arr, t, s):
    i = int(t * SR)
    if 0 <= i < N: arr[i:i + len(s)] += s[:N - i]
env = lambda n, a, d: np.minimum(1, np.arange(n) / SR / a) * np.exp(-np.arange(n) / SR / d)
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def uke(f, amp, dur=0.7):   # Karplus-Strong pluck
    n = int(dur * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for k in range(n): out[k] = buf[k % p]; buf[k % p] = 0.5 * (buf[k % p] + buf[(k + 1) % p]) * 0.996
    return amp * out * np.minimum(1, np.arange(n) / SR / 0.002)
def bass(f, amp):
    n = int(0.45 * SR); x = np.arange(n) / SR; return amp * (np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 6) * np.minimum(1, x / 0.004)
def clap(amp):
    n = int(0.12 * SR); b, a = butter(2, [900 / (SR / 2), 5000 / (SR / 2)], 'band'); s = lfilter(b, a, rng.normal(0, 1, n))
    e = sum(np.exp(-np.maximum(0, np.arange(n) / SR - d) * 60) * (np.arange(n) / SR >= d) for d in (0, 0.01, 0.022)); return amp * s * e * 0.5
def tick(amp=0.16):
    n = int(0.05 * SR); b, a = butter(2, [800 / (SR / 2), 4000 / (SR / 2)], 'band'); return amp * lfilter(b, a, rng.normal(0, 1, n)) * env(n, 0.001, 0.02)
def thump(amp=0.5):
    n = int(0.3 * SR); x = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(110 * (1 + 1.2 * np.exp(-x * 28))) / SR
    return amp * np.sin(ph) * env(n, 0.002, 0.1)
def pop(amp=0.25, f0=700):
    n = int(0.09 * SR); x = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(f0 * (1 + 2.5 * np.exp(-x * 60))) / SR
    return amp * np.sin(ph) * env(n, 0.001, 0.025)
def whoosh(dur=0.7, amp=0.35):
    n = int(dur * SR); x = np.arange(n) / SR; s = rng.normal(0, 1, n); out = np.zeros(n); fc = 300 + 3500 * np.sin(np.pi * x / dur) ** 2
    for k in range(0, n, 480):
        b, a = butter(2, [max(60, fc[k] * 0.6) / (SR / 2), min(SR / 2 - 100, fc[k] * 1.4) / (SR / 2)], 'band'); out[k:k + 480] = lfilter(b, a, s[k:k + 480])
    return amp * out * np.sin(np.pi * x / dur) ** 2
def clock(amp=0.22, hi=True):
    n = int(0.04 * SR); x = np.arange(n) / SR; return amp * np.sin(2 * np.pi * (2400 if hi else 1800) * x) * np.exp(-x * 160)
ask = ev['ask'] if ev.get('ask') and ev['ask'] < 1e8 else ev['total']
mus = np.zeros(N); bpm = 118; step = 60 / bpm / 2
chords = [[65, 69, 72], [62, 65, 69], [58, 62, 65], [60, 64, 67]]   # F Dm Bb C
strum = [1, 0, 1, 1, 0, 1, 1, 0]
t = 0.0; k = 0
while t < ask - 0.05:
    ch = chords[(k // 8) % 4]
    if k % 4 == 0: put(mus, t, bass(mf(ch[0] - 24), 0.5))
    if k % 4 == 3: put(mus, t, bass(mf(ch[2] - 24), 0.3))
    if strum[k % 8]:
        for j, m in enumerate(ch + [ch[0] + 12]): put(mus, t + j * 0.012, uke(mf(m), 0.12 if k % 2 else 0.17))
    if k % 4 == 2: put(mus, t, clap(0.35))
    t += step; k += 1
sfx = np.zeros(N)
put(sfx, 0.75, whoosh())
for c in ev['cuts']: put(sfx, c[0], tick())
for t0 in ev['kicks']: put(sfx, t0, thump())
for c in ev['caps']: put(sfx, c[0], pop(0.14, 900))
if ev.get('paint'):
    for j in range(26): put(sfx, ev['paint'] + 0.1 + j * 0.065 + rng.uniform(0, 0.03), pop(0.2, 500 + 30 * j))
tt = ask; k = 0
while tt < ev['total']: put(sfx, tt, clock(hi=k % 2 == 0)); tt += 0.5; k += 1
vo_env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
duck = 1 - 0.65 * np.clip(vo_env / 0.08, 0, 1); duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
mix = np.tanh((voice * 1.0 + mus * 0.5 * duck + sfx * 0.9) * 1.1)
tmp = '/tmp/mmix.wav'
w = wave.open(tmp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767 * 0.9).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=8', '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True)
print('ok', outp)
