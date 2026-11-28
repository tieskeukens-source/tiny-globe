// THE BLOCK #2 — "It's On Me". Inside the chicken shop: Lou flexes, his card dies, the crew bolt.
// Same cut-out rig as #1 (ChatGPT art + Rhubarb mouth frames, blinks, pose squash, breathing),
// plus Boss Man behind the counter, a card terminal that flashes on DECLINED, and a street ending
// with the crew running and the police turning up. No on-screen text.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import TL from './timeline.json';
import VIS from './visemes.json';

export const FPS = 30;
export const AIEP2_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
type Who = 'fast' | 'dre' | 'lou' | 'boss';
const LINES = TL.lines as Line[];
const vis = VIS as unknown as Record<string, [number, string][]>;
const L = (i: number) => LINES[Math.min(i, LINES.length - 1)];
const END = (i: number) => L(i).start + L(i).dur;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lineAt = (t: number) => { let k = 0; LINES.forEach((l, i) => { if (t >= l.start - 0.1) k = i; }); return k; };

// ---------- the shop stage ----------
// bg_shop.png (1024x1536) drawn at 1.5x: bg px -> screen px
const BGX = -228, BGY = -230, BGW = 1536, BGH = 2304;
const bx = (px: number) => px * 1.5 + BGX;
const by = (py: number) => py * 1.5 + BGY;
const TERM: [number, number] = [bx(752), by(742)];        // the card terminal on the counter

// pose placement: x = centre, y = where pose row `a` lands, s = scale, m = mouth centre in the pose
type PL = {x: number; y: number; s: number; m: [number, number]; a?: number; sh?: boolean};
const P: Record<string, PL> = {
  lou_wide: {x: 300, y: 1812, s: 0.6, m: [517, 368]},
  lou_sweat: {x: 300, y: 1812, s: 0.6, m: [528, 399]},
  fast_menu: {x: 846, y: 1816, s: 0.6, m: [567, 348]},
  fast_talk: {x: 846, y: 1816, s: 0.62, m: [517, 309]},
  fast_hype: {x: 846, y: 1822, s: 0.6, m: [487, 338]},
  dre_cross: {x: 540, y: 1790, s: 0.57, m: [544, 294]},
  dre_ask: {x: 540, y: 1800, s: 0.58, m: [524, 312]},
  boss_talk: {x: 596, y: 975, s: 0.45, m: [518, 590], a: 1330, sh: false},
  boss_cross: {x: 596, y: 975, s: 0.45, m: [517, 518], a: 1258, sh: false},
};
const anchor = (p: PL) => p.a ?? 1530;
const head = (pose: string): [number, number] => { const p = P[pose]; return [p.x + (p.m[0] - 512) * p.s, p.y + (p.m[1] - 100 - anchor(p)) * p.s]; };

// ---------- who holds which pose ----------
const poseOf = (who: Who, t: number): string => {
  const i = lineAt(t);
  if (who === 'lou') return i >= 6 ? 'lou_sweat' : 'lou_wide';
  if (who === 'fast') { if (i <= 1) return 'fast_menu'; if (i === 10) return 'fast_hype'; return 'fast_talk'; }
  if (who === 'dre') return i >= 14 ? 'dre_ask' : 'dre_cross';
  return i >= 13 ? 'boss_cross' : 'boss_talk';
};
const poseStart = (who: Who, t: number) => { const p = poseOf(who, t); let s = t; for (let k = 1; k < 200; k++) { if (poseOf(who, t - k / FPS) !== p) break; s = t - k / FPS; } return s; };

// ---------- mouths ----------
const speaking = (t: number) => LINES.find((l) => t >= l.start && t < l.start + l.dur);
// small reactions in the gaps: [after line, who, shape]
const REACT: [number, Who, string][] = [[1, 'boss', 'B'], [4, 'lou', 'E'], [6, 'lou', 'C'], [9, 'fast', 'C'], [10, 'lou', 'E'], [13, 'boss', 'B']];
const reaction = (t: number) => REACT.find(([i]) => t > END(i) + 0.1 && t < L(i + 1).start - 0.1);
const mouthOf = (who: Who, t: number) => {
  const l = speaking(t);
  if (l && l.who === who) { let v = 'X'; for (const [ts, s] of vis[String(l.i)] ?? []) if (t - l.start >= ts) v = s; return v; }
  const r = reaction(t);
  if (r && r[1] === who) return r[2];
  return 'X';
};

// ---------- camera ----------
type Cam = {cx: number; cy: number; z: number; hide?: Who[]};
const close = (pose: string, z: number, dy = 120): Cam => { const [x, y] = head(pose); return {cx: x, cy: y + dy, z}; };
const SHOP_END = L(17).start;          // everything from here on happens outside

