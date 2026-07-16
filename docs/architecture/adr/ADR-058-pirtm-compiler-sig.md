# ADR-058: PIRTM Compiler — Sig Library (Phase B)

**Status:** Accepted  
**Source:** PhaseMirror/Foundry — docs/adr/ADR-058-pirtm-compiler.md  
**Merged:** 2026-07-16 — Veneer v2.0  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)

---

## Context

Phase B of the PIRTM compiler roadmap requires the `Sig` library (Multiplicity Functor) to enforce the Prime Successor Predicate via programmable language constructs. This extends ADR-102 (Sig Type Engine) to the compiler level.

## Decision

Implement the `Sig` library directly in `crates/pirtm-compiler`:

- `Sig` struct: `HashMap<u64, i32>` (prime-factorisation representation)
- `multiplicity_functor` M: exact rational multiplicity
- All tensor operations validated against `M(S_new) = M(Ap) · M(S_old)`
- Integration with `tree-sitter` grammar for operator word enforcement (see ADR-101)
- Kani verification harness: `sig_multiplicity_conservation` proof

## Consequences

**Pros:** Enables ACE invariant checks downstream. Aligns with Phase B roadmap. Sig type checked at parse time via tree-sitter integration.

**Cons:** Tree-sitter integration rigid — grammar extensions require Sig type re-verification. Integer/rational arithmetic adds allocation pressure.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-058-pirtm-compiler-sig — law-engine v2.0
```
