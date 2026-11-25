import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W, H} from '../brand';
import {Kaartspeld, Pose} from './Kaartspeld';
import {Auto, Huis, Rook, Sneeuwval} from './Werelden';

const INK = C.ink;
const WOOD = '#A8643C';
const WOOD_D = '#7E4A2E';
const LIGHT = '#F6C453';
const SNOW = '#FFFFFF';
const ICE = '#CFEAF7';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = {easing: Easing.inOut(Easing.cubic), ...clamp};

export type At = (woord: string) => number;
const noAt: At = () => 0;

const usePopAt = (at: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping: 12}});
};

// ---------- achtergronden ----------
const Lucht: React.FC<{soort?: 'dag' | 'nacht' | 'schemer' | 'zomer'; id: string}> = ({soort = 'dag', id}) => {
  const k = {dag: ['#9DB9D6', '#F4DCC4'], nacht: ['#0E1A33', '#2A4466'], schemer: ['#33507A', '#E9A27A'], zomer: ['#5FA8E0', '#CDEBFA']}[soort];
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={k[0]} />
          <stop offset="1" stopColor={k[1]} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
};

const Sterren: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({length: 60}).map((_, i) => (
        <circle key={i} cx={random(`a${i}`) * W} cy={random(`b${i}`) * 500} r={1.5 + random(`c${i}`) * 2} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 20 + i))} />
      ))}
    </g>
  );
};

const Bergen: React.FC<{kleur?: string; y?: number}> = ({kleur = '#B7C7D9', y = 0}) => (
  <g transform={`translate(0 ${y})`}>
    <path d="M-100 640 L250 360 L480 540 L760 300 L1020 560 L1300 380 L1600 560 L1820 340 L2100 640 Z" fill={kleur} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M250 360 L300 400 L275 420 L215 388 Z M760 300 L820 350 L780 370 L720 334 Z M1300 380 L1350 420 L1320 432 L1255 408 Z M1820 340 L1875 390 L1840 400 L1780 372 Z" fill={SNOW} />
  </g>
);

const Grond: React.FC<{y?: number; kleur?: string}> = ({y = 790, kleur = SNOW}) => (
  <path d={`M-100 ${y} Q600 ${y - 30} 1200 ${y} T2100 ${y} L2100 ${H} L-100 ${H} Z`} fill={kleur} stroke={INK} strokeWidth={5} />
);

const Vuur: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={10} rx={90} ry={22} fill="#5A3A28" />
      {[-40, 0, 40].map((dx, k) => {
        const h = 120 + Math.sin(f / 3 + k * 2) * 25;
        return <path key={k} d={`M${dx - 34} 5 Q${dx - 20} ${-h / 2} ${dx + Math.sin(f / 4 + k) * 10} ${-h} Q${dx + 20} ${-h / 2} ${dx + 34} 5 Z`} fill={k === 1 ? C.orange : '#F29E4C'} stroke={INK} strokeWidth={4} />;
      })}
      <path d={`M-16 5 Q-8 -40 0 ${-70 + Math.sin(f / 2) * 10} Q8 -40 16 5 Z`} fill={LIGHT} />
      <Rook x={0} y={-130} schaal={0.7} kleur="#9A9A9A" />
    </g>
  );
};

// ---------- thermometer in de sneeuw ----------
export const ThermoScene: React.FC<{stappen: {woord: string; waarde: number; label: string}[]; at?: At}> = ({stappen, at = noAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const top = 150, bot = 880, vmax = 40, vmin = -70;
  const yv = (v: number) => top + ((vmax - v) / (vmax - vmin)) * (bot - top);
  let v = stappen.length ? (stappen[0].waarde > 0 ? 0 : 10) : 0;
  let last = -1;
  stappen.forEach((st, i) => {
    const t = at(st.woord);
    const p = spring({frame: f - t, fps, config: {damping: 20}});
    const prev = i === 0 ? v : stappen[i - 1].waarde;
    if (f >= t) { v = prev + (st.waarde - prev) * p; last = i; }
  });
  const cold = v < -30;
  const kleur = v > 0 ? C.orange : C.blue;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort={v > 20 ? 'zomer' : 'dag'} id="th" />
      <Bergen y={60} />
      <Grond y={900} kleur={v > 20 ? '#8CC07A' : SNOW} />
      <g>
        <rect x={500} y={top - 40} width={110} height={bot - top + 80} rx={55} fill={C.paper} stroke={INK} strokeWidth={8} />
        <circle cx={555} cy={bot + 60} r={85} fill={kleur} stroke={INK} strokeWidth={8} />
        <rect x={530} y={yv(v)} width={50} height={bot + 30 - yv(v)} fill={kleur} />
        {[40, 20, 0, -20, -40, -60].map((t) => (
          <g key={t}>
            <line x1={500} y1={yv(t)} x2={535} y2={yv(t)} stroke={INK} strokeWidth={5} />
            <text x={480} y={yv(t) + 14} textAnchor="end" fontFamily="Inter" fontWeight={800} fontSize={36} fill={INK}>{t}°</text>
          </g>
        ))}
        {stappen.map((st, i) => {
          const p = spring({frame: f - at(st.woord) - 6, fps, config: {damping: 14}});
          if (f < at(st.woord)) return null;
          return (
            <g key={i} opacity={p} transform={`translate(${(1 - p) * 40} 0)`}>
              <line x1={615} y1={yv(st.waarde)} x2={690} y2={yv(st.waarde)} stroke={INK} strokeWidth={5} strokeDasharray="8 8" />
              <rect x={700} y={yv(st.waarde) - 42} width={Math.max(260, st.label.length * 26 + 60)} height={84} rx={18} fill={i === last ? C.paper : '#EDE7DC'} stroke={INK} strokeWidth={5} />
              <text x={730} y={yv(st.waarde) + 14} fontFamily="Lilita One" fontSize={46} fill={st.waarde > 0 ? C.orange : C.blue}>{st.label}</text>
            </g>
          );
        })}
      </g>
      <Kaartspeld pose={cold ? 'cold' : v > 20 ? 'wave' : 'point'} stap={f} x={1500} y={900 - 340} scale={1.2} />
      {v < 15 && <Sneeuwval n={40} />}
    </svg>
  );
};

