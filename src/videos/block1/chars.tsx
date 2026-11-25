// The Block crew v2: hand-inked 2D hip-hop characters (own designs, no real brand logos).
// Dre  — cornrows + fade, oversized navy #23 jersey over white thermal, rope chain + cross, baggy ripped grey denim, black kicks
// Lou  — big afro, white tank, plaid boxers showing, leopard belt, wallet chain, baggy light-wash denim, tan work boots, iced "LOU" plate
// Fast — twists with orange tips + fade, red football jersey #7, beige cargo shorts, tall white socks, red runners, gold cuban, watch
// Each character lives in a 600 x 1300 box (feet ~1275). Mouth/eyes/arms are animatable. Same block teeth for all three.
import React from 'react';

export type Who = 'dre' | 'lou' | 'fast';
export type Arms = 'crossed' | 'pockets' | 'hype' | 'shrug' | 'point' | 'phone' | 'down' | 'rig';
export type Eyes = 'calm' | 'tired' | 'wide' | 'angry' | 'side' | 'closed';
// rig arms: [shoulder, elbow] in degrees; shoulder 0 = hanging down, + = outward/up; elbow + = forearm bends outward/up, - = across the body
export type Pose = {open?: number; eyes?: Eyes; arms?: Arms; tilt?: number; blink?: boolean; prop?: string; look?: number; aL?: [number, number]; aR?: [number, number]; phone?: boolean; sit?: boolean; step?: number;
  viseme?: string; mood?: Mood; bags?: boolean; hL?: HandKind; hR?: HandKind; swing?: number};
export type Mood = 'grin' | 'closed' | 'smirk' | 'o' | 'frown';
export type HandKind = 'fist' | 'open' | 'point' | 'count1' | 'count2' | 'count3' | 'pad';

const INK = '#141210';
const S = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

type Pal = {skin: string; skinD: string; lip: string; top: string; topD: string; arm: string; armD: string; hair: string; hairD: string};
export const PAL: Record<Who, Pal> = {
  dre: {skin: '#7a4527', skinD: '#5b3119', lip: '#5e3420', top: '#33457a', topD: '#26345e', arm: '#f1efe8', armD: '#cfccc2', hair: '#1a1310', hairD: '#3a2c26'},
  lou: {skin: '#b47a50', skinD: '#8f5a36', lip: '#8a5433', top: '#f4f2ec', topD: '#d6d2c6', arm: '#b47a50', armD: '#8f5a36', hair: '#3b2a20', hairD: '#2a1d16'},
  fast: {skin: '#4a2a18', skinD: '#331b0e', lip: '#3a1f10', top: '#d8352c', topD: '#a8231c', arm: '#4a2a18', armD: '#331b0e', hair: '#120c08', hairD: '#2c201a'},
};

