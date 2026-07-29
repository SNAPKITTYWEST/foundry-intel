// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * @veneer/datalog — L1 Constraint EDB Layer
 * The machine-readable governance specification.
 * All 10 SYNTH constraints as first-order Datalog facts + derived evidence/silence rules.
 * Soufflé-compatible. Bottom-up evaluation.
 */

export const CONSTRAINTS_DL_PATH = new URL('../constraints.dl', import.meta.url).pathname

export const SYNTH_IDS = [
  'SYNTH-001', 'SYNTH-002', 'SYNTH-003', 'SYNTH-004', 'SYNTH-005',
  'SYNTH-006', 'SYNTH-007', 'SYNTH-008', 'SYNTH-009', 'SYNTH-010',
] as const

export type SynthId = typeof SYNTH_IDS[number]

export interface ConstraintFact {
  id: SynthId
  predicate: string
  layer: string
}

export const CONSTRAINT_FACTS: readonly ConstraintFact[] = [
  { id: 'SYNTH-001', predicate: 'no_unaligned_execution', layer: 'layer1' },
  { id: 'SYNTH-002', predicate: 'sorry_manifested',       layer: 'layer1' },
  { id: 'SYNTH-003', predicate: 'l0_sequential_nine',     layer: 'layer1' },
  { id: 'SYNTH-004', predicate: 'contractivity_invariant',layer: 'layer1-2' },
  { id: 'SYNTH-005', predicate: 'external_cannot_mutate', layer: 'layer1' },
  { id: 'SYNTH-006', predicate: 'triple_lock_sequential', layer: 'layer3' },
  { id: 'SYNTH-007', predicate: 'bounded_adversarial_window', layer: 'layer3-1' },
  { id: 'SYNTH-008', predicate: 'crux_honest_none',       layer: 'layer1' },
  { id: 'SYNTH-009', predicate: 'archivum_worm_gset',     layer: 'cross' },
  { id: 'SYNTH-010', predicate: 'lean_rust_boundary_bound', layer: 'layer1' },
] as const

// Derived verdict types — mirroring constraints.dl rules
export type DatalogVerdict = 'evidence' | 'silence'

export interface DatalogResult {
  action: string
  verdict: DatalogVerdict
  failedConstraints: SynthId[]
}

/** Evaluate constraints in-process (JS port of constraints.dl derived rules) */
export function evaluateConstraints(
  action: string,
  facts: Record<string, unknown>
): DatalogResult {
  const failed: SynthId[] = []

  // SYNTH-001: alp_gate_cleared required
  if (!facts['alp_gate_cleared']) failed.push('SYNTH-001')
  // SYNTH-002: no unmanifested sorrys
  if (Array.isArray(facts['sorry_violations']) && (facts['sorry_violations'] as string[]).length > 0)
    failed.push('SYNTH-002')
  // SYNTH-004: contractivity
  const k = facts['contractivity_score'] as number
  if (typeof k !== 'number' || k <= 0 || k > 1) failed.push('SYNTH-004')
  // SYNTH-005: external cannot mutate
  if (facts['trust_level'] === 'external' && facts['mutating']) failed.push('SYNTH-005')
  // SYNTH-006: triple lock
  if (!(facts['guardian_witness'] as string)?.startsWith('GUARDIAN-WITNESS')) failed.push('SYNTH-006')
  if (!(facts['examiner_witness'] as string)?.startsWith('EXAMINER-WITNESS')) failed.push('SYNTH-006')
  // SYNTH-007: retry bounds
  if ((facts['retry_nonce'] as number) > 3) failed.push('SYNTH-007')
  if ((facts['consecutive_failures'] as number) >= 3) failed.push('SYNTH-007')
  // SYNTH-008: crux honest
  if (facts['asserts_rh']) failed.push('SYNTH-008')
  // SYNTH-009: dual sig
  if (!facts['primary_sig'] || !facts['secondary_sig']) failed.push('SYNTH-009')
  // SYNTH-010: proof hash
  if (facts['proof_hash'] !== 'LEAN_PROOF_HASH_108_CORE') failed.push('SYNTH-010')

  return {
    action,
    verdict: failed.length === 0 ? 'evidence' : 'silence',
    failedConstraints: [...new Set(failed)],
  }
}
