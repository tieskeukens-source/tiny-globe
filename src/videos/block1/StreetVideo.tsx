// THE BLOCK #1 v4 — staged scene: Dre sits on the flats' steps, Lou leans on the lamp post, Fast walks in hyped.
// Camera: establishing wide, low dutch mediums, close-ups, over-the-shoulder (back views). Gags: the pigeon flies off,
// the chicken shop shuts its lights. Word-by-word captions in each character's colour.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Guy, BackGuy, InkDefs, Pose, Who} from './chars';
import {Street, Pigeon} from './street';
import {BANG} from './fonts';
import TL from './timeline.json';
import ENV from './env.json';

export const FPS = 30;
export const SHORT_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
const LINES = TL.lines as Line[];
const env = ENV as unknown as Record<string, number[]>;
const L = (i: number) => LINES[Math.min(i, LINES.length - 1)];
const END = (i: number) => L(i).start + L(i).dur;

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
const wordTime = (i: number, needle: string) => { const w = L(i).words.find((x) => String(x[2]).toLowerCase().includes(needle)); return w ? Number(w[0]) : L(i).start; };

// ---------- blocking ----------
type Place = {x: number; y: number; s: number; rot: number; sit?: boolean; step?: number; anchorY: number};
const place = (who: Who, t: number): Place => {
  if (who === 'dre') {
    const up = L(9).start - 0.15;                     // stands up on "Five days"
    if (t < up) return {x: 225, y: 1330, s: 0.66, rot: 0, sit: true, anchorY: 980};
    const dip = Math.sin(clamp01((t - up) / 0.35) * Math.PI) * -26;
    const w = ease((t - L(10).start) / 1.6);          // walks to the front while Fast defends his jersey
    return {x: lerp(235, 590, w), y: lerp(1500, 1800, w) + dip, s: lerp(0.66, 0.84, w), rot: 0, anchorY: 1280, step: w > 0 && w < 1 ? t * 11 : undefined};
  }
  if (who === 'lou') {
    const off = ease((t - L(7).start + 0.3) / 0.4);   // pushes off the post to tell the mum story
    return {x: lerp(905, 900, off), y: 1600, s: 0.74, rot: lerp(5, 0, off), anchorY: 1280};
  }
  const enter = ease((t - 0.15) / 1.15);
  const pace = t > L(4).start && t < L(5).start ? Math.sin((t - L(4).start) * 1.6) * 70 : 0;
  const aside = ease((t - END(10)) / 0.8);           // steps left to make room for Dre
  const moving = (t > 0.15 && t < 1.3) || pace !== 0 || (aside > 0 && aside < 1);
  return {x: lerp(1450, 640, enter) + pace - aside * 360, y: 1830 - aside * 70, s: 0.88 - aside * 0.04, rot: 0, anchorY: 1280, step: moving ? t * 12 : undefined};
};

