# THE BLOCK #2 mix: UK drill beat + chicken-shop room tone (fryer, extractor, strip light, muffled street),
# card-terminal beeps, the awkward silence, the bolt for the door and the police outside.
# usage: python3 tools/episode/mix_shop.py <voice_dir> <timeline.json> <out.mp3>
import json, sys, os, subprocess, wave, numpy as np
from scipy.signal import butter, lfilter, fftconvolve
sys.path.insert(0, os.path.dirname(__file__)); from drill import beat

vd, tlp, outp = sys.argv[1:4]
SR = 48000; TL = json.load(open(tlp)); L = TL['lines']; N = int(TL['total'] * SR); rng = np.random.default_rng(11)
OUT_T = L[17]['start']          # from here on we are outside on the street


def rd(p):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                                        capture_output=True, check=True).stdout, dtype=np.float32).copy()


def put(arr, t, s, g=1.0):
    i = int(t * SR)
    if i < 0: s = s[-i:]; i = 0
    if i < N: arr[i:i + len(s)] += g * s[:N - i]


bp = lambda x, lo, hi: lfilter(*butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'), x)
lp = lambda x, hi: lfilter(*butter(2, hi / (SR / 2), 'low'), x)
hp = lambda x, lo: lfilter(*butter(2, lo / (SR / 2), 'high'), x)
X = lambda d: np.arange(int(d * SR)) / SR
E = lambda i: L[i]['start'] + L[i]['dur']

# ---------- voices: tiled room, so a short bright slap ----------
voice = np.zeros(N)
for l in L:
    f = f"{vd}/{l['i']:03d}.wav"
    if not os.path.exists(f): continue
    a = hp(rd(f), 115); a = np.tanh(a * 2.1) / np.tanh(2.1)
    if l['start'] >= OUT_T: a = hp(a, 190) * 1.05        # the last shouts are outdoors
    put(voice, l['start'], a)
voice /= np.abs(voice).max() / 0.9
ir_t = X(0.3); ir = rng.normal(0, 1, len(ir_t)) * np.exp(-ir_t * 17); ir[int(0.019 * SR)] += 3.4; ir[int(0.031 * SR)] += 2.2
ir = bp(ir, 300, 5200); ir /= np.abs(ir).sum() / 6
voice = voice + 0.2 * fftconvolve(voice, ir)[:N]

# ---------- room tone ----------
amb = np.zeros(N)
amb += bp(rng.normal(0, 1, N), 2500, 9000) * 0.010                                   # fryer sizzle
amb += lp(np.cumsum(rng.normal(0, 1, N)) * 0.002, 220) * 0.0 + bp(rng.normal(0, 1, N), 90, 300) * 0.014   # extractor hum
tt = np.arange(N) / SR
amb += np.sin(2 * np.pi * 100 * tt) * 0.004 + np.sin(2 * np.pi * 300 * tt) * 0.0016   # strip light buzz
amb += bp(rng.normal(0, 1, N), 1400, 3000) * 0.004 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt))   # oil spitting
for t0 in (2.4, 9.6, 19.2, 27.4):                                                    # oil spits
    x = X(0.5); put(amb, t0, bp(rng.normal(0, 1, len(x)), 2000, 8000) * np.exp(-x * 7), 0.05)
out_amb = np.zeros(N)                                                                # the street, once the door is open
out_amb += bp(rng.normal(0, 1, N), 60, 900) * 0.030 + bp(rng.normal(0, 1, N), 900, 5000) * 0.008
door_open = np.clip((tt - OUT_T) / 0.25, 0, 1)
amb = amb * (1 - 0.75 * door_open) + out_amb * door_open

# ---------- foley ----------
sfx = np.zeros(N)


def beep(f0=2200, d=0.09):
    x = X(d); return np.sin(2 * np.pi * f0 * x) * np.minimum(1, x / 0.002) * np.exp(-x * 6) * (x < d - 0.004)


def card_decline(t0):
    put(sfx, t0, beep(1750, 0.07), 0.30)                      # card goes in
    put(sfx, t0 + 0.30, beep(980, 0.16), 0.30)                # thinking
    put(sfx, t0 + 0.56, beep(620, 0.20), 0.34)                # error, two low tones
    put(sfx, t0 + 0.80, beep(520, 0.26), 0.34)


def tap():
    x = X(0.1); return (bp(rng.normal(0, 1, len(x)), 900, 6000) * np.exp(-x * 60)) * 0.8


def bell():                                                   # counter bell
    x = X(1.1); return (np.sin(2 * np.pi * 2380 * x) + 0.6 * np.sin(2 * np.pi * 3510 * x)) * np.exp(-x * 5.5)


