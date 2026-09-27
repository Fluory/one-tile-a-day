# Changelog – One Tile a Day

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Newest entry first.
Only what changes **in the product** – the daily world changes live in [LOGBOOK.md](LOGBOOK.md).

## [Unreleased]

### Added
- World engine: 64 × 64 tile map, 20 kinds of change with dependency rules, deterministic director, time travel (`worldAt`), history validation.
- Pixel renderer for `world/isle.svg`: hand-drawn sprites, soft coastlines, dithered sea depth, four seasonal palettes, CSS-animated waves, sails, lamp and a marker for the newest tile.
- Day CLI for the routine: `status`, `plan`, `apply`, `auto`, `check`, `render`, `pr-body`, `commit-message`, `genesis`.
- Generated `LOGBOOK.md` and `RULES.md`.
- Daily routine instructions in `ROUTINE.md`; CI merges the routine's daily pull request with squash when green.
- Website: persistent 3D island behind every page, scroll story with a timelapse, pixel map explorer with timeline, logbook, day pages, four MDX chapters, day/night theme, imprint and privacy pages.
- Genesis: day 0 on 2026-09-28 – a sandbank in the open sea.
