# AGENTS.md – One Tile a Day

A pixel island in a public GitHub repository that grows by exactly one tile per day. A scheduled
Claude routine chooses the change and writes one line of lore; the code enforces the world rules;
a Next.js site shows the island in 3D. For visitors, contributors and the routine itself.

> Project card: keep it under ~100 lines (hard limit 200 – `scripts/doku-check.sh`). Full rulebook:
> https://github.com/fluory/entwicklungsplan/blob/main/SYSTEM.md · Profile: `project-profile.yml`
> (stage P0 + add-ons `ki_rag`, `recht`) · Area rules: `.claude/rules/` (load only when matching files are read).

## Commands & proof

- Setup: `npm ci` · Start: `npm run dev` (http://localhost:3000) · World: `npm run day -- <status|plan|apply|auto|check|render>`
- `verify:changed` – inner loop: prettier + eslint on touched files, `tsc`, `vitest related`, world check if world code changed. `npm run verify:changed`
- `verify` – canonical PR proof: format check, lint, types, all unit tests, `world:check`, `next build`. `npm run verify` A PR is not `ready-for-review` while verify fails, cannot run, or the exception is not justified in the PR.
- `verify:full` – verify + Playwright smoke (`e2e/`); before a release, after risky refactors or with the PR label `verify-full`. `npm run verify:full`
- Test and verify output is trimmed automatically (`scripts/quiet-run.sh` via the hook `filter-test-output.sh`): exit code unchanged, full log path printed; prefix `FLUORY_FULL_OUTPUT=1` once when the cause is unclear.
- **Docs guard:** `scripts/doku-check.sh` – runs in CI and in `/finish-work`.

## Technical defaults

System-wide decisions: `Entwicklungsplan/STACK-DEFAULTS.md`. Project choice (docs/PROJECT-START.md):
TypeScript 6 everywhere · Next.js 16 App Router (static, Vercel) · React Three Fiber (one persistent
canvas) · GSAP + ScrollTrigger + SplitText · Lenis · MDX chapters · Vitest · Playwright. Deviations
from system-wide decisions: none. Exceptions: register in `docs/ARCHITEKTUR.md`.

## Rules (short form)

<!-- Do not rename this heading: .claude/hooks/session-start.sh re-injects exactly this section
     at every start, resume and after every context compaction. -->

1. `main` only via PR. Work only with an issue + branch `claude/<type>-<topic>-<issue-nr>` + draft PR. (The daily routine uses `claude/daily-<date>` and follows ROUTINE.md.)
2. Claim the issue: assign + comment "Claimed by @account on branch …" + draft PR within ~1 h. Stale claims (48 h without push) go back to Ready. Max. 2 issues `In Progress` per project.
3. Acceptance criteria or spec first, then test, then code. Verify green before ready-for-review.
   **Stuck protocol:** hypothesis → focused check; failed → document result and cause; a second attempt only with a changed hypothesis; after two failures reset (`/rewind` and/or git), update the draft PR, set `blocked`, ask a precise question. Never weaken, delete or bypass tests to get green.
4. Docs only for long-lived knowledge – but in the same PR. Every PR has the plain-language section „Was ist passiert (Klartext)".
5. Never merge your own PR – reviewer role, preferably the other account (checklist: Entwicklungsplan/templates/review-checkliste.md). Only exception: the routine's daily world PR, merged by CI (register).
6. New files belong to a module of the architecture map – otherwise update the map first.
7. No secrets in code, logs or repo. Remove the worktree once everything is pushed and a PR exists (or the work was consciously discarded); with an open draft PR it may stay – it is always replaceable.
8. Guards (`.claude/settings.json`): push to `main`/`master`, force-push and `--no-verify` are blocked; the stop check demands a safe state before the end. False alarm → issue in the control center, never disable or bypass a hook.
9. Load context in stages and navigate from the precise signal to the broad one (see below); never read whole folders, logs or history without a concrete reason.
10. Git checkpoint before risky operations (migration, generator, dependency upgrade, file moves, mass edits, discarding changes): commit or stash first – `/rewind` is no substitute for git. Before a new shared utility, adapter, validator or service: search for existing functionality and state it in the PR.
11. Language: technical artefacts are English by default (code, identifiers, this card, rules, ADRs, technical docs, commit messages, PR titles; issue titles and acceptance criteria in public projects). User-facing, customer and legal texts follow their audience. Never maintain a technical rule in two languages; existing German text is translated at its next substantive edit, never in a bulk refactor.
12. The island (`world/world.json`, `world/isle.svg`, `LOGBOOK.md`) changes only through `npm run day` – once per calendar day, by the routine. `RULES.md` and `LOGBOOK.md` are generated: change `catalogue.ts`/`rules.ts`, then `npm run world:render`.

## Context routing (read first, not in advance)

| Topic | Read first |
|---|---|
| Architecture / modules / exceptions | `docs/ARCHITEKTUR.md` |
| Why the project exists, decisions of the founding | `docs/PROJECT-START.md` |
| The daily routine (prompt) | `ROUTINE.md` · guard-rail evals: `evals/README.md` |
| World rules and their tests | `src/features/world/rules.ts`, `catalogue.ts`, `*.test.ts` |
| Pixel renderer / palettes | `src/features/render/` |
| 3D scene (persistent canvas) | `src/features/scene/` – pages direct it via `SceneDirective` / `SceneSection` |
| Website pages and story | `src/app/`, `src/features/story/`, `src/features/map/`, `src/content/chapters/` |
| Design tokens, glass, grain, motion | `src/app/globals.css`, `src/shared/ui/`, `src/shared/motion/` |
| Legal pages (imprint data from env) | `src/features/legal/`, `src/app/impressum/`, `src/app/datenschutz/` |
| Current work | open draft PRs + issues |
| Rules for one area (API, infra, security, AI, tests, E2E) | `.claude/rules/<area>.md` – loaded automatically when you read matching files |

## Navigation ladder

1. Issue and current PR diff → 2. affected test file → 3. directly imported implementation → 4. LSP: definition, references, type, call hierarchy → 5. targeted text search → 6. public interface of the neighbouring module (`index.ts`) → 7. ADR, architecture map, old PRs or logs → 8. broad repository exploration, only last.

## Reading rule

Stages: this card + issue → PR diff + module + tests → neighbouring interface → history only on concrete occasion. Delegate mass reading to a read-only scout: state what to find, max. 12 files, per finding path + line range + role in one sentence, no whole files, no summary of the whole project. Subagents use the smallest sufficient model for mechanical work (SYSTEM.md §8); the top model only for architecture, review and hard debugging.

## Skill register (load on demand – not everything up front)

Installed in `.claude/skills/`: **start-work · finish-work · review-pr · plan-issue** (core) and **ui-feature · accessibility-review** (public web UI with a design system in `src/shared/ui` + `globals.css`).
Others exist as templates in `Entwicklungsplan/templates/skills/` and are installed once their trigger occurs. Catalogue: `Entwicklungsplan/templates/skills/README.md`.

## Project specifics

- Deploy: Vercel, repository root, no build settings needed. Every merge to `main` (one per day) redeploys; `vercel.json` skips previews for `claude/daily-*`.
- Optional env vars (Vercel): `NEXT_PUBLIC_SITE_URL`, `IMPRINT_NAME`, `IMPRINT_STREET`, `IMPRINT_CITY`, `IMPRINT_EMAIL` (imprint), `NEXT_PUBLIC_GROW_URL`, `NEXT_PUBLIC_WISHED_URL` (sister islands).
- Time zone of the island: Europe/Berlin. Genesis (day 0): 2026-09-28. Routine: daily 08:47.
- Pitfall: `next build` type-checks with TypeScript 6 – TypeScript 7 has no compiler API yet; do not upgrade blindly.
