// Oymyakon, Yakutia: the coldest permanently inhabited village. Deep snow, an icy road, dark log houses with blue carved
// window frames and snow on the roofs, chimney smoke, larches with snow caps, the school with a big thermometer,
// cars idling in clouds of exhaust, an outhouse, a steaming hot spring, shaggy Yakut horses, white hills all round.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad } from "./build";
import { rng, signHD, ctex } from "./paint";
import { D0 } from "./story";
import { SETS, SCHOOL_Z, CARS_Z, SPRING_Z, GATE_Z } from "./plan";

const mat = (k: string, c: string) => lam(k + c, () => ({ color: c }));
const at = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const S = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion(), V(sx, sy, sz));
const SNOW = "#f2f5fb", SNOW2 = "#e3e9f4", ICE = "#cfd9e8";
const BALL = new THREE.SphereGeometry(1, 14, 10);

/** larch / spruce with snow on the branches */
const spruce = (b: Batch, x: number, z: number, h: number, seed: number, y0 = 0) => {
  b.add(new THREE.CylinderGeometry(0.1, 0.18, h * 0.25, 6), mat("trunk", "#4a3426"), at(x, y0 + h * 0.12, z));
  for (let i = 0; i < 3; i++) {
    const y = y0 + h * (0.3 + i * 0.22), r = h * (0.28 - i * 0.07);
    b.add(new THREE.ConeGeometry(r, h * 0.4, 9), mat("spr", ["#2b4f44", "#24463d", "#315a4c"][(seed + i) % 3]), at(x, y, z));
    b.add(new THREE.ConeGeometry(r * 0.72, h * 0.22, 9), mat("sprSnow", SNOW), at(x, y + h * 0.1, z));
  }
};
/** bare birch: white trunk with black marks */
const birch = (b: Batch, x: number, z: number, h: number) => {
  b.add(new THREE.CylinderGeometry(0.1, 0.16, h, 7), mat("birch", "#eeeae2"), at(x, h / 2, z));
  for (let k = 0; k < 4; k++) b.add(boxGeo(V(x - 0.17, h * (0.2 + k * 0.18), z - 0.05), V(x + 0.17, h * (0.2 + k * 0.18) + 0.08, z + 0.05)), mat("birchM", "#2a2a2e"));
  for (const [a, l] of [[0.7, 1.4], [-0.8, 1.2], [2.3, 1.1]] as const) b.add(new THREE.CylinderGeometry(0.03, 0.05, l, 5), mat("birchB", "#6a5a50"), new THREE.Matrix4().makeRotationZ(a).setPosition(x + Math.sin(-a) * l * 0.4, h * 0.8, z));
};
/** carved window frame (nalichnik) texture: blue frame, white fretwork, warm lit glass */
const winTex = () => ctex("nalichnik", 256, 320, (g) => {
  g.fillStyle = "#2f6fb5"; g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#ffffff"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(16 + i * 32, 30, 14, 0, Math.PI); g.fill(); g.beginPath(); g.arc(16 + i * 32, 296, 14, Math.PI, 0); g.fill(); }
  g.fillStyle = "#ffe08a"; g.fillRect(40, 60, 176, 200);
  g.fillStyle = "#ffcf6a"; g.fillRect(40, 160, 176, 100);
  g.fillStyle = "#2f6fb5"; g.fillRect(122, 60, 12, 200); g.fillRect(40, 150, 176, 12);
  g.strokeStyle = "#ffffff"; g.lineWidth = 10; g.strokeRect(34, 54, 188, 212);
});
const winMat = () => lam("winM", () => ({ map: winTex() }));
/** Siberian log house: dark log walls, blue carved windows, snowy gable roof, chimney with smoke */
const logHouse = (b: Batch, x: number, z: number, yaw: number, w: number, d: number, h: number, seed: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z), logs = mat("logs", ["#6b4a32", "#5a3e2a", "#7a5838"][seed % 3]);
  const hw = w / 2, hd = d / 2;
  b.add(boxGeo(V(-hw, 0, -hd), V(hw, h, hd), 0), logs, m);
  for (let y = 0.35; y < h; y += 0.42) for (const sz of [-1, 1]) b.add(boxGeo(V(-hw - 0.05, y, sz * hd - 0.06), V(hw + 0.05, y + 0.06, sz * hd + 0.06)), mat("logLine", "#3e2a1c"), m);
  for (let y = 0.35; y < h; y += 0.42) for (const sx of [-1, 1]) b.add(boxGeo(V(sx * hw - 0.06, y, -hd - 0.05), V(sx * hw + 0.06, y + 0.06, hd + 0.05)), mat("logLine", "#3e2a1c"), m);
  const nw = Math.max(1, Math.floor(w / 2.4));
  for (let i = 0; i < nw; i++) { const cx = -hw + (i + 0.5) * w / nw; b.add(quad(V(cx - 0.6, 0.9, hd + 0.02), V(cx + 0.6, 0.9, hd + 0.02), V(cx + 0.6, 2.4, hd + 0.02), V(cx - 0.6, 2.4, hd + 0.02)), winMat(), m); }
  const rh = d * 0.38, o = 0.5, roof = mat("roofDark", "#3a3030"), snow = mat("roofSnow", SNOW);
  b.add(quad(V(-hw - o, h - 0.2, hd + o), V(hw + o, h - 0.2, hd + o), V(hw + o, h + rh, 0), V(-hw - o, h + rh, 0)), snow, m);
  b.add(quad(V(hw + o, h - 0.2, -hd - o), V(-hw - o, h - 0.2, -hd - o), V(-hw - o, h + rh, 0), V(hw + o, h + rh, 0)), snow, m);
  b.add(boxGeo(V(-hw - o, h - 0.35, hd + o - 0.05), V(hw + o, h - 0.2, hd + o + 0.05)), roof, m);
  b.add(boxGeo(V(-hw - o, h - 0.35, -hd - o - 0.05), V(hw + o, h - 0.2, -hd - o + 0.05)), roof, m);
  const tri = (a: THREE.Vector3, c: THREE.Vector3, e: THREE.Vector3) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([a, c, e].flatMap((v) => [v.x, v.y, v.z]), 3)); g.computeVertexNormals(); return g; };
  b.add(tri(V(-hw, h, -hd), V(-hw, h, hd), V(-hw, h + rh, 0)), logs, m);
  b.add(tri(V(hw, h, hd), V(hw, h, -hd), V(hw, h + rh, 0)), logs, m);
  // icicles along the front eave
  for (let k = 0; k < w * 2; k++) { const ix = -hw - o + 0.3 + k * 0.5, l = 0.25 + ((k * 37) % 5) * 0.12; b.add(new THREE.ConeGeometry(0.06, l, 5), mat("icicle", "#d8ecfa"), new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeRotationX(Math.PI).setPosition(ix, h - 0.35 - l / 2, hd + o))); }
  // chimney + smoke column
  const cx = hw * 0.4;
  b.add(boxGeo(V(cx - 0.35, h, -0.35), V(cx + 0.35, h + rh + 1.2, 0.35)), mat("chim", "#8a7a70"), m);
  const p = new THREE.Vector3(cx, h + rh + 1.6, 0).applyMatrix4(m);
  for (let k = 0; k < 6; k++) { const s = 0.5 + k * 0.32; b.add(BALL, mat("smoke" + (k % 2), k % 2 ? "#e8e6ee" : "#f6f4fa"), S(p.x + k * 0.35, p.y + k * 0.75, p.z + Math.sin(k + seed) * 0.3, s, s * 0.8, s)); }
  // door + porch
  b.add(boxGeo(V(hw - 1.6, 0, hd), V(hw - 0.6, 2.1, hd + 0.05)), mat("door", "#2f5f8a"), m);
};
/** boxy Soviet-style car (UAZ-like), engine running: exhaust cloud behind */
const car = (b: Batch, x: number, z: number, yaw: number, col: string, smoke = true) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z);
  b.add(boxGeo(V(-0.9, 0.45, -2.0), V(0.9, 1.35, 2.0)), mat("car", col), m);
  b.add(boxGeo(V(-0.85, 1.35, -1.3), V(0.85, 2.1, 1.1)), mat("car", col), m);
  b.add(boxGeo(V(-0.86, 1.45, 1.05), V(0.86, 2.0, 1.12)), mat("carWin", "#9ac4e8"), m);
  for (const sx of [-0.88, 0.88]) b.add(boxGeo(V(sx - 0.02, 1.45, -1.2), V(sx + 0.02, 2.0, 0.9)), mat("carWin", "#9ac4e8"), m);
  b.add(boxGeo(V(-0.95, 2.1, -1.35), V(0.95, 2.3, 1.15)), mat("carSnow", SNOW), m);
  for (const sx of [-0.92, 0.92]) for (const sz of [-1.3, 1.3]) b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12), mat("tyre", "#222228"), new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(sx, 0.42, sz)));
  for (const sx of [-0.6, 0.6]) b.add(boxGeo(V(sx - 0.18, 0.95, 2.0), V(sx + 0.18, 1.15, 2.04)), mat("lamp", "#fff2b0"), m);
  if (smoke) { const p = new THREE.Vector3(0.5, 0.5, -2.3).applyMatrix4(m), q = new THREE.Vector3(0, 0, -1).transformDirection(m);
    for (let k = 0; k < 7; k++) { const s = 0.35 + k * 0.28; b.add(BALL, mat("exh" + (k % 2), k % 2 ? "#e2e4ec" : "#f4f5fa"), S(p.x + q.x * k * 0.55, p.y + k * 0.32, p.z + q.z * k * 0.55, s, s * 0.85, s)); } }
};
/** Yakut horse: stocky, shaggy, white-grey, frost on the back */
const horse = (b: Batch, x: number, z: number, yaw: number, col: string) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z), c = mat("horse" + col, col), dark = mat("mane", "#5a4a40");
  b.add(BALL, c, new THREE.Matrix4().multiplyMatrices(m, S(0, 1.15, 0, 0.6, 0.5, 1.0)));
  for (const sx of [-0.3, 0.3]) for (const sz of [-0.6, 0.6]) b.add(new THREE.CylinderGeometry(0.11, 0.13, 0.9, 7), c, new THREE.Matrix4().multiplyMatrices(m, at(sx, 0.45, sz)));
  b.add(BALL, c, new THREE.Matrix4().multiplyMatrices(m, new THREE.Matrix4().makeRotationX(-0.7).multiply(S(0, 0, 0, 0.26, 0.28, 0.55)).setPosition(0, 1.6, 1.05)));
  b.add(BALL, c, new THREE.Matrix4().multiplyMatrices(m, S(0, 1.55, 1.45, 0.22, 0.22, 0.34)));
  b.add(BALL, dark, new THREE.Matrix4().multiplyMatrices(m, S(0, 1.75, 0.95, 0.1, 0.3, 0.5)));
  b.add(BALL, dark, new THREE.Matrix4().multiplyMatrices(m, S(0, 1.0, -1.05, 0.12, 0.45, 0.12)));
  b.add(BALL, mat("frost", SNOW), new THREE.Matrix4().multiplyMatrices(m, S(0, 1.55, 0, 0.45, 0.12, 0.8)));
};
/** outhouse: small plank booth with a heart in the door, snow on the roof */
const outhouse = (b: Batch, x: number, z: number, yaw: number) => {
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, D0, z);
  b.add(boxGeo(V(-0.7, 0, -0.7), V(0.7, 2.3, 0.7), 0), mat("oh", "#8a6040"), m);
  b.add(boxGeo(V(-0.85, 2.3, -0.85), V(0.85, 2.5, 0.85)), mat("ohRoof", "#4a3a30"), m);
  b.add(boxGeo(V(-0.85, 2.5, -0.85), V(0.85, 2.75, 0.85)), mat("roofSnow", SNOW), m);
  b.add(boxGeo(V(-0.55, 0.05, 0.7), V(0.55, 2.05, 0.73)), mat("ohDoor", "#a8744a"), m);
  const heart = new THREE.Shape(); heart.moveTo(0, -0.12); heart.bezierCurveTo(-0.2, 0.02, -0.12, 0.18, 0, 0.08); heart.bezierCurveTo(0.12, 0.18, 0.2, 0.02, 0, -0.12);
  b.add(new THREE.ShapeGeometry(heart), mat("ohHeart", "#2a1a10"), new THREE.Matrix4().multiplyMatrices(m, at(0, 1.7, 0.74)));
};
/** thermometer board: big round dial style sign with the reading */
const thermoTex = (txt: string) => ctex("thermo" + txt, 256, 640, (g) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 256, 640); g.strokeStyle = "#1b1b1f"; g.lineWidth = 12; g.strokeRect(6, 6, 244, 628);
  g.fillStyle = "#dfe6ee"; g.fillRect(104, 40, 48, 470); g.strokeRect(104, 40, 48, 470);
  g.fillStyle = "#2f6fd8"; g.fillRect(110, 400, 36, 110); g.beginPath(); g.arc(128, 540, 46, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = "#1b1b1f"; for (let k = 0; k < 9; k++) g.fillRect(160, 60 + k * 50, 36, 8);
  g.font = "bold 60px 'Lilita One', Impact, sans-serif"; g.textAlign = "center"; g.fillStyle = "#2f6fd8"; g.fillText(txt, 128, 625);
});
/** steaming hot spring: dark water, ice rim, rising steam */
const spring = (b: Batch, x: number, z: number) => {
  b.add(new THREE.CylinderGeometry(6, 6, 0.1, 32), mat("spWater", "#2f6f8a"), at(x, D0 + 0.03, z));
  b.add(new THREE.TorusGeometry(6.1, 0.45, 8, 32), mat("spIce", ICE), new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(x, D0 + 0.1, z));
};

