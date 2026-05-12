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

## Project Layout

```text
chronos-bridge/
├── src/
│   ├── calendars/
│   ├── core/
│   └── index.js
├── tests/
├── index.js
└── package.json
```

## Usage

```js
import { convert, toJdn, fromJdn } from "chronos-bridge";

const jdn = toJdn("gregorian", { year: 2026, month: 5, day: 12 });
const islamic = fromJdn("islamic", jdn);
const hebrew = convert("gregorian", "hebrew", { year: 2026, month: 5, day: 12 });

console.log({ jdn, islamic, hebrew });
```

## Supported Conversions

All conversions are routed through JDN:

`Calendar A -> JDN -> Calendar B`

Currently supported in the public bridge:
- `Gregorian <-> JDN`
- `Islamic <-> JDN`
- `Hebrew <-> JDN`
- `Persian <-> JDN`

This means cross-conversions like these are supported via `convert(...)`:
- `Gregorian <-> Islamic`
- `Gregorian <-> Hebrew`
- `Gregorian <-> Persian`
- `Islamic <-> Hebrew`
- `Islamic <-> Persian`
- `Hebrew <-> Persian`

## Development Notes

- Keep calculations deterministic and UTC-based.
- Add tests for every algorithm change.
- Treat this repository as the shared core for higher-level domain packages.

## License

MIT
