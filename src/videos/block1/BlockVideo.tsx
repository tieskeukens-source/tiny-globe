// THE BLOCK #1 — comic-panel short: the crew hangs at the wall and talks. One panel layout per line.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Guy, InkDefs, Pose, Who} from './chars';
import {BANG, MARK} from './fonts';
import TL from './timeline.json';
import ENV from './env.json';
import {rr, Brick, Speed, Halftone, Mansion, Boat, Heli, Bill, Phone, Stain} from './props';

export const FPS = 30;
export const SHORT_FRAMES = Math.ceil(TL.total * FPS);
const W = 1080, INK = '#141210';
type Line = (typeof TL.lines)[number];
const LINES = TL.lines as Line[];
const env = ENV as unknown as Record<string, number[]>;

// mouth opening for a speaker at time t
const mouth = (who: Who, t: number, f: number) => {
  const l = LINES.find((x) => x.who === who && t >= x.start && t < x.start + x.dur + 0.05);
  if (!l) return 0;
  const e = env[String(l.i)];
  if (e) { const k = Math.floor((t - l.start) * FPS); return Math.min(1, (e[k] ?? 0) * 1.3); }
  return 0.25 + 0.55 * Math.abs(Math.sin(f * 0.9 + l.i));
};
const blink = (f: number, off: number) => (f + off) % 83 < 3;

// ---------- panel ----------
type R = {x: number; y: number; w: number; h: number};
const Panel: React.FC<{r: R; at: number; id: string; children: React.ReactNode; tilt?: number}> = ({r, at, id, children, tilt = 0}) => {
  const f = useCurrentFrame();
  const s = spring({frame: f - at, fps: FPS, config: {damping: 11, stiffness: 220}});
  if (f < at) return null;
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${tilt * (1 - s) * 3 + tilt * 0.3}) scale(${0.86 + 0.14 * s}) translate(${-cx} ${-cy})`} opacity={Math.min(1, s * 2)}>
      <clipPath id={id}><rect x={r.x} y={r.y} width={r.w} height={r.h} /></clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke={INK} strokeWidth={11} />
    </g>
  );
};

// a character framed inside a panel: vb = which part of the 600x1300 character box to show
const Cast: React.FC<{who: Who; r: R; vb: [number, number]; pose: Pose; t: number; dx?: number; flip?: boolean; shake?: number}> = ({who, r, vb, pose, t, dx = 0, flip, shake = 0}) => {
  const f = useCurrentFrame();
  const vh = vb[0] * r.h / r.w;
  const box = [300 - vb[0] / 2, vb[1], vb[0], vh];
  const open = pose.open ?? mouth(who, t, f);
  const talking = open > 0.05;
  const bob = Math.sin(f / 9 + who.length) * 4 + (talking ? Math.sin(f / 2.3) * 3 : 0);
  const sx = shake ? Math.sin(f * 2.1) * shake : 0, sy = shake ? Math.cos(f * 2.7) * shake : 0;
  return (
    <svg x={r.x + dx + sx} y={r.y + sy} width={r.w} height={r.h} viewBox={box.join(' ')} preserveAspectRatio="none" overflow="hidden">
      <g transform={`translate(0 ${bob}) ${flip ? 'translate(600 0) scale(-1 1)' : ''}`} filter="url(#wob)">
        <Guy who={who} legs={vb[1] + vh > 900} pose={{...pose, open, blink: pose.blink ?? blink(f, who.length * 23), tilt: (pose.tilt ?? 0) + (talking ? Math.sin(f / 6) * 2 : 0)}} />
      </g>
    </svg>
  );
};

// speech bubble, words appear as they are spoken
const Bubble: React.FC<{l: Line; x: number; y: number; w: number; tail: [number, number]; size?: number; loud?: boolean}> = ({l, x, y, w, tail, size = 66, loud}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < l.start - 0.05) return null;
  const s = spring({frame: f - Math.round((l.start - 0.05) * FPS), fps: FPS, config: {damping: 12, stiffness: 260}});
  const per = Math.floor((w - 80) / (size * 0.47));
  const rows: Line['words'][] = [[]];
  let n = 0;
  for (const wd of l.words) {
    const len = String(wd[2]).length + 1;
    if (n + len > per && rows[rows.length - 1].length) { rows.push([]); n = 0; }
    rows[rows.length - 1].push(wd); n += len;
  }
  const lh = size * 1.08, h = rows.length * lh + 64;
  const cx = x + w / 2, cy = y + h / 2;
  const bx = Math.max(x + 60, Math.min(x + w - 60, tail[0]));
  const near = tail[1] > cy ? y + h - 4 : y + 4;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * s}) translate(${-cx} ${-cy})`}>
      {loud ? (
        <path d={burst(cx, cy, w / 2 + 30, h / 2 + 34)} fill="#fff6c9" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      ) : (
        <>
          <path d={`M${bx - 34},${near} L${tail[0]},${tail[1]} L${bx + 30},${near}`} fill="#fdfbf5" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <rect x={x} y={y} width={w} height={h} rx={h / 2.4} fill="#fdfbf5" stroke={INK} strokeWidth={8} />
          <path d={`M${bx - 30},${near + (tail[1] > cy ? -6 : 6)} L${bx + 26},${near + (tail[1] > cy ? -6 : 6)}`} stroke="#fdfbf5" strokeWidth={14} />
        </>
      )}
      {rows.map((row, k) => (
        <text key={k} x={cx} y={y + 32 + lh * (k + 0.78)} textAnchor="middle" fontFamily={BANG} fontSize={size} fill={INK} letterSpacing={1}>
          {row.map((wd, j) => <tspan key={j} opacity={t >= Number(wd[0]) - 0.04 ? 1 : 0.0}>{String(wd[2]) + (j < row.length - 1 ? ' ' : '')}</tspan>)}
        </text>
      ))}
    </g>
  );
};
const burst = (cx: number, cy: number, rx: number, ry: number) => {
  let d = '';
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2, rr = k % 2 ? 0.86 : 1.06;
    d += `${k ? 'L' : 'M'}${cx + Math.cos(a) * rx * rr},${cy + Math.sin(a) * ry * rr} `;
  }
  return d + 'Z';
};

