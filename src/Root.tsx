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
import {KuskoyVideo, SHORT_FRAMES as KUSKOY_FRAMES} from './videos/kuskoy/KuskoyVideo';
import {OymyakonVideo, SHORT_FRAMES as OYM_FRAMES} from './videos/oymyakon/OymyakonVideo';
import {GuessVideo, SHORT_FRAMES as GUESS1_FRAMES} from './videos/guess1/GuessVideo';
import {NoMcdVideo, SHORT_FRAMES as NOMCD_FRAMES} from './videos/nomcd/NoMcdVideo';
import {BridgeShort, BRIDGE_FRAMES} from './videos/bridge/Bridge';
import {Oymyakon} from './Oymyakon';
import {CrewSheet} from './videos/block1/CrewSheet';
import {BlockVideo, SHORT_FRAMES as BLOCK1_FRAMES} from './videos/block1/BlockVideo';
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
    <Composition id="Kuskoy" component={KuskoyVideo} durationInFrames={KUSKOY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="NoMcd" component={NoMcdVideo} durationInFrames={NOMCD_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Guess1" component={GuessVideo} durationInFrames={GUESS1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OymyakonShort" component={OymyakonVideo} durationInFrames={OYM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Baarle" component={BaarleVideo} durationInFrames={BAARLE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Block1" component={BlockVideo} durationInFrames={BLOCK1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CrewSheet" component={CrewSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
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
