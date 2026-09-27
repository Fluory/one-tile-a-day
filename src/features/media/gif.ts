import gifenc from 'gifenc';

// gifenc ships CommonJS only – take the functions from the default export.
const { GIFEncoder, quantize } = gifenc;

/**
 * Animated GIF from RGBA frames. Palette index 0 is reserved for "unchanged since the previous
 * frame" (transparent), so a timelapse where one tile changes per day stays small.
 */
export interface GifOptions {
  delay: number;
  lastDelay?: number;
  scale?: number;
}

function key(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

export function encodeGif(frames: Uint8ClampedArray[], width: number, height: number, options: GifOptions): Uint8Array {
  const scale = options.scale ?? 1;
  // Exact palette when the frames use at most 255 colours, otherwise quantise a sample.
  const colours = new Map<number, number>();
  for (const frame of frames) {
    for (let i = 0; i < frame.length; i += 4) {
      const k = key(frame[i] as number, frame[i + 1] as number, frame[i + 2] as number);
      if (!colours.has(k)) colours.set(k, colours.size + 1);
      if (colours.size > 255) break;
    }
    if (colours.size > 255) break;
  }
  let palette: number[][];
  let lookup: (r: number, g: number, b: number) => number;
  if (colours.size <= 255) {
    palette = [[0, 0, 0], ...[...colours.keys()].map((k) => [(k >> 16) & 255, (k >> 8) & 255, k & 255])];
    lookup = (r, g, b) => colours.get(key(r, g, b)) ?? 1;
  } else {
    const step = Math.max(1, Math.floor(frames.length / 12));
    const sample = frames.filter((_, i) => i % step === 0);
    const joined = new Uint8ClampedArray(sample.reduce((n, f) => n + f.length, 0));
    let offset = 0;
    for (const f of sample) {
      joined.set(f, offset);
      offset += f.length;
    }
    const q = quantize(joined, 255) as number[][];
    palette = [[0, 0, 0], ...q];
    const cache = new Map<number, number>();
    lookup = (r, g, b) => {
      const k = key(r, g, b);
      let best = cache.get(k);
      if (best !== undefined) return best;
      let bestD = Infinity;
      best = 1;
      for (let i = 1; i < palette.length; i++) {
        const p = palette[i] as number[];
        const d = ((p[0] as number) - r) ** 2 + ((p[1] as number) - g) ** 2 + ((p[2] as number) - b) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      cache.set(k, best);
      return best;
    };
  }

  const gif = GIFEncoder();
  const outW = width * scale;
  const outH = height * scale;
  let previous: Uint8Array | null = null;
  frames.forEach((frame, n) => {
    const indexed = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      indexed[i] = lookup(frame[i * 4] as number, frame[i * 4 + 1] as number, frame[i * 4 + 2] as number);
    }
    const delta = new Uint8Array(indexed);
    if (previous) for (let i = 0; i < delta.length; i++) if (delta[i] === previous[i]) delta[i] = 0;
    previous = indexed;
    const scaled = new Uint8Array(outW * outH);
    for (let y = 0; y < outH; y++) {
      const row = Math.floor(y / scale) * width;
      for (let x = 0; x < outW; x++) scaled[y * outW + x] = delta[row + Math.floor(x / scale)] as number;
    }
    gif.writeFrame(scaled, outW, outH, {
      palette: n === 0 ? palette : undefined,
      delay: n === frames.length - 1 ? (options.lastDelay ?? options.delay) : options.delay,
      transparent: n > 0,
      transparentIndex: 0,
      dispose: 1,
      repeat: 0,
    });
  });
  gif.finish();
  return gif.bytes();
}
