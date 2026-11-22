// Kuşköy ("Village of the Birds"): a hazelnut village in the steep green hills above the Black Sea, Giresun, Turkey.
// Grass valley floor, a dirt lane, wooden houses with red roofs, hazelnut bushes, beech/pine woods and steep hills in the mist.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, house } from "./build";
import { rng, earthHD, signHD, grassHD } from "./paint";
import { D0 } from "./story";
import { GATE_Z, MARKET_Z, FEST_Z, SETS } from "./plan";
export { GATE_Z, MARKET_Z, FEST_Z };

const mat = (k: string, c: string) => lam(k + c, () => ({ color: c }));
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const BUNT = ["#d23b3b", "#f3d35a", "#2f8a4f", "#f7f1e1", "#3f6fb5", "#e8731f"];

const beech = (b: Batch, x: number, z: number, h: number, seed: number, y0 = 0) => {
  const r = rng(seed * 13 + 5);
  b.add(new THREE.CylinderGeometry(0.2, 0.32, h * 0.5, 7), mat("trunk", "#7a5a40"), at(x, y0 + h * 0.25, z));
  for (let i = 0; i < 5; i++) {
    const c = V(x + (r() - 0.5) * h * 0.45, y0 + h * (0.6 + r() * 0.2), z + (r() - 0.5) * h * 0.45), s = h * (0.27 + r() * 0.1);
    b.add(new THREE.SphereGeometry(1, 12, 9), mat("beech", ["#3f9a3a", "#4cae44", "#35883a"][i % 3]), new THREE.Matrix4().compose(c, new THREE.Quaternion(), V(s, s * 0.8, s)));
  }
};
const pine = (b: Batch, x: number, z: number, h: number, seed: number, y0 = 0) => {
  const cols = ["#2f6f3a", "#2a6434", "#357a40"];
  b.add(new THREE.CylinderGeometry(0.12, 0.2, h * 0.25, 6), mat("trunk", "#6a4a34"), at(x, y0 + h * 0.12, z));
  for (let i = 0; i < 3; i++) b.add(new THREE.ConeGeometry(h * (0.3 - i * 0.07), h * 0.45, 9), mat("pine", cols[(seed + i) % 3]), at(x, y0 + h * (0.34 + i * 0.22), z));
};
const hazel = (b: Batch, x: number, z: number, s: number, seed: number, y0 = 0) => {
  const r = rng(seed * 31 + 7);
  for (let i = 0; i < 4; i++) {
    const c = V(x + (r() - 0.5) * s * 1.2, y0 + s * (0.55 + r() * 0.25), z + (r() - 0.5) * s * 1.2), k = s * (0.55 + r() * 0.3);
    b.add(new THREE.SphereGeometry(1, 10, 8), mat("hazel", ["#5db33f", "#4e9f38", "#78c24a"][i % 3]), new THREE.Matrix4().compose(c, new THREE.Quaternion(), V(k, k * 0.8, k)));
  }
};
const sacks = (b: Batch, x: number, z: number, n: number, seed: number) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) b.add(new THREE.SphereGeometry(0.42, 8, 6), mat("sack", ["#d9c48f", "#c9b27a", "#e3d3a2"][i % 3]), new THREE.Matrix4().compose(V(x + (r() - 0.5) * 1.6, D0 + 0.3, z + (r() - 0.5) * 1.6), new THREE.Quaternion(), V(1, 0.75, 0.9)));
};
const bunting = (b: Batch, z: number, y: number, half: number) => {
  const rope = mat("rope", "#5a4a3a"), n = 14;
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, x0 = -half + 2 * half * u0, x1 = -half + 2 * half * u1;
    const yy = (u: number) => y - 0.7 * 4 * u * (1 - u);
    b.add(boxGeo(V(x0, yy(u0) - 0.015, z - 0.015), V(x1, yy(u1) + 0.015, z + 0.015)), rope);
    const xm = (x0 + x1) / 2, ym = yy((u0 + u1) / 2), c = BUNT[i % BUNT.length];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([xm - 0.22, ym, z, xm + 0.22, ym, z, xm, ym - 0.5, z], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
    b.add(g, lam("pen" + c, () => ({ color: c, side: THREE.DoubleSide })));
  }
};

