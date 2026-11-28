// THE BLOCK #2 v2 — same script, voices and drawings, rebuilt on the cut-out rig:
// characters much larger in frame, a camera that pushes, drifts and rolls on every line,
// background in depth layers, and 60 fps. No on-screen text.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import TL from './timeline.json';
import VIS from './visemes.json';
import {Rig, PL, Cam, J, face, pt, mixCam, ease, camTransform, clampCam, FPS, clamp01, lerp} from './Rig';

export {FPS};
export const EP2B_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
type Who = 'fast' | 'dre' | 'lou' | 'boss';
const LINES = TL.lines as Line[];
const vis = VIS as unknown as Record<string, [number, string][]>;
const L = (i: number) => LINES[Math.min(Math.max(i, 0), LINES.length - 1)];
const END = (i: number) => L(i).start + L(i).dur;
const lineAt = (t: number) => { let k = 0; LINES.forEach((l, i) => { if (t >= l.start - 0.1) k = i; }); return k; };

// ---------- world = the 2x shop background ----------
const WW = 2048, WH = 3072;
const w = (px: number) => px * 2;
const TERM: [number, number] = [w(752), w(742)];

const P: Record<string, PL> = {
  lou_wide: {x: 704, y: 2722, s: 0.80, m: [517, 368]},
  lou_sweat: {x: 704, y: 2722, s: 0.80, m: [528, 399]},
  dre_cross: {x: 1024, y: 2694, s: 0.76, m: [544, 294]},
  dre_ask: {x: 1024, y: 2700, s: 0.78, m: [524, 312]},
  fast_menu: {x: 1432, y: 2728, s: 0.80, m: [567, 348]},
  fast_talk: {x: 1440, y: 2728, s: 0.82, m: [517, 309]},
  fast_hype: {x: 1432, y: 2736, s: 0.80, m: [487, 338]},
  boss_talk: {x: 1098, y: 1606, s: 0.60, m: [518, 590], a: 1330, sh: false},
  boss_cross: {x: 1098, y: 1606, s: 0.60, m: [517, 518], a: 1258, sh: false},
};

const poseOf = (who: Who, t: number): string => {
  const i = lineAt(t);
  if (who === 'lou') return i >= 6 ? 'lou_sweat' : 'lou_wide';
  if (who === 'fast') { if (i <= 1) return 'fast_menu'; if (i === 10) return 'fast_hype'; return 'fast_talk'; }
  if (who === 'dre') return i >= 14 ? 'dre_ask' : 'dre_cross';
  return i >= 13 ? 'boss_cross' : 'boss_talk';
};
const poseStart = (who: Who, t: number) => { const p = poseOf(who, t); let s = t; for (let k = 1; k < 300; k++) { if (poseOf(who, t - k / FPS) !== p) break; s = t - k / FPS; } return s; };

const speaking = (t: number) => LINES.find((l) => t >= l.start && t < l.start + l.dur);
const REACT: [number, Who, string][] = [[1, 'boss', 'B'], [4, 'lou', 'E'], [6, 'lou', 'C'], [9, 'fast', 'C'], [10, 'lou', 'E'], [13, 'boss', 'B']];
const reaction = (t: number) => REACT.find(([i]) => t > END(i) + 0.1 && t < L(i + 1).start - 0.1);
const mouthOf = (who: Who, t: number) => {
  const l = speaking(t);
  if (l && l.who === who) { let v = 'X'; for (const [ts, s] of vis[String(l.i)] ?? []) if (t - l.start >= ts) v = s; return v; }
  const r = reaction(t);
  if (r && r[1] === who) return r[2];
  return 'X';
};
/** 0..1: is this character speaking (with a soft edge so the body settles) */
const talkAmt = (who: Who, t: number) => {
  const l = speaking(t);
  if (!l || l.who !== who) return 0;
  return clamp01(Math.min(t - l.start, l.start + l.dur - t) / 0.18);
};
const speakerX = (t: number): number | null => {
  const l = speaking(t);
  if (!l || l.who === 'sfx') return null;
  const p = P[poseOf(l.who as Who, t)];
  return p ? p.x : null;
};

