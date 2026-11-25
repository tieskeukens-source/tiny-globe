// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxShadow, fxContact, fxArcs, fxNote, Gesture, Outfit, Expr, FrontOpts, SideOpts, HOST, HASAN, AYSE, TOURIST, TURK_BG, INK } from "./toon";
import { FPS, D0, V3, clamp01, smooth } from "./story";
import { LINES, PLAN, SETS, posOf, presentIn, FEST_Z, MARKET_Z, whistling, axes } from "./plan";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = Math.min(rt ? rt.width : r.domElement.width, rt ? rt.height : r.domElement.height) / 1080; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; wall?: number };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

export type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

export type Stage = { places: Place[]; fx: FxPlace[] };
export { person, blob, viewOf, lidAt, hh, q };
export const setLight = (n: "day" | "golden") => { LNAME = n; };

// ---------------- talking ----------------
const talking = (who: string, t: number) => LINES.some((l) => l.who === who && l.words.some(([a, b]) => t >= a - 0.03 && t < b + 0.02));
/** mouth flaps every 3 frames while the voice speaks; the eyes/brows alternate only every 24 frames */
const flap = (who: string, t: number, closed: Expr, open: Expr): Expr => (talking(who, t) && Math.floor((t * FPS) / 24) % 2 ? open : closed);
const mouthOf = (who: string, t: number) => talking(who, t) && Math.floor((t * FPS) / 3) % 2 === 0;
const lastSpeaker = (t: number) => { let w = "pin"; for (const l of LINES) { if (l.start <= t + 0.1) w = l.who; else break; } return w; };

const OUTFIT: Record<string, Outfit> = { pin: HOST, hasan: HASAN, ayse: AYSE, tourist: TOURIST };
const MOOD: Record<string, [Expr, Expr, Expr]> = { // idle, talk-closed, talk-open
  pin: ["smile_closed", "smile_closed", "grin"], hasan: ["smile_closed", "smile_closed", "grin"], ayse: ["smile_closed", "smile_closed", "grin"], tourist: ["neutral", "neutral", "stern"],
};
const exprOf = (who: string, t: number): Expr => {
  if (whistling(t, who)) return "whistle";
  const L = LINES.find((l) => l.who === who && t >= l.start - 0.1 && t < l.start + l.dur + 0.3);
  if (who === "pin" && L) {
    if (L.text.startsWith("Whoa") && t < L.start + 1.1) return "shock";
    if (L.i === 0) { const w = L.words.find((x) => x[2].startsWith("Wait")); if (w && t >= w[0] - LEAD) return "nervous"; }
    if (L.text.startsWith("And nobody")) return "nervous";
  }
  const m = MOOD[who];
  return talking(who, t) ? flap(who, t, m[1], m[2]) : m[0];
};

// ---------------- background twin pairs ----------------
const PAIRS: Outfit[] = TURK_BG;
type Pair = { x: number; z: number; pal: number; lat: number };
const pairsFor = (ch: number): Pair[] => {
  const S = SETS[ch], r = (k: number) => hh(ch * 97 + k, 3), out: Pair[] = [], A = axes(S.az);
  if (ch === 4) {   // tea garden: guests on the stools round the tables behind the cast, two strollers
    const seats: [number, number][] = [];
    for (const [tx, tz] of [[-4, 4.5], [4.2, 5], [-1.5, 8.5]] as const) for (const a of [1, 3.1, 5.2]) seats.push([tx + Math.cos(a), tz + Math.sin(a)]);
    for (let k = 0; k < 9; k++) {
      if (k % 2 === 0 && k < 4) { const lat = (k ? 1 : -1) * 5; out.push({ x: lat, z: S.c[1] + 11, pal: k % PAIRS.length, lat }); continue; }
      const [sx, sz] = seats[k]; out.push({ x: sx, z: S.c[1] + sz, pal: Math.floor(r(k + 80) * PAIRS.length), lat: sx });
    }
    return out;
  }
  for (let k = 0; k < 9; k++) {   // villagers along the lane / square behind the cast, left and right
    const lat = (k % 2 ? 1 : -1) * (3.2 + r(k) * 11), depth = 1.2 + r(k + 40) * 2.6;
    out.push({ x: S.c[0] + A.r[0] * lat - A.f[0] * depth, z: S.c[1] + A.r[1] * lat - A.f[1] * depth, pal: Math.floor(r(k + 80) * PAIRS.length), lat });
  }
  return out;
};
const PAIR_CACHE: Record<number, Pair[]> = {};


