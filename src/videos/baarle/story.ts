// Timeline of the bridge short: shots timed to the the voice words (~/bridge-short/voice/words.json),
// story physics (column position, march phase, deck bounce, collapse) and the camera grammar measured in the
// reference study: continuous slow push-ins; symmetric ease-in-out moves ~23 f (10 in / 10 out), peak ~15 px/f at 720p;
// big reframes are cuts; impacts are 7-frame kicks that flip sign every frame; no hand-held float.
export const FPS = 30;
export const TOTAL = 733;
export const D0 = 6.0; // bank top + deck height (m)
export const HALF = 27; // towers at z = +-27, span 54 m
export const FILES = [-1.65, -0.55, 0.55, 1.65];
export const ROW_GAP = 1.3;
export const COUNT = 74;
export const PARK: V3 = [70, D0, -75]; // swing pivot base (x, ground y, z)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- story physics (tau = story time in seconds) ----------------
export const front = (tau: number) => 26 - 1.6 * (tau - 4.4); // z of the front row, marching toward -z
export const marchPhase = (tau: number) => ((tau % 1) + 1) % 1; // 1 Hz cycle = 2 steps/s, footfalls at 0 and 0.5
export const SNAP = 34.62, DROP0 = 36.35, DROP1 = 36.95;
export const amp = (tau: number) =>
  lin([[14.85, 0], [17.8, 0.07], [21.4, 0.13], [27.4, 0.26], [33.0, 0.46], [SNAP, 0.55], [SNAP + 0.35, 0.0]], tau);
export const stomp = (tau: number) => lin([[21.4, 1.0], [27.4, 1.35], [33, 1.5]], tau); // "a little harder every step"
export const shapeZ = (z: number) => (Math.abs(z) < HALF ? Math.cos((Math.PI * z) / (2 * HALF)) : 0);
export const dropW = (z: number) => smooth((20 - z) / 26); // 1 on the near half, 0 at the far tower
export const dropU = (tau: number) => (tau < DROP0 ? 0 : Math.min(1, ((tau - DROP0) / (DROP1 - DROP0)) ** 2));
export const DROP_H = 6.6;

export type BridgeState = { bounce: number; drop: number; snap: number; collapsed: boolean };
export const deckY = (z: number, b: BridgeState) => D0 + b.bounce * shapeZ(z) - b.drop * DROP_H * dropW(z);

// ---------------- shots (Tiny Globe: Baarle, 16:9) ----------------
// timings from the voice timeline (voice/timeline.json, word onsets in s); every reaction lands 0-3 f before its word
export type Light = "day" | "golden";
export type Crowd = "baarle" | "march" | "fall" | "water" | "bank" | "tourists" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number; towns?: boolean };
/** the border line crosses the main street at z = ZB and runs into the local's front door on the west facade (x = -6) */
export let ZB = -56.8; // door of the w=7 house at x=-10, zc=-56.8 (front at x=-6)
export const setZB = (z: number) => { ZB = z; };
export const W = {
  oneStep: 1.298, nl1: 3.054, be: 3.909, nl2: 4.536, baarle: 5.722, twentyTwo: 6.503, scattered: 8.714, so: 10.789, which: 11.426,
  depends: 12.704, where: 14.179, frontDoor: 14.904, your: 15.886, theDoor: 16.915, decides: 17.315, some: 18.74, moved: 19.715, tax: 21.252,
  youCan: 21.955, withA: 23.097, door: 23.301,
};
const F = (t: number) => Math.round(t * FPS) - 2;
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: F(W.nl1), light: "day", crowd: "baarle", tau: (t) => t },
  { id: 2, a: F(W.nl1), b: F(W.baarle) - 4, light: "day", crowd: "baarle", tau: (t) => t },
  { id: 3, a: F(W.baarle) - 4, b: F(W.so), light: "day", crowd: "baarle", tau: (t) => t },
  { id: 4, a: F(W.so), b: F(W.depends), light: "day", crowd: "baarle", tau: (t) => t },
  { id: 5, a: F(W.depends), b: F(W.your), light: "day", crowd: "baarle", tau: (t) => t },
  { id: 6, a: F(W.your), b: F(W.theDoor), light: "day", crowd: "baarle", tau: (t) => t },
  { id: 7, a: F(W.theDoor), b: F(W.youCan), light: "day", crowd: "baarle", tau: (t) => t },
  { id: 8, a: F(W.youCan), b: TOTAL, light: "day", crowd: "baarle", tau: (t) => t },
];
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -100;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];
export const bridgeState = (_id: number, _t: number): BridgeState => ({ bounce: 0, drop: 0, snap: 0, collapsed: false });

