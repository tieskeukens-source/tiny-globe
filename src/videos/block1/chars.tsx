// The Block crew: hand-inked 2D streetwear characters (own designs, style ref: thick ink, flat colours, huge teeth).
// Each character is drawn in a 600 x 1300 box (head top ~60, feet ~1270). Mouth/eyes/arms are animatable.
import React from 'react';

export type Who = 'dre' | 'lou' | 'fast';
export type Arms = 'crossed' | 'pockets' | 'hype' | 'shrug' | 'point' | 'phone' | 'down';
export type Eyes = 'calm' | 'tired' | 'wide' | 'angry' | 'side' | 'closed';
export type Pose = {open?: number; eyes?: Eyes; arms?: Arms; tilt?: number; blink?: boolean; prop?: string};

const INK = '#141210';
const S = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

type Pal = {skin: string; skinD: string; lip: string; top: string; topD: string; acc: string; acc2: string; pants: string; pantsD: string; shoe: string; shoe2: string; hair: string};
export const PAL: Record<Who, Pal> = {
  // Dre: mustard track jacket with navy stripes, cream cargos, navy/grey fitted cap, tan boots
  dre: {skin: '#7a4527', skinD: '#5b3119', lip: '#5e3420', top: '#e9b23c', topD: '#c38b1f', acc: '#2e4686', acc2: '#a7a9ad', pants: '#e8dcc0', pantsD: '#c8b78f', shoe: '#c98744', shoe2: '#8a5526', hair: '#1c1512'},
  // Lou: olive puffer, grey hood, charcoal beanie with orange tab, black cargos, white/orange sneakers
  lou: {skin: '#b47a50', skinD: '#8f5a36', lip: '#8a5433', top: '#6f7d43', topD: '#55612f', acc: '#4b4f5d', acc2: '#f08a24', pants: '#2b2b30', pantsD: '#1c1c20', shoe: '#f4f1ea', shoe2: '#f08a24', hair: '#1c1512'},
  // Fast: red windbreaker with black/white block, orange bucket hat, black trackies with white stripe, red kicks
  fast: {skin: '#4a2a18', skinD: '#331b0e', lip: '#3a1f10', top: '#d8352c', topD: '#a8231c', acc: '#f2772b', acc2: '#f4f1ea', pants: '#24242a', pantsD: '#151519', shoe: '#d8352c', shoe2: '#f4f1ea', hair: '#120c08'},
};

// ---------- face ----------
const Eye: React.FC<{x: number; e: Eyes; flip: number; blink?: boolean}> = ({x, e, flip, blink}) => {
  const dir = flip; // -1 left eye, +1 right eye (outer side)
  const shut = blink || e === 'closed';
  if (shut) return <path d={`M${x - 32},272 Q${x},282 ${x + 32},272`} fill="none" {...S} strokeWidth={8} />;
  // upper lid height per mood; inner end lower when angry
  const lidIn = e === 'angry' ? 14 : e === 'tired' ? 12 : e === 'calm' ? 8 : e === 'wide' ? -8 : 6;
  const lidOut = e === 'tired' ? 10 : e === 'wide' ? -12 : e === 'calm' ? 4 : 0;
  const inX = x - dir * 40, outX = x + dir * 44;
  const top = 248;
  const bot = e === 'wide' ? 300 : 290;
  const d = `M${inX},${top + lidIn + 8} Q${x},${top + Math.min(lidIn, lidOut) - (e === 'wide' ? 10 : 2)} ${outX},${top + lidOut + 6} Q${x + dir * 6},${bot} ${inX},${top + lidIn + 8} Z`;
  const pupil = e === 'side' ? x + 14 : e === 'wide' ? x : null;
  return (
    <g>
      <path d={d} fill="#fbf8f0" {...S} strokeWidth={6} />
      {pupil !== null && <circle cx={pupil} cy={e === 'wide' ? 276 : 274} r={e === 'wide' ? 6 : 7} fill={INK} />}
      {/* heavy upper lid line */}
      <path d={`M${inX - dir * 4},${top + lidIn + 8} Q${x},${top + Math.min(lidIn, lidOut) - (e === 'wide' ? 12 : 4)} ${outX + dir * 6},${top + lidOut + 4}`} fill="none" {...S} strokeWidth={11} />
      {e === 'tired' && <path d={`M${x - 24},${bot + 8} Q${x},${bot + 16} ${x + 24},${bot + 8}`} fill="none" {...S} strokeWidth={4} opacity={0.7} />}
    </g>
  );
};

