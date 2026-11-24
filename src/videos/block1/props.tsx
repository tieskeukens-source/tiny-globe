// Backgrounds + little inked props for THE BLOCK panels.
import React from 'react';
import {BANG, MARK} from './fonts';

type R = {x: number; y: number; w: number; h: number};
const INK = '#141210';
const S = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

export const Brick: React.FC<{r: R; tag?: boolean}> = ({r, tag}) => {
  const rows = Math.ceil(r.h / 54) + 1, cols = Math.ceil(r.w / 120) + 2;
  return (
    <g>
      <rect {...rr(r)} fill="#7e4b47" />
      {Array.from({length: rows}).map((_, i) => (
        <g key={i}>
          <line x1={r.x} x2={r.x + r.w} y1={r.y + i * 54} y2={r.y + i * 54} stroke="#5d3532" strokeWidth={5} />
          {Array.from({length: cols}).map((__, c) => {
            const x = r.x + c * 120 - (i % 2) * 60;
            return <g key={c}>
              <line x1={x} x2={x} y1={r.y + i * 54} y2={r.y + i * 54 + 54} stroke="#5d3532" strokeWidth={5} />
              {(i * 7 + c * 3) % 5 === 0 && <rect x={x + 8} y={r.y + i * 54 + 8} width={50} height={14} fill="#8d5753" />}
            </g>;
          })}
        </g>
      ))}
      {/* graffiti tag */}
      <text x={r.x + r.w * 0.5} y={r.y + (tag ? 300 : r.h * 0.32)} textAnchor="middle" fontFamily={MARK} fontSize={tag ? 190 : 150} fill="none" stroke="#c4473b" strokeWidth={6} opacity={0.75} transform={`rotate(-7 ${r.x + r.w / 2} ${r.y + 200})`}>{tag ? 'THE BLOCK' : 'BLK'}</text>
      {/* shadow at the bottom */}
      <rect x={r.x} y={r.y + r.h * 0.75} width={r.w} height={r.h * 0.25} fill="#000" opacity={0.12} />
    </g>
  );
};

export const Speed: React.FC<{r: R; c1: string; c2: string; cx: number; cy: number; f: number}> = ({r, c1, c2, cx, cy, f}) => {
  const n = 36, R0 = 2400, rot = (f % 8 < 4 ? 0 : 2.5);
  return (
    <g>
      <rect {...rr(r)} fill={c2} />
      {Array.from({length: n}).map((_, k) => {
        if (k % 2) return null;
        const a0 = ((k + rot / 5) / n) * Math.PI * 2, a1 = ((k + 1 + rot / 5) / n) * Math.PI * 2;
        return <path key={k} d={`M${cx},${cy} L${cx + Math.cos(a0) * R0},${cy + Math.sin(a0) * R0} L${cx + Math.cos(a1) * R0},${cy + Math.sin(a1) * R0} Z`} fill={c1} />;
      })}
      <circle cx={cx} cy={cy} r={260} fill={c2} opacity={0.6} />
    </g>
  );
};

export const Halftone: React.FC<{r: R; c: string; bg: string}> = ({r, c, bg}) => {
  const id = 'ht' + c.slice(1) + bg.slice(1);
  return (
    <g>
      <defs><pattern id={id} width={34} height={34} patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx={17} cy={17} r={8} fill={c} /></pattern></defs>
      <rect {...rr(r)} fill={bg} />
      <rect {...rr(r)} fill={`url(#${id})`} />
    </g>
  );
};

export const rr = (r: R) => ({x: r.x, y: r.y, width: r.w, height: r.h});
const center = (r: R, s = 1) => `translate(${r.x + r.w / 2} ${r.y + r.h / 2}) scale(${s})`;

export const Mansion: React.FC<{r: R; f: number}> = ({r}) => (
  <g transform={center(r, 0.95)}>
    <path d="M-130,40 L-130,-40 L0,-120 L130,-40 L130,40 Z" fill="#fbf8f0" {...S} />
    <path d="M-150,-34 L0,-134 L150,-34" fill="none" {...S} strokeWidth={10} />
    {[-90, -40, 40, 90].map((x) => <rect key={x} x={x - 9} y={-40} width={18} height={80} fill="#e8dcc0" {...S} strokeWidth={5} />)}
    <rect x={-22} y={-2} width={44} height={42} fill="#7e4b47" {...S} strokeWidth={5} />
    <path d="M-170,44 L170,44" {...S} strokeWidth={9} />
    <text x={0} y={120} textAnchor="middle" fontFamily={BANG} fontSize={58} fill={INK}>MANSION</text>
  </g>
);

