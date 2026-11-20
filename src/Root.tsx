import React from 'react';
import {Composition} from 'remotion';
import {Poses} from './Poses';
import {Test} from './Test';
import {Oymyakon} from './Oymyakon';
import {Video, estimate, frames, Timings} from './Video';
import {staticFile} from 'remotion';
import {W, H, FPS} from './brand';

export const Root: React.FC = () => (
  <>
    <Composition id="Poses" component={Poses} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Test" component={Test} durationInFrames={150} fps={FPS} width={W} height={H} />
    <Composition id="Oymyakon" component={Oymyakon} durationInFrames={540} fps={FPS} width={W} height={H} />
    <Composition
      id="Video"
      component={Video as any}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{slug: 'oymyakon', timings: estimate('oymyakon'), hasAudio: false}}
      calculateMetadata={async ({props}: any) => {
        let timings: Timings = estimate(props.slug);
        let hasAudio = false;
        try {
          const r = await fetch(staticFile(`audio/${props.slug}/timings.json`));
          if (r.ok) { timings = await r.json(); hasAudio = true; }
        } catch (e) { /* geen audio: schatting */ }
        return {durationInFrames: frames(timings).reduce((a, b) => a + b, 0), props: {...props, timings, hasAudio}};
      }}
    />
  </>
);