// ---------- face ----------
const Eye: React.FC<{x: number; e: Eyes; flip: number; blink?: boolean}> = ({x, e, flip, blink}) => {
  const dir = flip;
  if (blink || e === 'closed') return <path d={`M${x - 36},272 Q${x},284 ${x + 36},272`} fill="none" {...S} strokeWidth={9} />;
  const lidIn = e === 'angry' ? 14 : e === 'tired' ? 12 : e === 'calm' ? 8 : e === 'wide' ? -8 : 6;
  const lidOut = e === 'tired' ? 10 : e === 'wide' ? -12 : e === 'calm' ? 4 : 0;
  const inX = x - dir * 40, outX = x + dir * 44, top = 248, bot = e === 'wide' ? 300 : 290;
  const d = `M${inX},${top + lidIn + 8} Q${x},${top + Math.min(lidIn, lidOut) - (e === 'wide' ? 10 : 2)} ${outX},${top + lidOut + 6} Q${x + dir * 6},${bot} ${inX},${top + lidIn + 8} Z`;
  const pupil = e === 'side' ? x + 14 : e === 'wide' ? x : null;
  return (
    <g>
      <path d={d} fill="#fbf8f0" {...S} strokeWidth={6} />
      {pupil !== null && <circle cx={pupil} cy={e === 'wide' ? 276 : 274} r={e === 'wide' ? 6 : 7} fill={INK} />}
      <path d={`M${inX - dir * 4},${top + lidIn + 8} Q${x},${top + Math.min(lidIn, lidOut) - (e === 'wide' ? 12 : 4)} ${outX + dir * 6},${top + lidOut + 4}`} fill="none" {...S} strokeWidth={11} />
      {e === 'tired' && <path d={`M${x - 24},${bot + 8} Q${x},${bot + 16} ${x + 24},${bot + 8}`} fill="none" {...S} strokeWidth={4} opacity={0.7} />}
    </g>
  );
};
const Brow: React.FC<{x: number; e: Eyes; flip: number}> = ({x, e, flip}) => {
  const inX = x - flip * 40, outX = x + flip * 36;
  const yIn = e === 'angry' ? 246 : e === 'wide' ? 214 : e === 'tired' ? 238 : 232;
  const yOut = e === 'angry' ? 226 : e === 'wide' ? 212 : e === 'tired' ? 236 : 230;
  return <path d={`M${inX},${yIn} Q${x},${Math.min(yIn, yOut) - 8} ${outX},${yOut}`} fill="none" {...S} strokeWidth={14} />;
};
// signature mouth: a big block of teeth (shared by the whole crew); open 0..1 parts the rows
const Teeth: React.FC<{open: number; p: Pal; x0?: number; x1?: number; topOnly?: boolean; tongue?: boolean}> = ({open, p, x0 = 200, x1 = 400, topOnly, tongue}) => {
  const o = Math.max(0, Math.min(1, open));
  const top = 322, h = 84 + o * 46, bot = top + h, n = Math.max(5, Math.round((x1 - x0) / 22)), w = (x1 - x0) / n;
  const gap = o * 38, topRow = top + (h - gap) / 2, botRow = topRow + gap;
  const lines: string[] = [];
  for (let i = 1; i < n; i++) {
    const tx = x0 + i * w;
    lines.push(gap > 2 ? `M${tx},${top + 4} L${tx},${topRow} M${tx},${botRow} L${tx},${bot - 4}` : `M${tx},${top + 4} L${tx},${bot - 4}`);
  }
  const cx = (x0 + x1) / 2;
  return (
    <g>
      <path d={`M${x0 + 20},${top - 14} Q${cx},${top - 26} ${x1 - 20},${top - 14}`} fill="none" stroke={p.lip} strokeWidth={8} />
      <rect x={x0} y={top} width={x1 - x0} height={h} rx={14} fill="#fbf8f0" {...S} strokeWidth={6} />
      {gap > 2 && <rect x={x0 + 3} y={topRow} width={x1 - x0 - 6} height={gap} fill="#2a0f0c" />}
      {(gap > 14 || tongue) && <path d={`M${x0 + 40},${botRow} Q${cx},${botRow - gap * (tongue ? 0.9 : 0.55)} ${x1 - 40},${botRow}`} fill="#c2453c" />}
      {topOnly && <rect x={x0 - 4} y={botRow - 2} width={x1 - x0 + 8} height={bot - botRow + 6} rx={12} fill={p.lip} {...S} strokeWidth={6} />}
      <path d={lines.join(' ')} fill="none" {...S} strokeWidth={4.5} clipPath={undefined} />
      {topOnly && <rect x={x0 - 4} y={botRow - 2} width={x1 - x0 + 8} height={bot - botRow + 6} rx={12} fill={p.lip} {...S} strokeWidth={6} />}
      {gap > 2 ? <path d={`M${x0},${topRow} L${x1},${topRow} M${x0},${botRow} L${x1},${botRow}`} {...S} strokeWidth={5} />
        : <path d={`M${x0 + 2},${top + h / 2} L${x1 - 2},${top + h / 2}`} {...S} strokeWidth={5} />}
    </g>
  );
};
const Lips: React.FC<{p: Pal; curve?: number; tilt?: number; w?: number}> = ({p, curve = 0, tilt = 0, w = 180}) => {
  // closed mouth: a thick inked line with a lower lip; curve >0 smile, <0 frown; tilt raises the right corner
  const x0 = 300 - w / 2, x1 = 300 + w / 2, y = 376;
  return (
    <g>
      <path d={`M${x0 + 6},${y - 14} Q300,${y - 30} ${x1 - 6},${y - 14}`} fill="none" stroke={p.lip} strokeWidth={10} strokeLinecap="round" />
      <path d={`M${x0 + 14},${y + 10 - tilt * 0.3} Q300,${y + 40 + curve * 0.3} ${x1 - 14},${y + 10 + tilt * 0.3}`} fill="none" stroke={p.lip} strokeWidth={20} strokeLinecap="round" />
      <path d={`M${x0},${y - tilt * 0.5 - curve * 0.6} Q300,${y + curve} ${x1},${y + tilt * 0.5 - curve * 0.6 - tilt}`} fill="none" {...S} strokeWidth={9} />
    </g>
  );
};
const Mouth: React.FC<{open: number; p: Pal; viseme?: string; mood?: Mood}> = ({open, p, viseme, mood}) => {
  if (viseme) {
    switch (viseme) {
      case 'A': return <Lips p={p} w={120} />;                                   // M B P
      case 'B': return <Teeth open={0} p={p} />;                                  // clenched teeth: K S T (signature)
      case 'C': return <Teeth open={0.45} p={p} />;                               // E
      case 'D': return <Teeth open={1} p={p} />;                                  // A (wide)
      case 'E': return <Teeth open={0.75} p={p} x0={232} x1={368} />;             // O-ish, rounder
      case 'F': return <g><ellipse cx={300} cy={372} rx={36} ry={30} fill="#2a0f0c" stroke={p.lip} strokeWidth={14} /><ellipse cx={300} cy={372} rx={36} ry={30} fill="none" {...S} strokeWidth={6} /></g>; // OO W
      case 'G': return <Teeth open={0.5} p={p} topOnly />;                         // F V
      case 'H': return <Teeth open={0.65} p={p} tongue />;                         // L
      default: break;                                                              // X: fall through to mood
    }
  }
  switch (mood ?? 'grin') {
    case 'closed': return <Lips p={p} curve={4} />;
    case 'smirk': return <g><path d="M214,392 Q260,398 292,384" fill="none" {...S} strokeWidth={9} /><g transform="rotate(-9 340 360)"><Teeth open={0} p={p} x0={284} x1={396} /></g></g>;
    case 'o': return <g><ellipse cx={300} cy={378} rx={52} ry={62} fill="#2a0f0c" {...S} strokeWidth={7} /><rect x={262} y={318} width={76} height={22} rx={6} fill="#fbf8f0" {...S} strokeWidth={4} /><path d="M268,410 Q300,392 332,410" fill="#c2453c" /></g>;
    case 'frown': return <g><Teeth open={0} p={p} x0={236} x1={364} /><path d="M226,428 Q300,400 374,428" fill="none" {...S} strokeWidth={8} /></g>;
    default: return <Teeth open={open} p={p} />;
  }
};

