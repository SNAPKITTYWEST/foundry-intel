# ADR-059: Attested Convergence Envelope (ACE) Runtime

**Status:** Proposed  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-059-ace-runtime.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The ACE Runtime is the standalone enforcement layer for computation budget limits and invariant preservation (Phase C of Governance-as-Compilation). Without ACE, the ACE Invariant Pass (ADR-103) catches violations at link time but not at execution time. A running system can drift into non-contractive states between link steps.

## Decision

Implement ACE invariant checks inside the Rust Engine (Sedona Spine), bound by hardware-level memory boundaries and Kani verification.

**Runtime invariants enforced:**
- `Σ F_i + ε < 1` — spectral radius
- `r(Λ) < 1 − ε` — contractivity margin
- `circuit_budget ≤ CIRCUIT_BREAKER_THRESHOLD` (= 3, from SYNTH-007)

**Fail-closed semantics:** On invariant violation, the kernel enters `FREEZE` state. No partial state emitted. Structured dissonance report emitted to the WORM ledger.

**Kani harness:** `ace_runtime_budget_veto` — symbolically proves that for all computation sequences exceeding the circuit budget, the halt condition fires before output is emitted.

## Consequences

**Pros:** Zero-drift risk modelling natively in Rust. Computation cannot exceed Phase C constraints.

**Cons:** Constant budget assertions add overhead proportional to computation depth. `FREEZE` state requires careful recovery protocol.

---

## Prior Art

| Citation | Connection |
|---|---|
| **dawson2005** — Dawson & Nielsen, *The Solovay-Kitaev algorithm*, Quantum Inf. Comput. 6:1 | SK depth overhead justifies `circuit_budget ≤ 3` threshold |
| **banach1922** — Banach, *Sur les opérations dans les ensembles abstraits* | Contractivity margin `r(Λ) < 1 − ε` — Banach fixed-point theorem |
| **thermal.axiom** (`resonance-math/axiom/thermal.axiom`) | `ema_preserves_bounds` — EMA model for runtime budget adaptation |

See `docs/math/prior-art.md` §IV for the full cross-reference.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-059-ace-runtime — law-engine v2.0
```
