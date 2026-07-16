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

## Frontend WASM Ingress

No `.wasm` artifact is currently tracked in this repository. A recent local
search of the repo found no WASM build artifact to import.

Expected ingress path:

```text
apps/wasm-frontend/
  README.md
  dist/
    index.html
    *.wasm
    manifest.json
```

Before publishing the frontend:

1. Put the built files under `apps/wasm-frontend/dist/`.
2. Add a manifest with entry file, WASM file names, sizes, and hashes.
3. Wire the Pages workflow to copy or compose the frontend with
   `docs/pages/`.
4. Add a validation command for manifest/hash checking.
5. Update `tools/foundry-connector/connector-manifest.json`.

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

Remaining JavaScript tooling:

```text
tools/adr-production-tick.mjs
tools/foundry-connector/check_connector.mjs
tools/foundry-connector/check_xml_envelopes.mjs
tools/production-smoke.mjs
tools/q5-adr-parser/generate_manifest.mjs
```

These are next candidates for Prolog or domain-native refactors.
