# Architecture Decision Records — Index

All ADRs pass through the Law Engine (`docs/governance/law-engine.pl`) and receive a WORM-sealed EVIDENCE or SILENCE verdict before acceptance.

## Upstream ADRs (PhaseMirror/Foundry — merged 2026-07-16)

| ADR | Title | Status | Verdict |
|---|---|---|---|
| [ADR-052](adr/ADR-052-uac-integration.md) | Universal Atomic Calculator / UAC Integration | Proposed | EVIDENCE |
| [ADR-053](adr/ADR-053-lean4-monorepo-architecture.md) | Lean 4 Formalization and Monorepo Architecture | Accepted | EVIDENCE |
| [ADR-054](adr/ADR-054-rust-kani-mathlib-free.md) | Rust/Kani Executable Formal Verification — Mathlib-Free | Accepted | EVIDENCE |
| [ADR-055](adr/ADR-055-riemann-zeta-implementation.md) | Riemann Hypothesis Computational Implementation | Accepted | EVIDENCE |
| [ADR-056](adr/ADR-056-collatz-verification.md) | Collatz Conjecture Computational Verification | Accepted | EVIDENCE |
| [ADR-057](adr/ADR-057-lean4-adr-scaffolding.md) | Lean 4 Formal ADR Scaffolding | Accepted | EVIDENCE |
| [ADR-058](adr/ADR-058-pirtm-compiler-sig.md) | PIRTM Compiler — Sig Library (Phase B) | Accepted | EVIDENCE |
| [ADR-059](adr/ADR-059-ace-runtime.md) | Attested Convergence Envelope (ACE) Runtime | Proposed | EVIDENCE |
| [ADR-060](adr/ADR-060-drmm.md) | Dynamic Recursive Meta-Mathematics (DRMM) | Proposed | EVIDENCE |
| [ADR-061](adr/ADR-061-zmos-production.md) | ZMOS (Zeta-Multiplicity Operator System) Production | Adopted | EVIDENCE |
| [ADR-062](adr/ADR-062-sigma-kernel.md) | Sigma Kernel Production Implementation | Adopted | EVIDENCE (gap tracked) |

## Veneer ADRs (Sedona Spine — production hardening)

| ADR | Title | Status | Verdict |
|---|---|---|---|
| [ADR-101](adr/ADR-101-tree-sitter-grammar.md) | Tree-sitter Grammar for PIRTM-lang | Accepted | EVIDENCE |
| [ADR-102](adr/ADR-102-sig-type-engine.md) | Sig Type Engine and Multiplicity Conservation | Accepted | EVIDENCE |
| [ADR-103](adr/ADR-103-ace-invariant-pass.md) | ACE Invariant Pass — Spectral Stability | Accepted | EVIDENCE |
| [ADR-104](adr/ADR-104-compiler-governance-integration.md) | PIRTM Compiler Governance and Production Gating | Accepted | EVIDENCE |
| [ADR-PIRTM-001](adr/ADR-PIRTM-001-lean4-convergence.md) | Lean 4 Formalization of Recursive Tensor Convergence | Accepted | EVIDENCE |
| [ADR-PIRTM-002](adr/ADR-PIRTM-002-production-readiness.md) | Production Readiness Checklist for pirtm-compiler | Accepted | EVIDENCE |
| **[ADR-200](adr/ADR-200-parr-sovereignty-protocol.md)** | **Parr Sovereignty Protocol — Constitutional Authority** | **Immutable** | **EVIDENCE** |

---

## ADR Governance Process

1. Author drafts ADR. CI runs `law-engine.pl` against the new ADR record.
2. Engine returns EVIDENCE → eligible for merge. SILENCE → blocked.
3. On merge, `@veneer/worm` appends the ADR verdict to the WORM ledger.
4. ADR-200 Rule 1: any modification to `law-engine.pl` must itself pass the engine gate.

## Running the Law Engine

```sh
# Verify all registered ADRs
swipl -g "consult('docs/governance/law-engine.pl'), run_all_adrs" -t halt

# Verify a single ADR
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-055', V, S), format('~w | ~w~n', [V, S])" -t halt

# Constitutional self-check (ADR-200)
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-200', V, _), write(V), nl" -t halt
```

## Mathematical Finality Documents

| Document | Content |
|---|---|
| [constitutional-core.md](../math/constitutional-core.md) | Banach law, λ_p computation, single source of truth |
| [xi-constitution.md](../math/xi-constitution.md) | Ξ-Constitution, Meta-Theorem of Prime Identity |
| [lean4-convergence-theorems.lean](../math/lean4-convergence-theorems.lean) | 4 zero-sorry theorems — Stability, Invariance, Fixed-Point, 108-cycle, Crux |
| [transcendental-contractivity.lean](../math/transcendental-contractivity.lean) | sin/cos/log contractivity — Gram correction safety proof |
| [riemann-zeta-finality.md](../math/riemann-zeta-finality.md) | Zeta finality statement — infrastructure + open crux |

## Constitutional Hierarchy

```
ADR-200 (Parr Sovereignty Protocol — Ahmad Ali Parr)
    governs ↓
    law-engine.pl (Prolog — self-referential gate)
        governs ↓
        ADR-052 through ADR-062 (upstream)
        ADR-101 through ADR-PIRTM-002 (Veneer)
            all grounded in ↓
            docs/math/ (Constitutional Core, Ξ-Constitution, Lean 4 theorems)
                crux: hodgeIndexHolds = none (RH open, rfl witness)
```