// ---------------- acting: gestures + emotions on the exact words ----------------
type Cue = { who: string; line: string; word: string; until?: string; gesture?: Gesture; expr?: Expr; hop?: boolean };
const CUES: Cue[] = [
  { who: "pin", line: "Did you know", word: "Turkey", gesture: "point", hop: true },
  { who: "pin", line: "Did you know", word: "whistling", gesture: "up", expr: "grin" },
  { who: "pin", line: "That whistle just said", word: "Hasan", until: "tea", gesture: "point", expr: "grin" },
  { who: "hasan", line: "I am coming", word: "coming", gesture: "up", expr: "grin", hop: true },
  { who: "pin", line: "called", word: "bird", gesture: "up", hop: true },
  { who: "pin", line: "Every Turkish word", word: "whistle", gesture: "mouth" },
  { who: "tourist", line: "Any word?", word: "Any", gesture: "shrug", expr: "shock" },
  { who: "ayse", line: "Even your name", word: "Even", until: "name", gesture: "point", expr: "grin" },
  { who: "tourist", line: "Even your name", word: "name", expr: "shock" },
  { who: "pin", line: "so steep", word: "steep", until: "hour", gesture: "up" },
  { who: "hasan", line: "A shout gets lost", word: "shout", until: "valley", gesture: "shrug" },
  { who: "hasan", line: "A shout gets lost", word: "whistle", until: "mile", gesture: "mouth", expr: "grin" },
  { who: "tourist", line: "A shout gets lost", word: "half", until: "mile", expr: "shock" },
  { who: "pin", line: "four hundred", word: "four", until: "years", gesture: "up", hop: true },
  { who: "tourist", line: "everyone has a phone", word: "phone", gesture: "point", expr: "smile" },
  { who: "ayse", line: "stopped whistling", word: "Yes", until: "whistling", expr: "nervous" },
  { who: "pin", line: "UNESCO", word: "UNESCO", until: "danger", gesture: "up", expr: "grin", hop: true },
  { who: "tourist", line: "UNESCO", word: "danger", expr: "shock" },
  { who: "pin", line: "kids learn", word: "festival", until: "year", gesture: "up", expr: "grin" },
  { who: "tourist", line: "what did she", word: "what", until: "me", gesture: "shrug", expr: "nervous" },
  { who: "hasan", line: "talk too much", word: "talk", until: "much", gesture: "point", expr: "laugh", hop: true },
  { who: "ayse", line: "talk too much", word: "talk", expr: "laugh" },
  { who: "pin", line: "talk too much", word: "much", expr: "laugh" },
  { who: "tourist", line: "talk too much", word: "much", expr: "shock" },
];
const wordT = (line: string, word: string, end = false): number => {
  const L = LINES.find((l) => l.text.toLowerCase().includes(line.toLowerCase()));
  const w = L?.words.find((x) => x[2].toLowerCase().replace(/[^a-z]/g, "").startsWith(word.toLowerCase()));
  return w ? (end ? w[1] : w[0]) : -1;
};
const CUE_T = CUES.map((c) => { const a = wordT(c.line, c.word) - 0.12; const b = c.until ? wordT(c.line, c.until, true) + 0.35 : a + 1.3; return { ...c, a, b: Math.max(b, a + 0.9) }; }).filter((c) => c.a > 0);
/** active cue for who at t: gesture amount eases in/out over ~0.2 s */
const cueOf = (who: string, t: number) => {
  for (const c of CUE_T) if (c.who === who && t >= c.a && t < c.b) return { c, g: Math.min(1, (t - c.a) / 0.2, (c.b - t) / 0.2) };
  return null;
};
const hopOf = (who: string, t: number) => {
  for (const c of CUE_T) if (c.who === who && c.hop && t >= c.a && t < c.a + 0.45) { const u = (t - c.a) / 0.45; return 0.16 * Math.sin(Math.PI * u); }
  return 0;
};

