# ADR-057: Lean 4 Formal ADR Scaffolding

**Status:** Accepted  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-057-LEAN4_ADR_SCAFFOLDING.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

ADRs exist as static text. By modelling ADRs as inductive Lean 4 structures, architectural decisions become provable theorems: once an ADR is `Accepted`, its constraints are invariant, and state transitions preserve historical traceability without circular dependencies.

## Decision

Implement a Lean 4 ADR type system:

```lean
inductive ADRStatus
  | Proposed
  | Accepted
  | Deprecated
  | Superseded (by : String)

structure ADR where
  id        : String
  status    : ADRStatus
  context   : String
  decision  : String
  consequences : String
  trace_links  : List String
```

**Key theorems to prove:**
- `accepted_constraints_invariant`: Once `Accepted`, the decision field is immutable.
- `no_circular_supersession`: The supersession chain has no cycles.
- `consequence_entailment`: The consequences follow logically from the decision.

**File tree:**

```
LeanADR/
├── lakefile.lean
├── lean-toolchain
└── src/ADR/
    ├── Core.lean       -- ADRStatus, ADR structure, ArtifactLink
    ├── Proofs.lean     -- Immutability, acyclicity, entailment theorems
    ├── Examples.lean   -- Concrete instances: ADR-055 (Riemann), ADR-056 (Collatz)
    └── Export.lean     -- Markdown generation
```

**Veneer integration:** The `docs/governance/law-engine.pl` Prolog gate is the operational enforcement of this ADR. The Lean type system provides the formal specification; the Prolog law engine provides the runtime gate.

## Consequences

**Pros:** ADRs become machine-verifiable theorems. No ADR can be accepted without passing the Lean type checker.

**Cons:** Requires Lean 4 toolchain in CI. The `Export.lean` markdown generator adds a build step to produce human-readable ADR documents from Lean source.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-057-lean4-adr-scaffolding — law-engine v2.0
```
