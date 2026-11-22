import React from 'react';
import {Composition} from 'remotion';
import {Poses} from './Poses';
import {Test} from './Test';
import {Thumb} from './Thumb';
import {Profiel, Banner} from './Brand2';
import {MockupV2} from './MockupV2';
import {CastSheet} from './videos/baarle/CastSheet';
import {BaarleVideo, BAARLE_FRAMES} from './videos/baarle/Bridge';
import {IgboVideo, IGBO_FRAMES} from './videos/igbo/IgboVideo';
import {IgboCast} from './videos/igbo/IgboCast';
import {IgboShortVideo, SHORT_FRAMES} from './videos/igboshort/IgboShortVideo';
import {BridgeShort, BRIDGE_FRAMES} from './videos/bridge/Bridge';
import {Oymyakon} from './Oymyakon';
import {Video, estimate, frames, Timings} from './Video';
import {staticFile} from 'remotion';
import {W, H, FPS} from './brand';

export const Root: React.FC = () => (
  <>
    <Composition id="ThumbA" component={Thumb} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{variant: 'A'}} />
    <Composition id="ProfielA" component={Profiel} durationInFrames={1} fps={FPS} width={1000} height={1000} defaultProps={{v: 'A'}} />
    <Composition id="BannerA" component={Banner} durationInFrames={1} fps={FPS} width={2560} height={1440} defaultProps={{v: 'A'}} />
    <Composition id="ProfielB" component={Profiel} durationInFrames={1} fps={FPS} width={1000} height={1000} defaultProps={{v: 'B'}} />
    <Composition id="BannerB" component={Banner} durationInFrames={1} fps={FPS} width={2560} height={1440} defaultProps={{v: 'B'}} />
    <Composition id="ProfielC" component={Profiel} durationInFrames={1} fps={FPS} width={1000} height={1000} defaultProps={{v: 'C'}} />
    <Composition id="BannerC" component={Banner} durationInFrames={1} fps={FPS} width={2560} height={1440} defaultProps={{v: 'C'}} />
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Igbo" component={IgboVideo} durationInFrames={IGBO_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="IgboCast" component={IgboCast} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="IgboShort" component={IgboShortVideo} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Baarle" component={BaarleVideo} durationInFrames={BAARLE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="CastSheet" component={CastSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="MockupV2" component={MockupV2} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="ThumbB" component={Thumb} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{variant: 'B'}} />
    <Composition id="ThumbC" component={Thumb} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{variant: 'C'}} />
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