const Brow: React.FC<{x: number; e: Eyes; flip: number}> = ({x, e, flip}) => {
  const inX = x - flip * 40, outX = x + flip * 36;
  const yIn = e === 'angry' ? 246 : e === 'wide' ? 214 : e === 'tired' ? 238 : 232;
  const yOut = e === 'angry' ? 226 : e === 'wide' ? 212 : e === 'tired' ? 236 : 230;
  return <path d={`M${inX},${yIn} Q${x},${Math.min(yIn, yOut) - 8} ${outX},${yOut}`} fill="none" {...S} strokeWidth={14} />;
};

// the signature mouth: a big block of teeth. open 0..1 parts the rows
const Mouth: React.FC<{open: number; p: Pal; jag?: boolean; grin?: boolean}> = ({open, p, jag}) => {
  const o = Math.max(0, Math.min(1, open));
  const x0 = 200, x1 = 400, top = 322;
  const h = 84 + o * 46;
  const bot = top + h;
  const n = 9, w = (x1 - x0) / n;
  const gap = o * 38;
  const topRow = top + (h - gap) / 2, botRow = topRow + gap;
  const teethTop: string[] = [], teethBot: string[] = [];
  for (let i = 1; i < n; i++) {
    const tx = x0 + i * w;
    teethTop.push(`M${tx},${top + 4} L${tx},${topRow}`);
    teethBot.push(`M${tx},${botRow} L${tx},${bot - 4}`);
  }
  const jagPath = (y0: number, y1: number, down: boolean) => {
    let d = `M${x0},${y0}`;
    for (let i = 0; i < n; i++) d += ` L${x0 + (i + 0.5) * w},${down ? y1 : y1} L${x0 + (i + 1) * w},${y0}`;
    return d;
  };
  return (
    <g>
      <path d={`M${x0 + 20},${top - 14} Q300,${top - 26} ${x1 - 20},${top - 14}`} fill="none" stroke={p.lip} strokeWidth={8} />
      <rect x={x0} y={top} width={x1 - x0} height={h} rx={14} fill="#fbf8f0" {...S} strokeWidth={6} />
      {gap > 2 && <rect x={x0 + 3} y={topRow} width={x1 - x0 - 6} height={gap} fill="#2a0f0c" />}
      {gap > 14 && <path d={`M${x0 + 40},${botRow} Q300,${botRow - gap * 0.55} ${x1 - 40},${botRow}`} fill="#c2453c" />}
      {jag ? (
        <>
          <path d={jagPath(top + 3, topRow + (gap > 2 ? 6 : 0), true)} fill="none" {...S} strokeWidth={5} />
          {gap > 2 && <path d={jagPath(bot - 3, botRow - 6, false)} fill="none" {...S} strokeWidth={5} />}
        </>
      ) : (
        <path d={teethTop.join(' ') + ' ' + (gap > 2 ? teethBot.join(' ') : teethBot.map((s) => s).join(' '))} fill="none" {...S} strokeWidth={4.5} />
      )}
      {gap > 2 ? (
        <>
          <path d={`M${x0},${topRow} L${x1},${topRow}`} {...S} strokeWidth={5} />
          <path d={`M${x0},${botRow} L${x1},${botRow}`} {...S} strokeWidth={5} />
        </>
      ) : !jag && <path d={`M${x0 + 2},${top + h / 2} L${x1 - 2},${top + h / 2}`} {...S} strokeWidth={5} />}
    </g>
  );
};

