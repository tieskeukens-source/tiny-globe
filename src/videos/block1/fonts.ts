import {continueRender, delayRender, staticFile} from 'remotion';
export const BANG = 'Bangers';
export const MARK = 'Permanent Marker';
const h = delayRender('block fonts');
Promise.all([
  new FontFace(BANG, `url(${staticFile('fonts/Bangers-Regular.ttf')})`),
  new FontFace(MARK, `url(${staticFile('fonts/PermanentMarker-Regular.ttf')})`),
].map((ff) => ff.load().then((l) => document.fonts.add(l)))).then(() => continueRender(h));
