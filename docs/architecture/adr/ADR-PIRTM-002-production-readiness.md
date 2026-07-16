# ADR-PIRTM-002: Production Readiness Checklist for pirtm-compiler

**Status:** Accepted — Phase 1 Complete  
**Date:** 2026-06-24  
**Author:** Governance — Phase Mirror / Foundry  
**Hardened:** 2026-07-16 — Law Engine v2.0 (ADR-200 Protocol)

---

## Context

`pirtm-compiler` has working lexer/parser/MLIR emission but lacks production-grade infrastructure. This ADR provides a concrete, executable checklist to achieve v1.0.0-ai release readiness. The central invariant from ADR-104 (Compiler Governance) applies: all IDE diagnostics, CI tests, and ledger proofs must share the same validation engine.

## Decision

Five-phase engineering plan with executable acceptance criteria and CI gates.

### Invariant 0 — FFI Witness Preservation (L0, Non-Negotiable)

The Lean 4 FFI boundary (`src/lean_ffi.rs` + `src/lean_wrapper.rs`) is the sole surface where untrusted external code can silently corrupt witness data.

**Four forbidden failure modes:**

| Failure Mode | Mechanism | Consequence |
|---|---|---|
| Silent witness drop | `zero_spacings` array truncated during C ABI marshalling | Emitted MLIR carries incomplete Lambda-Trace; Banach check passes with stale data |
| Floating-point corruption | `λ_p` or `L_p` bit-flipped across FFI boundary | `λ_p × L_p` may silently cross 1.0 without detection |
| Failed-proof propagation | Lean proof returns non-zero exit; wrapper returns stub `LambdaTrace` | Invalid proof accepted as authoritative |
| Composite cert bypass | Lean term with composite `mod=` value passes verification | Violates `!pirtm.cert` prime-only invariant |

**Golden Trace — canonical `prime_108_core` proof round-trip:**

```
proof_name:    prime_108_core
lambda_p:      0.999999
l_p:           0.95
zero_spacings: [0.9549652277648129, 1.5563111057990717, 1.2289235832739145]
signature:     "SIGNED_HASH"
signer_pubkey: "ed25519:twin-prime-042"
proof_hash:    "LEAN_PROOF_HASH_108_CORE"
Banach product: 0.999999 × 0.95 = 0.94999905 < 1.0  ✓
```

Any deviation from these values on a successful `prime_108_core` proof is an L0 violation.

### Phase 1 — Core Library Completion (Complete)

- `src/lib.rs`: `PhaseMirrorCompiler` struct with `compile()` and `to_mlir()` ✓
- `src/error.rs`: typed error hierarchy using `thiserror` ✓
- `antigrav-audit` stub crate ✓
- `pirtm-mlir` stub mode (works without MLIR libraries) ✓

### Phase 2 — Testing and Integration

**Acceptance criteria:** `cargo test -p pirtm-compiler` passes without `[ignore]`; all FFI entry points preserve witness data.

### Phase 3 — Build System and CI/CD

**Acceptance criteria:** CI passes on `x86_64-linux`, `aarch64-darwin`, `x86_64-windows`; `cargo clippy` produces zero warnings.

### Phase 4 — Documentation

**Acceptance criteria:** `cargo doc --no-deps` links all documentation; new contributor can build/test in under 15 minutes.

### Phase 5 — Security Hardening

**Acceptance criteria:** All vendored crates pinned; `cargo metadata --locked` produces deterministic graph; Flatpak bundle signature verified.

## Consequences

**Pros**

- Phased approach allows incremental certification — each phase gate is a WORM-sealed `ContractivityReceipt`.
- The `prime_108_core` golden trace provides a deterministic regression anchor for all FFI changes.

**Cons**

- The `#[ignore]` on the LLVM/WASM backend test means the translate path is not yet certified. This is an explicit open gap until Phase 2 closes it.

---

## Law Engine Verdict

```
Engine:       law-engine.pl v2.0 (ADR-200 Protocol)
Agent:        builder
Trust:        high ≥ medium                          PASS
Gate:         gate_advance(builder, true)            PASS
Lean:         lean_obligation_satisfied(proof_ref)   PASS
Injection:    injection_admissible(...)              PASS
ERE (5-pass): all_pass                               PASS

VERDICT:      EVIDENCE
SEAL:         adr-pirtm-002-production-readiness — law-engine v2.0
```

---

*Provenance: PhaseMirror/Foundry · crates/compiler/Governance/adr/proposed/ADR-PIRTM-002-production-readiness-checklist.md*
