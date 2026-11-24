# THE BLOCK street mix: UK drill beat (tools/episode/drill.py) + night street ambience (traffic rumble, distant siren,
# passing car) + voices made to sit "outside" (high-pass, light grit, short street reverb), beat drop for the punchline.
# usage: python3 tools/episode/mix_street.py <voice_dir> <timeline.json> <out.mp3> <drop_line> <back_line>
import json, sys, os, subprocess, wave, numpy as np
from scipy.signal import butter, lfilter, fftconvolve
sys.path.insert(0, os.path.dirname(__file__)); from drill import beat
vd, tlp, outp, drop, back = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
SR = 48000; TL = json.load(open(tlp)); L = TL['lines']; N = int(TL['total'] * SR); rng = np.random.default_rng(5)
def rd(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, dtype=np.float32).copy()
def put(arr, t, s, g=1.0):
    i = int(t * SR)
    if 0 <= i < N: arr[i:i + len(s)] += g * s[:N - i]
bp = lambda x, lo, hi: lfilter(*butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'), x)
# voices: placed, high-passed, a touch of grit, short slap reverb like a street at night
voice = np.zeros(N)
for l in L:
    a = rd(f"{vd}/{l['i']:03d}.wav"); a = lfilter(*butter(2, 110 / (SR / 2), 'high'), a); a = np.tanh(a * 2.2) / np.tanh(2.2)
    put(voice, l['start'], a)
voice /= np.abs(voice).max() / 0.9
ir_t = np.arange(int(0.35 * SR)) / SR; ir = rng.normal(0, 1, len(ir_t)) * np.exp(-ir_t * 14); ir[int(0.045 * SR)] += 3   # wall slap
ir = lfilter(*butter(2, 3500 / (SR / 2), 'low'), ir); ir /= np.abs(ir).sum() / 6
voice = voice + 0.16 * fftconvolve(voice, ir)[:N]
# ambience
amb = lfilter(*butter(2, 180 / (SR / 2), 'low'), np.cumsum(rng.normal(0, 1, N)) * 0.002); amb -= amb.mean(); amb *= 0.05 / (np.abs(amb).max() + 1e-9)
amb += bp(rng.normal(0, 1, N), 300, 2000) * 0.004
x = np.arange(int(6 * SR)) / SR                                     # distant siren
siren = np.sin(2 * np.pi * np.cumsum(750 + 160 * np.sign(np.sin(2 * np.pi * 0.7 * x))) / SR) * np.sin(np.pi * x / 6) ** 2
put(amb, 4.0, lfilter(*butter(2, 1400 / (SR / 2), 'low'), siren), 0.018)
x = np.arange(int(3 * SR)) / SR                                     # passing car
car = bp(rng.normal(0, 1, len(x)), 80, 700) * np.exp(-((x - 1.5) / 0.6) ** 2)
put(amb, L[6]['start'] - 1.0, car, 0.12)
# beat with drop: cut on the punchline setup, back on the reaction
bt = beat(TL['total'] + 1)[:N]
gate = np.ones(N); gate[int((L[drop]['start'] - 0.25) * SR):int(L[back]['start'] * SR)] = 0.0
gate = np.convolve(gate, np.ones(1500) / 1500, 'same')
ve = np.convolve(np.abs(voice), np.ones(4800) / 4800, 'same'); duck = 1 - 0.5 * np.clip(ve / 0.06, 0, 1)
fade = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.8 * SR))
mix = np.tanh((voice * 1.0 + bt * 0.36 * gate * duck + amb) * fade * 1.05)
w = wave.open('/tmp/smix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767 * 0.9).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/smix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True); print('ok', outp)
