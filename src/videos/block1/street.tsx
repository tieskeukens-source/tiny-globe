// THE BLOCK set: a South London chicken shop at night, inked in the same flat style. World = 1080 x 1920.
import React from 'react';
import {BANG, MARK} from './fonts';

const INK = '#141210';
const S = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const FLOOR = 1700;   // feet line

const Chicken: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  // invented mascot: a little chicken in a cap
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={46} ry={40} fill="#fbf3dc" {...S} strokeWidth={6} />
    <path d="M-10,-28 q8,-22 18,-4 q10,-18 16,4" fill="#e0412f" {...S} strokeWidth={5} />
    <path d="M38,6 l22,6 l-22,8 z" fill="#f2b632" {...S} strokeWidth={5} />
    <circle cx={18} cy={-2} r={6} fill={INK} />
    <path d="M30,24 q6,14 -4,16" fill="#e0412f" {...S} strokeWidth={4} />
    <path d="M-40,-20 C-30,-46 30,-50 40,-24 L-44,-14 Z" fill="#c8261e" {...S} strokeWidth={5} />
    <path d="M30,-24 L66,-18 L40,-12 Z" fill="#c8261e" {...S} strokeWidth={5} />
  </g>
);

export const Street: React.FC<{f: number}> = ({f}) => {
  const flick = (f % 97 > 90 && f % 97 < 93) || (f % 211 > 150 && f % 211 < 152);   // neon flicker
  const neonOn = flick ? 0.35 : 1;
  const steam = (k: number) => ((f * 1.4 + k * 40) % 120);
  return (
    <g>
      <defs>
        <pattern id="brk" width={92} height={40} patternUnits="userSpaceOnUse">
          <rect width={92} height={40} fill="#6e3f3b" />
          <path d="M0,0 H92 M0,20 H92 M0,40 H92 M46,0 V20 M0,20 V40 M92,20 V40" stroke="#4e2a27" strokeWidth={4} />
          <rect x={6} y={4} width={30} height={8} fill="#7d4a45" />
        </pattern>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1a33" /><stop offset="1" stopColor="#4a2f4a" /></linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.7} /><stop offset="1" stopColor="#ffd27a" stopOpacity={0} /></radialGradient>
        <radialGradient id="neonglow"><stop offset="0" stopColor="#ff4a3a" stopOpacity={0.55} /><stop offset="1" stopColor="#ff4a3a" stopOpacity={0} /></radialGradient>
      </defs>
      <g transform="translate(0 -150)">
      {/* sky + far estate block */}
      <rect x={-400} y={-400} width={1880} height={900} fill="url(#sky)" />
      <rect x={640} y={40} width={300} height={500} fill="#2c2742" {...S} strokeWidth={5} />
      {Array.from({length: 24}).map((_, k) => <rect key={k} x={662 + (k % 4) * 70} y={70 + Math.floor(k / 4) * 74} width={40} height={40} fill={(k * 7) % 5 === 0 ? '#f2c96a' : '#3c3656'} />)}
      {/* building facade */}
      <rect x={-400} y={180} width={1880} height={1300} fill="url(#brk)" />
      <path d="M-400,180 H1480" {...S} strokeWidth={10} />
      {[120, 480, 840].map((x, k) => (
        <g key={x}>
          <rect x={x} y={290} width={170} height={230} fill={k === 1 ? '#f2c96a' : '#2a2a3e'} {...S} />
          <path d={`M${x + 85},290 V520 M${x},405 H${x + 170}`} {...S} strokeWidth={6} />
          <rect x={x - 12} y={520} width={194} height={22} fill="#d9d2c2" {...S} strokeWidth={5} />
          {k === 1 && <rect x={x + 8} y={298} width={70} height={100} fill="#e0a95a" />}
        </g>
      ))}
      {/* extractor vent + steam */}
      <rect x={940} y={600} width={90} height={60} fill="#9a9aa2" {...S} strokeWidth={5} />
      {[0, 1, 2].map((k) => <circle key={k} cx={985 + Math.sin((f + k * 20) / 12) * 14} cy={590 - steam(k)} r={22 + steam(k) * 0.2} fill="#e8e4ee" opacity={0.35 * (1 - steam(k) / 120)} />)}
      {/* shop sign */}
      <rect x={-400} y={700} width={1880} height={170} fill="#b51f18" />
      <rect x={30} y={712} width={1020} height={146} rx={10} fill="#c8261e" {...S} />
      <circle cx={520} cy={785} r={300} fill="url(#neonglow)" opacity={neonOn} />
      <Chicken x={120} y={790} s={1.15} />
      <text x={600} y={790} textAnchor="middle" fontFamily={BANG} fontSize={96} fill="#ffd24a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={neonOn > 0.5 ? 1 : 0.55}>SOUTHSIDE</text>
      <text x={600} y={846} textAnchor="middle" fontFamily={BANG} fontSize={52} fill="#fdfbf5" stroke={INK} strokeWidth={5} paintOrder="stroke" letterSpacing={8}>FRIED CHICKEN · PERI PERI</text>
      {/* shop window with warm light */}
      <rect x={30} y={890} width={700} height={420} fill="#f6c86a" {...S} />
      <rect x={30} y={890} width={700} height={420} fill="url(#glow)" />
      {/* menu boards */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={70 + k * 220} y={910} width={190} height={110} fill="#2a2420" {...S} strokeWidth={5} />
          <circle cx={120 + k * 220} cy={952} r={26} fill={['#d98a3a', '#e0b04a', '#c8261e'][k]} />
          <text x={200 + k * 220} y={962} textAnchor="middle" fontFamily={BANG} fontSize={34} fill="#ffd24a">£{['2.99', '4.49', '1.99'][k]}</text>
          <text x={160 + k * 220} y={1004} textAnchor="middle" fontFamily={BANG} fontSize={24} fill="#fdfbf5">{['WINGS', 'BOX MEAL', 'CHIPS'][k]}</text>
        </g>
      ))}
      {/* counter + worker silhouette + people passing inside */}
      <rect x={30} y={1150} width={700} height={160} fill="#d79a4a" />
      <path d="M30,1150 H730" {...S} strokeWidth={6} />
      <g transform={`translate(${520 + Math.sin(f / 40) * 30} 0)`}>
        <ellipse cx={0} cy={1060} rx={40} ry={46} fill="#7a4e3a" opacity={0.85} />
        <path d="M-70,1150 C-60,1100 60,1100 70,1150 Z" fill="#fdfbf5" opacity={0.85} />
        <path d="M-36,1030 h72 v-16 h-72 z" fill="#c8261e" opacity={0.85} />
      </g>
      {[0, 1].map((k) => {
        const x = ((f * (2.2 + k) + k * 500) % 1100) - 150;
        return <g key={k} opacity={0.5}><ellipse cx={x} cy={1070} rx={34} ry={40} fill="#3a2c40" /><rect x={x - 50} y={1108} width={100} height={200} rx={30} fill="#3a2c40" /></g>;
      })}
      {[230, 460].map((x) => <path key={x} d={`M${x},890 V1310`} {...S} strokeWidth={8} />)}
      {/* door + OPEN neon */}
      <rect x={760} y={890} width={260} height={420} fill="#3b3a48" {...S} />
      <rect x={784} y={914} width={212} height={300} fill="#f6c86a" opacity={0.75} {...S} strokeWidth={5} />
      <rect x={810} y={950} width={160} height={64} rx={30} fill="none" stroke={neonOn > 0.5 ? '#ff5a4a' : '#7a3a34'} strokeWidth={8} />
      <text x={890} y={996} textAnchor="middle" fontFamily={BANG} fontSize={44} fill={neonOn > 0.5 ? '#ff7a6a' : '#7a3a34'}>OPEN</text>
      <rect x={950} y={1100} width={20} height={70} rx={8} fill="#d9d2c2" {...S} strokeWidth={4} />
      {/* graffiti tag on the brick */}
      <text x={300} y={640} textAnchor="middle" fontFamily={MARK} fontSize={110} fill="none" stroke="#e0412f" strokeWidth={5} opacity={0.8} transform="rotate(-6 300 640)">BLK</text>
      </g>
      {/* pavement */}
      <rect x={-400} y={1160} width={1880} height={600} fill="#8b8d95" />
      <path d="M-400,1160 H1480" {...S} strokeWidth={8} />
      {[1260, 1400, 1580].map((y) => <path key={y} d={`M-400,${y} H1480`} stroke="#6f7179" strokeWidth={5} />)}
      {Array.from({length: 12}).map((_, k) => <path key={k} d={`M${-300 + k * 180},1160 L${-350 + k * 195},1760`} stroke="#6f7179" strokeWidth={5} />)}
      <rect x={-400} y={1160} width={1880} height={60} fill="#000" opacity={0.12} />
      {/* kerb + road */}
      <rect x={-400} y={1760} width={1880} height={40} fill="#b4b6bd" {...S} strokeWidth={6} />
      <rect x={-400} y={1800} width={1880} height={400} fill="#2b2b33" />
      <path d="M-400,1830 H1480 M-400,1846 H1480" stroke="#f2c23a" strokeWidth={7} />
      {/* bin + lamp post */}
      <g>
        <rect x={-120} y={1300} width={170} height={300} rx={10} fill="#2f3340" {...S} />
        <rect x={-136} y={1280} width={202} height={40} rx={8} fill="#3b4150" {...S} />
      </g>
      <rect x={1040} y={420} width={26} height={1300} fill="#3b4150" {...S} strokeWidth={6} />
      <path d="M1053,430 C1053,380 1010,370 980,380" fill="none" {...S} strokeWidth={12} stroke="#3b4150" />
      <path d="M1053,430 C1053,380 1010,370 980,380" fill="none" {...S} strokeWidth={4} />
      <rect x={946} y={378} width={70} height={30} rx={8} fill="#ffe7a0" {...S} strokeWidth={5} />
      <ellipse cx={980} cy={700} rx={260} ry={420} fill="url(#glow)" opacity={0.25} />
      {/* empty chicken box + chips on the pavement */}
      <g transform="translate(720 1730) rotate(8)">
        <path d="M-50,-30 L50,-30 L44,20 L-44,20 Z" fill="#c8261e" {...S} strokeWidth={5} />
        <path d="M-50,-30 L-30,-60 L58,-56 L50,-30" fill="#e0412f" {...S} strokeWidth={5} />
        {[-30, -10, 14].map((x) => <rect key={x} x={x} y={-6} width={10} height={36} fill="#f2c23a" transform={`rotate(${x} ${x} 20)`} />)}
      </g>
    </g>
  );
};

// a pigeon that pecks and hops
export const Pigeon: React.FC<{f: number; x: number}> = ({f, x}) => {
  const peck = Math.sin(f / 6) > 0.6 ? 14 : 0, hop = (f % 150) < 10 ? -Math.sin(((f % 150) / 10) * Math.PI) * 26 : 0;
  const px = x + Math.floor(f / 150) * 30;
  return (
    <g transform={`translate(${px} ${1745 + hop})`}>
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
