import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Kaart} from './components/Kaart';
import {Kaartspeld} from './components/Kaartspeld';
import {TitelScene, CijferScene, VergelijkScene, FeitScene} from './components/Scenes';
import {C, W, H} from './brand';

// Demo: 4 scènes van 3-4 seconden, werkt als test van alle bouwstenen
export const Oymyakon: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={120}><TitelScene titel="Hoe leef je in het koudste dorp ter wereld?" sub="Tiny Globe" /></Sequence>
    <Sequence from={120} durationInFrames={150}>
      <AbsoluteFill style={{background: C.paper}}>
        <Kaart target={{lon: 142.79, lat: 63.46, label: 'Oymyakon'}} zoomTo={9} dur={110} highlight="Russia" />
        <svg width={W} height={H} style={{position: 'absolute'}}><Kaartspeld pose="point" x={120} y={560} scale={1.2} /></svg>
      </AbsoluteFill>
    </Sequence>
    <Sequence from={270} durationInFrames={90}><CijferScene cijfer="-67°C" label="laagste gemeten temperatuur" kleur={C.blue} /></Sequence>
    <Sequence from={360} durationInFrames={90}><VergelijkScene a={{naam: 'Amsterdam', waarde: 17, tekst: '17°'}} b={{naam: 'Oymyakon (jan)', waarde: -50, tekst: '-50°'}} /></Sequence>
    <Sequence from={450} durationInFrames={90}><FeitScene tekst="Auto's blijven de hele dag draaien" /></Sequence>
  </AbsoluteFill>
);
