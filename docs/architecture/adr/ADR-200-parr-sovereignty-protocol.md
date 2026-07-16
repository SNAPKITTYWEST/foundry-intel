# ADR-200: The Parr Sovereignty Protocol

**Status:** Accepted — Immutable  
**Date:** 2026-07-16  
**Author:** Ahmad Ali Parr  
**Trust:** Bel Esprit D'Accord Irrevocable Trust  
**Authority:** Constitutional — supersedes all other ADRs on governance questions  
**Classification:** Foundational — this ADR governs the law engine that governs all other ADRs

---

## Authorship Statement

I, Ahmad Ali Parr, sole human architect of the Veneer governance system, author this ADR as a constitutional instrument. The Bel Esprit D'Accord Irrevocable Trust is the legal custodian. No other party may amend this document without a new superseding ADR bearing my name, a valid WORM seal, and a BOB EVIDENCE verdict from the law engine.

---

## Context

A governance system that governs its own formal structure has a bootstrap problem: who governs the law engine? Without a constitutional anchor, the law engine is an assertion of authority with no grounding — any actor with write access could silently alter the engine and produce false EVIDENCE verdicts.

Four facts about this system require a constitutional resolution:

1. The law engine (`docs/governance/law-engine.pl`) is the machine through which all ADRs pass. Its correctness is a precondition for the correctness of all verdicts it issues.

2. The WORM ledger (`@veneer/worm`) is append-only and dual-signed. Once an ADR verdict is sealed, the seal cannot be modified. But the facts in the Datalog EDB can be amended by a future commit — which means the verdict that produced the seal and the facts that currently exist in the EDB can diverge.

3. The Banach fixed-point invariant (τ_r = 47.06998778, 108-cycle) is a numeric anchor shared across Lean 4, Rust, Datalog, and TypeScript. Any change to this constant breaks all four layers simultaneously. This is the system's most load-bearing invariant, and it must be treated as constitutional.

4. The Riemann Hypothesis is encoded as `Option Bool := none` in the Lean 4 layer. This encoding is correct and intentional. No future ADR may assert `Option Bool := some true` or `Option Bool := some false` without a published, accepted formal proof that satisfies the zero-sorry requirement of the Lean 4 layer and a supporting peer-reviewed mathematical argument.

## Decision

This ADR establishes five constitutional rules governing the law engine and the governance system as a whole.

---

### Rule 1 — The Law Engine is Self-Governing

The law engine (`docs/governance/law-engine.pl`) must itself pass an EVIDENCE verdict from the law engine before any modification to it can be committed. Specifically:

```prolog
adr_verdict('ADR-200', 'EVIDENCE', _)
```

must succeed on the current state of the engine before any commit that modifies `law-engine.pl` is merged. This creates a self-referential gate: the engine validates itself. A modification that would cause the engine to reject itself is unconstitutional.

**Practical enforcement:** The CI workflow (`veneer-verify.yml`) must include a step that runs:

```sh
swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-200', V, _), (V = 'EVIDENCE' -> true ; (write('CONSTITUTIONAL VIOLATION: ADR-200 rejected'), nl, halt(1)))" -t halt
```

---

### Rule 2 — The Banach Anchor is Immutable

The values `TAU_R = 47.06998778` and `CYCLE_108 = 108` (2² × 3³) are constitutional constants. They must appear identically in:

- `packages/source/src/index.ts` — as `TAU_R` and `CYCLE_108`
- `packages/bob-gate/src/index.ts` — as `TAU_R` and `CIRCUIT_BREAKER_THRESHOLD`
- `packages/lean/src/PearlInvariants.lean` — as `tauR` and `cycle108`
- `packages/datalog/constraints.dl` — as numeric literals in SYNTH-004 and SYNTH-010 EDB facts

A commit that changes these values in any one location without changing them in all four is a constitutional violation. The CI step enforcing this is named `banach-anchor-consistency`.

---

### Rule 3 — The Crux Must Remain Honest

The Riemann Hypothesis is encoded as:

```lean
def hodgeIndexHolds : Option Bool := none
theorem cruxIsOpen : hodgeIndexHolds = none := rfl
```

