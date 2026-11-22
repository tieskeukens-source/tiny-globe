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

// ---------------- shots (generated from plan.ts) ----------------
import { PLAN, SETS, TOTAL as PT, posOf, KICKS as KK } from "./plan";
export const TOTAL = PT;
export const FLASH_AT = -100;
export const SHOTS: ShotDef[] = PLAN.map((p) => ({ id: p.id, a: p.a, b: p.b, light: p.light, tau: (t: number) => t }));
export const shotAt = (f: number) => {
  let lo = 0, hi = SHOTS.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].a <= f) lo = m; else hi = m - 1; }
  return SHOTS[lo];
};
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const frame = (id: number, f: number): Shot => {
  const p = PLAN[id - 1], S = posOf(p.ch, p.who), O = posOf(p.ch, p.other), set = SETS[p.ch];
  const sx0 = Math.sin(p.az), sx = p.kind === "two" ? Math.max(-0.3, Math.min(0.3, sx0)) : sx0, sz = (Math.cos(p.az) < 0 ? -1 : 1) * Math.sqrt(1 - sx * sx), rx = sz, rz = -sx, side = p.seed % 2 ? 1 : -1;
  const lim = set.clampX ?? 5.0;
  const cl = (v: V3): V3 => [Math.max(-lim, Math.min(lim, v[0])), v[1], v[2]];
  if (p.kind === "single") {
    const look: V3 = [S[0] + rx * 0.25 * side, 1.2, S[2] + rz * 0.25 * side];
    return dolly(cl([look[0] + sx * 3.5, 1.35, look[2] + sz * 3.5]), look, pushK(f, p.a, 0.0045), { fov: 36, roll: 0.03 * side });
  }
  if (p.kind === "two") {
    const M: V3 = [(S[0] + O[0]) / 2, 1.15, (S[2] + O[2]) / 2], lat = Math.abs((S[0] - O[0]) * rx + (S[2] - O[2]) * rz), d = Math.max(6.5, (lat + 2.8) / 0.34);
    return dolly(cl([M[0] + sx * d, 1.5, M[2] + sz * d]), M, pushK(f, p.a, 0.0035), { fov: 36, roll: -0.025 * side });
  }
  const look: V3 = [set.c[0] + rx * 0.6 * side, 1.4, set.c[1] + rz * 0.6 * side];
  return dolly(cl([look[0] + sx * 10.5, 2.1, look[2] + sz * 10.5]), look, pushK(f, p.a, 0.002), { fov: 42 });
};
export const camAt = (id: number, f: number): Cam => {
  const c = full(frame(id, f)), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = sub(c.look, c.pos), L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KK) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const dofAt = (f: number) => {
  const s = shotAt(f), p = PLAN[s.id - 1];
  if (p.kind === "wide") return { cInf: 4, focus: undefined as undefined | ((f: number) => V3) };
  const S = posOf(p.ch, p.who), O = posOf(p.ch, p.other);
  const fp: V3 = p.kind === "single" ? [S[0], 1.4, S[2]] : [(S[0] + O[0]) / 2, 1.3, (S[2] + O[2]) / 2];
  return { cInf: p.kind === "single" ? 13 : 9, focus: () => fp };
};
export const W: Record<string, number> = {};
