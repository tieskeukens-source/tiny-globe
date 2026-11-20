import React, {useMemo} from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoInterpolate, geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import countriesTopo from 'world-atlas/countries-50m.json';
import {C, W, H} from '../brand';
import {Kaartspeld} from './Kaartspeld';

const INK = C.ink;
const WOOD = '#A8643C';
const WOOD_D = '#7E4A2E';
const LIGHT = '#F6C453';
const SNOW = '#FFFFFF';
const SNOW_S = '#DCE6F0';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = {easing: Easing.inOut(Easing.cubic), ...clamp};

// ---------- kleine bouwstenen ----------
const Sneeuwval: React.FC<{n?: number; kleur?: string}> = ({n = 90, kleur = SNOW}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x0 = random(`sx${i}`) * (W + 200) - 100;
        const sp = 1.2 + random(`sv${i}`) * 2.2;
        const r = 2 + random(`sr${i}`) * 4;
        const y = ((random(`sy${i}`) * H + f * sp) % (H + 40)) - 20;
        const x = x0 + Math.sin(f / 30 + i) * 14;
        return <circle key={i} cx={x} cy={y} r={r} fill={kleur} opacity={0.85} />;
      })}
    </g>
  );
};

const Rook: React.FC<{x: number; y: number; richting?: number; schaal?: number; kleur?: string}> = ({x, y, richting = 0, schaal = 1, kleur = '#EAE6E0'}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({length: 7}).map((_, k) => {
        const ph = ((f + k * 11) % 77) / 77;
        const px = x + richting * ph * 170 * schaal + Math.sin(ph * 6 + k) * 10 * schaal + (richting === 0 ? ph * 40 * schaal : 0);
        const py = y - (richting === 0 ? ph * 180 : ph * 50) * schaal;
        return <circle key={k} cx={px} cy={py} r={(12 + ph * 30) * schaal} fill={kleur} opacity={(1 - ph) * 0.8} />;
      })}
    </g>
  );
};

const Huis: React.FC<{x: number; y: number; s?: number; rook?: boolean}> = ({x, y, s = 1, rook = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {rook && <Rook x={205} y={-30} />}
    <rect x={190} y={-40} width={34} height={90} fill={WOOD_D} stroke={INK} strokeWidth={5} />
    <rect x={0} y={60} width={300} height={190} fill={WOOD} stroke={INK} strokeWidth={6} />
    {[90, 130, 170, 210].map((yy) => <line key={yy} x1={0} y1={yy} x2={300} y2={yy} stroke={WOOD_D} strokeWidth={4} />)}
    <path d="M-30 70 L150 -20 L330 70 Z" fill={SNOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={40} y={110} width={70} height={60} fill={LIGHT} stroke={INK} strokeWidth={5} />
    <line x1={75} y1={110} x2={75} y2={170} stroke={INK} strokeWidth={4} />
    <rect x={180} y={150} width={70} height={100} fill={WOOD_D} stroke={INK} strokeWidth={5} />
  </g>
);

const Auto: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  const tril = Math.sin(f * 2.2) * 1.2;
  return (
    <g transform={`translate(${x} ${y + tril})`}>
      <Rook x={385} y={-38} richting={1} schaal={0.8} kleur="#F1EEEA" />
      <path d="M20 -60 L80 -140 L250 -140 L300 -60 Z" fill={C.blue} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M95 -126 L150 -126 L150 -66 L50 -66 Z" fill="#CFE3F3" stroke={INK} strokeWidth={5} />
      <path d="M170 -126 L240 -126 L280 -66 L170 -66 Z" fill="#CFE3F3" stroke={INK} strokeWidth={5} />
      <rect x={0} y={-70} width={380} height={70} rx={14} fill={C.blue} stroke={INK} strokeWidth={6} />
      <rect x={380} y={-30} width={16} height={10} fill={INK} />
      <path d="M80 -140 L250 -140 L245 -150 L90 -150 Z" fill={SNOW} stroke={INK} strokeWidth={4} />
      <rect x={-6} y={-55} width={22} height={18} rx={4} fill={LIGHT} stroke={INK} strokeWidth={4} />
      {[80, 300].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy={0} r={40} fill={INK} />
          <circle cx={wx} cy={0} r={16} fill="#9AA3AD" />
        </g>
      ))}
    </g>
  );
};

const Badge: React.FC<{x: number; y: number; tekst: string; delay: number; kleur?: string}> = ({x, y, tekst, delay, kleur = C.blue}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - delay, fps, config: {damping: 12}});
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 1.5)}>
      <rect x={-210} y={-70} width={420} height={140} rx={28} fill={C.paper} stroke={INK} strokeWidth={6} />
      <text x={0} y={30} textAnchor="middle" fontFamily="Lilita One" fontSize={84} fill={kleur}>{tekst}</text>
    </g>
  );
};

