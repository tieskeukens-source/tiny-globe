# Tiny Globe sound for "Guess the Country": bouncy quiz-show groove (marimba + pizzicato bass + light shaker, C major),
# a bright "ding" on every HINT, a comic "bwomp" on every wrong guess, ticks on cuts, thumps on kicks; at the closing
# question the groove stops and a clock ticks under "write your guess" (the short loops back to the hook).
# usage: python3 tools/episode/mix_guess1.py <voice_dir> <timeline.json> <events.json> <out.mp3>
import json, sys, subprocess, wave, numpy as np
from scipy.signal import butter, lfilter
vd, tlp, evp, outp = sys.argv[1:5]
SR = 48000
TL = json.load(open(tlp)); ev = json.load(open(evp)); N = int((ev['total'] + 0.3) * SR)
rng = np.random.default_rng(5)
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
def marimba(f, amp, dur=0.6):
    n = int(dur * SR); x = np.arange(n) / SR
    return amp * (np.sin(2 * np.pi * f * x) * np.exp(-x * 7) + 0.25 * np.sin(2 * np.pi * f * 3.9 * x) * np.exp(-x * 30)) * np.minimum(1, x / 0.002)
def pizz(f, amp):
    n = int(0.4 * SR); x = np.arange(n) / SR
    return amp * sum(a * np.sin(2 * np.pi * f * k * x) for k, a in ((1, 1), (2, .4), (3, .2))) * np.exp(-x * 9) * np.minimum(1, x / 0.003)
def shaker(amp):
    n = int(0.06 * SR); b, a = butter(2, 5000 / (SR / 2), 'high'); return amp * lfilter(b, a, rng.normal(0, 1, n)) * env(n, 0.004, 0.02)
def tick(amp=0.16):
    n = int(0.05 * SR); b, a = butter(2, [800 / (SR / 2), 4000 / (SR / 2)], 'band'); return amp * lfilter(b, a, rng.normal(0, 1, n)) * env(n, 0.001, 0.02)
def thump(amp=0.5):
    n = int(0.3 * SR); x = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(110 * (1 + 1.2 * np.exp(-x * 28))) / SR
    return amp * np.sin(ph) * env(n, 0.002, 0.1)
def ding(amp=0.45):   # two-tone bell (E6 then A6)
    out = np.zeros(int(1.4 * SR))
    for k, (m, d) in enumerate(((88, 0.0), (93, 0.12))):
        n = int(1.2 * SR); x = np.arange(n) / SR; f = mf(m)
        s = (np.sin(2 * np.pi * f * x) + .4 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 6) + .2 * np.sin(2 * np.pi * f * 5.4 * x) * np.exp(-x * 12)) * np.exp(-x * 2.6)
        i = int(d * SR); out[i:i + n] += s[:len(out) - i]
    return amp * out / np.abs(out).max()
def bwomp(amp=0.4):   # sliding-down comic buzz
    n = int(0.55 * SR); x = np.arange(n) / SR; f = 220 * np.exp(-x * 1.6); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.6 + np.sin(2 * ph) * 0.3
    b, a = butter(2, 1800 / (SR / 2)); return amp * lfilter(b, a, s) * env(n, 0.01, 0.35)
def clock(amp=0.22, hi=True):
    n = int(0.04 * SR); x = np.arange(n) / SR; return amp * np.sin(2 * np.pi * (2400 if hi else 1800) * x) * np.exp(-x * 160)
ask = ev['ask'] if ev.get('ask') else ev['total']
mus = np.zeros(N)
bpm = 112; step = 60 / bpm / 2
chords = [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]]   # C  Am  F  G
mel = [72, 0, 76, 74, 72, 0, 67, 0, 69, 72, 0, 74, 76, 0, 74, 0]
t = 0.0; k = 0
while t < ask - 0.05:
    ch = chords[(k // 8) % 4]
    if k % 4 == 0: put(mus, t, pizz(mf(ch[0] - 24), 0.5))
    if k % 4 == 2: put(mus, t, pizz(mf(ch[2] - 24), 0.35))
    if k % 2 == 1: put(mus, t, sum(marimba(mf(m), 0.12, 0.3) for m in ch))
    m = mel[k % 16]
    if m: put(mus, t, marimba(mf(m), 0.3))
    put(mus, t, shaker(0.05 if k % 2 else 0.08))
    t += step; k += 1
sfx = np.zeros(N)
for c in ev['cuts']: put(sfx, c[0], tick())
for t0 in ev['kicks']: put(sfx, t0, thump())
for h in ev['hints']: put(sfx, h - 0.05, ding())
for w in ev['wrong']: put(sfx, w + 0.35, bwomp())
tt = ask; k = 0
while tt < ev['total']: put(sfx, tt, clock(hi=k % 2 == 0)); tt += 0.5; k += 1
vo_env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
duck = 1 - 0.65 * np.clip(vo_env / 0.08, 0, 1)
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
mix = voice * 1.0 + mus * 0.55 * duck + sfx * 0.9
mix = np.tanh(mix * 1.1)
tmp = '/tmp/gmix.wav'
w = wave.open(tmp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767 * 0.9).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=8', '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True)
print('ok', outp)
