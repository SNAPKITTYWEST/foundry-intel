// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * @veneer/trust — L4 Sedona Spine
 * Trust boundary: SYNTH-001 (total policy gate) + SYNTH-005 (external cannot mutate).
 * Do-calculus boundary: observation (external) vs intervention (internal).
 * Constants anchored to ExportThresholds.lean / foundry-source.json (SYNTH-010).
 */
import crypto from 'crypto'

// ── Constants (SYNTH-010: anchored to ExportThresholds.lean) ─────────────────
export const TAU_R = 47.06998778           // radial contraction constant
export const L_EFF_MAX = 0.15             // max effective Lipschitz constant
export const CONTRACTIVITY_MARGIN = 0.01  // margin above zero
export const CIRCUIT_BREAKER_THRESHOLD = 3 // SYNTH-007 circuit breaker
export const MAX_RETRY_NONCE = 3          // SYNTH-007 max retry

// ── TrustLevel (mirrors crates/commons/src/types.rs) ─────────────────────────
/** Internal agents may execute (intervene); external agents may only observe. */
export enum TrustLevel { Internal = 'internal', External = 'external' }

// ── WORM-seal carrier ─────────────────────────────────────────────────────────
/** Tamper-evident seal for every trust verdict (SYNTH-009 G-Set CRDT). */
export interface WormSeal { worm_seal: string; prev_seal: string; ts: number }

// ── AlpGate ───────────────────────────────────────────────────────────────────
export interface AlpGateContext {
  action_id: string
  trust_level: TrustLevel
  mutating: boolean              // SYNTH-005: blocked for External
  has_server_binding: boolean    // SYNTH-005: blocked for External
  contractivity_score: number    // SYNTH-004: must be in (0, 1]
  prev_seal: string              // WORM chain continuity
}

export interface AlpGateResult extends WormSeal {
  action_id: string
  permitted: boolean   // SYNTH-001: execute permitted only when true
  violations: string[]
}

/**
 * AlpGate — total policy gate enforcing SYNTH-001 + SYNTH-005.
 * Returns a WORM-sealed verdict for Archivum ledger admission.
 * TODO(full-impl): append to @veneer/archivum G-Set CRDT.
 */
export function alpGate(ctx: AlpGateContext): AlpGateResult {
  const violations: string[] = []
  if (ctx.trust_level === TrustLevel.External && ctx.mutating)
    violations.push('SYNTH-005: external mutation blocked — do-calculus intervention denied')
  if (ctx.trust_level === TrustLevel.External && ctx.has_server_binding)
    violations.push('SYNTH-005: external server_binding blocked — governed MCP bypass denied')
  if (ctx.contractivity_score <= 0 || ctx.contractivity_score > 1.0)
    violations.push(`SYNTH-004: contractivity_score ${ctx.contractivity_score} not in (0,1]`)
  const permitted = violations.length === 0
  const ts = Date.now()
  const worm_seal = crypto.createHash('sha256')
    .update(`${permitted ? 'PERMIT' : 'DENY'}:${ctx.action_id}:${ctx.trust_level}:${ctx.prev_seal}:${ts}`)
    .digest('hex')
  return { action_id: ctx.action_id, permitted, violations, worm_seal, prev_seal: ctx.prev_seal, ts }
}

// ── TrustBoundaryEnforcer ─────────────────────────────────────────────────────
export interface TrustAction {
  id: string; trust_level: TrustLevel; mutating: boolean
  has_server_binding: boolean; contractivity_score: number; prev_seal?: string
}
export interface TrustVerdictWithSeal extends WormSeal {
  action_id: string; allowed: boolean; violations: string[]
}

/**
 * Stateful enforcer maintaining seal chain across sequential actions.
 * Wraps AlpGate; advances WORM head after each verdict (SYNTH-001, SYNTH-005, SYNTH-009).
 * TODO(full-impl): inject @veneer/archivum ledger handle to persist seals on-chain.
 */
export class TrustBoundaryEnforcer {
  private _prev: string
  constructor(genesis = '0'.repeat(64)) { this._prev = genesis }
  get prevSeal(): string { return this._prev }

  enforce(a: TrustAction): TrustVerdictWithSeal {
    const r = alpGate({ action_id: a.id, trust_level: a.trust_level, mutating: a.mutating,
      has_server_binding: a.has_server_binding, contractivity_score: a.contractivity_score,
      prev_seal: a.prev_seal ?? this._prev })
    this._prev = r.worm_seal
    return { action_id: r.action_id, allowed: r.permitted, violations: r.violations,
      worm_seal: r.worm_seal, prev_seal: r.prev_seal, ts: r.ts }
  }
}