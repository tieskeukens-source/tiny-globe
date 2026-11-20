import React from 'react';
import {C} from '../brand';

export type Pose = 'stand' | 'walk' | 'point' | 'wave' | 'think' | 'shrug' | 'cold' | 'carry';

// Armen/benen als [x1,y1,x2,y2] lijnen in een 200x300 vak (hoofd = kaartspeld)
const POSES: Record<Pose, {armL: number[]; armR: number[]; legL: number[]; legR: number[]}> = {
  stand: {armL: [100,135,70,190], armR: [100,135,130,190], legL: [100,200,80,285], legR: [100,200,120,285]},
  walk:  {armL: [100,135,75,185], armR: [100,135,130,180], legL: [100,200,72,280], legR: [100,200,135,275]},
  point: {armL: [100,135,70,190], armR: [100,135,185,120], legL: [100,200,80,285], legR: [100,200,120,285]},
  wave:  {armL: [100,135,70,190], armR: [100,135,150,70], legL: [100,200,80,285], legR: [100,200,120,285]},
  think: {armL: [100,135,70,190], armR: [100,135,118,100], legL: [100,200,80,285], legR: [100,200,120,285]},
  shrug: {armL: [100,135,55,150], armR: [100,135,145,150], legL: [100,200,80,285], legR: [100,200,120,285]},
  cold:  {armL: [100,140,115,175], armR: [100,140,85,175], legL: [100,200,88,285], legR: [100,200,112,285]},
  carry: {armL: [100,135,75,170], armR: [100,135,125,170], legL: [100,200,80,285], legR: [100,200,120,285]},
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
      <circle cx={100} cy={56} r={24} fill="#fff" stroke={C.ink} strokeWidth={4} />
      <circle cx={100 + look} cy={56} r={6} fill={C.ink} />
    </g>
  );
};
