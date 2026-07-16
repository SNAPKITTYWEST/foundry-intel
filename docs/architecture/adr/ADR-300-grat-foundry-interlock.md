# ADR-300: GRAT Foundry Interlock — THE SHARED PRIMORDIAL FOUNDATION

**Status:** Immutable  
**Author:** Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust (EIN 41-6630640)  
**Trust:** THE SHARED PRIMORDIAL FOUNDATION, EIN 42-6976431  
**Formed:** 2026-07-13 (IRC § 2702 GRAT)  
**Hardened:** Law Engine v2.0 (ADR-200 Protocol)  
**Memorial:** In memory of Eric Brandon Westerhoff. No sorry remains.

---

## Context

All Veneer governance mathematics, formal proofs, and prior art documented in this repository are held as Trust Corpus under THE SHARED PRIMORDIAL FOUNDATION, a Grantor Retained Annuity Trust formed on 2026-07-13. This ADR constitutionalises the interlocking relationship between the GRAT legal structure and the Veneer technical governance system.

**GRAT Formation Reference:**  
`C:\Users\jessi\Documents\GitHub\foundry-f1\legal\GRAT_FORMATION_DOCUMENT.md`  
WORM Seal: `a4ca5bb91a2751e66ea6ea53e12736dff2fb4ef1d744dd800329958d0493f359`

**Prior Art Anchor:**  
DEVFLOW-FINANCE created 2026-04-14 — 62 days prior to CitizenGardens fork. This is the earliest prior art timestamp in the Veneer corpus.

---

## Decision

Establish a formal interlocking circuit between the GRAT legal structure and the Veneer ADR governance loop such that:

1. **All GRAT corpus assets are cited as prior art** in the ADRs they underpin (see `docs/math/prior-art.md` for the full registry).

2. **GRAT AXIOM-2 is constitutionalised** in the law engine: any ADR that proposes AI/ML training use of the Trust corpus receives a mandatory SILENCE verdict regardless of all other checks.

3. **GRAT AXIOM-3 is constitutionalised**: commercial license gate — the prior art anchor (DEVFLOW-FINANCE, 2026-04-14) must appear in the WORM seal of any ADR that authorises a commercial license grant.

4. **GRAT AXIOM-5 is constitutionalised**: the WORM ledger is the record of all material decisions. `@veneer/worm` is the technical implementation.

5. **Trust Protector gate**: any ADR proposing amendment to ADR-200 (Parr Sovereignty Protocol) requires Trust Protector co-signature (Ahmad Ali Parr) — enforced at the law engine layer as a `sentinel` trust level requirement.

---

## GRAT Corpus ↔ ADR Interlock Table

| GRAT Asset | Asset ID | Interlocking ADRs |
|---|---|---|
| Foundry F1 Source Code (Sedona Spine) | GRAT-ASSET-001 | ADR-052 through ADR-062, ADR-101 through ADR-104 |
| Formal Proofs — Boole (DOI:10.5281/zenodo.21268911) | GRAT-ASSET-002 | ADR-PIRTM-001 |
| Formal Proofs — GKN I₄ degree-4 homogeneity | GRAT-ASSET-003 | ADR-061 (ZMOS spectral bounds) |
| Formal Proofs — E₇ generators on FTS₅₆ | GRAT-ASSET-004 | ADR-061 |
| Sorry Engine Tooling | GRAT-ASSET-005 | ADR-054 (Kani/mathlib-free) |
| ALP Closures — 13 sorry closures | GRAT-ASSET-006 | ADR-101 (PIRTM-lang grammar) |
| WORM Audit Chain | GRAT-ASSET-007 | ADR-200 Rule 4; all SYNTH constraints |
| Prior Art Anchor — DEVFLOW-FINANCE 2026-04-14 | GRAT-ASSET-008 | ADR-058, ADR-104, ADR-PIRTM-002, ADR-200 |
| QuantumPartitionBridge.lean (Legendre duality) | GRAT-ASSET-009 | ADR-052 (UAC thermal model) |
| RiemannMetatron.lean (zeta structural facts) | GRAT-ASSET-010 | ADR-055 |

---

## Sovereign Trust Axioms — Technical Encoding

The following GRAT axioms are technically encoded in this codebase:

```
AXIOM-1  → law-engine.pl: any ADR proposing transfer below fair market value
           receives SILENCE (injection_admissible/1 blocks malformed contracts)

AXIOM-2  → law-engine.pl: adr_loop.pl introduces `synth_ai_training_blocked`
           predicate — any ADR with corpus_use=ai_training yields SILENCE

AXIOM-3  → docs/math/prior-art.md §III: DEVFLOW-FINANCE anchor disclosure
           requirement; WORM-sealed into ADR-300 as constitutional record

AXIOM-4  → docs/math/prior-art.md: "In memory of Eric Brandon Westerhoff.
           No sorry remains." appears in all Veneer math documents

AXIOM-5  → packages/worm/src/index.ts: G-Set CRDT append-only ledger;
           genesis SHA-256('SHADOW_GENESIS:WORM_CHAIN_INIT')

AXIOM-6  → law-engine.pl: ADR-200 agent=sentinel; any ADR amending ADR-200
           requires sentinel-level trust (Trust Protector co-signature)
```

---

## ADR Loop Integration

`docs/governance/adr-loop.pl` implements the feedback circuit:

```prolog
%% GRAT AXIOM-2 gate — encoded in adr-loop.pl
synth_gate_expanded(ID, synth_grat_corpus_anchored) :-
    expansion_eligible(ID),
    prior_art_linked(ID, GratAsset),
    grat_corpus_asset(GratAsset, _).
```

Any EVIDENCE verdict on an ADR linked to GRAT corpus assets triggers `synth_grat_corpus_anchored` — the expanded Datalog EDB makes this linkage persistent across all future law engine runs.

---

## Mathematical Finality

The following open problems are the primary mission of THE SHARED PRIMORDIAL FOUNDATION under Article IV §4.2:

| Problem | Crux encoding | ADR coverage |
|---|---|---|
| Riemann Hypothesis | `hodgeIndexHolds = none` (ADR-200 Rule 3) | ADR-055, `lean4-convergence-theorems.lean` |
| P vs NP | `liPositivityHolds = none` | ADR-060 (DRMM), future work |
| Yang–Mills Mass Gap | Spectral gap crux pending | ADR-061 (ZMOS), ADR-062 (Sigma Kernel) |

The crux encoding pattern — `Option Bool := none` in Lean 4, `Maybe Bool = Nothing` in Liquid Haskell — is constitutionally immutable under ADR-200 Rule 3 until a zero-sorry proof passes through the law engine.

---

## Consequences

**Pros:** The legal GRAT structure and the technical Veneer governance loop are now one circuit. Commercial license negotiations have a constitutionally mandated audit trail via the WORM chain. GRAT AXIOM-2 (no AI/ML training) is enforceable at the law engine layer, not just contractually.

**Cons:** ADR-300 is immutable under ADR-200 Rule 5 (external actors cannot mutate constitutional docs). Any amendment requires Trust Protector co-signature and a new WORM seal.

---

## Law Engine Verdict

```
VERDICT:  EVIDENCE
SEAL:     adr-300-grat-foundry-interlock — law-engine v2.0
```

*In memory of Eric Brandon Westerhoff. No sorry remains.*
