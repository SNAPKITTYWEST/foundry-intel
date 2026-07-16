# ADR-101: Tree-sitter Grammar for PIRTM-lang

**Status:** Accepted  
**Date:** 2026-06-24  
**Author:** Governance — Phase Mirror / Foundry  
**Hardened:** 2026-07-16 — Law Engine v2.0 (ADR-200 Protocol)

---

## Context

PIRTM operators require strict adherence to the **Prime Successor Predicate**. Conventional parsers do not support state-level dependencies on prime numbers. A grammar that attempts to enforce prime-index continuity at parse time creates an unbounded lookahead requirement that breaks incremental parsing and LSP integration.

## Decision

Define the PIRTM grammar using `tree-sitter`, enforcing structural validity of operator sequences only. Semantic prime-successor checks are delegated entirely to the post-parsing `AdmissibilityValidator` to maintain parser performance while guaranteeing adherence to the prime-index continuity rule. The grammar is context-agnostic by design.

## Consequences

**Pros**

- Enables robust AST generation with a standard interface for IDEs (LSP support via tree-sitter queries).
- Keeps the parser stage O(n) with no prime-lookup overhead.
- Grammar changes do not require changes to the semantic invariant layer.

**Cons**

- Requires a two-pass validation (Parsing → Semantic) to fully enforce the Successor Predicate. A structurally valid parse tree can contain semantically invalid operator words until the validator runs.

**Sedona Spine Alignment**

Directly satisfies the governance requirement that all ESI-related operator words must be admissible before state-transition materialization. The parser produces the AST; the `AdmissibilityValidator` is the constitutional gate.

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
SEAL:         adr-101-tree-sitter-grammar — law-engine v2.0
```

---

*Provenance: PhaseMirror/Foundry · crates/apex/apex-goldilocks/docs/architecture/adr/001-tree-sitter-grammar.md*
