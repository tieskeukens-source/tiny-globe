import React from 'react';
import {C} from '../brand';

export type Pose = 'stand' | 'walk' | 'point' | 'wave' | 'think' | 'shrug' | 'cold' | 'carry';

// Armen/benen als [x1,y1,x2,y2] lijnen in een 200x300 vak (hoofd = kaartspeld)
const POSES: Record<Pose, {armL: number[]; armR: number[]; legL: number[]; legR: number[]}> = {
  stand: {armL: [100,145,70,190], armR: [100,145,130,190], legL: [100,200,80,285], legR: [100,200,120,285]},
  walk:  {armL: [100,145,75,185], armR: [100,145,130,180], legL: [100,200,72,280], legR: [100,200,135,275]},
  point: {armL: [100,145,70,190], armR: [100,145,185,120], legL: [100,200,80,285], legR: [100,200,120,285]},
  wave:  {armL: [100,145,70,190], armR: [100,145,170,85], legL: [100,200,80,285], legR: [100,200,120,285]},
  think: {armL: [100,145,70,190], armR: [100,145,140,110], legL: [100,200,80,285], legR: [100,200,120,285]},
  shrug: {armL: [100,145,55,150], armR: [100,145,145,150], legL: [100,200,80,285], legR: [100,200,120,285]},
  cold:  {armL: [100,140,115,175], armR: [100,140,85,175], legL: [100,200,88,285], legR: [100,200,112,285]},
  carry: {armL: [100,145,75,170], armR: [100,145,125,170], legL: [100,200,80,285], legR: [100,200,120,285]},
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

export const Kaartspeld: React.FC<{pose?: Pose; x?: number; y?: number; scale?: number; look?: number}> = ({
  pose = 'stand', x = 0, y = 0, scale = 1, look = 0,
}) => {
  const p = POSES[pose];
  const line = (a: number[]) => <line x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
        <line x1={100} y1={120} x2={100} y2={200} />
        {line(p.armL)}{line(p.armR)}{line(p.legL)}{line(p.legR)}
      </g>
      <path d="M100 18 C66 18 56 50 68 72 L100 120 L132 72 C144 50 134 18 100 18 Z" fill={C.orange} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={100} cy={54} r={30} fill="#fff" stroke={C.ink} strokeWidth={4} />
      <g transform="translate(100 54) scale(1.25) translate(-100 -56)"><Gezicht pose={pose} look={look} /></g>
    </g>
  );
};
