# ADR-302: Primordial Foundation Rebrand - Foundry Intel in care of Bel Esprit D'Accord

**Status:** Accepted
**Date:** 2026-07-16
**Author:** Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust
**Trust anchor:** THE SHARED PRIMORDIAL FOUNDATION
**Governed by:** ADR-200, ADR-300, ADR-301
**Law-engine verdict:** EVIDENCE

---

## Context

Foundry Intel currently lives at `SNAPKITTYWEST/foundry-intel-2026-07-11`
and at local path `C:\Users\jessi\veneer-deploy`. It is the governance and
intelligence hub for ADRs, Q(phi) theorem posture, XML agent prompts, the
Prolog/Datalog law layer, WORM evidence memory, and connector routing.

ADR-300 already establishes the GRAT Foundry interlock for THE SHARED
PRIMORDIAL FOUNDATION. This ADR adds the operational transition layer:
Foundry Intel must be prepared for a public rebrand toward
`THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel, in care of Bel Esprit
D'Accord`, while keeping repo boundaries and proof status honest.

Incoming prompts may use variants such as `GRAQT`, `GRAT`, `Foundry`,
`Foundry Intel`, or `Primordial Foundation`. Until a later ADR defines a
separate GRAQT construct, this repo normalizes that vocabulary to the
ADR-300 GRAT trust interlock and the ADR-302 rebrand track.

---

## Decision

1. The technical repository name remains `foundry-intel-2026-07-11` until a
   GitHub repository rename is explicitly executed.
2. The target public identity is
   `THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel, in care of Bel Esprit
   D'Accord`.
3. Foundry Intel remains the governance/intelligence hub during and after the
   transition.
4. Foundry F1 remains the native runtime and sorry-engine receiver. It is
   connected into Foundry Intel by connector manifests, ADR intake, XML
   handoffs, and WORM/BOB evidence return lanes; it is not silently merged
   into this repository.
5. GKN Lean remains the theorem-anchor source. Liquid Haskell and TypeScript
   refinements may harden runtime lanes, but they do not supersede Lean
   proof authority.
6. Q(phi) weights remain metadata classifications only.
7. ADR-055 remains `OPEN_CRUX`; ADR-062 remains `SILENCE_PENDING`.
8. Rebrand language in this repository is documentation and metadata unless
   backed by separately signed legal instruments.

---

## Trust Routing

```text
Bel Esprit D'Accord Irrevocable Trust
        |
        v
THE SHARED PRIMORDIAL FOUNDATION
        |
        +--> Foundry Intel governance hub
        |       ADR, Q(phi), XML, Prolog, Datalog, WORM, BOB
        |
        +--> Foundry F1 runtime receiver
        |       C/C++/NASM substrate, sorry-engine, Claude handoff
        |
        +--> GKN Lean theorem anchors
                I4/E7, quantum bridge, theorem latch
```

The connector route stays bidirectional:

```text
GKN Lean latch
  -> Foundry Intel connector and Q(phi)
  -> Foundry F1 runtime/sorry-engine receiver
  -> Foundry Intel ADR governance for evidence promotion
```

---

## Implementation Requirements

- Add a trust transition document under `docs/trust/`.
- Register ADR-302 in `docs/architecture/ADR-INDEX.md`.
- Register ADR-302 in `docs/governance/law-engine.pl`.
- Link ADR-302 in `docs/governance/adr-loop.pl` and the prior-art registry.
- Add ADR-302 and the trust transition document to the connector manifest.
- Update `AGENT_MEMORY.md`, README, and metadata-tour files so incoming agents
  start from the correct repo and the correct rebrand target.
- Extend `npm run connector:check` so the transition cannot disappear in a
  future thin README edit.

---

## Non-Goals

- This ADR does not rename the GitHub repository.
- This ADR does not amend trust instruments, transfer ownership, or provide
  legal advice.
- This ADR does not promote open mathematical claims.
- This ADR does not vendor the Foundry F1 source tree into Foundry Intel.

---

## Consequences

The repo has a clear transition spine. Agents can reference the Primordial
Foundation rebrand without confusing Foundry Intel with Foundry F1, and without
turning runtime evidence into a final theorem claim. The connector check now
guards the trust/rebrand route as a production artifact.

---

## Validation

Minimum validation for changes under this ADR:

```sh
npm run adr:q5:fallback
npm run connector:check
npm run handoff:check
```

Full release confidence:

```sh
npm run verify
```

If SWI-Prolog is installed:

```sh
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-302', V, S), format('~w | ~w~n', [V, S])" -t halt
```