const camAt = (t: number): Cam => {
  const r = reaction(t);
  if (r) return {...close(poseOf(r[1], t), 2.2, 90), z: 2.2 + (t - END(r[0])) * 0.1};
  const i = lineAt(t), dt = Math.max(0, t - L(i).start), push = 1 + dt * 0.022;
  let c: Cam;
  switch (i) {
    case 0: c = {...close('lou_wide', 1.32, 330), z: 1.32 + t * 0.04}; break;
    case 1: c = {cx: 700, cy: 1000, z: 1.12}; break;                       // Fast points up at the menu board
    case 2: c = close('dre_cross', 1.9, 170); c.hide = ['fast']; break;
    case 3: c = close('lou_wide', 1.8, 180); break;
    case 4: c = close('boss_talk', 1.85, 150); break;
    case 5: c = {cx: TERM[0], cy: TERM[1], z: 2.4, hide: ['fast', 'lou', 'dre']}; break;   // beep on the card machine
    case 6: c = close('boss_talk', 2.15, 110); break;
    case 7: c = close('lou_sweat', 1.75, 170); break;
    case 8: c = {cx: TERM[0], cy: TERM[1], z: 2.6, hide: ['fast', 'lou', 'dre']}; break;
    case 9: c = close('boss_talk', 2.2, 110); break;
    case 10: c = close('fast_hype', 1.6, 250); break;
    case 11: c = close('lou_sweat', 1.7, 180); break;
    case 12: c = close('dre_cross', 1.9, 170); c.hide = ['fast']; break;
    case 13: c = close('fast_talk', 1.9, 160); break;
    case 14: c = close('boss_cross', 1.9, 140); break;
    case 15: c = {cx: 560, cy: 1180, z: 1.0}; break;                       // the silence: everyone in frame
    case 16: c = close('dre_ask', 2.0, 140); break;
    default: c = {cx: 560, cy: 1180, z: 1.0};
  }
  const z = Math.max(1, c.z * (i === 15 ? 1 : push));
  const hw = 540 / z, hh = 960 / z;
  return {z, hide: c.hide, cx: Math.min(BGX + BGW - hw, Math.max(BGX + hw, c.cx)), cy: Math.min(BGY + BGH - hh, Math.max(BGY + hh, c.cy))};
};

// ---------- a character ----------
const Char: React.FC<{who: Who; t: number; f: number}> = ({who, t, f}) => {
  const pose = poseOf(who, t), p = P[pose];
  const v = mouthOf(who, t);
  const blink = v === 'X' && ((f + who.length * 29) % 83) < 3;
  const sw = spring({frame: Math.round((t - poseStart(who, t)) * FPS), fps: FPS, config: {damping: 9, stiffness: 300}});
  const squash = 1 - (1 - sw) * 0.07;
  const talking = v !== 'X';
  const breathe = 1 + Math.sin(t * 2.1 + who.length) * 0.006;
  const bob = (talking ? Math.sin(f / 2.3) * 3 : 0) + (pose === 'fast_hype' ? -Math.abs(Math.sin(t * Math.PI * 142 / 60)) * 9 : 0);
  // Lou shrinks when the card gets refused the second time
  const sag = who === 'lou' ? clamp01((t - L(9).start) / 1.2) * 0.5 + (lineAt(t) >= 6 ? 0.5 : 0) : 0;
  const W = 1024 * p.s, H = 1536 * p.s, A = anchor(p) * p.s;
  return (
    <>
      {p.sh !== false && (
        <div style={{position: 'absolute', left: p.x - 240 * p.s, top: p.y - 22, width: 480 * p.s, height: 42, borderRadius: '50%', background: 'rgba(0,0,0,0.33)', filter: 'blur(7px)'}} />
      )}
      <div style={{position: 'absolute', left: p.x - W / 2, top: p.y - A + bob + sag * 16, width: W, height: H,
        transformOrigin: `${W / 2}px ${A}px`,
        transform: `rotate(${Math.sin(t * 1.2 + who.length) * 0.7 - sag * 1.6}deg) scale(${(2 - squash) * (1 - sag * 0.02)}, ${squash * breathe * (1 - sag * 0.03)})`,
        filter: `brightness(${0.94 - sag * 0.06}) contrast(1.04) saturate(1.04)`}}>
        <Img src={staticFile(`ai/${pose}_${v}.png`)} style={{position: 'absolute', width: W, height: H}} />
        {blink && <Img src={staticFile(`ai/${pose}_blink.png`)} style={{position: 'absolute', width: W, height: H}} />}
      </div>
    </>
  );
};

