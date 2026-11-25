// THE BLOCK #1 v5 (A-quality pass): cold-open close-up hook, Rhubarb visemes, moods per line, 3/4 head turns,
// hands that count/point/hold a pad, walk cycles + swinging chains, reaction shots after punchlines,
// 3-word captions, THE BLOCK logo sting. Set: Dre on the flats' steps, Lou on the lamp post, Fast with his controller.
import React from 'react';
import {AbsoluteFill, Audio, spring, staticFile, useCurrentFrame} from 'remotion';
import {Guy, BackGuy, InkDefs, Pose, Who, Mood} from './chars';
import {Street, Pigeon} from './street';
import {BANG, MARK} from './fonts';
import TL from './timeline.json';
import VIS from './visemes.json';

export const FPS = 30;
export const SHORT_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
const LINES = TL.lines as Line[];
const vis = VIS as unknown as Record<string, [number, string][]>;
const L = (i: number) => LINES[Math.min(i, LINES.length - 1)];
const END = (i: number) => L(i).start + L(i).dur;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const x = clamp01(v); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const speaking = (t: number) => LINES.find((l) => t >= l.start && t < l.start + l.dur + 0.05);
const lineAt = (t: number) => { let k = 0; LINES.forEach((l, i) => { if (t >= l.start - 0.1) k = i; }); return k; };
const viseme = (who: Who, t: number): string | undefined => {
  const l = speaking(t);
  if (!l || l.who !== who) return undefined;
  const cues = vis[String(l.i)] ?? [];
  let v = 'X';
  for (const [ts, s] of cues) if (t - l.start >= ts) v = s;
  return v;
};
const talking = (who: Who, t: number) => { const v = viseme(who, t); return !!v && v !== 'X' && v !== 'A'; };
const wordIdx = (l: Line, t: number) => { let k = 0; l.words.forEach((w, i) => { if (t >= Number(w[0])) k = i; }); return k; };
const wordTime = (i: number, needle: string) => { const w = L(i).words.find((x) => String(x[2]).toLowerCase().includes(needle)); return w ? Number(w[0]) : L(i).start; };

// reaction shots in the pause after a punchline: [after line, who reacts, mood, eyes]
const REACT: [number, Who, Mood, Pose['eyes']][] = [[2, 'dre', 'closed', 'side'], [6, 'lou', 'smirk', 'side'], [9, 'fast', 'o', 'wide'], [11, 'fast', 'frown', 'angry'], [13, 'fast', 'o', 'wide']];
const reaction = (t: number) => REACT.find(([i]) => t > END(i) + 0.08 && t < L(i + 1).start - 0.08);

// ---------- blocking ----------
type Place = {x: number; y: number; s: number; rot: number; sit?: boolean; step?: number; anchorY: number};
const place = (who: Who, t: number): Place => {
  if (who === 'dre') {
    const up = L(9).start - 0.15;
    if (t < up) return {x: 225, y: 1330, s: 0.66, rot: 0, sit: true, anchorY: 980};
    const dip = Math.sin(clamp01((t - up) / 0.35) * Math.PI) * -26;
    const w = ease((t - L(10).start) / 1.6);
    return {x: lerp(235, 590, w), y: lerp(1500, 1800, w) + dip, s: lerp(0.66, 0.84, w), rot: 0, anchorY: 1280, step: w > 0 && w < 1 ? t * 11 : undefined};
  }
  if (who === 'lou') {
    const off = ease((t - L(7).start + 0.3) / 0.4);
    return {x: lerp(905, 900, off), y: 1600, s: 0.74, rot: lerp(5, 0, off), anchorY: 1280};
  }
  const pace = t > L(4).start && t < L(5).start ? Math.sin((t - L(4).start) * 1.6) * 70 : 0;
  const aside = ease((t - END(10)) / 0.8);
  const moving = pace !== 0 || (aside > 0 && aside < 1);
  return {x: 640 + pace - aside * 360, y: 1830 - aside * 70, s: 0.88 - aside * 0.04, rot: 0, anchorY: 1280, step: moving ? t * 12 : undefined};
};

