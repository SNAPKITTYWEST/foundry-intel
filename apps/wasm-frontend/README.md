# WASM Frontend Ingress

This directory is the controlled ingress point for the Primordial Foundation
WASM frontend build.

Production layout:

```text
apps/wasm-frontend/
  assembly/
    foundation.ts
  tools/
    build_wasm.pl
  dist/
    index.html
    manifest.json
    foundation.wasm
```

Published Pages dock:

```text
docs/pages/wasm/
  index.html
  manifest.json
  loader.mjs
  foundation.wasm
```

Rules:

- Do not promote a frontend build without a manifest.
- Manifest must list entry file, WASM artifact names, byte sizes, and hashes.
- Pages publication must be wired through the repo workflow.
- Frontend state cannot bypass ADR, WORM, BOB, or open-crux boundaries.

Commands:

```sh
npm run build --workspace @veneer/wasm-frontend
npm test --workspace @veneer/wasm-frontend
npm run pages:build
npm run pages:check
```

Current state:

- `foundation.wasm` is tracked under `dist/`.
- `manifest.json` records SHA-256 hashes and byte sizes.
- The manifest records `21/21 pass` frontend vector status.
- `tools/ascii-glitch/build_pages.pl` copies `dist/` into `docs/pages/wasm/`.
- ADR-055 remains `OPEN_CRUX`; ADR-062 remains `SILENCE_PENDING`.