// ---------- camera: every line gets a real move ----------
type Shot = {a: Cam; b: Cam; hide?: Who[]};
const faceOf = (pose: string, dz: number, dy = 0, rot = 0): Cam => { const [x, y] = face(P[pose]); return {cx: x, cy: y + dy, z: dz, rot}; };
const WIDE: Cam = {cx: 1090, cy: 1980, z: 0.78, rot: 0};

const SHOTS: Record<number, Shot> = {
  0: {a: {cx: 800, cy: 1930, z: 0.95, rot: -2.4}, b: {cx: 735, cy: 1810, z: 1.12, rot: 0.9}},
  1: {a: faceOf('fast_menu', 1.25, 170, 2.0), b: {cx: 1250, cy: 900, z: 0.95, rot: -1.4}},
  2: {a: faceOf('dre_cross', 1.5, 150, -2.6), b: faceOf('dre_cross', 1.78, 95, 0.4), hide: ['fast']},
  3: {a: faceOf('lou_wide', 1.45, 190, 1.8), b: faceOf('lou_wide', 1.72, 120, -0.8)},
  4: {a: faceOf('boss_talk', 1.35, 180, -1.6), b: faceOf('boss_talk', 1.68, 95, 1.0)},
  5: {a: {cx: TERM[0] - 40, cy: TERM[1] + 70, z: 1.75, rot: 3.4}, b: {cx: TERM[0] + 10, cy: TERM[1] + 10, z: 2.35, rot: -1.2}, hide: ['fast', 'lou', 'dre']},
  6: {a: faceOf('boss_talk', 2.0, 70, 1.4), b: faceOf('boss_talk', 2.16, 60, -0.6)},
  7: {a: faceOf('lou_sweat', 1.42, 190, -1.8), b: faceOf('lou_sweat', 1.8, 110, 1.2)},
  8: {a: {cx: TERM[0] + 50, cy: TERM[1] - 20, z: 2.0, rot: -3.6}, b: {cx: TERM[0] + 10, cy: TERM[1] + 25, z: 2.6, rot: 1.4}, hide: ['fast', 'lou', 'dre']},
  9: {a: faceOf('boss_talk', 2.1, 60, -1.2), b: faceOf('boss_talk', 2.3, 50, 0.8)},
  10: {a: faceOf('fast_hype', 1.15, 300, 2.4), b: faceOf('fast_hype', 1.55, 170, -1.6)},
  11: {a: faceOf('lou_sweat', 1.75, 110, 1.4), b: faceOf('lou_sweat', 1.42, 200, -1.2)},
  12: {a: faceOf('dre_cross', 1.4, 210, -1.6), b: faceOf('dre_cross', 1.72, 130, 1.4), hide: ['fast']},
  13: {a: faceOf('fast_talk', 1.45, 200, 1.8), b: faceOf('fast_talk', 1.78, 130, -1.0)},
  14: {a: faceOf('boss_cross', 1.5, 170, 1.2), b: faceOf('boss_cross', 1.9, 90, -1.8)},
  15: {a: {...WIDE, z: 0.86, rot: -1.2}, b: {...WIDE, z: 0.74, rot: 1.0}},
  16: {a: faceOf('dre_ask', 1.6, 160, -3.0), b: faceOf('dre_ask', 2.05, 90, 1.6)},
  17: {a: {cx: 980, cy: 2230, z: 0.86, rot: -2.2}, b: faceOf('boss_cross', 1.3, 250, 1.6)},
};
const SHOP_END = L(17).start;

