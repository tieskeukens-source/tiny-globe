// Shot plan for "The Town Where Almost Everyone Has a Twin", generated from the voice timeline: cuts land 2 frames before
// a line starts (and every ~3 s inside long lines, on a word gap), camera kind alternates single / two-shot / wide,
// azimuth alternates left / right, every hold creeps in; captions pop on the exact word.
import TL from "./timeline.json";
import type { V3, Light } from "./story";
const FPS = 30;
export const GATE_Z = 55;       // village entrance sign "OYMYAKON · POLE OF COLD"
export const SCHOOL_Z = -30;    // the school (east side of the road)
export const CARS_Z = -80;      // street with idling cars + outhouse (west side)
export const SPRING_Z = -130;   // steaming hot spring at the end of the road
/** episode texts for the overlay (title card + badge) */
export const EP = { title: "OYMYAKON", sub: "THE COLDEST VILLAGE ON EARTH", badge: "OYMYAKON, RUSSIA", flag: "ru" as const };

export type Word = [number, number, string];
export type Line = { i: number; f?: number; whistle?: boolean; who: string; chapter: number; text: string; start: number; dur: number; words: Word[] };
/** whistle gaps in the voice timeline belong to a character: Ayşe calls, Hasan answers, Ayşe whistles the visitor's name */
const WHISTLERS = ["ayse", "hasan", "ayse"];
export const LINES = (() => { let n = 0; return (TL as unknown as { lines: Line[] }).lines.map((l) => (l.who === "whistle" ? { ...l, who: WHISTLERS[n++ % 3], whistle: true, words: [] } : l)); })();
export const VOICE_TOTAL = (TL as unknown as { total: number }).total;
export const TOTAL = Math.round(VOICE_TOTAL * FPS);
export const LEAD = 2 / FPS;

// ---------------- where everyone stands, per chapter ----------------
type SetDef = { c: [number, number]; az: number; light: Light; clampX?: number };
export const SETS: Record<number, SetDef> = {
  1: { c: [0, 20], az: Math.PI / 2 - 0.15, light: "day" },        // dark-blue dawn, the school road between log houses
  2: { c: [0, SCHOOL_Z], az: -Math.PI / 2 + 0.15, light: "day" }, // in front of the school with the big thermometer
  3: { c: [0, CARS_Z], az: Math.PI / 2 + 0.2, light: "day" },     // idling cars in exhaust clouds, outhouse behind the fence
  4: { c: [0, SPRING_Z], az: 0, light: "day" },                   // the steaming hot spring
  5: { c: [0, GATE_Z - 7], az: Math.PI, light: "day" },           // village entrance sign, Yakut horses
};
/** lateral (screen-right) and toward-camera unit vectors of a chapter */
export const axes = (az: number) => ({ r: [Math.cos(az), -Math.sin(az)] as [number, number], f: [Math.sin(az), Math.cos(az)] as [number, number] });
const SLOT: [number, number][] = [[0, 0], [-1.35, -0.5], [1.35, -0.5], [2.7, -1.3]];
const WHO: Record<number, string[]> = { 1: ["pin", "sardaana"], 2: ["pin", "tourist", "sardaana"], 3: ["pin", "nikolai", "tourist"], 4: ["pin", "tourist", "sardaana"], 5: ["pin", "tourist", "nikolai", "sardaana"] };
/** world position of a main character in chapter ch (depth and left/right follow the chapter's camera side) */
export const posOf = (ch: number, who: string): V3 => {
  const S = SETS[ch], k = WHO[ch].indexOf(who), [dx, dz] = SLOT[Math.max(0, k)], { r, f } = axes(S.az);
  return [S.c[0] + r[0] * dx + f[0] * dz, 0, S.c[1] + r[1] * dx + f[1] * dz];
};
export const presentIn = (ch: number) => WHO[ch];