export const buildTown = (root: THREE.Object3D) => {
  const b = new Batch(), r = rng(31);
  const flat = (x0: number, x1: number, z0: number, z1: number, dy: number) => {
    const y = D0 + dy, g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    return g;
  };
  b.add(flat(-900, 900, -900, 900, -0.06), mat("snowG", SNOW));
  b.add(flat(-4.5, 4.5, -200, 200, 0), mat("road", "#b9c6da"));
  for (const sx of [-1.6, 1.6]) b.add(flat(sx - 0.25, sx + 0.25, -200, 200, 0.004), mat("track", "#b3bfd2"));  // tyre tracks
  // snowbanks along the road
  const nearSet = (z: number) => Object.values(SETS).some((St) => Math.abs(z - St.c[1]) < 16);
  for (const sx of [-1, 1]) for (let z = -190; z < 190; z += 3.2 + r() * 2) { if (nearSet(z)) continue; const s = 0.7 + r() * 0.4; b.add(BALL, mat("bank", r() < 0.5 ? SNOW : SNOW2), S(sx * (5.4 + r() * 0.4), D0, z, s * 1.2, s * 0.4, s * 1.6)); }
  const corridor = (x: number, z: number) => Object.values(SETS).some((St) => Math.abs(Math.sin(St.az)) > 0.5 && Math.abs(z - St.c[1]) < 8.5 && x * Math.sign(Math.sin(St.az)) > 4.2 && Math.abs(x) < 25);
  const clear = (x: number, z: number) => corridor(x, z) || (Math.abs(z - SCHOOL_Z) < 13 && x > 4) || (Math.abs(z - SPRING_Z) < 10 && Math.abs(x) < 10) || (Math.abs(z - GATE_Z) < 4 && Math.abs(x) < 8);
  // log houses on both sides, fences in front
  for (const sx of [-1, 1]) {
    let z = -180;
    while (z < 180) {
      const w = [7, 8, 9][Math.floor(r() * 3)], cz = z + w / 2, cx = sx * (11 + r() * 3);
      if (!clear(cx, cz) && !clear(cx, z) && !clear(cx, z + w)) {
        logHouse(b, cx, cz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, 6, 3.0 + r() * 0.6, Math.floor(r() * 9));
        for (let fz = z; fz < z + w; fz += 0.5) b.add(boxGeo(V(sx * 6.4 - 0.05, D0, fz), V(sx * 6.4 + 0.05, D0 + 1.1, fz + 0.28)), mat("picket", "#7a5a40"));
        b.add(boxGeo(V(sx * 6.4 - 0.12, D0 + 1.1, z), V(sx * 6.4 + 0.12, D0 + 1.25, z + w)), mat("fenceSnow", SNOW));
      }
      z += w + 4 + r() * 8;
    }
    for (let k = 0; k < 6; k++) { let zz = -160 + k * 60 + r() * 20; if (!clear(sx * 23, zz)) logHouse(b, sx * (24 + r() * 6), zz, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 8, 6, 3.2, k + 3); }
  }
  // power line poles along the road
  for (let z = -180; z < 180; z += 22) { if (clear(-6, z)) continue; b.add(new THREE.CylinderGeometry(0.12, 0.15, 7.5, 6), mat("pole", "#5a4030"), at(-6.9, D0 + 3.75, z)); b.add(boxGeo(V(-7.8, D0 + 7, z - 0.06), V(-6.0, D0 + 7.12, z + 0.06)), mat("pole", "#5a4030")); }
  // school: two storeys, painted, big thermometer + sign
  { const x0 = 9, z0 = SCHOOL_Z - 10, z1 = SCHOOL_Z + 10, h = 7;
    b.add(boxGeo(V(x0, D0, z0), V(x0 + 9, D0 + h, z1), 0), mat("school", "#e9c35a"));
    b.add(boxGeo(V(x0 - 0.3, D0 + h, z0 - 0.3), V(x0 + 9.3, D0 + h + 0.4, z1 + 0.3)), mat("schoolRoof", "#5a4a4a"));
    b.add(boxGeo(V(x0 - 0.3, D0 + h + 0.4, z0 - 0.3), V(x0 + 9.3, D0 + h + 0.8, z1 + 0.3)), mat("roofSnow", SNOW));
    for (let fl = 0; fl < 2; fl++) for (let k = 0; k < 6; k++) { const zc = z0 + 2 + k * 3.2; if (fl === 0 && Math.abs(zc - SCHOOL_Z) < 2) continue; b.add(quad(V(x0 - 0.02, D0 + 1.0 + fl * 3.2, zc + 0.8), V(x0 - 0.02, D0 + 1.0 + fl * 3.2, zc - 0.8), V(x0 - 0.02, D0 + 2.7 + fl * 3.2, zc - 0.8), V(x0 - 0.02, D0 + 2.7 + fl * 3.2, zc + 0.8)), mat("schoolWin", "#ffe9a8")); }
    b.add(boxGeo(V(x0 - 0.06, D0, SCHOOL_Z - 1.1), V(x0, D0 + 2.4, SCHOOL_Z + 1.1)), mat("schoolDoor", "#2f6fb5"));
    const sg = lam("schoolSign", () => ({ map: signHD("school", "#2f6fb5", "SCHOOL · ШКОЛА", "OYMYAKON · OPEN UNTIL −52 °C", "#ffffff"), side: THREE.DoubleSide }));
    b.add(quad(V(x0 - 0.1, D0 + 4.4, SCHOOL_Z + 4), V(x0 - 0.1, D0 + 4.4, SCHOOL_Z - 4), V(x0 - 0.1, D0 + 6.6, SCHOOL_Z - 4), V(x0 - 0.1, D0 + 6.6, SCHOOL_Z + 4), 0, 1, 1, 0), sg);
    const th = lam("thermoM", () => ({ map: thermoTex("−50°C") }));
    b.add(quad(V(x0 - 0.12, D0 + 1.0, SCHOOL_Z - 2.2), V(x0 - 0.12, D0 + 1.0, SCHOOL_Z - 3.6), V(x0 - 0.12, D0 + 4.3, SCHOOL_Z - 3.6), V(x0 - 0.12, D0 + 4.3, SCHOOL_Z - 2.2), 0, 1, 1, 0), th);
  }
  // cars idling along the street (set 3), outhouse behind the fence
  for (const [x, z, yaw, c] of [[-7.6, CARS_Z - 4, 0, "#3f7a4a"], [-7.8, CARS_Z + 3, Math.PI, "#c9c2b0"], [-8.2, CARS_Z + 10, 0.1, "#8a3a3a"], [7.8, CARS_Z - 12, Math.PI, "#2f5f8a"]] as const) car(b, x, z, yaw, c);
  outhouse(b, -10.5, CARS_Z - 9.5, Math.PI / 2);
  // hot spring at the end of the road, horses and a sign near the village entrance
  spring(b, 0, SPRING_Z - 8);
  for (const [x, z, yaw, c] of [[-9, GATE_Z + 6, 0.6, "#e8e2d8"], [-11, GATE_Z + 9, 2.2, "#b8a890"], [10, 12, -0.8, "#dcd6cc"], [8.5, SPRING_Z - 16, 1.2, "#cfc4b2"]] as const) horse(b, x, z, yaw, c);
  const gw = mat("gatewood", "#5a3e2a");
  for (const sx of [-1, 1]) b.add(boxGeo(V(sx * 5.2 - 0.3, D0, GATE_Z - 0.3), V(sx * 5.2 + 0.3, D0 + 5.6, GATE_Z + 0.3), 0), gw);
  b.add(boxGeo(V(-5.6, D0 + 5.1, GATE_Z - 0.25), V(5.6, D0 + 5.35, GATE_Z + 0.25)), gw);
  b.add(boxGeo(V(-5.7, D0 + 5.35, GATE_Z - 0.3), V(5.7, D0 + 5.6, GATE_Z + 0.3)), mat("roofSnow", SNOW));
  const gs = lam("gateSign", () => ({ map: signHD("ogate", "#2f6fb5", "OYMYAKON", "POLE OF COLD · −67.7 °C", "#ffffff"), side: THREE.DoubleSide }));
  b.add(quad(V(4.8, D0 + 3.4, GATE_Z - 0.32), V(-4.8, D0 + 3.4, GATE_Z - 0.32), V(-4.8, D0 + 5.0, GATE_Z - 0.32), V(4.8, D0 + 5.0, GATE_Z - 0.32)), gs);
  b.add(quad(V(-4.8, D0 + 3.4, GATE_Z + 0.32), V(4.8, D0 + 3.4, GATE_Z + 0.32), V(4.8, D0 + 5.0, GATE_Z + 0.32), V(-4.8, D0 + 5.0, GATE_Z + 0.32)), gs);
  // trees: spruces/larches behind the houses, a few birches by the road
  for (let i = 0; i < 260; i++) { const sx = r() < 0.5 ? -1 : 1, x = sx * (18 + r() * 110), z = (r() - 0.5) * 380; if (clear(x, z) || Math.abs(x) < 17) continue; spruce(b, x, z, 6 + r() * 7, i); }
  for (let i = 0; i < 24; i++) { const sx = r() < 0.5 ? -1 : 1, x = sx * (7.4 + r() * 2.5), z = (r() - 0.5) * 340; if (!clear(x, z)) birch(b, x, z, 4 + r() * 2.5); }
  // white hills all round with dark forest dots
  const hill = new THREE.SphereGeometry(1, 26, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + r() * 0.15, d = 260 + r() * 160, s = 80 + r() * 70; b.add(hill, mat("hillS", ["#eef1f8", "#e2e8f3", "#f6f8fc"][i % 3]), S(Math.cos(a) * d, D0 - 2, Math.sin(a) * d, s * 1.4, 30 + r() * 40, s)); }
  for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, d = 140 + r() * 140; spruce(b, Math.cos(a) * d, Math.sin(a) * d, 12 + r() * 8, i + 300); }
  b.build(root);
};
