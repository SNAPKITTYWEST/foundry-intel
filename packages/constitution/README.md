# @veneer/constitution

## `@veneer/constitution` — L3 Sedona Spine

The L0 constitutional layer. Implements the nine sequential validation checks (L0-1 through L0-9) as a TypeScript constitutional validator, mirroring the Rust `ConstitutionModel::validate()` sequence in `crates/governance/src/constitution/mod.rs`.

**Constraints enforced:** SYNTH-003 (all nine checks in canonical order, collect-all) and SYNTH-007 (circuit_breaker=3, retry_nonce <= 3, dual-enforced at L0-7).

**Constants** anchored to `ExportThresholds.lean` via `foundry-source.json`:
`lambda_m=0.1`, `circuit_breaker=3`, `contractivity_upper=1.0`, `max_retry_nonce=3`.

Every `validate()` call is WORM-seal-aware: input carries a `WormSealRef` (prev chain head + context seal) and the returned `ValidationResult` includes a fresh SHA-256 WORM seal over `(valid || checks || ts || prev_seal)`.

```ts
import { ConstitutionModel } from '@veneer/constitution'
const model = new ConstitutionModel(input)
const result = model.validate() // { valid, failed_checks, worm_seal, ts }
```

Spine depth: 3. No `@veneer` dependencies — this is a foundation layer.
