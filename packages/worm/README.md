# @veneer/worm

## L7 — `@veneer/worm` — WORM Ledger

The tamper-evident backbone of the Sedona Spine.

Every Pearl layer transition is appended as an immutable `WormEntry` to a
G-Set CRDT: entries can only be added, never removed or reordered.
Two signatures are required before admission — `primary = SHA256(core ‖ operator_key)`
and `secondary = SHA256(core ‖ kernel_key)` — so no single party can forge an
entry (SYNTH-009).

Chain integrity is verified by re-checking each entry's `prev_seal` against the
prior entry's `worm_seal`.  Merge is union; the genesis seal is 64 zero hex digits.

The package also embeds `SORRY_MANIFEST`, the canonical 13-entry list of
formally open Lean gaps (SYNTH-002).  CI fails if this count changes without
a reviewed amendment.

Constants (`tau_r = 47.06998778`, `L_EFF_MAX = 0.15`) are anchored to
`ExportThresholds.lean` via `@veneer/core`.
