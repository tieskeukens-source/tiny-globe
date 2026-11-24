// THE BLOCK #1 v3 — staged scene: Dre sits on the flats' steps, Lou leans on the lamp post, Fast walks in hyped.
// Camera: establishing wide, low dutch mediums, close-ups, over-the-shoulder (back views), Dre stands up and walks to camera.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Guy, BackGuy, InkDefs, Pose, Who} from './chars';
import {Street, Pigeon} from './street';
import './fonts';
import TL from './timeline.json';
import ENV from './env.json';

export const FPS = 30;
export const SHORT_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
const LINES = TL.lines as Line[];
const env = ENV as unknown as Record<string, number[]>;
const L = (i: number) => LINES[Math.min(i, LINES.length - 1)];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

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

// ---------- blocking: where everybody is ----------
type Place = {x: number; y: number; s: number; rot: number; sit?: boolean; step?: number; anchorY: number};
const DRE_UP = () => L(7).start - 0.15;               // Dre stands up on "Four days"
const place = (who: Who, t: number): Place => {
  if (who === 'dre') {
    const up = DRE_UP();
    if (t < up) return {x: 225, y: 1330, s: 0.66, rot: 0, sit: true, anchorY: 980};
    const k = clamp01((t - up) / 0.35);
    const dip = Math.sin(k * Math.PI) * -26;
    const w = ease((t - L(8).start) / 1.6);           // walks down to the front during Fast's line
    return {x: lerp(235, 590, w), y: lerp(1500, 1800, w) + dip, s: lerp(0.66, 0.84, w), rot: 0, anchorY: 1280, step: w > 0 && w < 1 ? t * 11 : undefined};
  }
  if (who === 'lou') {
    const off = ease((t - L(5).start + 0.3) / 0.4);   // pushes off the post to take the call
    return {x: lerp(905, 900, off), y: 1600, s: 0.74, rot: lerp(5, 0, off), anchorY: 1280};
  }
  const enter = ease((t - 0.15) / 1.15);
  const pace = t > L(2).start && t < L(3).start ? Math.sin((t - L(2).start) * 1.6) * 70 : 0;
  const moving = (t > 0.15 && t < 1.3) || pace !== 0;
  const aside = ease((t - L(9).start + 0.6) / 0.7);   // makes room for Dre at the end
  const mv = moving || (aside > 0 && aside < 1);
  return {x: lerp(1450, 640, enter) + pace - aside * 360, y: 1830 - aside * 70, s: 0.88 - aside * 0.04, rot: 0, anchorY: 1280, step: mv ? t * 12 : undefined};
};

// ---------- acting ----------
type P = Partial<Pose> & {shake?: number};
const ACT = (i: number, who: Who, t: number): P => {
  const l = LINES[i];
  const wi = wordIdx(l, t), talk = mouth(who, t);
  const wob = (a: number) => a + Math.sin(t * 7 + who.length) * 6 + talk * 14;
  const pl = place(who, t);
  const sp = place(l.who as Who, t);
  const toward = Math.sign(sp.x - pl.x) * 0.85;
  const dreSit = who === 'dre' && pl.sit;
  const base: Record<Who, P> = {
    dre: dreSit ? {arms: 'rig', aL: [18, -62], aR: [18, -62], eyes: 'calm', look: toward} : {arms: 'crossed', eyes: 'calm', look: toward},
    lou: {arms: 'pockets', eyes: 'tired', look: toward},
    fast: {arms: 'rig', aL: [10, -12], aR: [10, -12], eyes: 'wide', look: toward},
  };
  const b = {...base[who], sit: pl.sit, step: pl.step};
  if (who === l.who) b.look = 0;
  const id = i * 10 + (['dre', 'lou', 'fast'] as Who[]).indexOf(who);
  switch (id) {
    case 2: return {...b, aL: [wob(140), 20], aR: [wob(150), 10], look: -0.4, shake: t > 1.3 ? 3 : 0};
    case 0: return {...b, eyes: 'side'};
    case 11: return {...b, arms: 'rig', aL: [wob(25), -95], aR: [6, -14], look: -0.8};
    case 12: return {...b, aL: [60, 10], aR: [60, 10], open: 0.1};
    case 22: return {...b, aL: [wob(60 + (wi % 2) * 30), 10], aR: [wob(90 - (wi % 2) * 30), 10], look: wi % 3 === 0 ? -0.6 : 0};
    case 21: return {...b, eyes: 'side'};
    case 30: return {...b, eyes: 'side', look: 0.8, aR: [24, -80]};
    case 32: return {...b, aL: [70, 10], aR: [70, 10], open: 0.15, look: -0.7};
    case 42: return {...b, aL: [3, 0], aR: [3, 0], eyes: 'closed', tilt: -8, look: -0.3};
    case 41: return {...b, eyes: 'side'};
    case 51: return {...b, arms: 'rig', aL: [wob(30), -150], aR: [6, -14], phone: true, eyes: 'side', look: -0.3};
    case 52: return {...b, aL: [4, 0], aR: [4, 0], eyes: 'wide', open: 0.1, look: 0.8};
    case 62: return {...b, aL: [20, -40], aR: [wob(85), 0], eyes: 'angry', look: 1, shake: 5};
    case 61: return {...b, eyes: 'angry', look: -0.8};
    case 70: return {...b, eyes: 'calm', look: 0.4};
    case 72: return {...b, aL: [12, -20], aR: [12, -20], look: -0.7, eyes: 'wide'};
    case 82: return {...b, aL: [wob(150), 15], aR: [wob(140), 25], eyes: 'angry', look: -0.5, shake: 4};
    case 80: return {...b, eyes: 'side'};
    case 81: return {...b, eyes: 'side'};
    case 90: return {...b, arms: 'rig', aL: [8, -14], aR: [wob(40), -100], look: 0};
    case 91: return {...b, look: -0.4, eyes: 'side'};
    case 92: return {...b, aL: [40, 60], aR: [40, 60], look: -0.5, eyes: 'wide'};
  }
  return b;
};

