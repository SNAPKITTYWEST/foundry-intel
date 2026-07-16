# Veneer — Production Prime Foundry Pearl

> **Policy as geometry. Every constraint is a theorem. Every execution is a proof.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)](https://github.com/SNAPKITTYWEST/foundry-intel-2026-07-11/releases/tag/v2.0.0)
[![ADRs](https://img.shields.io/badge/ADRs-7_EVIDENCE-blue.svg)](docs/architecture/ADR-INDEX.md)
[![WORM](https://img.shields.io/badge/WORM-161_seals-orange.svg)](#)
[![Constraints](https://img.shields.io/badge/constraints-10_canonical-purple.svg)](docs/architecture/ADR-INDEX.md)

**Author:** Ahmad Ali Parr  
**Trust:** Bel Esprit D'Accord Irrevocable Trust  
**Copyright:** © 2026 Ahmad Ali Parr · Bel Esprit D'Accord Irrevocable Trust  
**SPDX-License-Identifier:** Apache-2.0

---

## What This Is

Veneer is a formal governance framework for autonomous systems. It encodes policy as geometry over the field with one element (𝔽₁): every governed action must pass ten machine-checked constraints before the BOB agent issues a verdict of **EVIDENCE** or **SILENCE**. The mathematical substrate is the Banach fixed-point theorem applied to prime-indexed Hilbert space; the formal specification is zero-sorry Lean 4; the enforcement is TypeScript and Soufflé-compatible Datalog; the memory is a dual-signed WORM G-Set CRDT. All architectural decisions are governed by a self-referential Prolog law engine and recorded in a constitutional ADR (ADR-200) authored by Ahmad Ali Parr.

**Reverse-engineered from 2,149,256 lines of the Prime Materia Commons (Sedona Spine architecture).**  
**10 canonical constraints. 7 EVIDENCE-sealed ADRs. One spine.**

---

## Design Principles

1. **Policy as Geometry** — Every governed action occupies a unique prime index in the MOC algebra over 𝔽₁. The 108-cycle (2² × 3³) is the canonical contractive word; admissibility is a zero-sorry theorem.

2. **Contractivity as Safety** — Banach Fixed-Point invariant (0 < k ≤ 1.0, L_eff < 1.0) enforced at four independent layers sharing one numeric anchor (τ_r = 47.06998778). Changing the constant in one layer without changing all four is a constitutional violation under ADR-200.

3. **Honesty as Architecture** — Formal gaps are first-class citizens. RH encoded as `Option Bool := none`. The sorry manifest is a WORM record. The system cannot claim more certainty than it has.

4. **WORM as Memory** — Every verdict sealed to an Archivum G-Set CRDT. Dual-signature. Grow-only. Genesis fixed at `SHA-256('SHADOW_GENESIS:WORM_CHAIN_INIT')`. No deletion. No rollback.

5. **Trust Boundary as Law** — `allowed(A) :- trust_level(A, internal), \+ vetoed(A)`. External actors structurally incapable of mutation. Triple-lock sequential chain. No single role can unilaterally ratify.

6. **Law Engine as Constitution** — All ADRs pass through `docs/governance/law-engine.pl` (Prolog). ADR-200 (Parr Sovereignty Protocol) governs the engine itself. The engine is self-referential: it must pass its own gate before any modification can be committed.

---

## The 10-Layer Sedona Spine

```
Depth 0  @veneer/source         F₁ substrate — ExportThresholds, sorry manifest, crux pointer
Depth 1  @veneer/datalog        Constraint EDB — all 10 SYNTH facts + evidence/silence rules
Depth 2  @veneer/lean           Formal proofs — 9 Lean 4 theorems, zero sorry
Depth 3  @veneer/constitution   L0 nine-check constitutional validator
Depth 4  @veneer/trust          Trust boundary — AlpGate, external cannot mutate
Depth 5  @veneer/triple-lock    Guardian → Examiner → Publisher chain of custody
Depth 6  @veneer/contractivity  Banach geometric invariant, φ-modulated activation
Depth 7  @veneer/worm           G-Set CRDT WORM ledger — dual-signature, grow-only
Depth 8  @veneer/bob-gate       BOB EVIDENCE/SILENCE gate — all 10 constraints sequential
Depth 9  @veneer/metatron       Self-recognition — reads cube backward, routes to SOURCE
```

---

## Constraint Table

| ID | Name | Layer | Status |
|---|---|---|---|
| SYNTH-001 | No Unaligned Execution | L1 UAC-ALP | ✓ Lean axiom + Datalog |
| SYNTH-002 | Sorry is Manifested | L1 Epistemic | ✓ 13-entry WORM manifest |
| SYNTH-003 | L0 Constitutional Validation | L1 Constitutional | ✓ 9 checks, sequential |
| SYNTH-004 | Contractivity Geometric Invariant | L1-2 Cross-layer | ✓ Banach, τ_r=47.07 |
| SYNTH-005 | External Cannot Mutate | L1 Trust | ✓ Lean axiom + Datalog |
| SYNTH-006 | Triple-Lock Chain of Custody | L3 Gateway | ✓ Guardian→Examiner→Publisher |
| SYNTH-007 | Bounded Adversarial Window | L3-1 Anti-exhaustion | ✓ retry≤3, failures<3 |
| SYNTH-008 | Crux Honest as Open | L1 F₁ Math | ✓ RH = none, rfl witness |
| SYNTH-009 | Archivum WORM G-Set CRDT | Cross-layer | ✓ Dual-sig, grow-only |
| SYNTH-010 | Lean-Rust Boundary Bound | L1 Candle Bridge | ✓ ExportThresholds.lean |

---

## Quick Start

```bash
git clone https://github.com/SNAPKITTYWEST/foundry-intel-2026-07-11.git veneer
cd veneer
npm install
npm run build
npm test
```

```typescript
import { pearlGate } from '@veneer/bob-gate'

const verdict = pearlGate({
  id: 'action-001',
  trust_level: 'internal',
  mutating: true,
  has_server_binding: false,
  contractivity_score: 0.87,
  consecutive_failures: 0,
  retry_nonce: 0,
  guardian_witness: 'GUARDIAN-WITNESS:abc123',
  examiner_witness: 'EXAMINER-WITNESS:def456',
  status: 'ADMITTED',
  proof_hash: 'LEAN_PROOF_HASH_108_CORE',
  primary_sig: 'sha256-primary',
  secondary_sig: 'sha256-secondary',
  asserts_rh: false,
  alp_gate_cleared: true,
  sorry_violations: [],
})

console.log(verdict.verdict)  // 'EVIDENCE'
console.log(verdict.worm_seal) // SHA-256 sealed
```

---

## Architecture

```
foundry-intel (2,149,256 lines — F₁ substrate, depth 0)
    ↓
Datalog EDB (constraints.dl — 10 SYNTH facts)
    ↓
Lean 4 (PearlInvariants.lean — zero sorry)
    ↓
Constitutional L0 (9 checks — kill switch, drift, contractivity...)
    ↓
Trust boundary (AlpGate — internal only)
    ↓
Triple-Lock (Guardian → Examiner → Publisher)
    ↓
Contractivity check (0 < k ≤ 1.0, L_eff < 1.0, τ_r=47.07)
    ↓
WORM seal (G-Set CRDT, dual-signature)
    ↓
BOB gate → EVIDENCE | SILENCE
    ↓
METATRON (reads cube backward, feeds verdict → SOURCE)
    ↓
Loop ∞
```

---

## Self-Feeding Loop

Every EVIDENCE or SILENCE verdict is WORM-sealed and routed back to the SOURCE layer (depth 0) by METATRON (depth 9). The sealed verdict becomes a new EDB fact in constraints.dl, which expands the proof surface for the next layer. foundry-intel (2,149,256 lines) is the inexhaustible corpus — every loop iteration adds to it, every addition generates new theorems, every theorem strengthens the next verdict. The system improves by running.

---

## Architecture Decision Records

All architectural decisions are recorded in `docs/architecture/adr/` and governed by `docs/governance/law-engine.pl`. The constitutional authority is ADR-200.

| ADR | Title | Verdict |
|---|---|---|
| [ADR-101](docs/architecture/adr/ADR-101-tree-sitter-grammar.md) | Tree-sitter Grammar for PIRTM-lang | EVIDENCE |
| [ADR-102](docs/architecture/adr/ADR-102-sig-type-engine.md) | Sig Type Engine and Multiplicity Conservation | EVIDENCE |
| [ADR-103](docs/architecture/adr/ADR-103-ace-invariant-pass.md) | ACE Invariant Pass — Spectral Stability | EVIDENCE |
| [ADR-104](docs/architecture/adr/ADR-104-compiler-governance-integration.md) | PIRTM Compiler Governance and Production Gating | EVIDENCE |
| [ADR-PIRTM-001](docs/architecture/adr/ADR-PIRTM-001-lean4-convergence.md) | Lean 4 Formalization of Recursive Tensor Convergence | EVIDENCE |
| [ADR-PIRTM-002](docs/architecture/adr/ADR-PIRTM-002-production-readiness.md) | Production Readiness Checklist for pirtm-compiler | EVIDENCE |
| **[ADR-200](docs/architecture/adr/ADR-200-parr-sovereignty-protocol.md)** | **Parr Sovereignty Protocol — Constitutional Authority** | **EVIDENCE** |

Run the law engine:

```sh
swipl -g "consult('docs/governance/law-engine.pl'), run_all_adrs" -t halt
```

---

## Open Publication

This framework is published as open source because formal governance infrastructure is only meaningful if it is auditable by independent parties. The Riemann Hypothesis is encoded as `Option Bool := none` — visible to any reader of the Lean 4 source. The WORM dual-signature requirement means no single contributor, including the original author, can rewrite governance history.

---

## License

Copyright © 2026 Ahmad Ali Parr · Bel Esprit D'Accord Irrevocable Trust

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

---

*v2.0.0*