// ---------- hair ----------
const Fade: React.FC<{p: Pal}> = ({p}) => (
  <g opacity={0.55}>
    <path d="M190,214 C188,250 190,270 194,290 L206,288 C204,262 204,236 210,206 Z" fill={p.hairD} />
    <path d="M410,214 C412,250 410,270 406,290 L394,288 C396,262 396,236 390,206 Z" fill={p.hairD} />
  </g>
);
// Dre: tight cornrows running straight back, sharp line-up, faded sides
const Cornrows: React.FC<{p: Pal}> = ({p}) => (
  <g>
    <Fade p={p} />
    <path d="M190,232 C176,110 236,70 300,70 C364,70 424,110 410,232 C404,206 396,194 384,190 C330,176 270,176 216,190 C204,194 196,206 190,232 Z" fill={p.hair} {...S} />
    {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
      const x = 300 + k * 26;
      const d = `M${x},${184 - Math.abs(k) * 2} C${x + k * 4},150 ${x + k * 10},110 ${300 + k * 16},78`;
      return <g key={k}><path d={d} fill="none" stroke={p.hairD} strokeWidth={14} strokeLinecap="round" /><path d={d} fill="none" stroke="#5a463c" strokeWidth={3} strokeDasharray="6 9" /></g>;
    })}
  </g>
);
// Lou: big round afro behind the head + a fringe line in front
const afroPath = () => {
  const cx = 300, cy = 170, rx = 250, ry = 205, n = 26, a0 = Math.PI * 0.86, span = Math.PI * 1.28;
  const pt = (a: number, k: number) => [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  let [x, y] = pt(a0, 1);
  let d = `M${x},${y}`;
  for (let k = 1; k <= n; k++) {
    const [bx, by] = pt(a0 + ((k - 0.5) / n) * span, 1.08);
    [x, y] = pt(a0 + (k / n) * span, 1);
    d += ` Q${bx},${by} ${x},${y}`;
  }
  return d + ' Z';
};
const AfroBack: React.FC<{p: Pal}> = ({p}) => (
  <g>
    <path d={afroPath()} fill={p.hair} {...S} />
    <path d="M340,-20 C440,0 518,80 522,180 C524,214 520,238 512,250 C500,170 460,60 340,-20 Z" fill={p.hairD} />
    {[[180, 60], [250, 10], [360, 20], [430, 90], [130, 170], [470, 200], [300, 60]].map(([x, y], k) => (
      <path key={k} d={`M${x},${y} q12,-10 24,0 q12,10 24,0`} fill="none" stroke={p.hairD} strokeWidth={5} strokeLinecap="round" />
    ))}
  </g>
);
const AfroFront: React.FC<{p: Pal}> = ({p}) => (
  <path d="M188,240 C186,150 240,120 300,120 C360,120 414,150 412,240 C398,200 380,188 360,184 C320,176 280,176 240,184 C220,188 202,200 188,240 Z" fill={p.hair} {...S} strokeWidth={6} />
);
// Fast: short twists on top with orange-dyed tips, faded sides
const Twists: React.FC<{p: Pal}> = ({p}) => (
  <g>
    <Fade p={p} />
    {Array.from({length: 9}).map((_, k) => {
      const x = 208 + k * 23, lift = 40 + Math.sin(k * 1.7) * 14 + (k > 1 && k < 7 ? 22 : 0), r = (k - 4) * 7;
      return (
        <g key={k} transform={`rotate(${r} ${x} 170)`}>
          <rect x={x - 13} y={170 - lift - 30} width={26} height={lift + 40} rx={13} fill={p.hair} {...S} strokeWidth={5} />
          <rect x={x - 10} y={170 - lift - 27} width={20} height={22} rx={10} fill="#f2772b" />
          <path d={`M${x - 9},${170 - lift} l18,10 M${x - 9},${170 - lift + 16} l18,10`} stroke={p.hairD} strokeWidth={3} />
        </g>
      );
    })}
    <path d="M192,232 C186,160 230,128 300,128 C370,128 414,160 408,232 C400,206 390,196 380,192 C330,180 270,180 220,192 C208,196 198,206 192,232 Z" fill={p.hair} {...S} />
  </g>
);

// ---------- head ----------
const HEADSHAPE: Record<Who, [number, number]> = {dre: [1, 1], lou: [0.94, 1.05], fast: [1.08, 0.97]};
const Head: React.FC<{who: Who; pose: Pose}> = ({who, pose}) => {
  const p = PAL[who];
  const [hx, hy] = HEADSHAPE[who];
  const e = pose.eyes ?? (who === 'dre' ? 'calm' : who === 'lou' ? 'tired' : 'wide');
  const lk = Math.max(-1, Math.min(1, pose.look ?? 0)), al = Math.abs(lk), dir = Math.sign(lk) || 1;
  const fx = lk * 44;                                    // features slide toward the turn (3/4 view)
  const farX = 300 - dir * 48;                           // far eye squashes
  const sq = (x: number) => (Math.abs(x - farX) < 60 && al > 0.1 ? `translate(${x} 0) scale(${1 - al * 0.28} 1) translate(${-x} 0)` : '');
  const earL = lk > 0.35 ? 0 : 1, earR = lk < -0.35 ? 0 : 1;   // far ear hides behind the head
  return (
    <g transform={`translate(300 470) scale(${hx} ${hy}) translate(-300 -470)`}>
      {who === 'lou' && <g transform={`translate(${lk * 14} 0)`}><AfroBack p={p} /></g>}
      <g opacity={earL}><ellipse cx={186 + Math.max(0, -lk) * 14} cy={298} rx={24} ry={40} fill={p.skin} {...S} /><path d="M182,284 Q194,298 184,314" fill="none" {...S} strokeWidth={4} /></g>
      <g opacity={earR}><ellipse cx={414 - Math.max(0, lk) * 14} cy={298} rx={24} ry={40} fill={p.skin} {...S} /><path d="M418,284 Q406,298 416,314" fill="none" {...S} strokeWidth={4} /></g>
      {who === 'dre' && earL > 0 && <><circle cx={176} cy={342} r={12} fill="none" stroke="#d9dde3" strokeWidth={6} /><circle cx={176} cy={342} r={15} fill="none" stroke={INK} strokeWidth={2} /></>}
      {who === 'lou' && [180, 420].map((x, k) => ((k ? earR : earL) ? <rect key={x} x={x - 9} y={330} width={18} height={18} fill="#eaf6ff" stroke={INK} strokeWidth={3} transform={`rotate(45 ${x} 339)`} /> : null))}
      {who === 'fast' && [180, 420].map((x, k) => ((k ? earR : earL) ? <circle key={x} cx={x} cy={336} r={8} fill="#f0c23a" stroke={INK} strokeWidth={3} /> : null))}
      <path d="M196,200 C196,150 404,150 404,200 L414,330 C420,430 396,470 300,476 C204,470 180,430 186,330 Z" fill={p.skin} {...S} />
      {/* shade on the side facing away */}
      <path d={lk < -0.2 ? 'M196,200 L186,330 C180,430 204,470 300,476 C244,456 218,420 220,330 L222,206 Z' : 'M404,200 L414,330 C420,430 396,470 300,476 C356,456 382,420 380,330 L378,206 Z'} fill={p.skinD} />
      <g transform={`translate(${fx * 0.75} 0)`}>
        {who === 'dre' && <path d="M262,446 C276,470 324,470 338,446 C330,478 312,486 300,486 C288,486 270,478 262,446 Z" fill={p.hair} {...S} strokeWidth={5} />}
        {who === 'lou' && <path d="M250,448 C270,474 330,474 350,448 C346,488 318,498 300,498 C282,498 254,488 250,448 Z" fill={p.hair} {...S} strokeWidth={5} />}
        {who === 'fast' && <path d="M210,420 Q220,470 300,478 Q380,470 390,420" fill="none" stroke={p.hair} strokeWidth={6} strokeDasharray="3 6" />}
      </g>
      <g transform={`translate(${fx} 0)`}>
        {al > 0.3
          ? <path d={`M300,250 L${300 + dir * 30},304 Q${300 + dir * 20},318 300,314`} fill={p.skinD} {...S} strokeWidth={5} />
          : <path d="M292,262 Q278,300 288,310 Q300,316 312,308" fill="none" {...S} strokeWidth={5} />}
        {pose.bags && [252, 348].map((x) => <path key={x} transform={sq(x)} d={`M${x - 40},298 Q${x},336 ${x + 40},298 Q${x},318 ${x - 40},298 Z`} fill="#3d1a33" opacity={0.9} />)}
        <g transform={sq(252)}><Eye x={252} e={e} flip={-1} blink={pose.blink} /><Brow x={252} e={e} flip={-1} /></g>
        <g transform={sq(348)}><Eye x={348} e={e} flip={1} blink={pose.blink} /><Brow x={348} e={e} flip={1} /></g>
        <g transform={`translate(300 370) scale(${1 - al * 0.16} 1) translate(-300 -370)`}><Mouth open={pose.open ?? 0} p={p} viseme={pose.viseme} mood={pose.mood} /></g>
        {who === 'lou' && <path d="M236,312 Q300,292 364,312" fill="none" stroke={p.hair} strokeWidth={10} strokeLinecap="round" />}
      </g>
      <g transform={`translate(${lk * 14} 0)`}>
        {who === 'dre' && <Cornrows p={p} />}
        {who === 'lou' && <AfroFront p={p} />}
        {who === 'fast' && <Twists p={p} />}
      </g>
    </g>
  );
};

// ---------- body ----------
const Finger: React.FC<{x: number; len: number; p: Pal; r?: number}> = ({x, len, p, r = 0}) => (
  <rect x={x - 8} y={6} width={16} height={len} rx={8} fill={p.skin} {...S} strokeWidth={5} transform={`rotate(${r} ${x} 10)`} />
);
const Hand: React.FC<{x: number; y: number; p: Pal; r?: number; pointUp?: boolean; ring?: boolean; kind?: HandKind}> = ({x, y, p, r = 0, pointUp, ring, kind}) => {
  if (!kind) return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M-26,-14 C-30,-40 30,-40 28,-12 L28,18 C28,34 -26,34 -26,18 Z" fill={p.skin} {...S} />
      {pointUp ? <path d="M-6,-30 L-8,-82 C-8,-96 12,-96 12,-82 L12,-30" fill={p.skin} {...S} /> : <path d="M-14,-6 L20,-6 M-14,6 L20,6" fill="none" {...S} strokeWidth={4} />}
      {ring && <rect x={-16} y={-2} width={12} height={10} fill="#f0c23a" stroke={INK} strokeWidth={3} />}
    </g>
  );
  // rig hands: local +y points away from the wrist
  const n = kind === 'count1' || kind === 'point' ? 1 : kind === 'count2' ? 2 : kind === 'count3' ? 3 : 0;
  return (
    <g transform={`translate(${x} ${y - 10}) rotate(${r})`}>
      {kind === 'open' && <>{[-21, -7, 7, 21].map((fx, k) => <Finger key={k} x={fx} len={56 - Math.abs(fx) * 0.6} p={p} r={-fx * 0.5} />)}<Finger x={-30} len={34} p={p} r={50} /></>}
      {n > 0 && [-14, 0, 14].slice(0, n).map((fx, k) => <Finger key={k} x={fx} len={kind === 'point' ? 64 : 54} p={p} r={n > 1 ? (k - (n - 1) / 2) * -12 : 0} />)}
      <rect x={-27} y={-22} width={54} height={50} rx={18} fill={p.skin} {...S} />
      {kind === 'pad' && (
        <g transform="translate(0 18)">
          <path d="M-62,-18 C-60,-34 60,-34 62,-18 L70,18 C74,34 52,40 40,26 L22,10 L-22,10 L-40,26 C-52,40 -74,34 -70,18 Z" fill="#2a2a30" {...S} strokeWidth={5} />
          <circle cx={-34} cy={-6} r={8} fill="#55585e" /><circle cx={34} cy={-6} r={8} fill="#55585e" />
          <circle cx={40} cy={-16} r={4} fill="#ff5a46" /><circle cx={48} cy={-6} r={4} fill="#9fd4ff" />
        </g>
      )}
      {(kind === 'fist' || n > 0 || kind === 'pad') && <path d="M-16,4 L18,4 M-16,14 L18,14" fill="none" {...S} strokeWidth={4} />}
      {ring && <rect x={-20} y={2} width={12} height={10} fill="#f0c23a" stroke={INK} strokeWidth={3} />}
    </g>
  );
};
// own crew logo: a little red brick with BLK
const BLK: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-6)`}>
    <rect x={-34} y={-20} width={68} height={40} rx={5} fill="#c4473b" stroke={INK} strokeWidth={5} />
    <text x={0} y={11} textAnchor="middle" fontFamily="Bangers" fontSize={30} fill="#fbf8f0">BLK</text>
  </g>
);

const Torso: React.FC<{who: Who; arms: Arms; swing?: number}> = ({who, arms, swing = 0}) => {
  const p = PAL[who];
  const capL = arms !== 'phone' && arms !== 'crossed', capR = arms !== 'hype' && arms !== 'point' && arms !== 'crossed';
  return (
    <g>
      <path d="M262,450 L262,530 L338,530 L338,450 Z" fill={p.skinD} {...S} />
      {who === 'dre' && (
        <g>
          <path d="M236,512 C250,540 350,540 364,512 L360,500 L240,500 Z" fill={p.arm} {...S} strokeWidth={6} />
          <path d="M120,610 C126,540 196,520 244,516 C262,548 338,548 356,516 C404,520 474,540 480,610 L494,990 C420,1006 180,1006 106,990 Z" fill={p.top} {...S} />
          <path d="M404,524 C452,540 476,580 480,610 L494,990 C466,996 440,1000 414,1002 Z" fill={p.topD} />
          <path d="M244,516 C262,548 338,548 356,516" fill="none" stroke="#c4473b" strokeWidth={8} />
          <text x={300} y={950} textAnchor="middle" fontFamily="Bangers" fontSize={170} fill="#f4efe2" stroke="#b5352d" strokeWidth={6} paintOrder="stroke">23</text>
          <BLK x={392} y={600} s={0.8} />
<g transform={`rotate(${swing} 300 520)`}>          <path d="M256,524 Q300,640 344,524" fill="none" stroke="#d9dde3" strokeWidth={9} strokeDasharray="7 5" />
          <path d="M291,582 h18 v20 h18 v16 h-18 v36 h-18 v-36 h-18 v-16 h18 z" fill="#e9edf2" stroke={INK} strokeWidth={4} /></g>
        </g>
      )}
      {who === 'lou' && (
        <g>
          <path d="M136,600 C142,540 206,516 250,512 L350,512 C394,516 458,540 464,600 L440,900 L160,900 Z" fill={p.skin} {...S} />
          <path d="M206,530 L236,516 C258,580 342,580 364,516 L394,530 C404,620 420,720 436,900 L164,900 C180,720 196,620 206,530 Z" fill={p.top} {...S} />
          <path d="M380,560 C396,650 410,760 430,900 L380,900 C376,760 372,650 366,566 Z" fill={p.topD} />
          {[620, 680, 740, 800, 860].map((y) => <path key={y} d={`M190,${y} Q300,${y + 8} 410,${y}`} fill="none" stroke={p.topD} strokeWidth={3} />)}
<g transform={`rotate(${swing} 300 520)`}>          <path d="M252,520 Q300,640 348,520" fill="none" stroke="#eaf6ff" strokeWidth={8} />
          <path d="M252,520 Q300,640 348,520" fill="none" stroke={INK} strokeWidth={2} strokeDasharray="4 6" />
          <rect x={250} y={600} width={100} height={42} rx={6} fill="#eaf6ff" stroke={INK} strokeWidth={5} transform="rotate(-4 300 621)" />
          <text x={300} y={632} textAnchor="middle" fontFamily="Bangers" fontSize={34} fill="#5b7ea8" transform="rotate(-4 300 621)">LOU</text></g>
          <rect x={160} y={890} width={280} height={40} fill="#d0605e" stroke={INK} strokeWidth={6} />
          {[190, 230, 270, 310, 350, 390, 420].map((x) => <path key={x} d={`M${x},892 L${x},928`} stroke="#f2d6d0" strokeWidth={4} />)}
          <path d="M162,910 L438,910" stroke="#f2d6d0" strokeWidth={4} />
          <rect x={150} y={928} width={300} height={30} fill="#d9a85b" stroke={INK} strokeWidth={6} />
          {[170, 205, 240, 330, 370, 410, 435].map((x, k) => <ellipse key={x} cx={x} cy={943} rx={9} ry={6} fill="none" stroke="#5a3a1a" strokeWidth={4} transform={`rotate(${k * 30} ${x} 943)`} />)}
          <rect x={276} y={924} width={48} height={38} rx={4} fill="#8a5a2a" stroke={INK} strokeWidth={5} />
        </g>
      )}
      {who === 'fast' && (
        <g>
          <path d="M120,610 C126,540 196,520 244,516 C262,548 338,548 356,516 C404,520 474,540 480,610 L490,960 C420,976 180,976 110,960 Z" fill={p.top} {...S} />
          <path d="M404,524 C452,540 476,580 480,610 L490,960 C466,966 440,970 414,972 Z" fill={p.topD} />
          <path d="M240,512 C258,556 342,556 360,512" fill="none" stroke="#fbf8f0" strokeWidth={12} />
          <path d="M240,512 C258,556 342,556 360,512" fill="none" {...S} strokeWidth={4} />
          <path d="M150,600 C190,700 200,800 196,940 M450,600 C410,700 400,800 404,940" fill="none" stroke="#fbf8f0" strokeWidth={8} />
          <circle cx={300} cy={790} r={78} fill="none" stroke="#fbf8f0" strokeWidth={9} />
          <text x={300} y={840} textAnchor="middle" fontFamily="Bangers" fontSize={140} fill="#fbf8f0" stroke={INK} strokeWidth={3} paintOrder="stroke">7</text>
          <BLK x={226} y={630} s={0.7} />
<g transform={`rotate(${swing} 300 520)`}>          <path d="M258,526 Q300,586 342,526" fill="none" stroke="#f0c23a" strokeWidth={12} />
          <path d="M258,526 Q300,586 342,526" fill="none" stroke="#9a7414" strokeWidth={3} strokeDasharray="5 5" /></g>
        </g>
      )}
      {/* short jersey sleeves sit on top of the shoulders */}
      {who !== 'lou' && arms === 'crossed' && <>
        <path d="M200,520 C150,530 118,560 106,620 L96,700 L176,712 L190,630 Z" fill={p.top} {...S} />
        <path d="M400,520 C450,530 482,560 494,620 L504,700 L424,712 L410,630 Z" fill={p.topD} {...S} />
      </>}
      {arms !== 'rig' && <Arm who={who} arms={arms} />}
      {arms !== 'rig' && who !== 'lou' && capL && <path d="M200,520 C150,530 118,560 106,620 L92,730 L176,748 L188,640 Z" fill={p.top} {...S} />}
      {arms !== 'rig' && who !== 'lou' && capR && <path d="M400,520 C450,530 482,560 494,620 L508,730 L424,748 L412,640 Z" fill={p.topD} {...S} />}
      {arms !== 'rig' && who === 'fast' && capL && <path d="M96,712 L178,730" stroke="#fbf8f0" strokeWidth={8} />}
      {arms !== 'rig' && who === 'fast' && capR && <path d="M504,712 L422,730" stroke="#fbf8f0" strokeWidth={8} />}
    </g>
  );
};

const Arm: React.FC<{who: Who; arms: Arms}> = ({who, arms}) => {
  const p = PAL[who];
  const sl = (d: string) => <path d={d} fill={p.arm} {...S} />;
  if (arms === 'crossed') return (
    <g>
      {sl('M132,640 C96,700 110,760 180,790 L420,770 L430,700 L210,710 C190,690 180,660 190,640 Z')}
      {sl('M468,640 C504,700 490,760 420,800 L180,780 L170,720 L390,716 C410,690 420,660 410,640 Z')}
      <path d="M200,720 L400,712" fill="none" stroke={p.armD} strokeWidth={10} />
      <Hand x={430} y={738} p={p} r={-90} ring />
      <Hand x={168} y={756} p={p} r={90} />
    </g>
  );
  if (arms === 'pockets') return (
    <g>
      {sl('M134,600 C100,700 104,820 150,930 L214,930 C200,820 204,720 210,640 Z')}
      {sl('M466,600 C500,700 496,820 450,930 L386,930 C400,820 396,720 390,640 Z')}
      <path d="M150,930 L214,930 M386,930 L450,930" fill="none" {...S} strokeWidth={9} />
    </g>
  );
  if (arms === 'hype') return (
    <g>
      {sl('M134,600 C100,700 110,800 160,870 L220,850 C200,780 200,700 214,640 Z')}
      <Hand x={190} y={880} p={p} />
      {sl('M440,560 C520,540 580,450 580,330 L516,326 C512,410 470,480 410,520 Z')}
      {who === 'fast' && <rect x={514} y={334} width={68} height={30} rx={6} fill="#d9dde3" stroke={INK} strokeWidth={5} />}
      <Hand x={548} y={300} p={p} r={-4} ring />
    </g>
  );
  if (arms === 'point') return (
    <g>
      {sl('M134,600 C100,700 110,800 160,870 L220,850 C200,780 200,700 214,640 Z')}
      <Hand x={190} y={880} p={p} />
      {sl('M440,580 C520,600 560,640 590,690 L556,730 C520,690 470,670 420,660 Z')}
      <g transform="translate(590 716) rotate(-60)"><Hand x={0} y={0} p={p} pointUp /></g>
    </g>
  );
  if (arms === 'shrug') return (
    <g>
      {sl('M134,600 C70,640 50,720 70,780 L130,770 C130,720 150,680 200,650 Z')}
      {sl('M466,600 C530,640 550,720 530,780 L470,770 C470,720 450,680 400,650 Z')}
      <Hand x={96} y={790} p={p} r={-20} />
      <Hand x={504} y={790} p={p} r={20} ring />
    </g>
  );
  if (arms === 'phone') return (
    <g>
      {sl('M466,600 C500,700 496,820 450,930 L386,930 C400,820 396,720 390,640 Z')}
      <path d="M386,930 L450,930" fill="none" {...S} strokeWidth={9} />
      {sl('M134,600 C90,560 96,460 140,400 L196,430 C170,480 176,540 214,580 Z')}
      <rect x={142} y={290} width={50} height={96} rx={10} fill="#1c1c20" {...S} transform="rotate(-12 167 338)" />
      <Hand x={170} y={392} p={p} r={-20} />
    </g>
  );
  return (
    <g>
      {sl('M134,600 C100,700 110,800 150,890 L210,880 C200,800 200,710 212,640 Z')}
      {sl('M466,600 C500,700 490,800 450,890 L390,880 C400,800 400,710 388,640 Z')}
      <Hand x={180} y={900} p={p} />
      <Hand x={420} y={900} p={p} />
    </g>
  );
};

// articulated arm: shoulder pivot, upper arm, elbow, forearm, hand. side -1 = his right (screen left), +1 = screen right
const RigArm: React.FC<{who: Who; side: number; a: [number, number]; phone?: boolean; hand?: HandKind}> = ({who, side, a, phone, hand}) => {
  const p = PAL[who];
  const sx = side < 0 ? 162 : 438, sy = 590, L1 = 190, L2 = 175, W = 76;
  const sh = -side * a[0], el = -side * a[1];
  const cap = who !== 'lou';
  return (
    <g transform={`translate(${sx} ${sy}) rotate(${sh})`}>
      <rect x={-W / 2} y={-20} width={W} height={L1 + 36} rx={W / 2} fill={p.arm} {...S} />
      {cap && <path d={`M${-W / 2 - 8},-30 L${W / 2 + 8},-30 L${W / 2 + 10},${L1 * 0.62} L${-W / 2 - 10},${L1 * 0.62} Z`} fill={side < 0 ? p.top : p.topD} {...S} />}
      {who === 'fast' && <path d={`M${-W / 2 - 10},${L1 * 0.62 - 8} L${W / 2 + 10},${L1 * 0.62 - 8}`} stroke="#fbf8f0" strokeWidth={8} />}
      <g transform={`translate(0 ${L1}) rotate(${el})`}>
        <rect x={-W / 2 + 3} y={-22} width={W - 6} height={L2 + 30} rx={W / 2} fill={p.arm} {...S} />
        {who === 'fast' && side > 0 && <rect x={-W / 2} y={L2 - 30} width={W} height={24} rx={6} fill="#d9dde3" stroke={INK} strokeWidth={5} />}
        {phone && <rect x={-30} y={L2 - 10} width={56} height={100} rx={10} fill="#1c1c20" {...S} transform={`rotate(${side * 10} 0 ${L2 + 40})`} />}
        <Hand x={0} y={L2 + 22} p={p} r={0} ring={side > 0} kind={hand ?? 'fist'} />
      </g>
    </g>
  );
};

const Kicks: React.FC<{x: number; who: Who}> = ({x, who}) => {
  if (who === 'lou') return ( // tan work boots (no logo)
    <g>
      <path d={`M${x - 86},1262 C${x - 92},1200 ${x - 70},1150 ${x - 40},1140 L${x + 36},1140 C${x + 70},1156 ${x + 96},1210 ${x + 90},1262 Z`} fill="#d29a5a" {...S} />
      <path d={`M${x - 90},1262 L${x + 92},1262 L${x + 90},1282 L${x - 88},1282 Z`} fill="#6a4524" {...S} strokeWidth={6} />
      <path d={`M${x - 70},1238 Q${x},1228 ${x + 80},1238`} fill="none" stroke="#a8743c" strokeWidth={5} strokeDasharray="6 6" />
    </g>
  );
  const body = who === 'dre' ? '#2a2a30' : '#f4f1ea', acc = who === 'dre' ? '#55585e' : '#d8352c';
  return ( // chunky runners with a generic air window
    <g>
      <path d={`M${x - 88},1260 C${x - 92},1218 ${x - 56},1196 ${x},1196 C${x + 56},1196 ${x + 96},1220 ${x + 90},1260 Z`} fill={body} {...S} />
      <path d={`M${x - 80},1230 C${x - 40},1212 ${x + 20},1214 ${x + 86},1236`} fill="none" stroke={acc} strokeWidth={12} />
      <path d={`M${x - 92},1260 L${x + 94},1260 L${x + 92},1282 L${x - 90},1282 Z`} fill="#f4f1ea" {...S} strokeWidth={6} />
      <rect x={x + 30} y={1264} width={44} height={14} rx={6} fill="#bfe3f2" stroke={INK} strokeWidth={3} />
    </g>
  );
};

const Legs: React.FC<{who: Who; step?: number}> = ({who, step}) => {
  if (who === 'fast') {
    const lift = (k: number) => Math.max(0, Math.sin((step ?? 0) + k * Math.PI)) * 34;
    return (
      <g>
        {[[160, 250, 168, 246, 206], [350, 440, 354, 432, 394]].map(([a, b, c, d, kx], k) => (
          <g key={k} transform={`translate(0 ${-lift(k)})`}>
            <path d={`M${a},1060 L${b},1060 L${d},1210 L${c},1210 Z`} fill={PAL.fast.skin} {...S} />
            <path d={`M${a + 6},1120 L${b - 2},1120 L${d},1214 L${c},1214 Z`} fill="#fbf8f0" {...S} strokeWidth={6} />
            <path d={`M${c},1134 L${d},1134`} stroke="#d8352c" strokeWidth={6} />
            <Kicks x={kx} who="fast" />
          </g>
        ))}
        <path d="M126,940 L474,940 L486,1100 C430,1112 340,1112 312,1104 L300,1010 L288,1104 C260,1112 170,1112 114,1100 Z" fill="#cfc3a8" {...S} />
        <path d="M390,946 L474,940 L486,1100 C460,1106 430,1110 404,1110 Z" fill="#b0a385" />
        <path d="M120,1010 L184,1010 L186,1076 L122,1074 Z M418,1010 L480,1010 L482,1074 L418,1076 Z" fill="#b8ab8e" {...S} strokeWidth={5} />
      </g>
    );
  }
  const jean = who === 'dre' ? ['#6b6e74', '#55585e'] : ['#c9dbe9', '#a9c0d4'];
  const lift = (k: number) => (step === undefined ? 0 : Math.max(0, Math.sin(step + k * Math.PI)) * 30);
  const legs = [
    {kx: 196, d: 'M134,940 L302,940 L300,1030 L288,1240 C270,1256 150,1256 96,1236 Z', fold: 'M120,1160 Q170,1150 210,1176 M110,1210 Q170,1196 240,1220', fill: jean[0]},
    {kx: 404, d: 'M298,940 L466,940 L504,1236 C450,1256 330,1256 312,1240 L300,1030 Z', fold: 'M330,1170 Q390,1150 450,1170 M330,1214 Q400,1196 490,1214', fill: jean[0]},
  ];
  return (
    <g>
      {legs.map((L, k) => (
        <g key={k} transform={`translate(0 ${-lift(k)})`}>
          <Kicks x={L.kx} who={who} />
          <path d={L.d} fill={L.fill} {...S} />
          {k === 1 && <path d="M392,950 L466,940 L504,1236 C476,1246 446,1250 420,1250 Z" fill={jean[1]} />}
          <path d={L.fold} fill="none" {...S} strokeWidth={4} />
          {who === 'dre' && (k === 0 ? [[190, 1060, -10], [180, 1180, 6]] : [[400, 1130, 14], [410, 1010, -8]]).map(([x, y, r], j) => (
            <g key={j} transform={`rotate(${r} ${x} ${y})`}>
              <path d={`M${x - 36},${y} Q${x},${y - 16} ${x + 36},${y} Q${x},${y + 14} ${x - 36},${y} Z`} fill={PAL.dre.skin} stroke="#f1efe8" strokeWidth={6} />
              <path d={`M${x - 36},${y} Q${x},${y - 16} ${x + 36},${y}`} fill="none" stroke={INK} strokeWidth={4} />
            </g>
          ))}
        </g>
      ))}
      <path d="M134,940 L466,940" {...S} strokeWidth={7} />
      {who === 'lou' && <>
        <path d="M150,960 Q180,1000 230,990 M450,960 Q420,1000 370,990" fill="none" {...S} strokeWidth={4} />
        <path d="M420,956 C440,1060 450,1120 460,1140 C470,1100 470,1040 452,980" fill="none" stroke="#e9cf7a" strokeWidth={7} strokeDasharray="10 4" />
        <path d="M430,956 C462,1050 486,1080 480,1110" fill="none" stroke="#e9cf7a" strokeWidth={6} strokeDasharray="10 4" />
      </>}
    </g>
  );
};

const SitLegs: React.FC<{who: Who}> = ({who}) => {
  const jean = who === 'dre' ? ['#6b6e74', '#55585e'] : who === 'lou' ? ['#c9dbe9', '#a9c0d4'] : ['#cfc3a8', '#b0a385'];
  return (
    <g>
      <g transform="translate(-20 -96)"><Kicks x={196} who={who} /></g>
      <g transform="translate(20 -96)"><Kicks x={404} who={who} /></g>
      {/* shins */}
      <path d="M104,1000 L262,1004 L250,1176 L118,1176 Z" fill={jean[0]} {...S} />
      <path d="M338,1004 L496,1000 L482,1176 L350,1176 Z" fill={jean[1]} {...S} />
      <path d="M118,1140 Q180,1128 252,1146 M350,1146 Q420,1128 482,1140" fill="none" {...S} strokeWidth={4} />
      {/* thighs coming at the camera, knees wide */}
      <path d="M150,920 L450,920 L500,996 C500,1030 340,1040 314,1010 L300,980 L286,1010 C260,1040 100,1030 100,996 Z" fill={jean[0]} {...S} />
      <path d="M100,996 C110,960 160,950 200,960 M500,996 C490,960 440,950 400,960" fill="none" {...S} strokeWidth={4} />
      {who === 'dre' && <path d="M150,1080 Q186,1068 222,1080 Q186,1092 150,1080 Z M378,1110 Q414,1098 450,1110 Q414,1122 378,1110 Z" fill={PAL.dre.skin} stroke="#f1efe8" strokeWidth={5} />}
    </g>
  );
};

// back view (for over-the-shoulder shots): upper body only
export const BackGuy: React.FC<{who: Who}> = ({who}) => {
  const p = PAL[who];
  return (
    <g>
      <path d="M262,450 L262,530 L338,530 L338,450 Z" fill={p.skinD} {...S} />
      {who === 'lou' ? (
        <g>
          <path d="M136,600 C142,540 206,516 250,512 L350,512 C394,516 458,540 464,600 L440,960 L160,960 Z" fill={p.skin} {...S} />
          <path d="M206,530 L236,516 C258,560 342,560 364,516 L394,530 C404,620 420,720 436,960 L164,960 C180,720 196,620 206,530 Z" fill={p.top} {...S} />
        </g>
      ) : (
        <g>
          <path d="M120,610 C126,540 196,520 244,516 C262,530 338,530 356,516 C404,520 474,540 480,610 L494,990 C420,1006 180,1006 106,990 Z" fill={p.top} {...S} />
          <path d="M244,516 C262,530 338,530 356,516" fill="none" stroke={who === 'fast' ? '#fbf8f0' : '#c4473b'} strokeWidth={8} />
          <text x={300} y={860} textAnchor="middle" fontFamily="Bangers" fontSize={260} fill="#fbf8f0" stroke={INK} strokeWidth={4} paintOrder="stroke">{who === 'fast' ? '7' : '23'}</text>
        </g>
      )}
      <Arm who={who} arms="down" />
      {who !== 'lou' && <>
        <path d="M200,520 C150,530 118,560 106,620 L92,730 L176,748 L188,640 Z" fill={p.top} {...S} />
        <path d="M400,520 C450,530 482,560 494,620 L508,730 L424,748 L412,640 Z" fill={p.topD} {...S} />
      </>}
      <g transform="translate(300 470) scale(1.16) translate(-300 -470)">
        {who === 'lou' && <AfroBack p={p} />}
        <ellipse cx={186} cy={298} rx={24} ry={40} fill={p.skin} {...S} />
        <ellipse cx={414} cy={298} rx={24} ry={40} fill={p.skin} {...S} />
        <path d="M196,200 C196,150 404,150 404,200 L414,330 C420,430 396,470 300,476 C204,470 180,430 186,330 Z" fill={p.skin} {...S} />
        {who === 'dre' && <>
          <path d="M190,380 C176,110 236,70 300,70 C364,70 424,110 410,380 C380,400 220,400 190,380 Z" fill={p.hair} {...S} />
          {[-3, -2, -1, 0, 1, 2, 3].map((k) => <path key={k} d={`M${300 + k * 16},80 C${300 + k * 24},180 ${300 + k * 28},300 ${300 + k * 27},385`} fill="none" stroke={p.hairD} strokeWidth={14} strokeLinecap="round" />)}
        </>}
        {who === 'fast' && <>
          <Twists p={p} />
          <path d="M192,360 C186,160 230,128 300,128 C370,128 414,160 408,360 C380,380 220,380 192,360 Z" fill={p.hair} {...S} />
        </>}
        {who === 'lou' && <ellipse cx={300} cy={250} rx={236} ry={200} fill={p.hair} {...S} />}
      </g>
    </g>
  );
};

export const Guy: React.FC<{who: Who; pose?: Pose; legs?: boolean}> = ({who, pose = {}, legs = true}) => {
  const arms = pose.arms ?? (who === 'dre' ? 'crossed' : who === 'lou' ? 'pockets' : 'hype');
  return (
    <g>
      {legs && (pose.sit ? <SitLegs who={who} /> : <Legs who={who} step={pose.step} />)}
      <Torso who={who} arms={arms} swing={pose.swing} />
      {arms === 'rig' && <>
        <RigArm who={who} side={-1} a={pose.aL ?? [8, -12]} phone={pose.phone} hand={pose.hL} />
        <RigArm who={who} side={1} a={pose.aR ?? [8, -12]} hand={pose.hR} />
      </>}
      <g transform={`rotate(${pose.tilt ?? 0} 300 470) translate(300 470) scale(1.16) translate(-300 -470)`}>
        <Head who={who} pose={pose} />
      </g>
    </g>
  );
};

// SVG filters: wobbly ink line (boils on 4s) + paper grain
export const InkDefs: React.FC<{seed: number}> = ({seed}) => (
  <defs>
    <filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.10 0" />
    </filter>
  </defs>
);
