// Tiny Globe MAP world: the whole Earth as a toy table-top map. Every country is its own extruded tile (top at y = 0,
// so the country pins stand on it), floating in a bright cartoon ocean. 1 m = 1 degree (x = longitude, z = -latitude).
// Country colours are animated per frame (mapPaint): pastel political map -> gold (has the thing) / grey (does not),
// swept west to east. Little burgers pop up on the gold countries. Data: Natural Earth via world-atlas (public domain).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { feature } from "topojson-client";
import atlas from "world-atlas/countries-50m.json";
import { Batch, V, lam } from "./build";
import { D0 } from "./story";
import { HAS, PAINT_T, RAISE, mercY } from "./plan";

const mat = (k: string, c: string) => lam(k + c, () => ({ color: c }));
export const lonlat = (lon: number, lat: number): [number, number] => [lon, -mercY(lat)];
const TILE = 0.45;                                // tile thickness above the sea floor
const PASTEL = ["#f6c28b", "#9fd3a8", "#f2a6a0", "#b9b2e8", "#f4e28f", "#9ccfe6"];
export const GOLD = "#ffc23a", GREY = "#9aa0ab";

type Country = { name: string; mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; base: THREE.Color; lon: number; lat: number; burger?: THREE.Object3D };
export const COUNTRIES: Record<string, Country> = {};
/** a country's label point (centre of its biggest polygon), lon/lat */
export const centreOf = (name: string): [number, number] => { const c = COUNTRIES[name]; return c ? [c.lon, c.lat] : [0, 0]; };

const burgerGeo = (() => {
  const parts: [THREE.BufferGeometry, string][] = [];
  const bun = new THREE.SphereGeometry(0.5, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2); bun.scale(1, 0.75, 1); bun.translate(0, 0.42, 0);
  parts.push([bun, "#e8a24a"], [new THREE.CylinderGeometry(0.52, 0.52, 0.12, 18).translate(0, 0.36, 0), "#ffd23f"],
    [new THREE.CylinderGeometry(0.5, 0.5, 0.18, 18).translate(0, 0.24, 0), "#6a3a22"], [new THREE.CylinderGeometry(0.55, 0.52, 0.06, 18).translate(0, 0.32, 0), "#5fbf4a"],
    [new THREE.CylinderGeometry(0.48, 0.44, 0.16, 18).translate(0, 0.08, 0), "#e8a24a"]);
  return parts;
})();
const makeBurger = () => {
  const g = new THREE.Group();
  for (const [geo, c] of burgerGeo) g.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: c })));
  return g;
};