def step(g=1.0, lo=120):
    x = X(0.12); return (bp(rng.normal(0, 1, len(x)), lo, 1900) * np.exp(-x * 45) + 0.6 * np.sin(2 * np.pi * 88 * x) * np.exp(-x * 40)) * g


def sting():
    x = X(1.0); b = np.tanh(3 * np.sin(2 * np.pi * np.cumsum(55 * np.exp(-x * 1.6) + 20) / SR)) * np.exp(-x * 3)
    return b * 0.8 + bp(rng.normal(0, 1, len(x)), 1500, 7000) * np.exp(-x * 25) * 0.6


def impact():
    x = X(0.9); boom = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-x * 18)) / SR) * np.exp(-x * 4)
    return np.tanh(2.5 * boom) * 0.8 + bp(rng.normal(0, 1, len(x)), 1500, 9000) * np.exp(-x * 30) * 0.5


def whoosh(d=0.3):
    x = X(d); return bp(rng.normal(0, 1, len(x)), 500, 5000) * np.sin(np.pi * x / d) ** 2


def door_bang():
    x = X(0.8)
    jangle = sum(np.sin(2 * np.pi * f * x) * np.exp(-np.maximum(0, x - o) * 11) * (x >= o)
                 for f, o in ((2600, 0), (3300, 0.03), (2950, 0.07), (3700, 0.12)))
    slam = bp(rng.normal(0, 1, len(x)), 90, 2500) * np.exp(-x * 26) + np.sin(2 * np.pi * 70 * x) * np.exp(-x * 18)
    return slam * 0.9 + jangle * 0.22


def skid(d=1.0):
    x = X(d); return bp(rng.normal(0, 1, len(x)), 700, 4200) * (np.sin(np.pi * x / d) ** 1.5) * (0.7 + 0.3 * np.sin(2 * np.pi * 30 * x))


def siren(d, f_hi=980, f_lo=680, rate=1.5):
    x = X(d); f = f_lo + (f_hi - f_lo) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * x))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.35 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.65
    return lp(s, 4000)


put(sfx, 0.0, impact(), 0.55)
put(sfx, E(1) + 0.05, bell(), 0.16)                            # Fast slaps the counter bell after ordering
card_decline(L[5]['start'] - 0.55)
card_decline(L[8]['start'] - 0.55)
put(sfx, L[7]['start'] + 0.9, tap(), 0.5)                      # Lou jabs the machine again
for i in (6, 9, 10, 13): put(sfx, E(i) + 0.05, sting(), 0.4)
put(sfx, L[12]['start'] + 0.55, tap(), 0.35)                   # bus pass on the counter
put(sfx, L[13]['start'] + 0.6, tap(), 0.4)                     # controller on the counter
# the bolt: scrambling feet, the door, then the street
t = L[16]['start'] + 0.25
while t < OUT_T + 1.5:
    put(sfx, t, step(1.15), 0.3); put(sfx, t + 0.07, step(0.9, 160), 0.24); t += 0.165
put(sfx, OUT_T + 0.12, door_bang(), 0.55)
put(sfx, OUT_T + 0.1, whoosh(0.5), 0.3)
put(sfx, L[18]['start'] - 1.05, siren(3.4), 0.10)
put(sfx, L[18]['start'] - 0.55, skid(0.9), 0.30)
put(sfx, L[18]['start'] - 0.2, siren(TL['total'] - L[18]['start'] + 0.2), 0.065)
t = L[18]['start'] + 0.1
while t < TL['total']:
    put(sfx, t, step(1.0, 150), 0.22); t += 0.17

# ---------- beat: out for the awkward silence, slams back on "Run." ----------
bt = beat(TL['total'] + 1)[:N]
gate = np.ones(N)
gate[int((L[14]['start'] - 0.2) * SR):int(L[16]['start'] * SR)] = 0.0     # drops out on "So. Who is paying?"
gate = np.convolve(gate, np.ones(2200) / 2200, 'same')
ve = np.convolve(np.abs(voice), np.ones(4800) / 4800, 'same'); duck = 1 - 0.5 * np.clip(ve / 0.06, 0, 1)
fade = np.minimum(1, np.arange(N) / (0.02 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.7 * SR))
mix = np.tanh((voice * 1.0 + bt * 0.34 * gate * duck + amb + sfx * duck) * fade * 1.05)
w = wave.open('/tmp/shopmix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767 * 0.9).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/shopmix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9',
                '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True)
print('ok', outp, round(TL['total'], 2), 's')
