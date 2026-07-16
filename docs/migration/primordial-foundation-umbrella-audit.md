# Primordial Foundation Umbrella Audit

This is the working audit for turning this repository into the main umbrella
monorepo for THE SHARED PRIMORDIAL FOUNDATION.

## Current Canonical Repo

| Field | Value |
|---|---|
| GitHub | `SNAPKITTYWEST/foundry-intel-2026-07-11` |
| Local path | `C:\Users\jessi\veneer-deploy` |
| Canonical identity | THE SHARED PRIMORDIAL FOUNDATION |
| Subsystem name | Foundry Intel governance and intelligence layer |
| Main ADR | ADR-303 |

## Present In The Umbrella

| Surface | Status |
|---|---|
| ADR governance | present |
| SWI-Prolog law engine | present and locally validated |
| ADR loop | present |
| Q(phi) parser and manifest | present |
| XML handoff envelopes | present |
| Trust/rebrand docs | present |
| Static backend ASCII/glitch Pages | present |
| GitHub Pages workflow | present |
| TypeScript package workspace | present |
| Liquid Haskell lane | present |
| Lean substrate lane | present, with local untracked `lean-substrate/src/Topology.lean` still not staged |
| WASM frontend build | present and tracked under `apps/wasm-frontend/dist/` |
| WASM Pages dock | present under `docs/pages/wasm/` |

## Frontend WASM Ingress

Current ingress path:

```text
apps/wasm-frontend/
  README.md
  assembly/foundation.ts
  tools/build_wasm.pl
  dist/
    index.html
    loader.mjs
    foundation.wasm
    manifest.json
```

Current publication path:

```text
docs/pages/wasm/
  index.html
  loader.mjs
  foundation.wasm
  manifest.json
```

Validation:

1. `npm run build --workspace @veneer/wasm-frontend`
2. `npm test --workspace @veneer/wasm-frontend`
3. `npm run pages:build`
4. `npm run pages:check`
5. `npm run connector:check`

The WASM manifest records the entry file, artifact byte sizes, SHA-256 hashes,
ADR-055/ADR-062 open-crux posture, and `21/21 pass` frontend vector status.

## Old Foundry Boundary

The old Foundry/F1 repository should be treated as an external legacy source
until specific artifacts are ported. Deleting the old repo is outside this
repository's working tree and must not be simulated here by removing references
without replacement manifests.

## JavaScript Refactor Status

Started:

- `tools/ascii-glitch/build-pages.mjs` was replaced by
  `tools/ascii-glitch/build_pages.pl`.
- Pages validation now runs through SWI-Prolog.
- `apps/wasm-frontend/tools/build_wasm.pl` drives the WASM build and manifest
  validation. Remaining `.mjs` files in the WASM app are host loaders/local
  harnesses, not the governance source of truth.

Remaining JavaScript tooling:

```text
tools/adr-production-tick.mjs
tools/foundry-connector/check_connector.mjs
tools/foundry-connector/check_xml_envelopes.mjs
tools/production-smoke.mjs
tools/q5-adr-parser/generate_manifest.mjs
```

These are next candidates for Prolog or domain-native refactors.
