// Shot plan for "The Town Where Almost Everyone Has a Twin", generated from the voice timeline: cuts land 2 frames before
// a line starts (and every ~3 s inside long lines, on a word gap), camera kind alternates single / two-shot / wide,
// azimuth alternates left / right, every hold creeps in; captions pop on the exact word.
import TL from "./timeline.json";
import type { V3, Light } from "./story";
const FPS = 30;
export const GATE_Z = 26;       // town gate across the street
export const MARKET_Z = -32;    // centre of the market square
export const FEST_Z = 62;       // festival square, stage at the far end

export type Word = [number, number, string];
export type Line = { i: number; who: string; chapter: number; text: string; start: number; dur: number; words: Word[] };
export const LINES = (TL as unknown as { lines: Line[] }).lines;
export const VOICE_TOTAL = (TL as unknown as { total: number }).total;
export const TOTAL = Math.round(VOICE_TOTAL * FPS);
export const LEAD = 2 / FPS;

// ---------------- where everyone stands, per chapter ----------------
type SetDef = { c: [number, number]; az: number; light: Light; clampX?: number };
export const SETS: Record<number, SetDef> = {
  1: { c: [0, 15], az: Math.PI, light: "day" },
  2: { c: [0, MARKET_Z + 1], az: 0.2, light: "day", clampX: 9 },
  3: { c: [0, -62], az: -0.4, light: "day" },
  4: { c: [0, FEST_Z - 8], az: Math.PI, light: "golden" },
};
const OFF: Record<string, [number, number]> = {
  pin: [1.1, 0], farmer: [-2.3, -1.0], skeptic: [2.3, -1.0],
};
const WHO: Record<number, string[]> = { 1: ["pin", "skeptic", "farmer"], 2: ["pin", "skeptic", "farmer"], 3: ["pin", "skeptic", "farmer"], 4: ["pin", "farmer"] };
/** world position of a main character in chapter ch (depth and left/right follow the chapter's camera side) */
export const posOf = (ch: number, who: string): V3 => {
  const S = SETS[ch], o = OFF[who] ?? [0, 0], sg = Math.cos(S.az) < 0 ? -1 : 1;
  const alt = null as number[] | null;
  const [dx, dz] = alt ?? o;
  return [S.c[0] + dx * sg, 0, S.c[1] + dz * sg];
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
      const other = L.who === "pin" ? cast.find((c) => c !== "pin" && c !== prevWho) ?? "taiwo" : "pin";
      const kind: Kind = L.i === 0 && k === 0 ? "two" : first && k === 0 ? "wide" : k === 0 ? (L.who === "pin" || n % 3 !== 2 ? "single" : "two") : (k % 2 ? "two" : "single");
      const side = n % 2 ? 1 : -1;
      PLAN.push({ id: n + 1, a: F(tc) - (k === 0 ? 2 : 0), b: F(end) - 2, ch: L.chapter, line: L.i, who: L.who, other: cast.includes(other) ? other : "pin",
        kind, az: S.az + side * (kind === "wide" ? 0.45 : 0.35 + 0.25 * ((n >> 1) % 2)), light: S.light, seed: n });
      n++;
    });
    prevWho = L.who === "pin" ? prevWho : L.who;
  }
  PLAN[0].a = 0; PLAN[PLAN.length - 1].b = TOTAL;
  for (let k = 1; k < PLAN.length; k++) PLAN[k].a = PLAN[k - 1].b; // gapless
}

// ---------------- captions (punch words) ----------------
type Cap = { a: number; b: number; text: string; col: string };
const find = (line: string, word: string, nth = 0): number => {
  const L = LINES.find((l) => l.text.toLowerCase().includes(line.toLowerCase()));
  if (!L) { console.warn("caption line not found", line); return -1; }
  const ws = L.words.filter((w) => w[2].toLowerCase().replace(/[^a-z0-9-]/g, "").includes(word.toLowerCase()));
  return ws[nth]?.[0] ?? (console.warn("caption word not found", line, word), -1);
};
const cap = (line: string, word: string, text: string, col = "#ffffff", dur = 1.1, nth = 0): Cap | null => {
  const t = find(line, word, nth);
  return t < 0 ? null : { a: t - 1 / FPS, b: t + dur, text, col };
};
const Y = "#ffd23f", WH = "#ffffff";
export const CAPS: Cap[] = [
  cap("three hundred", "ninety", "393 PEOPLE", Y, 1.6),
  cap("not a language", "language", "A LANGUAGE?", WH, 1.2),
  cap("every syllable", "note", "1 SOUND = 1 NOTE", Y, 1.4),
  cap("half a mile", "half", "½ MILE", Y, 1.4),
  cap("four hundred", "hundred", "400 YEARS OLD", Y, 1.5),
  cap("fewer people", "fewer", "FEWER WHISTLERS", WH, 1.4),
  cap("both sides", "both", "BOTH BRAIN SIDES", Y, 1.6),
  cap("nineteen ninety", "ninety", "SINCE 1997", Y, 1.5),
  cap("dinner", "dinner", "DINNER.", WH, 1.5),
].filter((c): c is Cap => !!c);
export const capAt = (t: number) => CAPS.find((c) => t >= c.a && t < c.b);
/** kicks (image shakes) on the biggest punch words */
export const KICKS: [number, number][] = CAPS.filter((c) => /393|½|400|BOTH|1997/.test(c.text)).map((c) => [c.a + 1 / FPS, 0.8]);
