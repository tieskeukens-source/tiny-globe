"""Nabewerking: hoofdstukken, geluidseffecten, muziek.  python scripts/nabewerking.py <slug> <timings.json> <video.mp4> <uit.mp4>"""
import json, math, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

slug, tpath, vid, outp = sys.argv[1:5]
SR = 44100
sc = json.load(open(f'videos/{slug}.json'))['scenes']
tm = json.load(open(tpath))['scenes']

# scènetijden (zelfde formule als Video.tsx)
starts, f = [], 0
for t in tm:
    starts.append(f / 30); f += math.ceil((t['dur'] + 0.15) * 30)
total = f / 30

def woordtijd(words, key):
    k = key.lower()
    for t, a, b in words:
        i = t.lower().find(k)
        if i >= 0: return a + ((i / len(t)) * (b - a) if len(t) > len(k) else 0)
    return 0.3

# hoofdstukken
CH = [("Imagine stepping outside", "Intro"), ("Let's find out", "Where is Oymyakon?"), ("Let's put that cold", "How cold is it?"),
      ("But why is it so cold", "Why is it so cold?"), ("So what is a normal day", "A morning in Oymyakon"),
      ("Now, here's something", "Toilets and water"), ("What about food", "What do people eat?"), ("The animals here", "Animals"),
      ("And the kids", "School"), ("The cold also breaks", "Things that break"), ("Even building a house", "Building on frozen ground"),
      ("So why did anyone settle", "Why people settled here"), ("But here's the surprise", "Summer in Oymyakon"), ("So, why do people stay", "Why do people stay?")]
chap = []
for pre, name in CH:
    i = next(i for i, s in enumerate(sc) if s['text'].startswith(pre))
    chap.append((starts[i], name))
def ts(x): x = int(round(x)); return f"{x // 60}:{x % 60:02d}"
json.dump({'chapters': [(ts(a), n) for a, n in chap], 'total': ts(total), 'starts': starts}, open('out_chapters.json', 'w'), indent=1)
print('\n'.join(f"{ts(a)} {n}" for a, n in chap))

n = int(total * SR) + SR
rng = np.random.default_rng(7)

def stereo(x): return np.stack([x, x], 1)

# --- muziek: rustige pad, Am - F - C - G, 16 s per akkoord ---
def midi(m): return 440 * 2 ** ((m - 69) / 12)
prog = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
t = np.arange(n) / SR
mus = np.zeros((n, 2))
seg = 16.0
for k in range(int(total // seg) + 2):
    a, b = int(k * seg * SR), min(n, int((k + 1) * seg * SR + 4 * SR))
    if a >= n: break
    tt = np.arange(b - a) / SR
    env = np.minimum(1, tt / 5) * np.minimum(1, np.maximum(0, (seg + 4 - tt)) / 4)
    for j, m in enumerate(prog[k % 4]):
        for det, pan in ((-0.4, 0.3), (0.4, 0.7)):
            fr = midi(m) * 2 ** (det / 1200 * 10)
            w = np.sin(2 * np.pi * fr * tt) + 0.35 * np.sin(2 * np.pi * fr * 2 * tt) + 0.15 * np.sin(2 * np.pi * fr * 3 * tt)
            mus[a:b, 0] += w * env * (1 - pan) * 0.05
            mus[a:b, 1] += w * env * pan * 0.05
    bass = np.sin(2 * np.pi * midi(prog[k % 4][0] - 24) * tt) * env * 0.06
    mus[a:b] += bass[:, None]
# zachte LFO + lichte galm
mus *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t))[:, None]
ir = np.exp(-np.arange(int(1.6 * SR)) / (0.45 * SR)) * rng.standard_normal(int(1.6 * SR)) * 0.08
for c in (0, 1): mus[:, c] = mus[:, c] + fftconvolve(mus[:, c], ir)[:n] * 0.5
mus /= np.abs(mus).max()

