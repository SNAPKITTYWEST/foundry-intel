# ADR-062: Sigma Kernel Production Implementation

**Status:** Adopted  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-062-SigmaKernel-Production-Implementation.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The Sigma Kernel is the dissonance detection and spectral safety layer. It enforces:

- `L_eff < 1.0` — effective Lipschitz bound
- `ΔR_sc ≤ τ_R` — resonance functional drift bound (τ_R = 47.06998778, from SYNTH-004)
- Spectral dissonance detection across prime-indexed multiplicity layers

The current Lean stub `Prime/lean/SIGMA_KERNEL/SigmaKernel.lean` is empty (`-- TODO: Expand .tex proofs`). Without formal Sigma Kernel proofs, the Triple-Lock (Guardian/Examiner/Publisher, ADR-006 / SYNTH-006) cannot mechanically verify spectral safety — it relies on runtime assertions in Rust and manual review. This is a governance gap.

## Decision

Implement the Sigma Kernel as a formally verified, production-grade dissonance detection layer.

**Lean 4 Core Types:**

```lean
structure SpectralState where
  resonance_functional : Float  -- R_sc
  drift : Float                 -- δ

def DissonancePredicate (s : SpectralState) : Prop :=
  s.drift > TAU_R  -- TAU_R = 47.06998778

def SigmaKernelInvariant (s : SpectralState) : Prop :=
  s.resonance_functional < 1.0 ∧ s.drift ≤ TAU_R
```

**Theorems required:**

```lean
-- If SigmaKernelInvariant holds before a transition, it holds after
theorem sigma_kernel_preserves_contraction : ...

-- Any transition violating ΔR_sc ≤ τ_R is flagged by DissonancePredicate
theorem dissonance_detects_drift : ...

-- Under repeated PIRTM recursion, R_sc remains bounded
theorem no_spectral_explosion : ...
```

**Rust enforcement:** The `crates/echo-kernel/src/contractivity.rs` module provides the runtime Rust implementation. It must expose `sigma_kernel_check(state: SpectralState) -> SigmaVerdict` with `SigmaVerdict::Pass` or `SigmaVerdict::Dissonance(reason)`.

**Integration with Triple-Lock:** The Examiner (depth 5 in Veneer) must call `sigma_kernel_check` before issuing the Examiner witness. An Examiner witness issued without a passing Sigma Kernel check is a constitutional violation under ADR-200 Rule 4 (WORM as Record of Authority — no witness without verification).

## Consequences

**Pros:** Triple-Lock gains machine-checked spectral safety. `τ_R = 47.06998778` is enforced at three layers: Lean axiom, Rust runtime, Datalog EDB.

**Cons:** The Lean stub must be expanded from `.tex` proofs — this is a non-trivial formalisation effort. The `no_spectral_explosion` theorem may require Mathlib-free induction over the recursion depth, which is technically demanding.

**Current state:** The Lean stub remains empty. This ADR is adopted but not yet fully implemented. The governance gap is explicit, tracked, and WORM-sealed as `SILENCE_PENDING: ADR-062` until the Lean proofs are complete.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE (governance gap explicitly tracked — SILENCE_PENDING on Lean stub)
SEAL:     adr-062-sigma-kernel — law-engine v2.0
```
