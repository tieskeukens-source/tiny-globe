import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from './brand';
import {Kaartspeld} from './components/Kaartspeld';
import {Sneeuwval} from './components/Werelden';
import './components/Scenes';

const INK = C.ink;
const tekst = (kleur: string, size: number): React.CSSProperties => ({
  fontFamily: 'Lilita One', fontSize: size, color: kleur, lineHeight: 0.95, whiteSpace: 'nowrap',
  WebkitTextStroke: `${size * 0.09}px ${INK}`, paintOrder: 'stroke fill', textShadow: `${size * 0.05}px ${size * 0.05}px 0 ${INK}`,
});

const Globe: React.FC<{cx: number; cy: number; r: number; fill?: string; line?: string}> = ({cx, cy, r, fill = C.blue, line = '#ffffff55'}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={INK} strokeWidth={r * 0.04} />
    {[0.35, 0.7].map((k) => <ellipse key={k} cx={cx} cy={cy} rx={r * k} ry={r} fill="none" stroke={line} strokeWidth={r * 0.015} />)}
    {[-0.5, 0, 0.5].map((k) => <line key={k} x1={cx - r * Math.sqrt(1 - k * k)} x2={cx + r * Math.sqrt(1 - k * k)} y1={cy + r * k} y2={cy + r * k} stroke={line} strokeWidth={r * 0.015} />)}
    <path d={`M${cx - r * 0.55} ${cy - r * 0.35} q${r * 0.25} ${-r * 0.3} ${r * 0.5} ${-r * 0.05} q${r * 0.2} ${r * 0.3} ${-r * 0.1} ${r * 0.5} q${-r * 0.3} ${r * 0.1} ${-r * 0.4} ${-r * 0.45}z`} fill={C.green} />
    <path d={`M${cx + r * 0.1} ${cy + r * 0.2} q${r * 0.3} ${-r * 0.2} ${r * 0.45} ${r * 0.1} q${-r * 0.05} ${r * 0.35} ${-r * 0.3} ${r * 0.4} q${-r * 0.25} ${-r * 0.1} ${-r * 0.15} ${-r * 0.5}z`} fill={C.green} />
  </g>
);

export const Profiel: React.FC<{v?: 'A' | 'B' | 'C'}> = ({v = 'A'}) => (
  <AbsoluteFill style={{background: v === 'A' ? C.orange : v === 'B' ? C.sand : C.blue}}>
    <svg width={1000} height={1000} viewBox="0 0 1000 1000">
      {v === 'A' && <Kaartspeld pose="wave" x={-210} y={-40} scale={7} kleur={C.paper} />}
      {v === 'B' && (<>
        <Globe cx={500} cy={700} r={320} />
        <Kaartspeld pose="stand" x={0} y={20} scale={5} />
      </>)}
      {v === 'C' && (<>
        <Globe cx={500} cy={500} r={470} fill={C.blue} />
        <Kaartspeld pose="point" x={-100} y={10} scale={6} />
      </>)}
    </svg>
  </AbsoluteFill>
);

export const Banner: React.FC<{v?: 'A' | 'B' | 'C'}> = ({v = 'A'}) => (
  <AbsoluteFill style={{background: v === 'A' ? 'linear-gradient(#5F8FC4, #CFE3F3)' : v === 'B' ? C.orange : C.sand}}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{position: 'absolute'}}>
      {v === 'A' && (<>
        <path d="M-100 1000 L400 560 L800 900 L1250 520 L1700 920 L2150 580 L2700 1000 Z" fill="#8FB0D6" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        <path d="M-100 1050 Q900 960 1800 1050 T2700 1030 L2700 1500 L-100 1500 Z" fill="#fff" stroke={INK} strokeWidth={10} />
        <Kaartspeld pose="wave" x={560} y={525} scale={1.2} />
        <Sneeuwval n={90} />
      </>)}
      {v === 'B' && (<>
        <Globe cx={2380} cy={760} r={470} fill="#2F6FB5" />
        <Globe cx={140} cy={760} r={380} fill="#2F6FB5" />
        <Kaartspeld pose="walk" stap={4} x={560} y={525} scale={1.2} />
      </>)}
      {v === 'C' && (<>
        <g transform="translate(0 90)"><path d="M200 1100 C 700 900, 900 1250, 1400 1000 S 2100 900, 2380 1150" fill="none" stroke={INK} strokeWidth={10} strokeDasharray="6 30" strokeLinecap="round" />
        {[[320, 1085], [1050, 1075], [1760, 940], [2330, 1135]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C -40 -50, -40 -110, 0 -110 C 40 -110, 40 -50, 0 0Z" fill={C.orange} stroke={INK} strokeWidth={8} />
            <circle cx={0} cy={-75} r={14} fill="#fff" />
          </g>
        ))}</g>
        <Kaartspeld pose="point" x={560} y={525} scale={1.2} />
      </>)}
    </svg>
    <div style={{position: 'absolute', left: 850, top: 575, ...tekst('#fff', 200)}}>TINY GLOBE</div>
    <div style={{position: 'absolute', left: 860, top: 780, ...tekst(v === 'C' ? C.orange : C.sand, 70)}}>THE WORLD, EXPLAINED SIMPLY</div>
  </AbsoluteFill>
);
