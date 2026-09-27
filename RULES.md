# World rules

> Generated from [`src/features/world/catalogue.ts`](src/features/world/catalogue.ts). The code in
> [`rules.ts`](src/features/world/rules.ts) enforces exactly these sentences – change both together,
> then run `npm run world:render`.

The island grows by **exactly one change per calendar day** (Europe/Berlin). A change is a piece of
**ground** (the terrain of one tile changes), a **structure** that occupies a tile, or **life** that
settles on the island. Elements depend on each other, so the island develops believably instead of randomly.

## Ground

| | Change | Rule |
|---|---|---|
| 🏝️ | **Land** | Sand rises from open water that touches the island on at least one side, never closer than two tiles to the edge of the map. |
| 🌿 | **Meadow** | Sand turns to grass only inland (no open water on any side) and only next to existing grass – the very first meadow needs sand on all four sides. |
| 🪨 | **Rocks** | Rock breaks through bare sand or grass on the coast, or grows inland from rock that is already there. At most one rock per twelve tiles of land. |
| 🌲 | **Forest** | Bare grass becomes forest when at least two trees or forest tiles surround it. Forest may cover at most a quarter of the land. |

## Structures

| | Structure | Rule |
|---|---|---|
| 🌳 | **Tree** | A tree needs a free grass tile. |
| 🏠 | **House** | A house needs a free grass or sand tile with land on at least three sides and no other house directly next to it. Every house after the first stands at most three tiles from a house or path. |
| 🛤️ | **Path** | Paths appear once there are two houses. A path tile must touch a house, a path or a public building, and paths never form a 2×2 square. |
| 🌾 | **Field** | A field needs a free grass tile at most three tiles from a house and two inhabitants to work it. At most two fields per house. |
| 🌷 | **Garden** | A garden sits on free grass directly next to a house. One garden per house. |
| 🪣 | **Well** | A well needs two houses, a spot at most two tiles from a house and no other well within five tiles. |
| 🪵 | **Jetty** | A jetty is built into the water next to a sandy shore, with a house at most six tiles away. At most three jetties. |
| ⛵ | **Boat** | A boat needs someone to sail it and moors in open water next to a jetty or the harbour. One boat per jetty or harbour. |
| ⚓ | **Harbour** | The harbour needs a sandy coast tile, three houses and a jetty within three tiles. There is only one. |
| 🗼 | **Lighthouse** | The lighthouse needs rock on the coast and at least one house for its keeper. There is only one. |
| 📚 | **Library** | The library needs at least three houses and free grass directly next to a path. There is only one. |
| 🌬️ | **Windmill** | A windmill needs free grass with two fields within three tiles. At most two. |
| 🏪 | **Market** | The market needs five houses and a free tile touching at least two path tiles. There is only one. |
| 🏛️ | **Ruin** | Ruins of an older time surface on forest, rock or grass at least five tiles from any house, once the island has thirty tiles of land. At most two. |

## Life

| | Who | Rule |
|---|---|---|
| 🧑 | **Inhabitant** | An inhabitant moves into a house with room (two per house). Their trade must fit the island: a keeper needs the lighthouse, a farmer a field, a fisher a jetty, boat, harbour or a house on the beach. |
| 🐑 | **Animal** | An animal needs a free tile of the ground it likes (sheep on grass, goats near rock, foxes and deer in the forest, gulls and crabs on the beach, cats and dogs near a house). At most one animal per eight tiles of land. |

**Trades:** fisher, farmer, keeper, librarian, miller, baker, carpenter, weaver, healer, merchant, boatbuilder, storyteller, child.

**Species:** sheep, goat, cat, dog, fox, deer, rabbit, gull, crab.

## Always

- One change per calendar day, never two. If the routine runs twice, the second run changes nothing.
- The map is 64 × 64 tiles; a margin of 2 tiles along the edge stays open sea.
- Every change gets a title and one line of lore: plain text, no links, no @mentions, no real people or brands.
- Everything visible is drawn from the seasonal palettes in `src/features/render/palette.ts` – no outside images.