// ---------- headwear ----------
const Cap: React.FC<{p: Pal}> = ({p}) => (
  <g transform="translate(0 -14)">
    {/* crown */}
    <path d="M186,212 C178,90 252,52 312,54 C380,56 424,104 418,206 Z" fill={p.acc} {...S} />
    <path d="M330,58 C384,66 420,110 416,200 L372,204 C380,140 366,90 330,58 Z" fill="#22356a" />
    <path d="M300,56 L302,196" fill="none" {...S} strokeWidth={4} />
    <circle cx={304} cy={58} r={9} fill={p.acc} {...S} strokeWidth={5} />
    {/* own crew patch: a little brick */}
    <rect x={252} y={118} width={70} height={46} rx={6} fill="#fbf8f0" {...S} strokeWidth={5} transform="rotate(-8 287 141)" />
    <path d="M258,140 L318,132 M286,124 L288,138 M272,142 L274,156 M300,138 L302,152" fill="none" {...S} strokeWidth={4} transform="rotate(-8 287 141)" />
    {/* flat brim, tilted to his right */}
    <path d="M150,218 C170,186 330,172 452,196 C468,200 470,222 452,228 C340,214 210,236 162,246 C142,248 140,228 150,218 Z" fill={p.acc2} {...S} />
    <path d="M168,238 C230,226 330,214 450,224" fill="none" stroke="#7d8085" strokeWidth={6} />
    {/* yellow band peeking (durag-like) */}
    <path d="M196,214 C260,206 350,204 410,208 L410,222 C350,218 260,220 196,230 Z" fill={p.top} {...S} strokeWidth={5} />
  </g>
);

const Beanie: React.FC<{p: Pal}> = ({p}) => (
  <g>
    <path d="M180,236 C164,100 236,44 302,44 C372,44 440,100 422,236 Z" fill={p.acc} {...S} />
    <path d="M350,52 C404,72 438,132 422,236 L384,236 C392,160 386,96 350,52 Z" fill="#3a3d48" />
    {[220, 250, 280, 310, 340, 370, 400].map((x) => <path key={x} d={`M${x},${x < 300 ? 90 + (300 - x) * 0.5 : 90 + (x - 300) * 0.5} L${x - 2},196`} fill="none" stroke="#3a3d48" strokeWidth={4} />)}
    {/* folded cuff */}
    <path d="M172,196 C250,182 352,182 430,196 L432,248 C352,236 250,236 170,250 Z" fill={p.acc} {...S} />
    {[200, 240, 280, 320, 360, 400].map((x) => <path key={x} d={`M${x},${194} L${x},${240}`} fill="none" stroke="#3a3d48" strokeWidth={4} />)}
    {/* orange tab */}
    <rect x={330} y={200} width={58} height={32} rx={4} fill={p.acc2} {...S} strokeWidth={5} />
    <path d="M340,216 L378,216" fill="none" {...S} strokeWidth={4} />
  </g>
);

const Bucket: React.FC<{p: Pal}> = ({p}) => (
  <g transform="translate(0 -16)">
    <path d="M200,214 C196,110 236,66 302,66 C368,66 408,110 404,214 Z" fill={p.acc} {...S} />
    <path d="M340,72 C384,92 406,140 404,210 L370,212 C374,150 362,100 340,72 Z" fill="#c95a1c" />
    {/* stitching rings */}
    <path d="M206,170 C260,158 344,158 398,170" fill="none" stroke="#c95a1c" strokeWidth={4} strokeDasharray="10 8" />
    {/* brim drooping */}
    <path transform="translate(0 -22)" d="M150,226 C170,196 430,196 452,226 C460,248 440,262 420,256 C340,236 262,236 182,258 C160,262 140,248 150,226 Z" fill={p.acc} {...S} />
    <path transform="translate(0 -22)" d="M174,244 C260,222 340,222 430,242" fill="none" stroke="#c95a1c" strokeWidth={4} strokeDasharray="10 8" />
    {/* white side tag */}
    <rect x={226} y={136} width={52} height={24} rx={3} fill="#fbf8f0" {...S} strokeWidth={4} />
  </g>
);

