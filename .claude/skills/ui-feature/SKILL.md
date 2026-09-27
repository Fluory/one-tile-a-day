---
name: ui-feature
description: Integriert eine neue oder geänderte UI-Funktion konsistent ins bestehende Komponentensystem. Verwenden bei sichtbaren UI-Änderungen in Projekten mit etabliertem Design System / wiederkehrenden UI-Mustern. Leitet nie ein neues Design System aus einer Einzelseite ab.
---

# /ui-feature – konsistente UI statt Wildwuchs

## Ablauf

1. Erst suchen: Gibt es eine ähnliche Komponente/Seite im selben Feature? Bestehende Komponenten vor neuen verwenden.
2. Geltende Bausteine prüfen: Design Tokens, Buttons, Inputs, Dialoge, Tabellen (`packages/ui/` oder `src/shared/ui/`).
3. Alle Zustände bauen und prüfen: Loading, Empty, Error, Erfolg – Desktop und Mobile.
4. Zugänglichkeit: Tastaturbedienung, sichtbarer Fokus, verständliche Labels.
5. Produktdoku aktualisieren, wenn sich die Bedienung ändert – im selben PR.
6. Nachweis in den PR: Screenshot oder Smoke-Test-Beschreibung.

## Grenzen

- Keine neue UI-Bibliothek ohne /architecture-decision.
- Keine neuen Farb-/Abstands-Werte an der Komponentenbibliothek vorbei.
- UI-Texte brauchen keinen Unit-Test – Prüfnachweis reicht (SYSTEM.md §11).
