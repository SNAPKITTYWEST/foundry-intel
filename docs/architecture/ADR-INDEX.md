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
| **[ADR-300](adr/ADR-300-grat-foundry-interlock.md)** | **GRAT Foundry Interlock — THE SHARED PRIMORDIAL FOUNDATION** | **Immutable** | **EVIDENCE** |
| **[ADR-301](adr/ADR-301-daily-production-tick.md)** | **Daily Production Tick — Sedona Spine Hardening Clock** | **Accepted** | **EVIDENCE** |
| **[ADR-302](adr/ADR-302-primordial-foundation-rebrand.md)** | **Primordial Foundation Rebrand — Foundry Intel in care of Bel Esprit D'Accord** | **Accepted** | **EVIDENCE** |
| **[ADR-303](adr/ADR-303-primordial-foundation-umbrella-monorepo.md)** | **Primordial Foundation Umbrella Monorepo** | **Accepted** | **EVIDENCE** |
| **[ADR-304](adr/ADR-304-repo-freeze-autonomous-hardening.md)** | **Repository Freeze and Autonomous ADR Hardening** | **Accepted** | **EVIDENCE** |

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
| [prior-art.md](../math/prior-art.md) | Prior art registry — all ADRs cross-referenced to external and GRAT corpus |
| [SigmaKernel.lean](../math/SigmaKernel.lean) | Sigma Kernel Lean 4 types + theorem stubs (SILENCE_PENDING:ADR-062) |

## Q(phi) ADR Classification

The Q(phi) ADR parser lives in [`tools/q5-adr-parser/`](../../tools/q5-adr-parser/).
It emits a JSON and CSV classification manifest for ADR-052 through ADR-062:

- [`adr_manifest.json`](../../tools/q5-adr-parser/adr_manifest.json)
- [`adr_manifest_index.csv`](../../tools/q5-adr-parser/adr_manifest_index.csv)
- [`adr-q5-theorem-classification.md`](adr-q5-theorem-classification.md)

These Q(phi) weights are metadata classifications only. They do not independently
prove any underlying mathematics and do not alter the ADR-200 open-crux rule.

## Constitutional Hierarchy

```
ADR-200 (Parr Sovereignty Protocol — Ahmad Ali Parr)
    governs ↓
    law-engine.pl (Prolog — self-referential gate)
        governs ↓
        ADR-052 through ADR-062 (upstream)
        ADR-101 through ADR-PIRTM-002 (Veneer)
        ADR-300 (GRAT Foundry Interlock)
        ADR-301 (Daily Production Tick — non-mutating verify clock)
        ADR-302 (Primordial Foundation rebrand transition)
        ADR-303 (Primordial Foundation umbrella monorepo transition)
        ADR-304 (Repository freeze and autonomous ADR hardening)
            all grounded in ↓
            docs/math/ (Constitutional Core, Ξ-Constitution, Lean 4 theorems)
                crux: hodgeIndexHolds = none (RH open, rfl witness)
            legal anchor ↓
            THE SHARED PRIMORDIAL FOUNDATION (EIN 42-6976431)
                DEVFLOW-FINANCE 2026-04-14 (prior art anchor)
                DOI 10.5281/zenodo.21268911 (Boole closure)
```