// ---------- head ----------
const HEADSHAPE: Record<Who, [number, number]> = {dre: [1, 1], lou: [0.92, 1.07], fast: [1.1, 0.96]};
const Head: React.FC<{who: Who; pose: Pose}> = ({who, pose}) => {
  const p = PAL[who];
  const [hx, hy] = HEADSHAPE[who];
  const e = pose.eyes ?? (who === 'dre' ? 'calm' : who === 'lou' ? 'tired' : 'wide');
  return (
    <g transform={`translate(300 470) scale(${hx} ${hy}) translate(-300 -470)`}>
      {/* ears */}
      <ellipse cx={186} cy={298} rx={24} ry={40} fill={p.skin} {...S} />
      <ellipse cx={414} cy={298} rx={24} ry={40} fill={p.skin} {...S} />
      <path d="M182,284 Q194,298 184,314" fill="none" {...S} strokeWidth={4} />
      <path d="M418,284 Q406,298 416,314" fill="none" {...S} strokeWidth={4} />
      {who === 'dre' && <circle cx={180} cy={340} r={8} fill="#f0c23a" {...S} strokeWidth={4} />}
      {who === 'lou' && <circle cx={420} cy={340} r={7} fill="none" {...S} strokeWidth={4} />}
      {/* head: boxy, big jaw */}
      <path d="M196,200 C196,150 404,150 404,200 L414,330 C420,430 396,470 300,476 C204,470 180,430 186,330 Z" fill={p.skin} {...S} />
      {/* cel shade on his left side */}
      <path d="M404,200 L410,330 C414,420 392,468 300,474 C356,456 382,420 380,330 L378,206 Z" fill={p.skinD} />
      {/* beard / stubble */}
      {who === 'dre' && <path d="M262,446 C276,470 324,470 338,446 C330,478 312,486 300,486 C288,486 270,478 262,446 Z" fill={p.hair} {...S} strokeWidth={5} />}
      {who === 'lou' && <path d="M236,444 Q300,470 364,444" fill="none" stroke={p.hair} strokeWidth={5} strokeDasharray="2 7" />}
      {/* nose */}
      <path d="M292,262 Q278,300 288,310 Q300,316 312,308" fill="none" {...S} strokeWidth={5} />
      {/* eyes + brows */}
      <Eye x={252} e={e} flip={-1} blink={pose.blink} />
      <Eye x={348} e={e} flip={1} blink={pose.blink} />
      <Brow x={252} e={e} flip={-1} />
      <Brow x={348} e={e} flip={1} />
      <Mouth open={pose.open ?? 0} p={p} jag={who === 'fast'} />
      {who === 'dre' && <Cap p={p} />}
      {who === 'lou' && <Beanie p={p} />}
      {who === 'fast' && <Bucket p={p} />}
    </g>
  );
};

// ---------- body ----------
const Hand: React.FC<{x: number; y: number; p: Pal; r?: number; fist?: boolean; pointUp?: boolean}> = ({x, y, p, r = 0, pointUp}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M-26,-14 C-30,-40 30,-40 28,-12 L28,18 C28,34 -26,34 -26,18 Z" fill={p.skin} {...S} />
    {pointUp ? <path d="M-6,-30 L-8,-82 C-8,-96 12,-96 12,-82 L12,-30" fill={p.skin} {...S} /> : <path d="M-14,-6 L20,-6 M-14,6 L20,6" fill="none" {...S} strokeWidth={4} />}
  </g>
);