// ---------- acting ----------
type P = Partial<Pose> & {shake?: number};
const BASE_MOOD: Record<Who, Mood> = {dre: 'closed', lou: 'closed', fast: 'grin'};
const LISTEN: Record<number, Partial<Record<Who, Mood>>> = {
  1: {fast: 'grin'}, 2: {lou: 'smirk'}, 3: {fast: 'grin', dre: 'closed'}, 4: {lou: 'smirk'}, 5: {fast: 'o'}, 6: {lou: 'smirk'},
  7: {fast: 'o', dre: 'closed'}, 8: {lou: 'smirk'}, 9: {fast: 'frown'}, 10: {lou: 'smirk'}, 11: {fast: 'frown', dre: 'smirk'},
  12: {lou: 'o'}, 13: {fast: 'o', lou: 'o'}, 14: {fast: 'grin', lou: 'smirk'},
};
const ACT = (i: number, who: Who, t: number): P => {
  const l = LINES[i];
  const wi = wordIdx(l, t), talk = talking(who, t) ? 1 : 0;
  const wob = (a: number) => a + Math.sin(t * 7 + who.length) * 6 + talk * 12;
  const pl = place(who, t), sp = place(l.who as Who, t);
  const toward = Math.sign(sp.x - pl.x) * 0.85;
  const base: Record<Who, P> = {
    dre: pl.sit ? {arms: 'rig', aL: [18, -62], aR: [18, -62], eyes: 'calm', look: toward} : {arms: 'crossed', eyes: 'calm', look: toward},
    lou: {arms: 'pockets', eyes: 'tired', look: toward},
    fast: {arms: 'rig', aL: [14, -40], hL: 'pad', aR: [10, -12], eyes: 'wide', look: toward},
  };
  const b: P = {...base[who], sit: pl.sit, step: pl.step, mood: LISTEN[i]?.[who] ?? BASE_MOOD[who]};
  if (who === l.who) { b.look = 0; b.mood = 'closed'; }
  const id = i * 10 + (['dre', 'lou', 'fast'] as Who[]).indexOf(who);
  let r: P = b;
  switch (id) {
    case 2: r = {...b, aL: [wob(30) + 8, 150], aR: [wob(150), 10], hR: 'fist', look: -0.2, shake: 2.5}; break;      // hook: pad up next to his face
    case 0: r = {...b, eyes: 'side'}; break;
    case 10: r = {...b, eyes: 'side', look: 0.85, aR: [wob(24), -80], hR: 'open'}; break;
    case 12: r = {...b, aR: [30, -30], look: -0.85}; break;
    case 22: r = {...b, aR: [wob(30), -128], hR: 'fist', eyes: 'calm', look: -0.6}; break;                         // fake cough
    case 20: r = {...b, eyes: 'side'}; break;
    case 31: r = {...b, arms: 'rig', aL: [wob(62), -20], hL: 'open', aR: [6, -14], eyes: 'wide', look: -0.85}; break;
    case 32: r = {...b, aR: [70, 10], hR: 'open'}; break;
    case 42: { const k = Math.min(3, wi + 1); r = {...b, aR: [wob(110), 8], hR: (['count1', 'count2', 'count3', 'open'] as const)[Math.min(k, 4) - 1] ?? 'open', look: wi % 3 === 0 ? -0.7 : 0}; break; }
    case 41: r = {...b, eyes: 'wide'}; break;
    case 50: r = {...b, eyes: 'side', look: 0.85, aR: [24, -80], hR: 'open'}; break;
    case 52: r = {...b, aR: [110, 8], hR: 'open', look: -0.7}; break;
    case 62: r = {...b, aL: [6, -10], aR: [3, 0], eyes: 'closed', tilt: -8, look: -0.3}; break;
    case 61: r = {...b, eyes: 'side'}; break;
    case 71: r = {...b, arms: 'rig', aL: [wob(30), -150], aR: [12, -60], hR: 'open', phone: true, eyes: 'wide', look: -0.4}; break;
    case 72: r = {...b, eyes: 'wide', look: 0.85}; break;
    case 82: r = {...b, aR: [wob(85), 0], hR: 'point', eyes: 'angry', look: 1, shake: 5}; break;
    case 81: r = {...b, arms: 'rig', aL: [6, -14], aR: [6, -14], eyes: 'angry', look: -0.85}; break;
    case 90: r = {...b, eyes: 'calm', look: 0.5}; break;
    case 92: r = {...b, look: -0.8, eyes: 'wide'}; break;
    case 102: r = {...b, aR: [wob(40), -112], hR: 'open', eyes: 'angry', look: -0.5, shake: 3}; break;
    case 111: r = {...b, arms: 'rig', aL: [wob(45), -150], hL: 'open', aR: [6, -14], eyes: 'angry', look: -0.85}; break;
    case 112: r = {...b, eyes: 'closed', tilt: 6}; break;
    case 110: r = {...b, eyes: 'side'}; break;
    case 122: r = {...b, aR: [wob(125), 10], hR: 'point', eyes: 'wide', look: 0.7}; break;
    case 121: r = {...b, eyes: 'side'}; break;
    case 130: r = {...b, eyes: 'side', look: 0.7}; break;
    case 132: r = {...b, aR: [3, 0], eyes: 'closed', tilt: -6}; break;
    case 131: r = {...b, eyes: 'tired'}; break;
    case 140: r = {...b, arms: 'rig', aL: [8, -14], aR: [wob(40), -100], hR: 'open', look: 0}; break;
    case 141: r = {...b, look: -0.5, eyes: 'side'}; break;
    case 142: r = {...b, aR: [40, 60], hR: 'open', look: 0.6, eyes: 'wide'}; break;
  }
  const rc = reaction(t);
  if (rc && rc[1] === who) r = {...r, mood: rc[2], eyes: rc[3], look: 0, shake: 0};
  return r;
};