// ---------- acting ----------
type P = Partial<Pose> & {shake?: number};
const ACT = (i: number, who: Who, t: number): P => {
  const l = LINES[i];
  const wi = wordIdx(l, t), talk = mouth(who, t);
  const wob = (a: number) => a + Math.sin(t * 7 + who.length) * 6 + talk * 14;
  const pl = place(who, t), sp = place(l.who as Who, t);
  const toward = Math.sign(sp.x - pl.x) * 0.85;
  const base: Record<Who, P> = {
    dre: pl.sit ? {arms: 'rig', aL: [18, -62], aR: [18, -62], eyes: 'calm', look: toward} : {arms: 'crossed', eyes: 'calm', look: toward},
    lou: {arms: 'pockets', eyes: 'tired', look: toward},
    fast: {arms: 'rig', aL: [10, -12], aR: [10, -12], eyes: 'wide', look: toward},
  };
  const b = {...base[who], sit: pl.sit, step: pl.step};
  if (who === l.who) b.look = 0;
  switch (i * 10 + (['dre', 'lou', 'fast'] as Who[]).indexOf(who)) {
    case 2: return {...b, aL: [wob(140), 20], aR: [wob(150), 10], look: -0.4, shake: t > 1.3 ? 3 : 0};
    case 0: return {...b, eyes: 'side'};
    case 10: return {...b, eyes: 'side', look: 0.8, aR: [wob(24), -80]};                              // "All week?"
    case 12: return {...b, aL: [30, -30], aR: [30, -30], look: -0.7};
    case 22: return {...b, aL: [wob(30), -120], aR: [10, -12], eyes: 'calm', look: -0.6};             // fake cough
    case 20: return {...b, eyes: 'side'};
    case 31: return {...b, arms: 'rig', aL: [wob(60), -20], aR: [6, -14], eyes: 'wide', look: -0.8}; // Lou hypes him
    case 32: return {...b, aL: [60, 10], aR: [60, 10], open: 0.1};
    case 42: return {...b, aL: [wob(60 + (wi % 2) * 30), 10], aR: [wob(90 - (wi % 2) * 30), 10], look: wi % 3 === 0 ? -0.6 : 0};
    case 41: return {...b, eyes: 'wide'};
    case 50: return {...b, eyes: 'side', look: 0.8, aR: [24, -80]};                                   // "And in real life?"
    case 52: return {...b, aL: [70, 10], aR: [70, 10], open: 0.15, look: -0.7};
    case 62: return {...b, aL: [3, 0], aR: [3, 0], eyes: 'closed', tilt: -8, look: -0.3};             // deflates
    case 61: return {...b, eyes: 'side'};
    case 71: return {...b, arms: 'rig', aL: [wob(30), -150], aR: [6, -14], phone: true, eyes: 'wide', look: -0.3};
    case 72: return {...b, aL: [4, 0], aR: [4, 0], eyes: 'wide', open: 0.1, look: 0.8};
    case 82: return {...b, aL: [20, -40], aR: [wob(85), 0], eyes: 'angry', look: 1, shake: 5};       // points at Lou
    case 81: return {...b, arms: 'rig', aL: [6, -14], aR: [6, -14], eyes: 'angry', look: -0.8};
    case 90: return {...b, eyes: 'calm', look: 0.4};
    case 92: return {...b, aL: [12, -20], aR: [12, -20], look: -0.7, eyes: 'wide'};
    case 102: return {...b, aL: [wob(40), -110], aR: [wob(40), -110], eyes: 'angry', look: -0.5, shake: 3}; // hugs his lucky jersey
    case 111: return {...b, arms: 'rig', aL: [wob(45), -150], aR: [6, -14], eyes: 'angry', look: -0.8};    // waves the smell away
    case 112: return {...b, eyes: 'closed', tilt: 6, aL: [10, -12], aR: [10, -12]};
    case 110: return {...b, eyes: 'side'};
    case 122: return {...b, aL: [10, -12], aR: [wob(125), 10], eyes: 'wide', look: 0.6};               // points at the shop
    case 121: return {...b, eyes: 'side'};
    case 130: return {...b, eyes: 'side', look: 0.7};
    case 132: return {...b, aL: [4, 0], aR: [4, 0], eyes: 'closed', tilt: -6};
    case 131: return {...b, eyes: 'tired'};
    case 140: return {...b, arms: 'rig', aL: [8, -14], aR: [wob(40), -100], look: 0};
    case 141: return {...b, look: -0.4, eyes: 'side'};
    case 142: return {...b, aL: [40, 60], aR: [40, 60], look: 0.5, eyes: 'wide'};
  }
  return b;
};

// ---------- camera ----------
type Cam = {cx: number; cy: number; z: number; rot: number; ots?: Who; hide?: Who};
const head = (who: Who, t: number) => { const p = place(who, t); return [p.x, p.y - (p.anchorY - 300) * p.s] as const; };
const CAM = (i: number, t: number): Cam => {
  const push = 1 + Math.max(0, t - L(i).start) * 0.03;
  const close = (w: Who, z: number, dy = 110, rot = 0): Cam => { const [x, y] = head(w, t); return {cx: x, cy: y + dy, z, rot}; };
  let c: Cam;
  switch (i) {
    case 0: c = t < 1.45 ? {cx: 600, cy: 1250, z: 0.95, rot: 0} : {cx: 640, cy: 1070, z: 1.5, rot: -4}; break;
    case 1: c = close('dre', 1.9); break;
    case 2: c = {cx: 640, cy: 1060, z: 1.7, rot: -3}; break;
    case 3: c = {cx: 900, cy: 1010, z: 1.7, rot: 0, ots: 'fast', hide: 'fast'}; break;
    case 4: c = {cx: 690, cy: 1130, z: 1.3, rot: 3}; break;
    case 5: c = close('dre', 2.1); break;
    case 6: c = {cx: 640, cy: 1010, z: 2.4, rot: 0}; break;
    case 7: c = {cx: 900, cy: 1010, z: 1.8, rot: 0}; break;
    case 8: c = {cx: 780, cy: 1200, z: 1.05, rot: -5}; break;
    case 9: c = close('dre', 1.65, 140); break;
    case 10: c = {cx: 650, cy: 1060, z: 1.6, rot: 3, ots: 'dre', hide: 'dre'}; break;
    case 11: c = {cx: 680, cy: 1450, z: 1.0, rot: 0}; break;
    case 12: c = close('fast', 1.35, 260, 3); break;
    case 13: c = {cx: 760, cy: 1180, z: 0.88, rot: 0}; break;
    default: c = {cx: 590, cy: 1300, z: 1.0, rot: 0};
  }
  return {...c, z: c.z * push};
};