// ---------------- shots ----------------
export type Kind = "single" | "two" | "wide";
export type Plan = { id: number; a: number; b: number; ch: number; line: number; who: string; other: string; kind: Kind; az: number; light: Light; seed: number };
const nextStart = (i: number) => (i + 1 < LINES.length ? LINES[i + 1].start : VOICE_TOTAL);
const F = (t: number) => Math.round(t * FPS);
export const PLAN: Plan[] = [];
{
  let prevWho = "pin", n = 0;
  for (const L of LINES) {
    const S = SETS[L.chapter], cast = WHO[L.chapter];
    const t0 = L.start, t1 = nextStart(L.i);
    // cut points: line start, then every ~3 s on a word gap
    const cuts = [t0];
    const gaps = L.words.slice(1).map((w, k) => ({ t: w[0], gap: w[0] - L.words[k][1] })).filter((g) => g.t > t0 + 1.7 && g.t < t1 - 1.3);
    let last = t0;
    for (const g of gaps) if (g.t - last >= 1.9 && (g.gap > 0.1 || g.t - last > 2.6)) { cuts.push(g.t); last = g.t; }
    cuts.forEach((tc, k) => {
      const end = k + 1 < cuts.length ? cuts[k + 1] : t1;
      const first = L.i === 0 || LINES[L.i - 1].chapter !== L.chapter;
      const other = L.who === "pin" ? cast.find((c) => c !== "pin" && c !== prevWho) ?? "pin" : "pin";
      const kind: Kind = L.i === 0 && k === 0 ? "two" : first && k === 0 ? "wide" : k === 0 ? (L.who === "pin" || n % 3 !== 2 ? "single" : "two") : (k % 2 ? "two" : "single");
      const side = n % 2 ? 1 : -1;
      PLAN.push({ id: n + 1, a: F(tc) - (k === 0 ? 2 : 0), b: F(end) - 2, ch: L.chapter, line: L.i, who: L.who, other: cast.includes(other) ? other : "pin",
        kind, az: S.az + side * (kind === "wide" ? 0.2 : 0.12 + 0.1 * ((n >> 1) % 2)), light: S.light, seed: n });
      n++;
    });
    prevWho = L.who === "pin" ? prevWho : L.who;
  }
  // hold shots longer: merge short shots into the previous one (same chapter), so the camera can move through the scene
  const MINF = Math.round(2.2 * FPS), MAXF = Math.round(5 * FPS);
  for (let k = 1; k < PLAN.length; ) {
    const a = PLAN[k - 1], c = PLAN[k], da = a.b - a.a, dc = c.b - c.a;
    if (a.ch === c.ch && (da < MINF || dc < MINF * 0.7) && da + dc <= MAXF) {
      if (dc > da) { a.who = c.who; a.other = c.other; }
      a.b = c.b; if (!WHO[a.ch].includes(a.other)) a.other = "pin";
      PLAN.splice(k, 1);
    } else k++;
  }
  const KP: Kind[] = ["wide", "two", "single", "two", "wide", "single", "two", "wide", "two", "single", "two", "wide"];
  PLAN.forEach((q, i) => { q.id = i + 1; q.seed = i; q.kind = KP[i % KP.length]; if (!WHO[q.ch].includes(q.other) || q.other === q.who) q.other = WHO[q.ch].find((w) => w !== q.who) ?? "pin"; });
  PLAN[0].a = 0; PLAN[PLAN.length - 1].b = TOTAL;
  for (let k = 1; k < PLAN.length; k++) PLAN[k].a = PLAN[k - 1].b; // gapless
}

