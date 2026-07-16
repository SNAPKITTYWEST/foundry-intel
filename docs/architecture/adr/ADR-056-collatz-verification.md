# ADR-056: Collatz Conjecture Computational Verification

**Status:** Accepted  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-056-collatz-conjecture-implementation.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The Collatz (3n+1) conjecture requires massive-scale computational verification. The system must verify starting values to the largest possible bounds. The conjecture remains unproven; computational verification is infrastructure, not proof.

## Decision

Highly parallelised Rust engine using SIMD and GPU acceleration.

- **Parallelisation:** `rayon` for CPU multithreading, chunked search space
- **GPU:** OpenCL/CUDA compute kernels for bulk trajectory calculations
- **Data types:** `u128` (≈ 3.4 × 10³⁸ bound before arbitrary precision)
- **Optimisation:** Lookup table (memoisation) + bitwise ops for the 3n+1 and n/2 steps

**Epistemic position:** Like ADR-055, computational verification is not proof. The Collatz conjecture has no analogue of `hodgeIndexHolds` in the Lean 4 layer — it is not encoded as `Option Bool := none` in this system. It is tracked as a separate open problem in `docs/math/constitutional-core.md`.

## Consequences

**Positive:** Massive speedup over naive implementations. CPU and GPU used efficiently. Aligns with Sedona Spine Mandate — core verification in Rust engine only.

**Negative:** GPU compute via Rust adds build complexity and hardware dependencies. Beyond `u128` bounds, arbitrary precision drops performance sharply.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-056-collatz — law-engine v2.0
```