// ---------- captions ----------
const SPELL: Record<string, string> = {FINKS: 'THINKS', FIRTEEN: 'THIRTEEN', NUFFIN: 'NOTHING'};
const COL: Record<Who, string> = {fast: '#ff5a46', lou: '#9fd4ff', dre: '#ffd24a'};
const Captions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.start - 0.05 && t < x.start + x.dur + 0.25);
  if (!l) return null;
  const groups: number[][] = [[]];
  l.words.forEach((w, k) => {
    const g = groups[groups.length - 1];
    g.push(k);
    if (g.length >= 3 || /[.,!?]$/.test(String(w[2]))) groups.push([]);
  });
  const cur = wordIdx(l, t);
  const g = groups.find((x) => x.includes(cur)) ?? groups[0];
  const words = g.map((k) => { const w = String(l.words[k][2]).toUpperCase(); const core = w.replace(/[^A-Z']/g, ''); return SPELL[core] ? w.replace(core, SPELL[core]) : w; });
  const size = 104, total = words.join(' ').length * size * 0.5;
  let x = 540 - total / 2;
  return (
    <g>
      {words.map((w, j) => {
        const k = g[j], on = k === cur, x0 = x;
        x += (w.length + 1) * size * 0.5;
        const pop = on ? 1 + 0.12 * clamp01(1 - (t - Number(l.words[k][0])) * 6) + 0.08 : 1;
        const cx = x0 + (w.length * size * 0.5) / 2;
        return (
          <text key={k} x={cx} y={1395} textAnchor="middle" fontFamily={BANG} fontSize={size} fill={on ? COL[l.who as Who] : '#fdfbf5'}
            stroke="#141210" strokeWidth={14} paintOrder="stroke" letterSpacing={2} transform={`translate(${cx} 1370) scale(${pop}) translate(${-cx} -1370)`}>{w}</text>
        );
      })}
    </g>
  );
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
  const fly = t - wordTime(11, 'pigeon');
  const closed = clamp01((t - L(13).start - 0.45) / 0.12);
  return (
    <AbsoluteFill style={{background: '#14132a'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <InkDefs seed={Math.floor(f / 4) % 3} />
        <defs>
          <filter id="fg"><feGaussianBlur stdDeviation={2.5} /><feComponentTransfer><feFuncR type="linear" slope={0.75} /><feFuncG type="linear" slope={0.75} /><feFuncB type="linear" slope={0.8} /></feComponentTransfer></filter>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.5} /></radialGradient>
        </defs>
        <g transform={`translate(${540 + drift[0]} ${960 + drift[1]}) rotate(${c.rot}) scale(${c.z}) translate(${-c.cx} ${-c.cy})`}>
          <Street f={f} closed={closed} />
          <Pigeon f={f} x={500} y={1900} fly={fly > 0 ? fly : -1} />
          {order.map((w) => <Char key={w} who={w} i={i} t={t} f={f} />)}
        </g>
        {c.ots && (
          <g transform={`translate(${c.ots === 'fast' ? -250 : -230} ${1010 + Math.sin(t * 1.3) * 6}) scale(1.55)`} filter="url(#fg)">
            <g filter="url(#wob)"><BackGuy who={c.ots} /></g>
          </g>
        )}
        <rect width={1080} height={1920} filter="url(#grain)" />
        <rect width={1080} height={1920} fill="url(#vig)" />
        <Captions t={t} />
      </svg>
      <Audio src={staticFile('block1/mix.mp3')} />
    </AbsoluteFill>
  );
};
