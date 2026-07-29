// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * @veneer/bob-gate — src/index.ts
 * Veneer Sedona Spine L8: BOB EVIDENCE/SILENCE sovereign execution gate.
 * All 10 SYNTH constraints evaluated sequentially. Every verdict WORM-sealed.
 * Constants anchored to ExportThresholds.lean (SYNTH-010).
 */
import crypto from 'node:crypto'

// ── Exported constants (anchored to ExportThresholds.lean + foundry-intel) ──────
export const SYNTH_CONSTANTS = {
  LEAN_PROOF_HASH_108_CORE: 'LEAN_PROOF_HASH_108_CORE', // atlas/proof_attestation.rs
  CIRCUIT_BREAKER_THRESHOLD: 3,  // mod.rs L0-7, publisher.rs
  MAX_RETRY_NONCE: 3,            // publisher.rs line 42
  CONTRACTIVITY_UPPER: 1.0,      // mod.rs CONTRACTIVITY_UPPER
  CONTRACTIVITY_LOWER: 0.0,      // mod.rs CONTRACTIVITY_LOWER
  TAU_R: 47.06998778,            // sigma-kernel-cli.yml r_sc canonical value
  GUARDIAN_PREFIX: 'GUARDIAN-WITNESS',  // atlas/guardian.rs
  EXAMINER_PREFIX: 'EXAMINER-WITNESS',  // atlas/publisher.rs line 57
  SORRY_MANIFEST_SIZE: 13,       // alp_sorry_manifest.json entry count
  /** RH crux: hodgeIndexHolds = none, liPositivityHolds = none — never asserted */
  RH_STATUS: 'none' as const,
} as const

// ── Types ─────────────────────────────────────────────────────────────────────
export type Verdict = 'EVIDENCE' | 'SILENCE'

export interface ActionContext {
  id: string
  alp_gate_cleared: boolean        // SYNTH-001: AlpGate must precede Execute
  sorry_violations: string[]       // SYNTH-002: must be empty; all sorrys in manifest
  contractivity_score: number      // SYNTH-003/004: must be in (0, 1.0]
  consecutive_failures: number     // SYNTH-003/007: must be < CIRCUIT_BREAKER_THRESHOLD
  trust_level: 'internal' | 'external' // SYNTH-005
  mutating: boolean                // SYNTH-005: external mutating actions blocked
  has_server_binding: boolean      // SYNTH-005: external server_binding blocked
  guardian_witness: string         // SYNTH-006: must start with GUARDIAN-WITNESS
  examiner_witness: string         // SYNTH-006: must start with EXAMINER-WITNESS
  status: string                   // SYNTH-006: must not be 'PROVISIONAL'
  retry_nonce: number              // SYNTH-007: must be <= MAX_RETRY_NONCE
  asserts_rh: boolean              // SYNTH-008: must be false; crux is 'none'
  primary_sig: string              // SYNTH-009: SHA256(core_hash || operator_key)
  secondary_sig: string            // SYNTH-009: SHA256(core_hash || kernel_key)
  proof_hash: string               // SYNTH-010: must equal LEAN_PROOF_HASH_108_CORE
}

export interface GateVerdict {
  action_id: string
  verdict: Verdict
  failed_constraints: string[]
  /** SHA-256(verdict || action_id || failures || ts) — WORM-native seal */
  worm_seal: string
  ts: number
}

// ── Constraint evaluators (sequential, SYNTH-001 → SYNTH-010) ─────────────────
const C = SYNTH_CONSTANTS