// ---------- vallei: koude lucht zakt naar beneden ----------
export const ValleiScene: React.FC<{lucht?: boolean; stil?: boolean}> = ({lucht, stil}) => {
  const f = useCurrentFrame();
  const pool = lucht || stil ? interpolate(f, [0, 150], [stil ? 1 : 0, 1], clamp) : 0;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="nacht" id="va" />
      <Sterren />
      <path d="M-100 1080 L-100 260 L200 170 L520 420 L760 760 L1160 760 L1400 420 L1720 170 L2020 260 L2020 1080 Z" fill="#6C86A6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M200 170 L260 220 L225 240 L140 190 Z M1720 170 L1790 200 L1760 230 L1660 210 Z" fill={SNOW} />
      <path d="M760 760 L1160 760 L1160 1080 L760 1080 Z" fill="#C9D6E3" />
      {[820, 940, 1050].map((hx, k) => (
        <g key={k} transform={`translate(${hx} 700) scale(0.28)`}>
          <rect x={0} y={60} width={300} height={190} fill={WOOD} stroke={INK} strokeWidth={14} />
          <path d="M-30 70 L150 -20 L330 70 Z" fill={SNOW} stroke={INK} strokeWidth={14} />
          <rect x={60} y={110} width={70} height={60} fill={LIGHT} stroke={INK} strokeWidth={10} />
        </g>
      ))}
      <path d={`M300 ${760 - pool * 330} L1620 ${760 - pool * 330} L1400 420 L1160 760 L760 760 L520 420 Z`} fill="#7FB8F0" opacity={0.45 * pool} />
      {lucht && [0, 1, 2].map((k) => {
        const ph = ((f + k * 20) % 60) / 60;
        const ax = 260 + ph * 420, ay = 230 + ph * 470;
        const bx = 1660 - ph * 420;
        return (
          <g key={k} opacity={Math.sin(ph * Math.PI)}>
            <path d={`M${ax} ${ay} l60 70 l-36 -6 M${ax + 60} ${ay + 70} l-4 -36`} stroke="#BFE3FF" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d={`M${bx} ${ay} l-60 70 l36 -6 M${bx - 60} ${ay + 70} l4 -36`} stroke="#BFE3FF" strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      <Kaartspeld pose={lucht || stil ? 'cold' : 'point'} stap={f} x={880} y={590} scale={0.6} />
    </svg>
  );
};

// ---------- daglicht-klok ----------
export const ZonScene: React.FC<{uren: number; zomer?: boolean}> = ({uren, zomer}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [10, 70], [0, uren / 24], ease);
  const cx = 760, cy = 470, r = 300;
  const a = p * Math.PI * 2;
  const x2 = cx + r * Math.sin(a), y2 = cy - r * Math.cos(a);
  const arc = p >= 0.999 ? `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.1} ${cy - r} Z` : `M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort={zomer ? 'zomer' : 'nacht'} id="zo" />
      {!zomer && <Sterren />}
      <Grond y={930} kleur={zomer ? '#8CC07A' : '#C9D6E3'} />
      <circle cx={cx} cy={cy} r={r + 14} fill="#1B2A44" stroke={INK} strokeWidth={10} />
      <path d={arc} fill={LIGHT} />
      {Array.from({length: 24}).map((_, i) => {
        const b = (i / 24) * Math.PI * 2;
        return <line key={i} x1={cx + (r - 30) * Math.sin(b)} y1={cy - (r - 30) * Math.cos(b)} x2={cx + r * Math.sin(b)} y2={cy - r * Math.cos(b)} stroke={INK} strokeWidth={i % 6 === 0 ? 8 : 3} />;
      })}
      <circle cx={cx} cy={cy} r={130} fill={C.paper} stroke={INK} strokeWidth={8} />
      <text x={cx} y={cy + 30} textAnchor="middle" fontFamily="Lilita One" fontSize={96} fill={INK}>{Math.round(p * 24)} h</text>
      <Kaartspeld pose={zomer ? 'wave' : 'cold'} stap={f} x={1340} y={930 - 345} scale={1.2} />
    </svg>
  );
};

// ---------- binnenshuis + aankleden ----------
export const BinnenScene: React.FC<{items?: {woord: string; ding: 'muts' | 'sjaal' | 'jas' | 'laarzen'}[]; at?: At; pose?: Pose}> = ({items = [], at = noAt, pose = 'stand'}) => {
  const f = useCurrentFrame();
  const sx = 760, sy = 210, sc = 2.2;
  const has = (d: string) => items.find((it) => it.ding === d);
  const pop = (d: string) => {
    const it = has(d);
    if (!it) return 0;
    return spring({frame: f - at(it.woord), fps: 30, config: {damping: 12}});
  };
  const muts = pop('muts'), sjaal = pop('sjaal'), jas = pop('jas'), laars = pop('laarzen');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#E9D8A6" />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 170} y1={0} x2={i * 170} y2={860} stroke="#D9C48C" strokeWidth={6} />)}
      <rect x={0} y={860} width={W} height={220} fill={WOOD} stroke={INK} strokeWidth={6} />
      {/* raam met nacht en sneeuw */}
      <g>
        <rect x={180} y={180} width={400} height={340} fill="#1F3557" stroke={INK} strokeWidth={10} />
        {Array.from({length: 16}).map((_, i) => <circle key={i} cx={200 + random(`r${i}`) * 360} cy={200 + ((random(`q${i}`) * 300 + f * 2) % 300)} r={4} fill="#fff" />)}
        <path d="M180 520 Q260 470 300 520 M480 520 Q540 460 580 520 M180 180 Q240 230 200 300" stroke="#DDF0FF" strokeWidth={14} fill="none" opacity={0.8} />
        <line x1={380} y1={180} x2={380} y2={520} stroke={INK} strokeWidth={8} />
        <line x1={180} y1={350} x2={580} y2={350} stroke={INK} strokeWidth={8} />
      </g>
      {/* radiator */}
      <g>
        <rect x={1300} y={640} width={360} height={190} rx={14} fill="#E7E2DA" stroke={INK} strokeWidth={6} />
        {Array.from({length: 7}).map((_, i) => <line key={i} x1={1340 + i * 47} y1={660} x2={1340 + i * 47} y2={810} stroke={INK} strokeWidth={5} />)}
        {[0, 1, 2].map((k) => <path key={k} d={`M${1380 + k * 100} 620 q15 -25 0 -50 q-15 -25 0 -50`} stroke={C.orange} strokeWidth={7} fill="none" opacity={0.5 + 0.5 * Math.sin(f / 8 + k)} />)}
      </g>
      <Kaartspeld pose={pose} stap={f} x={sx} y={sy} scale={sc} />
      <g transform={`translate(${sx} ${sy}) scale(${sc})`}>
        {jas > 0 && <path d="M80 138 L120 138 L140 232 L60 232 Z" fill="#6B4A36" stroke={INK} strokeWidth={4} transform={`translate(100 185) scale(${jas}) translate(-100 -185)`} />}
        {sjaal > 0 && <rect x={78} y={116} width={44} height={16} rx={5} fill={C.orange} stroke={INK} strokeWidth={3} transform={`translate(100 124) scale(${sjaal}) translate(-100 -124)`} />}
        {muts > 0 && <path d="M64 34 Q100 -14 136 34 Q100 22 64 34 Z" fill="#8A6A4E" stroke={INK} strokeWidth={4} transform={`translate(0 ${(1 - muts) * -60})`} opacity={muts} />}
        {laars > 0 && (
          <g opacity={laars}>
            <rect x={66} y={268} width={30} height={24} rx={8} fill="#5B3B2A" stroke={INK} strokeWidth={3} />
            <rect x={104} y={268} width={30} height={24} rx={8} fill="#5B3B2A" stroke={INK} strokeWidth={3} />
          </g>
        )}
      </g>
    </svg>
  );
};

// ---------- warmtecentrale ----------
export const CentraleScene: React.FC = () => {
  const f = useCurrentFrame();
  const pipeY = 690;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="schemer" id="ce" />
      <Bergen />
      <Grond y={800} />
      <g>
        <rect x={150} y={420} width={420} height={360} fill="#9AA3AD" stroke={INK} strokeWidth={6} />
        <rect x={420} y={120} width={70} height={320} fill="#7D858F" stroke={INK} strokeWidth={6} />
        <Rook x={455} y={110} schaal={2} kleur="#B8B8B8" />
        {[200, 300].map((wx) => <rect key={wx} x={wx} y={480} width={70} height={60} fill={LIGHT} stroke={INK} strokeWidth={5} />)}
      </g>
      <path d={`M570 ${pipeY} L1850 ${pipeY}`} stroke="#C9C2B8" strokeWidth={34} />
      <path d={`M570 ${pipeY} L1850 ${pipeY}`} stroke={INK} strokeWidth={4} strokeDasharray="0 0" opacity={0} />
      {[700, 1000, 1300, 1600].map((px) => <line key={px} x1={px} y1={pipeY} x2={px} y2={790} stroke={INK} strokeWidth={8} />)}
      {Array.from({length: 14}).map((_, k) => {
        const x = 580 + (((f * 6) + k * 95) % 1270);
        return <circle key={k} cx={x} cy={pipeY} r={9} fill={C.orange} />;
      })}
      <Huis x={1120} y={420} s={0.8} />
      <Huis x={1520} y={430} s={0.75} />
      <Kaartspeld pose="point" stap={f} x={760} y={800 - 330} scale={1.15} />
      <Sneeuwval n={40} />
    </svg>
  );
};

// ---------- buiten-wc ----------
export const WcScene: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const aan = Math.round(dur * 0.65);
  const x = interpolate(f, [5, aan], [340, 1330], ease);
  const binnen = f > aan + 4;
  const deur = interpolate(f, [aan, aan + 10], [1, 0], clamp);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="schemer" id="wc" />
      <Bergen kleur="#8FA3BD" />
      <Grond y={820} />
      <Huis x={40} y={560} s={0.85} />
      <g transform="translate(1420 470)">
        <rect x={0} y={60} width={200} height={290} fill={WOOD} stroke={INK} strokeWidth={6} />
        <path d="M-25 70 L100 0 L225 70 Z" fill={SNOW} stroke={INK} strokeWidth={6} />
        <rect x={20} y={100} width={160 * deur} height={240} fill={WOOD_D} stroke={INK} strokeWidth={5} />
        <path d="M85 130 l15 -20 l15 20 l-15 20 Z" fill={LIGHT} stroke={INK} strokeWidth={3} />
      </g>
      {!binnen && <Kaartspeld pose="walk" stap={f * 1.8} x={x} y={820 - 330} scale={1.15} />}
      {binnen && <text x={1520} y={420} textAnchor="middle" fontFamily="Lilita One" fontSize={72} fill={C.paper} stroke={INK} strokeWidth={8} paintOrder="stroke">brrr...</text>}
      <Sneeuwval n={60} />
    </svg>
  );
};

// ---------- ijsblokken uit de rivier ----------
export const IjsScene: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const n = Math.min(6, Math.floor(interpolate(f, [10, dur - 10], [0, 6.99], clamp)));
  const zaag = Math.sin(f / 3) * 30;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="dag" id="ij" />
      <Bergen />
      <rect x={-50} y={600} width={W + 100} height={500} fill={ICE} />
      {[[200, 700, 500, 760], [900, 660, 1300, 720], [1400, 820, 1800, 860]].map((l, k) => <path key={k} d={`M${l[0]} ${l[1]} L${(l[0] + l[2]) / 2} ${l[1] + 20} L${l[2]} ${l[3]}`} stroke="#8FBCD6" strokeWidth={5} fill="none" />)}
      <path d="M-50 600 Q960 570 1970 600" stroke={INK} strokeWidth={5} fill="none" />
      {/* gat + zager */}
      <rect x={560} y={760} width={260} height={90} fill="#3B6E8F" stroke={INK} strokeWidth={5} />
      <Kaartspeld pose="carry" stap={f} x={430} y={860 - 300} scale={1.05} />
      <line x1={560 + zaag} y1={700} x2={620 + zaag} y2={830} stroke="#8A8A8A" strokeWidth={10} strokeLinecap="round" />
      <Kaartspeld pose="carry" stap={f + 9} x={830} y={860 - 300} scale={1.05} kleur={C.blue} />
      {/* slee met blokken */}
      <g transform="translate(1180 840)">
        <rect x={0} y={0} width={520} height={30} rx={10} fill={WOOD} stroke={INK} strokeWidth={5} />
        <path d="M-20 40 Q0 60 40 50 L520 50 Q560 50 560 20" stroke={INK} strokeWidth={6} fill="none" />
        {Array.from({length: n}).map((_, i) => (
          <rect key={i} x={10 + (i % 3) * 170} y={-130 - Math.floor(i / 3) * 130} width={160} height={125} rx={10} fill="#BFE6FA" stroke={INK} strokeWidth={5} opacity={0.95} />
        ))}
      </g>
      <Sneeuwval n={30} />
    </svg>
  );
};

// ---------- markt met bevroren vis ----------
const Vis: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M0 0 Q18 -60 0 -130 Q-18 -60 0 0 Z" fill="#C8D3DC" stroke={INK} strokeWidth={4} />
    <path d="M0 -125 l-16 -22 l32 0 Z" fill="#C8D3DC" stroke={INK} strokeWidth={4} transform="rotate(180 0 -128)" />
    <circle cx={4} cy={-20} r={3} fill={INK} />
  </g>
);
export const MarktScene: React.FC = () => {
  const f = useCurrentFrame();
  const kraam = (x: number, kleur: string) => (
    <g transform={`translate(${x} 470)`}>
      <path d="M-20 0 L460 0 L420 -70 L20 -70 Z" fill={kleur} stroke={INK} strokeWidth={6} />
      <line x1={20} y1={0} x2={20} y2={330} stroke={INK} strokeWidth={8} />
      <line x1={420} y1={0} x2={420} y2={330} stroke={INK} strokeWidth={8} />
      <rect x={0} y={220} width={440} height={30} fill={WOOD} stroke={INK} strokeWidth={5} />
      {[60, 200, 330].map((bx) => (
        <g key={bx}>
          <Vis x={bx - 15} y={215} r={-6} /><Vis x={bx + 15} y={215} r={7} /><Vis x={bx} y={215} />
          <path d={`M${bx - 50} 150 L${bx + 50} 150 L${bx + 40} 220 L${bx - 40} 220 Z`} fill="#7D8C99" stroke={INK} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="dag" id="ma" />
      <Bergen />
      <Grond y={800} />
      {kraam(140, C.blue)}
      {kraam(1120, C.orange)}
      <Kaartspeld pose="cold" stap={f} x={330} y={800 - 330} scale={1.1} kleur={C.green} />
      <Kaartspeld pose="walk" stap={f} x={interpolate(f, [0, 200], [600, 860], clamp)} y={800 - 330} scale={1.15} />
      <Kaartspeld pose="cold" stap={f + 5} x={1320} y={800 - 330} scale={1.1} kleur={C.blue} />
      <Sneeuwval n={50} />
    </svg>
  );
};

// ---------- eten op tafel ----------
export const EtenScene: React.FC<{items: {woord: string; ding: 'stroganina' | 'vlees' | 'soep' | 'paard'}[]; at?: At}> = ({items, at = noAt}) => {
  const f = useCurrentFrame();
  const pos = [440, 820, 1200, 1560];
  const draw = (d: string) => {
    if (d === 'stroganina') return (
      <g>
        <ellipse cx={0} cy={0} rx={150} ry={50} fill="#fff" stroke={INK} strokeWidth={6} />
        {[-80, -40, 0, 40, 80].map((dx, k) => <path key={k} d={`M${dx - 20} 10 q20 -50 40 -10 q-10 -30 -30 -20`} fill="#F4D6DA" stroke={INK} strokeWidth={4} />)}
      </g>
    );
    if (d === 'soep') return (
      <g>
        <path d="M-130 -20 Q0 120 130 -20 Z" fill="#F7F4EE" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-20} rx={130} ry={30} fill="#C9884A" stroke={INK} strokeWidth={6} />
        <Rook x={0} y={-40} schaal={0.6} />
      </g>
    );
    if (d === 'paard') return (
      <g>
        <ellipse cx={0} cy={0} rx={150} ry={50} fill="#fff" stroke={INK} strokeWidth={6} />
        <path d="M-80 -10 Q-40 -60 20 -40 Q90 -40 80 0 Q0 20 -80 -10 Z" fill="#8E3B2E" stroke={INK} strokeWidth={5} />
      </g>
    );
    return (
      <g>
        <ellipse cx={0} cy={0} rx={150} ry={50} fill="#fff" stroke={INK} strokeWidth={6} />
        <path d="M-90 -10 Q-60 -70 10 -50 Q100 -60 90 0 Q0 25 -90 -10 Z" fill="#A0523D" stroke={INK} strokeWidth={5} />
        <path d="M-40 -40 Q0 -55 40 -40" stroke="#F2C9A8" strokeWidth={6} fill="none" />
      </g>
    );
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#E9D8A6" />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 170} y1={0} x2={i * 170} y2={600} stroke="#D9C48C" strokeWidth={6} />)}
      <Kaartspeld pose="stand" stap={f} x={60} y={250} scale={1.4} />
      <rect x={-20} y={600} width={W + 40} height={500} fill={WOOD} stroke={INK} strokeWidth={6} />
      {items.map((it, i) => {
        const t = at(it.woord);
        if (f < t) return null;
        const p = spring({frame: f - t, fps: 30, config: {damping: 12}});
        return <g key={i} transform={`translate(${pos[i % 4]} ${760 - (1 - p) * 120}) scale(${0.6 + 0.4 * p})`} opacity={Math.min(1, p * 2)}>{draw(it.ding)}</g>;
      })}
    </svg>
  );
};

// ---------- dieren ----------
const Paard: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[30, 70, 170, 210].map((lx, k) => <rect key={k} x={lx} y={60} width={26} height={90} rx={8} fill="#6E4B33" stroke={INK} strokeWidth={5} />)}
    <ellipse cx={130} cy={50} rx={130} ry={75} fill="#8A6244" stroke={INK} strokeWidth={6} />
    {Array.from({length: 10}).map((_, k) => <path key={k} d={`M${30 + k * 22} ${100} q6 18 0 30`} stroke="#5E412C" strokeWidth={4} fill="none" />)}
    <path d={`M230 10 Q280 -60 320 -40 Q350 -20 330 20 Q300 40 270 50 Z`} fill="#8A6244" stroke={INK} strokeWidth={6} transform={`rotate(${Math.sin(t / 20) * 4} 240 20)`} />
    <path d="M235 -10 Q260 -70 300 -50" stroke="#F1E7D6" strokeWidth={14} fill="none" strokeLinecap="round" />
    <circle cx={310} cy={-20} r={5} fill={INK} />
    <path d="M10 30 Q-30 60 -10 110" stroke="#F1E7D6" strokeWidth={14} fill="none" strokeLinecap="round" />
    <Rook x={345} y={10} richting={1} schaal={0.35} kleur="#fff" />
  </g>
);
const Koe: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[30, 70, 170, 210].map((lx, k) => <rect key={k} x={lx} y={60} width={26} height={90} rx={6} fill="#EEE" stroke={INK} strokeWidth={5} />)}
    <rect x={0} y={-30} width={260} height={130} rx={50} fill="#F4F1EC" stroke={INK} strokeWidth={6} />
    <path d="M40 -20 Q80 0 70 50 Q30 60 20 10 Z M150 0 Q200 -20 210 40 Q170 70 140 40 Z" fill={INK} />
    <ellipse cx={120} cy={110} rx={46} ry={26} fill={C.blue} stroke={INK} strokeWidth={5} />
    <path d="M80 104 L160 104" stroke="#fff" strokeWidth={5} strokeDasharray="10 8" />
    <g transform={`rotate(${Math.sin(t / 25) * 3} 260 0)`}>
      <rect x={250} y={-50} width={90} height={80} rx={30} fill="#F4F1EC" stroke={INK} strokeWidth={6} />
      <path d="M255 -45 l-20 -25 M335 -45 l20 -25" stroke={INK} strokeWidth={6} />
      <circle cx={300} cy={-20} r={5} fill={INK} />
    </g>
  </g>
);
const Hond: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[20, 50, 130, 160].map((lx, k) => <rect key={k} x={lx} y={40} width={20} height={70} rx={8} fill="#D9D2C5" stroke={INK} strokeWidth={5} />)}
    <ellipse cx={95} cy={30} rx={100} ry={50} fill="#E8E2D6" stroke={INK} strokeWidth={6} />
    <path d={`M0 20 Q-50 -40 -10 -50 Q10 -20 10 10`} fill="#E8E2D6" stroke={INK} strokeWidth={6} transform={`rotate(${Math.sin(t / 4) * 10} 5 15)`} />
    <g transform={`rotate(${Math.sin(t / 15) * 4} 180 0)`}>
      <ellipse cx={200} cy={-10} rx={52} ry={44} fill="#E8E2D6" stroke={INK} strokeWidth={6} />
      <path d="M170 -40 l5 -45 l25 30 Z M215 -45 l15 -42 l15 40 Z" fill="#9A9183" stroke={INK} strokeWidth={5} />
      <circle cx={215} cy={-15} r={5} fill={INK} /><circle cx={250} cy={0} r={8} fill={INK} />
    </g>
  </g>
);
export const DierenScene: React.FC<{dier: 'paard' | 'koe' | 'hond'}> = ({dier}) => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, 300], [0, -60], clamp);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="dag" id="di" />
      <Bergen />
      <Grond y={760} />
      {dier === 'koe' && (
        <g transform="translate(1250 360)">
          <rect x={0} y={80} width={520} height={340} fill={WOOD} stroke={INK} strokeWidth={6} />
          <path d="M-30 90 L260 -10 L550 90 Z" fill={SNOW} stroke={INK} strokeWidth={6} />
          <rect x={190} y={220} width={150} height={200} fill={WOOD_D} stroke={INK} strokeWidth={5} />
        </g>
      )}
      <g transform={`translate(${drift} 0)`}>
        {dier === 'paard' ? (
          <>
            <Paard x={220} y={640} s={1} t={f} />
            <Paard x={800} y={660} s={1.25} t={f + 30} />
            <Paard x={1400} y={650} s={0.9} t={f + 60} />
          </>
        ) : dier === 'koe' ? (
          <Koe x={400} y={690} s={1.4} t={f} />
        ) : (
          <>
            <Hond x={500} y={700} s={1.5} t={f} />
            <Hond x={1150} y={720} s={1.2} t={f + 20} />
            <Kaartspeld pose="stand" stap={f} x={1500} y={760 - 330} scale={1.15} />
          </>
        )}
      </g>
      <Sneeuwval n={50} />
    </svg>
  );
};

// ---------- doorsnede: permafrost + palen ----------
export const StelteScene: React.FC<{fase: 'grond' | 'buis' | 'dooi' | 'palen'}> = ({fase}) => {
  const f = useCurrentFrame();
  const gy = 520;
  const dooi = fase === 'dooi' || fase === 'palen' ? 120 : 0;
  const paal = fase === 'palen' ? interpolate(f, [10, 70], [0, 340], ease) : 0;
  const scheur = fase === 'buis' ? interpolate(f, [30, 70], [0, 1], clamp) : 0;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort={dooi ? 'zomer' : 'dag'} id="st" />
      <rect x={0} y={gy} width={W} height={H - gy} fill="#BFD9EC" />
      {Array.from({length: 40}).map((_, i) => <path key={i} d={`M${random(`px${i}`) * W} ${gy + 140 + random(`py${i}`) * 400} l14 -14 m-14 0 l14 14`} stroke="#8FB6D3" strokeWidth={4} />)}
      {dooi > 0 && <rect x={0} y={gy} width={W} height={dooi} fill="#8B6A4E" />}
      <line x1={0} y1={gy} x2={W} y2={gy} stroke={INK} strokeWidth={6} />
      {dooi > 0 && <line x1={0} y1={gy + dooi} x2={W} y2={gy + dooi} stroke={INK} strokeWidth={3} strokeDasharray="14 10" />}
      <text x={60} y={gy + (dooi ? 240 : 200)} fontFamily="Lilita One" fontSize={64} fill="#5E88A8">PERMAFROST</text>
      {fase === 'buis' && (
        <g>
          <rect x={300} y={gy + 120} width={1300} height={50} fill="#9AA3AD" stroke={INK} strokeWidth={5} />
          <path d={`M900 ${gy + 120} l20 ${25 * scheur} l-20 ${25 * scheur} l20 ${0}`} stroke={C.orange} strokeWidth={8} fill="none" opacity={scheur} />
          <path d={`M1250 ${gy + 120} l-18 ${25 * scheur} l18 ${25 * scheur}`} stroke={C.orange} strokeWidth={8} fill="none" opacity={scheur} />
        </g>
      )}
      <g transform={`translate(760 ${gy - 300 - (fase === 'palen' ? 60 : 0)})`}>
        {fase === 'palen' && [30, 200, 370].map((px) => <rect key={px} x={px} y={300} width={24} height={60 + paal} fill="#7D858F" stroke={INK} strokeWidth={4} />)}
        <rect x={0} y={60} width={400} height={240} fill={WOOD} stroke={INK} strokeWidth={6} />
        <path d="M-30 70 L200 -40 L430 70 Z" fill={dooi ? '#7E4A2E' : SNOW} stroke={INK} strokeWidth={6} />
        <rect x={50} y={120} width={90} height={70} fill={LIGHT} stroke={INK} strokeWidth={5} />
      </g>
      <Kaartspeld pose="point" stap={f} x={260} y={gy - 340} scale={1.15} />
    </svg>
  );
};

// ---------- vuur: grond ontdooien of auto opwarmen ----------
export const VuurScene: React.FC<{auto?: boolean}> = ({auto}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="schemer" id="vu" />
      <Bergen kleur="#8FA3BD" />
      <Grond y={820} />
      {auto ? (
        <>
          <Auto x={760} y={830} />
          <Vuur x={980} y={840} s={0.5} />
          <Kaartspeld pose="cold" stap={f} x={330} y={820 - 330} scale={1.15} />
        </>
      ) : (
        <>
          <Vuur x={960} y={850} s={1} />
          <line x1={1300} y1={640} x2={1360} y2={860} stroke={WOOD_D} strokeWidth={14} strokeLinecap="round" />
          <path d="M1340 850 l50 10 l-10 50 l-50 -10 Z" fill="#9AA3AD" stroke={INK} strokeWidth={5} />
          <Kaartspeld pose="cold" stap={f} x={420} y={820 - 330} scale={1.15} />
        </>
      )}
      <Sneeuwval n={40} />
    </svg>
  );
};

// ---------- warme bron (vroeger of nu) ----------
const Rendier: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[20, 50, 150, 180].map((lx, k) => <rect key={k} x={lx} y={50} width={18} height={100} rx={6} fill="#7A5A40" stroke={INK} strokeWidth={5} />)}
    <ellipse cx={100} cy={40} rx={110} ry={55} fill="#9A7656" stroke={INK} strokeWidth={6} />
    <path d="M190 10 Q230 -20 250 30 Q260 70 230 80 Q200 60 190 40 Z" fill="#9A7656" stroke={INK} strokeWidth={6} transform={`rotate(${30 + Math.sin(t / 20) * 6} 200 20)`} />
    <path d="M200 -10 l-20 -60 m10 30 l-25 -10 M220 -10 l20 -60 m-10 30 l25 -10" stroke="#5E412C" strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);
export const BronScene: React.FC<{vroeger?: boolean}> = ({vroeger}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={vroeger ? {filter: 'sepia(0.75) saturate(0.8)'} : undefined}>
      <Lucht soort="dag" id="br" />
      <Bergen />
      <Grond y={760} />
      <ellipse cx={980} cy={880} rx={420} ry={90} fill="#5FA3C9" stroke={INK} strokeWidth={6} />
      {[760, 960, 1160].map((rx, k) => <Rook key={k} x={rx} y={850} schaal={1.4} kleur="#F2F2F2" />)}
      {vroeger ? (
        <>
          <Rendier x={1300} y={690} s={1.1} t={f} />
          <Rendier x={1500} y={710} s={0.9} t={f + 40} />
          <Kaartspeld pose="walk" stap={f} x={interpolate(f, [0, 150], [60, 300], clamp)} y={760 - 330} scale={1.15} kleur="#8A6A4E" />
        </>
      ) : (
        <>
          <Koe x={1350} y={720} s={0.9} t={f} />
          <Kaartspeld pose="stand" stap={f} x={240} y={760 - 330} scale={1.15} />
        </>
      )}
      <Sneeuwval n={40} />
    </svg>
  );
};

// ---------- de weg (Kolyma) ----------
export const WegScene: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = f * 9;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="dag" id="we" />
      <g transform={`translate(${-(scroll * 0.2) % 1920} 0)`}><Bergen /><g transform="translate(1920 0)"><Bergen /></g></g>
      <rect x={0} y={640} width={W} height={440} fill={SNOW} />
      {Array.from({length: 14}).map((_, i) => {
        const x = ((i * 190 - scroll * 0.5) % 2660 + 2660) % 2660 - 300;
        return <path key={i} d={`M${x} 660 l60 -170 l60 170 Z M${x + 40} 560 l20 -60 l20 60`} fill="#4E7A5E" stroke={INK} strokeWidth={4} />;
      })}
      <rect x={-50} y={780} width={W + 100} height={150} fill="#C9C2B8" stroke={INK} strokeWidth={5} />
      {Array.from({length: 12}).map((_, i) => {
        const x = ((i * 220 - scroll) % 2640 + 2640) % 2640 - 300;
        return <rect key={i} x={x} y={850} width={110} height={12} fill={SNOW} />;
      })}
      {(() => {
        const sx = 2100 - ((scroll * 1) % 3000);
        return (
          <g transform={`translate(${sx} 560)`}>
            <line x1={0} y1={0} x2={0} y2={220} stroke={INK} strokeWidth={10} />
            <rect x={-150} y={-90} width={300} height={100} rx={12} fill={C.green} stroke={INK} strokeWidth={6} />
            <text x={0} y={-25} textAnchor="middle" fontFamily="Lilita One" fontSize={50} fill={C.paper}>R504 KOLYMA</text>
          </g>
        );
      })()}
      <g transform={`translate(700 ${845 + Math.sin(f / 2) * 2})`}>
        <Rook x={-20} y={-30} richting={-1} schaal={0.8} kleur="#EEE" />
        <rect x={0} y={-200} width={360} height={170} rx={10} fill={C.blue} stroke={INK} strokeWidth={6} />
        <path d="M360 -170 L460 -170 L500 -100 L500 -30 L360 -30 Z" fill={C.orange} stroke={INK} strokeWidth={6} />
        <path d="M380 -155 L450 -155 L478 -105 L380 -105 Z" fill="#CFE3F3" stroke={INK} strokeWidth={4} />
        {[70, 270, 430].map((wx) => <circle key={wx} cx={wx} cy={-20} r={38} fill={INK} />)}
      </g>
      <Sneeuwval n={60} />
    </svg>
  );
};

// ---------- zomer ----------
export const ZomerScene: React.FC<{len?: number}> = () => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Lucht soort="zomer" id="zm" />
      <circle cx={1550} cy={200} r={110} fill={LIGHT} stroke={INK} strokeWidth={6} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + f / 60;
        return <line key={i} x1={1550 + 135 * Math.cos(a)} y1={200 + 135 * Math.sin(a)} x2={1550 + 175 * Math.cos(a)} y2={200 + 175 * Math.sin(a)} stroke={LIGHT} strokeWidth={10} strokeLinecap="round" />;
      })}
      <path d="M-100 640 L250 380 L480 540 L760 320 L1020 560 L1300 400 L1600 560 L1820 360 L2100 640 Z" fill="#6E9A6A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Grond y={780} kleur="#8CC07A" />
      <path d="M-50 980 Q500 900 960 960 T2000 940" stroke="#5FA3C9" strokeWidth={60} fill="none" />
      <Huis x={1150} y={500} s={0.9} rook={false} dak="#7E4A2E" />
      {Array.from({length: 18}).map((_, i) => (
        <g key={i} transform={`translate(${random(`fx${i}`) * W} ${800 + random(`fy${i}`) * 60})`}>
          <line x1={0} y1={0} x2={0} y2={-24} stroke="#3D6B3D" strokeWidth={4} />
          <circle cx={0} cy={-28} r={9} fill={[C.orange, LIGHT, '#E58FB0'][i % 3]} stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <Kaartspeld pose="wave" stap={f} x={480} y={780 - 340} scale={1.2} />
      {Array.from({length: 8}).map((_, i) => <circle key={i} cx={620 + Math.sin(f / 4 + i) * 90 + i * 12} cy={420 + Math.cos(f / 5 + i * 2) * 60} r={4} fill={INK} />)}
    </svg>
  );
};

// ---------- kapotte spullen ----------
export const KapotScene: React.FC<{ding: 'pen' | 'telefoon'}> = ({ding}) => {
  const f = useCurrentFrame();
  const batt = interpolate(f, [15, 90], [100, 0], clamp);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id="vig"><stop offset="0.55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#DDF0FF" stopOpacity="0.95" /></radialGradient>
      </defs>
      <Lucht soort="dag" id="ka" />
      {ding === 'pen' ? (
        <g transform="translate(960 540) rotate(-30)">
          <rect x={-420} y={-40} width={700} height={80} rx={30} fill={C.blue} stroke={INK} strokeWidth={8} />
          <path d="M280 -40 L420 0 L280 40 Z" fill="#E7E2DA" stroke={INK} strokeWidth={8} />
          <path d="M400 -6 L420 0 L400 6 Z" fill={INK} />
          {[-300, -150, 0, 150].map((x) => <path key={x} d={`M${x} 40 l15 ${60 + (x % 3) * 10} l15 -${60 + (x % 3) * 10}`} fill="#E6F6FF" stroke="#9CC8E0" strokeWidth={4} />)}
        </g>
      ) : (
        <g transform="translate(960 540)">
          <rect x={-200} y={-380} width={400} height={760} rx={50} fill={INK} />
          <rect x={-175} y={-340} width={350} height={680} rx={24} fill={batt > 2 ? '#2F6FB5' : '#000'} />
          {batt > 2 && (
            <g>
              <rect x={-110} y={-60} width={200} height={110} rx={14} fill="none" stroke="#fff" strokeWidth={10} />
              <rect x={90} y={-25} width={20} height={40} fill="#fff" />
              <rect x={-98} y={-48} width={176 * batt / 100} height={86} fill={batt > 25 ? '#4E9A6B' : '#E8622C'} />
              <text x={0} y={140} textAnchor="middle" fontFamily="Lilita One" fontSize={90} fill="#fff">{Math.round(batt)}%</text>
            </g>
          )}
        </g>
      )}
      <rect width={W} height={H} fill="url(#vig)" />
      <Sneeuwval n={50} />
    </svg>
  );
};
