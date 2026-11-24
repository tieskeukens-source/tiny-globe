import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Guy, InkDefs, Who, Pose} from './chars';
import {BANG, MARK} from './fonts';

const CREW: {who: Who; name: string; tag: string; color: string}[] = [
  {who: 'lou', name: 'LOU', tag: "doesn't believe nobody", color: '#c9dbe9'},
  {who: 'dre', name: 'DRE', tag: 'says little. always right.', color: '#5b74c4'},
  {who: 'fast', name: 'FAST', tag: 'too loud. too much.', color: '#d8352c'},
];
const FACES: [Who, Pose][] = [
  ['dre', {open: 0, eyes: 'calm'}], ['dre', {open: 0.7, eyes: 'side'}],
  ['lou', {open: 0, eyes: 'tired'}], ['lou', {open: 0.6, eyes: 'angry'}],
  ['fast', {open: 1, eyes: 'wide'}], ['fast', {open: 0.2, eyes: 'closed'}],
];

export const CrewSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#f3ecdc'}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <InkDefs seed={3} />
      {/* brick panel behind the crew */}
      <rect x={40} y={40} width={1180} height={1000} fill="#7e4b47" stroke="#141210" strokeWidth={8} />
      {Array.from({length: 26}).map((_, r) => (
        <g key={r} stroke="#5f3633" strokeWidth={4} opacity={0.8}>
          <line x1={44} x2={1216} y1={40 + r * 40} y2={40 + r * 40} />
          {Array.from({length: 14}).map((__, c) => <line key={c} x1={44 + c * 92 + (r % 2) * 46} x2={44 + c * 92 + (r % 2) * 46} y1={40 + r * 40} y2={80 + r * 40} />)}
        </g>
      ))}
      <text x={630} y={210} textAnchor="middle" fontFamily={MARK} fontSize={150} fill="none" stroke="#b8392f" strokeWidth={5} opacity={0.75} transform="rotate(-6 630 210)">THE BLOCK</text>
      <g filter="url(#wob)">
        {CREW.map((c, i) => (
          <g key={c.who} transform={`translate(${70 + i * 380} ${110}) scale(0.7)`}>
            <Guy who={c.who} />
          </g>
        ))}
      </g>
      {CREW.map((c, i) => (
        <g key={c.who}>
          <text x={280 + i * 380} y={1022} textAnchor="middle" fontFamily={BANG} fontSize={70} fill={c.color} stroke="#141210" strokeWidth={4} paintOrder="stroke">{c.name}</text>
        </g>
      ))}
      {/* expression column */}
      <rect x={1250} y={40} width={630} height={1000} fill="#fbf8f0" stroke="#141210" strokeWidth={8} />
      {FACES.map(([w, p], i) => (
        <svg key={i} x={1270 + (i % 2) * 300} y={60 + Math.floor(i / 2) * 325} width={290} height={290} viewBox="50 -90 500 520">
          <g filter="url(#wob)"><Guy who={w} pose={p} legs={false} /></g>
        </svg>
      ))}
      {[CREW[1], CREW[0], CREW[2]].map((c, i) => (
        <text key={c.who} x={1565} y={372 + i * 325} textAnchor="middle" fontFamily={MARK} fontSize={28} fill="#141210">{c.tag}</text>
      ))}
      <rect width={1920} height={1080} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);
