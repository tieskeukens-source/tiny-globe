# Add comic beats: extra pause (s) before given lines, shift words with them; also write mouth envelopes per line.
# usage: python3 tools/episode/retime.py <voice_dir> <out_timeline.json> <out_env.json> '{"3":0.45,...}' [first_start]
import json, sys, subprocess, numpy as np
vd, outp, envp, pz = sys.argv[1:5]; first = float(sys.argv[5]) if len(sys.argv) > 5 else None
P = {int(k): v for k, v in json.loads(pz).items()}
T = json.load(open(f"{vd}/lines.json")); shift = 0.0
if first is not None: shift = first - T['lines'][0]['start']
env = {}
for l in T['lines']:
    shift += P.get(l['i'], 0)
    l['start'] = round(l['start'] + shift, 3); l['words'] = [[round(a + shift, 3), round(b + shift, 3), w] for a, b, w in l['words']]
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f"{vd}/{l['i']:03d}.wav", '-f', 'f32le', '-ac', '1', '-ar', '24000', '-'], capture_output=True).stdout, dtype=np.float32)
    hop = 800; rms = np.array([np.sqrt(np.mean(a[k:k + hop] ** 2)) for k in range(0, len(a), hop)])
    v = np.clip((rms - 0.01) / (np.percentile(rms, 90) + 1e-6), 0, 1)
    env[str(l['i'])] = [round(float(x), 2) for x in v]
T['total'] = round(T['total'] + shift + 0.0, 3)
json.dump(T, open(outp, 'w'), indent=1); json.dump(env, open(envp, 'w'))
print('total', T['total'], [(l['i'], l['start']) for l in T['lines']])
