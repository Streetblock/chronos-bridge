# ChronosBridge

Universal calendar conversion engine for JavaScript.

ChronosBridge focuses on mathematical calendar logic only:
- Gregorian
- Hebrew
- Islamic
- Persian (Jalali)
- Julian Day Number (JDN) bridge

## Scope

This package does **not** include:
- country-specific holiday laws
- legal-day classification
- localization/business rules

## Calendar Models (Important)

ChronosBridge currently uses **deterministic algorithmic/tabular models**.
It does **not** use observational moon-sighting datasets.

- Islamic: arithmetic/tabular model (30-year leap cycle), not moon-sighting based.
- Hebrew: fixed calculated rabbinic calendar (Metonic cycle + rule-based month lengths).
- Persian (Jalali): arithmetic conversion model, not observatory/equinox-per-location calculation.

This is expected to produce differences vs. regional religious authorities or observational calendars in some cases.

## Current Project Layout

```text
chronos-bridge/
├── chronos-bridge.js
├── index.js
└── package.json
```

## Usage (planned package API)

```js
import { ChronosBridge } from "chronos-bridge";

const nowruz = ChronosBridge.Persian.findDateInGregorianYear(2026, 1, 1);
console.log(nowruz?.toISOString());
```

## Development Notes

- Keep calculations deterministic and UTC-based.
- Add tests for every algorithm change.
- Treat this repository as the shared core for higher-level domain packages.

## License

MIT