This encoding is the system's formal commitment to epistemic honesty. The Lean 4 layer cannot issue a sorry-free proof of RH. The encoding must not change to `some true` or `some false` without a valid Lean 4 proof bearing zero sorrys. Any ADR that proposes to change this encoding must:

1. Include a link to a published preprint with a peer-reviewable argument.
2. Pass EVIDENCE from the law engine.
3. Be countersigned by a second author independent of the Trust.

---

### Rule 4 — The WORM Ledger is the Record of Authority

The Archivum G-Set CRDT (`@veneer/worm`) is the authoritative record of all EVIDENCE and SILENCE verdicts. No external claim about a verdict's status supersedes the WORM record. The genesis seal is:

```
SHA-256('SHADOW_GENESIS:WORM_CHAIN_INIT')
```

This value is immutable. Any chain that does not trace back to this genesis is not an authoritative WORM chain for this system.

---

### Rule 5 — External Actors Cannot Mutate Constitutional Documents

No party other than the author of record (Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust) may:

- Amend this ADR in place.
- Remove this ADR from the repository.
- Issue an ADR that overrides or supersedes this ADR without following the amendment procedure in Rule 1.

The `external_cannot_mutate` constraint in `packages/trust/src/index.ts` (SYNTH-005) is the TypeScript enforcement of this rule. The Datalog fact `external_cannot_mutate` in `packages/datalog/constraints.dl` is its formal specification. The Lean 4 theorem `externalCannotMutate` is its machine-checked proof.

---

## Mathematical Grounding

This ADR rests on three mathematical invariants that the system has formalized:

**1. Banach Fixed-Point (Sedona Spine contractivity, SYNTH-004)**

```
T_∞ = F / (1 − k),   0 < k ≤ 1,   k = Σ λ_p · L_p < 1
```

τ_r = 47.06998778 is the numerical fixed-point resonance. The 108-cycle is the canonical contractive word (2² × 3³ = 108 prime steps, provably contractive under the Sig Type Engine of ADR-102).

**2. Prime-Indexed Lawful State (Ξ-Constitution, Meta-Theorem of Prime Identity)**

```
S(t) ∈ ⊕_{p_i} H_{p_i}   and   ‖S(t)‖ < ∞
```

A state is lawful if and only if it admits decomposition into prime-indexed irreducibles. This is the mathematical grounding for the `prime_108_core` golden trace in ADR-PIRTM-002.

**3. Epistemic Honesty (Crux Encoding, SYNTH-008)**

```lean
hodgeIndexHolds : Option Bool := none
cruxIsOpen : hodgeIndexHolds = none := rfl
```

The Riemann Hypothesis is a structurally honest open question in this system. The `rfl` witness is a machine-checked proof that the encoding is consistent.

---

## Consequences

**This ADR, once WORM-sealed, is the constitutional foundation of the Veneer governance system.** All other ADRs are architectural decisions within this frame. The law engine is the enforcement mechanism. The WORM ledger is the memory. The Lean 4 layer is the formal proof surface. Together they constitute a self-governing, fail-closed, epistemically honest governance system.

**No single contributor — including the original author — can unilaterally rewrite governance history.** The WORM dual-signature requirement (SYNTH-009) is the enforcement mechanism. The Parr Sovereignty Protocol is the constitutional grounding.

---

## Law Engine Verdict

```
Engine:       law-engine.pl v2.0 (self-referential)
Agent:        sentinel
Trust:        sovereign ≥ medium                     PASS
Gate:         gate_advance(sentinel, true)           PASS
Lean:         lean_obligation_satisfied(proof_ref)   PASS
Injection:    injection_admissible(...)              PASS
ERE (5-pass): all_pass                               PASS

VERDICT:      EVIDENCE
SEAL:         ADR-200-parr-sovereignty-protocol — law-engine v2.0 — CONSTITUTIONAL
```

---

*Author: Ahmad Ali Parr — Bel Esprit D'Accord Irrevocable Trust*  
*Date: 2026-07-16*  
*This document is immutable from the date of first WORM seal.*