// ---------- scène 1: reis over de kaart ----------
export const ReisScene: React.FC<{van: [number, number]; naar: [number, number]; vanNaam: string; naarNaam: string; badge?: string; dur: number}> = ({van, naar, vanNaam, naarNaam, badge, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {paths, route, a, b} = useMemo(() => {
    const proj = geoNaturalEarth1().rotate([-95, 0]).fitExtent([[60, 60], [W - 60, H - 60]], {type: 'MultiPoint', coordinates: [[20, 38], [175, 38], [20, 77], [175, 77], [95, 80]]} as any);
    const gen = geoPath(proj);
    const fc: any = feature(countriesTopo as any, (countriesTopo as any).objects.countries);
    const ip = geoInterpolate(van, naar);
    const route = Array.from({length: 81}).map((_, i) => proj(ip(i / 80)) as [number, number]);
    return {
      paths: fc.features.map((ft: any) => ({id: String(ft.properties.name), d: gen(ft) || ''})),
      route, a: proj(van) as [number, number], b: proj(naar) as [number, number],
    };
  }, [van[0], van[1], naar[0], naar[1]]);
  const t0 = Math.round(dur * 0.12), t1 = Math.round(dur * 0.72);
  const prog = interpolate(f, [t0, t1], [0, 1], ease);
  const idx = prog * 80;
  const i0 = Math.floor(idx), fr = idx - i0;
  const p0 = route[Math.min(i0, 80)], p1 = route[Math.min(i0 + 1, 80)];
  const cx = p0[0] + (p1[0] - p0[0]) * fr, cy = p0[1] + (p1[1] - p0[1]) * fr;
  const walking = f > t0 && f < t1;
  const zoom = interpolate(f, [0, dur], [1, 1.15], clamp);
  const pin = spring({frame: f - t1, fps, config: {damping: 10}});
  const trail = route.slice(0, Math.max(1, i0 + 1)).concat([[cx, cy]]);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#BFD6EA" />
      <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})`}>
        {paths.map((p: any) => (
          <path key={p.id} d={p.d} fill={p.id === 'Russia' ? '#F2B896' : C.sand} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        ))}
        <polyline points={trail.map((q) => q.join(',')).join(' ')} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
        <circle cx={a[0]} cy={a[1]} r={12} fill={INK} />
        <text x={a[0]} y={a[1] + 52} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={36} fill={INK} stroke={C.paper} strokeWidth={8} paintOrder="stroke">{vanNaam}</text>
        <g transform={`translate(${b[0]} ${b[1]}) scale(${pin})`}>
          <path d="M0 -70 C-26 -70 -34 -44 -24 -28 L0 0 L24 -28 C34 -44 26 -70 0 -70 Z" fill={C.orange} stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={-46} r={9} fill={C.paper} stroke={INK} strokeWidth={3} />
          <text x={0} y={52} textAnchor="middle" fontFamily="Lilita One" fontSize={54} fill={INK} stroke={C.paper} strokeWidth={10} paintOrder="stroke">{naarNaam}</text>
        </g>
        <Kaartspeld pose={walking ? 'walk' : f >= t1 ? 'point' : 'wave'} stap={f} x={cx - 100 - (f >= t1 ? 60 : 0)} y={cy - 283} scale={1} />
      </g>
      {badge && <Badge x={W / 2} y={150} tekst={badge} delay={t1 + 10} kleur={C.orange} />}
    </svg>
  );
};

// ---------- scène 2: het dorp in de kou ----------
export const DorpScene: React.FC<{badge?: string; dur: number}> = ({badge = '-50°C', dur}) => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [0, dur], [0, -140], clamp);
  const stop = Math.round(dur * 0.55);
  const cx = interpolate(f, [0, stop], [-80, 560], {...clamp, easing: Easing.out(Easing.quad)});
  const g = 830;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="lucht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9DB9D6" />
          <stop offset="1" stopColor="#F4DCC4" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#lucht)" />
      <circle cx={1500 + pan * 0.2} cy={560} r={90} fill="#F7B07A" opacity={0.9} />
      <g transform={`translate(${pan * 0.3} 0)`}>
        <path d="M-100 620 L200 380 L420 560 L640 330 L900 600 L1150 400 L1400 580 L1650 360 L2100 620 Z" fill="#B7C7D9" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M200 380 L250 420 L230 440 L170 404 Z M640 330 L700 380 L660 400 L600 362 Z M1650 360 L1710 410 L1670 420 L1610 392 Z" fill={SNOW} />
      </g>
      <g transform={`translate(${pan * 0.6} 0)`}>
        <rect x={-200} y={640} width={2600} height={300} fill={SNOW_S} />
        <Huis x={60} y={460} s={0.65} />
        <Huis x={420} y={480} s={0.55} />
        <Huis x={1480} y={455} s={0.65} />
        {[300, 900, 1350, 1900].map((px) => (
          <g key={px}><line x1={px} y1={470} x2={px} y2={650} stroke={WOOD_D} strokeWidth={8} /><line x1={px - 30} y1={490} x2={px + 30} y2={490} stroke={WOOD_D} strokeWidth={6} /></g>
        ))}
        <path d="M300 495 Q600 540 900 495 Q1125 540 1350 495 Q1625 540 1900 495" fill="none" stroke={INK} strokeWidth={3} />
      </g>
      <g transform={`translate(${pan} 0)`}>
        <path d={`M-200 ${g - 40} Q400 ${g - 70} 1000 ${g - 40} T2300 ${g - 40} L2300 ${H} L-200 ${H} Z`} fill={SNOW} stroke={INK} strokeWidth={5} />
        <Huis x={1560} y={g - 290} s={1.1} />
        <Auto x={900} y={g + 10} />
      </g>
      <Kaartspeld pose={f < stop ? 'walk' : 'cold'} stap={f} x={cx} y={g - 345} scale={1.25} />
      <Sneeuwval />
      <Badge x={W / 2 + 40} y={160} tekst={badge} delay={stop} />
    </svg>
  );
};

// ---------- scène 3: in het donker naar school ----------
export const SchoolScene: React.FC<{badge?: string; dur: number}> = ({badge, dur}) => {
  const f = useCurrentFrame();
  const g = 830;
  const stop = Math.round(dur * 0.7);
  const x = interpolate(f, [0, stop], [-200, 420], {...clamp, easing: Easing.out(Easing.quad)});
  const walking = f < stop;
  const band = (k: number, base: number, amp: number) => {
    const top: string[] = [], bot: string[] = [];
    for (let px = -40; px <= W + 40; px += 40) {
      const y = base + Math.sin(px / 260 + f / 45 + k) * amp + Math.sin(px / 90 + f / 25) * 8;
      top.push(`${px},${y}`); bot.unshift(`${px},${y + 150 + Math.sin(px / 180 + k) * 30}`);
    }
    return top.concat(bot).join(' ');
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="nacht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E1A33" />
          <stop offset="1" stopColor="#2A4466" />
        </linearGradient>
        <linearGradient id="aurora" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FE0A8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#4E9A6B" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="gloed">
          <stop offset="0" stopColor={LIGHT} stopOpacity="0.55" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#nacht)" />
      {Array.from({length: 70}).map((_, i) => (
        <circle key={i} cx={random(`st${i}`) * W} cy={random(`sy${i}`) * 520} r={1.5 + random(`ss${i}`) * 2.5} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 20 + i))} />
      ))}
      <polygon points={band(0, 120, 50)} fill="url(#aurora)" opacity={0.75} />
      <polygon points={band(2, 210, 40)} fill="url(#aurora)" opacity={0.45} />
      <path d={`M-100 640 L300 470 L600 610 L950 450 L1300 620 L1700 480 L2100 640 Z`} fill="#344E70" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={0} y={640} width={W} height={300} fill="#6C86A6" />
      <path d={`M-100 ${g - 40} Q600 ${g - 70} 1200 ${g - 40} T2100 ${g - 40} L2100 ${H} L-100 ${H} Z`} fill="#C9D6E3" stroke={INK} strokeWidth={5} />
      {/* school */}
      <g transform={`translate(1150 ${g - 420})`}>
        <circle cx={300} cy={260} r={420} fill="url(#gloed)" opacity={0.6} />
        <rect x={0} y={120} width={620} height={300} fill={WOOD} stroke={INK} strokeWidth={6} />
        <path d="M-40 130 L310 0 L660 130 Z" fill={SNOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[50, 200, 430].map((wx) => <rect key={wx} x={wx} y={190} width={110} height={80} fill={LIGHT} stroke={INK} strokeWidth={5} />)}
        <rect x={270} y={290} width={100} height={130} fill={WOOD_D} stroke={INK} strokeWidth={5} />
        <rect x={190} y={60} width={240} height={60} rx={8} fill={C.paper} stroke={INK} strokeWidth={5} />
        <text x={310} y={104} textAnchor="middle" fontFamily="Lilita One" fontSize={44} fill={INK}>SCHOOL</text>
      </g>
      {/* lantaarn */}
      <circle cx={1060} cy={480} r={200} fill="url(#gloed)" />
      <line x1={1060} y1={480} x2={1060} y2={g - 30} stroke={INK} strokeWidth={10} />
      <rect x={1038} y={460} width={44} height={36} rx={6} fill={LIGHT} stroke={INK} strokeWidth={5} />
      {/* volwassene + twee kinderen */}
      <Kaartspeld pose={walking ? 'walk' : 'point'} stap={f} x={x} y={g - 345} scale={1.2} />
      <Kaartspeld pose={walking ? 'walk' : 'stand'} stap={f + 7} x={x + 190} y={g - 245} scale={0.8} kleur={C.blue} />
      <Kaartspeld pose={walking ? 'walk' : 'wave'} stap={f + 14} x={x + 320} y={g - 245} scale={0.8} kleur={C.green} />
      <Sneeuwval n={50} />
      {badge && <Badge x={W / 2} y={150} tekst={badge} delay={stop} kleur={C.blue} />}
    </svg>
  );
};
