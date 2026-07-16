# ADR-303: Primordial Foundation Umbrella Monorepo

**Status:** Accepted
**Date:** 2026-07-16
**Author:** Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust
**Trust anchor:** THE SHARED PRIMORDIAL FOUNDATION
**Governed by:** ADR-200, ADR-300, ADR-302
**Law-engine verdict:** EVIDENCE

---

## Context

`SNAPKITTYWEST/foundry-intel-2026-07-11` is no longer only an Intel bridge
repo. It is the main umbrella repository for THE SHARED PRIMORDIAL FOUNDATION
while the older Foundry surfaces are retired, deleted, or kept only as external
historical receivers.

The repository still contains Foundry Intel subsystems: ADR governance, Q(phi),
XML handoffs, WORM, BOB, Prolog law, Datalog facts, TypeScript packages,
Liquid Haskell lane, Pages, and connector metadata. Those subsystems are now
organized under the Primordial Foundation umbrella identity.

---

## Decision

1. This repository is the canonical umbrella monorepo for
   `THE SHARED PRIMORDIAL FOUNDATION`.
2. `Foundry Intel` remains a subsystem name for the governance/intelligence
   layer, not the whole institutional identity.
3. The old Foundry/F1 repo is treated as an external legacy runtime receiver
   until artifacts are explicitly ported into this repository by ADR, XML,
   manifest, WORM, and BOB lanes.
4. WASM frontend builds enter through `apps/wasm-frontend/` and must be
   manifest-backed before they are published by Pages or promoted as canonical.
5. New backend automation should prefer SWI-Prolog or domain-native languages.
   Existing JavaScript/TypeScript remains only where it is still required by
   the package runtime or until a verified refactor replaces it.

---

## Umbrella Layout

```text
THE SHARED PRIMORDIAL FOUNDATION
  |
  +-- apps/
  |    +-- wasm-frontend/          frontend build ingress and manifest lane
  |
  +-- docs/
  |    +-- architecture/adr/       constitutional and migration ADRs
  |    +-- governance/             SWI-Prolog law engine
  |    +-- pages/                  static backend ASCII/glitch Pages
  |    +-- trust/                  trust/rebrand transition map
  |
  +-- packages/                    current runtime/governance packages
  +-- tools/                       migration target: Prolog first, JS reduced
```

---

## Migration Rules

- Do not delete external repos from this repository.
- Do not silently copy old Foundry artifacts into the umbrella.
- Every ported artifact needs an owning manifest entry and a validation command.
- Frontend WASM artifacts must include a manifest, entry HTML, and `.wasm`
  checksum before the build is treated as production.
- Open cruxes stay open: ADR-055 remains `OPEN_CRUX`, ADR-062 remains
  `SILENCE_PENDING`.

---

## Validation

```sh
npm run adr:q5:fallback
npm run connector:check
npm run handoff:check
npm run pages:check
npm run verify
```

If SWI-Prolog is installed:

```sh
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-303', V, S), format('~w | ~w~n', [V, S])" -t halt
```
