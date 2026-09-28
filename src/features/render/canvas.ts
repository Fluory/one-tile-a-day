/**
 * An indexed pixel buffer. The renderer paints into it tile by tile; exporters turn it into
 * SVG paths (README image) or RGBA data (website canvas, GIF frames).
 */
export class PixelCanvas {
  readonly data: Int32Array;
  readonly colors: string[] = [];
  private readonly lookup = new Map<string, number>();

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Int32Array(width * height).fill(-1);
  }

  private indexOf(color: string): number {
    let index = this.lookup.get(color);
    if (index === undefined) {
      index = this.colors.length;
      this.colors.push(color);
      this.lookup.set(color, index);
    }
    return index;
  }

  put(x: number, y: number, color: string): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.data[y * this.width + x] = this.indexOf(color);
  }

  get(x: number, y: number): string | undefined {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return undefined;
    const index = this.data[y * this.width + x] ?? -1;
    return index < 0 ? undefined : this.colors[index];
  }

  fill(x: number, y: number, w: number, h: number, color: string): void {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, color);
  }

  isEmpty(): boolean {
    return this.data.every((v) => v < 0);
  }

  /** Horizontal runs per colour – the compact form used for SVG paths. */
  runs(): Map<string, [x: number, y: number, length: number][]> {
    const out = new Map<string, [number, number, number][]>();
    for (let y = 0; y < this.height; y++) {
      let x = 0;
      while (x < this.width) {
        const index = this.data[y * this.width + x] ?? -1;
        if (index < 0) {
          x++;
          continue;
        }
        let end = x + 1;
        while (end < this.width && this.data[y * this.width + end] === index) end++;
        const color = this.colors[index] as string;
        const list = out.get(color) ?? [];
        list.push([x, y, end - x]);
        out.set(color, list);
        x = end;
      }
    }
    return out;
  }
}

/** Parse "#rrggbb" or "#rrggbbaa". */
export function parseHex(color: string): [number, number, number, number] {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) : 255;
  return [r, g, b, a];
}

/** Flatten layers into RGBA (alpha-blended), e.g. for a <canvas> or a GIF frame. */
export function toRgba(layers: readonly PixelCanvas[], background = '#000000'): Uint8ClampedArray {
  const base = layers[0];
  if (!base) return new Uint8ClampedArray();
  const { width, height } = base;
  const out = new Uint8ClampedArray(width * height * 4);
  const [br, bg, bb] = parseHex(background);
  for (let i = 0; i < width * height; i++) {
    out[i * 4] = br;
    out[i * 4 + 1] = bg;
    out[i * 4 + 2] = bb;
    out[i * 4 + 3] = 255;
  }
  const cache = new Map<string, [number, number, number, number]>();
  for (const layer of layers) {
    for (let i = 0; i < width * height; i++) {
      const index = layer.data[i] ?? -1;
      if (index < 0) continue;
      const color = layer.colors[index] as string;
      let rgba = cache.get(color);
      if (!rgba) {
        rgba = parseHex(color);
        cache.set(color, rgba);
      }
      const alpha = rgba[3] / 255;
      out[i * 4] = Math.round(rgba[0] * alpha + (out[i * 4] ?? 0) * (1 - alpha));
      out[i * 4 + 1] = Math.round(rgba[1] * alpha + (out[i * 4 + 1] ?? 0) * (1 - alpha));
      out[i * 4 + 2] = Math.round(rgba[2] * alpha + (out[i * 4 + 2] ?? 0) * (1 - alpha));
    }
  }
  return out;
}
