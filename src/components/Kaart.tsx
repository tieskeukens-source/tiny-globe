import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import countriesTopo from 'world-atlas/countries-50m.json';
import {C, W, H} from '../brand';

type Pin = {lon: number; lat: number; label?: string};

// Wereldkaart die in 'dur' frames inzoomt op een doelpunt. zoomTo = eindschaal.
export const Kaart: React.FC<{target: Pin; zoomTo?: number; start?: number; dur?: number; highlight?: string}> = ({
  target, zoomTo = 8, start = 0, dur = 90, highlight,
}) => {
  const f = useCurrentFrame();
  const {paths, px, py} = useMemo(() => {
    const proj = geoNaturalEarth1().fitSize([W, H], {type: 'Sphere'} as any);
    const gen = geoPath(proj);
    const fc: any = feature(countriesTopo as any, (countriesTopo as any).objects.countries);
    const [px, py] = proj([target.lon, target.lat]) as [number, number];
    return {paths: fc.features.map((ft: any) => ({id: String(ft.properties.name), d: gen(ft) || ''})), px, py};
  }, [target.lon, target.lat]);
  const t = interpolate(f, [start, start + dur], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const s = 1 + (zoomTo - 1) * t;
  // houd doelpunt naar het midden schuiven naarmate we inzoomen
  const tx = (W / 2 - px * s) * t + (0) * (1 - t);
  const ty = (H / 2 - py * s) * t;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill={C.blue} opacity={0.18} />
      <g transform={`translate(${tx} ${ty}) scale(${s})`}>
        {paths.map((p: any) => (
          <path key={p.id} d={p.d} fill={p.id === highlight ? '#F2B896' : C.sand} stroke={C.ink} strokeWidth={1.2 / s} strokeLinejoin="round" />
        ))}
        <g transform={`translate(${px} ${py}) scale(${1 / s})`}>
          <circle r={10} fill={C.orange} stroke={C.ink} strokeWidth={3} />
          {target.label && <text y={-24} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.ink} fontFamily="Inter, sans-serif" stroke={C.paper} strokeWidth={8} paintOrder="stroke">{target.label}</text>}
        </g>
      </g>
    </svg>
  );
};
