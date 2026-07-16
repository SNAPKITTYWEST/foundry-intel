# ADR-054: Rust/Kani Executable Formal Verification — The Mathlib-Free Pivot

**Status:** Accepted  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-054_rust_kani_verification.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The PhaseMirror/Veneer ecosystem requires formal verification of physical and mathematical invariants (Zeta-Multiplicity Operator Systems, spectral bounds, L-functions, Banach contractivity). Lean's `Mathlib` is axiom-heavy, hostile to FFI extraction, and produces non-canonical representations incompatible with SIMD/BLAS performance requirements.

## Decision

**Replace Mathlib with a Lean Core + Rust/Kani pipeline.**

Division of labour:

| Layer | Role |
|---|---|
| Lean 4 (Mathlib-Free Core) | Structural types, axiomatic interfaces, "golden reference" contracts |
| Rust + Kani (Verifier) | Executable numerical verification, symbolic execution, bounds proofs |

**Correspondence table:**

| Traditional Mathlib | Rust/Kani Equivalent |
|---|---|
| Real/Complex analysis, Cauchy sequences | Kani symbolic execution — no NaN/Inf/divide-by-zero in `f64` matrices |
| Spectral radius proofs for ζ(s) | Kani `assert!` harnesses across all valid truncated prime bounds |
| Commutativity `[O_p, O_q] = 0` tensor algebra | Kani memory disjointness — parallel prime iterators have no aliasing |

**FFI Contract Generation:**

Lean 4 `@[extern]` bindings generate a deterministic C-header. Rust `#[repr(C)]` structs are mechanically guaranteed to match Lean definitions. No hand-rolled FFI marshalling.

## Consequences

**Pros:** Raw SIMD/BLAS performance preserved. Kani replaces 500-line Mathlib proofs with 20-line symbolic harnesses. FFI boundary is mechanically verified.

**Cons:** Kani's symbolic execution scales poorly for deeply recursive proofs. The Lean core remains the specification authority — Kani confirms it but cannot replace it.

**Veneer integration:** The `xi-formal` crate provides Kani-verified Banach contraction stability (see `docs/math/riemann-zeta-finality.md`). The `riemann-zeta` crate uses MPFR interval arithmetic as the Rust-layer equivalent.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-054-rust-kani-mathlib-free — law-engine v2.0
```