export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const P = PLAN[id - 1], ch = P.ch, spk = lastSpeaker(t);
  setLight(P.light);
  const speakerPos = posOf(ch, WHO_OK(ch, spk));
  const spkSide = (speakerPos[0] - cam.pos.x) * cam.right.x + (speakerPos[2] - cam.pos.z) * cam.right.z;
  presentIn(ch).forEach((who, i) => {
    const [x, , z] = posOf(ch, who);
    const mySide = (x - cam.pos.x) * cam.right.x + (z - cam.pos.z) * cam.right.z;
    const talk = talking(who, t);
    const facing = (who === spk ? (spkSide > 0 ? -1 : 1) : spkSide > mySide ? 1 : -1) as -1 | 1;
    const cu = cueOf(who, t), wh = whistling(t, who);
    const expr = wh ? "whistle" : cu?.c.expr && !(talking(who, t) && cu.c.expr === "laugh" && false) ? cu.c.expr : exprOf(who, t);
    const fo: FrontOpts = { phase: 0, expr, mode: "stand", look: 0, blink: lidAt(t, i), lift: 0, tilt: 0, facing, mouthOpen: mouthOf(who, t),
      gesture: wh ? "mouth" : cu?.c.gesture, g: wh ? 1 : cu?.g ?? 0,
      prop: who === "ayse" && (ch === 1 || ch === 4) && !wh && !cu?.c.gesture ? "tea" : null };
    const pl = person(cam, { i, o: OUTFIT[who], okey: who }, x, 0, z, { side: false, mirror: false }, fo, {});
    pl.y = (talk ? 0.012 * Math.abs(Math.sin(t * 11 + i)) : 0) + hopOf(who, t);
    pl.roll = talk ? 0.025 * Math.sin(t * 2.4 + i) : 0;
    out.places.push(pl);
    blob(out, x, 0, z);
    if (wh) {  // sound arcs + notes leaving the mouth, toward the side he faces
      const dir = facing, rx = cam.right.x * dir, rz = cam.right.z * dir, ph = Math.floor(t * FPS / 2) % 12;
      out.fx.push({ key: `arcs|${ph}`, cw: 400, ch: 400, draw: (p) => fxArcs(p, ph / 12), x: x + rx * 0.75, y: 1.62, z: z + rz * 0.75, w: 1.0, h: 1.0, rot: dir < 0 ? Math.PI : 0 });
      for (let n = 0; n < 3; n++) {
        const u = ((t * 0.9 + n / 3) % 1), kind = n % 2;
        out.fx.push({ key: `note|${kind}`, cw: 220, ch: 240, draw: (p) => fxNote(p, kind, "#ffd23f"), x: x + rx * (0.6 + u * 1.6), y: 1.7 + u * 1.1 + 0.15 * Math.sin(u * 9 + n), z: z + rz * (0.6 + u * 1.6), w: 0.32 * (1 - u * 0.3), h: 0.35 * (1 - u * 0.3) });
      }
    }
  });
  if (!PAIR_CACHE[ch]) PAIR_CACHE[ch] = pairsFor(ch);
  PAIR_CACHE[ch].forEach((p, k) => {
    {
      // every other villager strolls along the lane (wraps far outside the frame), the rest stand and chat
      const sit = ch === 4 && !(k % 2 === 0 && k < 4), walk = !sit && k % 2 === 0, A = axes(SETS[ch].az), dir = k % 4 === 0 ? 1 : -1, v = 0.9 + 0.25 * (k % 3);
      const L = walk ? ((((p.lat + dir * v * t) + 18) % 36) + 36) % 36 - 18 : p.lat, d = L - p.lat;
      const x = p.x + A.r[0] * d, z = p.z + A.r[1] * d, view = { side: false, mirror: false };
      const fo: FrontOpts = { phase: walk ? (t * 1.7 + k * 0.3) % 1 : 0, expr: k % 3 ? "grin" : "smile_closed", mode: walk ? "stroll" : sit ? "sit" : "stand", look: 0, blink: lidAt(t, 100 + k),
        lift: walk ? 60 : 0, tilt: 0, facing: (walk ? dir : k % 4 === 1 ? 1 : -1) as -1 | 1, mouthOpen: !walk && Math.floor(t * 4 + k) % 3 === 0,
        prop: !walk && k % 3 === 1 && PAIRS[p.pal].build !== "kid" ? "tea" : null };
      const pl = person(cam, { i: 100 + k, o: PAIRS[p.pal], okey: `pair${p.pal}` }, x, 0, z, view, fo, {});
      out.places.push(pl);
      blob(out, x, 0, z, 0.95, 0.9);
    }
  });
  return out;
};
const WHO_OK = (ch: number, who: string) => (presentIn(ch).includes(who) ? who : "pin");
