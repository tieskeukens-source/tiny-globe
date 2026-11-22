// Kuşköy ("Village of the Birds"): a hazelnut village in the steep green hills above the Black Sea, Giresun, Turkey.
// Grass valley floor, a dirt lane, wooden houses with red roofs, hazelnut bushes, beech/pine woods and steep hills in the mist.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, house } from "./build";
import { rng, earthHD, signHD, grassHD, ctex } from "./paint";
import { D0 } from "./story";
import { GATE_Z, MARKET_Z, FEST_Z, TEA_Z, MOSQUE, SETS } from "./plan";
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


// ---------------- Turkish details ----------------
const TR_RED = "#e30a17";
/** Turkish flag: red field, white crescent + star (proportions after the flag law, simplified) */
export const flagTex = () => ctex("trflag", 768, 512, (g) => {
  g.fillStyle = TR_RED; g.fillRect(0, 0, 768, 512);
  const G = 512, cx = 0.5 * G, cy = 256;
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(cx, cy, 0.25 * G, 0, Math.PI * 2); g.fill();
  g.fillStyle = TR_RED; g.beginPath(); g.arc(cx + 0.0625 * G, cy, 0.2 * G, 0, Math.PI * 2); g.fill();
  const sx = cx + 0.333 * G, R = 0.125 * G, r = R * 0.382; g.fillStyle = "#ffffff"; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = Math.PI + (i * Math.PI) / 5, rr = i % 2 ? r : R; g.lineTo(sx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
  g.closePath(); g.fill();
});
const flagMat = () => lam("trflagM", () => ({ map: flagTex(), side: THREE.DoubleSide }));
/** waving flag on a pole: strip of quads with a sine ripple, hoist at the pole */
const flag = (b: Batch, x: number, z: number, h: number, w: number, yaw: number, y0 = 0, seed = 0) => {
  b.add(new THREE.CylinderGeometry(0.07, 0.09, h, 8), mat("pole", "#e8e4da"), at(x, y0 + h / 2, z));
  b.add(new THREE.SphereGeometry(0.14, 8, 6), mat("gold", "#e2b43c"), at(x, y0 + h + 0.08, z));
  const fh = w * 2 / 3, n = 10, m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y0 + h - fh - 0.15, z);
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, d = (u: number) => Math.sin(u * 5.5 + seed) * 0.18 * u * w / 3;
    b.add(quad(V(u0 * w, 0, d(u0)), V(u1 * w, 0, d(u1)), V(u1 * w, fh, d(u1)), V(u0 * w, fh, d(u0)), u1, 1, u0, 0), flagMat(), m);
  }
};
/** string of small red pennants with the crescent */
const flagLine = (b: Batch, x0: number, x1: number, z0: number, z1: number, y: number) => {
  const n = 12, rope = mat("rope", "#5a4a3a");
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, P = (u: number) => V(x0 + (x1 - x0) * u, y - 0.8 * 4 * u * (1 - u), z0 + (z1 - z0) * u);
    const a = P(u0), c = P(u1), mdl = a.clone().lerp(c, 0.5);
    b.add(boxGeo(V(Math.min(a.x, c.x) - 0.015, Math.min(a.y, c.y) - 0.015, Math.min(a.z, c.z) - 0.015), V(Math.max(a.x, c.x) + 0.015, Math.max(a.y, c.y) + 0.015, Math.max(a.z, c.z) + 0.015)), rope);
    const dx = (c.x - a.x) * 0.45, dz = (c.z - a.z) * 0.45;
    b.add(quad(V(mdl.x - dx, mdl.y - 0.6, mdl.z - dz), V(mdl.x + dx, mdl.y - 0.6, mdl.z + dz), V(mdl.x + dx, mdl.y, mdl.z + dz), V(mdl.x - dx, mdl.y, mdl.z - dz), 1, 1, 0, 0), flagMat());
  }
};
/** mosque: white prayer hall, lead dome with gold crescent, slender minaret with a balcony (şerefe) */
const mosque = (b: Batch, x: number, z: number) => {
  const wall = mat("mwall", "#f3eee3"), lead = mat("lead", "#8796a6"), gold = mat("gold", "#e2b43c");
  b.add(boxGeo(V(x - 6, D0, z - 6), V(x + 6, D0 + 6.5, z + 6), 0), wall);
  b.add(boxGeo(V(x - 6.3, D0 + 6.5, z - 6.3), V(x + 6.3, D0 + 7.0, z + 6.3)), mat("mtrim", "#d9cfbf"));
  b.add(new THREE.CylinderGeometry(4.6, 4.9, 1.4, 24), wall, at(x, D0 + 7.7, z));
  b.add(new THREE.SphereGeometry(4.6, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), lead, at(x, D0 + 8.4, z));
  b.add(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 6), gold, at(x, D0 + 13.6, z));
  b.add(new THREE.TorusGeometry(0.42, 0.09, 6, 16, Math.PI * 1.3), gold, new THREE.Matrix4().makeRotationZ(-Math.PI * 0.15).setPosition(x, D0 + 14.6, z));
  for (const dz of [-3.5, 0, 3.5]) for (const sx of [-1, 1]) b.add(boxGeo(V(x + sx * 6.02 - 0.03, D0 + 2.2, z + dz - 0.6), V(x + sx * 6.02 + 0.03, D0 + 4.8, z + dz + 0.6)), mat("mwin", "#3c6f8f"));
  for (const dx of [-3.5, 0, 3.5]) for (const sz of [-1, 1]) b.add(boxGeo(V(x + dx - 0.6, D0 + 2.2, z + sz * 6.02 - 0.03), V(x + dx + 0.6, D0 + 4.8, z + sz * 6.02 + 0.03)), mat("mwin", "#3c6f8f"));
  const mx = x + 7.5, mz = z - 5;   // minaret
  b.add(new THREE.CylinderGeometry(1.1, 1.2, 2.5, 8), wall, at(mx, D0 + 1.25, mz));
  b.add(new THREE.CylinderGeometry(0.72, 0.8, 17, 12), wall, at(mx, D0 + 2.5 + 8.5, mz));
  b.add(new THREE.CylinderGeometry(1.25, 0.8, 0.7, 14), mat("mtrim", "#d9cfbf"), at(mx, D0 + 14.5, mz));
  b.add(new THREE.CylinderGeometry(0.6, 0.66, 3.2, 12), wall, at(mx, D0 + 21.1, mz));
  b.add(new THREE.ConeGeometry(0.85, 4.4, 12), lead, at(mx, D0 + 24.9, mz));
  b.add(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), gold, at(mx, D0 + 27.6, mz));
  b.add(new THREE.TorusGeometry(0.28, 0.06, 6, 14, Math.PI * 1.3), gold, new THREE.Matrix4().makeRotationZ(-Math.PI * 0.15).setPosition(mx, D0 + 28.3, mz));
  b.add(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 14), mat("mtrim", "#d9cfbf"), at(mx, D0 + 19.4, mz));
};
/** kilim: woven rug with diamond motifs, hung over a balcony / rail */
const kilimTex = (seed: number) => ctex("kilim" + seed, 256, 384, (g, r) => {
  const P = [["#b8322a", "#f2d59a", "#2f4f7a", "#1f1a1a"], ["#2f5f8a", "#f4e6c4", "#c0352a", "#e8a33a"], ["#7a2a3a", "#e9c46a", "#2f7a5c", "#f3ead8"]][seed % 3];
  g.fillStyle = P[0]; g.fillRect(0, 0, 256, 384);
  for (let y = 0; y < 384; y += 96) { g.fillStyle = P[1]; g.fillRect(0, y, 256, 10); }
  for (let k = 0; k < 4; k++) { const cy = 48 + k * 96;
    for (const [s, c] of [[44, P[2]], [30, P[1]], [16, P[3]]] as const) { g.fillStyle = c; g.beginPath(); g.moveTo(128, cy - s); g.lineTo(128 + s * 1.6, cy); g.lineTo(128, cy + s); g.lineTo(128 - s * 1.6, cy); g.closePath(); g.fill(); }
    for (const sx of [24, 232]) { g.fillStyle = P[3]; g.beginPath(); g.moveTo(sx, cy - 16); g.lineTo(sx + 10, cy); g.lineTo(sx, cy + 16); g.lineTo(sx - 10, cy); g.fill(); } }
  g.strokeStyle = P[3]; g.lineWidth = 8; g.strokeRect(4, 4, 248, 376);
});
const kilim = (b: Batch, x: number, y: number, z: number, yaw: number, w: number, h: number, seed: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  b.add(quad(V(-w / 2, -h, 0), V(w / 2, -h, 0), V(w / 2, 0, 0), V(-w / 2, 0, 0)), lam("kilimM" + (seed % 3), () => ({ map: kilimTex(seed % 3), side: THREE.DoubleSide })), m);
  b.add(boxGeo(V(-w / 2 - 0.2, -0.06, -0.06), V(w / 2 + 0.2, 0.06, 0.06)), mat("rail", "#6a4a32"), m);
};
/** nazar boncuk (evil-eye bead): flat blue / white / light blue / black discs */
const nazar = (b: Batch, x: number, y: number, z: number, yaw: number, s = 0.35) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  const disc = (r: number, c: string, dz: number) => b.add(new THREE.CylinderGeometry(r, r, 0.04, 20), mat("nz" + c, c), new THREE.Matrix4().makeTranslation(x, y, z).multiply(m).multiply(new THREE.Matrix4().makeTranslation(0, dz, 0)));
  disc(s, "#1f4fb3", 0); disc(s * 0.66, "#ffffff", 0.02); disc(s * 0.45, "#7fc4f0", 0.04); disc(s * 0.22, "#111111", 0.06);
};
/** serender: Black Sea wooden granary on four stilts with flat stone caps against mice */
const serender = (b: Batch, x: number, y: number, z: number, yaw: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z), wood = mat("serW", "#8a5a34"), dark = mat("serD", "#5e3c22");
  for (const sx of [-1.2, 1.2]) for (const sz of [-1, 1]) { b.add(boxGeo(V(sx - 0.12, 0, sz - 0.12), V(sx + 0.12, 1.6, sz + 0.12)), dark, m); b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 10), mat("serS", "#9a948a"), new THREE.Matrix4().multiplyMatrices(m, at(sx, 1.65, sz))); }
  b.add(boxGeo(V(-1.6, 1.7, -1.3), V(1.6, 3.7, 1.3)), wood, m);
  for (let k = 0; k < 6; k++) b.add(boxGeo(V(-1.62, 1.9 + k * 0.32, 1.3), V(1.62, 1.95 + k * 0.32, 1.34)), dark, m);
  b.add(quad(V(-2.0, 3.6, 1.7), V(2.0, 3.6, 1.7), V(2.0, 4.8, 0), V(-2.0, 4.8, 0)), roofT(), m);
  b.add(quad(V(2.0, 3.6, -1.7), V(-2.0, 3.6, -1.7), V(-2.0, 4.8, 0), V(2.0, 4.8, 0)), roofT(), m);
};
const roofT = () => lam("serRoof", () => ({ color: "#b5432e", side: THREE.DoubleSide }));
/** tea garden (çay bahçesi): vine pergola, low tables with tulip glasses, stools, a stove with the double teapot */
const teaGarden = (b: Batch, cz: number) => {
  const wood = mat("tgW", "#7a5232"), vine = ["#4f9a3a", "#5db33f", "#3f8a35"];
  // tea house at the far end of the garden (across the lane), sign + flags
  const hz = cz + 12;
  b.add(boxGeo(V(-7, D0, hz), V(7, D0 + 4.2, hz + 6), 0), mat("thW", "#f3e9d2"));
  b.add(boxGeo(V(-7.6, D0 + 4.2, hz - 0.8), V(7.6, D0 + 4.5, hz + 6.6)), mat("thR", "#9a3a2a"));
  b.add(boxGeo(V(-1.2, D0, hz - 0.02), V(1.2, D0 + 2.6, hz)), mat("thD", "#5e3c22"));
  for (const sx of [-4.5, 4.5]) b.add(boxGeo(V(sx - 1.1, D0 + 1.4, hz - 0.03), V(sx + 1.1, D0 + 3.0, hz)), mat("thWin", "#f6dc8a"));
  const sg = lam("teaSign", () => ({ map: signHD("tea", "#7a2a2a", "ÇAY BAHÇESİ", "TEA GARDEN · KUŞKÖY", "#ffe27a"), side: THREE.DoubleSide }));
  b.add(quad(V(5, D0 + 4.6, hz - 0.85), V(-5, D0 + 4.6, hz - 0.85), V(-5, D0 + 6.2, hz - 0.85), V(5, D0 + 6.2, hz - 0.85)), sg);
  flag(b, -8.2, hz - 0.6, 7.5, 2.2, Math.PI, D0, 1); flag(b, 8.2, hz - 0.6, 7.5, 2.2, Math.PI, D0, 2.4);
  // pergola posts + beams + vine leaves overhead (kept high, out of the face shots)
  for (const sx of [-6, 6]) for (let zz = cz - 9; zz <= cz + 9; zz += 6) b.add(boxGeo(V(sx - 0.12, D0, zz - 0.12), V(sx + 0.12, D0 + 3.4, zz + 0.12)), wood);
  for (let zz = cz - 9; zz <= cz + 9; zz += 3) b.add(boxGeo(V(-6.3, D0 + 3.4, zz - 0.07), V(6.3, D0 + 3.55, zz + 0.07)), wood);
  const r = rng(77);
  for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * 12.5, zz = cz + (r() - 0.5) * 19, s = 0.5 + r() * 0.5; b.add(new THREE.SphereGeometry(1, 8, 6), mat("vine" + (i % 3), vine[i % 3]), new THREE.Matrix4().compose(V(x, D0 + 3.75 + r() * 0.3, zz), new THREE.Quaternion(), V(s, s * 0.45, s))); }
  for (let i = 0; i < 14; i++) { const x = (r() < 0.5 ? -1 : 1) * 6, zz = cz + (r() - 0.5) * 18; b.add(new THREE.SphereGeometry(0.35, 6, 5), mat("grape", "#5a2a6a"), at(x, D0 + 3.0, zz)); }
  // tables with glasses + stools; keep the cast spot (lane centre, z = cz) clear
  for (const [tx, tz] of [[-3.8, cz - 5], [3.8, cz - 4.5], [-4, cz + 4.5], [4.2, cz + 5], [-1.5, cz + 8.5], [2, cz - 8.5]] as const) {
    b.add(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16), mat("tblT", "#efe7d8"), at(tx, D0 + 0.72, tz));
    b.add(new THREE.CylinderGeometry(0.06, 0.1, 0.7, 8), wood, at(tx, D0 + 0.35, tz));
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + tx; b.add(new THREE.CylinderGeometry(0.05, 0.04, 0.13, 8), mat("teaG", "#b5482a"), at(tx + Math.cos(a) * 0.3, D0 + 0.82, tz + Math.sin(a) * 0.3)); }
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + 1; b.add(new THREE.CylinderGeometry(0.2, 0.2, 0.45, 10), mat("stool", "#c0352a"), at(tx + Math.cos(a) * 1.0, D0 + 0.22, tz + Math.sin(a) * 1.0)); }
  }
  // stove with the two-tier teapot (çaydanlık)
  b.add(boxGeo(V(5.2, D0, cz + 8), V(6.4, D0 + 1.0, cz + 9.2)), mat("stove", "#3a3a3e"));
  b.add(new THREE.CylinderGeometry(0.34, 0.4, 0.55, 14), mat("pot", "#c9ccd2"), at(5.8, D0 + 1.28, cz + 8.6));
  b.add(new THREE.CylinderGeometry(0.24, 0.3, 0.42, 14), mat("pot", "#c9ccd2"), at(5.8, D0 + 1.76, cz + 8.6));
  nazar(b, 0, D0 + 2.8, hz - 0.05, Math.PI, 0.32);
  flagLine(b, -6, 6, cz - 9.2, cz - 9.2, 3.3);
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
  const lane = lam("klane", () => ({ color: "#a39a8a" }));
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
  const clear = (x: number, z: number) => corridor(x, z) || (Math.abs(z - MARKET_Z) < 11 && Math.abs(x) < 16) || (z > FEST_Z - 22 && z < FEST_Z + 14 && Math.abs(x) < 20) || (Math.abs(z - GATE_Z) < 3) || (Math.abs(z - TEA_Z) < 21 && Math.abs(x) < 15) || (Math.abs(z - MOSQUE[1]) < 13 && x < -5 && x > -32) || (Math.abs(z + 62) < 13 && x < -5 && x > -25);
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
  for (let i = 0; i < 260; i++) { const x = (r() - 0.5) * 8.4, z = (r() - 0.5) * 300, s = 0.12 + r() * 0.2; b.add(new THREE.SphereGeometry(1, 6, 4), mat("pebble", ["#9a8f80", "#b3a894", "#7d7466"][i % 3]), new THREE.Matrix4().compose(V(x, D0 + 0.01, z), new THREE.Quaternion(), V(s, s * 0.35, s * 0.8))); }
  for (const S of Object.values(SETS)) { if (Math.abs(Math.sin(S.az)) < 0.5) continue; const sd = Math.sign(Math.sin(S.az));
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
  for (const [x, z] of [[8, MARKET_Z - 4], [7, MARKET_Z + 4], [10, MARKET_Z + 8], [9.5, MARKET_Z - 7]] as const) sacks(b, x, z, 5, Math.abs(x) * 7 + z);
  for (const z of [-48, 40]) bunting(b, z, 4.6, 5.2);
  for (const z of [-78, -20, 20, 52, 78]) flagLine(b, -5.2, 5.2, z, z, 4.8);
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
  // ---- Turkish landmarks ----
  mosque(b, MOSQUE[0], MOSQUE[1]);
  flag(b, -7.5, 15, 9, 3.0, Math.PI / 2 + 0.3, D0, 0.5);           // big flag on the mosque square (hook)
  flag(b, 7.2, MARKET_Z + 9, 7, 2.2, -Math.PI / 2, D0, 3);
  teaGarden(b, TEA_Z);
  for (const sx of [-1, 1]) for (const [x, z] of [[-32, -55], [-38, -70], [-44, -60], [-32, -78], [33, -50], [39, -66]] as const) { if (Math.sign(x) !== sx) continue; serender(b, x, stepY(x), z, r() * 0.6 - 0.3); }
  for (const [x, z, yaw, k] of [[6.2, MARKET_Z - 6, -Math.PI / 2, 0], [6.2, MARKET_Z + 3, -Math.PI / 2, 1], [6.2, MARKET_Z + 12, -Math.PI / 2, 2], [-6.2, 4, Math.PI / 2, 1], [-6.2, -14, Math.PI / 2, 2], [6.2, 30, -Math.PI / 2, 0], [-6.2, -80, Math.PI / 2, 0]] as const)
    kilim(b, x, D0 + 3.1, z, yaw, 1.8, 2.4, k);
  for (const [x, z] of [[-5.0, GATE_Z], [5.0, GATE_Z]] as const) nazar(b, x, D0 + 3.0, z + 0.4, 0, 0.3);
  for (const [x, z] of [[6.05, MARKET_Z - 1], [-6.05, 9], [6.05, -60]] as const) nazar(b, x, D0 + 2.5, z, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0.22);
  // festival: flags on the stage and a big banner flag behind
  for (const sx of [-9.5, 9.5]) flag(b, sx, FEST_Z + 9, 9.5, 3.2, Math.PI, D0, sx);
  b.build(root);
};
