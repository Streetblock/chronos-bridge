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
