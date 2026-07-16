# ADR-102: Sig Type Engine and Multiplicity Conservation

**Status:** Accepted  
**Date:** 2026-06-24  
**Author:** Governance — Phase Mirror / Foundry  
**Hardened:** 2026-07-16 — Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The PIRTM compiler must verify stability invariants at the type level. Floating-point tensor arithmetic is inadmissible under the Sedona Spine "No Floats" mandate because floating-point drift can cause the multiplicity conservation predicate to pass with a stale or incorrect value, silently violating the governance invariant.

## Decision

Implement a `Sig` struct using `HashMap<u64, i32>` to encode tensor signatures as prime-factorizations. The `multiplicity_functor` M calculates the exact rational multiplicity. All tensor operations (contraction, product) are validated against Multiplicity Conservation:

```
M(S_new) = M(Ap) · M(S_old)
```

All arithmetic is exact integer/rational arithmetic. No floating-point permitted in the type-checking path.

## Consequences

**Pros**

- Ensures exact mathematical correctness via rational arithmetic; eliminates floating-point drift (Sedona Spine "No Floats" mandate).
- Multiplicity violations produce deterministic diagnostic codes: `MULTIPLICITY_VIOLATION`.
- Prime-factorization representation makes conservation proofs tractable in Lean 4.

**Cons**

- Requires explicit handling of tensor indices and rational normalization.
- `HashMap<u64, i32>` allocation per signature adds memory pressure for large tensor graphs.

**Sedona Spine Alignment**

Satisfies the governance requirement that all ESI-related decisions are routed through the kernel computation path with no floating-point intermediate states. The `Sig` type is the canonical witness for multiplicity conservation at every stratum boundary.

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
SEAL:         adr-102-sig-type-engine — law-engine v2.0
```

---

*Provenance: PhaseMirror/Foundry · crates/apex/apex-goldilocks/docs/architecture/adr/002-sig-type-engine.md*
