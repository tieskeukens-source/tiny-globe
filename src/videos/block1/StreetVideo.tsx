// THE BLOCK #1 v2 — one street, one set: the crew outside the chicken shop. Camera cuts/zooms to the speaker,
// listeners look at whoever talks, speakers gesture with rigged arms, lip sync from voice envelopes. No captions.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Guy, InkDefs, Pose, Who} from './chars';
import {Street, Pigeon, FLOOR} from './street';
import './fonts';
import TL from './timeline.json';
import ENV from './env.json';

export const FPS = 30;
export const SHORT_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
const LINES = TL.lines as Line[];
const env = ENV as unknown as Record<string, number[]>;

const SC = 0.76;
const POS: Record<Who, number> = {lou: 205, dre: 540, fast: 872};
const HEAD_Y = FLOOR - (1280 - 300) * SC;

const speaking = (t: number) => LINES.find((l) => t >= l.start && t < l.start + l.dur + 0.05);
const lineAt = (t: number) => { let k = 0; LINES.forEach((l, i) => { if (t >= l.start - 0.1) k = i; }); return k; };
const mouth = (who: Who, t: number) => {
  const l = speaking(t);
  if (!l || l.who !== who) return 0;
  const e = env[String(l.i)];
  if (e) return Math.min(1, (e[Math.floor((t - l.start) * FPS)] ?? 0) * 1.3);
  return 0.3 + 0.5 * Math.abs(Math.sin(t * 27 + l.i));
};
const wordIdx = (l: Line, t: number) => { let k = 0; l.words.forEach((w, i) => { if (t >= Number(w[0])) k = i; }); return k; };

// per line: what each character does (speaker gestures, listeners react)
type P = Partial<Pose> & {shake?: number};
const ACT = (i: number, who: Who, t: number): P => {
  const l = LINES[i];
  const wi = wordIdx(l, t), talk = mouth(who, t);
  const wob = (a: number) => a + Math.sin(t * 7 + who.length) * 6 + talk * 14;   // talking hands
  const toward = (w: Who) => Math.sign(POS[w] - POS[who]) * 0.85;
  const base: Record<Who, P> = {
    dre: {arms: 'crossed', eyes: 'calm', look: toward(l.who as Who)},
    lou: {arms: 'pockets', eyes: 'tired', look: toward(l.who as Who)},
    fast: {arms: 'rig', aL: [10, -12], aR: [10, -12], eyes: 'wide', look: toward(l.who as Who)},
  };
  const b = base[who];
  if (who === l.who) b.look = 0;
  switch (i * 10 + (['dre', 'lou', 'fast'] as Who[]).indexOf(who)) {
    case 2: return {...b, aL: [wob(140), 20], aR: [wob(150), 10], look: -0.4, shake: 3};          // 0 FAST hype
    case 0: return {...b, eyes: 'side'};
    case 11: return {...b, arms: 'rig', aL: [wob(25), -95], aR: [6, -14], look: 0.8};               // 1 LOU waves it off
    case 12: return {...b, aL: [60, 10], aR: [60, 10], open: 0.1};
    case 22: return {...b, aL: [wob(60 + (wi % 2) * 30), 10], aR: [wob(90 - (wi % 2) * 30), 10], look: 0, shake: 1.5}; // 2 FAST flex
    case 21: return {...b, eyes: 'side'};
    case 30: return {...b, eyes: 'side', look: 0.8};                                                 // 3 DRE "in real life?"
    case 32: return {...b, aL: [70, 10], aR: [70, 10], open: 0.15};                                  // frozen mid-flex
    case 42: return {...b, aL: [3, 0], aR: [3, 0], eyes: 'closed', tilt: -8, look: -0.3};             // 4 FAST deflates
    case 41: return {...b, eyes: 'side'};
    case 51: return {...b, arms: 'rig', aL: [wob(30), -150], aR: [6, -14], phone: true, eyes: 'side', look: 0.3}; // 5 LOU on the phone
    case 52: return {...b, aL: [4, 0], aR: [4, 0], eyes: 'wide', open: 0.1};
    case 62: return {...b, aL: [wob(85), 0], aR: [20, -40], eyes: 'angry', look: -1, shake: 5};      // 6 FAST points at Lou
    case 61: return {...b, eyes: 'angry'};
    case 70: return {...b, eyes: 'calm', look: 0};                                                   // 7 DRE deadpan to camera
    case 72: return {...b, aL: [12, -20], aR: [12, -20], look: -0.7, eyes: 'wide'};
    case 82: return {...b, aL: [wob(150), 15], aR: [wob(140), 25], eyes: 'angry', look: 0, shake: 4}; // 8 FAST "hard jersey"
    case 80: return {...b, eyes: 'side'};
    case 81: return {...b, eyes: 'side'};
    case 90: return {...b, arms: 'rig', aL: [8, -14], aR: [wob(40), -100], look: 0};                 // 9 DRE asks the camera
    case 91: return {...b, look: 0, eyes: 'side'};
    case 92: return {...b, aL: [40, 60], aR: [40, 60], look: 0, eyes: 'wide'};
  }
  return b;
};

