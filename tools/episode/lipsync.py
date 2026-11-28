# Rhubarb lip sync for every voice line -> src/videos/<ep>/visemes.json {line_i: [[t, shape], ...]} (A-H, X)
# usage: python3 tools/episode/lipsync.py <voice_dir> <timeline.json> <out.json>
import json, sys, subprocess, os, tempfile
vd, tlp, outp = sys.argv[1:4]
RH = os.path.join(os.path.dirname(__file__), '..', 'bin', 'rhubarb', 'rhubarb')
T = json.load(open(tlp)); out = {}
for l in T['lines']:
    wav = f"{vd}/{l['i']:03d}.wav"
    if l['who'] in ('sfx', 'whistle') or not os.path.exists(wav): out[str(l['i'])] = []; continue
    tmp = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '16000', f'{tmp}/a.wav'], check=True)
    open(f'{tmp}/d.txt', 'w').write(' '.join(str(w[2]) for w in l['words']))
    r = subprocess.run([RH, '-f', 'json', '-d', f'{tmp}/d.txt', '--extendedShapes', 'GHX', '-q', f'{tmp}/a.wav'], capture_output=True, text=True, check=True)
    out[str(l['i'])] = [[c['start'], c['value']] for c in json.loads(r.stdout)['mouthCues']]
    print(l['i'], len(out[str(l['i'])]), flush=True)
json.dump(out, open(outp, 'w'))
