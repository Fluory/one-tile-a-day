# Project Start – One Tile a Day

> Gründungsdokument nach `Entwicklungsplan/templates/base/PROJECT-START.md`. Discovery (1–6) stammt
> aus dem Konzept „Daily Isle – eine Welt, die jeden Tag wächst" (28.09.2026, @Flo); die drei
> Mechaniken des Konzepts wurden auf drei Repos verteilt – dieses Repo ist die **Living World**.

**Aktueller Status:** `foundation-ready`
**Orchestrator / Projektverantwortung:** @Fluory · **Datum gestartet:** 2026-09-28

---

## 1. Problem und Ziel

**Problem:** Generative Welten entstehen meist auf Knopfdruck und sind danach fertig – niemand kommt
wieder. Tägliche Commits („jeden Tag ein Commit") sind meist bedeutungslos.

**Zielgruppe:** GitHub- und Open-Source-Publikum, Pixel-Art- und Creative-Coding-Interessierte,
Menschen, die einem langsamen Experiment zusehen wollen.

**Nutzenversprechen:** Eine Insel, die jeden Tag um genau ein Element wächst – mit Regeln, Lore und
einer Commit-Historie, die sich wie eine Chronik liest. Transparent als „AI-maintained".

**Erster Meilenstein:** Die Insel wächst täglich allein nach den Weltregeln (MVP laut Konzept):
Repo, `world.json`, Renderer, Routine, Website.

**Erfolgskriterien:**
- [ ] 30 Tage in Folge genau ein Commit pro Tag auf `main`, kein Doppel-Commit
- [ ] Jede Tagesänderung besteht `world:check` (Regeln, Historie, generierte Dateien)
- [ ] Website zeigt die Insel des jeweiligen Commits (Vercel-Deploy je Merge)

**Nicht-Ziele (erster Meilenstein):** Wetter (→ Repo `Grow`), Community-Wünsche (→ Repo
`wished-into-being`), Konten, Kommentare, Tracking, Monetarisierung.

## 2. Scope und Nutzerablauf

| Rolle | Darf / braucht |
|---|---|
| Besucher | Website ansehen, Karte/Zeitleiste bedienen, Logbuch lesen |
| Routine (Claude) | genau eine Tagesänderung über `npm run day`, ein PR |
| Maintainer | Code-PRs, Regeln ändern, Review |

**Vertical Slice:** 08:47 Routine startet → `status` → `plan` → Claude wählt + schreibt Lore →
`apply` (Regelprüfung) → `verify` → PR → CI grün → Squash-Merge (1 Commit) → Vercel-Deploy →
Fehlerfall: Regelverstoß = Exit 2 + neuer Versuch/`auto`; CI rot = kein Merge, Tag bleibt leer.

## 3. Reifegrad und Risiko

- **Stufe:** P0 – öffentliches Experiment (keine Konten, keine personenbezogenen Daten außer Hosting-Logs)
- **Sichtbarkeit:** `public` – Begründung: bewusst Open Source, die Historie ist das Werk
- **Sprache:** Code, Doku, Commits, Lore, Website englisch; Rechtstexte deutsch

| Frage | Ja/Nein | Konsequenz |
|---|---|---|
| Öffentliche Nutzer? | Ja | Recht-Add-on (Impressum, Datenschutz) |
| Login / Rollen? | Nein | – |
| Personenbezogene Daten? | Nein | nur Server-Logs beim Hoster |
| Persistente Datenbank? | Nein | Welt liegt in Git |
| Externe APIs? | Nein | – |
| LLM / Agentenfunktion? | Ja | KI-Add-on: Prompt versioniert (`ROUTINE.md`), Evals (`evals/`) |
| Öffentliche Website? | Ja | Impressum/Datenschutz, Daten per Env-Variablen |

**Aktivierte Add-ons:** KI/RAG, Recht.

## 4. Technikentscheidungen

| Bereich | Entscheidung | Warum | Status |
|---|---|---|---|
| Sprache | TypeScript 6 (Engine, CLI, Website) | eine Sprache für Engine und Website; TS 7 ohne Compiler-API | gesetzt |
| Frontend | Next.js 16 App Router, statisch, MDX-Kapitel | Vorgabe des Orchestrators, statisches Vorrendern | gesetzt |
| 3D / Motion | React Three Fiber (eine persistente Canvas), GSAP + ScrollTrigger + SplitText, Lenis, View Transitions | Vorgabe des Orchestrators | gesetzt |
| Datenbank | keine – `world/world.json` in Git | jeder Commit = eine nachvollziehbare Änderung | gesetzt |
| Hosting | Vercel (Hobby) | Deploy je Merge, keine Server | gesetzt |
| CI | GitHub Actions (systemweit) | SYSTEM.md §11 | gesetzt |
| KI | Claude-Routine (Claude Code in der Cloud) | tägliche Auswahl + Lore | gesetzt |

**Offene Entscheidungen aus dem Konzept – als Default entschieden, änderbar:**
Name englisch („One Tile a Day", Repo-Name) · Thema Insel · Stil Pixel-Art (README) + 3D (Website) ·
Raster 64 × 64 (reicht für Jahre, Rahmen zoomt mit) · persönlicher Account `Fluory` · Uhrzeit 08:47.

## 5. Sicherheit, Daten und Betrieb

- Keine Secrets im Repo; Impressumsdaten nur als Vercel-Umgebungsvariablen.
- `.claude/settings.json` mit Read-Sperren, Wächter-Hooks, Auto Memory aus.
- Betrieb: kein Server; Rollback = `git revert` des Tages-Commits (neuer Commit, Historie bleibt).

## 6. Planung und Arbeitsfluss

Board `Inbox → Ready → In Progress → In Review → Done`; Labels aus `.github/labels.json`
(Workflow `Labels`). Merge nach Risikomatrix SYSTEM.md §5; Ausnahme: Tages-PR der Routine (Register).

## 7. Setup-Freigabe

- [x] Problem, Ziel und Nicht-Ziele verstanden – aus dem Konzept
- [x] Vertical Slice festgelegt
- [x] Stufe und Risikoprofil entschieden (P0, KI + Recht)
- [x] Sichtbarkeit entschieden (public)
- [x] Tech-Stack entschieden (Vorgabe im Auftrag)
- [x] Budget: 0 € (GitHub Free, Vercel Hobby, vorhandenes Claude-Abo)
- [x] Orchestrator gibt Setup frei – Auftrag „Setze die 3 Ideen um" vom 2026-09-28

**Freigabe durch:** @Fluory · **Datum:** 2026-09-28
