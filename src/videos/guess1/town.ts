// "Guess the country" #1: a northern summer land (never named). Green meadows and dark spruce forest, white birches,
// a grey two-lane road, a crossroads signpost full of "?" arrows, a red sports car stopped by a police car,
// a wife-carrying obstacle course (log hurdles, a water pit, a banner, a seesaw that weighs the wife against beer
// crates, a small grandstand), and a blue lake with red wooden saunas, jetties and chimney smoke.
// NO flags and NO local text anywhere: the country must stay a secret.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad } from "./build";
import { rng, signHD, ctex } from "./paint";
import { D0 } from "./story";
import { SETS, SIGN_Z, ROAD_Z, COURSE_Z, LAKE_Z } from "./plan";

const mat = (k: string, c: string) => lam(k + c, () => ({ color: c }));
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const S = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(sx, sy, sz));
const R = (m: THREE.Matrix4, l: THREE.Matrix4) => new THREE.Matrix4().multiplyMatrices(m, l);
const BALL = new THREE.SphereGeometry(1, 14, 10);
const GRASS = "#7fbf5a", GRASS2 = "#6fb04e";

/** dark spruce */
const spruce = (b: Batch, x: number, z: number, h: number, seed: number) => {
  b.add(new THREE.CylinderGeometry(0.1, 0.18, h * 0.25, 6), mat("trunk", "#4a3426"), at(x, D0 + h * 0.12, z));
  for (let i = 0; i < 3; i++) {
    const y = D0 + h * (0.3 + i * 0.22), r = h * (0.28 - i * 0.07);
    b.add(new THREE.ConeGeometry(r, h * 0.42, 9), mat("spr", ["#2f6a48", "#285f40", "#3a7650"][(seed + i) % 3]), at(x, y, z));
  }
};
/** summer birch: white trunk with black marks, light-green round crown */
const birch = (b: Batch, x: number, z: number, h: number, seed: number) => {
  b.add(new THREE.CylinderGeometry(0.1, 0.16, h, 7), mat("birch", "#f1eee6"), at(x, D0 + h / 2, z));
  for (let k = 0; k < 4; k++) b.add(boxGeo(V(x - 0.17, D0 + h * (0.15 + k * 0.15), z - 0.05), V(x + 0.17, D0 + h * (0.15 + k * 0.15) + 0.08, z + 0.05)), mat("birchM", "#2a2a2e"));
  const c = ["#9ad25a", "#8cc850", "#a6da66"][seed % 3];
  for (let k = 0; k < 3; k++) { const s = h * (0.3 - k * 0.05); b.add(BALL, mat("birchLeaf", c), S(x + (k - 1) * 0.5, D0 + h * (0.85 + k * 0.12), z + ((seed + k) % 3 - 1) * 0.4, s, s * 1.1, s)); }
};
/** "?" arrow sign texture */
const qTex = (txt: string, col: string) => ctex("qarrow" + txt + col, 512, 160, (g) => {
  g.fillStyle = col; g.beginPath(); g.moveTo(0, 20); g.lineTo(420, 20); g.lineTo(505, 80); g.lineTo(420, 140); g.lineTo(0, 140); g.closePath(); g.fill();
  g.strokeStyle = "#1b1b1f"; g.lineWidth = 10; g.stroke();
  g.fillStyle = "#1b1b1f"; g.font = "bold 96px 'Lilita One', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 220, 84);
});
/** crossroads signpost: wooden pole with arrows that only say "?" */
const signpost = (b: Batch, x: number, z: number) => {
  b.add(boxGeo(V(x - 0.14, D0, z - 0.14), V(x + 0.14, D0 + 4.6, z + 0.14), 0), mat("post", "#7a5638"));
  const arrows: [number, number, string, string][] = [[3.9, 0.3, "?", "#ffd23f"], [3.3, 2.2, "? KM", "#ffffff"], [2.7, -1.3, "???", "#ff8a5c"], [2.1, 1.0, "?", "#9fdcff"]];
  for (const [y, yaw, t, c] of arrows) {
    const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0 + y, z), mt = lam("qa" + t + c, () => ({ map: qTex(t, c), alphaTest: 0.5, transparent: false }));
    b.add(quad(V(0.15, -0.3, 0.16), V(2.0, -0.3, 0.16), V(2.0, 0.3, 0.16), V(0.15, 0.3, 0.16)), mt, m);
    b.add(quad(V(2.0, -0.3, 0.12), V(0.15, -0.3, 0.12), V(0.15, 0.3, 0.12), V(2.0, 0.3, 0.12)), mt, m);
  }
};
/** low red sports car */
const sportsCar = (b: Batch, x: number, z: number, yaw: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z), red = mat("sport", "#e0302a"), glass = mat("carWin", "#2a3a52");
  b.add(boxGeo(V(-0.95, 0.3, -2.2), V(0.95, 0.85, 2.2)), red, m);
  b.add(boxGeo(V(-0.8, 0.85, -0.9), V(0.8, 1.25, 0.6)), glass, m);
  b.add(boxGeo(V(-0.82, 1.22, -0.8), V(0.82, 1.3, 0.4)), red, m);
  b.add(boxGeo(V(-0.95, 0.95, -2.25), V(0.95, 1.02, -1.9)), mat("spoiler", "#1b1b1f"), m);           // spoiler
  for (const sx of [-0.7, 0.7]) b.add(boxGeo(V(sx - 0.05, 0.85, -2.15), V(sx + 0.05, 0.98, -2.05)), mat("spoiler", "#1b1b1f"), m);
  for (const sx of [-0.96, 0.96]) for (const sz of [-1.4, 1.45]) {
    b.add(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 14), mat("tyre", "#222228"), R(m, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(sx, 0.36, sz)));
    b.add(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), mat("rim", "#d6d9de"), R(m, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(sx, 0.36, sz)));
  }
  for (const sx of [-0.65, 0.65]) b.add(boxGeo(V(sx - 0.22, 0.55, 2.2), V(sx + 0.22, 0.7, 2.24)), mat("lamp", "#fff2b0"), m);
  for (const sx of [-0.65, 0.65]) b.add(boxGeo(V(sx - 0.22, 0.6, -2.24), V(sx + 0.22, 0.72, -2.2)), mat("tail", "#ff4a3a"), m);
};
/** police car: white, a dark stripe with POLICE, light bar on the roof */
const policeCar = (b: Batch, x: number, z: number, yaw: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z), w = mat("pol", "#f4f5f7"), glass = mat("carWin", "#2a3a52");
  b.add(boxGeo(V(-0.92, 0.35, -2.2), V(0.92, 1.05, 2.2)), w, m);
  b.add(boxGeo(V(-0.86, 1.05, -1.3), V(0.86, 1.65, 0.9)), glass, m);
  b.add(boxGeo(V(-0.88, 1.62, -1.2), V(0.88, 1.72, 0.8)), w, m);
  b.add(boxGeo(V(-0.5, 1.72, -0.4), V(0.5, 1.9, 0.0)), mat("barB", "#3a6fe8"), m);
  b.add(boxGeo(V(-0.2, 1.72, -0.4), V(0.2, 1.92, 0.0)), mat("barR", "#e8443a"), m);
  const st = lam("polSign", () => ({ map: signHD("police", "#1f3f8a", "POLICE", "", "#ffffff"), side: THREE.DoubleSide }));
  for (const sx of [-1, 1]) {
    const xs = sx * 0.935;
    if (sx > 0) b.add(quad(V(xs, 0.5, 2.0), V(xs, 0.5, -2.0), V(xs, 0.95, -2.0), V(xs, 0.95, 2.0)), st, m);
    else b.add(quad(V(xs, 0.5, -2.0), V(xs, 0.5, 2.0), V(xs, 0.95, 2.0), V(xs, 0.95, -2.0)), st, m);
  }
  for (const sx of [-0.94, 0.94]) for (const sz of [-1.4, 1.4]) b.add(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 14), mat("tyre", "#222228"), R(m, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(sx, 0.38, sz)));
  for (const sx of [-0.62, 0.62]) b.add(boxGeo(V(sx - 0.2, 0.7, 2.2), V(sx + 0.2, 0.85, 2.24)), mat("lamp", "#fff2b0"), m);
};
/** speed sign: red ring, number */
const speedTex = (n: string) => ctex("speed" + n, 256, 256, (g) => {
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#e0302a"; g.lineWidth = 34; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#1b1b1f"; g.font = "bold 120px 'Lilita One', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(n, 128, 136);
});
const speedSign = (b: Batch, x: number, z: number, yaw: number, n: string) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z);
  b.add(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), mat("pole", "#9aa0aa"), R(m, at(0, 1.3, 0)));
  b.add(quad(V(-0.55, 2.2, 0.07), V(0.55, 2.2, 0.07), V(0.55, 3.3, 0.07), V(-0.55, 3.3, 0.07)), lam("spd" + n, () => ({ map: speedTex(n), alphaTest: 0.5 })), m);
  b.add(quad(V(0.55, 2.2, 0.04), V(-0.55, 2.2, 0.04), V(-0.55, 3.3, 0.04), V(0.55, 3.3, 0.04)), mat("signBack", "#b8bcc4"), m);
};
/** log hurdle */
const hurdle = (b: Batch, x: number, z: number, w: number) => {
  for (const dz of [-w / 2, w / 2]) b.add(boxGeo(V(x - 0.1, D0, z + dz - 0.1), V(x + 0.1, D0 + 1.0, z + dz + 0.1)), mat("hpost", "#7a5638"));
  b.add(new THREE.CylinderGeometry(0.2, 0.2, w + 0.4, 10), mat("log", "#9a6a44"), new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(x, D0 + 0.85, z));
};
/** seesaw scale: the wife sits on one end, beer crates on the other (the real way they weigh the prize) */
const seesaw = (b: Batch, x: number, z: number, yaw: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z);
  b.add(new THREE.CylinderGeometry(0.0, 0.55, 0.9, 4), mat("pivot", "#5a6a7a"), R(m, at(0, 0.45, 0)));
  b.add(boxGeo(V(-3.0, 0.9, -0.35), V(3.0, 1.05, 0.35)), mat("plank", "#b07a4a"), m);
  const crate = mat("crate", "#f2b33a"), bottles = mat("bottle", "#7a4a1a");
  for (let i = 0; i < 6; i++) { const cx = 1.0 + (i % 3) * 0.62, cy = 1.05 + Math.floor(i / 3) * 0.5; b.add(boxGeo(V(cx - 0.29, cy, -0.3), V(cx + 0.29, cy + 0.46, 0.3)), crate, m);
    for (let k = 0; k < 3; k++) b.add(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 6), bottles, R(m, at(cx - 0.18 + k * 0.18, cy + 0.55, 0))); }
};
/** red wooden lakeside sauna: plank walls, white corners, dark roof, chimney smoke, little porch to the jetty */
const sauna = (b: Batch, x: number, z: number, yaw: number, s: number, seed: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z), wall = mat("saunaW", ["#d0482e", "#c8502f", "#d65a34"][seed % 3]), white = mat("trim", "#f4f1ea");
  const w = 3.2 * s, d = 2.8 * s, h = 2.4 * s, hw = w / 2, hd = d / 2;
  b.add(boxGeo(V(-hw, 0, -hd), V(hw, h, hd), 0), wall, m);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(V(sx * hw - 0.09, 0, sz * hd - 0.09), V(sx * hw + 0.09, h, sz * hd + 0.09)), white, m);
  for (let y = 0.4; y < h; y += 0.35) b.add(boxGeo(V(-hw - 0.02, y, hd), V(hw + 0.02, y + 0.03, hd + 0.03)), mat("plankLine", "#7a2a22"), m);
  const roof = mat("saunaRoof", "#3a3434"), o = 0.35, rh = d * 0.32;
  b.add(quad(V(-hw - o, h - 0.1, hd + o), V(hw + o, h - 0.1, hd + o), V(hw + o, h + rh, 0), V(-hw - o, h + rh, 0)), roof, m);
  b.add(quad(V(hw + o, h - 0.1, -hd - o), V(-hw - o, h - 0.1, -hd - o), V(-hw - o, h + rh, 0), V(hw + o, h + rh, 0)), roof, m);
  const tri = (a: THREE.Vector3, c: THREE.Vector3, e: THREE.Vector3) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([a, c, e].flatMap((v) => [v.x, v.y, v.z]), 3)); g.computeVertexNormals(); return g; };
  b.add(tri(V(-hw, h, -hd), V(-hw, h, hd), V(-hw, h + rh, 0)), wall, m);
  b.add(tri(V(hw, h, hd), V(hw, h, -hd), V(hw, h + rh, 0)), wall, m);
  b.add(boxGeo(V(-0.45 * s, 0, hd), V(0.45 * s, 1.9 * s, hd + 0.04)), mat("saunaDoor", "#5a3a28"), m);
  b.add(quad(V(hw * 0.35, 1.2 * s, hd + 0.05), V(hw * 0.8, 1.2 * s, hd + 0.05), V(hw * 0.8, 1.7 * s, hd + 0.05), V(hw * 0.35, 1.7 * s, hd + 0.05)), mat("saunaWin", "#ffd88a"), m);
  const cx = -hw * 0.45;
  b.add(boxGeo(V(cx - 0.18, h, -0.18), V(cx + 0.18, h + rh + 0.9, 0.18)), mat("chim", "#5a5a5e"), m);
  const p = new THREE.Vector3(cx, h + rh + 1.2, 0).applyMatrix4(m);
  for (let k = 0; k < 4; k++) { const sz = 0.22 + k * 0.12; b.add(BALL, mat("smoke" + (k % 2), k % 2 ? "#f2f3f7" : "#fbfbfd"), S(p.x + k * 0.25, p.y + k * 0.45, p.z + Math.sin(k + seed) * 0.25, sz, sz * 0.8, sz)); }
};
/** wooden jetty from (x,z) out into the lake along -z */
const jetty = (b: Batch, x: number, z: number, len: number) => {
  for (let k = 0; k < len / 0.5; k++) b.add(boxGeo(V(x - 0.8, D0 + 0.25, z - k * 0.5 - 0.44), V(x + 0.8, D0 + 0.35, z - k * 0.5)), mat("jetty", k % 2 ? "#a8805a" : "#b88c64"));
  for (let k = 0; k <= len; k += 2) for (const sx of [-0.75, 0.75]) b.add(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), mat("jpost", "#6a4a30"), at(x + sx, D0 - 0.2, z - k));
};