const Sfx: React.FC<{x: number; y: number; text: string; at: number; color?: string; size?: number; rot?: number}> = ({x, y, text, at, color = '#f2772b', size = 130, rot = -8}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = spring({frame: f - at, fps: FPS, config: {damping: 8, stiffness: 300}});
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={BANG} fontSize={size} fill={color} stroke={INK} strokeWidth={9} paintOrder="stroke" transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{text}</text>
  );
};

// ---------- shots ----------
const TALL: [number, number] = [780, -380];   // full-height panel: head low, room for the bubble, chest visible
const TIGHT: [number, number] = [700, -360];  // full panel, closer
const HALF: [number, number] = [820, -120];   // half-height panel
const LOW: [number, number] = [1200, -380];    // half panel under a bubble
const WIDE: [number, number] = [640, -60];
const fr = (t: number) => Math.round(t * FPS);

const Shot: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const l = LINES[i];
  const a = fr(l.start) - 3;
  const w = (k: number) => fr(Number(l.words[Math.min(k, l.words.length - 1)][0]));
  const full: R = {x: 40, y: 190, w: 1000, h: 1380};
  const top: R = {x: 40, y: 190, w: 1000, h: 640};
  const bot: R = {x: 40, y: 854, w: 1000, h: 716};
  switch (i) {
    case 0: // FAST hype hook
      return (<>
        <Panel r={full} at={a} id="p0"><Speed r={full} c1="#f2772b" c2="#ffd24a" cx={540} cy={700} f={f} /><Cast who="fast" r={full} vb={TALL} pose={{arms: 'hype', eyes: 'wide'}} t={t} shake={4} /></Panel>
        <Bubble l={l} x={90} y={230} w={900} tail={[560, 600]} size={78} loud />
      </>);
    case 1: // LOU unimpressed, Fast still hyped up top
      return (<>
        <Panel r={top} at={a - 20} id="p1a"><Speed r={top} c1="#f2772b" c2="#ffd24a" cx={540} cy={500} f={f} /><Cast who="fast" r={top} vb={HALF} pose={{arms: 'hype', eyes: 'wide', open: 0.15}} t={t} /></Panel>
        <Panel r={bot} at={a} id="p1b" tilt={1}><Brick r={bot} /><Cast who="lou" r={bot} vb={LOW} pose={{arms: 'pockets', eyes: 'tired'}} t={t} /></Panel>
        <Bubble l={l} x={90} y={880} w={900} tail={[700, 1180]} />
      </>);
    case 2: { // FAST flex: mansion, boat, helicopter pop in on the words
      const sm = [{x: 40, y: 1186, w: 316, h: 384}, {x: 382, y: 1186, w: 316, h: 384}, {x: 724, y: 1186, w: 316, h: 384}];
      return (<>
        <Panel r={{...top, h: 970}} at={a} id="p2"><Halftone r={{...top, h: 970}} c="#ffd24a" bg="#ffe9a0" /><Cast who="fast" r={{...top, h: 970}} vb={[860, -330]} pose={{arms: 'hype', eyes: 'wide'}} t={t} /></Panel>
        <Bubble l={l} x={80} y={220} w={920} tail={[560, 520]} size={62} />
        {[Mansion, Boat, Heli].map((P, k) => (
          <Panel key={k} r={sm[k]} at={w([6, 8, 10][k])} id={`p2s${k}`} tilt={k - 1}><rect {...rr(sm[k])} fill={['#bfe3f2', '#9fd3ea', '#ffd9a8'][k]} /><P r={sm[k]} f={f} /></Panel>
        ))}
      </>);
    }
    case 3: // DRE: "In real life?" — slow push on his face
      return (<>
        <Panel r={full} at={a} id="p3"><Halftone r={full} c="#22356a" bg="#2e4686" />
          <g transform={`translate(540 900) scale(${1 + (f - a) * 0.004}) translate(-540 -900)`}><Cast who="dre" r={full} vb={[620, -330]} pose={{arms: 'crossed', eyes: 'side'}} t={t} /></g>
        </Panel>
        <Bubble l={l} x={240} y={250} w={600} tail={[560, 560]} size={84} />
      </>);
    case 4: // FAST deflates: two dollars and a cold
      return (<>
        <Panel r={top} at={a} id="p4"><rect {...rr(top)} fill="#9aa0aa" /><Cast who="fast" r={top} vb={HALF} pose={{arms: 'down', eyes: 'closed', tilt: -6}} t={t} /></Panel>
        <Panel r={bot} at={w(2)} id="p4b" tilt={-1}><rect {...rr(bot)} fill="#e8f0d8" /><Bill r={bot} f={f} /></Panel>
        <Bubble l={l} x={90} y={870} w={900} tail={[800, 700]} />
      </>);
    case 5: // LOU on the phone with Fast's mom
      return (<>
        <Panel r={{...full, h: 900}} at={a} id="p5"><Brick r={{...full, h: 900}} /><Cast who="lou" r={{...full, h: 900}} vb={[780, -200]} pose={{arms: 'phone', eyes: 'side'}} t={t} /></Panel>
        <Panel r={{x: 560, y: 1110, w: 480, h: 460}} at={w(8)} id="p5b" tilt={2}><rect x={560} y={1110} width={480} height={460} fill="#ffd24a" /><Phone r={{x: 560, y: 1110, w: 480, h: 460}} f={f} /></Panel>
        <Bubble l={l} x={70} y={1110} w={470} tail={[300, 1000]} size={54} />
      </>);
    case 6: // FAST fires back
      return (<>
        <Panel r={full} at={a} id="p6"><Speed r={full} c1="#d8352c" c2="#f2772b" cx={540} cy={900} f={f} /><Cast who="fast" r={full} vb={TIGHT} pose={{arms: 'point', eyes: 'angry'}} t={t} shake={6} /></Panel>
        <Bubble l={l} x={90} y={230} w={900} tail={[520, 640]} size={76} loud />
      </>);
    case 7: // DRE: four days, same hoodie — cut to the stain
      return (<>
        <Panel r={top} at={a} id="p7"><Brick r={top} /><Cast who="dre" r={top} vb={HALF} pose={{arms: 'crossed', eyes: 'side'}} t={t} /></Panel>
        <Panel r={bot} at={a + 8} id="p7b" tilt={-1}><Stain r={bot} f={f} /></Panel>
        <Bubble l={l} x={140} y={884} w={800} tail={[800, 700]} />
      </>);
    case 8: // FAST: it's a good hoodie!
      return (<>
        <Panel r={full} at={a} id="p8"><Speed r={full} c1="#d8352c" c2="#ffd24a" cx={540} cy={1000} f={f} /><Cast who="fast" r={full} vb={TALL} pose={{arms: 'hype', eyes: 'angry'}} t={t} shake={5} /></Panel>
        <Bubble l={l} x={90} y={240} w={900} tail={[540, 640]} size={80} loud />
      </>);
    default: { // 9: wide, the whole crew at the wall + the question
      const r: R = {x: 40, y: 190, w: 1000, h: 1380};
      return (<>
        <Panel r={r} at={a} id="p9"><Brick r={r} tag />
          <Cast who="lou" r={{x: -60, y: 470, w: 560, h: 1140}} vb={WIDE} pose={{arms: 'pockets', eyes: 'side'}} t={t} />
          <Cast who="fast" r={{x: 580, y: 470, w: 560, h: 1140}} vb={WIDE} pose={{arms: 'shrug', eyes: 'wide', open: 0.1}} t={t} />
          <Cast who="dre" r={{x: 230, y: 420, w: 620, h: 1260}} vb={WIDE} pose={{arms: 'crossed', eyes: 'calm'}} t={t} />
        </Panel>
        <Bubble l={l} x={90} y={230} w={900} tail={[540, 620]} size={64} />
      </>);
    }
  }
};

