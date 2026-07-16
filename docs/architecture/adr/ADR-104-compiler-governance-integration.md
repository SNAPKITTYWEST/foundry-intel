# ADR-104: PIRTM Compiler Governance and Production Gating

**Status:** Accepted  
**Date:** 2026-06-24  
**Author:** Governance — Phase Mirror / Foundry  
**Hardened:** 2026-07-16 — Law Engine v2.0 (ADR-200 Protocol)

---

## Context

The PIRTM compiler must bridge compile-time mathematical validation with deployment-time governance gating. Without a unified specification, the IDE diagnostic path, CI test path, and ledger anchoring path can diverge — producing Governance Drift where a module passes CI but fails at deployment, or passes deployment but produces invalid ledger records. This violates the Sedona Spine "Zero Drift" mandate.

## Decision

Implement a five-component production governance and gating pipeline. All five components share the same compiler validation engine as a single source of truth.

### Component 1 — Context-Agnostic Parsing (Tree-sitter)

Keep the Tree-sitter grammar context-agnostic. Delegate all value-level, prime-successor, and mathematical constraints to the `AdmissibilityValidator`. (See ADR-101.)

### Component 2 — Unified Semantic Validator (`AdmissibilityValidator`)

The validator maps AST structures to exact mathematical and topological invariants in a single pass. Hard failure diagnostic codes:

| Code | Trigger |
|---|---|
| `SUCCESSOR_PREDICATE_VIOLATION` | Prime-index towers violate successor rules |
| `MULTIPLICITY_VIOLATION` | Tensor identity multiplicity conservation fails |
| `STRATUM_CROSS_BOUNDARY_VIOLATION` | Prime indices cross hierarchical stratum boundaries |
| `CIRCUIT_BUDGET_EXCEEDED` | Circuit exceeds assigned computational capacity |
| `CONTRACTIVITY_INVARIANT_BREACH` | Spectral stability or contractivity constraint violated (ε·‖T‖_op ≥ 1) |

### Component 3 — WASM Gating Boundary (`validate_source`)

Expose compiler validation via a Rust-WASM bridge using `wasm-bindgen`. Returns a versioned `DiagnosticEnvelope` JSON object — a stable, forward-compatible contract between Rust and TypeScript platforms.

### Component 4 — Stateless LSP Adapter (`lsp_handler.ts`)

The LSP diagnostic provider is a stateless pass-through. Validates on change/save, maps `DiagnosticEnvelope` to editor warnings/errors, performs no independent reinterpretation.

### Component 5 — CI Gating and Archivum Ledger Anchoring

The CI pipeline executes the validator as a non-bypassable gate. Builds fail-closed if `diagnostics.len() > 0` or if Lean 4 proof materialization fails. Successful builds automatically generate a `ContractivityReceipt` and `UnifiedWitness` record, anchoring build provenance in the Archivum Ledger.

## Consequences

**Pros**

- **Single Source of Truth**: All IDE diagnostics, CI tests, and ledger proofs share the same engine.
- **Zero Drift**: Exact, fixed-point verification in Rust kernel; results pass via WASM.
- **Fail-Closed Protection**: Uncertified states cannot proceed to execution or linking.

**Cons**

- **Build Latency**: Multi-pass checks (parsing → validation → proof verification) increase compile time.
- **Toolchain Dependency**: Requires active Rust, WebAssembly, and Lean 4 toolchains.

**Sedona Spine Alignment**

This ADR is the master governance specification for the PIRTM compiler. All other compiler ADRs (101, 102, 103) are architectural decisions within this governance frame.

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
SEAL:         adr-104-compiler-governance — law-engine v2.0
```

---

*Provenance: PhaseMirror/Foundry · crates/apex/apex-goldilocks/docs/architecture/adr/004-compiler-governance-integration.md*
