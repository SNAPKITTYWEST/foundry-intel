# Primordial Foundation Interlock

This document is the operational transition map for Foundry Intel as it is
prepared for the public identity:

```text
THE SHARED PRIMORDIAL FOUNDATION
Foundry Intel, in care of Bel Esprit D'Accord
```

It is a repository governance document. It does not amend legal instruments or
rename the GitHub repository by itself.

## Canonical Name Map

| Surface | Current value | Transition target |
|---|---|---|
| GitHub repo | `SNAPKITTYWEST/foundry-intel-2026-07-11` | future repository rename, when explicitly requested |
| Local path | `C:\Users\jessi\veneer-deploy` | unchanged working path until user changes it |
| Governance name | Foundry Intel | THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel |
| Care-of steward | Bel Esprit D'Accord Irrevocable Trust | Bel Esprit D'Accord |
| Constitutional ADR | ADR-200 | unchanged |
| Trust interlock ADR | ADR-300 | unchanged |
| Rebrand ADR | ADR-302 | active transition layer |

## Trust Stack

```text
Ahmad Ali Parr
  |
  v
Bel Esprit D'Accord Irrevocable Trust
  |
  v
THE SHARED PRIMORDIAL FOUNDATION
  |
  +-- Foundry Intel governance and intelligence hub
  +-- Foundry F1 runtime and sorry-engine receiver
  +-- GKN Lean theorem anchors
```

## Repository Roles

| Repo | Role | Boundary |
|---|---|---|
| `SNAPKITTYWEST/foundry-intel-2026-07-11` | Governance, ADRs, Q(phi), XML handoff, Prolog/Datalog gates, WORM, BOB evidence | Current repo. Do the rebrand preparation here. |
| `SNAPKITTYWEST/foundry-f1` | Native runtime substrate, sorry-engine receiver, Claude handoff | Do not silently merge source into Foundry Intel. Route evidence back. |
| `SNAPKITTYWEST/gkn-i4-e7-lean` | Lean theorem anchors and quantum bridge latch | Lean authority remains upstream of TS/LH runtime hardening. |

## Porting Pattern

Foundry/F1 work is "ported into Foundry Intel" only through governed lanes:

```text
runtime source or proof target
  -> connector manifest reference
  -> XML handoff envelope
  -> ADR intake or ADR update
  -> Q(phi) posture classification when applicable
  -> WORM seal
  -> BOB EVIDENCE or SILENCE
```

This prevents a source-tree copy from becoming an unreviewed claim. Foundry F1
can execute runtime/sorry-engine work, but Foundry Intel decides whether the
result is evidence, silence, or an open crux.

## Agent Protocol

Incoming agents must start with:

1. `AGENT_MEMORY.md`
2. `README.md`
3. `docs/architecture/adr/ADR-302-primordial-foundation-rebrand.md`
4. `docs/bridge/foundry-connector.md`
5. `tools/foundry-connector/connector-manifest.json`

If a prompt says `GRAQT`, treat it as the ADR-300 GRAT trust interlock plus
this ADR-302 transition track unless a later ADR defines a distinct mechanism.

## Production Boundaries

- ADR-055 remains `OPEN_CRUX`.
- ADR-062 remains `SILENCE_PENDING`.
- Q(phi) weights remain metadata classifications only.
- Liquid Haskell does not supersede Lean theorem authority.
- WORM remains append-only evidence memory.
- Rebrand metadata does not rename the GitHub repo or change legal ownership
  without explicit signed external action.

## Verification

```sh
npm run adr:q5:fallback
npm run connector:check
npm run handoff:check
npm run verify
```
