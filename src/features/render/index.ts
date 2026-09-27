/** Public interface of the render module. */
export { PixelCanvas, parseHex, toRgba } from './canvas';
export { rasterText, textWidth, wrapText } from './font';
export {
  chooseFrame,
  FRAME_SIZES,
  OVERLAYS,
  paintWorld,
  TILE,
  type Frame,
  type Overlay,
  type PaintedIsland,
  type PaintOptions,
} from './paint';
export { AWNINGS, CLOTHES, FUR, PALETTES, ROOFS, SAILS, type ColorKey, type Palette } from './palette';
export { renderIsleSvg, type SvgOptions } from './svg';
