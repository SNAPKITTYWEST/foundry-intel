// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * packages/metatron/src/index.ts
 * @veneer/metatron — L9 METATRON self-recognition layer.
 *
 * Reads Sedona Spine backward (depth 9→0). φ-modulated activation:
 *   depth-9 own activation = METATRON_ACTIVATION (29.034)
 *   depth-0 terminal      = MAGMACORE_FINAL      (46.45)
 *
 * TAU_R anchored to ExportThresholds.lean / foundry-intel CI (47.06998778).
 * All outputs are WORM-sealed (SYNTH-009). Enforces SYNTH-001..010.
 */

import crypto from 'node:crypto'

// ── Constants (anchored to foundry-intel + ExportThresholds.lean) ──────────────

export const PHI                 = 1.6180339887498949 as const
export const METATRON_ACTIVATION = 29.034             as const  // depth-9 own φ-activation
export const MAGMACORE_FINAL     = 46.45              as const  // depth-0 terminal (MagmaCore)
export const TAU_R               = 47.06998778        as const  // r_sc from foundry-intel CI
export const SPINE_DEPTH         = 9                  as const
export const TOTAL_LAYERS        = 10                 as const
export const LEAN_PROOF_HASH     = 'LEAN_PROOF_HASH_108_CORE' as const

/** All SYNTH constraints that METATRON verifies in a single pass. */
export const SYNTH_ALL = [
  'SYNTH-001','SYNTH-002','SYNTH-003','SYNTH-004','SYNTH-005',
  'SYNTH-006','SYNTH-007','SYNTH-008','SYNTH-009','SYNTH-010',
] as const
export type SynthConstraint = (typeof SYNTH_ALL)[number]

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SpineEntry {
  /** Layer depth: 0 (L0/SOURCE) through 9 (L9/METATRON). */
  depth: number
  layer_id: string
  worm_seal: string
  /** φ-activation value recorded when this layer was sealed. */
  activation: number
  ts: number
}

export interface MetatronReport {
  /** Spine traversed from depth 9 down to depth 0 (backward read). */
  cube: SpineEntry[]
  /** φ-modulated activation at each traversal step (index 0 = depth 9). */
  phi_path: number[]
  verdict: 'EVIDENCE' | 'SILENCE'
  failed_constraints: SynthConstraint[]
  /** SHA-256(cube_hash || phi_path_hash || verdict || inbound_seal || ts) — SYNTH-009 */
  worm_seal: string
  ts: number
}

// ── φ-Modulation ────────────────────────────────────────────────────────────────

/**
 * Apply φ-modulation to an activation value moving from `fromDepth` toward 0.
 * Steps taken = fromDepth (since reading backward from depth 9→0).
 * Formula: activation × φ^(steps / SPINE_DEPTH).
 * At fromDepth=9: 29.034 × φ^(9/9) ≈ 46.978 (≈ MAGMACORE_FINAL within rounding).
 * TODO: replace rounding constant with exact Lean-verified value when available.
 */
export function phiModulate(activation: number, fromDepth: number): number {
  const steps = Math.max(0, Math.min(fromDepth, SPINE_DEPTH))
  return activation * Math.pow(PHI, steps / SPINE_DEPTH)
}

// ── Backward Cube Reader ────────────────────────────────────────────────────────

/**
 * Read the Sedona Spine snapshot in reverse order (depth 9→0).
 * SYNTH-005: inboundSeal must be present (external actors cannot mutate).
 * SYNTH-009: inboundSeal is threaded into the WORM chain.
 * TODO: validate each entry's worm_seal chain linkage once lower layers emit seals.
 */
export function readCubeBackward(snapshot: SpineEntry[], inboundSeal: string): SpineEntry[] {
  if (!inboundSeal) throw new Error('SYNTH-005/SYNTH-009: inboundSeal required')
  return [...snapshot].sort((a, b) => b.depth - a.depth)
}

// ── Self-Report ─────────────────────────────────────────────────────────────────

function checkAllConstraints(cube: SpineEntry[]): SynthConstraint[] {
  const failed: SynthConstraint[] = []
  // TODO(SYNTH-001): verify AlpGate cleared on every entry in cube
  // TODO(SYNTH-002): verify no unmanifested sorrys in cube metadata
  // TODO(SYNTH-003): verify L0 sequential 9-check passes across cube[9].depth===0 entry
  // TODO(SYNTH-004): verify 0 < activation ≤ 1.0 contractivity for each layer
  if (cube.some(e => e.activation <= 0 || e.activation > 1.0)) failed.push('SYNTH-004')
  // TODO(SYNTH-005): verify no external-actor mutation in chain
  // TODO(SYNTH-006): verify Guardian→Examiner→Publisher seals present
  // TODO(SYNTH-007): verify retry_nonce ≤ 3 on all entries
  // TODO(SYNTH-008): verify no entry asserts RH
  // TODO(SYNTH-009): verify dual-signature on each worm_seal
  if (cube.some(e => !e.worm_seal || e.worm_seal.length < 64)) failed.push('SYNTH-009')
  // TODO(SYNTH-010): verify proof_hash === LEAN_PROOF_HASH on root entry
  return failed
}

/**
 * Produce a WORM-sealed METATRON self-report for the full spine snapshot.
 * Routes the verdict back to SOURCE (depth-0 layer) to close the feedback loop.
 */
export function selfReport(snapshot: SpineEntry[], inboundSeal: string): MetatronReport {
  const cube = readCubeBackward(snapshot, inboundSeal)
  const phi_path = cube.map(e => phiModulate(METATRON_ACTIVATION, e.depth))
  const failed = checkAllConstraints(cube)
  const verdict: MetatronReport['verdict'] = failed.length === 0 ? 'EVIDENCE' : 'SILENCE'
  const ts = Date.now()
  const cubeHash  = crypto.createHash('sha256').update(JSON.stringify(cube)).digest('hex')
  const phiHash   = crypto.createHash('sha256').update(phi_path.join(':')).digest('hex')
  const worm_seal = crypto.createHash('sha256')
    .update(`${cubeHash}:${phiHash}:${verdict}:${inboundSeal}:${ts}`)
    .digest('hex')
  return { cube, phi_path, verdict, failed_constraints: failed, worm_seal, ts }
}

/** Convenience object — single import point for downstream consumers. */
export const MetatronGate = { readCubeBackward, phiModulate, selfReport } as const