export const buildTown = (root: THREE.Object3D) => {
  const b = new Batch(), r = rng(47);
  const flat = (x0: number, x1: number, z0: number, z1: number, dy: number) => {
    const y = D0 + dy, g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    return g;
  };
  b.add(flat(-900, 900, -900, 900, -0.06), mat("grass", GRASS));
  // main road (north-south) ending at the lake, side road at the crossroads
  b.add(flat(-3.6, 3.6, LAKE_Z + 9, 200, 0), mat("road", "#8a8f99"));
  b.add(flat(-200, 200, SIGN_Z - 3.6, SIGN_Z + 3.6, 0.002), mat("road", "#8a8f99"));
  for (let z = LAKE_Z + 10; z < 200; z += 6) if (Math.abs(z - SIGN_Z) > 4.5) b.add(flat(-0.12, 0.12, z, z + 3, 0.006), mat("dash", "#f4f1ea"));
  for (const sx of [-3.35, 3.35]) b.add(flat(sx - 0.1, sx + 0.1, LAKE_Z + 9, 200, 0.006), mat("edge", "#f4f1ea"));
  // grass tufts / meadow patches
  for (let i = 0; i < 300; i++) { const x = (r() - 0.5) * 160, z = (r() - 0.5) * 340; if (Math.abs(x) < 5 || (Math.abs(z - SIGN_Z) < 5)) continue; const s = 0.4 + r() * 0.6; b.add(BALL, mat("tuft", r() < 0.5 ? GRASS2 : "#8ccb62"), S(x, D0, z, s * 1.4, s * 0.35, s * 1.4)); }
  // wild flowers in the meadows
  for (let i = 0; i < 260; i++) { const x = (r() < 0.5 ? -1 : 1) * (5 + r() * 40), z = (r() - 0.5) * 300; b.add(BALL, mat("flower", ["#ffffff", "#ffd23f", "#c98ae8", "#ff8ab0"][i % 4]), S(x, D0 + 0.12, z, 0.09, 0.09, 0.09)); }
  const nearSet = (x: number, z: number) => Object.values(SETS).some((St) => Math.hypot(x - St.c[0], z - St.c[1]) < 9);
  const lakeArea = (x: number, z: number) => z < LAKE_Z + 2 && z > LAKE_Z - 90 && Math.abs(x) < 90;
  const courseArea = (x: number, z: number) => x > 0 && x < 40 && Math.abs(z - COURSE_Z) < 16;
  const busy = (x: number, z: number) => nearSet(x, z) || lakeArea(x, z) || courseArea(x, z) || Math.abs(x) < 6 || Math.abs(z - SIGN_Z) < 6;
  // ---- crossroads signpost (sets 1 and 5)
  signpost(b, -1.0, SIGN_Z - 4.6);
  // ---- the speeding stop (set 2): sports car on the shoulder, police car behind it, speed limit sign
  sportsCar(b, -1.8, ROAD_Z + 1.5, 0.04);
  policeCar(b, -1.9, ROAD_Z + 8.2, -0.03);
  speedSign(b, -4.6, ROAD_Z - 9, 0, "50");
  // ---- wife-carrying course (set 3), on the meadow east of the road
  { const x0 = 6, x1 = 36;
    b.add(flat(x0, x1, COURSE_Z - 4, COURSE_Z + 4, 0.004), mat("track", "#c8a070"));       // sandy track
    for (const x of [13, 25]) hurdle(b, x, COURSE_Z, 7.4);
    b.add(flat(17.5, 21.5, COURSE_Z - 3.8, COURSE_Z + 3.8, 0.01), mat("pit", "#4f9fd8"));   // water pit
    for (const [a0, a1, c0, c1] of [[17.3, 21.7, -4.0, -3.7], [17.3, 21.7, 3.7, 4.0], [17.3, 17.6, -4.0, 4.0], [21.4, 21.7, -4.0, 4.0]]) b.add(boxGeo(V(a0, D0, COURSE_Z + c0), V(a1, D0 + 0.18, COURSE_Z + c1)), mat("pitRim", "#7a5638"));
    for (let k = 0; k < 7; k++) { const s = 0.3 + (k % 3) * 0.12; b.add(BALL, mat("splash", "#e6f6ff"), S(18 + k * 0.5, D0 + 0.15, COURSE_Z - 2 + (k % 3) * 1.6, s, s * 0.4, s)); }
    // banner on two poles over the track
    for (const dz of [-4.6, 4.6]) b.add(new THREE.CylinderGeometry(0.1, 0.1, 5.4, 6), mat("bpole", "#f4f1ea"), at(33, D0 + 2.7, COURSE_Z + dz));
    const ban = lam("banner", () => ({ map: signHD("wifecarry", "#2f8f5a", "WIFE CARRYING", "WORLD CHAMPIONSHIP", "#ffffff") }));
    b.add(quad(V(32.95, D0 + 3.4, COURSE_Z - 4.5), V(32.95, D0 + 3.4, COURSE_Z + 4.5), V(32.95, D0 + 5.6, COURSE_Z + 4.5), V(32.95, D0 + 5.6, COURSE_Z - 4.5)), ban);
    // bunting flags (plain colours) along the track edges
    for (const dz of [-4.4, 4.4]) for (let x = x0; x < x1; x += 0.8) b.add(new THREE.ConeGeometry(0.16, 0.36, 3), mat("bunt", ["#ffd23f", "#e8443a", "#4fb3e8", "#5fae4a"][Math.floor(x) % 4]), new THREE.Matrix4().makeRotationX(Math.PI).setPosition(x, D0 + 1.7 + 0.15 * Math.sin(x), COURSE_Z + dz));
    for (const dz of [-4.4, 4.4]) for (let x = x0; x <= x1; x += 6.5) b.add(new THREE.CylinderGeometry(0.05, 0.05, 2, 5), mat("bpole", "#f4f1ea"), at(x, D0 + 1, COURSE_Z + dz));
    // grandstand behind the far side
    for (let row = 0; row < 4; row++) b.add(boxGeo(V(12, D0, COURSE_Z - 9 - row * 0.9), V(30, D0 + 0.45 + row * 0.45, COURSE_Z - 8.1 - row * 0.9)), mat("stand", row % 2 ? "#d8d2c0" : "#c8c0aa"));
    for (let i = 0; i < 46; i++) { const row = i % 4, x = 12.6 + ((i * 7) % 17) + r() * 0.6, y = D0 + 0.45 + row * 0.45; b.add(BALL, mat("fan", ["#e8443a", "#ffd23f", "#4fb3e8", "#f4f1ea", "#5fae4a", "#c98ae8"][i % 6]), S(x, y + 0.4, COURSE_Z - 8.5 - row * 0.9, 0.24, 0.4, 0.2)); b.add(BALL, mat("fanHead", "#f1c9a8"), S(x, y + 0.95, COURSE_Z - 8.5 - row * 0.9, 0.17, 0.17, 0.17)); }
    seesaw(b, 12.5, COURSE_Z + 3.4, 0);
  }
  // ---- the lake (set 4): blue water, reeds, red saunas on the shore, jetties, an island with spruces
  { const lz = LAKE_Z - 6;
    const water = new THREE.CircleGeometry(1, 48); water.rotateX(-Math.PI / 2);
    b.add(water, mat("lake", "#3f8fd0"), S(0, D0 + 0.02, lz - 60, 95, 1, 62));
    b.add(flat(-60, 60, lz - 2, lz + 1.2, 0.012), mat("shore", "#d8c8a0"));
    for (let k = 0; k < 40; k++) { const x = -55 + k * 2.8 + r(); if (Math.abs(x) < 4) continue; b.add(new THREE.ConeGeometry(0.12, 1.2, 4), mat("reed", "#5a8a3a"), at(x, D0 + 0.5, lz - 1.6 - r() * 0.8)); }
    for (const [x, dz, yaw, s, sd] of [[-2.6, 2.4, 0.2, 0.85, 0], [3.1, 1.6, -0.25, 0.8, 1], [-17, 1.0, 0.3, 0.9, 2], [18, 0.8, -0.35, 1.0, 0], [-34, 0.6, 0.2, 1.0, 1], [33, 0.4, -0.1, 0.9, 2]] as const) { sauna(b, x, lz + dz, yaw, s, sd); jetty(b, x + 2.4, lz - 0.8, 7); }
    for (const [ix, iz, is] of [[-18, lz - 55, 14], [30, lz - 80, 18]] as const) { sauna(b, ix + 3, iz + is * 0.45, 0.2, 1.4, 2); b.add(BALL, mat("island", GRASS2), S(ix, D0 - 1, iz, is, 2.5, is * 0.6)); for (let k = 0; k < 14; k++) spruce(b, ix + (r() - 0.5) * is * 1.3, iz + (r() - 0.5) * is * 0.7, 6 + r() * 5, k); }
    b.add(new THREE.CylinderGeometry(0.7, 0.9, 0.4, 10), mat("buoy", "#f4f1ea"), at(4, D0 + 0.1, lz - 18));
    // a rowing boat
    b.add(BALL, mat("boat", "#e8e0c8"), S(-4, D0 + 0.1, lz - 12, 0.9, 0.3, 2.2));
  }
  // ---- forest: spruces and birches everywhere that is free
  for (let i = 0; i < 420; i++) { const x = (r() < 0.5 ? -1 : 1) * (8 + r() * 120), z = (r() - 0.5) * 380; if (busy(x, z) || (Math.abs(x) < 16 && r() < 0.5)) continue; spruce(b, x, z, 7 + r() * 8, i); }
  for (let i = 0; i < 90; i++) { const x = (r() < 0.5 ? -1 : 1) * (6.5 + r() * 26), z = (r() - 0.5) * 340; if (!busy(x, z)) birch(b, x, z, 5 + r() * 3, i); }
  // a few red farm houses far off
  for (let k = 0; k < 6; k++) { const x = (k % 2 ? 1 : -1) * (45 + r() * 40), z = -120 + k * 55; if (!lakeArea(x, z)) sauna(b, x, z, r() * 3, 2.2, k); }
  // rolling green hills and far forest all round
  const hill = new THREE.SphereGeometry(1, 26, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + r() * 0.15, d = 460 + r() * 160, s = 90 + r() * 70; b.add(hill, mat("hillG", ["#5f9a4a", "#4f8a44", "#6aa652"][i % 3]), S(Math.cos(a) * d, D0 - 2, Math.sin(a) * d - 60, s * 1.4, 26 + r() * 30, s)); }
  for (let i = 0; i < 200; i++) { const a = r() * Math.PI * 2, d = 140 + r() * 140, x = Math.cos(a) * d, z = Math.sin(a) * d; if (!lakeArea(x, z)) spruce(b, x, z, 12 + r() * 8, i + 300); }
  b.build(root);
};
