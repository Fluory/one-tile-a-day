# Contributing

Thanks for stopping by the island! A few things are different here, because the island grows by itself.

## What you can change

- **Code** – the world engine (`src/features/world`), the renderer (`src/features/render`), the
  website (`src/app`, `src/features/*`), tests and docs. Open an issue first for anything bigger
  than a small fix, so we can agree on the goal.
- **Rules** – new buildings, trades or animals are welcome as proposals. A rule change needs a
  test in `src/features/world/*.test.ts` and an updated sentence in `catalogue.ts` (RULES.md is
  generated from it).

## What you cannot change

- **The island itself.** `world/world.json`, `world/isle.svg` and `LOGBOOK.md` change exactly once a
  day, through the routine described in [ROUTINE.md](../ROUTINE.md). Pull requests that edit them by
  hand are closed.

## Workflow

1. Fork, create a branch, make the change.
2. `npm ci`, then `npm run verify` (format, lint, types, tests, world check, build) must be green.
3. Open a pull request with a clear description. Maintainers fill in the project's PR template
   (Klartext, Nachweis, Doku-Entscheidung) before merging – you do not have to.

## Development

```bash
npm ci
npm run dev                 # website on http://localhost:3000
npm run day -- plan         # what the routine would see today
npm run day -- status       # is today already done?
npm test                    # unit tests
```

By contributing you agree that your code is released under the MIT license and any world content
under CC BY 4.0. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
