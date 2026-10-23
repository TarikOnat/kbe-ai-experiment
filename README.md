# kbe-ai-experiment – Profilverwaltung im Studierendenportal

Profilverwaltungsseite für Studierende eines **fiktiven Hochschulportals** im Stil der HTW Berlin.
Entstanden im Rahmen eines KI-Experiments mit Claude Code.

**Stack:** Vue.js 3 (Composition API, `<script setup>`) · TypeScript · Vite · CSS (ohne UI-Framework)

## Funktionen

- **Profilansicht** mit Übersichtskarte (Initialen-Avatar, Studiengang, Status, Matrikelnummer, Profil-Vollständigkeit, Zeitpunkt der letzten Speicherung)
- **Persönliche Angaben:** Anrede, Titel, Vor-/Nachname, Geburtsdatum/-ort, Staatsangehörigkeit
- **Kontakt & Anschrift:** private E-Mail, Telefon, Straße, PLZ, Ort, Land
- **Studienbezogene Informationen:** Studiengang (Abschluss und Fachbereich werden automatisch abgeleitet), Fachsemester, Studienbeginn, Schwerpunkt
  - Matrikelnummer, Hochschul-E-Mail und Immatrikulationsstatus sind schreibgeschützt (🔒, werden „von der Verwaltung gepflegt“)
- **Bearbeiten & Speichern**
  - Lese- und Bearbeitungsmodus; Änderungen wirken erst nach dem Speichern
  - Validierung pro Feld (nach Verlassen des Feldes) plus Fehlerübersicht mit Sprunglinks beim Speichern
  - „Speichern“ ist nur aktiv, wenn etwas geändert wurde; `Strg + S` speichert
  - Rückfrage beim Abbrechen mit ungespeicherten Änderungen sowie Browser-Warnung beim Verlassen der Seite
  - Persistenz im `localStorage` (simuliertes Backend mit Latenz); „Demo-Daten zurücksetzen“ im Footer
- **UI:** responsiv (Desktop/Tablet/Smartphone), barrierearm (Labels, `aria-invalid`/`aria-describedby`, Skip-Link, Tastaturbedienung, Fokusführung)

## Starten

Voraussetzung: Node.js ≥ 20 und npm.

```bash
npm install      # Abhängigkeiten installieren (einmalig)
npm run dev      # Entwicklungsserver starten
```

Danach im Browser öffnen: **http://localhost:5173/**
Beenden: im Terminal `Strg + C` drücken.

Weitere Befehle:

| Befehl              | Zweck                                                |
| ------------------- | ---------------------------------------------------- |
| `npm test`          | Unit- und Komponententests (Vitest)                  |
| `npm run typecheck` | TypeScript-Prüfung inkl. `.vue`-Dateien (`vue-tsc`)  |
| `npm run build`     | Typprüfung + Produktions-Build nach `dist/`          |
| `npm run preview`   | Produktions-Build lokal ausliefern (Port 4173)       |

## Projektstruktur

```
src/
├── assets/main.css             # Design-Tokens (HTW-Grün, Anthrazit) & globale Styles
├── components/                 # AppHeader, AppFooter, FormField, ProfileSection,
│                               # ProfileSummary, ConfirmDialog, ToastStack, BaseIcon
├── composables/
│   ├── useProfile.ts           # Profilzustand: Laden, Bearbeiten, Validieren, Speichern
│   └── useToasts.ts            # Hinweis-Meldungen
├── data/catalog.ts             # Studiengänge, Fachbereiche, Auswahllisten, Demo-Profil
├── services/profileStorage.ts  # Persistenz (localStorage, robust gegen kaputte Daten)
├── types/profile.ts            # TypeScript-Datenmodell
├── utils/validation.ts         # Validierungsregeln
├── views/ProfileView.vue       # Profilseite
├── App.vue
└── main.ts
tests/                          # Vitest-Tests
```

> Hinweis: Alle Personen- und Studiendaten sind fiktiv. Das Projekt ist kein offizielles Angebot der HTW Berlin.
