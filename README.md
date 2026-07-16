# Veneer — SnapKitty Production Prime Foundry Pearl

> **Policy as geometry. Every constraint is a theorem. Every execution is a proof.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)](https://github.com/SNAPKITTYWEST/foundry-intel-2026-07-11/releases/tag/v2.0.0)
[![Trust](https://img.shields.io/badge/Trust-Bel_Esprit_D'Accord-gold.svg)](#)
[![WORM](https://img.shields.io/badge/WORM-161_seals-orange.svg)](#worm-ledger)
[![Constraints](https://img.shields.io/badge/constraints-10_canonical-purple.svg)](#constraint-table)

Copyright © 2026 Ahmad Ali Parr · Bel Esprit D'Accord Irrevocable Trust · SnapKitty Collective  
SPDX-License-Identifier: Apache-2.0

---

## What This Is

The Production Prime Foundry Pearl is a multi-layer sovereign AI governance framework that encodes policy as geometry over the field with one element (𝔽₁), where every governed action must pass ten machine-checked constraints before BOB issues a verdict of **EVIDENCE** or **SILENCE** via a deterministic Datalog evaluation chain. The system is grounded in the Prime Materia Commons (foundry-intel, 2,149,256 lines), formally specified in Lean 4, enforced in Rust and TypeScript, and sealed to an append-only WORM G-Set CRDT at every layer transition. The Riemann Hypothesis appears as `hodgeIndexHolds = none` — structurally honest, never asserted.

**Reverse-engineered from 2,149,256 lines of the Prime Materia Commons (Sedona Spine architecture).**  
**10 canonical constraints. 10 packages. One spine.**

---

## Five Pillars

1. **Policy as Geometry** — Every governed action occupies a unique prime index in the MOC algebra over 𝔽₁. The 108-cycle (2² × 3³) is the canonical contractive word; admissibility is a zero-sorry theorem.

2. **Contractivity as Safety** — Banach Fixed-Point invariant (0 < k ≤ 1.0, L_eff < 1.0) encoded in Lean 4, enforced in Rust, checked in Datalog, gated in TypeScript — four enforcement points sharing one numeric anchor (SYNTH-010).

3. **Honesty as Architecture** — Formal gaps are first-class citizens. RH encoded as `Option Bool := none`. 13-entry sorry manifest is a WORM record. The system cannot claim more certainty than it has.

4. **WORM as Memory** — Every verdict, every layer transition sealed to Archivum G-Set CRDT. Dual-signature. Grow-only. No deletion. No rollback. Genesis fixed at `SHA-256('SHADOW_GENESIS:WORM_CHAIN_INIT')`.

5. **Trust Boundary as Law** — `allowed(A) :- trust_level(A, internal), \+ vetoed(A)`. External actors structurally incapable of mutation. Triple-lock sequential chain. No single role can unilaterally ratify.

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

## Open Source Statement

This system is published as open source because sovereign governance infrastructure is only meaningful if it is auditable by the governed parties rather than vouched for by an institutional authority. The formal gap registry (SYNTH-002) and crux honesty constraint (SYNTH-008) are themselves proof that this commitment is not rhetorical: the Riemann Hypothesis appears as `Option Bool := none` with machine-checked rfl witnesses, visible to any reader of PearlInvariants.lean. Open publication means the adversarial window (SYNTH-007) is exercised by reality rather than internal simulation, and the WORM dual-signature requirement (SYNTH-009) means no single contributor — including the original author — can unilaterally rewrite governance history.

---

## License

Copyright © 2026 Ahmad Ali Parr · Bel Esprit D'Accord Irrevocable Trust · SnapKitty Collective

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

---

*v2.0.0 — Lights on. The Prime Materia Commons lives.*