export const buildTown = (root: THREE.Object3D) => {
  const b = new Batch();
  // sea: deep blue floor + a lighter shelf ring look from the fog; latitude/longitude grid lines
  const sea = new THREE.PlaneGeometry(2400, 1600); sea.rotateX(-Math.PI / 2);
  b.add(sea, mat("sea", "#3d9be0"), new THREE.Matrix4().makeTranslation(0, D0 - TILE, 0));
  b.build(root);
  // countries
  const fc = feature(atlas as never, (atlas as never as { objects: { countries: never } }).objects.countries) as unknown as { features: { properties: { name: string }; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };
  fc.features.forEach((f, i) => {
    const name = f.properties.name;
    if (name === "Antarctica" || name === "Fr. S. Antarctic Lands" || name === "Heard I. and McDonald Is." || name === "S. Geo. and the Is.") return;
    const polys = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as number[][][][];
    const geos: THREE.BufferGeometry[] = [];
    let best = 0, bl = 0, bt = 0;
    for (const poly of polys) {
      const span = (() => { const xs = poly[0].map((q) => q[0]); return Math.max(...xs) - Math.min(...xs); })();
      // rings that cross the date line (Chukotka, Fiji...) are unwrapped east of 180 instead of smeared across the map
      const ring = (r: number[][]) => r.map(([lon, lat]) => new THREE.Vector2(span > 180 && lon < 0 ? lon + 360 : lon, mercY(lat)));
      const outer = ring(poly[0]);
      if (outer.length < 4) continue;
      const area = Math.abs(THREE.ShapeUtils.area(outer));
      if (area < 0.02) continue;              // drop specks
      const shape = new THREE.Shape(outer);
      for (const h of poly.slice(1)) shape.holes.push(new THREE.Path(ring(h)));
      const g = new THREE.ExtrudeGeometry(shape, { depth: TILE, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(-Math.PI / 2); g.translate(0, D0 - TILE, 0);
      geos.push(g);
      if (area > best) { best = area; bl = outer.reduce((s, p) => s + p.x, 0) / outer.length; bt = outer.reduce((s, p) => s + p.y, 0) / outer.length; }  // bt is already Mercator y
    }
    if (!geos.length) return;
    const geo = geos.length > 1 ? mergeGeometries(geos.map((g) => g.index ? g.toNonIndexed() : g)) : geos[0];
    geo.computeVertexNormals();
    const base = new THREE.Color(PASTEL[(i * 7) % PASTEL.length]);
    const m = new THREE.MeshLambertMaterial({ color: base.clone() });
    const mesh = new THREE.Mesh(geo, m);
    mesh.castShadow = false; mesh.receiveShadow = true;
    root.add(mesh);
    const c: Country = { name, mesh, mat: m, base, lon: bl, lat: bt };
    if (HAS.has(name) && best > 0.3) { c.burger = makeBurger(); c.burger.position.set(bl, D0, -bt); c.burger.visible = false; root.add(c.burger); }
    COUNTRIES[name] = c;
  });
  // hand-placed label points where the polygon average falls badly (concave / spread-out countries)
  const fix: Record<string, [number, number]> = { "United States of America": [-96.4, 41.4], Russia: [60, 60], Canada: [-105, 58], France: [2.5, 46.5], Norway: [9, 61], Chile: [-71, -33],
    Indonesia: [114, -1], Japan: [138.5, 36.5], Croatia: [16, 45.4], Malaysia: [102, 4], "New Zealand": [173, -41], Philippines: [122, 13], Vietnam: [106, 15], Iceland: [-18.6, 64.9], Bolivia: [-64.5, -17] };
  buildProps();
  for (const [n, [lon, lat]] of Object.entries(fix)) { const c = COUNTRIES[n]; if (c) { c.lon = lon; c.lat = mercY(lat); c.burger?.position.set(lon, D0, -mercY(lat)); } }
};

// ---------------- story props on the featured countries (children of the tile, so they lift with it) ----------------
const L = (c: string) => new THREE.MeshLambertMaterial({ color: c });
const addTo = (name: string, lon: number, lat: number, obj: THREE.Object3D, yaw = 0) => {
  const c = COUNTRIES[name]; if (!c) return;
  obj.position.set(lon, D0, -mercY(lat)); obj.rotation.y = yaw; c.mesh.add(obj);
};
const cone = (r: number, h: number, col: string, cap?: string) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.ConeGeometry(r, h, 14), L(col)).translateY(h / 2));
  if (cap) g.add(new THREE.Mesh(new THREE.ConeGeometry(r * 0.38, h * 0.38, 14), L(cap)).translateY(h * 0.81 + 0.01)); return g; };
