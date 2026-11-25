import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Pop, PopDef, woordTijd} from './components/Pop';
import {Kaart} from './components/Kaart';
import {Kaartspeld, Pose} from './components/Kaartspeld';
import {TitelScene, CijferScene, VergelijkScene, FeitScene, KarakterScene} from './components/Scenes';
import {C, W, H} from './brand';
import script from '../videos/oymyakon.json';
import voorbeeld from '../videos/voorbeeld.json';
import {ReisScene, DorpScene, SchoolScene, CloseupScene} from './components/Werelden';
import * as W2 from './components/Werelden2';

export type Timings = {scenes: {dur: number; words: [string, number, number][]}[]};
export const PAD = 0.15;
const FPS_ = 30;

const SCRIPTS: Record<string, any> = {oymyakon: script, voorbeeld};
export const getScript = (slug: string) => SCRIPTS[slug];

// Zonder audio (lokale preview): schat de duur op basis van het aantal woorden
export const estimate = (slug: string): Timings => ({
  scenes: getScript(slug).scenes.map((s: any) => ({dur: s.text.split(' ').length / 2.7, words: []})),
});

export const frames = (t: Timings) => t.scenes.map((s) => Math.ceil((s.dur + PAD) * FPS_));

const Scene: React.FC<{s: any; dur: number; at: (w: string) => number}> = ({s, dur, at}) => {
  const p = s.props || {};
  switch (s.type) {
    case 'thermo': return <W2.ThermoScene {...p} at={at} />;
    case 'vallei': return <W2.ValleiScene {...p} />;
    case 'zon': return <W2.ZonScene {...p} />;
    case 'binnen': return <W2.BinnenScene {...p} at={at} />;
    case 'centrale': return <W2.CentraleScene />;
    case 'wc': return <W2.WcScene dur={dur} />;
    case 'ijs': return <W2.IjsScene dur={dur} />;
    case 'markt': return <W2.MarktScene />;
    case 'eten': return <W2.EtenScene {...p} at={at} />;
    case 'dieren': return <W2.DierenScene {...p} />;
    case 'stelten': return <W2.StelteScene {...p} />;
    case 'vuur': return <W2.VuurScene {...p} />;
    case 'bron': return <W2.BronScene {...p} />;
    case 'weg': return <W2.WegScene />;
    case 'zomer': return <W2.ZomerScene />;
    case 'kapot': return <W2.KapotScene {...p} />;
    case 'reis': return <ReisScene {...p} dur={dur} />;
    case 'dorp': return <DorpScene {...p} dur={dur} />;
    case 'school': return <SchoolScene {...p} dur={dur} />;
    case 'closeup': return <CloseupScene {...p} />;
    case 'titel': return <TitelScene {...p} />;
    case 'cijfer': return <CijferScene {...p} />;
    case 'vergelijk': return <VergelijkScene {...p} />;
    case 'feit': return <FeitScene {...p} />;
    case 'karakter': return <KarakterScene {...p} />;
    case 'kaart':
      return (
        <AbsoluteFill style={{background: C.paper}}>
          <Kaart target={{lon: p.lon, lat: p.lat, label: p.label}} zoomTo={9} dur={150} highlight={p.highlight} />
          <svg width={W} height={H} style={{position: 'absolute'}}><Kaartspeld pose="point" x={120} y={560} scale={1.2} /></svg>
        </AbsoluteFill>
      );
    default: return null;
  }
};

const Camera: React.FC<{cam?: {x: number; y: number; z: number}; dur: number; children: React.ReactNode}> = ({cam, dur, children}) => {
  const f = useCurrentFrame();
  const c = cam || {x: 960, y: 540, z: 1};
  const z = Math.max(1, c.z) * interpolate(f, [0, dur], [1, 1.07], {extrapolateRight: 'clamp'});
  // camera nooit buiten de tekening: middelpunt begrenzen
  const cx = Math.min(1920 - 960 / z, Math.max(960 / z, c.x));
  const cy = Math.min(1080 - 540 / z, Math.max(540 / z, c.y));
  return (
    <AbsoluteFill style={{transformOrigin: `${cx}px ${cy}px`, transform: `translate(${960 - cx}px, ${540 - cy}px) scale(${z})`}}>{children}</AbsoluteFill>
  );
};

export const Video: React.FC<{slug: string; timings: Timings; hasAudio: boolean}> = ({slug, timings, hasAudio}) => {
  const sc = getScript(slug).scenes;
  const fr = frames(timings);
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {sc.map((s: any, i: number) => {
        const start = from; from += fr[i];
        return (
          <Sequence key={i} from={start} durationInFrames={fr[i]}>
            <Camera cam={s.cam} dur={fr[i]}>
              <Sequence from={-Math.round((s.offset || 0) * 30)} layout="none"><Scene s={s} dur={fr[i]} at={(w: string) => Math.round(woordTijd(timings.scenes[i]?.words || [], w) * 30)} /></Sequence>
            </Camera>
            {(s.pops || []).map((pd: PopDef, k: number) => (
              <Pop key={k} {...pd} at={Math.round(woordTijd(timings.scenes[i]?.words || [], pd.woord) * 30)} />
            ))}
            {hasAudio && <Audio src={staticFile(`audio/${slug}/${String(i).padStart(2, '0')}.mp3`)} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
