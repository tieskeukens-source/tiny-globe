// THE BLOCK #1 — AI-art version. ChatGPT-drawn crew + street, animated as cut-out: pose swaps with squash,
// Rhubarb mouth frames per pose, blinks, breathing, camera shots per line, reaction close-ups, shop lights going out,
// 3-word captions, logo slam. No shake.
import React from 'react';
import {AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import TL from '../block1/timeline.json';
import VIS from '../block1/visemes.json';
import {BANG, MARK} from '../block1/fonts';

export const FPS = 30;
export const AIEP_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
type Who = 'fast' | 'dre' | 'lou';
const LINES = TL.lines as Line[];
const vis = VIS as unknown as Record<string, [number, string][]>;
const L = (i: number) => LINES[Math.min(i, LINES.length - 1)];
const END = (i: number) => L(i).start + L(i).dur;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lineAt = (t: number) => { let k = 0; LINES.forEach((l, i) => { if (t >= l.start - 0.1) k = i; }); return k; };
const wordT = (i: number, needle: string) => Number((L(i).words.find((w) => String(w[2]).toLowerCase().includes(needle)) ?? L(i).words[0])[0]);

// pose placement on the 1080x1920 frame: feet x/y, scale. Mouth centre inside the 1024x1536 pose image.
type PL = {x: number; y: number; s: number; m: [number, number]};
const P: Record<string, PL> = {
  fast_hype: {x: 860, y: 1785, s: 0.68, m: [487, 338]}, fast_talk: {x: 860, y: 1785, s: 0.7, m: [517, 309]}, fast_point: {x: 860, y: 1785, s: 0.7, m: [461, 370]},
  dre_sit: {x: 200, y: 1392, s: 0.5, m: [544, 377]}, dre_cross: {x: 175, y: 1405, s: 0.52, m: [544, 294]}, dre_ask: {x: 430, y: 1830, s: 0.74, m: [524, 312]},
  lou_lean: {x: 766, y: 1385, s: 0.56, m: [426, 397]}, lou_phone: {x: 770, y: 1392, s: 0.56, m: [458, 450]}, lou_smell: {x: 770, y: 1392, s: 0.56, m: [510, 458]},
};
const head = (pose: string): [number, number] => { const p = P[pose]; return [p.x + (p.m[0] - 512) * p.s, p.y + (p.m[1] - 100 - 1530) * p.s]; };

// which pose each character holds over time
const poseOf = (who: Who, t: number): string => {
  if (who === 'fast') {
    if (t < wordT(0, "i've") - 0.08) return 'fast_hype';
    const i = lineAt(t);
    if (i === 4 || i === 10) return 'fast_hype';
    if (i === 8) return 'fast_point';
    return 'fast_talk';
  }
  if (who === 'dre') {
    if (t < L(9).start - 0.12) return 'dre_sit';
    if (t < L(14).start - 0.1) return 'dre_cross';
    return 'dre_ask';
  }
  const i = lineAt(t);
  if (i >= 7 && i <= 10) return 'lou_phone';
  if (i >= 11 && i <= 12) return 'lou_smell';
  return 'lou_lean';
};
// when did the current pose start (for the squash/overshoot)
const poseStart = (who: Who, t: number) => { const p = poseOf(who, t); let s = t; for (let k = 1; k < 200; k++) { if (poseOf(who, t - k / FPS) !== p) break; s = t - k / FPS; } return s; };

const speaking = (t: number) => LINES.find((l) => t >= l.start && t < l.start + l.dur);
const REACT: [number, Who, string][] = [[2, 'dre', 'A'], [6, 'lou', 'B'], [9, 'fast', 'E'], [11, 'fast', 'C'], [13, 'fast', 'E']];
const reaction = (t: number) => REACT.find(([i]) => t > END(i) + 0.08 && t < L(i + 1).start - 0.08);
const mouthOf = (who: Who, t: number) => {
  const l = speaking(t);
  if (l && l.who === who) { let v = 'X'; for (const [ts, s] of vis[String(l.i)] ?? []) if (t - l.start >= ts) v = s; return v; }
  const r = reaction(t);
  if (r && r[1] === who) return r[2];
  return 'X';
};

// camera: centre x/y, zoom
type Cam = {cx: number; cy: number; z: number; hide?: Who};
const close = (pose: string, z: number, dy = 120): Cam => { const [x, y] = head(pose); return {cx: x, cy: y + dy, z}; };
const camAt = (t: number): Cam => {
  const r = reaction(t);
  if (r) return {...close(poseOf(r[1], t), 2.3, 90), z: 2.3 + (t - END(r[0])) * 0.12, hide: r[1] === 'lou' ? 'fast' : undefined};
  const i = lineAt(t), dt = Math.max(0, t - L(i).start), push = 1 + dt * 0.025;
  let c: Cam;
  switch (i) {
    case 0: c = t < wordT(0, "i've") - 0.08 ? {...close('fast_hype', 1.8, 230), z: 1.8 + t * 0.05} : {cx: 540, cy: 960, z: 1.0}; break;
    case 1: c = close('dre_sit', 1.9, 170); break;
    case 2: c = close('fast_talk', 1.55, 260); break;
    case 3: c = close('lou_lean', 1.85, 170); c.hide = 'fast'; break;
    case 4: c = close('fast_hype', 1.4, 330); break;
    case 5: c = close('dre_sit', 2.4, 110); break;
    case 6: c = close('fast_talk', 2.2, 120); break;
    case 7: c = close('lou_phone', 1.7, 200); c.hide = 'fast'; break;
    case 8: c = {cx: 760, cy: 1150, z: 1.22}; break;
    case 9: c = close('dre_cross', 1.75, 200); break;
    case 10: c = close('fast_hype', 1.8, 220); break;
    case 11: c = close('lou_smell', 1.75, 190); c.hide = 'fast'; break;
    case 12: c = close('fast_talk', 1.55, 260); break;
    case 13: c = {cx: 540, cy: 960, z: 1.0}; break;
    default: c = close('dre_ask', 1.45, 330);
  }
  const z = Math.max(1, c.z * (i === 0 || i === 13 ? 1 : push));
  // keep the frame inside the background
  const hw = 540 / z, hh = 960 / z;
  return {z, hide: c.hide, cx: Math.min(1180 - hw, Math.max(-100 + hw, c.cx)), cy: Math.min(1920 - hh, Math.max(hh, c.cy))};
};

const Char: React.FC<{who: Who; t: number; f: number}> = ({who, t, f}) => {
  const pose = poseOf(who, t), p = P[pose];
  const v = mouthOf(who, t);
  const blink = v === 'X' && ((f + who.length * 29) % 83) < 3;
  const sw = spring({frame: Math.round((t - poseStart(who, t)) * FPS), fps: FPS, config: {damping: 9, stiffness: 300}});
  const squash = 1 - (1 - sw) * 0.07;
  const talking = v !== 'X';
  const breathe = 1 + Math.sin(t * 2.1 + who.length) * 0.006;
  const bob = (talking ? Math.sin(f / 2.3) * 3 : 0) + (pose === 'fast_hype' ? -Math.abs(Math.sin(t * Math.PI * 142 / 60)) * 10 : 0);
  // Fast deflates on "two pounds and a bus pass"
  const deflate = who === 'fast' && lineAt(t) === 6 ? clamp01((t - L(6).start) / 0.6) : 0;
  const W = 1024 * p.s, H = 1536 * p.s;
  return (
    <>
      <div style={{position: 'absolute', left: p.x - 170 * p.s / 0.7, top: p.y - 20, width: 340 * p.s / 0.7, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(6px)'}} />
      <div style={{position: 'absolute', left: p.x - W / 2, top: p.y - 1530 * p.s + bob + deflate * 30, width: W, height: H,
        transformOrigin: `${W / 2}px ${1530 * p.s}px`,
        transform: `rotate(${Math.sin(t * 1.2 + who.length) * 0.8 - deflate * 3}deg) scale(${(2 - squash) * (1 - deflate * 0.04)}, ${squash * breathe * (1 - deflate * 0.06)})`,
        filter: `brightness(${0.92 - deflate * 0.15}) contrast(1.04) saturate(1.05)`}}>
        <Img src={staticFile(`ai/${pose}_${v}.png`)} style={{position: 'absolute', width: W, height: H}} />
        {blink && <Img src={staticFile(`ai/${pose}_blink.png`)} style={{position: 'absolute', width: W, height: H}} />}
      </div>
    </>
  );
};

const COL: Record<Who, string> = {fast: '#ff5a46', lou: '#9fd4ff', dre: '#ffd24a'};
const SPELL: Record<string, string> = {FINKS: 'THINKS', FIRTEEN: 'THIRTEEN'};
const Captions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.start - 0.05 && t < x.start + x.dur + 0.25);
  if (!l) return null;
  const n = l.words.length, groups: number[][] = [];
  for (let k = 0; k < n; k += 3) groups.push(Array.from({length: Math.min(3, n - k)}, (_, j) => k + j));
  if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(...groups.pop()!);
  let cur = 0; l.words.forEach((w, i) => { if (t >= Number(w[0])) cur = i; });
  const g = groups.find((x) => x.includes(cur)) ?? groups[0];
  return (
    <div style={{position: 'absolute', top: 1330, width: 1080, textAlign: 'center', fontFamily: BANG, fontSize: 100, letterSpacing: 2}}>
      {g.map((k) => {
        const w = String(l.words[k][2]).toUpperCase(), core = w.replace(/[^A-Z']/g, ''), txt = SPELL[core] ? w.replace(core, SPELL[core]) : w;
        const on = k === cur, pop = on ? 1.1 + 0.12 * clamp01(1 - (t - Number(l.words[k][0])) * 6) : 1;
        return <span key={k} style={{display: 'inline-block', margin: '0 16px', color: on ? COL[l.who as Who] : '#fdfbf5', transform: `scale(${pop})`, WebkitTextStroke: '14px #141210', paintOrder: 'stroke fill'}}>{txt}</span>;
      })}
    </div>
  );
};

export const AiEpisode: React.FC<{caps?: boolean; logo?: boolean}> = ({caps = true, logo = true}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = camAt(t);
  const T = (k: number) => `translate(540px, 960px) scale(${c.z * k + (1 - k)}) translate(${-c.cx}px, ${-c.cy}px)`;
  const closed = clamp01((t - L(13).start - 0.45) / 0.12);
  const order: Who[] = ['dre', 'lou', 'fast'];
  const logoIn = f < 32, logoEnd = f >= AIEP_FRAMES - 40;
  const lg = spring({frame: logoIn ? f : f - (AIEP_FRAMES - 40), fps: FPS, config: {damping: 9, stiffness: 260}});
  return (
    <AbsoluteFill style={{background: '#1b1530', overflow: 'hidden'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: T(0.97)}}>
        <Img src={staticFile('ai/bg_street.png')} style={{position: 'absolute', left: -100, top: 0, width: 1280, height: 1920}} />
        {/* the chicken shop shuts: window + door go dark, OPEN sign off */}
        <div style={{position: 'absolute', left: 719, top: 700, width: 290, height: 340, background: '#120f22', opacity: closed * 0.78}} />
        <div style={{position: 'absolute', left: 1028, top: 760, width: 140, height: 480, background: '#120f22', opacity: closed * 0.8}} />
      </div>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: T(1)}}>
        {order.filter((w) => w !== c.hide).map((w) => <Char key={w} who={w} t={t} f={f} />)}
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
      {caps && <Captions t={t} />}
      {logo && (logoIn || logoEnd) && (
        <div style={{position: 'absolute', top: logoIn ? 110 : 1600, width: 1080, textAlign: 'center', opacity: logoIn ? 1 - clamp01((f - 24) / 8) : 1, transform: `rotate(-4deg) scale(${0.4 + 0.6 * lg})`}}>
          <span style={{background: '#141210', padding: '6px 40px', borderRadius: 14, fontFamily: MARK, fontSize: 96, color: '#ffd24a'}}>THE BLOCK</span>
        </div>
      )}
      <Audio src={staticFile('ai/mix.mp3')} />
    </AbsoluteFill>
  );
};
