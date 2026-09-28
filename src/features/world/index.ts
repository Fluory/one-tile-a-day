/** Public interface of the world module – other modules import only from here. */
export { applyDay, createGenesis, WorldRuleError, GENESIS_LORE, GENESIS_TITLE, type DayChoice } from './apply';
export { addDays, berlinDate, daysBetween, formatDate, formatMonth, isIsoDate, seasonOf, TIME_ZONE, type Season } from './calendar';
export { ACTIONS, CATALOGUE, isAction, ROLES, SPECIES, TREE_KINDS, type Action, type ActionInfo } from './catalogue';
export { WorldContext } from './context';
export { options, recommend, type ActionOption, type Suggestion } from './director';
export { chebyshev, Grid, key, type Point } from './grid';
export { validateWorld, worldAt } from './history';
export { treeKind } from './lore';
export { describePlace, type Place } from './places';
export { createRng, hashCell, hashString, type Rng } from './rng';
export { allowedRoles, allowedSpecies, candidateTiles, checkPlacement, MAP_MARGIN } from './rules';
export {
  BEING_TYPES,
  ELEMENT_TYPES,
  isBeing,
  isStructure,
  isTerrainAction,
  parseWorld,
  STRUCTURE_TYPES,
  TERRAIN_ACTIONS,
  TERRAIN_CHARS,
  TERRAINS,
  type DayAction,
  type DayEntry,
  type Element,
  type ElementType,
  type StructureType,
  type Terrain,
  type TerrainAction,
  type World,
} from './schema';
export { worldStats, type WorldStats } from './stats';
