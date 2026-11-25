import React from 'react';
import {C} from '../brand';

export type Pose = 'stand' | 'walk' | 'point' | 'wave' | 'think' | 'shrug' | 'cold' | 'carry';

// Armen/benen als [x1,y1,x2,y2] lijnen in een 200x300 vak (hoofd = kaartspeld)
// v2: kleiner lijf, kortere benen, groter hoofd -> schouders/heupen omhoog
const POSES: Record<Pose, {armL: number[]; armR: number[]; legL: number[]; legR: number[]}> = {
  stand: {armL: [100,128,74,162], armR: [100,128,126,162], legL: [100,168,84,230], legR: [100,168,116,230]},
  walk:  {armL: [100,128,78,159], armR: [100,128,126,154], legL: [100,168,78,226], legR: [100,168,130,223]},
  point: {armL: [100,128,74,162], armR: [100,128,178,108], legL: [100,168,84,230], legR: [100,168,116,230]},
  wave:  {armL: [100,128,74,162], armR: [100,128,163,78], legL: [100,168,84,230], legR: [100,168,116,230]},
  think: {armL: [100,128,74,162], armR: [100,128,136,100], legL: [100,168,84,230], legR: [100,168,116,230]},
  shrug: {armL: [100,128,62,132], armR: [100,128,140,132], legL: [100,168,84,230], legR: [100,168,116,230]},
  cold:  {armL: [100,124,113,152], armR: [100,124,87,152], legL: [100,168,90,230], legR: [100,168,110,230]},
  carry: {armL: [100,128,78,150], armR: [100,128,122,150], legL: [100,168,84,230], legR: [100,168,116,230]},
};

type Mood = {browL: number; browR: number; mouth: 'smile' | 'flat' | 'open' | 'wobble' | 'smirk'};
const MOOD: Record<Pose, Mood> = {
  stand: {browL: 0, browR: 0, mouth: 'smile'},
  walk: {browL: 0, browR: 0, mouth: 'smile'},
  point: {browL: 0, browR: 0, mouth: 'open'},
  wave: {browL: 0, browR: 0, mouth: 'smile'},
  think: {browL: 3, browR: -3, mouth: 'flat'},
  shrug: {browL: -3, browR: 3, mouth: 'smirk'},
  cold: {browL: 3, browR: 3, mouth: 'wobble'},
  carry: {browL: 2, browR: 2, mouth: 'flat'},
};

const Gezicht: React.FC<{pose: Pose; look: number}> = ({pose, look}) => {
  const m = MOOD[pose];
  const mouth = {
    smile: <path d="M88 64 Q100 76 112 64" />,
    flat: <path d="M90 67 L110 67" />,
    open: <ellipse cx={100} cy={67} rx={6} ry={7} fill={C.ink} />,
    wobble: <path d="M88 68 Q93 62 98 68 T108 68 T112 68" />,
    smirk: <path d="M90 67 Q104 70 112 62" />,
  }[m.mouth];
  return (
    <g stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" fill="none">
      <line x1={86} y1={42 + m.browL} x2={96} y2={42 - m.browL / 2} />
      <line x1={104} y1={42 - m.browR / 2} x2={114} y2={42 + m.browR} />
      <circle cx={91 + look} cy={52} r={4.5} fill={C.ink} stroke="none" />
      <circle cx={109 + look} cy={52} r={4.5} fill={C.ink} stroke="none" />
      {mouth}
    </g>
  );
};

export const Kaartspeld: React.FC<{pose?: Pose; x?: number; y?: number; scale?: number; look?: number; stap?: number; kleur?: string; spiegel?: boolean}> = ({
  pose = 'stand', x = 0, y = 0, scale = 1, look = 0, stap, kleur = C.orange, spiegel = false,
}) => {
  let p = POSES[pose];
  let bob = 0;
  if (pose === 'walk' && stap !== undefined) {
    const w = Math.sin(stap * 0.32);
    p = {armL: [100,128,100 - 24 * w,160], armR: [100,128,100 + 24 * w,160], legL: [100,168,100 + 26 * w,228], legR: [100,168,100 - 26 * w,228]};
    bob = -Math.abs(w) * 6;
  }
  if (pose === 'cold' && stap !== undefined) bob = 0;
  const shiver = pose === 'cold' && stap !== undefined ? Math.sin(stap * 1.7) * 2.5 : 0;
  const line = (a: number[]) => <line x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} />;
  return (
    <g transform={`translate(${x + shiver} ${y + bob * scale}) scale(${scale})${spiegel ? ' translate(200 0) scale(-1 1)' : ''}`}>
      <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
        <line x1={100} y1={108} x2={100} y2={168} />
        {line(p.armL)}{line(p.armR)}{line(p.legL)}{line(p.legR)}
      </g>
      <path d="M100 0 C58 0 46 38 60 64 L100 108 L140 64 C154 38 142 0 100 0 Z" fill={kleur} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={100} cy={40} r={38} fill="#fff" stroke={C.ink} strokeWidth={4} />
      <g transform="translate(100 40) scale(1.55) translate(-100 -56)"><Gezicht pose={pose} look={look} /></g>
    </g>
  );
};
