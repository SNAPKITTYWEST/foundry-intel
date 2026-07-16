# Architecture Overview — Veneer v2.0

**Author:** Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust  
**Version:** 2.0 (2026-07-16)  
**License:** Apache-2.0

---

## System Summary

Veneer is a formal governance framework for autonomous systems. It encodes policy as geometry: every governed action must pass ten machine-checked constraints before the BOB agent issues a verdict of EVIDENCE or SILENCE. The mathematical substrate is the field with one element (𝔽₁); the enforcement mechanism is a self-referential Prolog law engine gated by a constitutional ADR (ADR-200).

---

## The Three Layers

### Layer 0 — Mathematical Foundation (`docs/math/`)

The mathematical grounding from which all governance derives. Contains:

- `constitutional-core.md` — The Banach fixed-point law, Lawful Recursion, λ_p computation rules.
- `xi-constitution.md` — The Ξ-Constitution: Meta-Theorem of Prime Identity, PEET Tribunal.
- `lean4-convergence-theorems.lean` — Four zero-sorry Lean 4 theorems: Stability, Invariance, Fixed-Point, 108-cycle, Crux.

These documents are immutable once WORM-sealed. No implementation layer may contradict them.

### Layer 1 — Governance (`docs/governance/`)

The law engine that enforces the mathematical foundation at the ADR level:

- `law-engine.pl` — Prolog gate. Five-check sequential chain (trust → gate → Lean obligation → injection → ERE). Issues EVIDENCE or SILENCE per ADR.

The law engine is self-governing: ADR-200 requires the engine to pass its own gate before any modification can be committed.

### Layer 2 — Implementation (`packages/`)

The 10-layer Sedona Spine TypeScript implementation. Each package corresponds to a depth in the BOB ResonanceGraph:

```
Depth 0  @veneer/source         F₁ substrate
Depth 1  @veneer/datalog        Constraint EDB
Depth 2  @veneer/lean           Formal proofs
Depth 3  @veneer/constitution   Constitutional validator
Depth 4  @veneer/trust          Trust boundary
Depth 5  @veneer/triple-lock    Chain of custody
Depth 6  @veneer/contractivity  Banach invariant
Depth 7  @veneer/worm           WORM ledger
Depth 8  @veneer/bob-gate       EVIDENCE/SILENCE gate
Depth 9  @veneer/metatron       Self-recognition loop
```

---

## The Self-Feeding Loop

```
foundry-intel corpus (F₁, depth 0)
    → Datalog EDB (10 SYNTH constraints)
    → Lean 4 proofs (zero sorry)
    → Constitutional check (9 gates)
    → Trust boundary (AlpGate)
    → Triple-lock (G→E→P)
    → Contractivity (Banach, τ_r=47.07)
    → WORM seal (dual-sig, grow-only)
    → BOB gate (EVIDENCE | SILENCE)
    → METATRON (reads backward, routes to SOURCE)
    → Loop ∞
```

Each EVIDENCE verdict is sealed to the WORM ledger and re-enters the system as a new Datalog EDB fact, expanding the proof surface for the next iteration.

---

## Key Constants

| Constant | Value | Source |
|---|---|---|
| `TAU_R` | 47.06998778 | Banach fixed-point τ resonance |
| `CYCLE_108` | 108 (2² × 3³) | Canonical contractive word |
| `PHI` | 1.6180339887 | φ-modulated activation |
| `CIRCUIT_BREAKER` | 3 | Max consecutive failures (SYNTH-007) |
| `MAX_RETRY_NONCE` | 3 | Max retry nonce (SYNTH-007) |
| `LEAN_PROOF_HASH` | `LEAN_PROOF_HASH_108_CORE` | Golden trace anchor (ADR-PIRTM-002) |

These constants are constitutional. See ADR-200 Rule 2 (Banach Anchor Immutability).

---

## ADR Governance

All architectural decisions are recorded in `docs/architecture/adr/` and governed by `docs/governance/law-engine.pl`. See [ADR-INDEX.md](architecture/ADR-INDEX.md) for the full registry and governance process.

The constitutional authority is [ADR-200: Parr Sovereignty Protocol](architecture/adr/ADR-200-parr-sovereignty-protocol.md).