// ---------- the shop ----------
const Shop: React.FC<{t: number; f: number}> = ({t, f}) => {
  const c = camAt(t);
  const T = (k: number) => `translate(540px, 960px) scale(${c.z * k + (1 - k)}) translate(${-c.cx}px, ${-c.cy}px)`;
  // the terminal rejects the card: a red flash on its little screen
  const declined = [L(5).start + 0.45, L(8).start + 0.45].reduce((m, s) => Math.max(m, clamp01(1 - Math.abs(t - s) / 0.55)), 0);
  // the crew bolt for the door on the last beat in the shop
  const run = clamp01((t - SHOP_END) / 0.62);
  const order: Who[] = ['dre', 'lou', 'fast'];
  return (
    <>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: T(0.97)}}>
        <Img src={staticFile('ai/bg_shop.png')} style={{position: 'absolute', left: BGX, top: BGY, width: BGW, height: BGH}} />
      </div>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: T(1)}}>
        <Char who="boss" t={t} f={f} />
        <Img src={staticFile('ai/shop_counter.png')} style={{position: 'absolute', left: BGX, top: BGY, width: BGW, height: BGH}} />
        {declined > 0.02 && (
          <div style={{position: 'absolute', left: bx(718), top: by(690), width: 1.5 * 72, height: 1.5 * 50, borderRadius: 5,
            background: '#ff2b17', opacity: 0.66 * declined, boxShadow: `0 0 ${70 * declined}px ${30 * declined}px rgba(255,60,30,0.5)`}} />
        )}
        {t < SHOP_END && (
          <div style={{position: 'absolute', opacity: 1}}>
            {order.filter((w) => !(c.hide ?? []).includes(w)).map((w) => <Char key={w} who={w} t={t} f={f} />)}
          </div>
        )}
        {t >= SHOP_END && (
          <Img src={staticFile('ai/crew_run.png')}
            style={{position: 'absolute', left: -170 + run * run * 1850, top: 1118 - Math.abs(Math.sin(run * 26)) * 22, width: 1240, height: 698,
              transform: `rotate(${Math.sin(run * 26) * 1.5}deg)`, filter: `blur(${run * 3}px)`, opacity: 1 - clamp01((run - 0.8) / 0.2)}} />
        )}
      </div>
    </>
  );
};

// ---------- the street ----------
const COP_T = L(18).start, LAST_T = L(19).start;
const Street: React.FC<{t: number; f: number}> = ({t, f}) => {
  if (t < LAST_T) {
    // the police car pulls up, blue lights going
    const d = t - COP_T, z = 1.08 + clamp01(d / 2.2) * 0.16;
    const slide = interpolate(clamp01(d / 0.5), [0, 1], [170, 0]);
    const flash = Math.sin(t * Math.PI * 2 * 2.6) > 0 ? 1 : 0.25;
    return (
      <AbsoluteFill style={{background: '#120f22', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z}) translateX(${slide}px)`, transformOrigin: '50% 60%'}}>
          <Img src={staticFile('ai/police_car.png')} style={{position: 'absolute', left: -100, top: 0, width: 1280, height: 1920}} />
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'radial-gradient(ellipse at 52% 44%, rgba(70,150,255,0.55) 0%, rgba(40,90,255,0) 55%)', opacity: flash, mixBlendMode: 'screen'}} />
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(40,110,255,0.14)', opacity: flash}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)'}} />
      </AbsoluteFill>
    );
  }
  // last beat: the three of them legging it down the block
  const d = t - LAST_T;
  const bob = Math.abs(Math.sin(d * 15.5));
  const pan = -d * 150;
  const flash = Math.sin(t * Math.PI * 2 * 2.6) > 0 ? 1 : 0.3;
  return (
    <AbsoluteFill style={{background: '#120f22', overflow: 'hidden'}}>
      <Img src={staticFile('ai/bg_street.png')} style={{position: 'absolute', left: -100 + pan * 0.4, top: 0, width: 1280, height: 1920}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(40,110,255,0.2)', opacity: flash}} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <div key={k} style={{position: 'absolute', left: 1300 - ((k * 230 + d * 1900) % 1700), top: 1000 + k * 78, width: 230, height: 7, borderRadius: 4,
          background: 'rgba(255,255,255,0.3)', filter: 'blur(2px)'}} />
      ))}
      <Img src={staticFile('ai/crew_run.png')}
        style={{position: 'absolute', left: -62 + pan * 0.1, top: 1012 - bob * 26, width: 1200, height: 675,
          transformOrigin: '50% 100%', transform: `rotate(${Math.sin(d * 15.5) * 1.6}deg) scaleY(${1 - bob * 0.03})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

export const AiEpisode2: React.FC<{logo?: boolean}> = ({logo = false}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const outside = t >= COP_T;
  const lg = spring({frame: f, fps: FPS, config: {damping: 9, stiffness: 260}});
  return (
    <AbsoluteFill style={{background: '#1b1530', overflow: 'hidden'}}>
      {outside ? <Street t={t} f={f} /> : <Shop t={t} f={f} />}
      {!outside && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />}
      {logo && f < 32 && (
        <div style={{position: 'absolute', top: 110, width: 1080, textAlign: 'center', opacity: 1 - clamp01((f - 24) / 8), transform: `rotate(-4deg) scale(${0.4 + 0.6 * lg})`}}>
          <span style={{background: '#141210', padding: '6px 40px', borderRadius: 14, fontSize: 96, color: '#ffd24a'}}>THE BLOCK</span>
        </div>
      )}
      <Audio src={staticFile('ai/mix2.mp3')} />
    </AbsoluteFill>
  );
};
