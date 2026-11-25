// AI-art test: ChatGPT-drawn Fast + street, animated as cut-out: pose swaps, Rhubarb lip-sync frames, blinks,
// squash on pose change, bounce, camera cuts, 3-word captions, logo slam.
import React from 'react';
import {AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import TL from './tl.json';
import '../block1/fonts';
import {BANG, MARK} from '../block1/fonts';

export const FPS = 30;
export const AITEST_FRAMES = Math.ceil(TL.total * FPS);
type Line = (typeof TL.lines)[number];
const LINES = TL.lines as Line[];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const PS = 0.76, FEET_X = 560, FEET_Y = 1650, IMG_FEET = 1500;   // pose images are 1024x1536, feet ~y1500
const word = (l: Line, needle: string) => Number((l.words.find((w) => String(w[2]).toLowerCase().includes(needle)) ?? l.words[0])[0]);
const pose = (t: number): 'hype' | 'talk' | 'point' => (t < word(LINES[0], "i've") - 0.08 ? 'hype' : t < LINES[1].start - 0.15 ? 'talk' : 'point');
const switchT = (t: number) => [word(LINES[0], "i've") - 0.08, LINES[1].start - 0.15].filter((s) => s <= t).pop() ?? 0;
const viseme = (t: number) => {
  const l = LINES.find((x) => t >= x.start && t < x.start + x.dur);
  if (!l) return 'X';
  let v = 'X';
  for (const [ts, s] of l.vis as [number, string][]) if (t - l.start >= ts) v = s;
  return v;
};

const Captions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.start - 0.05 && t < x.start + x.dur + 0.25);
  if (!l) return null;
  const n = l.words.length, groups: number[][] = [];
  for (let k = 0; k < n; k += 3) groups.push(Array.from({length: Math.min(3, n - k)}, (_, j) => k + j));
  if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(...groups.pop()!);
  let cur = 0; l.words.forEach((w, i) => { if (t >= Number(w[0])) cur = i; });
  const g = groups.find((x) => x.includes(cur)) ?? groups[0];
  return (
    <div style={{position: 'absolute', top: 1310, width: 1080, textAlign: 'center', fontFamily: BANG, fontSize: 104, letterSpacing: 2}}>
      {g.map((k) => {
        const on = k === cur, pop = on ? 1.1 + 0.12 * clamp01(1 - (t - Number(l.words[k][0])) * 6) : 1;
        return <span key={k} style={{display: 'inline-block', margin: '0 18px', color: on ? '#ff5a46' : '#fdfbf5', transform: `scale(${pop})`, WebkitTextStroke: '14px #141210', paintOrder: 'stroke fill'}}>{String(l.words[k][2]).toUpperCase()}</span>;
      })}
    </div>
  );
};

export const AiTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const p = pose(t);
  const v = viseme(t);
  const blink = (f % 78) < 3 && v === 'X';
  // cut-out motion: idle bob, beat bounce while hyped, squash/overshoot on every pose change
  const sw = spring({frame: f - Math.round(switchT(t) * FPS), fps: FPS, config: {damping: 9, stiffness: 320}});
  const squash = 1 - (1 - sw) * 0.08;
  const beat = p === 'hype' ? Math.abs(Math.sin(t * Math.PI * 142 / 60)) * 14 : 0;
  const bob = Math.sin(t * 2.2) * 6 + (v !== 'X' ? Math.sin(f / 2.2) * 3 : 0) - beat;
  const sway = Math.sin(t * 1.3) * 1.2 + (p === 'point' ? Math.sin(f * 1.9) * 0.8 : 0);
  // camera: hook close-up on the face, then wide, then a dutch medium for the comeback
  const cam = p === 'hype' ? {cx: 540, cy: 860, z: 1.75 + t * 0.06, rot: -3} : p === 'talk' ? {cx: 560, cy: 1080, z: 1.16 + (t - switchT(t)) * 0.02, rot: 0} : {cx: 560, cy: 1050, z: 1.4 + (t - switchT(t)) * 0.05, rot: -4};
  const shake = p === 'point' ? [Math.sin(f * 2.3) * 4, Math.cos(f * 2.9) * 3] : [0, 0];
  const camT = `translate(${540 + shake[0]}px, ${960 + shake[1]}px) rotate(${cam.rot}deg) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  const bgT = `translate(${540}px, ${960}px) rotate(${cam.rot}deg) scale(${cam.z * 0.97 + 0.03}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  const W = 1024 * PS, H = 1536 * PS;
  const logo = spring({frame: f, fps: FPS, config: {damping: 9, stiffness: 260}});
  return (
    <AbsoluteFill style={{background: '#1b1530', overflow: 'hidden'}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: bgT}}>
        <Img src={staticFile('aitest/bg_street.png')} style={{position: 'absolute', left: -100, top: 0, width: 1280, height: 1920}} />
      </div>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: camT}}>
        <div style={{position: 'absolute', left: FEET_X - 150, top: FEET_Y - 22, width: 300, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(6px)'}} />
        <div style={{position: 'absolute', left: FEET_X - W / 2, top: FEET_Y - IMG_FEET * PS + bob, width: W, height: H,
          transformOrigin: `${W / 2}px ${IMG_FEET * PS}px`, transform: `rotate(${sway}deg) scale(${2 - squash}, ${squash})`, filter: 'brightness(0.93) contrast(1.04) saturate(1.05)'}}>
          <Img src={staticFile(`aitest/fast_${p}_${v}.png`)} style={{position: 'absolute', width: W, height: H}} />
          {blink && <Img src={staticFile(`aitest/fast_${p}_blink.png`)} style={{position: 'absolute', width: W, height: H}} />}
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
      <Captions t={t} />
      {f < 32 && (
        <div style={{position: 'absolute', top: 110, width: 1080, textAlign: 'center', opacity: 1 - clamp01((f - 24) / 8), transform: `rotate(-4deg) scale(${0.4 + 0.6 * logo})`}}>
          <span style={{background: '#141210', padding: '6px 40px', borderRadius: 14, fontFamily: MARK, fontSize: 96, color: '#ffd24a'}}>THE BLOCK</span>
        </div>
      )}
      <Audio src={staticFile('aitest/mix.mp3')} />
    </AbsoluteFill>
  );
};
