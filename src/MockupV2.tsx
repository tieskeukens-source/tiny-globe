import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from './brand';
import {Kaartspeld} from './components/Kaartspeld';
import './components/Scenes';

const INK = C.ink;
const bel = (x: number, y: number, w: number, tekst: string, kleur: string, puntLinks: boolean) => (
  <g>
    <rect x={x} y={y} width={w} height={110} rx={28} fill="#fff" stroke={INK} strokeWidth={5} />
    <path d={puntLinks ? `M${x + 50} ${y + 110} L${x + 20} ${y + 150} L${x + 85} ${y + 110} Z` : `M${x + w - 50} ${y + 110} L${x + w - 20} ${y + 150} L${x + w - 85} ${y + 110} Z`} fill="#fff" stroke={INK} strokeWidth={5} />
    <foreignObject x={x + 20} y={y + 14} width={w - 40} height={82}>
      <div style={{fontFamily: 'Lilita One', fontSize: 30, color: kleur, lineHeight: 1.05}}>{tekst}</div>
    </foreignObject>
  </g>
);

export const MockupV2: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#5F8FC4, #CFE3F3)'}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <path d="M-100 820 Q900 760 1900 820 L1900 1080 L-100 1080 Z" fill="#fff" stroke={INK} strokeWidth={8} />
      <Kaartspeld pose="point" x={220} y={560} scale={2.1} kleur={C.orange} />
      <Kaartspeld pose="wave" x={820} y={610} scale={1.7} kleur={C.blue} />
      <Kaartspeld pose="shrug" x={1340} y={630} scale={1.55} kleur={C.green} spiegel />
      {bel(140, 230, 480, "Wait... people actually LIVE here?!", C.orange, false)}
      {bel(760, 170, 480, "Yep. For centuries.", C.blue, true)}
      {bel(1300, 260, 520, "I wouldn't last a day.", C.green, true)}
    </svg>
    <div style={{position: 'absolute', left: 60, top: 1000, fontFamily: 'Lilita One', fontSize: 34, color: '#fff', textShadow: '3px 3px 0 #1B1B1F'}}>
      Host (orange) — Local (blue) — Skeptic (green)
    </div>
  </AbsoluteFill>
);
