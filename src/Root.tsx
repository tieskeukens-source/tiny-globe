import React from 'react';
import {Composition} from 'remotion';
import {Poses} from './Poses';
import {Test} from './Test';
import {W, H, FPS} from './brand';

export const Root: React.FC = () => (
  <>
    <Composition id="Poses" component={Poses} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Test" component={Test} durationInFrames={150} fps={FPS} width={W} height={H} />
  </>
);
