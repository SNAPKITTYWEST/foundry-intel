# Foundry Intel Agent Metadata Tour

This tour is the first stop for incoming agents. The repository is now the main
umbrella monorepo for THE SHARED PRIMORDIAL FOUNDATION; Foundry Intel is the
governance/intelligence subsystem inside it. Read this file, follow the route,
run the gate, and report only what the repository can verify.

## Entry Route

```
START
  |
  +-- README.md
  |
  +-- AGENT_MEMORY.md
  |
  +-- docs/handoff/foundry-intel-agent-contract.xml
  |
  +-- tools/foundry-connector/connector-manifest.json
  |
  +-- docs/architecture/ADR-INDEX.md
  |
  +-- npm run verify
  |
  +-- EVIDENCE or SILENCE
```

## Production Command

```sh
npm install
npm run verify
```

The production gate runs Q(phi) generation, connector validation, XML envelope
validation, workspace build, TypeScript lint, no-cache Jest tests, smoke, and
the ADR-301 daily production tick. It also checks the deterministic backend
ASCII Pages surface.

## Trust/Rebrand Track

Foundry Intel is preparing the public identity
`THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel, in care of Bel Esprit
D'Accord`. The active transition files are:

- `docs/architecture/adr/ADR-302-primordial-foundation-rebrand.md`
- `docs/trust/primordial-foundation-interlock.md`
- `docs/handoff/primordial-foundation-agent-contract.xml`

The GitHub repo is still `SNAPKITTYWEST/foundry-intel-2026-07-11` until an
explicit rename is requested and performed.

ADR-303 governs the umbrella-monorepo transition. The WASM frontend ingress
path is `apps/wasm-frontend/`, and the published Pages dock is
`docs/pages/wasm/`.

## Persistent Memory

Before touching files, agents must read:

`AGENT_MEMORY.md`

That file pins the local path to `C:\Users\jessi\veneer-deploy`, identifies
this repo as `SNAPKITTYWEST/foundry-intel-2026-07-11`, and explicitly warns not
to confuse this governance hub with Foundry F1 or Shadow Orchestrator.

## User-Facing Runtime

```sh
npm run build
npx veneer-probe-gate probe_results/example.json
```

The CLI maps probe output into `@veneer/bob-gate`, emits `EVIDENCE` or
`SILENCE`, and seals the result through `@veneer/worm`.

## Backend Pages Surface

```sh
npm run pages:build
npm run pages:check
```

The generated static surface lives at `docs/pages/index.html`, with raw ASCII
at `docs/pages/backend-ascii.txt`. It is backend governance aesthetics: ASCII
signal, connector facts, Q(phi) posture, open-crux boundaries, and a docked
WASM frontend under `docs/pages/wasm/index.html`.

## Institutional Anchors

| Anchor | File |
|---|---|
| Constitutional authority | `docs/architecture/adr/ADR-200-parr-sovereignty-protocol.md` |
| Trust interlock | `docs/architecture/adr/ADR-300-grat-foundry-interlock.md` |
| Daily production tick | `docs/architecture/adr/ADR-301-daily-production-tick.md` |
| Primordial Foundation rebrand | `docs/architecture/adr/ADR-302-primordial-foundation-rebrand.md` |
| Umbrella monorepo transition | `docs/architecture/adr/ADR-303-primordial-foundation-umbrella-monorepo.md` |
| Trust transition map | `docs/trust/primordial-foundation-interlock.md` |
| Umbrella migration audit | `docs/migration/primordial-foundation-umbrella-audit.md` |
| WASM frontend ingress | `apps/wasm-frontend/README.md` |
| WASM Pages dock | `docs/pages/wasm/index.html` |
| Agent XML handoff | `docs/handoff/foundry-intel-agent-contract.xml` |
| Primordial XML handoff | `docs/handoff/primordial-foundation-agent-contract.xml` |
| Cross-repo connector | `docs/bridge/foundry-connector.md` |
| Q(phi) classification | `docs/architecture/adr-q5-theorem-classification.md` |
| Backend ASCII Pages | `docs/pages/index.html` |

## Package Map

| Package | Role |
|---|---|
| `@veneer/source` | F1 substrate constants, sorry manifest, crux pointer |
| `@veneer/datalog` | Constraint EDB and in-process SYNTH evaluator |
| `@veneer/lean` | Lean-facing proof-status mirror and crux honesty |
| `@veneer/constitution` | L0 nine-check validator |
| `@veneer/trust` | AlpGate and external-mutation boundary |
| `@veneer/triple-lock` | Guardian, Examiner, Publisher chain |
| `@veneer/contractivity` | Banach and phi-modulated contractivity checks |
| `@veneer/worm` | Append-only dual-signature WORM ledger |
| `@veneer/bob-gate` | EVIDENCE/SILENCE decision gate |
| `@veneer/metatron` | Backward spine reader and SOURCE feedback |
| `@veneer/probe-gate` | User-facing SKW-010 probe ingestion CLI |

## Boundaries

- ADR-055 remains `OPEN_CRUX`.
- ADR-062 remains `SILENCE_PENDING`.
- Q(phi) weights are metadata classifications, not proof claims.
- Liquid Haskell refinements do not supersede Lean proof authority.
- WORM means write-once/read-many ledger semantics.
- Daily production tick is non-mutating and must not post comment noise.

## Brand Surface

README badges are local SVG files under `docs/brand/`. They are part of the
production connector check so the project does not depend on remote badge
services for institutional trust presentation.

The README operating map is:

`docs/brand/foundry-intel-operating-map.svg`