const Torso: React.FC<{who: Who; arms: Arms}> = ({who, arms}) => {
  const p = PAL[who];
  return (
    <g>
      {/* neck */}
      <path d="M262,450 L262,530 L338,530 L338,450 Z" fill={p.skinD} {...S} />
      {/* main jacket: oversized */}
      <path d="M130,600 C136,540 200,516 250,512 L350,512 C400,516 464,540 470,600 L486,930 C420,950 180,950 114,930 Z" fill={p.top} {...S} />
      <path d="M400,520 C450,540 470,580 470,600 L486,930 C460,938 430,944 404,946 Z" fill={p.topD} />
      {who === 'dre' && (
        <g>
          {/* white tee + open track jacket with navy stripes and zip */}
          <path d="M256,514 L300,600 L344,514 Z" fill="#fbf8f0" {...S} strokeWidth={6} />
          <path d="M300,600 L300,944" fill="none" {...S} strokeWidth={6} />
          <path d="M240,512 L292,610 M360,512 L308,610" fill="none" {...S} strokeWidth={6} />
          <path d="M140,640 L120,930 M156,642 L138,934" fill="none" stroke={p.acc} strokeWidth={10} />
          <path d="M460,640 L480,930 M444,642 L462,934" fill="none" stroke={p.acc} strokeWidth={10} />
          {/* gold chain */}
          <path d="M262,520 Q300,600 338,520" fill="none" stroke="#f0c23a" strokeWidth={9} strokeDasharray="10 4" />
          <path d="M140,890 L460,890" fill="none" {...S} strokeWidth={5} />
        </g>
      )}
      {who === 'lou' && (
        <g>
          {/* grey hood bunched round the neck */}
          <path d="M210,520 C220,470 380,470 390,520 C380,560 220,560 210,520 Z" fill="#9aa0aa" {...S} />
          <path d="M276,548 L272,640 M324,548 L328,640" fill="none" {...S} strokeWidth={5} />
          <circle cx={272} cy={646} r={7} fill="#c0c4cc" {...S} strokeWidth={4} />
          <circle cx={328} cy={646} r={7} fill="#c0c4cc" {...S} strokeWidth={4} />
          {/* puffer quilting */}
          {[620, 700, 780, 860].map((y) => <path key={y} d={`M${124 + (y - 600) * 0.02},${y} Q300,${y + 18} ${476 - (y - 600) * 0.02},${y}`} fill="none" {...S} strokeWidth={5} />)}
          <path d="M300,560 L300,944" fill="none" {...S} strokeWidth={6} />
        </g>
      )}
      {who === 'fast' && (
        <g>
          {/* windbreaker colour block: black chest band, white stripe, half-zip */}
          <path d="M126,660 L474,660 L478,740 L122,740 Z" fill="#1c1c20" {...S} strokeWidth={6} />
          <path d="M122,740 L478,740 L480,770 L120,770 Z" fill="#f4f1ea" {...S} strokeWidth={6} />
          <path d="M240,514 C260,560 340,560 360,514" fill="none" {...S} strokeWidth={6} />
          <path d="M300,552 L300,650" fill="none" {...S} strokeWidth={6} />
          <rect x={292} y={640} width={16} height={26} rx={4} fill="#f4f1ea" {...S} strokeWidth={4} />
          <path d="M140,900 L460,900" fill="none" {...S} strokeWidth={5} />
        </g>
      )}
      <Arm who={who} arms={arms} />
    </g>
  );
};

const sleeve = (d: string, p: Pal, key?: string) => <path key={key} d={d} fill={p.top} {...S} />;

const Arm: React.FC<{who: Who; arms: Arms}> = ({who, arms}) => {
  const p = PAL[who];
  if (arms === 'crossed') return (
    <g>
      {sleeve('M132,600 C96,680 110,760 180,790 L420,770 L430,700 L210,710 C190,690 180,640 190,600 Z', p)}
      {sleeve('M468,600 C504,680 490,760 420,800 L180,780 L170,720 L390,716 C410,690 420,640 410,600 Z', p)}
      <path d="M200,720 L400,712" fill="none" stroke={p.topD} strokeWidth={10} />
      <Hand x={430} y={738} p={p} r={-90} />
      <Hand x={168} y={756} p={p} r={90} />
    </g>
  );
  if (arms === 'pockets') return (
    <g>
      {sleeve('M134,600 C100,700 104,820 150,900 L214,900 C200,820 204,720 210,640 Z', p)}
      {sleeve('M466,600 C500,700 496,820 450,900 L386,900 C400,820 396,720 390,640 Z', p)}
      <path d="M150,900 L214,900 M386,900 L450,900" fill="none" {...S} strokeWidth={9} />
    </g>
  );
  if (arms === 'hype') return (
    <g>
      {sleeve('M134,600 C100,700 110,800 160,870 L220,850 C200,780 200,700 214,640 Z', p)}
      <Hand x={190} y={880} p={p} />
      {/* right arm thrown up */}
      {sleeve('M440,560 C520,540 580,450 580,330 L516,326 C512,410 470,480 410,520 Z', p)}
      <Hand x={548} y={300} p={p} r={-4} />
    </g>
  );
  if (arms === 'point') return (
    <g>
      {sleeve('M134,600 C100,700 110,800 160,870 L220,850 C200,780 200,700 214,640 Z', p)}
      <Hand x={190} y={880} p={p} />
      {sleeve('M440,580 C520,600 560,640 590,690 L556,730 C520,690 470,670 420,660 Z', p)}
      <g transform="translate(590 716) rotate(-60)"><Hand x={0} y={0} p={p} pointUp /></g>
    </g>
  );
  if (arms === 'shrug') return (
    <g>
      {sleeve('M134,600 C70,640 50,720 70,780 L130,770 C130,720 150,680 200,650 Z', p)}
      {sleeve('M466,600 C530,640 550,720 530,780 L470,770 C470,720 450,680 400,650 Z', p)}
      <Hand x={96} y={790} p={p} r={-20} />
      <Hand x={504} y={790} p={p} r={20} />
    </g>
  );
  if (arms === 'phone') return (
    <g>
      {sleeve('M466,600 C500,700 496,820 450,900 L386,900 C400,820 396,720 390,640 Z', p)}
      <path d="M386,900 L450,900" fill="none" {...S} strokeWidth={9} />
      {/* left arm up holding phone to ear */}
      {sleeve('M134,600 C90,560 96,460 140,400 L196,430 C170,480 176,540 214,580 Z', p)}
      <rect x={142} y={290} width={50} height={96} rx={10} fill="#1c1c20" {...S} transform="rotate(-12 167 338)" />
      <Hand x={170} y={392} p={p} r={-20} />
    </g>
  );
  return (
    <g>
      {sleeve('M134,600 C100,700 110,800 150,890 L210,880 C200,800 200,710 212,640 Z', p)}
      {sleeve('M466,600 C500,700 490,800 450,890 L390,880 C400,800 400,710 388,640 Z', p)}
      <Hand x={180} y={900} p={p} />
      <Hand x={420} y={900} p={p} />
    </g>
  );
};

