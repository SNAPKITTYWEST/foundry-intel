# @veneer/triple-lock

## `@veneer/triple-lock` — L5 Sedona Spine

**Guardian → Examiner → Publisher. No lock may be skipped.**

This package implements SYNTH-006 (Triple-Lock Sequential Chain of Custody) and SYNTH-010 (Lean-Rust Boundary Cryptographically Bound). Every ratified manifest carries `proof_hash = LEAN_PROOF_HASH_108_CORE`, anchoring the TypeScript layer to the Lean 4 / Rust boundary defined in `ExportThresholds.lean` and `publisher.rs`.

- `guard()` — Lock 1: validates `GUARDIAN-WITNESS` prefix, proof hash, retry nonce, and PROVISIONAL rejection; returns a WORM-sealed `GuardResult`.
- `examine()` — Lock 2: validates `EXAMINER-WITNESS` prefix against a prior `GuardResult`; returns a WORM-sealed `ExamineResult`.
- `publish()` — Lock 3: ratifies the witness bundle into an immutable `VerifiedManifest`; rejects PROVISIONAL status and excess retry nonces.
- `runChain()` — convenience combinator: runs all three locks fail-fast and returns the final `PublishResult`.

WORM-native: every result carries `WormSealData` (SHA-256 seal, prev_seal, timestamp) compatible with the G-Set CRDT ledger at L4 (SYNTH-009). Depends only on layers L0–L4.
