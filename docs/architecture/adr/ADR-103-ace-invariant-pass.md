# ADR-103: ACE Invariant Pass — Spectral Stability

**Status:** Accepted  
**Date:** 2026-06-24  
**Author:** Governance — Phase Mirror / Foundry  
**Hardened:** 2026-07-16 — Law Engine v2.0 (ADR-200 Protocol)

---

## Context

Modules must be stable and contractive before linking to ensure system-wide integrity. Without a link-time veto, a non-contractive module can be incorporated into an otherwise certified build, silently violating the Banach fixed-point guarantee that underpins the Sedona Spine contractivity invariant (SYNTH-004).

## Decision

Implement the ACE Invariant Pass to verify:

```
Σ F_i + ε < 1     (spectral radius constraint)
r(Λ) < 1 − ε      (contractivity margin)
```

Implementation rules:

- Use `SCALE_BASE = 1,000,000` for all fixed-point arithmetic (Sedona Spine "No Floats").
- Extract governance attributes directly from `pirtm.module` (MLIR dialect attribute dict).
- Materialize Lean 4 formal proofs upon successful check — the `ContractivityReceipt` is the canonical artifact.
- The CI gate runs the ACE pass as a non-bypassable step; any `diagnostics.len() > 0` fails the build.

## Consequences

**Pros**

- Provides bit-identical stability checks across all platforms (fixed-point, no FP).
- Ensures link-time veto for non-contractive modules — the invariant cannot be bypassed by deferred loading.
- Lean 4 proof materialization creates a cryptographically linkable audit record.

**Cons**

- Increases link-time complexity by O(|module_graph|) per link step.
- Requires Lean 4 toolchain in CI/CD.

**Sedona Spine Alignment**

Satisfies the governance requirement for formal stability certification (SYNTH-004: Contractivity Geometric Invariant) and the un-bypassable CI/CD gate mandate. The `ContractivityReceipt` is the canonical proof of module admission.

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
SEAL:         adr-103-ace-invariant-pass — law-engine v2.0
```

---

*Provenance: PhaseMirror/Foundry · crates/apex/apex-goldilocks/docs/architecture/adr/003-ace-invariant-pass.md*
