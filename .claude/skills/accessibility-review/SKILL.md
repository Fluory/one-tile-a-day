---
name: accessibility-review
description: Prüft eine konkrete UI-Änderung auf grundlegende Zugänglichkeit. Verwenden bei UI-PRs in P1/P2-Projekten mit Web-Oberfläche, besonders vor Beta-/Produktionsfreigaben. Behauptet nie formale Zertifizierung.
---

# /accessibility-review – bedienbar für alle

## Prüft (nur die geänderte UI)

- Semantische HTML-Elemente statt Div-Konstrukte?
- Jedes Input mit Label verknüpft?
- Vollständig per Tastatur nutzbar, sichtbarer Fokus, sinnvolle Reihenfolge?
- Kontrast ausreichend (Text und Bedienelemente)?
- Fehlermeldungen verständlich und dem Feld zugeordnet?
- Dialoge: Fokus-Management korrekt (rein, gefangen, zurück)?
- Screenreader-relevante Infos vorhanden (Alt-Texte, aria wo nötig – nicht wo unnötig)?

## Ergebnisformat

```
[Blocker/Wichtig/Hinweis] – Komponente – Problem – konkrete Empfehlung
```

## Grenzen

- Identifiziert Risiken und Testbedarf; keine formale Konformitätsaussage (WCAG-Audit ist ein eigener, menschlich verantworteter Schritt).
- Keine ungefragten Umbauten – Befunde gehen in den PR.
