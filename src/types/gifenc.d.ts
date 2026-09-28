/** Minimal types for gifenc (the package ships none). */
declare module 'gifenc' {
  interface FrameOptions {
    palette?: number[][];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }
  interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, options?: FrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  const gifenc: {
    GIFEncoder(options?: { auto?: boolean; initialCapacity?: number }): Encoder;
    quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, options?: object): number[][];
    applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: number[][], format?: string): Uint8Array;
  };
  export default gifenc;
}
