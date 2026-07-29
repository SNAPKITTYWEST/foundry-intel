// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * @veneer/constitution — L3 Sedona Spine
 * L0 constitutional validator: nine sequential checks (L0-1 through L0-9).
 * Constants anchored to mod.rs + L0.lean (SYNTH-010).
 * SYNTH-003: all nine checks run in canonical mod.rs order.
 * SYNTH-007: circuit_breaker=3 and retry_nonce<=3 dual-enforced at L0-7.
 */
import crypto from 'node:crypto'

// ── Constants (mod.rs lines 6-9, publisher.rs line 42) ──────────────────────
export const LAMBDA_M_THRESHOLD  = 0.1  // mod.rs:6, L0.lean:5
export const CONTRACTIVITY_UPPER = 1.0  // mod.rs:7
export const CONTRACTIVITY_LOWER = 0.0  // mod.rs:8
export const CIRCUIT_BREAKER     = 3    // mod.rs:9, L0.lean:6
export const MAX_RETRY_NONCE     = 3    // publisher.rs:42

// ── Types ────────────────────────────────────────────────────────────────────
export interface WormSealRef {
  /** SHA-256 of prior chain head; '0'.repeat(64) at genesis */
  prev_seal: string
  /** Incoming context seal for full audit trail */
  context_seal: string
}

export interface CritiqueResult { critique_id: number; passed: boolean; reason?: string }
export interface PrimeGate      { action_name: string; gate_value: number }

export interface ConstitutionInput {
  state_norm:          number
  drift_rate:          number
  dynamic_lambda_m?:   number
  critique_results:    CritiqueResult[]
  prime_gates:         PrimeGate[]
  contractivity_score: number
  kill_switch_active:  boolean
  proof_anchor?:       string
  active_anchors:      string[]
  consecutive_failures: number
  retry_nonce:         number    // SYNTH-007: must be <= MAX_RETRY_NONCE
  seal:                WormSealRef
}

export interface ValidationResult {
  valid:          boolean
  failed_checks:  string[]
  audit_warnings: string[]
  /** SHA-256(valid || failed_checks || ts || prev_seal) */
  worm_seal:      string
  ts:             number
}

// ── Prime helper (mirrors L0.lean isPrime) ───────────────────────────────────
function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false
  return true
}

// ── Nine sequential checks ───────────────────────────────────────────────────
function l0_1(m: ConstitutionInput): string | null {
  return Number.isFinite(m.state_norm) && m.state_norm > 0 ? null
    : `L0-1: state_norm ${m.state_norm} not finite+positive`
}
function l0_2(m: ConstitutionInput): string | null {
  const t = m.dynamic_lambda_m ?? LAMBDA_M_THRESHOLD
  return m.drift_rate < t ? null : `L0-2: drift_rate ${m.drift_rate} >= threshold ${t}`
}
function l0_3(m: ConstitutionInput): string | null {
  if (m.critique_results.length !== 10)
    return `L0-3: expected 10 critique results, got ${m.critique_results.length}`
  const bad = m.critique_results.filter(r => !r.passed).map(r => r.critique_id)
  return bad.length === 0 ? null : `L0-3: critique gates [${bad}] failed`
}
function l0_4(m: ConstitutionInput): string | null {
  const bad = m.prime_gates.filter(g => !isPrime(g.gate_value)).map(g => g.action_name)
  return bad.length === 0 ? null : `L0-4: non-prime gate values for [${bad}]`
}
function l0_5(m: ConstitutionInput): string | null {
  return m.contractivity_score > CONTRACTIVITY_LOWER && m.contractivity_score <= CONTRACTIVITY_UPPER
    ? null : `L0-5: contractivity_score ${m.contractivity_score} not in (0, 1]`
}
function l0_6(m: ConstitutionInput): string | null {
  return m.kill_switch_active ? 'L0-6: kill-switch ACTIVE — all changes halted' : null
}
function l0_7(m: ConstitutionInput): string | null {
  // SYNTH-003 + SYNTH-007: dual enforcement at this single gate
  if (m.consecutive_failures >= CIRCUIT_BREAKER)
    return `L0-7: consecutive_failures ${m.consecutive_failures} >= CIRCUIT_BREAKER ${CIRCUIT_BREAKER}`
  if (m.retry_nonce > MAX_RETRY_NONCE)
    return `L0-7/SYNTH-007: retry_nonce ${m.retry_nonce} > MAX_RETRY_NONCE ${MAX_RETRY_NONCE}`
  return null
}
function l0_8(m: ConstitutionInput): string | null {
  // TODO: integrate full validate_pi_native from proof_anchor.rs
  if (!m.proof_anchor) return null
  return /^0x[0-9a-f]{64}$/i.test(m.proof_anchor) ? null
    : `L0-8: proof_anchor '${m.proof_anchor}' must be 0x-prefixed 64-hex`
}
function l0_9(m: ConstitutionInput): string | null {
  if (!m.proof_anchor || m.active_anchors.length === 0) return null
  return m.active_anchors.includes(m.proof_anchor) ? null
    : `L0-9: proof_anchor '${m.proof_anchor}' not in active_anchors`
}

// ── ConstitutionModel ────────────────────────────────────────────────────────
export class ConstitutionModel {
  constructor(private readonly input: ConstitutionInput) {}

  /** Run all nine L0 checks in the canonical mod.rs order (1,2,9,3,4,5,6,7,8). */
  validate(): ValidationResult {
    const warnings: string[] = []
    const failed:   string[] = []
    for (const check of [l0_1, l0_2, l0_9, l0_3, l0_4, l0_5, l0_6, l0_7, l0_8])
      { const e = check(this.input); if (e) failed.push(e) }
    if (!this.input.proof_anchor)
      warnings.push('L0-8: proof_anchor absent (audit warning, not hard failure)')
    const ts    = Date.now()
    const valid = failed.length === 0
    const worm_seal = crypto.createHash('sha256')
      .update(`${valid}:${failed.join('|')}:${ts}:${this.input.seal.prev_seal}`)
      .digest('hex')
    return { valid, failed_checks: failed, audit_warnings: warnings, worm_seal, ts }
  }
}