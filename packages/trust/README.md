# @veneer/trust

### L4 — `@veneer/trust`

**Spine depth 4 — Trust Boundary Layer**

`@veneer/trust` implements the do-calculus boundary of the Sedona Spine: internal agents may intervene (execute), external agents may only observe. This enforces SYNTH-001 (No Unaligned Execution — every action passes `AlpGate` before `Execute`) and SYNTH-005 (External Actors Cannot Mutate — no intervention from outside the trust perimeter).

Every verdict is WORM-sealed (SHA-256), advancing a tamper-evident chain compatible with the Archivum G-Set CRDT (SYNTH-009). All numeric constants are anchored to `ExportThresholds.lean` via `foundry-source.json` (SYNTH-010): `TAU_R = 47.06998778`, `L_EFF_MAX = 0.15`, `CIRCUIT_BREAKER_THRESHOLD = 3`.

**Exports:** `TrustLevel` enum · `alpGate` function · `TrustBoundaryEnforcer` class · `WormSeal` interface · foundry constants.

**Hard invariant:** Any action with `trust_level = External` and `mutating = true` always yields `allowed = false` with a sealed violation record. No code path in this package bypasses that gate.