export const Boat: React.FC<{r: R; f: number}> = ({r, f}) => (
  <g transform={center(r, 0.95) + ` rotate(${Math.sin(f / 6) * 3})`}>
    <path d="M-150,0 L150,0 L110,50 L-120,50 Z" fill="#fbf8f0" {...S} />
    <path d="M-80,0 L-60,-50 L60,-50 L90,0 Z" fill="#fbf8f0" {...S} />
    <path d="M-50,-30 L50,-30" {...S} strokeWidth={10} stroke="#2e4686" />
    <path d="M-150,62 Q-110,48 -70,62 T10,62 T90,62 T170,62" fill="none" stroke="#2e4686" strokeWidth={8} />
    <text x={0} y={140} textAnchor="middle" fontFamily={BANG} fontSize={58} fill={INK}>BOAT</text>
  </g>
);

export const Heli: React.FC<{r: R; f: number}> = ({r, f}) => (
  <g transform={center(r, 0.95) + ` translate(0 ${Math.sin(f / 5) * 8})`}>
    <path d={`M${-140 + (f % 4) * 10},-74 L${140 - (f % 4) * 10},-74`} {...S} strokeWidth={10} />
    <path d="M0,-74 L0,-50" {...S} />
    <ellipse cx={-10} cy={-10} rx={80} ry={46} fill="#d8352c" {...S} />
    <path d="M-60,-20 Q-50,-48 -10,-48 L-10,-10 L-62,-10 Z" fill="#bfe3f2" {...S} strokeWidth={5} />
    <path d="M66,-14 L150,-24 L150,-4 L70,6 Z" fill="#d8352c" {...S} strokeWidth={6} />
    <path d="M-60,44 L60,44 M-40,34 L-40,44 M40,34 L40,44" fill="none" {...S} strokeWidth={6} />
    <text x={0} y={140} textAnchor="middle" fontFamily={BANG} fontSize={58} fill={INK}>CHOPPER</text>
  </g>
);

export const Bill: React.FC<{r: R; f: number}> = ({r, f}) => (
  <g transform={center(r, 1.1)}>
    {/* two crumpled bills + a used tissue */}
    {[-1, 1].map((k) => (
      <g key={k} transform={`translate(${k * 140 - 60} ${k * 20}) rotate(${k * 12})`}>
        <path d="M-110,-56 L-40,-64 L20,-50 L110,-60 L104,0 L114,56 L40,48 L-30,62 L-112,52 L-104,0 Z" fill="#9cc18a" {...S} />
        <circle cx={0} cy={0} r={30} fill="#b8d6a8" {...S} strokeWidth={5} />
        <text x={0} y={18} textAnchor="middle" fontFamily={BANG} fontSize={50} fill={INK}>1</text>
        <path d="M-40,-50 L-30,60 M40,-48 L30,50" fill="none" stroke="#6f9a5f" strokeWidth={4} />
      </g>
    ))}
    <g transform={`translate(250 -30) rotate(${Math.sin(f / 4) * 4})`}>
      <path d="M-50,40 C-70,-10 -40,-60 0,-70 C40,-60 70,-10 50,40 C20,56 -20,56 -50,40 Z" fill="#fdfbf5" {...S} />
      <path d="M-20,-30 Q0,-10 -10,20 M20,-40 Q30,0 14,30" fill="none" {...S} strokeWidth={4} />
    </g>
    <text x={0} y={250} textAnchor="middle" fontFamily={BANG} fontSize={84} fill="#d8352c" stroke={INK} strokeWidth={6} paintOrder="stroke">REAL LIFE: $2</text>
  </g>
);

