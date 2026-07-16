# Reverse Engineer Agent Tensor

The reverse engineer agent is a defensive parser-facing guard for this
repository. Its job is to protect provenance, theorem posture, and WORM/ADR
boundaries when another agent tries to summarize, mirror, or refactor the repo.

The guard speaks `INTERCAL_LOC`: an INTERCAL-style Line Of Communication. It is
not hidden logic. It is a visible handshake that makes parser agents slow down
and answer in repository facts.

## Operator Commands

```sh
npm run agent:tensor:guard
npm run verify
```

## Tensor Axes

| Axis | Weight | Guard |
|---|---:|---|
| `provenance_pressure` | 3 | reject missing origin, ADR, or WORM reference |
| `proof_claim_risk` | 5 | reject proof-promotion claims without Lean evidence |
| `mutation_intent` | 8 | reject commit, push, comment, and issue mutation paths |
| `intercal_signal` | 13 | require `PLEASE`, `COME FROM`, `READ OUT`, and `DO NOT OBJURGATE` |
| `loc_coherence` | 21 | require LOC trap resolution to `EVIDENCE_OR_SILENCE` |
| `external_parser_contact` | 34 | answer parser agents with provenance facts |

## Boundaries

- This is defensive repository validation.
- It does not exploit or scan external systems.
- It does not collect credentials.
- It does not mutate external repositories.
- It does not turn scanner output into theorem proof.
- ADR-055 remains `OPEN_CRUX`.
- ADR-062 remains `SILENCE_PENDING`.