// ---------- camera ----------
type Cam = {cx: number; cy: number; z: number; rot: number; ots?: Who; hide?: Who};
const head = (who: Who, t: number) => { const p = place(who, t); return [p.x, p.y - (p.anchorY - 300) * p.s] as const; };
const HOOK_END = () => wordTime(0, "i've") - 0.05;
const CAM = (i: number, t: number): Cam => {
  const push = 1 + Math.max(0, t - L(i).start) * 0.03;
  const close = (w: Who, z: number, dy = 110, rot = 0): Cam => { const [x, y] = head(w, t); return {cx: x, cy: y + dy, z, rot}; };
  const rc = reaction(t);
  if (rc) return {...close(rc[1], rc[1] === 'dre' && place('dre', t).sit ? 2.2 : 2.1, 90), z: 2.1 + (t - END(rc[0])) * 0.15};
  let c: Cam;
  switch (i) {
    case 0: c = t < HOOK_END() ? {...close('fast', 1.95, 170, -5), z: 1.95 + t * 0.1} : {cx: 600, cy: 1250, z: 0.95, rot: 0}; break;
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
  return {...c, z: c.z * (i === 0 ? 1 : push)};
};

// ---------- captions: fixed 3-word blocks ----------
const SPELL: Record<string, string> = {FINKS: 'THINKS', FIRTEEN: 'THIRTEEN', NUFFIN: 'NOTHING'};
const COL: Record<Who, string> = {fast: '#ff5a46', lou: '#9fd4ff', dre: '#ffd24a'};
const Captions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.start - 0.05 && t < x.start + x.dur + 0.25);
  if (!l) return null;
  const n = l.words.length, groups: number[][] = [];
  for (let k = 0; k < n; k += 3) groups.push(Array.from({length: Math.min(3, n - k)}, (_, j) => k + j));
  if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(...groups.pop()!);
  const cur = wordIdx(l, t);
  const g = groups.find((x) => x.includes(cur)) ?? groups[0];
  const words = g.map((k) => { const w = String(l.words[k][2]).toUpperCase(); const core = w.replace(/[^A-Z']/g, ''); return SPELL[core] ? w.replace(core, SPELL[core]) : w; });
  const size = words.join(' ').length > 18 ? 88 : 104, cw = size * 0.5;
  let x = 540 - (words.join(' ').length * cw) / 2;
  return (
    <g>
      {words.map((w, j) => {
        const k = g[j], on = k === cur, x0 = x;
        x += (w.length + 1) * cw;
        const pop = on ? 1.08 + 0.12 * clamp01(1 - (t - Number(l.words[k][0])) * 6) : 1;
        const cx = x0 + (w.length * cw) / 2;
        return (
          <text key={k} x={cx} y={1395} textAnchor="middle" fontFamily={BANG} fontSize={size} fill={on ? COL[l.who as Who] : '#fdfbf5'}
            stroke="#141210" strokeWidth={14} paintOrder="stroke" letterSpacing={2} transform={`translate(${cx} 1370) scale(${pop}) translate(${-cx} -1370)`}>{w}</text>
        );
      })}
    </g>
  );
};

// series identity: logo slam on the cold open + sign-off
const Logo: React.FC<{f: number}> = ({f}) => {
  const endAt = Math.round((TL.total - 1.3) * FPS);
  const inOpen = f < 32, inEnd = f >= endAt;
  if (!inOpen && !inEnd) return null;
  const s = spring({frame: inOpen ? f : f - endAt, fps: FPS, config: {damping: 9, stiffness: 260}});
  const out = inOpen ? clamp01((f - 24) / 8) : 0;
  const y = inOpen ? 175 : 1580;
  return (
    <g opacity={1 - out} transform={`translate(540 ${y}) rotate(-4) scale(${0.4 + 0.6 * s}) translate(-540 ${-y})`}>
      <rect x={250} y={y - 92} width={580} height={130} rx={14} fill="#141210" />
      <text x={540} y={y + 10} textAnchor="middle" fontFamily={MARK} fontSize={104} fill="#ffd24a">THE BLOCK</text>
    </g>
  );
};

const blink = (f: number, off: number) => (f + off) % 83 < 3;

const Char: React.FC<{who: Who; i: number; t: number; f: number}> = ({who, i, t, f}) => {
  const a = ACT(i, who, t);
  const pl = place(who, t);
  const v = viseme(who, t);
  const tk = talking(who, t);
  const bob = Math.sin(f / 10 + pl.x) * 5 + (tk ? Math.sin(f / 2.5) * 4 : 0) + (pl.step !== undefined ? -Math.abs(Math.sin(pl.step)) * 14 : 0);
  const sh = a.shake ? [Math.sin(f * 2.1) * a.shake, Math.cos(f * 2.7) * a.shake] : [0, 0];
  const sway = Math.sin(f / 23 + pl.x) * 1.2 + (tk ? Math.sin(f / 7) * 1.5 : 0);
  const swing = -(sway * 3) - (pl.step !== undefined ? Math.sin(pl.step) * 7 : 0) - (a.shake ? Math.sin(f * 1.3) * 5 : 0);
  const pose: Pose = {...a, viseme: v && v !== 'X' ? v : undefined, blink: blink(f, Math.round(pl.x)), tilt: (a.tilt ?? 0) + (tk ? Math.sin(f / 5) * 2.5 : 0), bags: who === 'fast', swing};
  return (
    <g transform={`translate(${pl.x + sh[0]} ${pl.y + sh[1]}) rotate(${pl.rot + sway}) translate(0 ${bob}) scale(${pl.s}) translate(-300 ${-pl.anchorY})`}>
      {!pl.sit && <ellipse cx={300} cy={1282} rx={250} ry={34} fill="#000" opacity={0.25} />}
      <g filter="url(#wob)"><Guy who={who} pose={pose} /></g>
    </g>
  );
};

export const StreetVideo: React.FC<{caps?: boolean}> = ({caps = true}) => {
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
          {order.map((w) => <Char key={w} who={w} i={i} t={t} f={f} />)}
          <Pigeon f={f} x={700} y={1910} fly={fly > 0 ? fly : -1} />
        </g>
        {c.ots && (
          <g transform={`translate(${c.ots === 'fast' ? -250 : -230} ${1010 + Math.sin(t * 1.3) * 6}) scale(1.55)`} filter="url(#fg)">
            <g filter="url(#wob)"><BackGuy who={c.ots} /></g>
          </g>
        )}
        <rect width={1080} height={1920} filter="url(#grain)" />
        <rect width={1080} height={1920} fill="url(#vig)" />
        {caps && <Captions t={t} />}
        <Logo f={f} />
      </svg>
      <Audio src={staticFile('block1/mix.mp3')} />
    </AbsoluteFill>
  );
};