// ---------------- camera ----------------
// Grammar (motion.md): every move is a symmetric smootherstep glide of 18-40 f (peak speed = 1.875 x distance / dur,
// so dur >= 0.075 x the move in 720p px keeps the peak near the reference 14-25 px/f); a reframe bigger than about
// half a frame width or 40 % zoom is a hard cut on its key frame. Glides are centred on the old key frame (the
// whoosh in the sound mix peaks there), so a glide key starts dur/2 earlier. Holds push in (dolly toward the look
// point or a fov zoom near walls/towers): 0.15-0.35 %/f, ~0.6 %/f for ~35 f on the punch words. Rolls of 4-8 deg
// over >= 18 f on emphasis beats, held tilt <= 0.07 rad.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const Fz = (id: number, f: number) => front(SHOTS[id - 1].tau(T(f)));
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put, for lenses next to towers / houses): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
/** a roll-only move on top of an existing framing */
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

export const ANCHOR: V3 = [-2.7, D0 + 0.62, -37];
export const snapEnd = (_snap: number): V3 => ANCHOR;

// ---- framings: host at the line in the street, then at the local's door on the west facade ----
export const HOST_X = 1.4;
const G = D0;
const S1a = (f: number) => dolly([4.2, G + 2.3, ZB + 17], [0.2, G + 2.1, ZB - 6], pushK(f, 0, 0.0028), { fov: 36 });
const S1b = (f: number) => dolly([3.0, G + 1.25, ZB + 4.6], [HOST_X, G + 1.15, ZB], pushK(f, F(W.oneStep), 0.003, 0.006, 30), { fov: 30, roll: -0.04 });
const S2a = (f: number) => dolly([5.1, G + 1.0, ZB + 0.4], [HOST_X - 0.2, G + 1.0, ZB], pushK(f, F(W.nl1), 0.004), { fov: 34 });
const S2b = (f: number) => dolly([3.6, G + 1.7, ZB - 3.6], [HOST_X, G + 0.95, ZB], pushK(f, F(W.be), 0.004), { fov: 34, roll: 0.07 });
const S2c = (f: number) => dolly([-0.6, G + 0.85, ZB + 3.0], [HOST_X, G + 1.05, ZB], pushK(f, F(W.nl2), 0.004), { fov: 36, roll: -0.07 });
const S3a = (f: number) => zoom([34, G + 40, ZB + 46], [-4, G, ZB - 18], 40, pushK(f, F(W.baarle) - 4, 0.0015));
const S3b = (f: number) => zoom([22, G + 30, ZB + 22], [-6, G, ZB - 26], 42, pushK(f, F(W.twentyTwo), 0.0015));
export const DOOR_X = -6;
const S4a = (f: number) => dolly([0.8, G + 1.75, ZB + 5.4], [-4.3, G + 1.45, ZB + 0.2], pushK(f, F(W.so), 0.0022), { fov: 34 });
const S5a = (f: number) => dolly([-1.6, G + 1.65, ZB + 4.1], [-5.0, G + 1.6, ZB + 1.7], pushK(f, F(W.depends), 0.0025), { fov: 30, roll: 0.03 });
const S5b = (f: number) => dolly([-2.2, G + 1.4, ZB + 3.0], [-5.4, G + 1.3, ZB + 0.7], pushK(f, F(W.where), 0.0025, 0.006, 30), { fov: 30, roll: -0.03 });
const S6a = (f: number) => dolly([-1.4, G + 1.75, ZB - 1.6], [-3.0, G + 1.75, ZB + 0.6], pushK(f, F(W.your), 0.004, 0.008, 25), { fov: 30, roll: 0.06 });
const S7a = (f: number) => dolly([-1.0, G + 1.15, ZB - 0.9], [-5.9, G + 0.95, ZB + 0.15], pushK(f, F(W.theDoor), 0.003), { fov: 34, roll: -0.04 });
const S7b = (f: number) => dolly([0.4, G + 1.8, ZB + 6.4], [-4.8, G + 1.2, ZB - 0.2], pushK(f, F(W.some), 0.0022), { fov: 36 });
const S8a = (f: number) => dolly([-1.5, G + 1.75, ZB - 1.4], [-3.0, G + 1.75, ZB + 0.6], pushK(f, F(W.youCan), 0.003, 0.01, 40), { fov: 30, roll: -0.05 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: F(W.oneStep), cut: true, s: S1b }],
  2: [{ f: F(W.nl1), s: S2a }, { f: F(W.be), cut: true, s: S2b }, { f: F(W.nl2), cut: true, s: S2c }],
  3: [{ f: F(W.baarle) - 4, s: S3a }, { f: F(W.twentyTwo) - 12, dur: 36, s: S3b }],
  4: [{ f: F(W.so), s: S4a }],
  5: [{ f: F(W.depends), s: S5a }, { f: F(W.where) - 10, dur: 24, s: S5b }],
  6: [{ f: F(W.your), s: S6a }],
  7: [{ f: F(W.theDoor), s: S7a }, { f: F(W.some), cut: true, s: S7b }],
  8: [{ f: F(W.youCan), s: S8a }, { f: F(W.withA) - 6, dur: 18, s: rolled(S8a, 0.06) }],
};