const buildProps = () => {
  // Iceland: the last burger in its glass case on a pedestal + a little volcano
  { const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.0), L("#e8e4dc")).translateY(0.45));
    const bur = makeBurger(); bur.scale.setScalar(0.55); bur.position.set(-0.15, 0.9, 0); g.add(bur);
    const fries = new THREE.Group(); fries.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.2), L("#d8342b")).translateY(0.16));
    for (let k = 0; k < 6; k++) fries.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), L("#ffd23f")).translateX(-0.1 + k * 0.04).translateY(0.4 + (k % 2) * 0.04));
    fries.position.set(0.32, 0.9, 0.05); g.add(fries);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.9), new THREE.MeshLambertMaterial({ color: "#cfefff", transparent: true, opacity: 0.28, depthWrite: false }));
    glass.position.y = 1.3; g.add(glass);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.06, 0.94), L("#5a5f6a")).translateY(1.72));
    addTo("Iceland", -17.9, 65.45, g, 0.1);
    const v = cone(1.8, 2.4, "#5a4a48", "#f4f4f8"); addTo("Iceland", -21.2, 67.2, v);
    for (let k = 0; k < 4; k++) { const sm = new THREE.Mesh(new THREE.SphereGeometry(0.35 + k * 0.18, 10, 8), L("#e8e8ee")); sm.position.set(0.2 * k, 2.8 + k * 0.55, 0); v.add(sm); }
  }
  // Bolivia: the giant empanada on a plate + snowy Andes behind
  { const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 0.12, 24), L("#f4f1ea")).translateY(0.06));
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 12, 0, Math.PI), L("#f2b05a")); e.rotation.x = -Math.PI / 2; e.scale.set(1, 0.55, 1); e.position.y = 0.12; g.add(e);
    for (let k = 0; k < 9; k++) { const a = (k / 8) * Math.PI; g.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), L("#c97a2a")).translateX(Math.cos(a) * 0.82).translateZ(0).translateY(0.12 + Math.sin(a) * 0.45)); }
    addTo("Bolivia", -63.9, -16.1, g, 0.25);
    for (const [lon, lat, h] of [[-66.8, -12.6, 4.2], [-68.4, -13.6, 5.2], [-62.0, -12.2, 3.6]] as const) addTo("Bolivia", lon, lat, cone(1.8, h, "#8a6a5a", "#ffffff"));
  }
  // Russia: an onion-dome church (simple, generic)
  { const g = new THREE.Group(), cols = ["#e8443a", "#2f8f5a", "#3a6fe8", "#ffc23a"];
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.8), L("#f4e8d8")).translateY(0.8));
    for (const [x, z, h, k] of [[0, 0, 2.4, 0], [-0.9, 0.5, 1.7, 1], [0.9, 0.5, 1.7, 2], [-0.9, -0.5, 1.5, 3], [0.9, -0.5, 1.5, 1]] as const) {
      const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, h, 12), L("#f4e8d8")); tw.position.set(x, 1.6 + h / 2 - 0.4, z); g.add(tw);
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), L(cols[k])); d.scale.set(1, 1.15, 1); d.position.set(x, 1.6 + h - 0.2, z); g.add(d);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 10), L(cols[k])); tip.position.set(x, 1.6 + h + 0.4, z); g.add(tip);
    }
    addTo("Russia", 92.6, 63.5, g, -0.2);
    for (let k = 0; k < 12; k++) addTo("Russia", 84 + (k % 6) * 2.4 + (k > 5 ? 1 : 0), 66.4 + Math.floor(k / 6) * 0.6, cone(0.5, 1.9, "#2f6a48"));
  }
  // USA: a little skyline behind the giant burger
  { for (const [lon, lat, h, c] of [[-101.0, 43.0, 4.5, "#b8c8e8"], [-99.6, 43.4, 6.2, "#cfd8ee"], [-102.4, 43.6, 3.4, "#a8b8dc"], [-98.2, 43.8, 5.0, "#c0cce8"]] as const) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.0, h, 1.0), L(c)); b.position.y = h / 2; const g = new THREE.Group(); g.add(b);
      for (let y = 0.6; y < h - 0.3; y += 0.6) g.add(new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.18, 1.02), L("#ffe9a8")).translateY(y));
      addTo("United States of America", lon, lat, g);
    } }
};

const tmp = new THREE.Color(), GOLD_C = new THREE.Color(GOLD), GREY_C = new THREE.Color(GREY);
/** per-frame map state: gold/grey sweep from west to east starting at PAINT_T, burgers pop, featured country lifts */
export const mapPaint = (t: number) => {
  for (const c of Object.values(COUNTRIES)) {
    const t0 = PAINT_T + ((c.lon + 180) / 360) * 1.6, u = Math.max(0, Math.min(1, (t - t0) / 0.25));
    tmp.copy(c.base).lerp(HAS.has(c.name) ? GOLD_C : GREY_C, u);
    c.mat.color.copy(tmp);
    const r = RAISE(c.name, t);
    c.mesh.position.y = r;
    if (c.burger) {
      const k = Math.max(0, Math.min(1, (t - t0 - 0.1) / 0.3)), pop = k < 1 ? Math.sin(k * Math.PI * 0.5) * (1 + 0.35 * Math.sin(k * Math.PI)) : 1;
      c.burger.visible = k > 0; c.burger.scale.setScalar(Math.max(0.001, pop) * 1.2); c.burger.position.y = D0 + r;
      c.burger.rotation.y = t * 0.8 + c.lon;
    }
  }
};
