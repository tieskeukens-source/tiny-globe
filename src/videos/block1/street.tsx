// THE BLOCK set v2: South London corner at night — flats entrance with concrete steps (left), chicken shop (right),
// lamp post on the pavement, kerb + road in front. Inked flat style. World ~ x -500..1700, y -400..2600.
import React from 'react';
import {BANG, MARK} from './fonts';

const INK = '#141210';
const S = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const WALL = 1260;       // where wall meets pavement
export const STEPS = [1262, 1318, 1374, 1430];   // top surface of each step (back to front)
export const POST_X = 1075, POST_BASE = 1600;

const Chicken: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={46} ry={40} fill="#fbf3dc" {...S} strokeWidth={6} />
    <path d="M-10,-28 q8,-22 18,-4 q10,-18 16,4" fill="#e0412f" {...S} strokeWidth={5} />
    <path d="M38,6 l22,6 l-22,8 z" fill="#f2b632" {...S} strokeWidth={5} />
    <circle cx={18} cy={-2} r={6} fill={INK} />
    <path d="M-40,-20 C-30,-46 30,-50 40,-24 L-44,-14 Z" fill="#c8261e" {...S} strokeWidth={5} />
    <path d="M30,-24 L66,-18 L40,-12 Z" fill="#c8261e" {...S} strokeWidth={5} />
  </g>
);

const Shop: React.FC<{f: number}> = ({f}) => {
  const flick = (f % 97 > 90 && f % 97 < 93) || (f % 211 > 150 && f % 211 < 152);
  const on = !flick;
  return (
    <g transform="translate(452 45) scale(0.92)">
      <rect x={0} y={700} width={1200} height={170} fill="#b51f18" />
      <rect x={30} y={712} width={1020} height={146} rx={10} fill="#c8261e" {...S} />
      <circle cx={520} cy={785} r={300} fill="url(#neonglow)" opacity={on ? 1 : 0.35} />
      <Chicken x={120} y={790} s={1.15} />
      <text x={600} y={790} textAnchor="middle" fontFamily={BANG} fontSize={96} fill="#ffd24a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={on ? 1 : 0.55}>SOUTHSIDE</text>
      <text x={600} y={846} textAnchor="middle" fontFamily={BANG} fontSize={52} fill="#fdfbf5" stroke={INK} strokeWidth={5} paintOrder="stroke" letterSpacing={8}>FRIED CHICKEN · PERI PERI</text>
      <rect x={30} y={890} width={700} height={420} fill="#f6c86a" {...S} />
      <rect x={30} y={890} width={700} height={420} fill="url(#glow)" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={70 + k * 220} y={910} width={190} height={110} fill="#2a2420" {...S} strokeWidth={5} />
          <circle cx={120 + k * 220} cy={952} r={26} fill={['#d98a3a', '#e0b04a', '#c8261e'][k]} />
          <text x={200 + k * 220} y={962} textAnchor="middle" fontFamily={BANG} fontSize={34} fill="#ffd24a">£{['2.99', '4.49', '1.99'][k]}</text>
          <text x={160 + k * 220} y={1004} textAnchor="middle" fontFamily={BANG} fontSize={24} fill="#fdfbf5">{['WINGS', 'BOX MEAL', 'CHIPS'][k]}</text>
        </g>
      ))}
      <rect x={30} y={1150} width={700} height={160} fill="#d79a4a" />
      <path d="M30,1150 H730" {...S} strokeWidth={6} />
      <g transform={`translate(${520 + Math.sin(f / 40) * 30} 0)`} opacity={0.85}>
        <ellipse cx={0} cy={1060} rx={40} ry={46} fill="#7a4e3a" />
        <path d="M-70,1150 C-60,1100 60,1100 70,1150 Z" fill="#fdfbf5" />
        <path d="M-36,1030 h72 v-16 h-72 z" fill="#c8261e" />
      </g>
      {[0, 1].map((k) => {
        const x = ((f * (2.2 + k) + k * 500) % 1100) - 150;
        return <g key={k} opacity={0.5}><ellipse cx={x} cy={1070} rx={34} ry={40} fill="#3a2c40" /><rect x={x - 50} y={1108} width={100} height={200} rx={30} fill="#3a2c40" /></g>;
      })}
      <rect x={0} y={890} width={30} height={420} fill="url(#brk)" />
      {[230, 460].map((x) => <path key={x} d={`M${x},890 V1310`} {...S} strokeWidth={8} />)}
      <rect x={760} y={890} width={260} height={420} fill="#3b3a48" {...S} />
      <rect x={784} y={914} width={212} height={300} fill="#f6c86a" opacity={0.75} {...S} strokeWidth={5} />
      <rect x={810} y={950} width={160} height={64} rx={30} fill="none" stroke={on ? '#ff5a4a' : '#7a3a34'} strokeWidth={8} />
      <text x={890} y={996} textAnchor="middle" fontFamily={BANG} fontSize={44} fill={on ? '#ff7a6a' : '#7a3a34'}>OPEN</text>
    </g>
  );
};