// ---------------- captions ----------------
export type Icon = "flag" | "bird" | "tea" | "notes" | "mountain" | "sound" | "hourglass" | "phone" | "down" | "shield" | "school" | "party" | "laugh" | "pin" | "thermo" | "snow" | "car" | "toilet" | "record" | "steam" | "sun";
type Cap = { a: number; b: number; text: string; col: string; icon?: Icon };
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
/** time of the first spoken word (whisper timing) in the line that contains `line`, matching any of `words` */
const find = (line: string, words: string[]): number => {
  const L = LINES.find((l) => l.text.toLowerCase().includes(line.toLowerCase()));
  if (!L) { console.warn("caption line not found", line); return -1; }
  const w = L.words.find((x) => words.some((k) => norm(x[2]).startsWith(norm(k))));
  return w ? w[0] : (console.warn("caption word not found", line, words), L.start + 0.2);
};
const cap = (line: string, words: string[], text: string, icon: Icon, col = "#ffd23f", dur = 1.5): Cap | null => {
  const t = find(line, words);
  return t < 0 ? null : { a: t - 1 / FPS, b: t + dur, text, col, icon };
};
const Y = "#ffd23f", WH = "#ffffff";
/** punch captions: big word + icon on the exact spoken word */
export const CAPS: Cap[] = [
  cap("Would you go", ["school"], "TO SCHOOL\u2026", "school", WH, 0.9),
  cap("Would you go", ["fifty", "50"], "\u221250 \u00b0C?!", "thermo", Y, 1.4),
  cap("I go every day", ["every"], "EVERY DAY!", "snow", WH, 1.0),
  cap("This is Oymyakon", ["Siberia"], "SIBERIA, RUSSIA", "pin", WH, 1.2),
  cap("This is Oymyakon", ["coldest"], "COLDEST VILLAGE ON EARTH", "snow", Y, 1.8),
  cap("doesn't close", ["close"], "NO SNOW DAYS?", "school", WH, 1.2),
  cap("Only when", ["fifty", "52"], "CLOSED BELOW \u221252 \u00b0C", "thermo", Y, 1.6),
  cap("older than eleven", ["fifty", "56"], "AGE 11+: \u221256 \u00b0C", "thermo", Y, 1.6),
  cap("cars running", ["running"], "ENGINES RUN ALL DAY", "car", Y, 1.6),
  cap("the toilet", ["Outside"], "TOILET = OUTSIDE", "toilet", WH, 1.4),
  cap("Be quick", ["quick"], "BE QUICK.", "laugh", WH, 1.2),
  cap("nineteen thirty", ["sixty", "67"], "\u221267.7 \u00b0C (1933)", "thermo", Y, 1.8),
  cap("nineteen thirty", ["Northern"], "COLDEST IN THE NORTH", "record", Y, 1.6),
  cap("unfrozen water", ["unfrozen"], "\u201cUNFROZEN WATER\u201d", "steam", Y, 1.6),
  cap("when is summer", ["summer"], "SUMMER?", "sun", WH, 1.0),
  cap("Tuesday", ["Tuesday"], "IT WAS ON TUESDAY.", "laugh", Y, 1.8),
].filter((c): c is Cap => !!c);
export const whistling = (t: number, who?: string) => LINES.some((l) => l.whistle && (!who || l.who === who) && t >= l.start && t < l.start + l.dur);
export const capAt = (t: number) => CAPS.find((c) => t >= c.a && t < c.b);
/** subtitles: every spoken word, in chunks of up to 3 words (break on punctuation); the word being said is yellow */
export type Sub = { a: number; b: number; words: Word[] };
export const SUBS: Sub[] = (() => {
  const out: Sub[] = [];
  for (const L of LINES) {
    if (L.whistle || !L.words.length) continue;
    let cur: Word[] = [];
    const FIX: Record<string, string> = {};
    const ws = L.words.map((w) => [w[0], w[1], FIX[w[2].toLowerCase()] ?? w[2]] as Word).filter((w) => w[2] !== "");
    ws.forEach((w, k) => {
      cur.push(w);
      const end = k === ws.length - 1 || cur.length >= 3 || /[.,!?:]$/.test(w[2]);
      if (end) { out.push({ a: cur[0][0] - 0.04, b: k === ws.length - 1 ? L.start + L.dur + 0.15 : ws[k + 1][0] - 0.04, words: cur }); cur = []; }
    });
  }
  return out;
})();
export const subAt = (t: number) => SUBS.find((s) => t >= s.a && t < s.b);
/** kicks (image shakes) on the biggest punch words */
export const KICKS: [number, number][] = CAPS.filter((c) => /50 °C\?|COLDEST VILLAGE|67\.7|TUESDAY/.test(c.text)).map((c) => [c.a + 1 / FPS, 0.8]);
