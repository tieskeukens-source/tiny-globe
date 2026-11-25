// Shot plan for "The Town Where Almost Everyone Has a Twin", generated from the voice timeline: cuts land 2 frames before
// a line starts (and every ~3 s inside long lines, on a word gap), camera kind alternates single / two-shot / wide,
// azimuth alternates left / right, every hold creeps in; captions pop on the exact word.
import TL from "./timeline.json";
import type { V3, Light } from "./story";
const FPS = 30;
export const SIGN_Z = 45;       // crossroads with the "?" signpost (hook + ending)
export const ROAD_Z = -10;      // sports car stopped by the police
export const COURSE_Z = -70;    // wife-carrying obstacle course (east meadow)
export const LAKE_Z = -130;     // lake with red saunas at the end of the road
/** episode texts for the overlay: the country is NEVER named or shown */
export const EP = { title: "GUESS THE COUNTRY", sub: "3 HINTS \u00b7 CAN YOU GET IT?", badge: "???", flag: "q" as const };

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
  1: { c: [2.6, SIGN_Z - 2.6], az: Math.PI / 2 - 0.25, light: "day" },   // crossroads, signpost with "?" arrows
  2: { c: [2.2, ROAD_Z + 2], az: Math.PI / 2 + 0.25, light: "day" },     // road: red sports car + police car behind the cast
  3: { c: [6.5, COURSE_Z + 1.5], az: -Math.PI / 2 + 0.28, light: "day" },       // wife-carrying course, seesaw with beer crates
  4: { c: [0, LAKE_Z + 1], az: 0.12, light: "day" },                       // lake shore with red saunas and jetties
  5: { c: [-3.2, SIGN_Z - 2.6], az: -Math.PI / 2 + 0.3, light: "day" },  // back at the signpost: the question
};
/** lateral (screen-right) and toward-camera unit vectors of a chapter */
export const axes = (az: number) => ({ r: [Math.cos(az), -Math.sin(az)] as [number, number], f: [Math.sin(az), Math.cos(az)] as [number, number] });
const SLOT: [number, number][] = [[0, 0], [-1.35, -0.5], [1.35, -0.5], [2.7, -1.3]];
const WHO: Record<number, string[]> = { 1: ["pin", "tourist"], 2: ["pin", "aino", "rich", "tourist"], 3: ["pin", "tourist"], 4: ["pin", "tourist"], 5: ["pin", "tourist"] };
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
  // a shot that holds two speakers is never a single on one of them; the closing question is a wide shot
  PLAN.forEach((q) => { const sp = [...new Set(LINES.filter((l) => F(l.start) >= q.a - 3 && F(l.start) < q.b).map((l) => l.who))];
    if (sp.length > 1 && q.kind !== "wide") { q.kind = WHO[q.ch].length > 2 ? "wide" : "two"; q.who = sp[sp.length - 1]; q.other = sp[0]; } });
  PLAN[PLAN.length - 1].kind = "wide";
  PLAN[0].a = 0; PLAN[PLAN.length - 1].b = TOTAL;
  for (let k = 1; k < PLAN.length; k++) PLAN[k].a = PLAN[k - 1].b; // gapless
}

// ---------------- captions ----------------
export type Icon = "flag" | "bird" | "tea" | "notes" | "mountain" | "sound" | "hourglass" | "phone" | "down" | "shield" | "school" | "party" | "laugh" | "pin" | "thermo" | "snow" | "car" | "toilet" | "record" | "steam" | "sun" | "q" | "speed" | "money" | "no" | "couple" | "beer" | "sauna" | "comment";
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
  cap("Three hints", ["Three"], "3 HINTS", "q", WH, 1.0),
  cap("Three hints", ["guess"], "CAN YOU GUESS IT?", "q", Y, 1.6),
  cap("speeding ticket", ["speeding"], "SPEEDING TICKET", "speed", WH, 1.2),
  cap("speeding ticket", ["rich"], "PRICE = YOUR INCOME", "money", Y, 1.6),
  cap("Thirty over", ["hundred", "121"], "\u20ac121,000", "money", Y, 1.8),
  cap("For one ticket", ["ticket"], "FOR ONE TICKET?!", "laugh", WH, 1.2),
  cap("Switzerland", ["Switzerland"], "SWITZERLAND?", "no", "#ff6a5a", 1.0),
  cap("carrying your wife", ["carrying"], "WIFE CARRYING", "couple", Y, 1.6),
  cap("carrying your wife", ["championship"], "WORLD CHAMPIONSHIP", "record", WH, 1.2),
  cap("weight in beer", ["beer"], "HER WEIGHT IN BEER", "beer", Y, 1.8),
  cap("Germany", ["Germany"], "GERMANY?", "no", "#ff6a5a", 1.0),
  cap("three million saunas", ["saunas"], "3,000,000 SAUNAS", "sauna", Y, 1.6),
  cap("three million saunas", ["five", "5"], "ONLY 5.5 M PEOPLE", "pin", WH, 1.6),
  cap("Sweden", ["Sweden"], "SWEDEN?", "q", WH, 1.0),
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
    const ws: Word[] = [];
    for (const w of L.words) {   // fix whisper spellings, glue ".7" onto "67"
      const x = FIX[w[2].toLowerCase().replace(/[^a-z]/g, "")] ?? w[2];
      if (/^[.,]\d/.test(x) && ws.length) { const p = ws[ws.length - 1]; ws[ws.length - 1] = [p[0], w[1], p[2] + x]; } else if (x) ws.push([w[0], w[1], x]);
    }
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
export const KICKS: [number, number][] = CAPS.filter((c) => /121,000|WEIGHT IN BEER|3,000,000/.test(c.text)).map((c) => [c.a + 1 / FPS, 0.8]);

/** hint counter: the moment PIN says "Hint one / two / three" (overlay counter + fog stages) */
export const HINT_T: number[] = ["one", "two", "three"].map((n) => {
  const L = LINES.find((l) => new RegExp(`Hint ${n}`, "i").test(l.text));
  const dg = { one: "1", two: "2", three: "3" }[n]!, w = L?.words.find((x, k) => { const nx = norm(L.words[k + 1]?.[2] ?? ""); return /^hint/i.test(x[2]) && (nx.startsWith(n.slice(0, 3)) || nx === dg); });
  return w ? w[0] : L ? L.start : 1e9;
});
/** the closing question: "Which country is it?" */
export const ASK_T = (() => { const L = LINES.find((l) => /Which country/i.test(l.text)); const w = L?.words.find((x) => /^which/i.test(x[2])); return w ? w[0] : L ? L.start : 1e9; })();
