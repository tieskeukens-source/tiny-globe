import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../brand';

export type PopDef = {woord: string; tekst: string; x?: number; y?: number; kleur?: string; stijl?: 'kaart' | 'groot'};

export const Pop: React.FC<PopDef & {at: number}> = ({tekst, at, x = 960, y = 150, kleur = C.orange, stijl = 'kaart'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 11, stiffness: 180}});
  if (f < at) return null;
  const rot = stijl === 'kaart' ? -3 : 0;
  if (stijl === 'groot') {
    return (
      <div style={{position: 'absolute', left: x - 700, width: 1400, top: y - 110, textAlign: 'center', transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2)}}>
        <span style={{fontFamily: 'Lilita One', fontSize: 190, color: kleur, WebkitTextStroke: `10px ${C.ink}`, paintOrder: 'stroke fill'}}>{tekst}</span>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p}) rotate(${rot}deg)`, opacity: Math.min(1, p * 2)}}>
      <div style={{background: C.paper, border: `6px solid ${C.ink}`, borderRadius: 26, padding: '14px 36px', fontFamily: 'Lilita One', fontSize: 80, color: kleur, whiteSpace: 'nowrap', boxShadow: `8px 8px 0 ${C.ink}`}}>{tekst}</div>
    </div>
  );
};

// tijd (sec) van een woord binnen de woord-/zinsgrenzen van de stem
export const woordTijd = (words: [string, number, number][], key: string): number => {
  const k = key.toLowerCase();
  for (const [t, a, b] of words) {
    const i = t.toLowerCase().indexOf(k);
    if (i >= 0) return a + (t.length > k.length ? (i / t.length) * (b - a) : 0);
  }
  return 0.3;
};
