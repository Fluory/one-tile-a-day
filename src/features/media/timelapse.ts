import { chooseFrame, paintWorld, rasterText, toRgba } from '@/features/render';
import { worldAt, type World } from '@/features/world';
import { encodeGif } from './gif';

/**
 * The island growing day by day as an animated GIF – one frame per day on a fixed frame, with the
 * day number burnt in. Used for the monthly release and the README.
 */
export function timelapseGif(
  world: World,
  options: { every?: number; scale?: number; label?: string } = {},
): Uint8Array {
  const every = options.every ?? 1;
  const scale = options.scale ?? 2;
  const frame = chooseFrame(world);
  const last = world.days[world.days.length - 1]?.day ?? 0;
  const days: number[] = [];
  for (let d = 0; d <= last; d += every) days.push(d);
  if (days[days.length - 1] !== last) days.push(last);

  let width = 0;
  let height = 0;
  const frames = days.map((day) => {
    const painted = paintWorld(worldAt(world, day), { frame, highlight: null });
    width = painted.width;
    height = painted.height;
    const rgba = toRgba(
      [painted.base, painted.overlays.waveA, painted.overlays.bob, painted.overlays.sailsA],
      painted.palette.sea0,
    );
    const stamp = (text: string, x0: number, y0: number) => {
      const plot = (x: number, y: number, color: [number, number, number]) => {
        const px = x0 + x;
        const py = y0 + y;
        if (px < 0 || py < 0 || px >= width || py >= height) return;
        const i = (py * width + px) * 4;
        rgba[i] = color[0];
        rgba[i + 1] = color[1];
        rgba[i + 2] = color[2];
      };
      rasterText(text, (x, y) => plot(x + 1, y + 1, [16, 33, 47]));
      rasterText(text, (x, y) => plot(x, y, [251, 246, 234]));
    };
    stamp(`DAY ${String(day).padStart(3, '0')}`, 4, 4);
    if (options.label) stamp(options.label, 4, height - 11);
    return rgba;
  });
  return encodeGif(frames, width, height, { delay: 70, lastDelay: 2500, scale });
}