export const Phone: React.FC<{r: R; f: number}> = ({r, f}) => (
  <g transform={center(r, 0.95) + ` rotate(${f % 6 < 3 ? -3 : 3})`}>
    <rect x={-110} y={-200} width={220} height={400} rx={30} fill="#1c1c20" {...S} />
    <rect x={-92} y={-170} width={184} height={330} rx={12} fill="#2f3a4a" />
    <circle cx={0} cy={-80} r={46} fill="#e9b23c" {...S} strokeWidth={5} />
    <text x={0} y={-62} textAnchor="middle" fontFamily={BANG} fontSize={48} fill={INK}>M</text>
    <text x={0} y={10} textAnchor="middle" fontFamily={BANG} fontSize={34} fill="#fdfbf5">FAST'S MOM</text>
    <text x={0} y={48} textAnchor="middle" fontFamily={BANG} fontSize={26} fill="#aab4c2">calling...</text>
    <circle cx={-46} cy={110} r={28} fill="#d8352c" /><circle cx={46} cy={110} r={28} fill="#3fa34d" />
    {[0, 1, 2].map((k) => <path key={k} d={`M${130 + k * 22},${-120 - k * 10} q14,30 0,60`} fill="none" {...S} strokeWidth={6} opacity={(f + k * 3) % 9 < 5 ? 1 : 0.2} />)}
  </g>
);

export const Stain: React.FC<{r: R; f: number}> = ({r, f}) => (
  <g>
    {/* close-up of Fast's red jersey: white trim + the big 7 */}
    <rect {...rr(r)} fill="#d8352c" />
    <path d={`M${r.x + 120},${r.y} C${r.x + 170},${r.y + 200} ${r.x + 180},${r.y + 400} ${r.x + 176},${r.y + r.h}`} fill="none" stroke="#fbf8f0" strokeWidth={14} />
    <circle cx={r.x + r.w * 0.55} cy={r.y + r.h * 0.62} r={170} fill="none" stroke="#fbf8f0" strokeWidth={18} />
    <text x={r.x + r.w * 0.55} y={r.y + r.h * 0.62 + 100} textAnchor="middle" fontFamily={BANG} fontSize={300} fill="#fbf8f0" stroke={INK} strokeWidth={6} paintOrder="stroke">7</text>
    {/* stains */}
    <path d={`M${r.x + 260},${r.y + 200} c40,-30 90,-10 100,30 c20,50 -40,80 -80,60 c-40,-10 -60,-60 -20,-90 z`} fill="#8a4a1c" {...S} strokeWidth={5} />
    <path d={`M${r.x + 660},${r.y + 300} c30,-20 70,0 70,30 c0,40 -50,50 -70,30 c-20,-20 -20,-40 0,-60 z`} fill="#c9a227" {...S} strokeWidth={5} />
    <circle cx={r.x + 420} cy={r.y + 330} r={16} fill="#8a4a1c" {...S} strokeWidth={4} />
    {/* stink lines + flies */}
    {[0, 1, 2, 3].map((k) => (
      <path key={k} d={`M${r.x + 200 + k * 190},${r.y + r.h - 40} q-30,-60 0,-120 q30,-60 0,-120`} fill="none" stroke="#7da24a" strokeWidth={10} strokeLinecap="round" opacity={0.85} transform={`translate(0 ${-((f * 3 + k * 40) % 60)})`} />
    ))}
    {[0, 1, 2].map((k) => {
      const x = r.x + 300 + k * 200 + Math.sin(f / 3 + k) * 60, y = r.y + 140 + Math.cos(f / 2.5 + k * 2) * 50;
      return <g key={k}><circle cx={x} cy={y} r={10} fill={INK} /><ellipse cx={x - 8} cy={y - 12} rx={9} ry={6} fill="#fdfbf5" stroke={INK} strokeWidth={3} /><ellipse cx={x + 8} cy={y - 12} rx={9} ry={6} fill="#fdfbf5" stroke={INK} strokeWidth={3} /></g>;
    })}
    <text x={r.x + r.w / 2} y={r.y + r.h - 70} textAnchor="middle" fontFamily={BANG} fontSize={92} fill="#ffd24a" stroke={INK} strokeWidth={7} paintOrder="stroke" transform={`rotate(-4 ${r.x + r.w / 2} ${r.y + r.h - 70})`}>DAY 4</text>
  </g>
);
