import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, W, H} from './brand';
import {Kaartspeld} from './components/Kaartspeld';

export const Test: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 120], [100, 1400], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x={0} y={800} width={W} height={280} fill={C.sand} />
        <Kaartspeld pose={f % 20 < 10 ? 'walk' : 'stand'} x={x} y={560} scale={1.2} />
      </svg>
    </AbsoluteFill>
  );
};
