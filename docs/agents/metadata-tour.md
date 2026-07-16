# Foundry Intel Agent Metadata Tour

This tour is the first stop for incoming agents. It is intentionally practical:
read it, follow the route, run the gate, and report only what the repository
can verify.

## Entry Route

```
START
  |
  +-- README.md
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
the ADR-301 daily production tick.

## User-Facing Runtime

```sh
npm run build
npx veneer-probe-gate probe_results/example.json
```

The CLI maps probe output into `@veneer/bob-gate`, emits `EVIDENCE` or
`SILENCE`, and seals the result through `@veneer/worm`.

## Institutional Anchors

| Anchor | File |
|---|---|
| Constitutional authority | `docs/architecture/adr/ADR-200-parr-sovereignty-protocol.md` |
| Trust interlock | `docs/architecture/adr/ADR-300-grat-foundry-interlock.md` |
| Daily production tick | `docs/architecture/adr/ADR-301-daily-production-tick.md` |
| Agent XML handoff | `docs/handoff/foundry-intel-agent-contract.xml` |
| Cross-repo connector | `docs/bridge/foundry-connector.md` |
| Q(phi) classification | `docs/architecture/adr-q5-theorem-classification.md` |

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
