// Cut-out rig v2 for THE BLOCK. A pose is three layers (legs / torso / head) that move apart,
// so a character can lean, shift weight, turn and nod instead of sliding about as one flat sticker.
// World coordinates are the 2x background pixels; the camera maps world -> screen and can rotate.
import React from 'react';
import {Img, interpolate, spring, staticFile} from 'remotion';
import PARTS from '../../../public/ai/parts.json';

export const FPS = 60;
export type Joints = {neck: number; waist: number; top: number; bottom: number; neckx: number; waistx: number};
export const J = PARTS as unknown as Record<string, Joints>;

// pose placement in world coordinates
export type PL = {x: number; y: number; s: number; m: [number, number]; a?: number; sh?: boolean};
export const anchorOf = (p: PL) => p.a ?? 1530;
/** world position of a pixel inside a placed pose */
export const pt = (p: PL, px: number, py: number): [number, number] => [p.x + (px - 512) * p.s, p.y + (py - anchorOf(p)) * p.s];
/** world position of the face (a bit above the mouth) */
export const face = (p: PL): [number, number] => pt(p, p.m[0], p.m[1] - 150);

export type Cam = {cx: number; cy: number; z: number; rot?: number};
export const mixCam = (a: Cam, b: Cam, k: number): Cam => ({
  cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k,
  z: a.z + (b.z - a.z) * k, rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * k,
});
export const ease = (k: number) => (k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k));

export const camTransform = (c: Cam) =>
  `translate(540px, 960px) rotate(${c.rot ?? 0}deg) scale(${c.z}) translate(${-c.cx}px, ${-c.cy}px)`;

/** keep the frame inside the world box, allowing for the rotation */
export const clampCam = (c: Cam, W: number, H: number): Cam => {
  const r = Math.abs(((c.rot ?? 0) * Math.PI) / 180);
  const hw = (540 * Math.cos(r) + 960 * Math.sin(r)) / c.z;
  const hh = (960 * Math.cos(r) + 540 * Math.sin(r)) / c.z;
  return {...c, cx: Math.min(W - hw, Math.max(hw, c.cx)), cy: Math.min(H - hh, Math.max(hh, c.cy))};
};

export type RigProps = {
  pose: string;
  p: PL;
  v: string;            // mouth shape
  blink: boolean;
  t: number;            // seconds
  f: number;            // frames
  phase: number;        // per-character offset so nobody moves in lockstep
  talk: number;         // 0..1 how much they are speaking right now
  look: number;         // -1..1 which way to turn the head
  swap: number;         // frames since the pose changed
  mood?: number;        // 0..1 extra droop
};

export const Rig: React.FC<RigProps> = ({pose, p, v, blink, t, f, phase, talk, look, swap, mood = 0}) => {
  const j = J[pose];
  const s = p.s, A = anchorOf(p);
  const W = 1024 * s, H = 1536 * s;
  // ---- body motion ----
  const sw = spring({frame: swap, fps: FPS, config: {damping: 11, stiffness: 240}});
  const pop = 1 - (1 - sw) * 0.055;                                  // squash when the pose changes
  const idle = Math.sin(t * 0.85 + phase) * 1.0;                     // slow sway
  const beat = Math.sin(t * 6.1 + phase * 2) * 1.5 * talk;           // a bob per syllable while talking
  const lean = idle + beat - mood * 2.2;
  const shiftX = Math.sin(t * 0.63 + phase * 1.7) * 7 + beat * 2.2;
  const breathe = 1 + Math.sin(t * 2.0 + phase) * 0.009;
  const nod = Math.sin(t * 8.4 + phase * 3) * 2.4 * talk + Math.sin(t * 0.72 + phase) * 0.9 - mood * 2.6;
  const turn = look * 7;                                             // head turns toward whoever speaks
  const headUp = -Math.abs(beat) * 1.4;
  const bob = (pose === 'fast_hype' ? -Math.abs(Math.sin(t * Math.PI * 142 / 60)) * 11 : 0) + mood * 14;

  const img = (n: string) => <Img src={staticFile(`ai/${n}.png`)} style={{position: 'absolute', left: 0, top: 0, width: 1024, height: 1536}} />;
  return (
    <>
      {p.sh !== false && (
        <div style={{position: 'absolute', left: p.x - 250 * s, top: p.y - 26, width: 500 * s, height: 46,
          borderRadius: '50%', background: 'rgba(0,0,0,0.34)', filter: 'blur(8px)'}} />
      )}
      <div style={{position: 'absolute', left: p.x - W / 2, top: p.y - A * s + bob, width: W, height: H}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1024, height: 1536, transformOrigin: '0 0', transform: `scale(${s})`,
          filter: `brightness(${0.95 - mood * 0.07}) contrast(1.04) saturate(1.04)`}}>
          {/* legs stay planted */}
          <div style={{position: 'absolute', transformOrigin: `${j.waistx}px ${j.waist}px`, transform: `scaleY(${pop})`}}>
            {img(`${pose}_legs`)}
          </div>
          {/* torso leans and shifts its weight */}
          <div style={{position: 'absolute', transformOrigin: `${j.waistx}px ${j.waist}px`,
            transform: `translateX(${shiftX}px) rotate(${lean}deg) scale(${2 - pop}, ${pop * breathe})`}}>
            {img(`${pose}_torso`)}
            {/* head turns and nods on top of the torso */}
            <div style={{position: 'absolute', transformOrigin: `${j.neckx}px ${j.neck}px`,
              transform: `translate(${turn}px, ${headUp}px) rotate(${nod + turn * 0.12}deg)`}}>
              {img(`${pose}_h${v}`)}
              {blink && img(`${pose}_hblink`)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export {interpolate};
