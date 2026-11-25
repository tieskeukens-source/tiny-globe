// Shot plan for "The Town Where Almost Everyone Has a Twin", generated from the voice timeline: cuts land 2 frames before
// a line starts (and every ~3 s inside long lines, on a word gap), camera kind alternates single / two-shot / wide,
// azimuth alternates left / right, every hold creeps in; captions pop on the exact word.
import TL from "./timeline.json";
import type { V3, Light } from "./story";
const FPS = 30;
/** episode texts for the overlay */
export const EP = { title: "ZERO McDONALD'S", sub: "WHERE IN THE WORLD?", badge: "", flag: "q" as const };
/** countries (world-atlas names) that have at least one McDonald's (Wikipedia list 2026; Cuba = only the US base, left grey) */
export const HAS = new Set(["United States of America", "Canada", "Puerto Rico", "U.S. Virgin Is.", "Costa Rica", "Australia", "Guam", "Japan", "Netherlands", "Panama", "Germany", "France",
  "El Salvador", "Sweden", "Guatemala", "Curaçao", "United Kingdom", "Hong Kong", "Bahamas", "New Zealand", "Switzerland", "Ireland", "Austria", "Belgium", "Brazil", "Singapore", "Spain",
  "Denmark", "Philippines", "Malaysia", "Norway", "Taiwan", "Andorra", "Finland", "Thailand", "Italy", "Aruba", "Luxembourg", "Venezuela", "Mexico", "Turkey", "Argentina", "Macao", "Serbia",
  "South Korea", "Hungary", "China", "Chile", "Indonesia", "Portugal", "Greece", "Uruguay", "Czechia", "Poland", "Monaco", "Brunei", "Morocco", "N. Mariana Is.", "Israel", "Slovenia",
  "Saudi Arabia", "Kuwait", "New Caledonia", "Oman", "Egypt", "Bulgaria", "Bahrain", "Latvia", "United Arab Emirates", "Estonia", "Romania", "Malta", "Colombia", "Slovakia", "South Africa",
  "Qatar", "Honduras", "Sint Maarten", "Croatia", "Samoa", "Fiji", "Liechtenstein", "Lithuania", "India", "Peru", "Jordan", "Paraguay", "Dominican Rep.", "Fr. Polynesia",
  "Trinidad and Tobago", "Ukraine", "Cyprus", "Jersey", "Ecuador", "Isle of Man", "Suriname", "Moldova", "Nicaragua", "Lebanon", "Pakistan", "Georgia", "Azerbaijan", "American Samoa",
  "Mauritius", "Vietnam", "St-Martin"]);
/** country tile + pin per chapter; map chapters are filmed from high above */
export const FEATURE: Record<number, string> = { 3: "Iceland", 4: "Bolivia", 5: "Russia", 6: "United States of America" };
export const BADGE: Record<number, [string, string]> = { 3: ["ICELAND", "is"], 4: ["BOLIVIA", "bo"], 5: ["RUSSIA", "ru"], 6: ["USA", "us"] };

export type Word = [number, number, string];
export type Line = { i: number; f?: number; whistle?: boolean; who: string; chapter: number; text: string; start: number; dur: number; words: Word[] };
/** whistle gaps in the voice timeline belong to a character: Ayşe calls, Hasan answers, Ayşe whistles the visitor's name */
const WHISTLERS = ["ayse", "hasan", "ayse"];
export const LINES = (() => { let n = 0; return (TL as unknown as { lines: Line[] }).lines.map((l) => (l.who === "whistle" ? { ...l, who: WHISTLERS[n++ % 3], whistle: true, words: [] } : l)); })();
export const VOICE_TOTAL = (TL as unknown as { total: number }).total;
export const TOTAL = Math.round(VOICE_TOTAL * FPS);
export const LEAD = 2 / FPS;

