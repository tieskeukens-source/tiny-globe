// 2D layer over the 3D film: Turkish flag title card (hook), location badge, word-by-word subtitles and punch captions
// with small hand-drawn icons. Everything is sized for 1080 x 1920 and kept out of the Shorts UI zones
// (top 120 px, bottom 400 px, right 140 px).
import React from "react";
import { AbsoluteFill, interpolate, spring, Easing } from "remotion";
import { capAt, subAt, Icon, EP } from "./plan";

const INK = "#1b1b1f", RED = "#e30a17";
const ink = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${Math.round(px / 2)}px 0 ${INK}` });

/** Russian flag (3:2): white, blue, red */
const RuFlag: React.FC<{ w: number }> = ({ w }) => { const h = (w * 2) / 3; return (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}><rect width={w} height={h / 3} fill="#ffffff" /><rect y={h / 3} width={w} height={h / 3} fill="#0039a6" /><rect y={(2 * h) / 3} width={w} height={h / 3} fill="#d52b1e" /></svg>); };
export const Flag: React.FC<{ w: number }> = ({ w }) => (EP.flag === "ru" ? <RuFlag w={w} /> : <TrFlag w={w} />);
/** Turkish flag (3:2) as SVG: red field, white crescent and star */
export const TrFlag: React.FC<{ w: number }> = ({ w }) => {
  const h = (w * 2) / 3, G = h, cx = 0.5 * G, cy = h / 2, R = 0.125 * G, r = R * 0.382, sx = cx + 0.333 * G;
  const star = Array.from({ length: 10 }, (_, i) => { const a = Math.PI + (i * Math.PI) / 5, rr = i % 2 ? r : R; return `${sx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`; }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <rect width={w} height={h} fill={RED} />
      <circle cx={cx} cy={cy} r={0.25 * G} fill="#fff" />
      <circle cx={cx + 0.0625 * G} cy={cy} r={0.2 * G} fill={RED} />
      <polygon points={star} fill="#fff" />
    </svg>
  );
};

/** the flag waving: vertical slices displaced by a travelling sine, with a soft light/shade ripple */
const WavingFlag: React.FC<{ w: number; f: number; amp: number }> = ({ w, f, amp }) => {
  const N = 28, h = (w * 2) / 3, sw = w / N;
  return (
    <div style={{ position: "relative", width: w, height: h + 2 * amp }}>
      {Array.from({ length: N }, (_, i) => {
        const ph = i / N * 5.2 - f * 0.32, dy = Math.sin(ph) * amp * (0.25 + 0.75 * (i / N)), lit = 1 + 0.16 * Math.cos(ph);
        return (
          <div key={i} style={{ position: "absolute", left: i * sw, top: amp + dy, width: sw + 3, height: h, overflow: "hidden", filter: `brightness(${lit})` }}>
            <div style={{ position: "absolute", left: -i * sw }}><Flag w={w} /></div>
          </div>
        );
      })}
    </div>
  );
};

const TITLE_OUT = 26; // frame the title card starts leaving (first line starts at 0.9 s = 27 f)
export const TitleCard: React.FC<{ f: number }> = ({ f }) => {
  if (f > TITLE_OUT + 16) return null;
  const pop = spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 180, mass: 0.7 } });
  const out = interpolate(f, [TITLE_OUT, TITLE_OUT + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: EP.flag === "ru" ? `rgba(24,58,140,${0.94 * (1 - out)})` : `rgba(227,10,23,${0.94 * (1 - out)})`, alignItems: "center", justifyContent: "center",
      transform: `translateY(${-out * 2000}px) rotate(${-out * 8}deg)` }}>
      <div style={{ transform: `scale(${0.7 + 0.3 * pop}) rotate(${(1 - pop) * -6}deg)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <div style={{ border: `12px solid ${INK}`, borderRadius: 28, overflow: "hidden", boxShadow: `0 18px 0 ${INK}`, background: "#fff" }}>
          <WavingFlag w={760} f={f} amp={22} />
        </div>
        <div style={{ fontFamily: "Lilita One", fontSize: 170, color: "#fff", letterSpacing: 4, ...ink(18) }}>{EP.title}</div>
        <div style={{ fontFamily: "Lilita One", fontSize: 66, color: "#ffd23f", letterSpacing: 2, marginTop: -30, ...ink(11) }}>{EP.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

/** small location badge that stays on screen after the title card */
export const Badge: React.FC<{ f: number }> = ({ f }) => {
  const k = spring({ frame: f - (TITLE_OUT + 6), fps: 30, config: { damping: 13, stiffness: 200 } });
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 150, left: 56, display: "flex", alignItems: "center", gap: 18, padding: "14px 26px 14px 16px", borderRadius: 60,
      background: "#fff8e6", border: `7px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`, transform: `scale(${k})`, transformOrigin: "left center" }}>
      <div style={{ borderRadius: 10, overflow: "hidden", border: `4px solid ${INK}` }}><Flag w={96} /></div>
      <div style={{ fontFamily: "Lilita One", fontSize: 50, color: INK, letterSpacing: 1 }}>{EP.badge}</div>
    </div>
  );
};

