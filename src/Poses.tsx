import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from './brand';
import {Kaartspeld, Pose} from './components/Kaartspeld';

const ALL: Pose[] = ['stand','walk','point','wave','think','shrug','cold','carry'];

export const Poses: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {ALL.map((p, i) => (
        <g key={p}>
          <Kaartspeld pose={p} x={80 + (i % 4) * 460} y={60 + Math.floor(i / 4) * 500} scale={1.4} />
          <text x={200 + (i % 4) * 460} y={500 + Math.floor(i / 4) * 500} fontSize={32} textAnchor="middle" fill={C.ink} fontFamily="sans-serif">{p}</text>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
