import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from './brand';
import {Kaartspeld} from './components/Kaartspeld';
import {Huis, Sneeuwval} from './components/Werelden';
import './components/Scenes'; // laadt de lettertypen

const INK = C.ink;
const tekstStijl = (kleur: string, size: number): React.CSSProperties => ({
  fontFamily: 'Lilita One', fontSize: size, color: kleur, lineHeight: 0.95,
  WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `10px 10px 0 ${INK}`,
});

export const Thumb: React.FC<{variant?: 'A' | 'B'}> = ({variant = 'A'}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#5F8FC4, #CFE3F3)'}}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
      <path d="M-100 760 L260 430 L560 680 L900 380 L1250 700 L1600 440 L2100 760 Z" fill="#8FB0D6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M260 430 L330 490 L290 510 L200 460 Z M900 380 L980 450 L930 470 L840 420 Z M1600 440 L1680 500 L1640 520 L1540 470 Z" fill="#fff" />
      <path d="M-100 800 Q700 740 1400 800 T2100 790 L2100 1080 L-100 1080 Z" fill="#fff" stroke={INK} strokeWidth={8} />
      <Huis x={1330} y={500} s={1.05} />
      <Huis x={1640} y={560} s={0.6} rook={false} />
      <g transform="translate(40 0)">
        <Kaartspeld pose="cold" stap={7} x={40} y={80} scale={3.6} />
        {[[110, 170], [160, 150], [215, 150], [265, 170]].map(([a, b], k) => null)}
      </g>
      <Sneeuwval n={60} />
    </svg>
    {variant === 'A' ? (
      <>
        <div style={{position: 'absolute', left: 760, top: 80, ...tekstStijl('#fff', 250)}}>-67.7°C</div>
        <div style={{position: 'absolute', left: 800, top: 390, ...tekstStijl(C.orange, 170)}}>LIVE<br />HERE?</div>
      </>
    ) : (
      <>
        <div style={{position: 'absolute', left: 800, top: 80, ...tekstStijl('#fff', 210)}}>COLDEST</div>
        <div style={{position: 'absolute', left: 800, top: 300, ...tekstStijl(C.orange, 210)}}>VILLAGE</div>
      </>
    )}
  </AbsoluteFill>
);