// ---------------- icons (100 x 100, ink outline, flat fills) ----------------
const S = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const ICONS: Record<Icon, React.ReactNode> = {
  flag: <g><rect x="8" y="20" width="84" height="58" rx="8" fill={RED} {...S} /><circle cx="42" cy="49" r="16" fill="#fff" /><circle cx="47" cy="49" r="13" fill={RED} /><polygon points="66,49 58,45 61,53 61,45 58,53" fill="#fff" stroke="#fff" strokeWidth="3" /></g>,
  bird: <g><path d="M14 58 Q30 30 56 40 Q70 22 90 26 Q80 34 78 44 Q76 70 46 74 Q24 76 14 58 Z" fill="#4fb3e8" {...S} /><path d="M40 52 Q52 44 62 54 Q50 62 40 52 Z" fill="#2f86c2" {...S} strokeWidth={4} /><circle cx="70" cy="36" r="4" fill={INK} /><path d="M86 30 L98 33 L88 38" fill="#f2b33a" {...S} strokeWidth={4} /></g>,
  tea: <g><ellipse cx="50" cy="86" rx="36" ry="8" fill="#f3ead8" {...S} /><path d="M32 18 L68 18 L60 50 L68 80 L32 80 L40 50 Z" fill="#c2502a" {...S} /><path d="M32 18 L68 18" stroke="#fff6e0" strokeWidth="8" /><path d="M44 8 Q50 2 46 -4" stroke="#fff" strokeWidth="4" fill="none" opacity="0.8" /></g>,
  notes: <g><path d="M30 76 L30 24 L78 14 L78 66" fill="none" {...S} strokeWidth={8} /><ellipse cx="22" cy="78" rx="12" ry="9" fill="#ffd23f" {...S} /><ellipse cx="70" cy="68" rx="12" ry="9" fill="#ffd23f" {...S} /><path d="M30 34 L78 24" {...S} strokeWidth={8} /></g>,
  mountain: <g><path d="M4 86 L36 24 L52 52 L64 36 L96 86 Z" fill="#5fae4a" {...S} /><path d="M36 24 L44 40 L36 44 L28 40 Z" fill="#fff" {...S} strokeWidth={4} /><circle cx="80" cy="20" r="10" fill="#ffd23f" {...S} /></g>,
  sound: <g><path d="M10 40 L28 40 L46 22 L46 78 L28 60 L10 60 Z" fill="#ffd23f" {...S} /><path d="M58 36 Q66 50 58 64" fill="none" {...S} /><path d="M70 26 Q84 50 70 74" fill="none" {...S} /><path d="M82 16 Q102 50 82 84" fill="none" {...S} /></g>,
  hourglass: <g><rect x="18" y="8" width="64" height="10" rx="4" fill="#a8744a" {...S} /><rect x="18" y="82" width="64" height="10" rx="4" fill="#a8744a" {...S} /><path d="M26 18 L74 18 Q74 40 54 50 Q74 60 74 82 L26 82 Q26 60 46 50 Q26 40 26 18 Z" fill="#e6f4ff" {...S} /><path d="M34 74 L66 74 L50 60 Z" fill="#f2c230" /><path d="M38 28 L62 28 L50 42 Z" fill="#f2c230" /></g>,
  phone: <g><rect x="28" y="6" width="44" height="88" rx="10" fill="#3a3f52" {...S} /><rect x="34" y="16" width="32" height="60" rx="4" fill="#7fd0ff" /><circle cx="50" cy="84" r="4" fill="#fff" /></g>,
  down: <g><path d="M50 92 L14 52 L36 52 L36 8 L64 8 L64 52 L86 52 Z" fill="#ff5a4a" {...S} /></g>,
  shield: <g><path d="M50 6 L88 20 Q88 66 50 94 Q12 66 12 20 Z" fill="#3f8fd8" {...S} /><path d="M32 50 L46 64 L70 36" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /></g>,
  school: <g><path d="M8 40 L50 16 L92 40 L50 64 Z" fill="#3a3f52" {...S} /><path d="M26 50 L26 72 Q50 88 74 72 L74 50" fill="#4a5068" {...S} /><path d="M86 44 L86 70" {...S} /><circle cx="86" cy="74" r="5" fill="#ffd23f" {...S} strokeWidth={4} /></g>,
  party: <g><path d="M14 92 L36 30 L70 64 Z" fill="#ffd23f" {...S} /><path d="M24 64 L46 74" stroke={RED} strokeWidth="7" /><circle cx="64" cy="20" r="6" fill={RED} {...S} strokeWidth={3} /><circle cx="86" cy="40" r="6" fill="#4fb3e8" {...S} strokeWidth={3} /><path d="M52 34 Q62 10 80 8" fill="none" stroke="#5fae4a" strokeWidth="6" strokeLinecap="round" /><path d="M66 48 Q86 52 94 70" fill="none" stroke={RED} strokeWidth="6" strokeLinecap="round" /></g>,
  laugh: <g><circle cx="50" cy="50" r="42" fill="#ffd23f" {...S} /><path d="M28 38 Q34 30 40 38" fill="none" {...S} /><path d="M60 38 Q66 30 72 38" fill="none" {...S} /><path d="M26 52 L74 52 Q72 80 50 80 Q28 80 26 52 Z" fill="#7a1f2a" {...S} /><path d="M38 72 Q50 64 62 72" fill="#ff7a8a" /></g>,
  thermo: <g><rect x="38" y="4" width="24" height="64" rx="12" fill="#eef3f8" {...S} /><circle cx="50" cy="78" r="17" fill="#2f86e8" {...S} /><rect x="44" y="40" width="12" height="34" fill="#2f86e8" /><path d="M66 18 L78 18 M66 30 L76 30 M66 42 L78 42" {...S} strokeWidth={4} /></g>,
  snow: <g>{[0, 60, 120].map((a) => <g key={a} transform={`rotate(${a} 50 50)`}><path d="M50 6 L50 94" {...S} stroke="#7fc4f0" strokeWidth={9} /><path d="M50 6 L50 94" stroke="#ffffff" strokeWidth={4} /><path d="M38 16 L50 28 L62 16 M38 84 L50 72 L62 84" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" /></g>)}</g>,
  car: <g><path d="M8 66 L8 46 L22 44 L34 26 L72 26 L82 44 L94 48 L94 66 Z" fill="#3f7a4a" {...S} /><path d="M38 32 L54 32 L54 44 L30 44 Z M60 32 L70 32 L76 44 L60 44 Z" fill="#9ac4e8" /><circle cx="28" cy="68" r="11" fill="#222" {...S} /><circle cx="74" cy="68" r="11" fill="#222" {...S} /><circle cx="2" cy="56" r="7" fill="#e8eaf2" {...S} strokeWidth={3} /><circle cx="-10" cy="48" r="9" fill="#f4f5fa" {...S} strokeWidth={3} /></g>,
  toilet: <g><path d="M18 30 L50 10 L82 30 Z" fill="#4a3a30" {...S} /><rect x="24" y="30" width="52" height="64" fill="#a8744a" {...S} /><path d="M50 56 C40 46 40 38 46 38 C49 38 50 41 50 43 C50 41 51 38 54 38 C60 38 60 46 50 56 Z" fill="#2a1a10" /><path d="M16 26 L50 4 L84 26" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" /></g>,
  record: <g><path d="M28 10 L72 10 L70 40 Q68 58 50 60 Q32 58 30 40 Z" fill="#f2c230" {...S} /><path d="M28 18 Q8 18 14 34 Q18 42 30 40 M72 18 Q92 18 86 34 Q82 42 70 40" fill="none" {...S} /><rect x="42" y="60" width="16" height="16" fill="#f2c230" {...S} /><rect x="28" y="76" width="44" height="14" rx="3" fill="#a8744a" {...S} /><text x="50" y="44" textAnchor="middle" fontFamily="Lilita One" fontSize="26" fill={INK}>1</text></g>,
  steam: <g><ellipse cx="50" cy="80" rx="42" ry="14" fill="#2f6f8a" {...S} /><path d="M30 64 Q22 50 32 40 Q42 30 34 16 M52 62 Q44 48 54 38 Q64 28 56 12 M72 64 Q64 50 74 40" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" /><path d="M30 64 Q22 50 32 40 Q42 30 34 16 M52 62 Q44 48 54 38 Q64 28 56 12 M72 64 Q64 50 74 40" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.35" /></g>,
  sun: <g>{Array.from({ length: 8 }, (_, k) => <path key={k} d="M50 4 L50 18" transform={`rotate(${k * 45} 50 50)`} {...S} stroke="#f2a33a" strokeWidth={8} />)}<circle cx="50" cy="50" r="26" fill="#ffd23f" {...S} /><path d="M38 54 Q50 64 62 54" fill="none" {...S} strokeWidth={4} /><circle cx="41" cy="45" r="3" fill={INK} /><circle cx="59" cy="45" r="3" fill={INK} /></g>,
  pin: <g><path d="M50 94 Q20 56 20 38 A30 30 0 1 1 80 38 Q80 56 50 94 Z" fill="#d8342b" {...S} /><circle cx="50" cy="38" r="13" fill="#fff" {...S} strokeWidth={4} /></g>,
};
const IconSvg: React.FC<{ icon: Icon; size: number }> = ({ icon, size }) => (
  <svg width={size} height={size} viewBox="-6 -10 112 112" style={{ overflow: "visible", filter: `drop-shadow(0 6px 0 ${INK})` }}>{ICONS[icon]}</svg>
);

/** punch caption: icon + big word in the upper third, popping on the spoken word */
export const Punch: React.FC<{ f: number }> = ({ f }) => {
  const c = capAt(f / 30);
  if (!c) return null;
  const a = Math.round(c.a * 30), k = spring({ frame: f - a, fps: 30, config: { damping: 10, stiffness: 230, mass: 0.6 } });
  const ki = spring({ frame: f - a - 3, fps: 30, config: { damping: 8, stiffness: 260, mass: 0.5 } });
  const fs = c.text.length > 17 ? 80 : c.text.length > 11 ? 98 : 124;
  const bob = Math.sin((f - a) * 0.35) * 6;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 330 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${0.55 + 0.45 * k}) rotate(${(1 - k) * -5}deg)` }}>
        {c.icon ? <div style={{ transform: `translateY(${bob}px) scale(${0.4 + 0.6 * ki}) rotate(${(1 - ki) * 20}deg)` }}><IconSvg icon={c.icon} size={170} /></div> : null}
        <div style={{ fontFamily: "Lilita One", fontSize: fs, color: c.col, letterSpacing: 2, textAlign: "center", maxWidth: 940, lineHeight: 1.0, ...ink(15) }}>{c.text}</div>
      </div>
    </AbsoluteFill>
  );
};

/** subtitles: 1-3 words at a time, the word being spoken in yellow and a bit bigger */
export const Subs: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, s = subAt(t);
  if (!s) return null;
  const k = spring({ frame: f - Math.round(s.a * 30), fps: 30, config: { damping: 14, stiffness: 300, mass: 0.5 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 500 }}>
      <div style={{ display: "flex", gap: 40, rowGap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 900, transform: `translateY(${(1 - k) * 30}px) scale(${0.9 + 0.1 * k})` }}>
        {s.words.map(([a, b, w], i) => {
          const on = t >= a - 0.03 && t < b + 0.05;
          return <span key={i} style={{ fontFamily: "Lilita One", fontSize: 82, color: on ? "#ffd23f" : "#ffffff", display: "inline-block",
            transform: `scale(${on ? 1.12 : 1})`, letterSpacing: 1, ...ink(12) }}>{w.toUpperCase()}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** light snowfall over the whole frame: deterministic flakes, three depth layers (big + fast near, small + slow far) */
export const Snow: React.FC<{ f: number }> = ({ f }) => {
  const flakes = [];
  for (let i = 0; i < 90; i++) {
    const h = (k: number) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    const layer = i % 3, sp = [2.2, 3.6, 5.6][layer], sz = [5, 8, 13][layer], op = [0.55, 0.75, 0.9][layer];
    const y = ((h(1) * 2100 + f * sp) % 2100) - 90, x = (h(2) * 1180 - 50 + Math.sin(f * 0.04 + h(3) * 6) * 30 * (layer + 1));
    flakes.push(<div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: "#ffffff", opacity: op, boxShadow: layer === 2 ? "0 0 6px rgba(255,255,255,0.8)" : undefined }} />);
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{flakes}</AbsoluteFill>;
};
