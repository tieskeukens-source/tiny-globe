import json,subprocess,numpy as np,scipy.io.wavfile as wf
d=json.load(open('voices/igbo/voice/lines.json')); sr=24000
out=np.zeros(int((d['total']+1)*sr),dtype=np.float32)
for l in d['lines']:
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',f"voices/igbo/voice/{l['i']:03d}.mp3",'-f','f32le','-ac','1','-ar',str(sr),'-'],capture_output=True).stdout
    a=np.frombuffer(raw,dtype=np.float32); s=int(l['start']*sr); out[s:s+len(a)]+=a[:len(out)-s]
out/=max(1e-6,np.abs(out).max())/0.9
wf.write('out/voice.wav',sr,(out*32767).astype(np.int16))