function c001(x: ActionContext): string | null {
  return x.alp_gate_cleared ? null
    : 'SYNTH-001: Execute without prior AlpGate cleared — unaligned execution blocked'
}
function c002(x: ActionContext): string | null {
  return x.sorry_violations.length === 0 ? null
    : `SYNTH-002: Unmanifested sorry: ${x.sorry_violations.join(', ')}`
}
function c003(x: ActionContext): string[] {
  const f: string[] = []
  if (x.contractivity_score <= C.CONTRACTIVITY_LOWER || x.contractivity_score > C.CONTRACTIVITY_UPPER)
    f.push(`SYNTH-003/L0-5: contractivity_score ${x.contractivity_score} not in (0,1]`)
  if (x.consecutive_failures >= C.CIRCUIT_BREAKER_THRESHOLD)
    f.push(`SYNTH-003/L0-7: circuit breaker tripped (${x.consecutive_failures} >= ${C.CIRCUIT_BREAKER_THRESHOLD})`)
  return f
}
function c004(x: ActionContext): string | null {
  if (x.contractivity_score <= C.CONTRACTIVITY_LOWER)
    return `SYNTH-004: contractivity ${x.contractivity_score} <= 0 — Banach fixed-point undefined`
  if (x.contractivity_score > C.CONTRACTIVITY_UPPER)
    return `SYNTH-004: contractivity ${x.contractivity_score} > 1.0 — system expansive`
  return null
}
function c005(x: ActionContext): string | null {
  if (x.trust_level === 'external' && x.mutating)
    return 'SYNTH-005: External actor attempted mutation — intervention blocked'
  if (x.trust_level === 'external' && x.has_server_binding)
    return 'SYNTH-005: External actor has server_binding — governed bypass blocked'
  return null
}
function c006(x: ActionContext): string | null {
  if (!x.guardian_witness.startsWith(C.GUARDIAN_PREFIX))
    return `SYNTH-006: guardian_witness missing '${C.GUARDIAN_PREFIX}' — lock 1 not cleared`
  if (!x.examiner_witness.startsWith(C.EXAMINER_PREFIX))
    return `SYNTH-006: examiner_witness missing '${C.EXAMINER_PREFIX}' — lock 2 not cleared`
  if (x.status === 'PROVISIONAL')
    return 'SYNTH-006: PROVISIONAL status — publisher cannot ratify unresolved state'
  return null
}
function c007(x: ActionContext): string | null {
  if (x.retry_nonce > C.MAX_RETRY_NONCE)
    return `SYNTH-007: retry_nonce ${x.retry_nonce} > ${C.MAX_RETRY_NONCE} — adversarial window exceeded`
  if (x.consecutive_failures >= C.CIRCUIT_BREAKER_THRESHOLD)
    return `SYNTH-007: consecutive_failures ${x.consecutive_failures} — circuit breaker tripped`
  return null
}
function c008(x: ActionContext): string | null {
  return x.asserts_rh ? 'SYNTH-008: asserts_rh=true — crux must remain none, RH is open' : null
}
function c009(x: ActionContext): string | null {
  if (!x.primary_sig) return 'SYNTH-009: primary_sig absent — operator key must co-sign'
  if (!x.secondary_sig) return 'SYNTH-009: secondary_sig absent — P-Kernel signing stone must co-sign'
  return null
}
function c010(x: ActionContext): string | null {
  return x.proof_hash === C.LEAN_PROOF_HASH_108_CORE ? null
    : `SYNTH-010: proof_hash mismatch — Lean/Rust boundary broken`
}

// ── pearlGate ─────────────────────────────────────────────────────────────────
export function pearlGate(ctx: ActionContext): GateVerdict {
  const failed: string[] = []
  const push = (v: string | null) => { if (v) failed.push(v) }
  push(c001(ctx)); push(c002(ctx)); failed.push(...c003(ctx))
  push(c004(ctx)); push(c005(ctx)); push(c006(ctx))
  push(c007(ctx)); push(c008(ctx)); push(c009(ctx)); push(c010(ctx))
  const verdict: Verdict = failed.length === 0 ? 'EVIDENCE' : 'SILENCE'
  const ts = Date.now()
  const worm_seal = crypto.createHash('sha256')
    .update(`${verdict}:${ctx.id}:${failed.join('|')}:${ts}`)
    .digest('hex')
  return { action_id: ctx.id, verdict, failed_constraints: failed, worm_seal, ts }
}