const Logo: React.FC = () => (
  <g transform="rotate(-3 540 110)">
    <text x={540} y={140} textAnchor="middle" fontFamily={MARK} fontSize={92} fill="#f3ecdc" stroke={INK} strokeWidth={14} paintOrder="stroke">THE BLOCK</text>
    <text x={540} y={140} textAnchor="middle" fontFamily={MARK} fontSize={92} fill="#e9b23c">THE BLOCK</text>
  </g>
);

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const l = LINES[LINES.length - 1];
  const at = fr(l.start + l.dur) + 2;
  if (f < at) return null;
  const s = spring({frame: f - at, fps: FPS, config: {damping: 10}});
  const bob = Math.sin(f / 5) * 8;
  return (
    <g transform={`translate(540 1450) scale(${s}) rotate(-3) translate(-540 -1450)`}>
      <rect x={110} y={1360} width={860} height={170} fill="#d8352c" stroke={INK} strokeWidth={10} />
      <text x={540} y={1472} textAnchor="middle" fontFamily={BANG} fontSize={96} fill="#fdfbf5" stroke={INK} strokeWidth={6} paintOrder="stroke">COMMENT YOUR HOURS</text>
      <path d={`M540,${1560 + bob} l-40,-40 h24 v-50 h32 v50 h24 z`} fill="#ffd24a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

export const BlockVideo: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let cur = 0;
  LINES.forEach((l, k) => { if (t >= l.start - 0.12) cur = k; });
  return (
    <AbsoluteFill style={{background: '#f3ecdc'}}>
      <svg width={W} height={1920} viewBox="0 0 1080 1920">
        <InkDefs seed={Math.floor(f / 4) % 3} />
        <Logo />
        <Shot key={cur} i={cur} />
        <EndCard />
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
      <Audio src={staticFile('block1/mix.mp3')} />
    </AbsoluteFill>
  );
};