const camAt = (t: number): {cam: Cam; hide: Who[]} => {
  const r = reaction(t);
  if (r) {
    const k = ease((t - END(r[0]) - 0.1) / Math.max(0.2, L(r[0] + 1).start - 0.2 - END(r[0])));
    const p = poseOf(r[1], t);
    return {cam: mixCam(faceOf(p, 1.75, 70, 2.2), faceOf(p, 1.95, 45, -1.4), k), hide: []};
  }
  const i = lineAt(t);
  const sh = SHOTS[i] ?? {a: WIDE, b: WIDE};
  const span = Math.max(0.7, (i + 1 < LINES.length ? L(i + 1).start : TL.total) - L(i).start);
  const k = ease((t - L(i).start) / span);
  return {cam: mixCam(sh.a, sh.b, k), hide: sh.hide ?? []};
};

// ---------- one character ----------
const Actor: React.FC<{who: Who; t: number; f: number}> = ({who, t, f}) => {
  const pose = poseOf(who, t), p = P[pose];
  const v = mouthOf(who, t);
  const blink = v === 'X' && ((f + who.length * 47) % 166) < 5;
  const talk = talkAmt(who, t);
  const sx = speakerX(t);
  const look = sx === null || Math.abs(sx - p.x) < 40 ? 0 : Math.max(-1, Math.min(1, (sx - p.x) / 500));
  const i = lineAt(t);
  const mood = who === 'lou' ? clamp01((t - L(9).start) / 1.4) * 0.6 + (i >= 6 ? 0.4 : 0) : 0;
  return (
    <Rig pose={pose} p={p} v={v} blink={blink} t={t} f={f} phase={who.length * 1.7}
      talk={talk} look={talk > 0.2 ? 0 : look} swap={Math.round((t - poseStart(who, t)) * FPS)} mood={mood} />
  );
};

// ---------- the three of them legging it ----------
// one drawing, driven like a run: a bounce and a squash-stretch per stride, a lean, a motion trail
// behind them and a puff of dust at every footfall.
const STRIDE = 3.6;   // strides per second
const Runners: React.FC<{x: number; y: number; t: number; fade: number; blur: number; w: number}> = ({x, y, t, fade, blur, w}) => {
  const h = w * 941 / 1672;
  const ph = t * STRIDE * Math.PI * 2;
  const air = Math.abs(Math.sin(ph));                 // 0 on the ground, 1 at the top of the stride
  const bounce = -air * h * 0.045;
  const sy = 1 + air * 0.035 - (1 - air) * 0.03;      // stretch in the air, squash on landing
  const sx = 1 / sy;
  const tilt = Math.sin(ph) * 1.6 - 3.2;              // always leaning into the run
  const body = (op: number, dx: number, bl: number) => (
    <div style={{position: 'absolute', left: x + dx, top: y - h + bounce, width: w, height: h,
      transformOrigin: '50% 100%', transform: `rotate(${tilt}deg) scale(${sx}, ${sy})`, opacity: op * fade, filter: `blur(${bl}px)`}}>
      <Img src={staticFile('ai/crew_run.png')} style={{position: 'absolute', left: 0, top: 0, width: w, height: h}} />
    </div>
  );
  return (
    <>
      {body(0.3, -w * 0.045, blur + 7)}
      {body(1, 0, blur)}
      {[0.22, 0.52, 0.82].map((k, i) => {
        const age = ((t * STRIDE + i * 0.33) % 1);
        return (
          <div key={i} style={{position: 'absolute', left: x + w * k - age * w * 0.1, top: y - 18 - age * 30,
            width: 60 + age * 150, height: 32 + age * 90, borderRadius: '50%',
            background: 'rgba(225,215,200,0.30)', opacity: (1 - age) * 0.8 * fade, filter: 'blur(9px)'}} />
        );
      })}
    </>
  );
};