// camera per line: [centerX, centerY, zoom]
const SHOT = (i: number, t: number): [number, number, number] => {
  const l = LINES[i];
  const close = (w: Who, z: number, dy = 0): [number, number, number] => [POS[w], HEAD_Y + 110 + dy, z];
  const push = 1 + Math.max(0, t - l.start) * 0.025;
  let s: [number, number, number];
  switch (i) {
    case 0: s = t < 1.0 ? [540, 1180, 1.14] : close('fast', 1.55, 60); break;
    case 1: s = close('lou', 1.9); break;
    case 2: s = close('fast', 1.45, 120); break;
    case 3: s = close('dre', 2.1); break;
    case 4: s = close('fast', 2.2); break;
    case 5: s = close('lou', 1.75, 60); break;
    case 6: s = [560, 1120, 1.08]; break;
    case 7: s = close('dre', 2.3); break;
    case 8: s = close('fast', 1.5, 100); break;
    default: s = [540, 1180, 1.14];
  }
  return [s[0], s[1], s[2] * push];
};

const blink = (f: number, off: number) => (f + off) % 83 < 3;

const Char: React.FC<{who: Who; i: number; t: number; f: number}> = ({who, i, t, f}) => {
  const a = ACT(i, who, t);
  const open = a.open ?? mouth(who, t);
  const talking = open > 0.05;
  const bob = Math.sin(f / 10 + POS[who]) * 5 + (talking ? Math.sin(f / 2.5) * 4 : 0);
  const sh = a.shake ? [Math.sin(f * 2.1) * a.shake, Math.cos(f * 2.7) * a.shake] : [0, 0];
  const sway = Math.sin(f / 23 + POS[who]) * 1.2 + (talking ? Math.sin(f / 7) * 1.5 : 0);
  const pose: Pose = {...a, open, blink: blink(f, POS[who]), tilt: (a.tilt ?? 0) + (talking ? Math.sin(f / 5) * 2.5 : 0)};
  const s = who === 'dre' ? SC * 1.02 : SC;
  return (
    <g transform={`translate(${POS[who] + sh[0]} ${FLOOR + sh[1]}) rotate(${sway}) translate(0 ${bob}) scale(${s}) translate(-300 -1280)`}>
      <ellipse cx={300} cy={1282} rx={250} ry={34} fill="#000" opacity={0.25} />
      <g filter="url(#wob)"><Guy who={who} pose={pose} /></g>
    </g>
  );
};

export const StreetVideo: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = lineAt(t);
  const [cx, cy, z] = SHOT(i, t);
  const drift = [Math.sin(t * 0.7) * 6, Math.cos(t * 0.5) * 5];
  return (
    <AbsoluteFill style={{background: '#1b1a33'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <InkDefs seed={Math.floor(f / 4) % 3} />
        <g transform={`translate(${540 + drift[0]} ${960 + drift[1]}) scale(${z}) translate(${-cx} ${-cy})`}>
          <Street f={f} />
          <Pigeon f={f} x={360} />
          <Char who="lou" i={i} t={t} f={f} />
          <Char who="fast" i={i} t={t} f={f} />
          <Char who="dre" i={i} t={t} f={f} />
        </g>
        <rect width={1080} height={1920} filter="url(#grain)" />
        {/* vignette */}
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.45} /></radialGradient>
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
      <Audio src={staticFile('block1/mix.mp3')} />
    </AbsoluteFill>
  );
};
