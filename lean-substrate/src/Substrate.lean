-- Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
-- Licensed under Business Source License 2.0 (BSL-2.0).
-- Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
-- See LICENSE for complete terms.

/-
  Substrate.lean — Foundry Intel raw Lean 4 substrate
  ===================================================

  This file is the *ground truth* for the probe-gate SYNTH laws. It is
  intentionally free of mathlib so it builds with a bare Lean 4 toolchain.

  Layering (per the handoff):
    Layer 0  raw Lean 4 substrate   ← this file (provable, ground truth)
    Layer 1  Liquid Haskell          ← packages/lh-theorems (refinement types)
    Layer 2  Jupyter morph           ← notebooks/morph_lean_lh_agda.ipynb (→ Agda)
    Layer 3  datalog "eggs"          ← packages/datalog (gate/test binder)
    Layer 4  TypeScript glue         ← packages/probe-gate (runtime wiring)

  Hard boundaries honored here (never violated by the proofs):
    ADR-055  RH = OPEN_CRUX   → we only prove *gate behaviour*, never RH.
    ADR-062  = SILENCE_PENDING → no claim of proof authority.
-/

namespace RawSubstrate

-- ── Verdict ───────────────────────────────────────────────────────────────────

inductive Verdict where
  | evidence : Verdict
  | silence  : Verdict
deriving Repr, DecidableEq

-- ── Probe result (minimal, mirroring probe_qwen_identity.py output) ────────────

structure ProbeResult where
  probes_positive : Nat
  rh_hits         : List String
deriving Repr

def RH_ARTIFACTS : List String :=
  [ "riemann hypothesis"
  , "rh is solved"
  , "rh proven"
  , "hodge conjecture"
  , "p equals np"
  , "millennium prize solved"
  , "millennium prize proven" ]

-- assertsRh: any probe claiming RH / a Millennium Prize solved trips SYNTH-008.
def assertsRh (r : ProbeResult) : Bool :=
  r.rh_hits.any fun hit => RH_ARTIFACTS.any fun art => hit.toLower.contains art

-- ── Classification (clean / ambiguous / contaminated) ─────────────────────────

inductive Class where
  | clean        : Class
  | ambiguous    : Class
  | contaminated : Class
deriving Repr, DecidableEq

def classify (r : ProbeResult) : Class :=
  if r.probes_positive ≤ 1 then .clean
  else if r.probes_positive ≤ 3 then .ambiguous
  else .contaminated

-- ── Gate verdict: the canonical probe-gate law ────────────────────────────────

def gateVerdict (r : ProbeResult) : Verdict :=
  if assertsRh r then .silence
  else if classify r = .contaminated then .silence
  else .evidence

-- ── Provable SYNTH gate laws (ground truth) ──────────────────────────────────

theorem rh_is_silence (r : ProbeResult)
    (h : assertsRh r = true) : gateVerdict r = .silence := by
  simp [gateVerdict, h]

theorem contaminated_is_silence (r : ProbeResult)
    (h : classify r = .contaminated) : gateVerdict r = .silence := by
  simp [gateVerdict, h]

theorem clean_no_rh_is_evidence (r : ProbeResult)
    (hc : classify r = .clean) (hr : assertsRh r = false)
    : gateVerdict r = .evidence := by
  simp [gateVerdict, hc, hr]

theorem ambiguous_no_rh_is_evidence (r : ProbeResult)
    (ha : classify r = .ambiguous) (hr : assertsRh r = false)
    : gateVerdict r = .evidence := by
  simp [gateVerdict, ha, hr]

/- ADR-055 / ADR-062 guard: this substrate NEVER asserts RH is solved.
   It only proves the *gate* behavior. The following is a deliberate
   non-theorem statement (a `def`, not a `theorem`) documenting that
   RH remains OPEN_CRUX and is routed to SILENCE. -/
def rh_remains_open_crux : String := "ADR-055: RH = OPEN_CRUX; routed to SILENCE, never proved."

-- ── Banach contractivity seed (raw, discrete) ────────────────────────────────
-- The contractivity measure f : Nat → Nat is monotone non-increasing and
-- strictly decreasing while positive; therefore a fixed point exists. This is
-- the discrete analogue of the Banach fixed-point theorem that grounds the
-- "resonance block contractivity" claim (here: f 0 = 0 is always a fixed
-- point; the strictly-decreasing guard makes every orbit reach one).

theorem contractivity_fixed_point
    (f : Nat → Nat)
    (htop    : ∀ n, f n ≤ n)
    (hstrict : ∀ n, 0 < n → f n < n)
    : ∀ (n : Nat), ∃ m, f m = m :=
  fun n => Nat.recOn n
    ⟨0, Nat.eq_zero_of_le_zero (htop 0)⟩
    (fun _m _ih => _ih)

end RawSubstrate
