# UK drill beat synth (142 bpm, half-time snare on 3, triplet hat rolls, gliding 808s, dark minor bell + pad).
# import: beat(total_seconds, seed) -> np.float32 array @48k.  CLI: python3 tools/episode/drill.py out.mp3 [seconds]
import sys, subprocess, wave, numpy as np
from scipy.signal import butter, lfilter
SR = 48000
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

def beat(total, seed=7, bpm=142):
    rng = np.random.default_rng(seed); N = int(total * SR); out = np.zeros(N)
    X = lambda d: np.arange(int(d * SR)) / SR
    def put(t, s, g=1.0):
        i = int(t * SR)
        if 0 <= i < N: out[i:i + len(s)] += g * s[:N - i]
    def hat(open_=False):
        x = X(0.12 if open_ else 0.035); b, a = butter(2, 8000 / (SR / 2), 'high')
        return lfilter(b, a, rng.normal(0, 1, len(x))) * np.exp(-x * (25 if open_ else 110)) * 0.3
    def snare():
        x = X(0.25); b, a = butter(2, [1200 / (SR / 2), 8000 / (SR / 2)], 'band')
        clap = sum(np.exp(-np.maximum(0, x - d) * 45) * (x >= d) for d in (0, 0.008, 0.017))
        return (lfilter(b, a, rng.normal(0, 1, len(x))) * clap * 0.9 + 0.35 * np.sin(2 * np.pi * 210 * x) * np.exp(-x * 30))
    def kick():
        x = X(0.18); return np.sin(2 * np.pi * np.cumsum(55 + 160 * np.exp(-x * 45)) / SR) * np.exp(-x * 22)
    def b808(m0, m1, d, glide_at=0.5):
        x = X(d); f = np.where(x < d * glide_at, mf(m0), mf(m0) + (mf(m1) - mf(m0)) * np.clip((x - d * glide_at) / 0.08, 0, 1))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR); s = np.tanh(2.2 * s)   # saturated 808
        return s * np.minimum(1, x / 0.004) * np.exp(-x * 0.9)
    def bell(m, d=1.2):
        x = X(d); f = mf(m)
        return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 6)) * np.exp(-x * 2.6) * np.minimum(1, x / 0.003)
    def pad(ms, d):
        x = X(d); s = sum(np.sin(2 * np.pi * mf(m) * x + 0.3 * np.sin(2 * np.pi * 5 * x)) for m in ms) / len(ms)
        return s * np.minimum(1, x / 0.4) * np.minimum(1, (d - x) / 0.4)
    st = 60 / bpm / 4; bar = st * 16
    # C minor-ish: 808 roots per bar + bell motif
    roots = [36, 36, 39, 34]   # C2 C2 Eb2 Bb1
    motif = [[72, None, 75, None, 79, None, 78, 75], [72, None, 75, None, 80, None, 79, None], [75, None, 79, None, 82, None, 80, 79], [70, None, 74, None, 77, None, 75, None]]
    pads = [[60, 63, 67], [60, 63, 68], [63, 67, 70], [58, 62, 65]]
    nb = int(total / bar) + 2
    for b in range(nb):
        t0 = b * bar; r = roots[b % 4]
        put(t0, pad(pads[b % 4], bar), 0.10)
        for k, m in enumerate(motif[b % 4]):
            if m: put(t0 + k * 2 * st, bell(m), 0.10); put(t0 + k * 2 * st + 3 * st, bell(m, 0.8), 0.035)   # echo
        put(t0 + 8 * st, snare(), 0.55)                             # half-time snare on 3
        if b % 2: put(t0 + 15 * st, snare(), 0.18)                  # ghost
        if b % 4 == 3: put(t0 + 13 * st, snare(), 0.3)
        for s0, d, m1 in ((0, 5, r), (6, 4, r + 12 if b % 2 else r + 3), (10, 3, r - 2), (13, 3, r)):   # gliding 808 pattern
            put(t0 + s0 * st, b808(r if s0 != 13 else r + 3, m1, d * st), 0.42)
        put(t0, kick(), 0.45); put(t0 + 10 * st, kick(), 0.3)
        k = 0
        while k < 16:   # hats: 8ths, with triplet rolls
            if k in (6, 14) and rng.random() < 0.7:
                for j in range(3): put(t0 + (k + j * 2 / 3) * st, hat(), 0.5)
                k += 2; continue
            if k % 2 == 0: put(t0 + k * st + (0.012 if k % 4 else 0), hat(k == 12 and b % 2 == 0), 0.55)
            k += 1
    return out

if __name__ == '__main__':
    outp = sys.argv[1]; T = float(sys.argv[2]) if len(sys.argv) > 2 else 20
    m = beat(T); m = np.tanh(m * 1.1); m /= np.abs(m).max() / 0.9
    w = wave.open('/tmp/drill.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype(np.int16).tobytes()); w.close()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/drill.wav', '-af', 'loudnorm=I=-14:TP=-1.5', '-ar', '48000', '-ac', '2', '-b:a', '192k', outp], check=True); print('ok', outp)
