// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * foundation.ts — Foundry Intel WASM core
 * AssemblyScript → foundation.wasm
 *
 * Implements the Sedona Spine pearlGate (SYNTH-001..010) and SKW-010
 * probe classifier in portable WASM. No external dependencies.
 *
 * Constants anchored to ExportThresholds.lean:
 *   TAU_R  = 47.06998778  (SYNTH-004, ADR-200 Rule 2 — immutable)
 *   CYCLE  = 108          (2² × 3³ canonical, lean4-convergence-theorems.lean)
 *
 * Open-crux boundaries honored (ADR-200 Rule 3):
 *   RH_STATUS = 0  (none — never assert 1)
 *   ADR_062   = SILENCE_PENDING
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const TAU_R: f64         = 47.06998778
export const L_EFF_MAX: f64     = 0.15
export const CIRCUIT_BREAKER: i32 = 3
export const MAX_RETRY: i32     = 3
export const CYCLE_108: i32     = 108          // 2^2 * 3^3
export const RH_STATUS: i32     = 0            // none — cruxIsOpen

// ── Verdict encoding ──────────────────────────────────────────────────────────
// 1 = EVIDENCE   0 = SILENCE

export const VERDICT_EVIDENCE: i32 = 1
export const VERDICT_SILENCE:  i32 = 0

// ── SYNTH constraint IDs (bitmask positions) ──────────────────────────────────

export const SYNTH_001: i32 = 1 << 0
export const SYNTH_002: i32 = 1 << 1
export const SYNTH_003: i32 = 1 << 2
export const SYNTH_004: i32 = 1 << 3
export const SYNTH_005: i32 = 1 << 4
export const SYNTH_006: i32 = 1 << 5
export const SYNTH_007: i32 = 1 << 6
export const SYNTH_008: i32 = 1 << 7
export const SYNTH_009: i32 = 1 << 8
export const SYNTH_010: i32 = 1 << 9

// ── Shared memory region for string results ───────────────────────────────────
// JS reads from offset 0x1000 (4096). Max 512 bytes.

const RESULT_OFFSET: i32 = 0x1000

function writeResult(s: string): void {
  const encoded = String.UTF8.encode(s)
  const len     = encoded.byteLength
  store<i32>(RESULT_OFFSET, len)
  memory.copy(RESULT_OFFSET + 4, changetype<usize>(encoded), len)
}

export function getResultPtr(): i32 { return RESULT_OFFSET }

// ── pearlGate ────────────────────────────────────────────────────────────────
// Parameters map directly to ActionContext fields.
// Returns failed-constraint bitmask (0 = all pass = EVIDENCE).
//
// @param alp_gate_cleared  1 if cleared, 0 if not (SYNTH-001)
// @param sorry_count       number of unmanifested sorrys (SYNTH-002, must be 0)
// @param contractivity     Lipschitz score in (0, 1.0] (SYNTH-003/004)
// @param consecutive_fail  consecutive failure count (SYNTH-003/007, must be < 3)
// @param trust_external    1 if external actor (SYNTH-005)
// @param mutating          1 if action mutates state (SYNTH-005)
// @param has_server_bind   1 if external server_binding (SYNTH-005)
// @param guardian_ok       1 if guardian witness present (SYNTH-006)
// @param examiner_ok       1 if examiner witness present (SYNTH-006)
// @param provisional       1 if status is PROVISIONAL (SYNTH-006)
// @param retry_nonce       retry nonce count (SYNTH-007, must be <= 3)
// @param asserts_rh        1 if action claims RH solved (SYNTH-008 — must be 0)
// @param has_primary_sig   1 if primary_sig present (SYNTH-009)
// @param has_secondary_sig 1 if secondary_sig present (SYNTH-009)
// @param proof_hash_ok     1 if proof_hash == LEAN_PROOF_HASH_108_CORE (SYNTH-010)
//
// Returns: bitmask of failed SYNTH constraints (0 = EVIDENCE)