// ---------- the shop ----------
const Shop: React.FC<{t: number; f: number}> = ({t, f}) => {
  const {cam, hide} = camAt(t);
  const c = clampCam(cam, WW, WH);
  // depth: the back wall sits further away, so it moves a touch less than the counter and the crew
  const far: Cam = {...c, z: c.z * 0.94 + 0.06, cx: 1024 + (c.cx - 1024) * 0.88, cy: 1400 + (c.cy - 1400) * 0.9};
  const declined = [L(5).start + 0.45, L(8).start + 0.45].reduce((m, s) => Math.max(m, clamp01(1 - Math.abs(t - s) / 0.55)), 0);
  const run = clamp01((t - SHOP_END) / 0.62);
  const order: Who[] = ['dre', 'lou', 'fast'];
  return (
    <>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: camTransform(far)}}>
        <Img src={staticFile('ai/bg_shop2x.png')} style={{position: 'absolute', left: 0, top: 0, width: WW, height: WH}} />
      </div>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: camTransform(c)}}>
        <Actor who="boss" t={t} f={f} />
        <Img src={staticFile('ai/shop_counter2x.png')} style={{position: 'absolute', left: 0, top: 0, width: WW, height: WH}} />
        {declined > 0.02 && (
          <div style={{position: 'absolute', left: w(718), top: w(690), width: w(72), height: w(50), borderRadius: 8,
            background: '#ff2b17', opacity: 0.66 * declined, boxShadow: `0 0 ${110 * declined}px ${46 * declined}px rgba(255,60,30,0.5)`}} />
        )}
        {t < SHOP_END
          ? order.filter((o) => !hide.includes(o)).map((o) => <Actor key={o} who={o} t={t} f={f} />)
          : <Runners x={120 + run * run * 2900} y={2735} t={t} fade={1 - clamp01((run - 0.82) / 0.18)} blur={run * 4} w={2150} />}
      </div>
    </>
  );
};

// ---------- outside ----------
const COP_T = L(18).start, LAST_T = L(19).start;
const Street: React.FC<{t: number}> = ({t}) => {
  const flash = Math.sin(t * Math.PI * 2 * 2.6) > 0 ? 1 : 0.28;
  if (t < LAST_T) {
    const d = t - COP_T, k = ease(d / 2.3);
    const z = lerp(1.04, 1.26, k), rot = lerp(2.6, -1.2, k), slide = lerp(190, 0, ease(d / 0.45));
    return (
      <AbsoluteFill style={{background: '#120f22', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `rotate(${rot}deg) scale(${z}) translateX(${slide}px)`, transformOrigin: '50% 58%'}}>
          <Img src={staticFile('ai/police_car2x.png')} style={{position: 'absolute', left: -120, top: -30, width: 1320, height: 1980}} />
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920,
            background: 'radial-gradient(ellipse at 52% 44%, rgba(70,150,255,0.6) 0%, rgba(40,90,255,0) 55%)', opacity: flash, mixBlendMode: 'screen'}} />
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(40,110,255,0.15)', opacity: flash}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)'}} />
      </AbsoluteFill>
    );
  }
  const d = t - LAST_T, bob = Math.abs(Math.sin(d * 15.5)), pan = -d * 150;
  return (
    <AbsoluteFill style={{background: '#120f22', overflow: 'hidden'}}>
      <Img src={staticFile('ai/bg_street2x.png')} style={{position: 'absolute', left: -150 + pan * 0.45, top: -60, width: 1440, height: 2160}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(40,110,255,0.2)', opacity: flash}} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <div key={k} style={{position: 'absolute', left: 1300 - ((k * 230 + d * 1900) % 1700), top: 1000 + k * 78, width: 230, height: 7,
          borderRadius: 4, background: 'rgba(255,255,255,0.3)', filter: 'blur(2px)'}} />
      ))}
      <Runners x={-120 + pan * 0.1} y={1720} t={t} fade={1} blur={0.6} w={1320} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Episode2B: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const outside = t >= COP_T;
  return (
    <AbsoluteFill style={{background: '#1b1530', overflow: 'hidden'}}>
      {outside ? <Street t={t} /> : <Shop t={t} f={f} />}
      {!outside && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 56%, rgba(0,0,0,0.5) 100%)'}} />}
      <Audio src={staticFile('ai/mix2.mp3')} />
    </AbsoluteFill>
  );
};