// ---------- camera ----------
type Cam = {cx: number; cy: number; z: number; rot: number; ots?: Who; hide?: Who};
const head = (who: Who, t: number) => { const p = place(who, t); return [p.x, p.y - (p.anchorY - 300) * p.s] as const; };
const CAM = (i: number, t: number): Cam => {
  const l = LINES[i];
  const push = 1 + Math.max(0, t - l.start) * 0.03;
  let c: Cam;
  switch (i) {
    case 0: c = t < 1.45 ? {cx: 600, cy: 1250, z: 0.95, rot: 0} : {cx: 640, cy: 1070, z: 1.5, rot: -4}; break;
    case 1: c = {cx: 900, cy: 1010, z: 1.7, rot: 0, ots: 'fast', hide: 'fast'}; break;
    case 2: c = {cx: 690, cy: 1130, z: 1.3, rot: 3}; break;
    case 3: { const [x, y] = head('dre', t); c = {cx: x, cy: y + 110, z: 2.0, rot: 0}; break; }
    case 4: c = {cx: 640, cy: 1010, z: 2.4, rot: 0}; break;
    case 5: c = {cx: 900, cy: 1010, z: 1.8, rot: 0}; break;
    case 6: c = {cx: 780, cy: 1200, z: 1.05, rot: -5}; break;
    case 7: { const [x, y] = head('dre', t); c = {cx: x + 30, cy: y + 140, z: 1.65, rot: 0}; break; }
    case 8: c = {cx: 650, cy: 1060, z: 1.6, rot: 3, ots: 'dre', hide: 'dre'}; break;
    default: c = {cx: 590, cy: 1300, z: 1.0, rot: 0};
  }
  return {...c, z: c.z * push};
};

const blink = (f: number, off: number) => (f + off) % 83 < 3;

const Char: React.FC<{who: Who; i: number; t: number; f: number}> = ({who, i, t, f}) => {
  const a = ACT(i, who, t);
  const pl = place(who, t);
  const open = a.open ?? mouth(who, t);
  const talking = open > 0.05;
  const bob = Math.sin(f / 10 + pl.x) * 5 + (talking ? Math.sin(f / 2.5) * 4 : 0) + (pl.step !== undefined ? -Math.abs(Math.sin(pl.step)) * 14 : 0);
  const sh = a.shake ? [Math.sin(f * 2.1) * a.shake, Math.cos(f * 2.7) * a.shake] : [0, 0];
  const sway = Math.sin(f / 23 + pl.x) * 1.2 + (talking ? Math.sin(f / 7) * 1.5 : 0);
  const pose: Pose = {...a, open, blink: blink(f, Math.round(pl.x)), tilt: (a.tilt ?? 0) + (talking ? Math.sin(f / 5) * 2.5 : 0)};
  return (
    <g transform={`translate(${pl.x + sh[0]} ${pl.y + sh[1]}) rotate(${pl.rot + sway}) translate(0 ${bob}) scale(${pl.s}) translate(-300 ${-pl.anchorY})`}>
      {!pl.sit && <ellipse cx={300} cy={1282} rx={250} ry={34} fill="#000" opacity={0.25} />}
      <g filter="url(#wob)"><Guy who={who} pose={pose} /></g>
    </g>
  );
};

export const StreetVideo: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = lineAt(t);
  const c = CAM(i, t);
  const drift = [Math.sin(t * 0.7) * 6, Math.cos(t * 0.5) * 5];
  const order = (['dre', 'lou', 'fast'] as Who[]).filter((w) => w !== c.hide).sort((a, b) => place(a, t).y - place(b, t).y);
  return (
    <AbsoluteFill style={{background: '#14132a'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <InkDefs seed={Math.floor(f / 4) % 3} />
        <defs>
          <filter id="fg"><feGaussianBlur stdDeviation={2.5} /><feComponentTransfer><feFuncR type="linear" slope={0.75} /><feFuncG type="linear" slope={0.75} /><feFuncB type="linear" slope={0.8} /></feComponentTransfer></filter>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.5} /></radialGradient>
        </defs>
        <g transform={`translate(${540 + drift[0]} ${960 + drift[1]}) rotate(${c.rot}) scale(${c.z}) translate(${-c.cx} ${-c.cy})`}>
          <Street f={f} />
          <Pigeon f={f} x={500} y={1900} />
          {order.map((w) => <Char key={w} who={w} i={i} t={t} f={f} />)}
        </g>
        {c.ots && (
          <g transform={`translate(${c.ots === 'fast' ? -250 : -230} ${1010 + Math.sin(t * 1.3) * 6}) scale(1.55)`} filter="url(#fg)">
            <g filter="url(#wob)"><BackGuy who={c.ots} /></g>
          </g>
        )}
        <rect width={1080} height={1920} filter="url(#grain)" />
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
      <Audio src={staticFile('block1/mix.mp3')} />
    </AbsoluteFill>
  );
};
