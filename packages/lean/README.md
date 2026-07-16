# @veneer/lean

## `@veneer/lean` — L2: Formal Proof Layer

`@veneer/lean` is the formal-proof spine of Veneer. It mirrors foundry-intel's
`PearlInvariants.lean` as TypeScript proposition stubs: every governing constraint
is a typed proposition; every policy is a theorem stub awaiting a full proof.

**Nine invariants** are encoded (SYNTH-001, 003, 004, 005, 007, 008, 009, 010 plus the
F1-square status roll-up). Each returns a `ProofStatus` — either `proved` (backed by a
WORM seal), `open` (honest: `universallyValid = none`), or `stub` (TODO marker for the
full Lean proof).

The Riemann Hypothesis crux (`hodgeIndexHolds`, `liPositivityHolds`) is permanently
encoded as `{ kind: 'open' }`. SYNTH-008 makes this openness itself a provable proposition
(`rfl` on the none fields). No field ever asserts an unproven claim as true.

Threshold constants are anchored to `ExportThresholds.lean` in foundry-intel:
`tau_r = 47.06998778`, `l_eff_max = 0.15`, `contractivity_margin = 0.01`.
The 108-cycle (2^2 x 3^3) is the canonical contractive word for SYNTH-004.