// ---------------- where everyone stands, per chapter ----------------
type SetDef = { c: [number, number]; az: number; light: Light; clampX?: number; map?: { h: number; back: number; look: [number, number]; push?: number } };
/** Mercator (1 m = 1 degree at the equator): the familiar web-map look, and Iceland / Russia get room to stand on */
export const mercY = (lat: number) => (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (Math.max(-75, Math.min(80, lat)) * Math.PI) / 360));
export const LL = (lon: number, lat: number): [number, number] => [lon, -mercY(lat)];
export const SETS: Record<number, SetDef> = {
  1: { c: LL(15, 30), az: 0, light: "day", map: { h: 330, back: 150, look: LL(10, 22), push: 0.95 } },    // hook: the whole map, zooming in on Europe + Africa
  2: { c: LL(18, 2), az: 0, light: "day", map: { h: 105, back: 55, look: LL(18, 8), push: 0.2 } },       // the map turns gold / grey (Africa grey)
  3: { c: LL(-18.6, 64.9), az: 0.15, light: "day" },                                                     // Iceland
  4: { c: LL(-64.5, -17), az: -0.2, light: "day" },                                                      // Bolivia
  5: { c: LL(92, 62), az: 0.2, light: "day" },                                                           // Siberia, Russia
  6: { c: LL(-98, 39), az: -0.15, light: "day" },                                                        // middle of the USA
  7: { c: LL(10, 20), az: 0, light: "day", map: { h: 240, back: 120, look: LL(10, 15), push: 0.25 } },   // the whole map: the question
};
/** the featured country lifts out of the map while its chapter is on screen */
export const RAISE = (name: string, t: number) => {
  for (const [ch, n] of Object.entries(FEATURE)) if (n === name) {
    const L = LINES.filter((l) => l.chapter === +ch); if (!L.length) return 0;
    const a = L[0].start - 0.6, b = L[L.length - 1].start + L[L.length - 1].dur + 0.4;
    const u = Math.min(1, Math.max(0, (t - a) / 0.5), Math.max(0, (b - t) / 0.5));
    return 0.35 * u * u * (3 - 2 * u);
  }
  return 0;
};
/** lateral (screen-right) and toward-camera unit vectors of a chapter */
export const axes = (az: number) => ({ r: [Math.cos(az), -Math.sin(az)] as [number, number], f: [Math.sin(az), Math.cos(az)] as [number, number] });
const SLOT: [number, number][] = [[0, 0], [-1.35, -0.5], [1.35, -0.5], [2.7, -1.3]];
const WHO: Record<number, string[]> = { 1: ["pin"], 2: ["pin"], 3: ["pin", "iceland"], 4: ["pin", "bolivia"], 5: ["pin", "russia"], 6: ["pin", "usa"], 7: ["pin"] };
/** world position of a main character in chapter ch (depth and left/right follow the chapter's camera side) */
export const posOf = (ch: number, who: string): V3 => {
  const S = SETS[ch], k = WHO[ch].indexOf(who), [dx, dz] = SLOT[Math.max(0, k)], { r, f } = axes(S.az);
  return [S.c[0] + r[0] * dx + f[0] * dz, 0, S.c[1] + r[1] * dx + f[1] * dz];
};
export const presentIn = (ch: number) => WHO[ch];

// ---------------- shots ----------------
export type Kind = "single" | "two" | "wide" | "map";
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
  PLAN.forEach((q) => { if (SETS[q.ch].map) q.kind = "map"; else if (q.kind === "wide" && WHO[q.ch].length < 3) q.kind = "two"; });
  for (let k = 1; k < PLAN.length; ) { const a = PLAN[k - 1], c = PLAN[k]; if (a.kind === "map" && c.kind === "map" && a.ch === c.ch) { a.b = c.b; PLAN.splice(k, 1); } else k++; }   // one continuous zoom per map chapter
  PLAN.forEach((q, i) => { q.id = i + 1; });
  PLAN[0].a = 0; PLAN[PLAN.length - 1].b = TOTAL;
  for (let k = 1; k < PLAN.length; k++) PLAN[k].a = PLAN[k - 1].b; // gapless
}

// ---------------- captions ----------------
export type Icon = "flag" | "bird" | "tea" | "notes" | "mountain" | "sound" | "hourglass" | "phone" | "down" | "shield" | "school" | "party" | "laugh" | "pin" | "thermo" | "snow" | "car" | "toilet" | "record" | "steam" | "sun" | "q" | "speed" | "money" | "no" | "couple" | "beer" | "sauna" | "comment" | "burger" | "empanada" | "museum" | "noburger";
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
  { a: 0, b: 2.6, text: "ZERO McDONALD'S", col: Y, icon: "noburger" },
  cap("Almost half", ["name"], "CAN YOU NAME ONE?", "q", WH, 1.4),
  cap("Gold means", ["Gold"], "GOLD = BURGERS", "burger", Y, 1.4),
  cap("Gold means", ["Grey", "Gray"], "GREY = NONE", "noburger", WH, 1.2),
  cap("Gold means", ["Africa"], "ALMOST ALL OF AFRICA", "pin", WH, 1.5),
  cap("We had three", ["three", "3"], "3 RESTAURANTS", "burger", WH, 1.2),
  cap("We had three", ["crashed"], "2009: MONEY CRASH", "down", "#ff6a5a", 1.6),
  cap("very last burger", ["last"], "THE LAST BURGER", "burger", Y, 1.4),
  cap("very last burger", ["display"], "STILL ON DISPLAY", "museum", WH, 1.5),
  cap("almost new", ["new"], "BOUGHT IN 2009!", "laugh", Y, 1.6),
  cap("five years", ["five", "5"], "ONLY 5 YEARS", "hourglass", WH, 1.4),
  cap("five years", ["empanadas"], "EMPANADAS WIN!", "empanada", Y, 1.8),
  cap("eight hundred", ["eight", "850"], "850 RESTAURANTS", "burger", Y, 1.5),
  cap("eight hundred", ["sold"], "2022: ALL SOLD", "no", "#ff6a5a", 1.6),
  cap("North Korea", ["Korea"], "NORTH KOREA: NEVER", "no", WH, 1.6),
  cap("What", ["What"], "WHAT?!", "laugh", Y, 1.2),
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
export const KICKS: [number, number][] = CAPS.filter((c) => /ZERO|EMPANADAS|WHAT\?!/.test(c.text)).map((c) => [c.a + 1 / FPS, 0.8]);

/** the gold/grey sweep starts on the word "Gold" */
export const PAINT_T = (() => { const L = LINES.find((l) => /Gold means/i.test(l.text)); const w = L?.words.find((x) => /^gold/i.test(x[2])); return w ? w[0] - 0.15 : L ? L.start : 3; })();
export const HINT_T: number[] = [];
/** the closing question */
export const ASK_T = (() => { const L = LINES.find((l) => /live without/i.test(l.text)); return L ? L.start : 1e9; })();