const Legs: React.FC<{who: Who}> = ({who}) => {
  const p = PAL[who];
  return (
    <g>
      {/* baggy pants stacking on the shoes */}
      <path d="M140,930 L460,930 L478,1210 C440,1226 340,1226 312,1212 L300,1010 L288,1212 C260,1226 160,1226 122,1210 Z" fill={p.pants} {...S} />
      <path d="M380,940 L460,930 L478,1210 C460,1218 430,1222 408,1222 Z" fill={p.pantsD} />
      <path d="M150,1080 Q200,1070 240,1090 M170,1150 Q220,1140 270,1160 M340,1090 Q390,1070 440,1086 M332,1160 Q380,1146 440,1160" fill="none" {...S} strokeWidth={4} />
      {who === 'dre' && <path d="M126,1020 L176,1020 L176,1080 L128,1080 Z M424,1020 L474,1020 L476,1080 L428,1080 Z" fill={p.pantsD} {...S} strokeWidth={5} />}
      {who === 'fast' && <path d="M140,940 L124,1206 M460,940 L476,1206" fill="none" stroke="#f4f1ea" strokeWidth={10} />}
      {/* shoes */}
      {[[196, -1], [404, 1]].map(([x, s]) => (
        <g key={x}>
          <path d={`M${x - 84},1262 C${x - 90},1220 ${x - 50},1204 ${x},1204 C${x + 50},1204 ${x + 92},1222 ${x + 86},1262 Z`} fill={p.shoe} {...S} />
          <path d={`M${x - 88},1262 L${x + 88},1262 L${x + 86},1278 L${x - 86},1278 Z`} fill={who === 'dre' ? '#5b3a1c' : '#f4f1ea'} {...S} strokeWidth={6} />
          <path d={`M${x - 40},1236 Q${x},1222 ${x + 44},1240`} fill="none" stroke={p.shoe2} strokeWidth={10} />
        </g>
      ))}
    </g>
  );
};

export const Guy: React.FC<{who: Who; pose?: Pose; legs?: boolean}> = ({who, pose = {}, legs = true}) => {
  const arms = pose.arms ?? (who === 'dre' ? 'crossed' : who === 'lou' ? 'pockets' : 'hype');
  return (
    <g>
      {legs && <Legs who={who} />}
      <Torso who={who} arms={arms} />
      <g transform={`rotate(${pose.tilt ?? 0} 300 470) translate(300 470) scale(1.16) translate(-300 -470)`}>
        <Head who={who} pose={pose} />
      </g>
    </g>
  );
};

// SVG filters: wobbly ink line (boils on 4s) + paper grain
export const InkDefs: React.FC<{seed: number}> = ({seed}) => (
  <defs>
    <filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.10 0" />
    </filter>
  </defs>
);