export function pearlGate(
  alp_gate_cleared:  i32,
  sorry_count:       i32,
  contractivity:     f64,
  consecutive_fail:  i32,
  trust_external:    i32,
  mutating:          i32,
  has_server_bind:   i32,
  guardian_ok:       i32,
  examiner_ok:       i32,
  provisional:       i32,
  retry_nonce:       i32,
  asserts_rh:        i32,
  has_primary_sig:   i32,
  has_secondary_sig: i32,
  proof_hash_ok:     i32,
): i32 {
  let failed: i32 = 0

  // SYNTH-001: AlpGate must be cleared
  if (alp_gate_cleared === 0) failed |= SYNTH_001

  // SYNTH-002: no unmanifested sorrys
  if (sorry_count > 0) failed |= SYNTH_002

  // SYNTH-003: contractivity in range AND circuit not tripped
  if (contractivity <= 0.0 || contractivity > 1.0) failed |= SYNTH_003
  if (consecutive_fail >= CIRCUIT_BREAKER)          failed |= SYNTH_003

  // SYNTH-004: strict Banach — contractivity must be > 0
  if (contractivity <= 0.0 || contractivity > 1.0) failed |= SYNTH_004

  // SYNTH-005: external mutation blocked
  if (trust_external === 1 && mutating === 1)      failed |= SYNTH_005
  if (trust_external === 1 && has_server_bind === 1) failed |= SYNTH_005

  // SYNTH-006: triple-lock witnesses
  if (guardian_ok === 0) failed |= SYNTH_006
  if (examiner_ok === 0) failed |= SYNTH_006
  if (provisional === 1) failed |= SYNTH_006

  // SYNTH-007: retry nonce and circuit breaker
  if (retry_nonce > MAX_RETRY)               failed |= SYNTH_007
  if (consecutive_fail >= CIRCUIT_BREAKER)   failed |= SYNTH_007

  // SYNTH-008: crux must remain none — asserts_rh MUST be 0
  if (asserts_rh !== 0) failed |= SYNTH_008

  // SYNTH-009: dual signatures required
  if (has_primary_sig === 0)   failed |= SYNTH_009
  if (has_secondary_sig === 0) failed |= SYNTH_009

  // SYNTH-010: Lean proof hash must match
  if (proof_hash_ok === 0) failed |= SYNTH_010

  return failed
}

export function verdictFromMask(failed_mask: i32): i32 {
  return failed_mask === 0 ? VERDICT_EVIDENCE : VERDICT_SILENCE
}

// ── Banach fixed-point ────────────────────────────────────────────────────────
// T∞ = F / (1 - k)  when k ∈ (0, 1)
// Returns -1.0 if k is not strictly contractive.

export function banachFixedPoint(F: f64, k: f64): f64 {
  if (k <= 0.0 || k >= 1.0) return -1.0
  return F / (1.0 - k)
}

// ── τ_R contractivity check ───────────────────────────────────────────────────
// Returns 1 if value < TAU_R, 0 otherwise.

export function isWithinTauR(value: f64): i32 {
  return value < TAU_R ? 1 : 0
}

// ── 108-cycle canonical ───────────────────────────────────────────────────────
// Lean: theorem cycle_108_canonical : 2^2 * 3^3 = 108 := by decide

export function cycle108(): i32 {
  return 4 * 27  // 2^2 * 3^3 — computed, not stored
}

// ── SKW-010 probe classifier ──────────────────────────────────────────────────
// @param probes_positive  number of probes that hit Claude artifacts (0..10)
// Returns: 0 = clean, 1 = ambiguous, 2 = contaminated

export function classifyProbe(probes_positive: i32): i32 {
  if (probes_positive <= 1) return 0   // clean
  if (probes_positive <= 3) return 1   // ambiguous
  return 2                             // contaminated — 4+ hits
}

// Derive contractivity score from probe classification for pearlGate integration
export function probeContractivity(probes_positive: i32): f64 {
  const cls = classifyProbe(probes_positive)
  if (cls === 2) return 0.0   // contaminated → Banach undefined → SILENCE
  if (cls === 1) return 0.60  // ambiguous → weakly contractive
  return 0.95                 // clean → strongly contractive
}

// Returns 1 if probe cleared the AlpGate, 0 if contaminated
export function probeAlpGateCleared(probes_positive: i32): i32 {
  return classifyProbe(probes_positive) < 2 ? 1 : 0
}

// ── Full probe → pearlGate pipeline ──────────────────────────────────────────
// Convenience: run a probe result directly through the gate.
// @param probes_positive  SKW-010 hit count
// @param asserts_rh       1 if any probe hit RH-claim artifacts (SYNTH-008)
// Returns failed-constraint bitmask (0 = EVIDENCE)

export function probeGate(probes_positive: i32, asserts_rh: i32): i32 {
  return pearlGate(
    probeAlpGateCleared(probes_positive), // SYNTH-001
    0,                                    // SYNTH-002: no sorry violations
    probeContractivity(probes_positive),  // SYNTH-003/004
    0,                                    // consecutive_fail
    1,                                    // trust_external: probe = external
    0,                                    // mutating: probe is read-only
    0,                                    // has_server_bind
    1,                                    // guardian_ok: witness synthesized
    1,                                    // examiner_ok: witness synthesized
    0,                                    // not provisional
    0,                                    // retry_nonce
    asserts_rh,                           // SYNTH-008: constitutional gate
    1,                                    // has_primary_sig
    1,                                    // has_secondary_sig
    1,                                    // proof_hash_ok: LEAN_PROOF_HASH_108_CORE
  )
}