export const X0 = 26, SW = 6, SH = 2.4;
export const stepY = (x: number) => (Math.abs(x) < X0 ? 0 : Math.min(9, 1 + Math.floor((Math.abs(x) - X0) / SW)) * SH);
const hay = (b: Batch, x: number, y: number, z: number, s: number) => {
  b.add(new THREE.CylinderGeometry(0.15 * s, 1.0 * s, 2.2 * s, 10), mat("hay", "#d9b24a"), at(x, y + 1.1 * s, z));
  b.add(new THREE.ConeGeometry(0.7 * s, 0.9 * s, 10), mat("hay2", "#c99a30"), at(x, y + 2.5 * s, z));
};
const woodpile = (b: Batch, x: number, y: number, z: number, yaw: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  for (let i = 0; i < 12; i++) b.add(new THREE.CylinderGeometry(0.13, 0.13, 1.6, 7), mat("log" + (i % 2), i % 2 ? "#9a6a3a" : "#7a4f2a"), new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(0, 0.15 + Math.floor(i / 5) * 0.27, ((i % 5) - 2) * 0.28)));
};
const fence = (b: Batch, x: number, y: number, z0: number, z1: number) => {
  const wood = mat("fence", "#8a6a45");
  for (let z = z0; z <= z1; z += 1.6) b.add(boxGeo(V(x - 0.06, y, z - 0.06), V(x + 0.06, y + 1.0, z + 0.06)), wood);
  b.add(boxGeo(V(x - 0.04, y + 0.55, z0), V(x + 0.04, y + 0.7, z1)), wood); b.add(boxGeo(V(x - 0.04, y + 0.85, z0), V(x + 0.04, y + 0.97, z1)), wood);
};
const laundry = (b: Batch, x: number, y: number, z0: number, z1: number, seed: number) => {
  const r = rng(seed), cols = ["#e24a3a", "#f4f0e2", "#3a7fd4", "#f2c230", "#4aa86a", "#d85aa0"];
  b.add(boxGeo(V(x - 0.01, y + 2.2, z0), V(x + 0.01, y + 2.23, z1)), mat("rope", "#5a4a3a"));
  for (const z of [z0, z1]) b.add(boxGeo(V(x - 0.05, y, z - 0.05), V(x + 0.05, y + 2.3, z + 0.05)), mat("pole", "#6a4a34"));
  for (let z = z0 + 0.5; z < z1 - 0.3; z += 0.6) { const c = cols[Math.floor(r() * 6)], h = 0.45 + r() * 0.4; b.add(boxGeo(V(x - 0.03, y + 2.2 - h, z), V(x + 0.03, y + 2.2, z + 0.42)), lam("cloth" + c, () => ({ color: c }))); }
};
const rack = (b: Batch, x: number, y: number, z: number, yaw: number) => { // hazelnut drying rack
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z), w = mat("rackw", "#8a6a45");
  for (const sx of [-1.6, 1.6]) for (const sz of [-0.8, 0.8]) b.add(boxGeo(V(sx - 0.05, 0, sz - 0.05), V(sx + 0.05, 0.9, sz + 0.05)), w, m);
  b.add(boxGeo(V(-1.7, 0.9, -0.9), V(1.7, 1.0, 0.9)), w, m); b.add(boxGeo(V(-1.6, 1.0, -0.8), V(1.6, 1.12, 0.8)), mat("nuts", "#b98a45"), m);
};
const flowers = (b: Batch, x: number, y: number, z: number, seed: number) => {
  const r = rng(seed), cols = ["#ffd23f", "#ff6b8a", "#ffffff", "#9a6bff"];
  for (let i = 0; i < 9; i++) b.add(new THREE.SphereGeometry(0.09, 6, 5), mat("fl", cols[i % 4]), at(x + (r() - 0.5) * 2, y + 0.18, z + (r() - 0.5) * 2));
};
export const buildTown = (root: THREE.Object3D) => {
  const b = new Batch(), r = rng(21);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length) % a.length];
  const grass = lam("kgrass", () => ({ map: grassHD(), color: "#9ad45a" }));
  const lane = lam("klane", () => ({ color: "#86745a" }));
  const flat = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, dy: number) => {
    const y = D0 + dy, g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
    return g;
  };
  b.add(flat(-900, 900, -900, 900, 450, 450, -0.06), grass);
  // steep terraced hillsides on both sides (stone risers, grass tops), climbing like the real hazelnut slopes
  const stone = mat("riser", "#5e9c3c");
  for (const sx of [-1, 1]) for (let i = 0; i < 10; i++) {
    const xa = X0 + i * SW, y = (i + 1) * SH;
    b.add(boxGeo(V(Math.min(sx * xa, sx * 140), D0 - 0.5, -260), V(Math.max(sx * xa, sx * 140), D0 + y, 260), 0), i % 2 ? mat("tg1", "#86c94e") : mat("tg2", "#74ba45"));
    b.add(boxGeo(V(sx * xa - 0.12, D0, -260), V(sx * xa + 0.12, D0 + y, 260), 0), stone);
  }
  b.add(flat(-4.5, 4.5, -170, 170, 2.5, 85, 0.0), lane);                               // the village lane
  b.add(flat(-14, 14, MARKET_Z - 10, MARKET_Z + 10, 7, 6, 0.004), lane);             // small square
  b.add(flat(-18, 18, FEST_Z - 20, FEST_Z + 12, 9, 8, 0.004), lane);                 // festival ground
  const corridor = (x: number, z: number) => Object.values(SETS).some((S) => Math.abs(Math.sin(S.az)) > 0.5 && Math.abs(z - S.c[1]) < 8.5 && x * Math.sign(Math.sin(S.az)) > 4.2 && Math.abs(x) < 25);
  const clear = (x: number, z: number) => corridor(x, z) || (Math.abs(z - MARKET_Z) < 11 && Math.abs(x) < 16) || (z > FEST_Z - 22 && z < FEST_Z + 14 && Math.abs(x) < 20) || (Math.abs(z - GATE_Z) < 3);
  // wooden houses along the lane (fronts at |x| = 6), looser rows behind, spaced out like a hill village
  for (const sx of [-1, 1]) {
    let z = -150;
    while (z < 150) {
      const w = pick([6, 7, 8]), h = pick([3.4, 3.4, 5.6]), d = 6, cz = z + w / 2;
      if (!clear(sx * 8, cz) && !clear(sx * 8, z) && !clear(sx * 8, z + w)) house(b, sx * (5 + d / 2), cz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, d, h, Math.floor(r() * 8), D0, true);
      z += w + 3 + r() * 9;
    }
  }
  for (const sx of [-1, 1]) {   // second row on the flat strip, then houses on the first terraces
    let z = -140;
    while (z < 140) { const w = pick([6, 7]), cz = z + w / 2, cx = sx * (15 + r() * 3); if (r() > 0.4 && !clear(cx, cz)) house(b, cx, cz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, 6, pick([3.4, 5.6]), Math.floor(r() * 8), D0, true); z += w + 5 + r() * 10; }
    for (let i = 0; i < 4; i++) { z = -140; while (z < 140) { const w = pick([6, 7]), cz = z + w / 2; if (r() > 0.55) house(b, sx * (X0+ SW * i + 3), cz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, 5, 3.4, Math.floor(r() * 8), (i + 1) * SH, true); z += w + 8 + r() * 14; } }
  }
  // hazelnut bushes in rows on the terraces + wild between the houses, beech and pine woods up the slopes
  for (const sx of [-1, 1]) for (let i = 0; i < 10; i++) for (let z = -150; z < 150; z += 2.6 + r() * 1.5) if (r() > 0.35) hazel(b, sx * (X0 + SW * i + 0.9 + r() * 0.6), z, 0.9 + r() * 0.5, Math.floor(z) + i, (i + 1) * SH);
  for (let i = 0; i < 160; i++) {
    const sx = r() < 0.5 ? -1 : 1, x = sx * (6 + r() * 19), z = (r() - 0.5) * 320;
    if (Math.abs(x) < 6.5 || clear(x, z)) continue;
    hazel(b, x, z, 1.1 + r() * 0.7, i);
  }
  for (let i = 0; i < 130; i++) {
    const sx = r() < 0.5 ? -1 : 1, x = sx * (30 + r() * 90), z = (r() - 0.5) * 320, y = stepY(x);
    if (r() < 0.55) beech(b, x, z, 6 + r() * 4, i, y); else pine(b, x, z, 7 + r() * 5, i, y);
  }
  // life along the lane: fences, wood piles, hay, laundry, drying racks, flowers
  for (const sx of [-1, 1]) { for (let z = -140; z < 140; z += 9.6) if (!corridor(sx * 6, z) && !corridor(sx * 6, z + 9.6)) fence(b, sx * 4.9, D0, z, z + 9.6); for (let z = -130; z < 130; z += 22 + r() * 12) { if (clear(sx * 12, z)) continue; if (r() < 0.5) woodpile(b, sx * (6.4 + r()), D0, z, r()); else hay(b, sx * (10 + r() * 3), D0, z, 0.8 + r() * 0.5); } }
  for (const [x, z] of [[-11, 4], [11, -12], [-12, -48], [12, 24], [-11, 40], [13, -70]] as const) laundry(b, x, D0, z - 2.2, z + 2.2, Math.abs(x * z));
  for (const [x, z] of [[-12, MARKET_Z - 7], [12, MARKET_Z + 6], [-13, MARKET_Z + 7], [13, MARKET_Z - 6], [-9, 12], [9, -20]] as const) rack(b, x, D0, z, x < 0 ? 0 : Math.PI);
  for (let i = 0; i < 60; i++) { const sx = r() < 0.5 ? -1 : 1; flowers(b, sx * (5.4 + r() * 9), D0, (r() - 0.5) * 240, i); }
  for (let i = 0; i < 260; i++) { const x = (r() - 0.5) * 8.4, z = (r() - 0.5) * 300, s = 0.12 + r() * 0.2; b.add(new THREE.SphereGeometry(1, 6, 4), mat("pebble", ["#9a8f80", "#b3a894", "#7d7466"][i % 3]), new THREE.Matrix4().compose(V(x, D0 + 0.01, z), new THREE.Quaternion(), V(s, s * 0.35, s * 0.8))); }
  for (const S of Object.values(SETS)) { if (Math.abs(Math.sin(S.az)) < 0.5) continue; const sd = Math.sign(Math.sin(S.az));
    for (let i = 0; i < 14; i++) flowers(b, sd * (5 + r() * 12), D0, S.c[1] + (r() - 0.5) * 16, 500 + i);
    for (let i = 0; i < 6; i++) hazel(b, sd * (9 + r() * 12), S.c[1] + (r() < 0.5 ? -1 : 1) * (6 + r() * 3), 0.8 + r() * 0.4, 600 + i); }
  // steep green hills close around the village + far misty ridges
  const hill = new THREE.SphereGeometry(1, 26, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hm = [mat("hillA", "#4f9a3a"), mat("hillB", "#3f8a35"), mat("hillC", "#63a845")];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + r() * 0.15, d = 230 + r() * 170, s = 70 + r() * 60;
    b.add(hill, hm[i % 3], new THREE.Matrix4().compose(V(Math.cos(a) * d, D0 - 2, Math.sin(a) * d), new THREE.Quaternion(), V(s * 1.4, 28 + r() * 30, s)));
  }
  for (let i = 0; i < 200; i++) {
    const a = r() * Math.PI * 2, d = 110 + r() * 150;
    if (r() < 0.6) pine(b, Math.cos(a) * d, Math.sin(a) * d, 12 + r() * 8, i + 100); else beech(b, Math.cos(a) * d, Math.sin(a) * d, 10 + r() * 6, i + 100);
  }
  // hazelnut sacks drying in the square, bunting for the festival
  for (const [x, z] of [[-8, MARKET_Z - 4], [7, MARKET_Z + 3], [-4, MARKET_Z + 7], [9, MARKET_Z - 6]] as const) sacks(b, x, z, 5, Math.abs(x) * 7 + z);
  for (const z of [-62, -48, 40, 52]) bunting(b, z, 4.6, 5.2);
  // village gate: two wooden posts and a board
  const wood = mat("gatewood", "#6a4a32");
  for (const sx of [-1, 1]) b.add(boxGeo(V(sx * 5.0 - 0.35, D0, GATE_Z - 0.35), V(sx * 5.0 + 0.35, D0 + 5.4, GATE_Z + 0.35), 0), wood);
  b.add(boxGeo(V(-5.4, D0 + 4.9, GATE_Z - 0.2), V(5.4, D0 + 5.1, GATE_Z + 0.2), 0), wood);
  const sg = lam("gateBoard", () => ({ map: signHD("kgate", "#2a6b44", "KUŞKÖY", "VILLAGE OF THE BIRDS"), side: THREE.DoubleSide }));
  b.add(quad(V(-4.6, D0 + 3.4, GATE_Z + 0.22), V(4.6, D0 + 3.4, GATE_Z + 0.22), V(4.6, D0 + 4.9, GATE_Z + 0.22), V(-4.6, D0 + 4.9, GATE_Z + 0.22)), sg);
  b.add(quad(V(4.6, D0 + 3.4, GATE_Z - 0.22), V(-4.6, D0 + 3.4, GATE_Z - 0.22), V(-4.6, D0 + 4.9, GATE_Z - 0.22), V(4.6, D0 + 4.9, GATE_Z - 0.22)), sg);
  // festival ground: stage with a banner
  const SZ = FEST_Z + 8;
  b.add(boxGeo(V(-8, D0, SZ - 3), V(8, D0 + 1.0, SZ + 3), 0), mat("stage", "#c9a77a"));
  b.add(boxGeo(V(-8.2, D0 + 1.0, SZ - 3.2), V(8.2, D0 + 1.15, SZ + 3.2)), mat("stageTop", "#8a5a3a"));
  const fb = lam("festBoard", () => ({ map: signHD("kfest", "#2f6fb5", "BIRD LANGUAGE FESTIVAL", "KUŞKÖY · EVERY YEAR SINCE 1997", "#ffe27a"), side: THREE.DoubleSide }));
  b.add(quad(V(-7, D0 + 2.6, SZ + 2.8), V(7, D0 + 2.6, SZ + 2.8), V(7, D0 + 6.6, SZ + 2.8), V(-7, D0 + 6.6, SZ + 2.8), 1, 1), fb);
  b.add(quad(V(7, D0 + 2.6, SZ + 2.78), V(-7, D0 + 2.6, SZ + 2.78), V(-7, D0 + 6.6, SZ + 2.78), V(7, D0 + 6.6, SZ + 2.78), 1, 1), fb);
  for (const sx of [-7.2, 7.2]) b.add(boxGeo(V(sx - 0.1, D0 + 1.0, SZ + 2.7), V(sx + 0.1, D0 + 6.8, SZ + 2.9)), wood);
  b.build(root);
};
