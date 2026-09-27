import { TERRAIN_CHARS, terrainFromChar, type Terrain } from './schema';

export type Point = readonly [x: number, y: number];

const N4: readonly Point[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
const N8: readonly Point[] = [...N4, [1, -1], [1, 1], [-1, 1], [-1, -1]];

export const key = (x: number, y: number): string => `${x},${y}`;

/** Chebyshev distance – "within N tiles" in every direction, diagonals included. */
export const chebyshev = (ax: number, ay: number, bx: number, by: number): number =>
  Math.max(Math.abs(ax - bx), Math.abs(ay - by));

export const euclid = (ax: number, ay: number, bx: number, by: number): number =>
  Math.hypot(ax - bx, ay - by);

/** Mutable terrain grid. Built from and written back to the ASCII rows in world.json. */
export class Grid {
  private constructor(
    readonly width: number,
    readonly height: number,
    private readonly cells: Terrain[],
  ) {}

  static fromRows(rows: readonly string[], width: number, height: number): Grid {
    if (rows.length !== height) throw new Error(`terrain has ${rows.length} rows, expected ${height}`);
    const cells: Terrain[] = [];
    rows.forEach((row, y) => {
      if (row.length !== width) throw new Error(`terrain row ${y} has ${row.length} columns, expected ${width}`);
      for (const char of row) cells.push(terrainFromChar(char));
    });
    return new Grid(width, height, cells);
  }

  static filled(width: number, height: number, terrain: Terrain): Grid {
    return new Grid(width, height, new Array<Terrain>(width * height).fill(terrain));
  }

  clone(): Grid {
    return new Grid(this.width, this.height, [...this.cells]);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x: number, y: number): Terrain | undefined {
    return this.inBounds(x, y) ? this.cells[y * this.width + x] : undefined;
  }

  set(x: number, y: number, terrain: Terrain): void {
    if (!this.inBounds(x, y)) throw new Error(`(${x},${y}) is outside the map`);
    this.cells[y * this.width + x] = terrain;
  }

  isLand(x: number, y: number): boolean {
    const t = this.get(x, y);
    return t !== undefined && t !== 'water';
  }

  isWater(x: number, y: number): boolean {
    return this.get(x, y) === 'water';
  }

  neighbours4(x: number, y: number): Point[] {
    return N4.map(([dx, dy]) => [x + dx, y + dy] as Point).filter(([nx, ny]) => this.inBounds(nx, ny));
  }

  neighbours8(x: number, y: number): Point[] {
    return N8.map(([dx, dy]) => [x + dx, y + dy] as Point).filter(([nx, ny]) => this.inBounds(nx, ny));
  }

  count4(x: number, y: number, test: (t: Terrain, nx: number, ny: number) => boolean): number {
    return this.neighbours4(x, y).filter(([nx, ny]) => test(this.get(nx, ny) as Terrain, nx, ny)).length;
  }

  count8(x: number, y: number, test: (t: Terrain, nx: number, ny: number) => boolean): number {
    return this.neighbours8(x, y).filter(([nx, ny]) => test(this.get(nx, ny) as Terrain, nx, ny)).length;
  }

  /** Land tile with open water on at least one side (4-neighbourhood). */
  isCoast(x: number, y: number): boolean {
    return this.isLand(x, y) && this.count4(x, y, (t) => t === 'water') > 0;
  }

  /** Water tile next to land (4-neighbourhood). */
  isShore(x: number, y: number): boolean {
    return this.isWater(x, y) && this.count4(x, y, (t) => t !== 'water') > 0;
  }

  cellsOf(test: (t: Terrain) => boolean): Point[] {
    const out: Point[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (test(this.cells[y * this.width + x] as Terrain)) out.push([x, y]);
      }
    }
    return out;
  }

  toRows(): string[] {
    const rows: string[] = [];
    for (let y = 0; y < this.height; y++) {
      let row = '';
      for (let x = 0; x < this.width; x++) row += TERRAIN_CHARS[this.cells[y * this.width + x] as Terrain];
      rows.push(row);
    }
    return rows;
  }
}
