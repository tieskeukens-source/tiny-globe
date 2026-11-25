# Tiny Globe sound for the Oymyakon short: Yakut khomus (jaw harp) groove + plucked minor-pentatonic score, a cold wind bed,
# ducked under the voice; soft ticks on cuts, accents on punch captions, thumps on kicks.
# usage: python3 tools/episode/mix_kuskoy.py <voice_dir> <timeline.json> <events.json> <out.mp3>
import json, sys, subprocess, numpy as np
from scipy.signal import butter, lfilter
vd, tlp, evp, outp = sys.argv[1:5]
SR = 48000
TL = json.load(open(tlp)); ev = json.load(open(evp)); N = int((ev['total'] + 0.5) * SR)
rng = np.random.default_rng(11)
def rd(path):
    o = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(o, dtype=np.float32).copy()
voice = np.zeros(N)
for l in TL['lines']:
    if l.get('whistle') or l['who'] == 'whistle' or l.get('f', 0) < 0: continue
    a = rd(f"{vd}/{l['i']:03d}.wav" if 'f' not in l else f"{vd}/{l['f']:03d}.mp3"); i = int(l['start'] * SR); voice[i:i + len(a)] += a[:N - i]
voice /= max(1e-6, np.abs(voice).max()) / 0.9
def put(arr, t, s):
    i = int(t * SR)
    if 0 <= i < N: arr[i:i + len(s)] += s[:N - i]
env = lambda n, a, d: np.minimum(1, np.arange(n) / SR / a) * np.exp(-np.arange(n) / SR / d)
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, amp):
    n = int(0.9 * SR); x = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * k * x) * np.exp(-x * (3 + 2 * k)) for k, a in ((1, 1), (2, .5), (3, .3), (4, .15)))
    return amp * s * np.minimum(1, x / 0.002)
def drone(f, dur, amp):
    n = int(dur * SR); x = np.arange(n) / SR
    return amp * (np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x)) * np.minimum(1, x / 1.0) * np.minimum(1, (dur - x) / 1.0)
def tick(amp=0.18):
    n = int(0.05 * SR); b, a = butter(2, [800 / (SR / 2), 4000 / (SR / 2)], 'band'); return amp * lfilter(b, a, rng.normal(0, 1, n)) * env(n, 0.001, 0.02)
def thump(amp=0.5):
    n = int(0.3 * SR); x = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(110 * (1 + 1.2 * np.exp(-x * 28))) / SR
    return amp * np.sin(ph) * env(n, 0.002, 0.1)
def whistle(dur, amp=0.35):
    n = int(dur * SR); x = np.arange(n) / SR
    f = 1900 + 500 * np.sin(2 * np.pi * 2.2 * x) + 700 * np.sin(np.pi * x / dur) ** 2 + 120 * np.sin(2 * np.pi * 9 * x)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.12 * np.sin(2 * ph)
    gate = (np.sin(2 * np.pi * 3.2 * x) > -0.55).astype(float); gate = np.convolve(gate, np.ones(400) / 400, 'same')
    return amp * s * gate * np.minimum(1, x / 0.04) * np.minimum(1, (dur - x) / 0.08)
mus = np.zeros(N)
def khomus(f, dur, amp):
    # jaw harp: buzzy pulse at f, a resonant formant that sweeps (the mouth), quick attack, ringing tail
    n = int(dur * SR); x = np.arange(n) / SR
    pulse = np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + np.sin(2 * np.pi * f * x)
    fc = 700 + 900 * (0.5 + 0.5 * np.sin(2 * np.pi * 3.0 * x))
    out = np.zeros(n); y1 = y2 = 0.0; r = 0.985
    for k in range(n):
        w = 2 * np.pi * fc[k] / SR; y = pulse[k] + 2 * r * np.cos(w) * y1 - r * r * y2; y2, y1 = y1, y; out[k] = y
    out /= max(1e-6, np.abs(out).max())
    return amp * out * np.minimum(1, x / 0.004) * np.exp(-x * 2.2)
scale = [50, 53, 55, 57, 60, 62, 65]   # D minor pentatonic-ish (D F G A C D F)
bpm = 96; step = 60 / bpm / 2
patt = [0, 0, 3, 0, 2, 0, 4, 3, 0, 0, 3, 5, 4, 3, 2, 1]
kh = khomus(mf(38), step * 2, 0.5)
t = 0.0; k = 0
while t < ev['total']:
    if k % 2 == 0: put(mus, t, kh * (1.0 if k % 8 == 0 else 0.65))
    d = patt[k % 16]
    if k % 2 == 1 or k % 8 == 0: put(mus, t, pluck(mf(scale[d] + 12), 0.34 if k % 4 else 0.45))
    t += step; k += 1
put(mus, 0, drone(mf(38), ev['total'] + 0.5, 0.1))
# wind bed: band-passed noise with slow gusts
wn = rng.normal(0, 1, N); bw, aw = butter(2, [300 / (SR / 2), 1800 / (SR / 2)], 'band'); wn = lfilter(bw, aw, wn)
xs = np.arange(N) / SR; gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * xs) * np.sin(2 * np.pi * 0.047 * xs + 1)
wind = 0.05 * wn * gust
sfx = np.zeros(N)
for c in ev['cuts']: put(sfx, c[0], tick())
for t0 in ev['kicks']: put(sfx, t0, thump())
for c in ev['caps']: put(sfx, c[0], tick(0.12))
for l in TL['lines']:
    if l.get('whistle') or l['who'] == 'whistle': put(sfx, l['start'] + 0.04, whistle(l['dur'] - 0.08))
# duck the music under the voice
vo_env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
duck = 1 - 0.7 * np.clip(vo_env / 0.08, 0, 1)
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
mix = voice * 1.0 + mus * 0.5 * duck + wind * (0.6 + 0.4 * duck) + sfx * 0.9
mix = np.tanh(mix * 1.1)
tmp = '/tmp/kmix.wav'
import wave
w = wave.open(tmp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767 * 0.9).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=8', '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True)
print('ok', outp)
