/**
 * packages/worm/src/index.ts
 * @veneer/worm — Sedona Spine L7
 *
 * G-Set CRDT WORM ledger. Dual-signature required (SYNTH-009).
 * 13-entry sorry manifest embedded (SYNTH-002).
 * Constants anchored to ExportThresholds.lean (SYNTH-010):
 *   tau_r = 47.06998778, L_EFF_MAX = 0.15
 */

import crypto from 'crypto'

// ── Constants (anchored to ExportThresholds.lean) ────────────────────────────
export const TAU_R            = 47.06998778   // ExportThresholds.lean line 10
export const L_EFF_MAX        = 0.15          // ExportThresholds.lean line 11
export const GENESIS_SEAL     = '0'.repeat(64)
export const SYNTH_009_TAG    = 'SYNTH-009:WORM-G-SET'

// ── SYNTH-002: 13-entry sorry manifest ───────────────────────────────────────
export interface SorryRecord {
  readonly id: string
  readonly lean_path: string
  readonly status: 'open'
}

export const SORRY_MANIFEST: readonly SorryRecord[] = Object.freeze([
  { id: 'S-01', lean_path: 'ALP.Archivum.WitnessContract.witness_after_veto_implies_disallowed',          status: 'open' },
  { id: 'S-02', lean_path: 'ALP.Archivum.WitnessContract.witness_after_admit_implies_constitution_valid', status: 'open' },
  { id: 'S-03', lean_path: 'ALP.Candle.PirtmBridge.candle_ignition_sound',                                status: 'open' },
  { id: 'S-04', lean_path: 'ALP.Contracts.NonBypassability.no_unaligned_execution',                       status: 'open' },
  { id: 'S-05', lean_path: 'ALP.Contracts.TrustArbitration.internal_admits_mcp',                          status: 'open' },
  { id: 'S-06', lean_path: 'ALP.Contracts.TrustArbitration.external_blocks_governed_mcp',                 status: 'open' },
  { id: 'S-07', lean_path: 'ALP.MCP.GovernanceBinding.sat_requires_alp_admission',                        status: 'open' },
  { id: 'S-08', lean_path: 'ALP.PolicyEngine.Admissibility.validate_action_sound',                        status: 'open' },
  { id: 'S-09', lean_path: 'ALP.PolicyEngine.Admissibility.validate_action_veto_implies_constitution_fail', status: 'open' },
  { id: 'S-10', lean_path: 'ALP.PolicyEngine.Proofs.external_mutating_action_blocked',                    status: 'open' },
  { id: 'S-11', lean_path: 'ALP.PolicyEngine.Proofs.external_with_server_binding_blocked',                status: 'open' },
  { id: 'S-12', lean_path: 'ALP.Tests.Integration.e2e_internal_workflow_receives_witness',                status: 'open' },
  { id: 'S-13', lean_path: 'ALP.Tests.Integration.e2e_external_workflow_blocked_from_governed_mcp',       status: 'open' },
] as const)

// ── Types ─────────────────────────────────────────────────────────────────────
export interface WormEntry {
  readonly seq: number
  readonly action_id: string
  readonly layer_from: string
  readonly layer_to: string
  readonly verdict: 'EVIDENCE' | 'SILENCE'
  /** SHA256(verdict:action_id:layer_from:layer_to:prev_seal:ts:primary:secondary) */
  readonly worm_seal: string
  readonly prev_seal: string
  readonly primary_sig: string
  readonly secondary_sig: string
  readonly ts: number
}

/** Immutable G-Set — the only mutation is push via appendEntry(). */
export type WormChain = readonly WormEntry[]

// ── sealVerdict ───────────────────────────────────────────────────────────────
/** SYNTH-009: primary = SHA256(core||operator), secondary = SHA256(core||kernel). */
export function sealVerdict(
  verdictCore: string,
  operatorKey: string,
  kernelKey: string,
): { primary: string; secondary: string } {
  // TODO: replace string concat with HMAC-SHA256 when key material is structured
  const primary   = crypto.createHash('sha256').update(verdictCore + operatorKey).digest('hex')
  const secondary = crypto.createHash('sha256').update(verdictCore + kernelKey).digest('hex')
  return { primary, secondary }
}

// ── appendEntry ───────────────────────────────────────────────────────────────
export function appendEntry(
  chain: WormChain,
  params: {
    action_id: string
    layer_from: string
    layer_to: string
    verdict: 'EVIDENCE' | 'SILENCE'
    primary_sig: string
    secondary_sig: string
  },
): { chain: WormChain; entry: WormEntry } {
  if (!params.primary_sig)   throw new Error('SYNTH-009: primary_sig required — operator key must co-sign')
  if (!params.secondary_sig) throw new Error('SYNTH-009: secondary_sig required — kernel signing stone must co-sign')

  const prev_seal = chain.length > 0 ? chain[chain.length - 1].worm_seal : GENESIS_SEAL
  const ts  = Date.now()
  const seq = chain.length
  const worm_seal = crypto.createHash('sha256')
    .update(`${params.verdict}:${params.action_id}:${params.layer_from}:${params.layer_to}:${prev_seal}:${ts}:${params.primary_sig}:${params.secondary_sig}`)
    .digest('hex')

  const entry: WormEntry = { seq, ...params, worm_seal, prev_seal, ts }
  // G-Set merge: spread creates a new readonly array — original chain is untouched
  return { chain: Object.freeze([...chain, entry]), entry }
}

// ── verifyChain ───────────────────────────────────────────────────────────────
export function verifyChain(
  chain: WormChain,
): { valid: boolean; broken_at?: number; length: number } {
  if (chain.length === 0) return { valid: true, length: 0 }
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].prev_seal !== chain[i - 1].worm_seal) {
      return { valid: false, broken_at: i, length: chain.length }
    }
  }
  return { valid: true, length: chain.length }
}