# --- wind: gefilterde ruis, golvend, per scène hoeveelheid ---
sos = butter(2, [150, 900], 'bandpass', fs=SR, output='sos')
wind = sosfilt(sos, rng.standard_normal((n, 2)), axis=0)
wind *= (0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * t + 1.3 * np.sin(2 * np.pi * 0.023 * t)))[:, None]
gain = np.ones(n)
BINNEN = {'binnen': 0.25, 'eten': 0.25, 'zomer': 0.0, 'kapot': 0.6, 'closeup': 0.9}
for i, s in enumerate(sc):
    g = BINNEN.get(s['type'], 1.0)
    if s['type'] == 'thermo' and any(st['waarde'] > 20 for st in s['props'].get('stappen', [])): g = 0.0
    if s['type'] == 'zon' and s['props'].get('zomer'): g = 0.0
    if s['type'] == 'dorp' or s['type'] == 'school': g = 1.0
    a = int(starts[i] * SR); b = int((starts[i + 1] if i + 1 < len(starts) else total) * SR)
    gain[a:b] = g
sm = np.ones(int(1.5 * SR)) / int(1.5 * SR)
gain = np.convolve(gain, sm, 'same')
wind *= gain[:, None]
wind /= np.abs(wind).max()

# --- pop-geluidjes op elke tekstballon ---
def pop(freq=520):
    d = np.arange(int(0.13 * SR)) / SR
    ph = 2 * np.pi * (freq * d + 1400 * (1 - np.exp(-d * 30)) / 30 * 1.0)
    return np.sin(ph) * np.exp(-d * 32) * 0.9 + np.sin(2 * np.pi * freq * 2 * d) * np.exp(-d * 55) * 0.25
def tik():
    d = np.arange(int(0.05 * SR)) / SR
    return np.sin(2 * np.pi * 1800 * d) * np.exp(-d * 90) * 0.6
sfx = np.zeros((n, 2))
npops = 0
for i, s in enumerate(sc):
    for k, p in enumerate(s.get('pops', [])):
        tt = starts[i] + woordtijd(tm[i]['words'], p['woord'])
        sn = pop(480 + 70 * (k % 4) + (160 if p.get('stijl') == 'groot' else 0))
        a = int(tt * SR)
        if a + len(sn) < n:
            pan = 0.35 if p.get('x', 960) < 960 else 0.65
            sfx[a:a + len(sn), 0] += sn * (1 - pan); sfx[a:a + len(sn), 1] += sn * pan; npops += 1
# whoosh bij elke nieuwe scène (zacht)
ws = butter(2, [400, 3000], 'bandpass', fs=SR, output='sos')
for i in range(1, len(starts)):
    L = int(0.35 * SR); w = sosfilt(ws, rng.standard_normal(L)) * np.hanning(L) * 0.18
    a = int(starts[i] * SR) - int(0.12 * SR)
    sfx[a:a + L, 0] += w; sfx[a:a + L, 1] += w
sfx /= max(1e-9, np.abs(sfx).max())
print(npops, 'pops')

def save(name, x, peak=0.9):
    x = x / max(1e-9, np.abs(x).max()) * peak
    wavfile.write(name, SR, (x * 32767).astype(np.int16))
save('muziek.wav', mus); save('wind.wav', wind); save('sfx.wav', sfx)

# --- mixen met ffmpeg: stem blijft leidend, muziek duikt onder stem ---
fc = ("[0:a]asplit=2[stem][sc];"
      "[1:a]volume=0.20[m];[m][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=500[md];"
      "[2:a]volume=0.07[w];[3:a]volume=0.22[x];"
      "[stem][md][w][x]amix=inputs=4:normalize=0:duration=first,alimiter=limit=0.95[a]")
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', 'muziek.wav', '-i', 'wind.wav', '-i', 'sfx.wav',
                       '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outp])
print('klaar', outp)
