// Igbo-Ora: a Yoruba market town in Oyo State, Nigeria. Red laterite street, painted houses with corrugated roofs,
// oil palms, a market with striped stalls, bunting, the town gate and the festival square. Everything static (one Batch).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, tri, house } from "./build";
import { ctex, rng, earthHD, frondHD, signHD, grassHD } from "./paint";
import { D0 } from "./story";

import { GATE_Z, MARKET_Z, FEST_Z } from "./plan";
export { GATE_Z, MARKET_Z, FEST_Z };
const BUNT = ["#d23b3b", "#f3d35a", "#2f8a4f", "#f7f1e1", "#3f6fb5", "#e8731f"];

const stripeTex = (a: string, b: string) => ctex(`stripe${a}${b}`, 256, 256, (g) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 32, 0, 32, 256); }
  g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, 236, 256, 20);
});
const mat = (k: string, c: string) => lam(k + c, () => ({ color: c }));
const rot = (y: number, x: number, y0: number, z: number) => new THREE.Matrix4().makeRotationY(y).setPosition(x, y0, z);
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);

const palm = (b: Batch, x: number, z: number, h: number, seed: number) => {
  const r = rng(seed * 7 + 3), lean = (r() - 0.5) * 0.5, lx = lean, lz = (r() - 0.5) * 0.4;
  const trunk = mat("trunk", "#8a6a4a"), ring = mat("trunkR", "#6e5238");
  const segs = 7;
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs, t1 = (i + 1) / segs;
    const p0 = V(x + lx * h * t0 * t0 * 0.5, h * t0, z + lz * h * t0 * t0 * 0.5), p1 = V(x + lx * h * t1 * t1 * 0.5, h * t1, z + lz * h * t1 * t1 * 0.5);
    const len = p0.distanceTo(p1), g = new THREE.CylinderGeometry(0.2 - 0.07 * t1, 0.2 - 0.07 * t0, len, 7);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), p1.clone().sub(p0).normalize());
    b.add(g, i % 2 ? ring : trunk, new THREE.Matrix4().compose(p0.clone().add(p1).multiplyScalar(0.5), q, V(1, 1, 1)));
  }
  const top = V(x + lx * h * 0.5, h, z + lz * h * 0.5);
  const fm = lam("frond", () => ({ map: frondHD(), alphaTest: 0.5, side: THREE.DoubleSide }));
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2 + r(), droop = 0.55 + r() * 0.35, L = 3.6 + r() * 0.8;
    const g = new THREE.PlaneGeometry(L, 0.95); g.translate(L / 2, 0, 0);
    const m = new THREE.Matrix4().makeRotationY(-a).multiply(new THREE.Matrix4().makeRotationZ(-droop * 0.6)).multiply(new THREE.Matrix4().makeRotationX(0.4 * (r() - 0.5)));
    m.setPosition(top);
    b.add(g, fm, m);
  }
  b.add(new THREE.SphereGeometry(0.28, 8, 6), mat("coco", "#5a7a2a"), at(top.x, top.y - 0.15, top.z));
};
const mango = (b: Batch, x: number, z: number, h: number, seed: number) => {
  const r = rng(seed * 13 + 5);
  b.add(new THREE.CylinderGeometry(0.22, 0.34, h * 0.55, 7), mat("trunk", "#8a6a4a"), at(x, h * 0.27, z));
  for (let i = 0; i < 5; i++) {
    const c = V(x + (r() - 0.5) * h * 0.5, h * (0.62 + r() * 0.2), z + (r() - 0.5) * h * 0.5), s = h * (0.26 + r() * 0.1);
    b.add(new THREE.SphereGeometry(1, 12, 9), mat("mango", ["#3f8f3a", "#4aa043", "#357d33"][i % 3]), new THREE.Matrix4().compose(c, new THREE.Quaternion(), V(s, s * 0.8, s)));
  }
};
const stall = (b: Batch, x: number, z: number, yaw: number, ci: number, goods: number) => {
  const cols: [string, string][] = [["#d23b3b", "#f7f1e1"], ["#f3d35a", "#2f8a4f"], ["#3f6fb5", "#f7f1e1"], ["#e8731f", "#f7f1e1"], ["#2f8a4f", "#f3d35a"]];
  const [ca, cb] = cols[ci % cols.length], m = rot(yaw, x, D0, z);
  const wood = mat("stallwood", "#8a5a3a");
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(V(sx * 1.05 - 0.04, 0, sz * 0.7 - 0.04), V(sx * 1.05 + 0.04, 2.35, sz * 0.7 + 0.04)), wood, m);
  b.add(boxGeo(V(-1.0, 0.8, -0.35), V(1.0, 0.9, 0.35), 0), wood, m);                       // table top
  for (const sx of [-0.9, 0.9]) b.add(boxGeo(V(sx - 0.04, 0, -0.3), V(sx + 0.04, 0.8, 0.3)), wood, m);
  const cm = lam(`canopy${ca}${cb}`, () => ({ map: stripeTex(ca, cb), side: THREE.DoubleSide }));
  b.add(quad(V(-1.25, 2.25, 0.95), V(1.25, 2.25, 0.95), V(1.25, 2.55, -0.85), V(-1.25, 2.55, -0.85), 3, 2), cm, m);
  // goods: yams (long brown), okra (small green), tomatoes (red), peppers, plantain (yellow), cassava
  const gmat = [["#a9783f", "#c99a5a"], ["#6b9a32", "#8bbd45"], ["#d6402e", "#f0654a"], ["#e8a317", "#f3c13b"], ["#c9b27a", "#e6d5a0"]][goods % 5];
  for (let i = 0; i < 9; i++) {
    const gx = -0.85 + (i % 5) * 0.4 + (i > 4 ? 0.2 : 0), gz = i > 4 ? 0.12 : -0.12;
    if (goods % 5 === 0 || goods % 5 === 4) b.add(new THREE.CylinderGeometry(0.07, 0.09, 0.45, 6), mat("g" + gmat[i % 2], gmat[i % 2]), new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeRotationZ(1.3 + 0.05 * i).setPosition(gx, 0.98 + (i > 4 ? 0.1 : 0), gz)));
    else b.add(new THREE.SphereGeometry(0.17, 8, 6), mat("g" + gmat[i % 2], gmat[i % 2]), new THREE.Matrix4().multiplyMatrices(m, at(gx, 1.02 + (i > 4 ? 0.12 : 0), gz)));
  }
};
const bunting = (b: Batch, z: number, y: number, half: number) => {
  const rope = mat("rope", "#5a4a3a"), n = 16;
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, x0 = -half + 2 * half * u0, x1 = -half + 2 * half * u1;
    const yy = (u: number) => y - 0.7 * 4 * u * (1 - u);
    b.add(boxGeo(V(x0, yy(u0) - 0.015, z - 0.015), V(x1, yy(u1) + 0.015, z + 0.015)), rope);
    const xm = (x0 + x1) / 2, ym = yy((u0 + u1) / 2);
    const c = BUNT[i % BUNT.length];
    b.add(tri(V(xm - 0.22, ym, z), V(xm + 0.22, ym, z), V(xm, ym - 0.5, z)), lam("pen" + c, () => ({ color: c, side: THREE.DoubleSide })));
  }
};

