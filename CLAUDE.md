@AGENTS.md

# Soldopp

Mobilanpassad Next.js-app som svarar på en fråga: "Var ska jag bada just nu?" — beslutsstöd, inte referensverktyg.

## Kommandon

```bash
npm run dev       # Starta utvecklingsserver (localhost:3000)
npm run build     # Produktionsbygge
npm run lint      # ESLint
npm run typecheck # TypeScript-kontroll
```

## Stack

- **Next.js** (App Router) — routing och rendering
- **TypeScript** — strict mode
- **Tailwind CSS** — styling
- **Geolocation API** (browser) — användarens GPS-position

## API:er

**SMHI Väderprognos**

```
GET https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/{lon}/lat/{lat}/data.json?timeseries=3&parameters=cloud_area_fraction,air_temperature,wind_speed,wind_speed_of_gust,probability_of_precipitation,thunderstorm_probability
```

Nyckelfält: `cloud_area_fraction` (0–8), `air_temperature`, `wind_speed`, `wind_speed_of_gust`, `probability_of_precipitation`, `thunderstorm_probability`, `timeSeries`

**HaV Badplats-API** — badplatser med koordinater och metadata
Nyckelfält: `bathingWater.name`, `samplingPointPosition`, `bathingSeason`, `lastFourClassifications`, `bathingWater.description`

**HaV Provresultat-API** — bakteriologiska prov per badplats
Nyckelfält: `waterTemp`, `sampleAssessIdText`, `takenAt`, `escherichiaColiAssessIdText`

## Kärnlogik

**Sol-poäng** (0–100):

```ts
solScore = Math.max(
  0,
  100 - cloud_area_fraction * 12.5 - Math.max(0, (wind_speed - 5) * 3),
);
```

**Tjänlighet** är enda hårda säkerhetssignalen. `sampleAssessIdText === "Otjänligt"` → röd varning, alltid synlig.

**Vattentemperatur** är alltid historisk. Visa alltid `takenAt`-datum bredvid värdet.

## Kodkonventioner

- App Router — använd `app/` directory, inte `pages/`
- Server Components som default, Client Components (`"use client"`) bara vid behov
- API-anrop mot SMHI och HaV görs i Server Components eller Route Handlers (`app/api/`)
- Namnge filer med kebab-case, komponenter med PascalCase
- Importera med `@/` alias

## Produktbeslut

- Startskärm = Rekommenderat (sol-rankad lista). Kommunbrowsing är sekundärvy.
- 30-sekunders-beslutet är primärt use case — prioritera snabbhet framför fullständighet.
- Ingen skuggberäkning, ingen trängseldata — ingår inte i scope.

## UI & användarflöde

**Inga val innan resultaten visas.** Rekommendationer renderas direkt med smarta defaults — aldrig en onboarding-modal eller konfigurationsskärm som första vy.

**Defaults:**

- Distansradie: 20 km
- Vattentyp: alla (sjö + hav)

**Filter** finns tillgängligt via filterikon i övre hörnet på rekommenderat-vyn. Användaren som inte bryr sig om vattentyp eller distans ska aldrig behöva interagera med det.

Tillgängliga filterval:

- Maxradie (5 / 10 / 20 / 50 km)
- Vattentyp (Alla / Sjö / Hav)

**GPS saknas eller nekas** → visa enkel kommunsökning som fallback. Funktionell fråga, inte preferensfråga — acceptabel friktion.