export const Street: React.FC<{f: number}> = ({f}) => {
  const steam = (k: number) => ((f * 1.4 + k * 40) % 120);
  return (
    <g>
      <defs>
        <pattern id="brk" width={92} height={40} patternUnits="userSpaceOnUse">
          <rect width={92} height={40} fill="#6e3f3b" />
          <path d="M0,0 H92 M0,20 H92 M0,40 H92 M46,0 V20 M0,20 V40 M92,20 V40" stroke="#4e2a27" strokeWidth={4} />
          <rect x={6} y={4} width={30} height={8} fill="#7d4a45" />
        </pattern>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14132a" /><stop offset="1" stopColor="#3e2a44" /></linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.7} /><stop offset="1" stopColor="#ffd27a" stopOpacity={0} /></radialGradient>
        <radialGradient id="neonglow"><stop offset="0" stopColor="#ff4a3a" stopOpacity={0.55} /><stop offset="1" stopColor="#ff4a3a" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-800} y={-800} width={3000} height={1100} fill="url(#sky)" />
      <rect x={760} y={-120} width={320} height={440} fill="#2a2640" {...S} strokeWidth={5} />
      {Array.from({length: 20}).map((_, k) => <rect key={k} x={784 + (k % 4) * 74} y={-90 + Math.floor(k / 4) * 74} width={40} height={40} fill={(k * 7) % 5 === 0 ? '#f2c96a' : '#3c3656'} />)}
      {/* facade */}
      <rect x={-800} y={150} width={3000} height={WALL - 150} fill="url(#brk)" />
      <path d="M-800,150 H2200" {...S} strokeWidth={10} />
      {[-260, 120, 600, 1000].map((x, k) => (
        <g key={x}>
          <rect x={x} y={220} width={170} height={220} fill={k === 2 ? '#f2c96a' : '#2a2a3e'} {...S} />
          <path d={`M${x + 85},220 V440 M${x},330 H${x + 170}`} {...S} strokeWidth={6} />
          <rect x={x - 12} y={440} width={194} height={22} fill="#d9d2c2" {...S} strokeWidth={5} />
        </g>
      ))}
      {/* flats entrance: recessed blue door, entry light, intercom */}
      <rect x={40} y={620} width={360} height={WALL - 620} fill="#4a2a28" {...S} />
      <rect x={90} y={700} width={250} height={WALL - 700} fill="#2c4a7a" {...S} />
      <rect x={130} y={740} width={170} height={150} fill="#9fb8d8" {...S} strokeWidth={5} />
      <path d="M215,740 V890" {...S} strokeWidth={5} />
      <text x={215} y={960} textAnchor="middle" fontFamily={BANG} fontSize={56} fill="#e9d9a0" stroke={INK} strokeWidth={3} paintOrder="stroke">12</text>
      <rect x={300} y={1010} width={18} height={60} rx={6} fill="#c8c0a8" {...S} strokeWidth={4} />
      <rect x={350} y={900} width={34} height={70} rx={4} fill="#9a9aa2" {...S} strokeWidth={4} />
      <rect x={185} y={630} width={60} height={36} rx={6} fill="#fff1b8" {...S} strokeWidth={5} />
      <ellipse cx={215} cy={760} rx={240} ry={300} fill="url(#glow)" opacity={0.35} />
      {/* graffiti */}
      <text x={-120} y={900} textAnchor="middle" fontFamily={MARK} fontSize={120} fill="none" stroke="#e0412f" strokeWidth={5} opacity={0.85} transform="rotate(-8 -120 900)">BLK</text>
      <text x={-150} y={1080} textAnchor="middle" fontFamily={MARK} fontSize={60} fill="#f2c23a" opacity={0.7} transform="rotate(4 -150 1080)">SE15</text>
      <Shop f={f} />
      {/* vent + steam */}
      <rect x={1440} y={560} width={90} height={60} fill="#9a9aa2" {...S} strokeWidth={5} />
      {[0, 1, 2].map((k) => <circle key={k} cx={1485 + Math.sin((f + k * 20) / 12) * 14} cy={550 - steam(k)} r={22 + steam(k) * 0.2} fill="#e8e4ee" opacity={0.35 * (1 - steam(k) / 120)} />)}
      {/* pavement */}
      <rect x={-800} y={WALL} width={3000} height={700} fill="#8b8d95" />
      <path d={`M-800,${WALL} H2200`} {...S} strokeWidth={8} />
      {[1360, 1500, 1680, 1880].map((y) => <path key={y} d={`M-800,${y} H2200`} stroke="#6f7179" strokeWidth={5} />)}
      {Array.from({length: 16}).map((_, k) => <path key={k} d={`M${-600 + k * 180},${WALL} L${-760 + k * 210},1960`} stroke="#6f7179" strokeWidth={5} />)}
      <rect x={-800} y={WALL} width={3000} height={70} fill="#000" opacity={0.14} />
      {/* concrete steps (front view) with railings */}
      {STEPS.map((y, k) => (
        <g key={k}>
          <rect x={20 - k * 24} y={y} width={400 + k * 48} height={58} fill={k % 2 ? '#a9a6a0' : '#b8b5ae'} {...S} strokeWidth={6} />
          <rect x={20 - k * 24} y={y} width={400 + k * 48} height={12} fill="#cfccc4" />
        </g>
      ))}
      {[-1, 1].map((sd) => {
        const x0 = sd < 0 ? 30 : 410, x1 = sd < 0 ? -50 : 490;
        return <g key={sd}><path d={`M${x0},1100 L${x1},1360 M${x0},1100 V${STEPS[0]} M${x1},1360 V1488`} fill="none" stroke="#2a2a30" strokeWidth={12} strokeLinecap="round" /><path d={`M${(x0 + x1) / 2},1230 V1420`} stroke="#2a2a30" strokeWidth={8} /></g>;
      })}
      {/* bin */}
      <rect x={-330} y={1290} width={170} height={300} rx={10} fill="#2f3340" {...S} />
      <rect x={-346} y={1270} width={202} height={40} rx={8} fill="#3b4150" {...S} />
      {/* kerb + road */}
      <rect x={-800} y={1960} width={3000} height={40} fill="#b4b6bd" {...S} strokeWidth={6} />
      <rect x={-800} y={2000} width={3000} height={700} fill="#2b2b33" />
      <path d="M-800,2040 H2200 M-800,2056 H2200" stroke="#f2c23a" strokeWidth={7} />
      {/* lamp post on the pavement */}
      <rect x={POST_X - 14} y={180} width={28} height={POST_BASE - 180} fill="#3b4150" {...S} strokeWidth={6} />
      <rect x={POST_X - 26} y={POST_BASE - 70} width={52} height={70} rx={6} fill="#3b4150" {...S} strokeWidth={6} />
      <path d={`M${POST_X},190 C${POST_X},140 ${POST_X - 43},130 ${POST_X - 73},140`} fill="none" stroke="#3b4150" strokeWidth={14} />
      <rect x={POST_X - 108} y={138} width={70} height={30} rx={8} fill="#ffe7a0" {...S} strokeWidth={5} />
      <ellipse cx={POST_X - 73} cy={520} rx={300} ry={460} fill="url(#glow)" opacity={0.22} />
      <ellipse cx={POST_X} cy={POST_BASE} rx={70} ry={14} fill="#000" opacity={0.25} />
      {/* chicken box on the pavement */}
      <g transform="translate(860 1900) rotate(8)">
        <path d="M-50,-30 L50,-30 L44,20 L-44,20 Z" fill="#c8261e" {...S} strokeWidth={5} />
        <path d="M-50,-30 L-30,-60 L58,-56 L50,-30" fill="#e0412f" {...S} strokeWidth={5} />
        {[-30, -10, 14].map((x) => <rect key={x} x={x} y={-6} width={10} height={36} fill="#f2c23a" transform={`rotate(${x} ${x} 20)`} />)}
      </g>
    </g>
  );
};

export const Pigeon: React.FC<{f: number; x: number; y: number}> = ({f, x, y}) => {
  const peck = Math.sin(f / 6) > 0.6 ? 14 : 0, hop = (f % 150) < 10 ? -Math.sin(((f % 150) / 10) * Math.PI) * 26 : 0;
  const px = x + Math.floor(f / 150) * 30;
  return (
    <g transform={`translate(${px} ${y + hop})`}>
      <ellipse cx={0} cy={0} rx={44} ry={26} fill="#8a8fa0" {...S} strokeWidth={5} />
      <path d="M-40,-6 L-76,-16 L-70,6 Z" fill="#6f7488" {...S} strokeWidth={4} />
      <g transform={`translate(30 ${-18 + peck}) rotate(${peck * 2})`}>
        <circle cx={0} cy={0} r={18} fill="#6f7488" {...S} strokeWidth={4} />
        <path d="M14,0 l14,4 l-14,4 z" fill="#d9a85b" stroke={INK} strokeWidth={3} />
        <circle cx={6} cy={-4} r={3.5} fill="#f2772b" />
      </g>
      <path d="M-6,24 v14 M8,24 v14" stroke="#e0412f" strokeWidth={5} />
    </g>
  );
};
