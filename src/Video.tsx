import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Kaart} from './components/Kaart';
import {Kaartspeld, Pose} from './components/Kaartspeld';
import {TitelScene, CijferScene, VergelijkScene, FeitScene, KarakterScene} from './components/Scenes';
import {C, W, H} from './brand';
import script from '../videos/oymyakon.json';

export type Timings = {scenes: {dur: number; words: [string, number, number][]}[]};
export const PAD = 0.5;
const FPS_ = 30;

const SCRIPTS: Record<string, any> = {oymyakon: script};
export const getScript = (slug: string) => SCRIPTS[slug];

// Zonder audio (lokale preview): schat de duur op basis van het aantal woorden
export const estimate = (slug: string): Timings => ({
  scenes: getScript(slug).scenes.map((s: any) => ({dur: s.text.split(' ').length / 2.6, words: []})),
});

export const frames = (t: Timings) => t.scenes.map((s) => Math.ceil((s.dur + PAD) * FPS_));

const Scene: React.FC<{s: any}> = ({s}) => {
  const p = s.props;
  switch (s.type) {
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
            <Scene s={s} />
            {hasAudio && <Audio src={staticFile(`audio/${slug}/${String(i).padStart(2, '0')}.mp3`)} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