// impact kicks (reference v14): the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in
// 7 f, roll +-0.23 deg per unit; they start on the first frame at/after the event. No hand-held float.
const KICKS: [number, number][] = [[W.nl1, 0.8], [W.be, 0.8], [W.nl2, 0.8], [W.your, 0.6], [W.door, 1.3]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a; // metres at the look distance for 3 px x a
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** frame at which the current key's move has finished (for picking billboard views per key, not per frame) */
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field + foreground framing ----------------
/** Lens blur per shot (thin lens). cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = all sharp.
 *  Reference: DOF on in ~1/3 of shots; when on, background sigma720 CU 4.2, MS 4.0, FS 2.7, WS 1.9,
 *  foreground objects 4-8 (disc radius at 1080p = 3 x sigma720). Establishing/wide/most full shots stay sharp.
 *  Entries switch on cuts (no dur) or ramp with the camera glide they share f/dur with. focus = world point (else the
 *  camera look point). */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 8, focus: () => [HOST_X, D0 + 1.5, ZB] }, // establishing: host sharp, street soft
  { f: F(W.oneStep), cInf: 13 }, // MS host
  { f: F(W.nl1), cInf: 11 }, // hops
  { f: F(W.baarle) - 4, cInf: 0 }, // aerial
  { f: F(W.so), cInf: 9 }, // two-shot at the door
  { f: F(W.depends), cInf: 13 }, // local MS
  { f: F(W.your), cInf: 14 }, // host CU
  { f: F(W.theDoor), cInf: 12 }, // doorstep insert
  { f: F(W.some), cInf: 8 }, // two-shot
  { f: F(W.youCan), cInf: 15 }, // host CU
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
/** what the lens focuses on (DOF): the DOF table's focus point, else the camera look point */
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects: visible while a <= f < b; kit = a GLB name accepted by build.ts prop() */
// pos = base point (prop()'s x, y, z: the model's base sits on y), s = height in metres (prop()'s h), yaw in radians.
// They sit at 0.3-0.5 x the focus distance and cover 10-25 % of one frame edge, never a face; they are meant to be
// in front of the lens, so build them outside prop()'s sight-line test.
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
