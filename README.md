# Modern Crypto DCA Tracker

Eine hochmoderne, reine Client-Side Web-App zur Analyse und Verfolgung von Kryptowährungs-Sparplänen (DCA).

## Features
- **Top 20 Coins**: Dynamische Auswahl der aktuell nach Marktkapitalisierung führenden Coins via CoinGecko.
- **DCA-Rechner**: Präzise historische Simulation von Sparplänen (wöchentlich/monatlich).
- **Portfolio-Aggregat**: Übersicht über alle Positionen mit kombiniertem Performance-Chart.
- **Bitcoin-Block-Ticker**: LCD-Anzeige der aktuellen Blockhöhe und Zeit seit dem letzten Block via mempool.space.
- **Premium UI**: Glassmorphismus, Framer Motion Animationen und Responsive Design.
- **Dark Mode**: Vollständige Unterstützung für Light und Dark Mode.
- **Daten-Export**: CSV-Export der vollständigen Transaktionshistorie.
- **Persistenz**: Alle Daten werden sicher im LocalStorage gespeichert.

## Tech-Stack
- **React 19** mit **Vite**
- **TailwindCSS 4.0**
- **Framer Motion** (Animationen)
- **Recharts** (Charts)
- **Lucide React** (Icons)
- **Date-fns** (Datumsverarbeitung)

## Installation

1. Abhängigkeiten installieren:
   `npm install`

2. Entwicklungsserver starten:
   `npm run dev`

3. Production Build erstellen:
   `npm run build`

## Architektur
Die App ist modular aufgebaut:
- src/services: API-Integrationen (CoinGecko, mempool.space) mit Caching und Retry-Logik.
- src/context: Zentrales State-Management für Sparpläne, Kurshistorie und UI-Themen.
- src/utils: Kern-Logik für DCA-Berechnungen und Daten-Export.
- src/components: Wiederverwendbare UI-Elemente wie Layout, Header (LCD-Display) und Formulare.
- src/pages: Hauptansichten (Dashboard, Detailansicht).

## Wichtige Hinweise
- Die App benötigt eine Internetverbindung für die CoinGecko und mempool.space APIs.
- Bei Erreichen des Rate-Limits der CoinGecko API ist eine automatische Retry-Logik mit exponential backoff integriert.