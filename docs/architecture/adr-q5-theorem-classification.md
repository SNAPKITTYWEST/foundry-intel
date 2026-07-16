# Q(phi) ADR Theorem Classification

This file records the Q(phi) metadata classification for ADR-052 through ADR-062.
It is generated from `tools/q5-adr-parser/ADR_REGISTRY.txt` by the Q(phi) ADR
parser and cross-references the live ADR documents under `docs/architecture/adr/`.

The weights are governance metadata. They are not independent mathematical
proofs, and they do not change ADR-200's honesty rule: open cruxes remain open
until a zero-sorry Lean proof and supporting mathematical argument exist.

| ADR | Parser Status | Q(phi) Weight | Theorem / Crux Posture |
|---|---:|---:|---|
| ADR-052 | `SPECIFIED` | `1 + 0*phi` | UAC quantum monad and thermodynamic-window obligations are specified architecture. |
| ADR-053 | `SPECIFIED` | `1 + 0*phi` | Lake monorepo theorem workspace is specified architecture. |
| ADR-054 | `SPECIFIED` | `1 + 0*phi` | Rust/Kani mathlib-free executable harnesses are specified verifier obligations. |
| ADR-055 | `OPEN_CRUX` | `-1 + 1*phi` | RH infrastructure exists; `hodgeIndexHolds = none` remains the formal crux state. |
| ADR-056 | `SPECIFIED` | `1 + 0*phi` | Collatz SIMD/GPU verification is bounded computational infrastructure, not proof. |
| ADR-057 | `SPECIFIED` | `1 + 0*phi` | Lean ADR theorem obligations are named: accepted constraints, no circular supersession, entailment. |
| ADR-058 | `SPECIFIED` | `1 + 0*phi` | Sig multiplicity conservation is a specified Kani/Compiler obligation. |
| ADR-059 | `SPECIFIED` | `1 + 0*phi` | ACE runtime budget veto and fail-closed semantics are specified obligations. |
| ADR-060 | `PROVEN_NO_SORRY` | `1 + 1*phi` | DRMM is classified by its no-sorry mandate and Prime Successor Predicate posture. |
| ADR-061 | `SPECIFIED` | `1 + 0*phi` | ZMOS spectral bounds and Lean/Rust FFI parity are specified obligations. |
| ADR-062 | `SILENCE_PENDING` | `0 + 1*phi` | Sigma Kernel governance gap remains pending until the required Lean theorems are complete. |

Manifest outputs:

- `tools/q5-adr-parser/adr_manifest.json`
- `tools/q5-adr-parser/adr_manifest_index.csv`

Current roll-up:

- `count = 11`
- `q5_total = 8 + 3*phi`
