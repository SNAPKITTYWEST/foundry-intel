# WASM Frontend Ingress

This directory is the controlled ingress point for the Primordial Foundation
WASM frontend build.

Expected production layout:

```text
apps/wasm-frontend/
  dist/
    index.html
    manifest.json
    foundation.wasm
```

Rules:

- Do not promote a frontend build without a manifest.
- Manifest must list entry file, WASM artifact names, byte sizes, and hashes.
- Pages publication must be wired through the repo workflow.
- Frontend state cannot bypass ADR, WORM, BOB, or open-crux boundaries.

Current state: waiting for the built WASM artifact path.
