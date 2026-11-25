import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W, H} from '../brand';

const lilita = 'Lilita One';
const inter = 'Inter';
const h = delayRender('fonts');
Promise.all([
  new FontFace(lilita, `url(${staticFile('fonts/lilita-one-latin-400-normal.woff2')})`, {weight: '400'}),
  new FontFace(inter, `url(${staticFile('fonts/inter-latin-400-normal.woff2')})`, {weight: '400'}),
  new FontFace(inter, `url(${staticFile('fonts/inter-latin-800-normal.woff2')})`, {weight: '800'}),
].map((ff) => ff.load().then((l) => document.fonts.add(l)))).then(() => continueRender(h));

const usePop = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 14}});
};

export const TitelScene: React.FC<{titel: string; sub?: string}> = ({titel, sub}) => {
  const p = usePop();
  return (
    <AbsoluteFill style={{background: C.paper, justifyContent: 'center', alignItems: 'center', padding: 120}}>
      <div style={{fontFamily: lilita, fontSize: 120, color: C.ink, textAlign: 'center', transform: `scale(${0.85 + 0.15 * p})`, opacity: p, lineHeight: 1.1}}>{titel}</div>
      {sub && <div style={{fontFamily: inter, fontSize: 44, color: C.blue, marginTop: 36, opacity: usePop(10)}}>{sub}</div>}
    </AbsoluteFill>
  );
};

export const CijferScene: React.FC<{cijfer: string; label: string; kleur?: string}> = ({cijfer, label, kleur = C.orange}) => {
  const p = usePop();
  return (
    <AbsoluteFill style={{background: C.paper, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: lilita, fontSize: 260, color: kleur, transform: `scale(${0.7 + 0.3 * p})`, opacity: p}}>{cijfer}</div>
      <div style={{fontFamily: inter, fontWeight: 800, fontSize: 52, color: C.ink, marginTop: 10, opacity: usePop(8)}}>{label}</div>
    </AbsoluteFill>
  );
};

export const VergelijkScene: React.FC<{a: {naam: string; waarde: number; tekst: string}; b: {naam: string; waarde: number; tekst: string}}> = ({a, b}) => {
  const f = useCurrentFrame();
  const max = Math.max(Math.abs(a.waarde), Math.abs(b.waarde));
  const zero = 520; // y van de nullijn
  const grow = (v: number, d: number) => interpolate(f, [d, d + 30], [0, Math.abs(v) / max], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bar = (x: {naam: string; waarde: number; tekst: string}, kleur: string, d: number, left: number) => {
    const hgt = 330 * grow(x.waarde, d);
    const up = x.waarde >= 0;
    return (
      <div style={{position: 'absolute', left, top: 0, width: 400, textAlign: 'center'}}>
        <div style={{position: 'absolute', left: 0, width: 400, top: up ? zero - hgt : zero, height: hgt, background: kleur, border: `6px solid ${C.ink}`}} />
        <div style={{position: 'absolute', left: 0, width: 400, top: up ? zero - hgt - 80 : zero + hgt + 10, fontFamily: lilita, fontSize: 64, color: C.ink}}>{x.tekst}</div>
        <div style={{position: 'absolute', left: 0, width: 400, top: 120, fontFamily: inter, fontWeight: 800, fontSize: 44, color: C.ink}}>{x.naam}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', left: 120, right: 120, top: zero - 3, height: 6, background: C.ink}} />
      {bar(a, C.blue, 0, W / 2 - 520)}
      {bar(b, C.orange, 15, W / 2 + 120)}
    </AbsoluteFill>
  );
};

export const FeitScene: React.FC<{tekst: string}> = ({tekst}) => {
  const p = usePop();
  return (
    <AbsoluteFill style={{background: C.green, justifyContent: 'center', alignItems: 'center', padding: 160}}>
      <div style={{fontFamily: lilita, fontSize: 88, color: C.paper, textAlign: 'center', lineHeight: 1.15, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>{tekst}</div>
    </AbsoluteFill>
  );
};

export const Ondertitel: React.FC<{tekst: string}> = ({tekst}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', fontFamily: inter, fontWeight: 800, fontSize: 46, color: C.paper}}>
    <span style={{background: 'rgba(27,27,31,0.82)', padding: '10px 28px', borderRadius: 16}}>{tekst}</span>
  </div>
);

import {Kaartspeld, Pose} from './Kaartspeld';
export const KarakterScene: React.FC<{pose: Pose; tekst: string}> = ({pose, tekst}) => {
  const p = usePop();
  return (
    <AbsoluteFill style={{background: C.sand}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 220, background: C.paper}} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g opacity={p}><Kaartspeld pose={pose} x={560} y={300} scale={2.4} /></g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: lilita, fontSize: 96, color: C.ink, opacity: p}}>{tekst}</div>
    </AbsoluteFill>
  );
};
