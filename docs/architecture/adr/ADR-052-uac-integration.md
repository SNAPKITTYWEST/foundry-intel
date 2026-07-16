# ADR-052: Universal Atomic Calculator / UAC Integration

**Status:** Proposed  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-052-SnapKitty-UAC-Integration.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The Universal Atomic Calculator (UAC) uses neutral-atom qudit architectures (⁸⁷Sr, ¹³³Cs) for atomic self-simulation. Key components:

- **QCFI** (Qudit-Classical Feedback Interface) — dimension shifting (d=16 ↔ d=8) based on heuristic error threshold ε₀
- **MA-VQE** — variational quantum eigensolver compilation
- **HSEC** (Hyperfine Subspace Error Correction) — leak detection via auxiliary subspace variance

Current UAC heuristics lack thermodynamic rigour, exposing the system to drift. The Veneer governance math (Constitutional Core, Banach contractivity) provides compiler-proven formalisms to replace these heuristics.

## Decision

Formally integrate the Veneer pure-math models into the UAC architecture.

**1. QCFI and Thermodynamic Window**

Replace heuristic ε₀ threshold with the `ThermalWindow` bound: `lo(f) < hi(f)`. High friction narrows the window, enforcing dimension reduction equivalent to cooling into a ground state. The dimension d is deterministically bound — no heuristic.

**2. MA-VQE and the Quantum Monad**

Model the variational search tree as a Quantum Superposition Monad. The `q_bind` operation natively destroys failed branches during bind, mathematically pruning the search space without classical post-filtering.

**3. HSEC and Entropy Bounds**

Evaluate the auxiliary subspace using Von Neumann entropy: error correction proceeds only if `S(ρ) ≤ H_max = 6.0 bits`. Leakage is quantified as entropy, not heuristic variance.

**4. Gate Fidelity and the 49th Call**

Use `call_49(S) = reverse(S)` to enforce mirror identity `C(C(X)) = X`. Zero-cost topological audit of microwave pulse sequence symmetry.

## Consequences

**Pros:** Replaces heuristics with provable physics boundaries. Routes all quantum state decisions through formal ALP and MOC paths.

**Cons:** Increased engineering effort to bridge Rust UAC SDK with Lean axioms. QCFI transition from heuristic to thermodynamic window requires calibration against real hardware.

---

## Prior Art

| Citation | Connection |
|---|---|
| **bakalov2001** — Bakalov & Kirillov, *Lectures on Tensor Categories and Modular Functors* | MTC structure for qudit architecture |
| **drinfeld1987** — Drinfeld, *Quantum groups*, Proc. ICM | Quantum double; co-product ΔZ motivates QCFI algebra |
| **freedman2002** — Freedman et al., *Topological quantum computation*, Bull. AMS | FLW theorem: anyonic braiding for universal QC; gate fidelity basis |
| **thermal.axiom** (`resonance-math/axiom/thermal.axiom`) | `thermal_window_valid`: `lo(f) < hi(f)` ∀f∈[0,1] — replaces heuristic ε₀ |
| **entropy.axiom** (`resonance-math/axiom/entropy.axiom`) | `von_neumann_reduces_to_shannon` — HSEC error quantification |
| **GRAT-ASSET-009** — `QuantumPartitionBridge.lean` | Legendre duality F_β = ⟨H⟩_ρ − (1/β)·S_vN(ρ), zero sorry; UAC thermal model |

See `docs/math/prior-art.md` §IV for the full cross-reference.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-052-uac-integration — law-engine v2.0
```
