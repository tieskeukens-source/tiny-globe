// THE BLOCK channel branding: profile picture (1000x1000, circle-safe) + banner (2560x1440, safe band 1546x423 centred).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Guy, InkDefs, Who, Pose} from './chars';
import {BANG, MARK} from './fonts';

const INK = '#141210';
const Brick: React.FC<{w: number; h: number}> = ({w, h}) => (
  <>
    <defs>
      <pattern id="bb" width={92} height={40} patternUnits="userSpaceOnUse">
        <rect width={92} height={40} fill="#6e3f3b" />
        <path d="M0,0 H92 M0,20 H92 M0,40 H92 M46,0 V20 M0,20 V40 M92,20 V40" stroke="#4e2a27" strokeWidth={4} />
        <rect x={6} y={4} width={30} height={8} fill="#7d4a45" />
      </pattern>
      <radialGradient id="spot" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#ffb54a" stopOpacity={0.35} /><stop offset="1" stopColor="#000" stopOpacity={0.45} /></radialGradient>
    </defs>
    <rect width={w} height={h} fill="url(#bb)" />
    <rect width={w} height={h} fill="url(#spot)" />
  </>
);

const Head: React.FC<{who: Who; x: number; y: number; w: number; pose?: Pose; vb?: string}> = ({who, x, y, w, pose = {}, vb = '20 -110 560 620'}) => (
  <svg x={x} y={y} width={w} height={w * 620 / 560} viewBox={vb} overflow="visible">
    <g filter="url(#wob)"><Guy who={who} legs={false} pose={pose} /></g>
  </svg>
);

export const BlockPfp: React.FC = () => (
  <AbsoluteFill style={{background: '#ffd24a'}}>
    <svg width={1000} height={1000} viewBox="0 0 1000 1000">
      <InkDefs seed={2} />
      <defs><pattern id="ht" width={36} height={36} patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx={18} cy={18} r={8} fill="#f2b632" /></pattern></defs>
      <rect width={1000} height={1000} fill="url(#ht)" />
      <circle cx={500} cy={500} r={430} fill="#d8352c" stroke={INK} strokeWidth={16} />
      <Head who="dre" x={140} y={130} w={720} pose={{eyes: 'calm', look: 0.15}} vb="20 -60 560 720" />
    </svg>
  </AbsoluteFill>
);

export const BlockBanner: React.FC = () => (
  <AbsoluteFill>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <InkDefs seed={4} />
      <Brick w={2560} h={1440} />
      {/* safe band y 508-931: title in the mobile-safe middle, crew heads on the sides (desktop/TV) */}
      <g transform="rotate(-3 1280 720)">
        <text x={1280} y={735} textAnchor="middle" fontFamily={MARK} fontSize={190} fill="#ffd24a" stroke={INK} strokeWidth={18} paintOrder="stroke">THE BLOCK</text>
        <path d="M940,745 v38 M1330,750 v52 M1560,742 v28" stroke="#ffd24a" strokeWidth={9} strokeLinecap="round" />
      </g>
      <text x={1280} y={860} textAnchor="middle" fontFamily={BANG} fontSize={64} fill="#fdfbf5" stroke={INK} strokeWidth={9} paintOrder="stroke" letterSpacing={6}>3 MANDEM · 1 BLOCK · ZERO SENSE</text>
      <Head who="lou" x={110} y={545} w={370} pose={{eyes: 'side', look: 0.6}} />
      <Head who="fast" x={2060} y={560} w={330} pose={{eyes: 'wide', open: 0.7, look: -0.5}} />
      <Head who="dre" x={2280} y={575} w={300} pose={{eyes: 'calm', look: -0.7}} />
      <text x={600} y={1040} fontFamily={MARK} fontSize={70} fill="#e0412f" opacity={0.8} transform="rotate(-8 600 1040)">SE15</text>
      <text x={1980} y={470} textAnchor="end" fontFamily={MARK} fontSize={60} fill="#e0412f" opacity={0.8} transform="rotate(6 1980 470)">BLK</text>
      <rect width={2560} height={1440} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);
