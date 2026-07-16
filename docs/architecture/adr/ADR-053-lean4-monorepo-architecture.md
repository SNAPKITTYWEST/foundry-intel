# ADR-053: Lean 4 Formalization and Monorepo Architecture

**Status:** Accepted — Option 2 (Unified Monorepo)  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-053_plan_lean4_expansion.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

Multiple Lean folders exist containing `.tex` manuscripts for mathematical theories (F1_SQUARE, ECHO_BRAID, MULTIPLICITY, ALP, UMCPAROM, EIGEN_SOLVERS, AZTFTC, etc.). Goal: uniformly expand these into Lean 4 proof projects integrated into the PhaseMirror/Veneer ecosystem.

## Decision

**Option 2 — Unified Monorepo Lake Workspace.**

Transform the root `lean/` directory into a Lake Workspace. Each theory folder becomes a Lake package or library target within the single monolithic project. Cross-referencing is seamless: `import Multiplicity.KnotTheory`, `import F1Square.Surface`. Single `lean-toolchain` version.

Domain clusters:

| Cluster | Packages |
|---|---|
| Core Mathematics | F1_SQUARE, UAC |
| Physics / Relativistic | GENESIS_ODE, META_MATERIALS, H-BEC, LORENZ_ATTRACTOR |
| Multiplicity Framework | MULTIPLICITY (Bohmian, Moonshine, Operator Calculus, Knot Theory) |
| Emerging | ALP (Atomic Language Processing), ECHO_BRAID |

In Veneer: the `packages/lean/` package is the entry point. The `docs/math/` directory contains the mathematical foundation documents that feed into the Lake workspace theorems.

## Consequences

**Pros:** Unified toolchain, shared axioms across theories, single CI pipeline.

**Cons:** Monolithic build grows with the codebase. Mitigated by Lake's incremental compilation and GitHub Actions caching.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-053-lean4-monorepo — law-engine v2.0
```
