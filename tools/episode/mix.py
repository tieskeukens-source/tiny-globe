# Tiny Globe sound for "The Town Where Almost Everyone Has a Twin": afrobeat-style score (original) ducked under the voice,
# synthesized SFX on cuts / captions / kicks.
import json, numpy as np, subprocess, wave
from scipy.signal import butter, lfilter
SR=48000
ev=json.load(open('out/events.json')); TL=json.load(open('voices/igbo/voice/lines.json'))
TOTAL=ev['total']; N=int(TOTAL*SR)
def rd(path):
    out=subprocess.run(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(out,dtype=np.float32).copy()
voice=rd('out/voice.wav'); voice=np.pad(voice,(0,max(0,N-len(voice))))[:N]
rng=np.random.default_rng(5)
chap={}
for l in TL['lines']: chap.setdefault(l['chapter'],l['start'])
def cat(t):
    c=1
    for k,v in chap.items():
        if t>=v-0.05: c=k
    return c
def env(n,a=0.005,d=0.25):
    x=np.arange(n)/SR; return np.minimum(1,x/a)*np.exp(-x/d)
mf=lambda m:440*2**((m-69)/12)
mus=np.zeros(N)
def put(arr,t,s):
    i=int(t*SR)
    if i>=N or i<0: return
    arr[i:i+len(s)]+=s[:N-i]
def kalimba(f,amp):
    n=int(0.7*SR); x=np.arange(n)/SR
    return amp*(np.sin(2*np.pi*f*x)+0.25*np.sin(2*np.pi*f*4.1*x)*np.exp(-x*20)+0.1*np.sin(2*np.pi*f*2*x))*env(n,0.003,0.22)
def bass(f,dur,amp):
    n=int(dur*SR); x=np.arange(n)/SR; return amp*np.tanh(2*np.sin(2*np.pi*f*x)+0.3*np.sin(4*np.pi*f*x))*env(n,0.01,dur*0.55)
def drum(f=150,amp=0.5):
    n=int(0.28*SR); x=np.arange(n)/SR; fr=f*(1+0.8*np.exp(-x*30)); ph=2*np.pi*np.cumsum(fr)/SR
    return amp*np.sin(ph)*env(n,0.002,0.09)
def slap(amp=0.25):
    n=int(0.09*SR); b,a=butter(2,[1200/(SR/2),5000/(SR/2)],'band'); return amp*lfilter(b,a,rng.normal(0,1,n))*env(n,0.001,0.03)
def shk(amp=0.07):
    n=int(0.07*SR); b,a=butter(2,5000/(SR/2),'high'); return amp*lfilter(b,a,rng.normal(0,1,n))*env(n,0.004,0.025)
def cowbell(amp=0.12):
    n=int(0.25*SR); x=np.arange(n)/SR; return amp*(np.sin(2*np.pi*587*x)+np.sin(2*np.pi*845*x))*env(n,0.001,0.06)
bpm=106; beat=60/bpm; step=beat/4
chords=[(57,[69,72,76]),(53,[65,69,72]),(48,[67,72,76]),(55,[67,71,74])]  # Am F C G
nsteps=int(TOTAL/step)
for s in range(nsteps):
    t=s*step; c=cat(t); bar=(s//16)%8; ch=chords[(bar//2)%4]
    level={1:2,2:2,3:2,4:1,5:1,6:1,7:3,8:2}[c]   # 1 calm .. 3 festival
    k=s%16
    # kalimba arpeggio (8ths)
    if k%2==0:
        pat=[0,1,2,1,0,2,1,2]; m=ch[1][pat[(k//2)%8]]
        put(mus,t,kalimba(mf(m),0.12 if level>1 else 0.1))
    # bass on 1 and the 'and' of 3
    if k in (0,10): put(mus,t,bass(mf(ch[0]-12),beat*1.4,0.2))
    # shaker 16ths
    if level>=1: put(mus,t,shk(0.05 if k%4 else 0.08))
    # drums
    if level>=2:
        if k in (0,10): put(mus,t,drum(130,0.4))
        if k in (4,12): put(mus,t,slap(0.22))
        if k in (6,14) and level>=3: put(mus,t,drum(210,0.28))
    if level>=3 and k in (3,7,11,15): put(mus,t,cowbell(0.09))
# fade music in at the start, out at the end
fi=int(1.0*SR); mus[:fi]*=np.linspace(0,1,fi); fo=int(3*SR); mus[-fo:]*=np.linspace(1,0,fo)
# duck under the voice
ve=np.convolve(np.abs(voice),np.ones(2400)/2400,'same'); duck=1-0.62*np.clip(ve/0.03,0,1)
duck=np.convolve(duck,np.ones(4800)/4800,'same'); mus*=duck
# ---- sfx ----
sfx=np.zeros(N)
def pop(f0=900,amp=0.3):
    n=int(0.1*SR); x=np.arange(n)/SR; ph=2*np.pi*np.cumsum(f0*np.exp(-x*16))/SR; return amp*np.sin(ph)*env(n,0.001,0.04)
def whoosh(dur=0.35,amp=0.12):
    n=int(dur*SR); nz=rng.normal(0,1,n); out=np.zeros(n); seg=n//14
    for k in range(14):
        fc=500+2200*np.sin(np.pi*k/13); b,a=butter(2,[fc*0.6/(SR/2),min(0.99,fc*1.4/(SR/2))],'band'); out[k*seg:(k+1)*seg]=lfilter(b,a,nz[k*seg:(k+1)*seg])
    return amp*out*np.sin(np.pi*np.arange(n)/n)**2
def thump(amp=0.5):
    n=int(0.25*SR); x=np.arange(n)/SR; return amp*np.sin(2*np.pi*(90*np.exp(-x*8))*x)*env(n,0.002,0.08)
def ding(f=1320,amp=0.14):
    n=int(0.7*SR); x=np.arange(n)/SR; return amp*(np.sin(2*np.pi*f*x)+0.4*np.sin(2*np.pi*f*2.76*x))*env(n,0.002,0.3)
L=2/30
first={}
for a,line,kind in ev['cuts']:
    if line not in first: first[line]=a; put(sfx,a-0.1,whoosh(0.3,0.11))
    else: put(sfx,a,pop(1500,0.05))
for t,text in ev['caps']:
    put(sfx,t+1/30,pop(900,0.3)); 
    if any(w in text for w in ['50 IN','4×','CAPITAL','1,000','PROOF','RECORD']): put(sfx,t+1/30,ding(1320,0.12))
for t in ev['kicks']: put(sfx,t,thump(0.5))
mix=voice*1.0+mus*0.55+sfx*0.55
mix=np.tanh(mix*1.1)/1.1
with wave.open('out/mix_raw.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix,-1,1)*32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i','out/mix_raw.wav','-af','loudnorm=I=-15:TP=-1.5:LRA=8','-ar','48000','-ac','2','mix.wav'],check=True)
print('ok',len(mix)/SR)
