# Architecture Decision Records — Index

All ADRs pass through the Law Engine (`docs/governance/law-engine.pl`) and receive a WORM-sealed EVIDENCE or SILENCE verdict before acceptance.

| ADR | Title | Status | Verdict |
|---|---|---|---|
| [ADR-101](adr/ADR-101-tree-sitter-grammar.md) | Tree-sitter Grammar for PIRTM-lang | Accepted | EVIDENCE |
| [ADR-102](adr/ADR-102-sig-type-engine.md) | Sig Type Engine and Multiplicity Conservation | Accepted | EVIDENCE |
| [ADR-103](adr/ADR-103-ace-invariant-pass.md) | ACE Invariant Pass — Spectral Stability | Accepted | EVIDENCE |
| [ADR-104](adr/ADR-104-compiler-governance-integration.md) | PIRTM Compiler Governance and Production Gating | Accepted | EVIDENCE |
| [ADR-PIRTM-001](adr/ADR-PIRTM-001-lean4-convergence.md) | Lean 4 Formalization of Recursive Tensor Convergence | Accepted | EVIDENCE |
| [ADR-PIRTM-002](adr/ADR-PIRTM-002-production-readiness.md) | Production Readiness Checklist for pirtm-compiler | Accepted | EVIDENCE |
| [ADR-200](adr/ADR-200-parr-sovereignty-protocol.md) | **Parr Sovereignty Protocol** — Constitutional Authority | **Accepted — Immutable** | **EVIDENCE** |

---

## ADR Governance Process

1. Author drafts ADR following the standard format (Context / Decision / Consequences / Law Engine Verdict).
2. ADR is submitted as a PR. CI runs `law-engine.pl` against the new ADR record.
3. If the engine returns EVIDENCE: PR is eligible for merge.
4. If the engine returns SILENCE: PR is blocked. Author must address the failed check.
5. Upon merge, the WORM sealer (`@veneer/worm`) appends the ADR verdict to the ledger.

## Running the Law Engine

```sh
# Verify a single ADR
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-101', V, S), format('~w | ~w~n', [V, S])" -t halt

# Run all ADRs
swipl -g "consult('docs/governance/law-engine.pl'), run_all_adrs" -t halt

# Verify ADR-200 self-referential gate
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-200', V, _), (V = 'EVIDENCE' -> write('Constitutional: PASS') ; write('Constitutional: FAIL')), nl" -t halt
```

## Constitutional Hierarchy

```
ADR-200 (Parr Sovereignty Protocol)
    governs ↓
    law-engine.pl (Prolog gate)
        governs ↓
        ADR-101  ADR-102  ADR-103  ADR-104
        ADR-PIRTM-001  ADR-PIRTM-002
            all governed by ↓
            Ξ-Constitution + Constitutional Core (docs/math/)
```

All ADRs ultimately trace back to the mathematical grounding in `docs/math/constitutional-core.md` and `docs/math/xi-constitution.md`.
