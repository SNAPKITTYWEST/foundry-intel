# ADR-061: ZMOS (Zeta-Multiplicity Operator System) Production Implementation

**Status:** Adopted  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-061-ZMOS-Production-Implementation.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The ZMOS Lean 4 formalization provides operator algebra over prime-graded Hilbert spaces, spectral radius bounds, RG renormalization conditions, and a C-ABI FFI bridge to the Rust Sedona Spine Engine. Without a ratified production ADR, the ZMOS Lean proofs can drift from the Rust implementation silently — the FFI boundary is the point of maximum risk.

**Four failure modes that governance must prevent:**

| Failure | Mechanism |
|---|---|
| Lean/Rust drift | FFI boundary reimplemented without Lean verification |
| Unratified spectral bounds | `spectralBoundCondition` not enforced in CI |
| Missing audit trail | Sedona Spine Mandate requires proof → runtime enforcement chain |
| Composite operator bypass | Non-prime operators pass spectral verification |

## Decision

Ratify ZMOS as a production-grade, formally verified kernel component.

**1. Lean 4 as Source of Truth**

`Prime/lean/ZMOS/Zmos.lean` is the sole authoritative specification. All Rust implementations of ZMOS primitives must be extracted from or proven equivalent to Lean definitions. No ZMOS logic reimplemented in Rust without a corresponding Lean theorem.

**2. Rust Engine Parity via FFI**

The `zmos` crate must:
- Implement `spectralRadius` using exact `rug`/GMP arithmetic
- Enforce `spectralBoundCondition` at runtime: violation triggers `PhaseError` and halts computation
- Expose `#[no_mangle] pub extern "C" fn zmos_verify_spectral_bound(op: *const Operator) -> bool`

**3. CI Enforcement**

`lake build` on `Prime/lean/ZMOS/` runs on every commit touching `Zmos.lean` or `crates/zmos/`. Kani proof harness `crates/zmos/tests/kani/spectral_bound.rs` must prove `spectralBoundCondition` holds for all public API operators.

**ZetaCell alignment:** The ZMOS spectral bounds feed directly into the ZetaCell Bridge in `docs/math/constitutional-core.md` §5. The 100-term zeta zero expansion `Z_{p_i}` uses the ZMOS operator framework as its algebraic substrate.

## Consequences

**Pros:** Single source of truth across Lean, Rust, WASM, and FFI. No silent drift.

**Cons:** `lake build` in CI increases build time. The `zmos_verify_spectral_bound` FFI entry point is a new attack surface — all inputs must be validated before crossing the boundary.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-061-zmos-production — law-engine v2.0
```
