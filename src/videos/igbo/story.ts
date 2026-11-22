// Igbo-Ora: camera grammar (same as the Baarle sample: smootherstep glides, creeping push-ins, kicks) + the shot table.
export const FPS = 30;
export const D0 = 0; // ground height (m)
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Shot = Partial<Cam> & { pos: V3; look: V3 };
export type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
export const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
export const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
export const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
export const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
export const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

// ---------------- test shots (world / cast review) ----------------
export const TOTAL = 60;
export const FLASH_AT = -100;
export const SHOTS: ShotDef[] = [1, 2, 3, 4, 5, 6].map((id) => ({ id, a: (id - 1) * 10, b: id * 10, light: "day" as Light, tau: (t: number) => t }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: () => ({ pos: [5, 1.7, 24], look: [0, 1.3, 8], fov: 38 }) }],
  2: [{ f: 0, s: () => ({ pos: [1.5, 1.4, 14.2], look: [0.4, 1.15, 8.2], fov: 30 }) }],
  3: [{ f: 0, s: () => ({ pos: [-3, 2.4, -14], look: [1, 1.5, -40], fov: 40 }) }],
  4: [{ f: 0, s: () => ({ pos: [0.5, 1.5, 14.5], look: [-0.2, 1.4, 9.5], fov: 34 }) }],
  5: [{ f: 0, s: () => ({ pos: [60, 42, 90], look: [0, 0, 10], fov: 40 }) }],
  6: [{ f: 0, s: () => ({ pos: [0, 3.2, 38], look: [0, 3.2, 68], fov: 44 }) }],
};
export const camAt = (id: number, f: number): Cam => run(CAMS[id], f);
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [{ f: 0, cInf: 0 }, { f: 10, cInf: 9 }, { f: 20, cInf: 0 }, { f: 30, cInf: 9 }, { f: 40, cInf: 0 }, { f: 50, cInf: 0 }];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  return { cInf: DOF[i].cInf, focus: DOF[i].focus };
};
export const W: Record<string, number> = {};
