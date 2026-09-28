import { chebyshev, euclid, Grid, key, type Point } from './grid';
import { isStructure, type Element, type ElementType, type Terrain, type World } from './schema';

/**
 * A read-optimised view of one world state: indices and counts that the rules, the
 * director and the renderer ask for over and over again.
 */
export class WorldContext {
  readonly grid: Grid;
  private readonly structureIndex = new Map<string, Element>();
  private readonly animalIndex = new Map<string, Element>();
  private readonly typeIndex = new Map<ElementType, Element[]>();
  private readonly residentIndex = new Map<string, Element[]>();
  private readonly terrainCounts: Record<Terrain, number> = { water: 0, sand: 0, grass: 0, rock: 0, forest: 0 };
  readonly centroid: { x: number; y: number };
  /** Rough island radius in tiles (at least 1). */
  readonly radius: number;

  constructor(readonly world: World) {
    this.grid = Grid.fromRows(world.terrain, world.width, world.height);
    for (const element of world.elements) {
      const list = this.typeIndex.get(element.type) ?? [];
      list.push(element);
      this.typeIndex.set(element.type, list);
      if (isStructure(element.type)) this.structureIndex.set(key(element.x, element.y), element);
      if (element.type === 'animal') this.animalIndex.set(key(element.x, element.y), element);
      if (element.type === 'inhabitant' && element.home) {
        const residents = this.residentIndex.get(element.home) ?? [];
        residents.push(element);
        this.residentIndex.set(element.home, residents);
      }
    }
    let sx = 0;
    let sy = 0;
    const landCells = this.grid.cellsOf((t) => t !== 'water');
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) this.terrainCounts[this.grid.get(x, y) as Terrain]++;
    }
    for (const [x, y] of landCells) {
      sx += x;
      sy += y;
    }
    const n = Math.max(1, landCells.length);
    this.centroid = { x: sx / n, y: sy / n };
    this.radius = Math.max(1, Math.sqrt(landCells.length / Math.PI));
  }

  get day(): number {
    return this.world.days[this.world.days.length - 1]?.day ?? 0;
  }

  terrainCount(terrain: Terrain): number {
    return this.terrainCounts[terrain];
  }

  get land(): number {
    return this.world.width * this.world.height - this.terrainCounts.water;
  }

  of(type: ElementType): readonly Element[] {
    return this.typeIndex.get(type) ?? [];
  }

  count(type: ElementType): number {
    return this.of(type).length;
  }

  structureAt(x: number, y: number): Element | undefined {
    return this.structureIndex.get(key(x, y));
  }

  animalAt(x: number, y: number): Element | undefined {
    return this.animalIndex.get(key(x, y));
  }

  isFree(x: number, y: number): boolean {
    return !this.structureIndex.has(key(x, y));
  }

  residentsOf(houseId: string): readonly Element[] {
    return this.residentIndex.get(houseId) ?? [];
  }

  byId(id: string): Element | undefined {
    return this.world.elements.find((e) => e.id === id);
  }

  /** Structures of the given types within Chebyshev distance `dist` (the tile itself excluded). */
  near(x: number, y: number, dist: number, types: readonly ElementType[]): Element[] {
    const out: Element[] = [];
    for (const type of types) {
      for (const e of this.of(type)) {
        if ((e.x !== x || e.y !== y) && chebyshev(x, y, e.x, e.y) <= dist) out.push(e);
      }
    }
    return out;
  }

  /** Structures of the given types on the four direct neighbours. */
  adjacent4(x: number, y: number, types: readonly ElementType[]): Element[] {
    return this.grid
      .neighbours4(x, y)
      .map(([nx, ny]) => this.structureAt(nx, ny))
      .filter((e): e is Element => e !== undefined && types.includes(e.type));
  }

  /** Distance to the nearest element of a type, Infinity if there is none. */
  nearestDistance(x: number, y: number, type: ElementType): number {
    let best = Infinity;
    for (const e of this.of(type)) best = Math.min(best, chebyshev(x, y, e.x, e.y));
    return best;
  }

  distanceToCentre(x: number, y: number): number {
    return euclid(x, y, this.centroid.x, this.centroid.y);
  }

  landCells(): Point[] {
    return this.grid.cellsOf((t) => t !== 'water');
  }

  /** Grass and sand tiles without a structure – room left to build on. */
  freeBuildable(): number {
    let n = 0;
    for (const [x, y] of this.landCells()) {
      const t = this.grid.get(x, y);
      if ((t === 'grass' || t === 'sand') && this.isFree(x, y)) n++;
    }
    return n;
  }
}