export const buildTown = (root: THREE.Object3D) => {
  const b = new Batch(), r = rng(21);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length) % a.length];
  // ---- ground: savanna grass everywhere, red earth street + squares ----
  const grass = lam("savanna", () => ({ map: grassHD(), color: "#d4cc86" }));
  const earth = lam("laterite", () => ({ map: earthHD() }));
  const flat = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, dy: number) => {
    const y = D0 + dy, g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
    return g;
  };
  b.add(flat(-900, 900, -900, 900, 450, 450, -0.06), grass);
  b.add(flat(-7, 7, -170, 170, 3.5, 85, 0.0), earth);                                  // main street
  b.add(flat(-26, 26, MARKET_Z - 16, MARKET_Z + 16, 13, 8, 0.004), earth);           // market square
  b.add(flat(-24, 24, FEST_Z - 24, FEST_Z + 14, 12, 9.5, 0.004), earth);             // festival square
  b.add(flat(-40, 40, -4, 4, 20, 2, 0.003), earth);                                  // cross street
  // ---- houses: two rows along the street (fronts on |x| = 8), plus a loose back row ----
  const clear = (x: number, z: number) =>
    (Math.abs(z - MARKET_Z) < 17 && Math.abs(x) < 28) || (z > FEST_Z - 26 && z < FEST_Z + 16 && Math.abs(x) < 26) || (Math.abs(z) < 5.5) || (Math.abs(z - GATE_Z) < 3);
  for (const sx of [-1, 1]) {
    let z = -150;
    while (z < 150) {
      const w = pick([7, 8, 9, 10]), h = pick([3.4, 3.4, 5.6]), d = 6, cz = z + w / 2;
      if (!clear(sx * 10, cz) && !clear(sx * 10, z) && !clear(sx * 10, z + w)) house(b, sx * (6 + d / 2), cz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, d, h, Math.floor(r() * 8), D0, true);
      z += w + (r() < 0.3 ? 4 + r() * 4 : 0.6);
    }
  }
  for (const sx of [-1, 1]) for (const rowx of [24, 38, 54]) {
    let z = -140;
    while (z < 140) {
      const w = pick([8, 10, 12]), h = pick([3.4, 5.6]), cz = z + w / 2, cx = sx * (rowx + r() * 5);
      if (r() > 0.2 && !clear(cx, cz)) house(b, cx, cz, r() < 0.5 ? Math.PI / 2 : -Math.PI / 2 + (sx > 0 ? 0 : Math.PI), w, 6, h, Math.floor(r() * 8), D0, true);
      z += w + 2 + r() * 9;
    }
  }
  // ---- trees ----
  for (let i = 0; i < 90; i++) {
    const sx = r() < 0.5 ? -1 : 1, x = sx * (9 + r() * 70), z = (r() - 0.5) * 300;
    if (Math.abs(x) < 9 || clear(x, z)) continue;
    if (r() < 0.6) palm(b, x, z, 8 + r() * 5, i); else mango(b, x, z, 6 + r() * 3, i);
  }
  for (const [x, z] of [[-10, GATE_Z + 8], [10, GATE_Z + 7], [-9.5, -58], [10, -64], [-12, 6], [12, -8], [-27, MARKET_Z - 8], [27, MARKET_Z + 9]] as const) palm(b, x, z, 11 + (x % 3), Math.abs(x) + z);
  mango(b, -14, MARKET_Z + 4, 8, 3); mango(b, 15, MARKET_Z - 3, 8.5, 4);
  // horizon: low rolling tree-lines + hills
  const hill = new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const hm = [mat("hillA", "#6f9f3a"), mat("hillB", "#5c8f35"), mat("hillC", "#86a944")];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + r() * 0.2, d = 260 + r() * 260, s = 70 + r() * 90;
    b.add(hill, hm[i % 3], new THREE.Matrix4().compose(V(Math.cos(a) * d, D0 - 2, Math.sin(a) * d), new THREE.Quaternion(), V(s * 1.5, 14 + r() * 26, s)));
  }
  for (let i = 0; i < 150; i++) {
    const a = r() * Math.PI * 2, d = 120 + r() * 220;
    mango(b, Math.cos(a) * d, Math.sin(a) * d, 9 + r() * 6, i + 100);
  }
  // ---- market ----
  let k = 0;
  for (const [x, z, yaw] of [[-12, MARKET_Z - 10, 0], [-6, MARKET_Z - 12, 0.2], [0, MARKET_Z - 13, 0], [6, MARKET_Z - 12, -0.2], [12, MARKET_Z - 10, 0],
    [-15, MARKET_Z, Math.PI / 2], [15, MARKET_Z + 1, -Math.PI / 2], [-12, MARKET_Z + 10, Math.PI], [-5, MARKET_Z + 12, Math.PI - 0.15], [4, MARKET_Z + 12, Math.PI + 0.1], [12, MARKET_Z + 10, Math.PI],
    [-20, MARKET_Z - 6, 1.2], [20, MARKET_Z + 6, -1.2], [-21, MARKET_Z + 5, 1.8], [21, MARKET_Z - 5, -1.8]] as const) stall(b, x, z, yaw, k++, k * 3);
  // baskets / sacks on the ground
  for (let i = 0; i < 14; i++) b.add(new THREE.CylinderGeometry(0.4, 0.3, 0.5, 9), mat("basket", ["#b8863f", "#c9a063"][i % 2]), at((r() - 0.5) * 30, D0 + 0.25, MARKET_Z + (r() - 0.5) * 26));
  // ---- bunting across the street ----
  for (const z of [-62, -48, -8, 12, 40, 56]) bunting(b, z, 4.9, 6.3);
  // ---- town gate: two posts + board ----
  const wood = mat("gatewood", "#6a4a32"), post = mat("gatepost", "#d9c9a0");
  for (const sx of [-1, 1]) {
    b.add(boxGeo(V(sx * 5.4 - 0.4, D0, GATE_Z - 0.4), V(sx * 5.4 + 0.4, D0 + 5.8, GATE_Z + 0.4), 0), post);
    b.add(boxGeo(V(sx * 5.4 - 0.5, D0 + 5.8, GATE_Z - 0.5), V(sx * 5.4 + 0.5, D0 + 6.1, GATE_Z + 0.5), 0), wood);
  }
  b.add(boxGeo(V(-5.9, D0 + 5.3, GATE_Z - 0.2), V(5.9, D0 + 5.5, GATE_Z + 0.2), 0), wood);
  const sg = lam("gateBoard", () => ({ map: signHD("gate", "#1f6f43", "IGBO-ORA", "TWINS CAPITAL OF THE WORLD"), side: THREE.DoubleSide }));
  b.add(quad(V(-5.0, D0 + 3.6, GATE_Z + 0.22), V(5.0, D0 + 3.6, GATE_Z + 0.22), V(5.0, D0 + 5.3, GATE_Z + 0.22), V(-5.0, D0 + 5.3, GATE_Z + 0.22)), sg);
  b.add(quad(V(5.0, D0 + 3.6, GATE_Z - 0.22), V(-5.0, D0 + 3.6, GATE_Z - 0.22), V(-5.0, D0 + 5.3, GATE_Z - 0.22), V(5.0, D0 + 5.3, GATE_Z - 0.22)), sg);
  // ---- festival square: red carpet, stage, backdrop, flag poles ----
  b.add(boxGeo(V(-1.6, D0 + 0.01, FEST_Z - 22), V(1.6, D0 + 0.05, FEST_Z + 1)), mat("carpet", "#c0282d"));
  const SZ = FEST_Z + 8;
  b.add(boxGeo(V(-9, D0, SZ - 3), V(9, D0 + 1.1, SZ + 3), 0), mat("stage", "#e9d9a8"));
  b.add(boxGeo(V(-9.2, D0 + 1.1, SZ - 3.2), V(9.2, D0 + 1.25, SZ + 3.2)), mat("stageTop", "#b3262d"));
  const fb = lam("festBoard", () => ({ map: signHD("fest", "#d2342d", "WORLD TWINS FESTIVAL", "IGBO-ORA · EVERY OCTOBER", "#ffe27a"), side: THREE.DoubleSide }));
  b.add(quad(V(-8, D0 + 2.6, SZ + 2.8), V(8, D0 + 2.6, SZ + 2.8), V(8, D0 + 7.0, SZ + 2.8), V(-8, D0 + 7.0, SZ + 2.8), 1, 1), fb);
  b.add(quad(V(8, D0 + 2.6, SZ + 2.78), V(-8, D0 + 2.6, SZ + 2.78), V(-8, D0 + 7.0, SZ + 2.78), V(8, D0 + 7.0, SZ + 2.78), 1, 1), fb);
  for (const sx of [-8.2, 8.2]) b.add(boxGeo(V(sx - 0.1, D0 + 1.1, SZ + 2.7), V(sx + 0.1, D0 + 7.3, SZ + 2.9)), wood);
  for (let i = 0; i < 12; i++) {
    const sx = i % 2 ? 1 : -1, z = FEST_Z - 14 + Math.floor(i / 2) * 4.5, c = BUNT[i % BUNT.length];
    b.add(boxGeo(V(sx * 7 - 0.05, D0, z - 0.05), V(sx * 7 + 0.05, D0 + 4.6, z + 0.05)), wood);
    b.add(quad(V(sx * 7, D0 + 4.0, z), V(sx * 7 + sx * 1.2, D0 + 4.0, z), V(sx * 7 + sx * 1.2, D0 + 4.6, z), V(sx * 7, D0 + 4.6, z)), lam("flag" + c, () => ({ color: c, side: THREE.DoubleSide })));
  }
  b.build(root);
};
